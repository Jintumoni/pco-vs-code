// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'node:path';
import net from 'net';
import { createRequire } from 'node:module';
import { Message, PcoAddon, Range, Diff, Line } from './types.js';
import { insertIntoActiveBuffer } from './utils.js'

const require = createRequire(import.meta.url);

const libpco = require('../build/libpcojs.node') as PcoAddon;


interface ServerConfig {
    mode: 'server';
    port: number;
}

interface ClientConfig {
    mode: 'client';
    serverAddress: string;
    port: number;
}

type ConnectionConfig = ServerConfig | ClientConfig;

const CONFIG_KEY = 'pco-vs-code.connectionConfig';

// Available throughout this extension's current session.
let connectionConfig: ConnectionConfig | undefined;

export function getConnectionConfig(): ConnectionConfig | undefined {
    return connectionConfig;
}

async function configureConnection(
    context: vscode.ExtensionContext
): Promise<void> {
	console.log("pco extension activated");

    // Step 1: Ask the user to choose a mode.
    const selectedMode = await vscode.window.showQuickPick(
        [
            {
                label: '$(server) Server',
                description: 'Listen for incoming client connections',
                mode: 'server' as const
            },
            {
                label: '$(plug) Client',
                description: 'Connect to an existing server',
                mode: 'client' as const
            }
        ],
        {
            title: 'PCO Extension: Select Mode',
            placeHolder: 'How would you like to use the extension?',
            ignoreFocusOut: true
        }
    );

    // User cancelled the selection.
    if (!selectedMode) {
        return;
    }

    let config: ConnectionConfig;

    // Step 2: Configure server mode.
    if (selectedMode.mode === 'server') {
        const portInput = await vscode.window.showInputBox({
            title: 'Server Configuration',
            prompt: 'Enter the port number to bind the server socket to',
            placeHolder: 'e.g. 5000',
            value: '8080',
            validateInput: (value) => {
                const port = Number(value);

                if (
                    !/^\d+$/.test(value.trim()) ||
                    !Number.isInteger(port) ||
                    port < 1 ||
                    port > 65535
                ) {
                    return 'Enter a valid port between 1 and 65535.';
                }

                return undefined;
            },
            ignoreFocusOut: true
        });

        if (portInput === undefined) {
            return;
        }

        config = {
            mode: 'server',
            port: Number(portInput)
        };

    } else {
        // Step 3: Configure client mode.
        const serverAddress = await vscode.window.showInputBox({
            title: 'Client Configuration',
            prompt: 'Enter the server IP address or hostname',
            placeHolder: 'e.g. 192.168.1.100',
			value: '192.168.29.126',
            validateInput: (value) => {
                if (!value.trim()) {
                    return 'Server address cannot be empty.';
                }

                return undefined;
            },
            ignoreFocusOut: true
        });

        if (serverAddress === undefined) {
            return;
        }

        const portInput = await vscode.window.showInputBox({
            title: 'Client Configuration',
            prompt: 'Enter the port on which the server is listening',
            placeHolder: 'e.g. 8080',
            value: '8080',
            validateInput: (value) => {
                const port = Number(value);

                if (
                    !/^\d+$/.test(value.trim()) ||
                    !Number.isInteger(port) ||
                    port < 1 ||
                    port > 65535
                ) {
                    return 'Enter a valid port between 1 and 65535.';
                }

                return undefined;
            },
            ignoreFocusOut: true
        });

        if (portInput === undefined) {
            return;
        }

        config = {
            mode: 'client',
            serverAddress: serverAddress.trim(),
            port: Number(portInput)
        };
    }

    // Step 4: Store the configuration in memory and persist it.
    connectionConfig = config;
    await context.globalState.update(CONFIG_KEY, config);

    vscode.window.showInformationMessage(
        config.mode === 'server'
            ? `Server mode selected. Port: ${config.port}`
            : `Client mode selected. Server: ${config.serverAddress}:${config.port}`
    );
}

export async function activate(
    context: vscode.ExtensionContext
): Promise<void> {

    const disposable = vscode.commands.registerCommand(
        'pco-vs-code.pco',
         async () => {
			await configureConnection(context);
            
			connectionConfig = context.globalState.get<ConnectionConfig>(CONFIG_KEY);

			let sock;
			if (connectionConfig?.mode === 'client') {
				sock = libpco.clientConnect(connectionConfig.serverAddress, connectionConfig.port);
				sock.clientHello();
			} else if (connectionConfig?.mode === 'server') {
				sock = libpco.serverStart('temp-change-it', connectionConfig.port);
			} else {
				return;
			}

			const PIPE_READ_FD = sock.getPipeFd();

			// Create a socket wrapped around the existing file descriptor
			const pipeReadStream = new net.Socket({
				fd: PIPE_READ_FD,
				readable: true,
				writable: false // This is a read-only end
			});

			pipeReadStream.on('data', (chunk) => {
				console.log(`Data in queue available to read... Inserting to active editor`);
				insertIntoActiveBuffer(sock.getMessage());
			});

			pipeReadStream.on('end', () => {
				console.log('Pipe read end closed by the writer.');
			});

			pipeReadStream.on('error', (err) => {
				console.error('Pipe error:', err);
			});

			let changeDisposable = vscode.workspace.onDidChangeTextDocument((event) => {
				const editor = vscode.window.activeTextEditor;
				
				
				for (const change of event.contentChanges) {
					const isAdd = change.range.isEmpty && change.text.length > 0;
					const isDelete = !change.range.isEmpty && change.text.length === 0;
					const isReplace = !change.range.isEmpty && change.text.length > 0;

					let changeType = 'unknown';
					if (isAdd) changeType = 'DIFF_ADDED';
					else if (isDelete) changeType = 'DIFF_DELETED';
					else if (isReplace) changeType = 'DIFF_MODIFIED';

					const range: Range = {
						start_pos: change.range.start.line,
						start_char: change.range.start.character,
						end_pos: change.range.end.line,
						end_char: change.range.end.character
					}
					const line: Line = {
						body: change.text,
						len: change.text.length,
					}
					
					let lines: Array<Line> = [line]

					if (editor && editor.document === event.document) {
						const cursorPosition: vscode.Position = editor.selection.active;

						const diff: Diff[] = [{
							cursor_position: cursorPosition.line,
							kind: changeType,
							range: range,
							path: event.document.uri.path,
							plen: event.document.uri.path.length,
							llen: lines.length,
							lines: lines
						}]
						const msg: Message = {
							kind: "MSG_CONTENT",
							dlen: 1,
							diff: diff
						}
						
						console.log(msg);
						sock.sendMessage(msg)
					}
				}

				
			});
			context.subscriptions.push(changeDisposable);
        }
    );

    context.subscriptions.push(disposable);
}

export function deactivate(): void {
    // Stop your native server/client here when you integrate the dylib.
}


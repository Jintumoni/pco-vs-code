import * as vscode from 'vscode';
import { EOL } from 'node:os';
import { Message } from './types.js';


export async function insertIntoActiveBuffer(text: Message) {
    const activeEditor = vscode.window.activeTextEditor;

    if (activeEditor) {
        await activeEditor.edit(editBuilder => {
            
            for (const diff of text.diff) {
                for (const line of diff.lines) {
                    const startPos: vscode.Position = new vscode.Position(diff.range.start_pos, diff.range.start_char + 1);
                    const endPos: vscode.Position = new vscode.Position(diff.range.end_pos, diff.range.end_char + 1);
                    const range: vscode.Range = new vscode.Range(startPos, endPos);
                    
                    // if (line.kind === "DIFF_DELETED") {
                    //     editBuilder.delete(range);
                    // } else if (line.kind == "DIFF_MODIFIED") {
                    //     editBuilder.replace(range, line.body);
                    // } else if (line.kind == "DIFF_ADDED") {
                    //     editBuilder.insert(startPos, line.body);
                    // }
                }
            }
        });
    }
}
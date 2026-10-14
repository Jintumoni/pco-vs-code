interface Line {
    kind: string; // diff kind ->DIFF_ADDED, DIFF_DELETED, DIFF_MODIFIED
    num: number;  // line number of change
    body: string; // change content
}

interface Diff {
    path: string;
    cursor_position: number;
    lines: Array<Line>
}

export interface Message {
    kind: string; // message type -> CLIENT_HELLO, SERVER_HELLO, ACK, MSG_CONTENT
    diffs: Array<Diff>
}

export interface Client {
    sendMessage(message: string): void;
    clientHello(): void;
    getPipeFd(): number;
    sendMessage(message: string): void;
    getMessage(): Message;
}

export interface Server {
    sendMessage(message: string): void;
    getPipeFd(): number;
    sendMessage(message: string): void;
    getMessage(): Message;
}

export interface PcoAddon {
    clientConnect(address: string, port: number): Client;
    serverStart(port: number): Server;
}

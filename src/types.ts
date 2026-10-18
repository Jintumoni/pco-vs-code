// all these indexes in Range are 0 based
export interface Range {
    start_pos: number;   // position of the first line in a text-edit operation
    start_char: number;  // position of the character in the first line from in text-edit operation
    end_pos: number;     // position of the last line in a text-edit operation
    end_char: number;    // position of the character in the last line in a text-edit operation
}

export interface Line {
    len: number;  // length of body
    body: string; // change content
}

export interface Diff {
    kind: string; // diff kind -> DIFF_ADDED, DIFF_DELETED, DIFF_MODIFIED
    path: string;
    plen: number; // length of path string
    cursor_position: number;
    range: Range;
    llen: number;
    lines: Array<Line>;
}

export interface Message {
    kind: string; // message type -> CLIENT_HELLO, SERVER_HELLO, ACK, MSG_CONTENT
    dlen: number;
    diff: Array<Diff>;
}

export interface Client {
    sendMessage(message: Message): void;
    clientHello(): void;
    getPipeFd(): number;
    getMessage(): Message;
}

export interface Server {
    sendMessage(message: Message): void;
    getPipeFd(): number;
    getMessage(): Message;
}

export interface PcoAddon {
    clientConnect(address: string, port: number): Client;
    serverStart(path: string, port: number): Server;
}

import * as vscode from 'vscode';

export function deleteWholeLine(
    editBuilder: vscode.TextEditorEdit,
    document: vscode.TextDocument,
    lineNumber: number
): void {
    if (lineNumber < 0 || lineNumber >= document.lineCount) {
        return;
    }

    const line = document.lineAt(lineNumber);

    if (document.lineCount === 1) {
        editBuilder.delete(line.range);
    } else if (lineNumber < document.lineCount - 1) {
        // delete a middle line
        editBuilder.delete(new vscode.Range(line.range.start, document.lineAt(lineNumber + 1).range.start));
    } else {
        // delete the last line
        editBuilder.delete(new vscode.Range(document.lineAt(lineNumber - 1).range.end, line.range.end));
    }
}


export async function insertIntoActiveBuffer(text: any) {
    const activeEditor = vscode.window.activeTextEditor;

    if (activeEditor) {
        await activeEditor.edit(editBuilder => {
            
            for (const diff of text.diffs) {
                for (const line of diff.lines) {
                    const lineNumber = line.num;

                    if (lineNumber < activeEditor.document.lineCount) {
                        const lineRange = activeEditor.document.lineAt(lineNumber).range;

                        if (line.kind === "DIFF_DELETED") {
                            deleteWholeLine(editBuilder, activeEditor.document, lineNumber);
                        }
                        else {
                            editBuilder.replace(lineRange, line.body);
                        }
                    } else {						
                        const lastLine = activeEditor.document.lineAt(activeEditor.document.lineCount - 1);
                        const endPosition = lastLine.range.end;

                        editBuilder.insert(endPosition, (activeEditor.document.lineCount > 0 ? '\n' : '') + line.body);
                    }
                }
            }

        });
    }
}
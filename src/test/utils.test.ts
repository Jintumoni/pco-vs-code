import * as vscode from 'vscode';
import { describe, it } from 'mocha';
import * as assert from 'node:assert/strict';
// import { EOL } from 'node:os';
// import { deleteLine, replaceLine } from '../utils.js';

// describe('delete lines', () => {
//     async function createEditor(content: string) {
//         const document = await vscode.workspace.openTextDocument({
//             content,
//             language: 'plaintext'
//         });

//         const editor = await vscode.window.showTextDocument(document);
//         return editor;
//     }

//     it('deletes a middle line completely', async () => {
//         const editor = await createEditor(`apple${EOL}banana${EOL}cherry`);

//         await editor.edit(editBuilder => {
//             deleteLine(editBuilder, editor.document, 1);
//         });

//         assert.equal(editor.document.getText(), `apple${EOL}cherry`);
//         assert.equal(editor.document.lineCount, 2);
//     });

//     it('deletes the first line completely', async () => {
//         const editor = await createEditor(`apple${EOL}banana${EOL}cherry`);

//         await editor.edit(editBuilder => {
//             deleteLine(editBuilder, editor.document, 0);
//         });

//         assert.equal(editor.document.getText(), `banana${EOL}cherry`);
//         assert.equal(editor.document.lineCount, 2);
//     });

//     it('deletes the last line completely', async () => {
//         const editor = await createEditor(`apple${EOL}banana${EOL}cherry`);

//         await editor.edit(editBuilder => {
//             deleteLine(editBuilder, editor.document, 2);
//         });

//         assert.equal(editor.document.getText(), `apple${EOL}banana`);
//         assert.equal(editor.document.lineCount, 2);
//     });

//     it('handles a document with only one line', async () => {
//         const editor = await createEditor('apple');

//         await editor.edit(editBuilder => {
//             deleteLine(editBuilder, editor.document, 0);
//         });

//         assert.equal(editor.document.getText(), '');
//         assert.equal(editor.document.lineCount, 1);
//     });

//     it('deletes a series of consecutive lines', async () => {
//         const editor = await createEditor(`apple${EOL}banana${EOL}cherry${EOL}melon${EOL}strawberry`);

//         // delete line number 1, 2, 3 in a sequence
//         await editor.edit(editBuilder => {
//             deleteLine(editBuilder, editor.document, 1);
//         });
//         await editor.edit(editBuilder => {
//             deleteLine(editBuilder, editor.document, 2);
//         });
//         await editor.edit(editBuilder => {
//             deleteLine(editBuilder, editor.document, 3);
//         });

//         assert.equal(editor.document.getText(), `apple${EOL}strawberry`);
//         assert.equal(editor.document.lineCount, 2);
//     })
// });
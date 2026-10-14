import * as vscode from 'vscode';
import { describe, it } from 'mocha';
import * as assert from 'node:assert/strict';
import { insertIntoActiveBuffer, deleteWholeLine } from '../utils.js';

describe('deleteWholeLine', () => {
    async function createEditor(content: string) {
        const document = await vscode.workspace.openTextDocument({
            content,
            language: 'plaintext'
        });

        const editor = await vscode.window.showTextDocument(document);
        return editor;
    }

    it('deletes a middle line completely', async () => {
        const editor = await createEditor('apple\nbanana\ncherry');

        await editor.edit(editBuilder => {
            deleteWholeLine(editBuilder, editor.document, 1);
        });

        assert.equal(editor.document.getText(), 'apple\ncherry');
        assert.equal(editor.document.lineCount, 2);
    });

    it('deletes the first line completely', async () => {
        const editor = await createEditor('apple\nbanana\ncherry');

        await editor.edit(editBuilder => {
            deleteWholeLine(editBuilder, editor.document, 0);
        });

        assert.equal(editor.document.getText(), 'banana\ncherry');
        assert.equal(editor.document.lineCount, 2);
    });

    it('deletes the last line completely', async () => {
        const editor = await createEditor('apple\nbanana\ncherry');

        await editor.edit(editBuilder => {
            deleteWholeLine(editBuilder, editor.document, 2);
        });

        assert.equal(editor.document.getText(), 'apple\nbanana');
        assert.equal(editor.document.lineCount, 2);
    });

    it('handles a document with only one line', async () => {
        const editor = await createEditor('apple');

        await editor.edit(editBuilder => {
            deleteWholeLine(editBuilder, editor.document, 0);
        });

        assert.equal(editor.document.getText(), '');
        assert.equal(editor.document.lineCount, 1);
    });
});
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Chess } from '../chess.js';
import { bank } from '../tactics-bank.js';

test('tactics answers match the notation produced by a move on the board', () => {
  for (const { id, fen, line } of bank) {
    const game = new Chess(fen);
    for (const [index, expected] of line.entries()) {
      // Replay the saved move, then use the same input format as a board click.
      const { from, to, promotion } = game.move(expected);
      game.undo();
      const played = game.move({ from, to, promotion });
      assert.equal(played.san, expected, `${id}, ply ${index + 1}`);
    }
  }
});

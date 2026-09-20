// Run with: node tests/game.test.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const elements = new Map();
const drawing = new Proxy({}, { get: () => () => {} });
function element(id) {
  if (!elements.has(id)) elements.set(id, {
    textContent: '', width: 750, height: 750,
    classList: { toggle() {} }, addEventListener() {},
    getContext: () => drawing,
    getBoundingClientRect: () => ({ left: 10, top: 20, width: 250, height: 250 })
  });
  return elements.get(id);
}
const source = fs.readFileSync('us-election/main.js', 'utf8').replace(/\}\)\(\);\s*$/, `
  globalThis.game = { reset, play, allowed, hit,
    state: () => ({ boards, captured, player, next, moves, finished }) };
})();`);
const scope = { document: { querySelector: element } };
vm.runInNewContext(source, scope);
const game = scope.game;
game.play(0, 4);
assert.equal(game.state().next, 4);
assert.equal(game.state().player, 2);
game.play(0, 0);
assert.equal(game.state().moves, 1, 'Off-target moves must be rejected');
game.play(4, 4);
game.play(4, 4);
assert.equal(game.state().moves, 2, 'Occupied cells must be rejected');
assert.equal(JSON.stringify(game.hit({ clientX: 10 + 145 / 375 * 250, clientY: 20 + 145 / 375 * 250 })), '[4,0]', 'Scaled pointer must hit the correct square');
assert.equal(game.hit({ clientX: 9, clientY: 20 }), null);
let seed = 123456;
for (let match = 0; match < 80; match++) {
  game.reset();
  while (!game.state().finished) {
    const legal = [];
    for (let board = 0; board < 9; board++) for (let cell = 0; cell < 9; cell++) {
      if (game.allowed(board, cell)) legal.push([board, cell]);
    }
    assert.ok(legal.length, 'An unfinished game must have a legal move');
    seed = (seed * 1664525 + 1013904223) >>> 0;
    game.play(...legal[seed % legal.length]);
    assert.ok(game.state().moves <= 81);
  }
  const previous = game.state().moves;
  game.play(0, 0);
  assert.equal(game.state().moves, previous, 'Finished games must reject moves');
}
game.reset();
assert.equal(game.state().moves, 0);
assert.equal(game.state().next, -1);
assert.ok(game.state().boards.every(board => board.every(value => value === 0)));
console.log('Passed: turn restrictions, occupied cells, scaled input, reset, 80 complete games without deadlocks.');

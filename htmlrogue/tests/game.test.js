import test from 'node:test';
import assert from 'node:assert/strict';
import { createState, MAX_EVENTS } from '../src/engine/state.js';
import { createNode } from '../src/content/nodes.js';
import { act, endTurn, chooseReward, nextFloor, connect, disconnect } from '../src/engine/game.js';
import { dispatch } from '../src/engine/events.js';
import { rollRewards } from '../src/content/rewards.js';

function durableState() { const s = createState(42); s.enemy.hp = 10000; s.enemy.maxHp = 10000; return s; }
function firstReward(type = 'overclock') {
  const s = createState(42); act(s, 'n1'); endTurn(s); act(s, 'n1');
  assert.equal(s.phase, 'reward'); chooseReward(s, type); nextFloor(s); return s;
}

test('one manual click per button per turn; unused AP cannot bypass it', () => {
  const s = durableState(); assert.ok(act(s, 'n1')); assert.equal(s.ap, 2);
  assert.equal(act(s, 'n1'), false); assert.equal(s.ap, 2);
  endTurn(s); assert.equal(s.ap, 3); assert.ok(act(s, 'n1'));
});

test('first reward creates a native support element and a working free chain', () => {
  const s = firstReward(); assert.equal(s.connections.length, 1);
  act(s, 'n1'); const before = s.enemy.hp;
  act(s, 'n2', true); assert.equal(s.enemy.hp, before - 5);
  assert.equal(s.ap, 1); assert.deepEqual(s.chain, ['n2', 'n1']);
  const hp = s.hp; endTurn(s); assert.equal(s.hp, hp - 5);
});

test('unchanged and malformed input costs nothing, valid range changes commit once', () => {
  const s = firstReward('power'); const hp = s.enemy.hp;
  for (const value of [1, 4, -1, NaN, 1.5]) assert.equal(act(s, 'n2', value), false);
  assert.equal(s.ap, 3); assert.equal(s.enemy.hp, hp);
  act(s, 'n2', 0); assert.equal(s.ap, 2); assert.equal(s.shield, 3);
});

test('radio mode persists; guard creates shield and burst adds damage', () => {
  const s = firstReward('mode'); act(s, 'n1'); assert.equal(s.shield, 3);
  const before = s.enemy.hp; act(s, 'n2', 'burst'); assert.equal(s.enemy.hp, before - 5);
  assert.equal(act(s, 'n2', 'invalid'), false); endTurn(s); assert.equal(s.nodes[1].value, 'burst');
});

test('shield absorbs retaliation, expires, and heat bypasses shield', () => {
  const s = durableState(); s.nodes.push(createNode('overclock', 'n2')); s.nodes[1].value = true; s.shield = 99;
  endTurn(s); assert.equal(s.hp, 35); assert.equal(s.shield, 0);
});

test('cycle and fan-in cannot execute a node twice in one gesture', () => {
  const s = durableState(); s.nodes.push(createNode('attack', 'n2'), createNode('attack', 'n3'));
  s.connections = [{ from: 'n1', to: 'n2' }, { from: 'n1', to: 'n3' }, { from: 'n2', to: 'n3' }, { from: 'n3', to: 'n1' }];
  act(s, 'n1'); assert.equal(s.enemy.hp, 9991); assert.equal(s.chain.length, 3);
  assert.ok(s.log.some(l => l.kind === 'limit'));
});

test('hard budget stops oversized event graphs', () => {
  const s = durableState();
  for (let i = 2; i <= 30; i++) { s.nodes.push(createNode('attack', `n${i}`)); s.connections.push({ from: `n${i - 1}`, to: `n${i}` }); }
  dispatch(s, s.nodes[0]); assert.equal(s.chain.length, MAX_EVENTS); assert.equal(s.enemy.hp, 10000 - 60);
});

test('connections can only change before acting or between floors', () => {
  const s = firstReward(); assert.ok(disconnect(s, 0));
  assert.equal(connect(s, 'n1', 'n2'), false); assert.equal(connect(s, 'n1', 'n1'), false);
  assert.ok(connect(s, 'n2', 'n1')); act(s, 'n1'); assert.equal(disconnect(s, 0), false);
  assert.equal(connect(s, 'missing', 'n1'), false);
});

test('reward transitions are single-use and upgrading requires a valid target', () => {
  const s = createState(42); s.phase = 'reward'; s.rewards = ['upgrade'];
  assert.equal(chooseReward(s, 'upgrade', 'missing'), false); assert.equal(s.phase, 'reward');
  assert.ok(chooseReward(s, 'upgrade', 'n1')); assert.equal(s.nodes[0].level, 1);
  assert.equal(chooseReward(s, 'upgrade', 'n1'), false); assert.ok(nextFloor(s)); assert.equal(nextFloor(s), false);
});

test('terminal phases reject actions, retaliation, and rewards', () => {
  const s = durableState(); s.hp = 1; endTurn(s); assert.equal(s.phase, 'lost');
  assert.equal(act(s, 'n1'), false); assert.equal(endTurn(s), false);
  assert.equal(chooseReward(s, 'cache'), false);
  const win = durableState(); win.floor = 6; win.enemy.hp = 1; act(win, 'n1');
  assert.equal(win.phase, 'won'); assert.equal(endTurn(win), false); assert.equal(nextFloor(win), false);
});

test('unique rewards never repeat; seeded choices are reproducible', () => {
  const a = firstReward(), b = firstReward(); assert.deepEqual(rollRewards(a), rollRewards(b));
  a.rules = ['cache', 'echo', 'repair'];
  for (let i = 0; i < 20; i++) { const choices = rollRewards(a); assert.equal(new Set(choices).size, 3); assert.ok(!choices.some(id => ['cache', 'echo', 'repair', 'overclock'].includes(id))); }
});

test('echo runs source twice once a turn and repair caps at three per action', () => {
  const s = durableState(); s.rules = ['echo', 'repair']; s.hp = 20;
  for (let i = 2; i <= 6; i++) { s.nodes.push(createNode('attack', `n${i}`)); s.connections.push({ from: `n${i - 1}`, to: `n${i}` }); }
  act(s, 'n1'); assert.equal(s.enemy.hp, 9979); assert.equal(s.hp, 23);
  act(s, 'n6'); assert.equal(s.enemy.hp, 9976);
});

test('a complete six-floor run can be won without bypassing combat', () => {
  const s = createState(42);
  let safety = 0;
  while (!['won', 'lost'].includes(s.phase) && safety++ < 200) {
    if (s.phase === 'reward') {
      const priorities = ['mode', 'power', 'clone', 'echo', 'cache', 'repair', 'upgrade', 'shield', 'wire', 'overclock'];
      const choice = priorities.find(id => s.rewards.includes(id)); chooseReward(s, choice, 'n1');
    } else if (s.phase === 'ready') nextFloor(s);
    else {
      for (const n of s.nodes.filter(n => n.type === 'attack' || n.type === 'shield')) act(s, n.id);
      for (const n of s.nodes.filter(n => n.type === 'mode')) if (s.ap && s.phase === 'combat') act(s, n.id, n.value === 'guard' ? 'burst' : 'guard');
      for (const n of s.nodes.filter(n => n.type === 'power')) if (s.ap && s.phase === 'combat') act(s, n.id, n.value === 0 ? 1 : 0);
      if (s.phase === 'combat') endTurn(s);
    }
  }
  assert.equal(s.phase, 'won', `Stopped at floor ${s.floor}, HP ${s.hp}`);
});

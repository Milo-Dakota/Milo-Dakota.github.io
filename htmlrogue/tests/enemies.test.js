import test from 'node:test';
import assert from 'node:assert/strict';
import { makeEnemy, enemyStats, enemyIntent, refreshEnemy } from '../src/content/enemies.js';
import { createState } from '../src/engine/state.js';
import { act, endTurn, chooseReward, nextFloor } from '../src/engine/game.js';
import { rollRewards } from '../src/content/rewards.js';
import { createNode } from '../src/content/nodes.js';

test('same floor has identical base stats regardless of mechanism', () => {
  for (const n of [1, 4, 5, 6, 7, 50, 1000, 100000]) {
    const a = makeEnemy(n, 42, 'growth'), b = makeEnemy(n, 42, 'shield');
    assert.equal(a.hp, 6 + 8 * (n - 1));
    assert.equal(a.damage, 2 + Math.floor((n - 1) / 2));
    assert.equal(a.hp, b.hp); assert.equal(a.damage, b.damage);
    assert.equal(a.magnitude, 1 + Math.floor((n - 1) / 6));
    assert.equal(b.magnitude, 1 + Math.floor((n - 1) / 4));
  }
  for (const invalid of [0, -1, 1.5, NaN, Infinity]) assert.throws(() => enemyStats(invalid));
});

test('growth begins at base attack, scales each turn, and resets with encounter', () => {
  const enemy = makeEnemy(7, 42, 'growth');
  assert.equal(enemyIntent({ enemy, turn: 1 }), 5);
  assert.equal(enemyIntent({ enemy, turn: 4 }), 11);
  refreshEnemy(enemy); assert.equal(enemy.armor, 0);
  assert.equal(enemyIntent({ enemy: makeEnemy(8, 42, 'growth'), turn: 1 }), 5);
});

test('shield exists on entry and refreshes to its exact value without accumulation', () => {
  const enemy = makeEnemy(9, 42, 'shield');
  assert.equal(enemy.armor, 3);
  enemy.armor = 1; refreshEnemy(enemy); assert.equal(enemy.armor, 3);
  refreshEnemy(enemy); assert.equal(enemy.armor, 3);
  assert.equal(enemyIntent({ enemy, turn: 99 }), enemy.damage);
});

test('both possible first encounters can be defeated with the initial button', () => {
  for (const mechanism of ['growth', 'shield']) {
    const s = createState(12); s.enemy = makeEnemy(1, 12, mechanism);
    for (let t = 0; t < 5 && s.phase === 'combat'; t++) {
      act(s, 'n1');
      if (s.phase === 'combat') endTurn(s);
    }
    assert.equal(s.phase, 'reward');
  }
});

test('preview survives reward RNG and is exactly the next encounter, with no shared mutation', () => {
  const s = createState(42), preview = structuredClone(s.nextEnemy);
  for (let i = 0; i < 50; i++) rollRewards(s);
  s.phase = 'reward'; s.rewards = ['upgrade']; chooseReward(s, 'upgrade', 'n1');
  nextFloor(s); assert.deepEqual(s.enemy, preview);
  assert.equal(s.nextEnemy.floor, 3);
  const futureHp = s.nextEnemy.hp; s.enemy.hp = 0;
  assert.equal(s.nextEnemy.hp, futureHp);
});

test('floors six and deep floors always lead to rewards and another floor', () => {
  for (const n of [6, 100, 10000]) {
    const s = createState(42); s.floor = n; s.enemy = makeEnemy(n, 42, 'growth');
    s.nextEnemy = makeEnemy(n + 1, 42); s.enemy.hp = 1;
    act(s, 'n1'); assert.equal(s.phase, 'reward'); assert.equal(s.rewards.length, 3);
    chooseReward(s, s.rewards[0], 'n1'); nextFloor(s);
    assert.equal(s.floor, n + 1); assert.equal(s.phase, 'combat');
    assert.ok(Number.isFinite(s.enemy.hp));
  }
});

test('exhausting unique rewards still offers three repeatable upgrades', () => {
  const s = createState(42); s.floor = 500;
  s.nodes.push(...['corrosion', 'batch', 'cache', 'detonate'].map((type, i) => createNode(type, `extra${i}`)));
  s.rules = ['buffer', 'prefetch'];
  assert.deepEqual(rollRewards(s).sort(), ['patch', 'upgrade', 'wire']);
});

test('procedural names vary and remain deterministic into later archive visits', () => {
  const names = new Set(); const mechanisms = new Set();
  for (let n = 1; n <= 200; n++) {
    const a = makeEnemy(n, 42); assert.deepEqual(a, makeEnemy(n, 42));
    names.add(a.name); mechanisms.add(a.mechanism); assert.ok(a.region && a.tag && a.flavor);
  }
  assert.ok(names.size > 30); assert.equal(mechanisms.size, 2);
  assert.match(makeEnemy(51, 42).region, /第 2 次回访/);
});

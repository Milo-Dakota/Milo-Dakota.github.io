import test from 'node:test';
import assert from 'node:assert/strict';
import { createState, MAX_EVENTS } from '../src/engine/state.js';
import { createNode } from '../src/content/nodes.js';
import { act, configure, endTurn, chooseReward, nextFloor, connect, disconnect } from '../src/engine/game.js';
import { supplyAt } from '../src/engine/resources.js';
import { makeEnemy, enemyIntent } from '../src/content/enemies.js';
import { rollRewards } from '../src/content/rewards.js';

function durable() {
  const s = createState(42); s.enemy = makeEnemy(1, 42, 'growth'); s.enemy.hp = 10000; s.enemy.maxHp = 10000;
  return s;
}
function add(s, type) { const n = createNode(type, 'n' + s.nextId++); s.nodes.push(n); return n; }

test('supply is deterministic, varies, sums to six, and never starves either resource', () => {
  const variants = new Set();
  for (let i = 1; i < 100; i++) {
    const a = supplyAt(42, i); assert.deepEqual(a, supplyAt(42, i));
    assert.equal(a.compute + a.data, 6); assert.ok(a.compute >= 3 && a.data >= 1);
    variants.add(a.compute);
  }
  assert.equal(variants.size, 3);
});
test('unused compute expires, data accumulates and the supply preview is honored', () => {
  const s = durable(); s.compute = 99; s.data = 8;
  const preview = { ...s.nextSupply };
  endTurn(s);
  assert.deepEqual(s.supply, preview);
  assert.equal(s.compute, preview.compute); assert.equal(s.data, 8 + preview.data);
});
test('direct requests repeat while affordable and insufficient funds cause no mutation', () => {
  const s = durable(); s.compute = 2;
  assert.ok(act(s, 'n1')); assert.ok(act(s, 'n1'));
  assert.equal(s.enemy.hp, 9994); assert.equal(s.compute, 0);
  const snapshot = structuredClone(s); assert.equal(act(s, 'n1'), false); assert.deepEqual(s, snapshot);
});
test('processor configurations are free, execution is once per turn across both modes', () => {
  const s = durable(); s.compute = 3; s.data = 6;
  configure(s, 'n2', 'expand'); assert.equal(s.data, 6); assert.equal(s.compute, 3);
  act(s, 'n2'); assert.equal(s.data, 4); assert.equal(s.compute, 4);
  configure(s, 'n2', 'compress'); assert.equal(act(s, 'n2'), false);
  endTurn(s); assert.ok(act(s, 'n2'));
});
test('processor can spend data to recover from zero compute', () => {
  const s = durable(); s.compute = 0; s.data = 2;
  configure(s, 'n2', 'expand'); assert.ok(act(s, 'n2'));
  assert.equal(s.compute, 1); assert.equal(s.data, 0); assert.ok(act(s, 'n1'));
});
test('range only configures, submission charges data and compute exactly once', () => {
  const s = durable(), batch = add(s, 'batch'); s.data = 8; s.compute = 3;
  assert.ok(configure(s, batch.id, 4));
  assert.equal(s.data, 8); assert.equal(s.compute, 3); assert.equal(s.enemy.hp, 10000);
  act(s, batch.id); assert.equal(s.data, 4); assert.equal(s.compute, 2); assert.equal(s.enemy.hp, 9992);
  assert.ok(act(s, batch.id)); assert.equal(act(s, batch.id), false);
});
test('invalid and unchanged configurations are rejected without altering resources', () => {
  const s = durable(), batch = add(s, 'batch'), cache = add(s, 'cache');
  for (const value of [0, 5, -1, NaN, Infinity, 1.5, '2', 1]) assert.equal(configure(s, batch.id, value), false);
  assert.equal(configure(s, 'n2', 'invalid'), false);
  assert.equal(configure(s, cache.id, 1), false);
  assert.equal(configure(s, 'n1', true), false);
});
test('background begins next turn, pays upkeep, adds corrosion, and does not execute on toggles', () => {
  const s = durable(), n = add(s, 'corrosion'); s.data = 5;
  configure(s, n.id, true); configure(s, n.id, false); configure(s, n.id, true);
  assert.equal(s.enemy.corrosion, 0); assert.equal(s.data, 5);
  const preview = { ...s.nextSupply }; endTurn(s);
  assert.equal(s.compute, preview.compute - 1); assert.equal(s.data, 5 + preview.data - 2);
  assert.equal(s.enemy.corrosion, 2);
  const before = s.enemy.hp; endTurn(s);
  assert.equal(s.enemy.hp, before - 2); assert.equal(s.enemy.corrosion, 3);
});
test('unaffordable background pauses without partial charges and retries later', () => {
  const s = durable(), n = add(s, 'corrosion');
  configure(s, n.id, true); s.data = 0;
  let tick = 1; while (supplyAt(s.resourceSeed, tick).data !== 1) tick++;
  s.supplyTick = tick - 1; endTurn(s);
  assert.equal(s.data, 1); assert.equal(s.compute, s.supply.compute); assert.equal(s.enemy.corrosion, 0);
  assert.match(n.status, /暂停/);
  endTurn(s); assert.equal(s.enemy.corrosion, 2);
});
test('corrosion bypasses armor, decays, and lethal ticks prevent retaliation and new upkeep', () => {
  const s = durable(); s.enemy.hp = 2; s.enemy.armor = 99; s.enemy.corrosion = 3; s.hp = 20;
  const tick = s.supplyTick; endTurn(s);
  assert.equal(s.phase, 'reward'); assert.equal(s.hp, 24); assert.equal(s.supplyTick, tick);
  assert.equal(s.enemy.hp, 0);
});
test('detonation needs corrosion, consumes it and pays compute once', () => {
  const s = durable(), n = add(s, 'detonate'); s.compute = 3; s.enemy.armor = 99;
  assert.equal(act(s, n.id), false); assert.equal(s.compute, 3);
  s.enemy.corrosion = 7; act(s, n.id);
  assert.equal(s.enemy.hp, 9993); assert.equal(s.enemy.armor, 99);
  assert.equal(s.enemy.corrosion, 0); assert.equal(s.compute, 2);
  assert.equal(act(s, n.id), false);
});
test('shield absorbs first, cache spends only needed whole data packets', () => {
  const s = durable(), n = add(s, 'cache'); s.enemy.damage = 5; s.shield = 2; s.data = 5;
  configure(s, n.id, true); const hp = s.hp, incomingData = s.nextSupply.data;
  endTurn(s); assert.equal(s.hp, hp - 1); assert.equal(s.data, 1 + incomingData);
});
test('disabled cache preserves data; excessive shields never spend data', () => {
  for (const enabled of [true, false]) {
    const s = durable(), n = add(s, 'cache'); configure(s, n.id, enabled);
    s.shield = 99; s.data = 8; const data = s.nextSupply.data;
    endTurn(s); assert.equal(s.hp, 36); assert.equal(s.data, 8 + data);
  }
});
test('paid chains skip unaffordable nodes and never propagate through them', () => {
  const s = durable(); s.wireCapacity = 2; s.compute = 1; s.data = 0;
  connect(s, 'n1', 'n2'); connect(s, 'n2', 'n3');
  act(s, 'n1'); assert.equal(s.enemy.hp, 9997); assert.equal(s.data, 0); assert.equal(s.shield, 0);
  assert.deepEqual(s.chain, ['n1']);
});
test('cycles and fan-in execute once per gesture, charging each successful node', () => {
  const s = durable(); const n = add(s, 'attack'); s.compute = 10;
  s.connections = [{ from: 'n1', to: n.id }, { from: n.id, to: 'n1' }];
  act(s, 'n1'); assert.equal(s.compute, 8); assert.equal(s.enemy.hp, 9994);
  assert.equal(s.chain.length, 2);
});
test('event budget limits large graphs', () => {
  const s = durable(); s.compute = 100; let previous = 'n1';
  for (let i = 0; i < 30; i++) { const n = add(s, 'attack'); s.connections.push({ from: previous, to: n.id }); previous = n.id; }
  act(s, 'n1'); assert.equal(s.chain.length, MAX_EVENTS); assert.equal(s.compute, 80);
});
test('only active nodes can connect and spending locks wiring despite compute refunds', () => {
  const s = durable(), n = add(s, 'cache'); s.wireCapacity = 2;
  assert.equal(connect(s, n.id, 'n1'), false); assert.equal(connect(s, 'n1', n.id), false);
  assert.ok(connect(s, 'n1', 'n3')); assert.ok(disconnect(s, 0));
  act(s, 'n1'); s.compute = 99; assert.equal(connect(s, 'n1', 'n3'), false);
});
test('rewards upgrade chosen behavior and cannot be taken twice', () => {
  const s = durable(), batch = add(s, 'batch'); s.phase = 'reward'; s.rewards = ['upgrade'];
  assert.equal(chooseReward(s, 'upgrade', 'missing'), false);
  assert.ok(chooseReward(s, 'upgrade', batch.id)); assert.equal(batch.level, 1);
  assert.ok(configure(s, batch.id, 5)); assert.equal(chooseReward(s, 'upgrade', batch.id), false);
});
test('next floor resets data and corrosion, retains nodes and honors the preview', () => {
  const s = durable(); s.phase = 'reward'; s.rewards = ['patch']; s.data = 999;
  s.enemy.corrosion = 99; const preview = structuredClone(s.nextEnemy);
  chooseReward(s, 'patch'); nextFloor(s);
  assert.deepEqual(s.enemy, preview); assert.equal(s.enemy.corrosion, 0);
  assert.equal(s.data, s.supply.data); assert.equal(s.nodes.length, 3);
  assert.equal(s.maxHp, 40);
});
test('reward pool gates detonation and always leaves three repeatable rewards', () => {
  const s = durable(); s.floor = 20;
  for (let i = 0; i < 20; i++) assert.ok(!rollRewards(s).includes('detonate'));
  for (const type of ['batch','corrosion','cache','detonate']) add(s, type);
  s.rules = ['buffer','prefetch'];
  assert.deepEqual(rollRewards(s).sort(), ['patch','upgrade','wire']);
});
test('death locks execution, configuration, rewards and progression', () => {
  const s = durable(); s.hp = 1; endTurn(s);
  assert.equal(s.phase, 'lost'); assert.equal(s.compute, 0);
  assert.equal(act(s, 'n1'), false); assert.equal(configure(s, 'n2', 'expand'), false);
  assert.equal(endTurn(s), false); assert.equal(nextFloor(s), false);
});

test('prefetch and buffer apply on turn start including entry to a new floor', () => {
  const s = durable(); s.rules = ['prefetch', 'buffer']; s.data = 0;
  endTurn(s); assert.equal(s.data, s.supply.data + 1); assert.equal(s.shield, 4);
  s.phase = 'ready'; nextFloor(s);
  assert.equal(s.data, s.supply.data + 1); assert.equal(s.shield, 4);
});

test('different rewards never alter the next resource supply', () => {
  const a = durable(), b = durable();
  a.phase = b.phase = 'reward'; a.rewards = ['upgrade']; b.rewards = ['batch'];
  chooseReward(a, 'upgrade', 'n1'); chooseReward(b, 'batch');
  nextFloor(a); nextFloor(b);
  assert.deepEqual(a.supply, b.supply); assert.deepEqual(a.nextSupply, b.nextSupply);
});

test('resource-based play advances to floor ten without injecting resources or skipping fights', () => {
  const s = createState(42);
  for (let step = 0; step < 500 && s.floor < 10 && s.phase !== 'lost'; step++) {
    if (s.phase === 'reward') {
      const id = ['batch', 'upgrade', 'buffer', 'prefetch', 'cache', 'patch', 'wire', 'corrosion', 'detonate'].find(id => s.rewards.includes(id));
      chooseReward(s, id, 'n1'); continue;
    }
    if (s.phase === 'ready') { nextFloor(s); continue; }
    const processor = s.nodes.find(n => n.type === 'processor');
    if (s.data >= 2 && !processor.used) { configure(s, processor.id, 'expand'); act(s, processor.id); }
    const batch = s.nodes.find(n => n.type === 'batch');
    if (batch && s.data > 0 && s.compute > 0) { configure(s, batch.id, Math.min(4 + batch.level, s.data)); act(s, batch.id); }
    if (s.phase !== 'combat') continue;
    const attack = s.nodes.find(n => n.type === 'attack');
    if (s.enemy.hp + s.enemy.armor <= s.compute * (3 + attack.level * 2)) {
      while (s.phase === 'combat' && act(s, attack.id)) {} continue;
    }
    while (s.shield < enemyIntent(s) && s.compute > 1) act(s, 'n3');
    while (s.phase === 'combat' && act(s, attack.id)) {}
    if (s.phase === 'combat') endTurn(s);
  }
  assert.equal(s.floor, 10); assert.equal(s.phase, 'combat');
});

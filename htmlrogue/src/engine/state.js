import { createNode } from '../content/nodes.js';
import { makeEnemy } from '../content/enemies.js';
import { replenish } from './resources.js';
import { record } from './log.js';
export { record } from './log.js';
export const MAX_EVENTS = 20;
export const MAX_HP = 36;

export function createState(seed = Date.now()) {
  const state = { seed: seed >>> 0, encounterSeed: seed >>> 0, resourceSeed: seed >>> 0,
    floor: 1, turn: 1, phase: 'combat', hp: MAX_HP, maxHp: MAX_HP, shield: 0,
    compute: 0, data: 0, supplyTick: 0, actionsThisTurn: 0,
    nodes: [createNode('attack', 'n1'), createNode('processor', 'n2'), createNode('shield', 'n3')],
    nextId: 4, connections: [], wireCapacity: 0, rules: [], wireBonus: 0,
    enemy: makeEnemy(1, seed), nextEnemy: makeEnemy(2, seed), rewards: [], log: [], logId: 0, chain: [],
    stats: { actions: 0, events: 0, maxChain: 0 } };
  replenish(state);
  record(state, '算力当回合使用，数据留到以后。先试试直达请求或折叠档案馆。');
  return state;
}

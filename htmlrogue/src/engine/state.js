import { createNode } from '../content/nodes.js';
import { makeEnemy } from '../content/enemies.js';

export const MAX_EVENTS = 20;
export const MAX_AP = 3;
export const MAX_HP = 36;

export function createState(seed = Date.now()) {
  const state = { seed: seed >>> 0, floor: 1, turn: 1, phase: 'combat', hp: MAX_HP, maxHp: MAX_HP, shield: 0, ap: MAX_AP,
    nodes: [createNode('attack', 'n1')], nextId: 2, connections: [], wireCapacity: 0, rules: [], wireBonus: 0,
    enemy: makeEnemy(1), rewards: [], log: [], logId: 0, chain: [], firstAction: true, stats: { actions: 0, events: 0, maxChain: 0 } };
  record(state, '页面已载入。点击「攻击」，开始清理。', 'system');
  return state;
}

export function record(state, text, kind = 'system') {
  state.log.unshift({ id: ++state.logId, text, kind });
  state.log = state.log.slice(0, 45);
}

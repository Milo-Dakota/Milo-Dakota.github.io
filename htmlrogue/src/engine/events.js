import { NODE_DEFS } from '../content/nodes.js';
import { MAX_EVENTS } from './state.js';
import { record } from './log.js';
import { executeNode } from './effects.js';
import { blockedReason } from './node-rules.js';

/** Every linked execution pays normally. Failed nodes neither execute nor propagate. */
export function dispatch(state, source) {
  const queue = [source.id], visited = new Set();
  state.chain = [];
  while (queue.length && visited.size < MAX_EVENTS && state.enemy.hp > 0) {
    const id = queue.shift();
    if (visited.has(id)) { record(state, '回路截断：每条连锁同一元素只执行一次。', 'limit'); continue; }
    visited.add(id);
    const node = state.nodes.find(n => n.id === id);
    if (!node) continue;
    if (!executeNode(state, node)) {
      record(state, NODE_DEFS[node.type].name + ' 跳过 → ' + blockedReason(state, node), 'limit');
      continue;
    }
    state.chain.push(id);
    state.stats.events++;
    for (const connection of state.connections.filter(c => c.from === id)) queue.push(connection.to);
  }
  if (queue.length && state.enemy.hp > 0) record(state, '事件预算已用尽，停止传播。', 'limit');
  state.stats.maxChain = Math.max(state.stats.maxChain, state.chain.length);
}

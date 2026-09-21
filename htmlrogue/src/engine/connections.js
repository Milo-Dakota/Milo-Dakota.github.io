import { executable } from '../content/nodes.js';
import { record } from './log.js';
export function canWire(state) { return state.phase === 'ready' || (state.phase === 'combat' && state.actionsThisTurn === 0); }
export function connect(state, from, to) {
  if (!canWire(state) || state.connections.length >= state.wireCapacity || from === to) return false;
  if (![from, to].every(id => state.nodes.some(n => n.id === id && executable(n)))) return false;
  if (state.connections.some(c => c.from === from && c.to === to)) return false;
  state.connections.push({ from, to });
  record(state, '工作流已连接；每一步正常支付资源。', 'event'); return true;
}
export function disconnect(state, index) {
  if (!canWire(state) || !Number.isInteger(index) || index < 0 || index >= state.connections.length) return false;
  state.connections.splice(index, 1); return true;
}

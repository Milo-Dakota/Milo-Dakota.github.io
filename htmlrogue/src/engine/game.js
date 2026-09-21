import { makeEnemy, enemyIntent, refreshEnemy } from '../content/enemies.js';
import { record } from './log.js';
import { replenish } from './resources.js';
import { blockedReason, validConfiguration } from './node-rules.js';
import { runBackground, tickCorrosion, absorbWithCache } from './processes.js';
import { dispatch } from './events.js';
import { finishEncounter } from './progression.js';
export { chooseReward } from './progression.js';
export { canWire, connect, disconnect } from './connections.js';

export function configure(state, id, value) {
  const node = state.nodes.find(n => n.id === id);
  if (!['combat', 'ready'].includes(state.phase) || !node || !validConfiguration(node, value)) return false;
  node.value = value;
  if (node.type === 'corrosion') node.status = value ? '已排队，下回合开始运行' : '';
  return true;
}
export function act(state, id) {
  const node = state.nodes.find(n => n.id === id);
  if (!node || blockedReason(state, node)) return false;
  state.actionsThisTurn++; state.stats.actions++;
  dispatch(state, node);
  finishEncounter(state);
  return true;
}
function startTurn(state) {
  state.actionsThisTurn = 0;
  state.nodes.forEach(n => { n.used = false; });
  state.shield = (state.rules.includes('buffer') ? 4 : 0) + state.wireBonus * 2;
  refreshEnemy(state.enemy);
  replenish(state);
  runBackground(state);
  record(state, '回合 ' + state.turn + ' → 补给 ' + state.supply.compute + ' 算力 / ' + state.supply.data + ' 数据。后台费用已结算。');
}
export function endTurn(state) {
  if (state.phase !== 'combat') return false;
  tickCorrosion(state);
  if (finishEncounter(state)) return true;
  const hit = enemyIntent(state);
  const blocked = Math.min(hit, state.shield);
  const remaining = absorbWithCache(state, hit - blocked);
  state.hp = Math.max(0, state.hp - remaining);
  record(state, '敌方反击 ' + hit + ' → 护盾抵消 ' + blocked + '，最终损失 ' + remaining + ' 完整度', 'enemy');
  state.compute = 0; state.shield = 0; state.chain = [];
  if (state.hp <= 0) { state.phase = 'lost'; record(state, '页面停止响应。下一次，给机器留一条退路。', 'enemy'); }
  else { state.turn++; startTurn(state); }
  return true;
}
export function nextFloor(state) {
  if (state.phase !== 'ready') return false;
  state.floor++; state.turn = 1; state.data = 0;
  state.enemy = { ...state.nextEnemy };
  state.nextEnemy = makeEnemy(state.floor + 1, state.encounterSeed);
  state.phase = 'combat'; state.chain = [];
  startTurn(state);
  record(state, '进入第 ' + state.floor + ' 页 → ' + state.enemy.name + '。数据重新采集。');
  return true;
}

import { NODE_DEFS, attackPower } from '../content/nodes.js';
import { MAX_EVENTS, record } from './state.js';

function applyEffect(state, node) {
  if (node.type === 'attack') {
    const power = attackPower(state, node);
    const absorbed = Math.min(state.enemy.armor, power);
    state.enemy.armor -= absorbed;
    const damage = Math.min(state.enemy.hp, power - absorbed);
    state.enemy.hp -= damage;
    for (const item of state.nodes) {
      if (item.type === 'mode' && item.value === 'guard') state.shield += 3;
      if (item.type === 'power') state.shield += 3 - Number(item.value);
    }
    record(state, `攻击 → ${damage} 伤害${absorbed ? `（抵消 ${absorbed} 护盾）` : ''}`, 'damage');
  } else if (node.type === 'shield') {
    const amount = 5 + node.level * 2;
    state.shield += amount;
    record(state, `防护 → +${amount} 护盾`, 'shield');
  } else {
    const value = node.type === 'overclock' ? (node.value ? '开启' : '关闭') : node.type === 'mode' ? (node.value === 'burst' ? '突击' : '防守') : `功率 ${node.value}`;
    record(state, `${NODE_DEFS[node.type].name} → ${value}`, 'event');
  }
}

/** Breadth-first dispatch: one visit per node per gesture, plus a hard queue budget.
 * Synthetic effects deliberately do not dispatch browser events or consume manual uses.
 * This keeps UI events and game events separate, prevents cycles, and permits fan-out.
 */
export function dispatch(state, source) {
  const queue = [{ id: source.id, depth: 0 }];
  const visited = new Set();
  state.chain = [];
  let repaired = 0;
  while (queue.length && state.chain.length < MAX_EVENTS && state.enemy.hp > 0) {
    const event = queue.shift();
    if (visited.has(event.id)) { record(state, '回路已截断：同一元素在一次连锁中只执行一次。', 'limit'); continue; }
    const node = state.nodes.find(n => n.id === event.id);
    if (!node) continue;
    visited.add(node.id);
    state.chain.push(node.id);
    if (event.depth) record(state, `↳ 自动触发 ${NODE_DEFS[node.type].name} #${node.id.slice(1)}`, 'event');
    applyEffect(state, node);
    state.stats.events++;
    if (event.depth && state.rules.includes('repair') && repaired < 3) {
      state.hp = Math.min(state.maxHp, state.hp + 1);
      repaired++;
      record(state, '连锁修复 → +1 完整度', 'heal');
    }
    if (!event.depth && state.firstAction && state.rules.includes('echo') && state.enemy.hp > 0) {
      record(state, '双重回响 → 源元素额外执行', 'event');
      applyEffect(state, node);
      state.stats.events++;
    }
    for (const connection of state.connections.filter(c => c.from === node.id)) queue.push({ id: connection.to, depth: event.depth + 1 });
  }
  if (queue.length && state.enemy.hp > 0) record(state, `已达到 ${MAX_EVENTS} 个事件上限，停止传播。`, 'limit');
  state.stats.maxChain = Math.max(state.stats.maxChain, state.chain.length);
  state.firstAction = false;
}

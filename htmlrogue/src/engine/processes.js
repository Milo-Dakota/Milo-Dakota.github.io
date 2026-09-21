import { nodeSpec } from './node-rules.js';
import { pay } from './resources.js';
import { record } from './log.js';
import { damageEnemy } from './effects.js';

/** Background jobs do not dispatch connections: configuring them cannot create free actions. */
export function runBackground(state) {
  for (const node of state.nodes.filter(n => n.type === 'corrosion')) {
    node.status = '';
    if (!node.value) continue;
    const spec = nodeSpec(node);
    if (!pay(state, spec.cost)) {
      node.status = '资源不足，已暂停；下回合重试';
      record(state, '后台锈蚀暂停 → 需要 1 算力 / 2 数据', 'limit');
      continue;
    }
    state.enemy.corrosion += spec.amount;
    node.status = '本回合已运行，下回合继续';
    record(state, '后台锈蚀 → +' + spec.amount + ' 腐蚀', 'event');
  }
}
export function tickCorrosion(state) {
  if (!state.enemy.corrosion) return;
  damageEnemy(state, state.enemy.corrosion, '腐蚀结算', true);
  state.enemy.corrosion = Math.max(0, state.enemy.corrosion - 1);
}
export function absorbWithCache(state, incoming) {
  let remaining = incoming;
  for (const node of state.nodes.filter(n => n.type === 'cache' && n.value)) {
    const spec = nodeSpec(node);
    const packets = Math.min(Math.floor(state.data / 2), Math.ceil(remaining / spec.amount));
    const blocked = Math.min(remaining, packets * spec.amount);
    state.data -= packets * 2;
    remaining -= blocked;
    if (packets) record(state, '缓存替身 → 消耗 ' + packets * 2 + ' 数据，抵挡 ' + blocked + ' 伤害', 'shield');
  }
  return remaining;
}

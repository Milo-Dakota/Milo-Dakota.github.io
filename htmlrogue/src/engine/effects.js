import { record } from './log.js';
import { nodeSpec, blockedReason } from './node-rules.js';
import { pay } from './resources.js';

export function damageEnemy(state, amount, label, piercing = false) {
  const absorbed = piercing ? 0 : Math.min(state.enemy.armor, amount);
  state.enemy.armor -= absorbed;
  const damage = Math.min(state.enemy.hp, amount - absorbed);
  state.enemy.hp -= damage;
  record(state, label + ' → ' + damage + ' 伤害' + (absorbed ? '（护盾抵消 ' + absorbed + '）' : ''), 'damage');
}
export function executeNode(state, node) {
  const reason = blockedReason(state, node);
  if (reason) return false;
  const spec = nodeSpec(node);
  pay(state, spec.cost);
  if (spec.once) node.used = true;
  switch (node.type) {
    case 'attack': case 'batch': damageEnemy(state, spec.amount, node.type === 'attack' ? '直达请求' : '洪流提交'); break;
    case 'shield': state.shield += spec.amount; record(state, '临时防火墙 → +' + spec.amount + ' 护盾', 'shield'); break;
    case 'processor':
      if (node.value === 'compress') state.data += spec.amount;
      else state.compute += spec.amount;
      record(state, node.value === 'compress' ? '档案压缩 → +' + spec.amount + ' 数据' : '档案展开 → +1 算力', 'event'); break;
    case 'detonate':
      damageEnemy(state, state.enemy.corrosion + spec.bonus, '清算坏账', true);
      state.enemy.corrosion = 0; break;
  }
  return true;
}

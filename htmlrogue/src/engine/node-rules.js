import { executable } from '../content/nodes.js';
import { canPay } from './resources.js';

/** One shared description of price, output and eligibility for UI and engine. */
export function nodeSpec(node) {
  const level = node.level;
  switch (node.type) {
    case 'attack': return { cost: { compute: 1, data: 0 }, amount: 3 + level * 2, description: '支付 1 算力，造成 ' + (3 + level * 2) + ' 伤害。资源足够可重复执行。' };
    case 'shield': return { cost: { compute: 1, data: 0 }, amount: 4 + level * 2, description: '支付 1 算力，获得 ' + (4 + level * 2) + ' 护盾；敌方行动后清空。可重复执行。' };
    case 'processor': return { cost: node.value === 'compress' ? { compute: 1, data: 0 } : { compute: 0, data: 2 }, once: true,
      amount: node.value === 'compress' ? 2 + level : 1,
      description: '每回合执行一次。压缩：1 算力 → ' + (2 + level) + ' 数据；展开：2 数据 → 1 算力。切换模式免费，不执行转换。' };
    case 'batch': return { cost: { compute: 1, data: node.value }, amount: node.value * 2, capacity: 4 + level,
      description: '选择投入量，再提交：1 算力 + 每点数据造成 2 伤害。单次容量 ' + (4 + level) + '，可重复提交。调节滑杆免费。' };
    case 'detonate': return { cost: { compute: 1, data: 0 }, bonus: level * 2,
      description: '支付 1 算力，移除全部腐蚀，立即造成等量' + (level ? ' + ' + level * 2 : '') + '穿透伤害。牺牲后续收益换取立即结算。' };
    case 'corrosion': return { cost: { compute: 1, data: 2 }, amount: 2 + level,
      description: '勾选后，下回合开始支付 1 算力 + 2 数据，施加 ' + (2 + level) + ' 腐蚀。不足则暂停，下回合自动重试。腐蚀在敌方行动前结算并减 1。' };
    case 'cache': return { cost: { compute: 0, data: 2 }, amount: 1 + level,
      description: '勾选授权防护：护盾不足时，每消耗 2 数据抵挡最多 ' + (1 + level) + ' 伤害。按需使用；数据不足的部分仍会受伤。' };
  }
}
export function blockedReason(state, node) {
  if (state.phase !== 'combat') return '当前页面操作已结束';
  if (!executable(node)) return '持续控件由指定时机运行';
  const spec = nodeSpec(node);
  if (spec.once && node.used) return '本回合已转换';
  if (node.type === 'detonate' && !state.enemy.corrosion) return '尚无可清算的腐蚀';
  if (!canPay(state, spec.cost)) return '资源不足：需要 ' + spec.cost.compute + ' 算力 / ' + spec.cost.data + ' 数据';
  return '';
}
export function validConfiguration(node, value) {
  if (value === node.value) return false;
  if (node.type === 'processor') return ['compress', 'expand'].includes(value);
  if (node.type === 'batch') return Number.isInteger(value) && value >= 1 && value <= nodeSpec(node).capacity;
  if (['corrosion', 'cache'].includes(node.type)) return typeof value === 'boolean';
  return false;
}

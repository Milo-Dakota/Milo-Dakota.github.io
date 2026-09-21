export const REWARDS = [
  { id: 'corrosion', category: '持续进程', title: '在后台悄悄生锈', code: '<input type="checkbox">', description: '每回合付费施加腐蚀，结算在敌方反击之前。', node: 'corrosion' },
  { id: 'batch', category: '数据释放', title: '让缓存汇成洪流', code: '<input type="range">', description: '选择投入数据量，支付 1 算力集中释放。', node: 'batch' },
  { id: 'cache', category: '库存防御', title: '让缓存替你受伤', code: '<input type="checkbox">', description: '授权消耗数据抵挡伤害；可以随时撤销授权。', node: 'cache' },
  { id: 'detonate', category: '状态兑现', title: '把坏账一次结清', code: '<button>清算</button>', description: '立即兑现全部腐蚀，牺牲未来收益换取现在击杀。', node: 'detonate', requires: 'corrosion' },
  { id: 'upgrade', category: '局部升级', title: '重写一个控件', code: 'patch(element)', description: '选择控件升级：强化直接效果、产量、处理容量或防护效率。', target: true },
  { id: 'wire', category: '事件连接', title: '预排一段工作流', code: 'onExecute → execute', description: '连接容量 +1。连锁也支付资源；每回合额外获得 2 护盾。', rule: 'wire' },
  { id: 'buffer', category: '全局规则', title: '启动备用防线', code: 'onTurn → shield(4)', description: '每回合开始获得 4 护盾。', rule: 'buffer', unique: true },
  { id: 'prefetch', category: '全局规则', title: '多取一份回声', code: 'prefetch(data)', description: '每回合补给额外增加 1 数据，包括新关卡首回合。', rule: 'prefetch', unique: true },
  { id: 'patch', category: '页面修复', title: '扩展容错余量', code: 'integrity += 4', description: '最大完整度 +4，并立即恢复 4 完整度。可重复获得。', rule: 'patch' },
];
export function random(state) {
  state.seed = (Math.imul(state.seed, 1664525) + 1013904223) >>> 0;
  return state.seed / 4294967296;
}
export function rollRewards(state) {
  if (state.floor === 1) return ['corrosion', 'batch', 'cache'];
  const pool = REWARDS.filter(r => !(r.node && state.nodes.some(n => n.type === r.node))
    && !(r.requires && !state.nodes.some(n => n.type === r.requires))
    && !(r.unique && state.rules.includes(r.rule)));
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(random(state) * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  return pool.slice(0, 3).map(r => r.id);
}

export const REWARDS = [
  { id: 'overclock', category: '新增元素', title: '给网页一个开关', code: '<input type="checkbox">', description: '开启后攻击 +2，回合结束损失 1 完整度。切换也能带动攻击。', node: 'overclock' },
  { id: 'mode', category: '新增元素', title: '选择你的运行方式', code: '<input type="radio">', description: '突击增加伤害，防守生成护盾。选项互斥，取舍由你。', node: 'mode' },
  { id: 'power', category: '新增元素', title: '把数值交给滑杆', code: '<input type="range">', description: '在攻击与护盾之间分配 3 点功率。拖动后松手，提交一次变化。', node: 'power' },
  { id: 'shield', category: '新增元素', title: '添加防护按钮', code: '<button>防护</button>', description: '点击获得 5 护盾。也可以连在攻击之后，自动防护。', node: 'shield' },
  { id: 'clone', category: '节点变异', title: '再来一个攻击按钮', code: 'cloneNode()', description: '复制一个攻击按钮及其强化等级；两个按钮可以分别使用。', mutation: 'clone' },
  { id: 'upgrade', category: '节点变异', title: '强化一个按钮', code: 'setAttribute("power", +2)', description: '选择一个攻击或防护按钮，永久增加 2 点效果。', mutation: 'upgrade', target: true },
  { id: 'wire', category: '事件连接', title: '多一条事件路径', code: 'addEventListener()', description: '连接容量 +1。每次开始新回合获得 2 护盾。', rule: 'wire' },
  { id: 'echo', category: '全局规则', title: '第一声，双重回响', code: 'doubleDispatch()', description: '每回合第一次手动操作，其源元素额外执行一次效果，不重复传播连接。', rule: 'echo', unique: true },
  { id: 'cache', category: '全局规则', title: '缓存一层保护', code: 'cache: enabled', description: '每回合开始时获得 4 护盾，立即生效。', rule: 'cache', unique: true },
  { id: 'repair', category: '全局规则', title: '让连锁修复页面', code: 'onChain → repair(1)', description: '每次操作触发的前 3 个连锁事件，各修复 1 点完整度。', rule: 'repair', unique: true },
];

export function random(state) {
  state.seed = (Math.imul(state.seed, 1664525) + 1013904223) >>> 0;
  return state.seed / 4294967296;
}

export function rollRewards(state) {
  if (state.floor === 1) return ['overclock', 'mode', 'power'];
  const pool = REWARDS.filter(r => !(r.node && state.nodes.some(n => n.type === r.node)) && !(r.unique && state.rules.includes(r.rule)));
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random(state) * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 3).map(r => r.id);
}

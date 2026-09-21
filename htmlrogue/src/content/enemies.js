export const ENEMIES = [
  { name: '失效的链接', code: '404', tag: '<a href="/somewhere">', hp: 6, damage: 2, description: '这个链接没有通向任何地方。但它仍在占用你的页面。' },
  { name: '重复提交', code: '409', tag: '<form data-conflict>', hp: 19, damage: 4, description: '同一份请求被发送了两次。偶数回合反击额外 +2。', behavior: 'double' },
  { name: '样式冲突', code: 'CSS', tag: '<style !important>', hp: 27, damage: 5, description: '顽固的覆盖样式。每回合开始时获得 3 点护盾。', behavior: 'armor' },
  { name: '内存泄漏', code: 'OOM', tag: '<section data-leak>', hp: 34, damage: 4, description: '每过一回合，反击伤害就会增加 2。尽快处理。', behavior: 'leak' },
  { name: '请求超时', code: '408', tag: '<script async>', hp: 40, damage: 6, description: '每三个回合发起一次 11 点的超时反击。', behavior: 'timeout' },
  { name: '无限循环', code: '∞', tag: '<main while="true">', hp: 56, damage: 7, description: '最后一个敌对进程。每回合获得 3 护盾，反击每回合 +1。', behavior: 'boss' },
];

export function makeEnemy(floor) {
  const def = ENEMIES[floor - 1];
  return { ...def, maxHp: def.hp, armor: ['armor', 'boss'].includes(def.behavior) ? 3 : 0 };
}

export function enemyIntent(state) {
  const { enemy, turn } = state;
  if (enemy.behavior === 'double') return enemy.damage + (turn % 2 === 0 ? 2 : 0);
  if (enemy.behavior === 'leak') return enemy.damage + (turn - 1) * 2;
  if (enemy.behavior === 'timeout') return turn % 3 === 0 ? 11 : enemy.damage;
  if (enemy.behavior === 'boss') return enemy.damage + turn - 1;
  return enemy.damage;
}

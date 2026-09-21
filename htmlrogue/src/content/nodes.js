/** Definitions describe a kind of element; instances hold this run's mutable values. */
export const NODE_DEFS = {
  attack: { name: '攻击', tag: 'button', event: 'click', kind: 'button', description: '点击一次，向敌对页面发出清理请求。' },
  shield: { name: '防护', tag: 'button', event: 'click', kind: 'button', description: '生成 5 点护盾，抵消本回合的反击。' },
  overclock: { name: '超频开关', tag: 'input · checkbox', event: 'change', kind: 'checkbox', description: '开启：攻击 +2；敌方行动后损失 1 点完整度。' },
  mode: { name: '运行模式', tag: 'input · radio', event: 'change', kind: 'radio', description: '突击：攻击 +2。防守：每次攻击同时获得 3 护盾。' },
  power: { name: '功率分配', tag: 'input · range', event: 'change', kind: 'range', description: '攻击增加功率值；每次攻击获得「3 − 功率」护盾。松手才算一次操作。' },
};

export function createNode(type, id) {
  return { id, type, level: 0, value: type === 'mode' ? 'guard' : type === 'power' ? 1 : false, used: false };
}

export function attackPower(state, node) {
  let damage = 3 + node.level * 2;
  for (const item of state.nodes) {
    if (item.type === 'overclock' && item.value) damage += 2;
    if (item.type === 'mode' && item.value === 'burst') damage += 2;
    if (item.type === 'power') damage += Number(item.value);
  }
  return damage;
}

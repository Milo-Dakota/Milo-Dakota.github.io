/** Persistent element definitions; all per-run values live in instances. */
export const NODE_DEFS = {
  attack: { name: '直达请求', tag: 'button', event: 'execute', kind: 'button' },
  shield: { name: '临时防火墙', tag: 'button', event: 'execute', kind: 'button' },
  processor: { name: '折叠档案馆', tag: 'fieldset · radio', event: 'execute', kind: 'radio' },
  corrosion: { name: '后台锈蚀', tag: 'input · checkbox', event: 'tick', kind: 'checkbox' },
  batch: { name: '洪流提交', tag: 'input · range', event: 'execute', kind: 'range' },
  cache: { name: '缓存替身', tag: 'input · checkbox', event: 'absorb', kind: 'checkbox' },
  detonate: { name: '清算坏账', tag: 'button', event: 'execute', kind: 'button' },
};
export function createNode(type, id) {
  if (!NODE_DEFS[type]) throw new RangeError('Unknown node type');
  return { id, type, level: 0, value: type === 'processor' ? 'compress' : type === 'batch' ? 1 : false, used: false, status: '' };
}
export function executable(node) { return NODE_DEFS[node.type].kind !== 'checkbox'; }

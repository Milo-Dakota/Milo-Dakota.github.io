import { NODE_DEFS, executable } from '../content/nodes.js';
import { nodeSpec, blockedReason } from '../engine/node-rules.js';
import { el } from './dom.js';

export function nodeView(state, node, actions) {
  const def = NODE_DEFS[node.type], spec = nodeSpec(node);
  const locked = !['combat', 'ready'].includes(state.phase);
  const id = 'control-' + node.id;
  const section = el('section', { class: 'node' + (state.chain.includes(node.id) ? ' activated' : ''), 'aria-label': def.name });
  section.append(el('div', { class: 'node-meta' }, el('code', {}, '<' + def.tag + '>'), el('span', {}, '#' + node.id.slice(1) + ' · 等级 ' + (node.level + 1))));
  section.append(el('h3', { class: 'node-title' }, def.name));
  const controls = el('div', { class: 'node-controls' });
  if (def.kind === 'checkbox') {
    controls.append(el('label', { class: 'checkbox-label', for: id },
      el('input', { id, type: 'checkbox', checked: node.value, disabled: locked, onchange: event => actions.configure(node.id, event.target.checked) }),
      node.type === 'cache' ? '允许消耗数据保护页面' : '安排后台运行'));
    controls.append(el('p', { class: 'control-hint process-status' }, node.value ? node.status || '授权已开启' : '已关闭 · 切换免费'));
  }
  if (def.kind === 'radio') {
    controls.append(el('fieldset', { class: 'mode-group', disabled: locked }, el('legend', { class: 'sr-only' }, '档案处理模式'),
      ['compress', 'expand'].map(value => el('label', {}, el('input', {
        id: id + '-' + value, type: 'radio', name: node.id, checked: node.value === value,
        onchange: () => actions.configure(node.id, value)
      }), value === 'compress' ? '压缩：算力 → 数据' : '展开：数据 → 算力'))));
  }
  if (def.kind === 'range') {
    const output = el('output', { for: id, class: 'range-value' }, node.value + ' 数据 → ' + spec.amount + ' 伤害');
    controls.append(el('label', { class: 'range-label', for: id }, '投入数据', output));
    controls.append(el('input', { id, type: 'range', min: 1, max: spec.capacity, step: 1, value: node.value, disabled: locked,
      oninput: event => { output.textContent = event.target.value + ' 数据 → ' + Number(event.target.value) * 2 + ' 伤害（待确认）'; },
      onchange: event => actions.configure(node.id, Number(event.target.value)) }));
  }
  if (executable(node)) {
    const reason = blockedReason(state, node);
    const title = node.type === 'processor' ? '执行转换' : node.type === 'batch' ? '提交洪流' : def.name;
    controls.append(el('button', { id: id + '-execute', class: node.type === 'shield' ? 'shield-button' : 'attack-button',
      disabled: Boolean(reason), onclick: () => actions.act(node.id) }, title + (node.type === 'attack' || node.type === 'shield' || node.type === 'batch' ? ' · ' + spec.amount : '')));
    controls.append(el('span', { class: 'control-hint' }, reason || spec.cost.compute + ' 算力 / ' + spec.cost.data + ' 数据'));
  }
  section.append(controls, el('p', { class: 'node-description' }, spec.description));
  return section;
}

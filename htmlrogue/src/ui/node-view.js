import { NODE_DEFS, attackPower } from '../content/nodes.js';
import { el } from './dom.js';

export function nodeView(state, node, onAction) {
  const def = NODE_DEFS[node.type];
  const locked = state.phase !== 'combat' || state.ap === 0;
  const section = el('section', { class: `node${state.chain.includes(node.id) ? ' activated' : ''}`, 'aria-label': def.name });
  section.append(el('div', { class: 'node-meta' }, el('code', {}, `<${def.tag}>`), el('span', {}, `#${node.id.slice(1)}${node.level ? ` · +${node.level}` : ''}`)));
  const controls = el('div', { class: 'node-controls' });
  const controlId = `control-${node.id}`;
  if (def.kind === 'button') {
    const amount = node.type === 'attack' ? attackPower(state, node) : 5 + node.level * 2;
    controls.append(el('button', { id: controlId, class: node.type === 'attack' ? 'attack-button' : 'shield-button', disabled: locked || node.used, onclick: () => onAction(node.id) }, `${def.name} ${node.type === 'attack' ? '↗' : '+'} ${amount}`));
    controls.append(el('span', { class: 'control-hint' }, node.used ? '本回合已点击 · 仍可被连锁触发' : '点击消耗 1 操作点'));
  } else if (def.kind === 'checkbox') {
    controls.append(el('label', { class: 'checkbox-label', for: controlId }, el('input', { id: controlId, type: 'checkbox', checked: node.value, disabled: locked, onchange: event => onAction(node.id, event.target.checked) }), '超频', el('span', { class: 'control-value' }, node.value ? '已开启 / 攻击 +2' : '已关闭')));
  } else if (def.kind === 'radio') {
    const group = el('fieldset', { class: 'mode-group', disabled: locked }, el('legend', { class: 'sr-only' }, '运行模式'));
    for (const [value, label] of [['burst', '突击 / 攻击 +2'], ['guard', '防守 / 护盾 +3']]) {
      group.append(el('label', {}, el('input', { id: `${controlId}-${value}`, type: 'radio', name: node.id, value, checked: node.value === value, onchange: () => onAction(node.id, value) }), label));
    }
    controls.append(group);
  } else {
    const output = el('output', { for: controlId, class: 'range-value' }, `攻击 +${node.value} / 护盾 +${3 - node.value}`);
    controls.append(el('label', { class: 'range-label', for: controlId }, '功率分配', output));
    controls.append(el('input', { id: controlId, type: 'range', min: 0, max: 3, step: 1, value: node.value, disabled: locked,
      oninput: event => { output.textContent = `攻击 +${event.target.value} / 护盾 +${3 - event.target.value}（松手提交）`; },
      onchange: event => onAction(node.id, Number(event.target.value)) }));
    controls.append(el('div', { class: 'range-extents' }, el('span', {}, '← 防护优先'), el('span', {}, '攻击优先 →')));
  }
  section.append(controls, el('p', { class: 'node-description' }, def.description));
  return section;
}

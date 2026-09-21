import { $, el, replace } from './dom.js';
import { NODE_DEFS, executable } from '../content/nodes.js';
import { canWire } from '../engine/connections.js';
function label(state, id) { const n = state.nodes.find(n => n.id === id); return NODE_DEFS[n.type].name + ' #' + id.slice(1); }
export function renderWires(state, actions) {
  $('#wire-count').textContent = state.connections.length + ' / ' + state.wireCapacity + ' CONNECTIONS';
  replace('#connections', state.connections.length ? state.connections.map((wire, index) => el('div', { class: 'connection' },
    el('span', {}, label(state, wire.from)), el('span', { class: 'wire-arrow' }, '→'), el('span', {}, label(state, wire.to)),
    el('button', { class: 'text-button remove-wire', disabled: !canWire(state), 'aria-label': '移除 ' + label(state, wire.from) + ' 到 ' + label(state, wire.to) + ' 的连接',
      onclick: () => actions.disconnect(index) }, '×'))) :
    el('div', { class: 'empty-wires' }, el('span', {}, '○ ─ ─ ─ → ○'),
      el('p', {}, state.wireCapacity ? '选择两个主动控件，预排一段工作流。' : '获得「预排一段工作流」后解锁。先试试不同控件的独立工作。')));
  const nodes = state.nodes.filter(executable);
  $('#wire-form').hidden = !canWire(state) || state.connections.length >= state.wireCapacity || nodes.length < 2;
  replace('#wire-source', nodes.map(n => el('option', { value: n.id }, label(state, n.id))));
  replace('#wire-target', nodes.map(n => el('option', { value: n.id }, label(state, n.id))));
  if (nodes[1]) $('#wire-target').value = nodes[1].id;
  $('#wire-help').textContent = '自动执行也正常付费；资源不足则停止该分支。配置变化不触发连锁，每条链最多 20 节点。首次执行前或层间可改接。';
}

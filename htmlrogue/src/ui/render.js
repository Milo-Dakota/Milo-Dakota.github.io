import { $, el, replace } from './dom.js';
import { nodeView } from './node-view.js';
import { renderEncounter, renderForecast } from './encounter-view.js';
import { renderResources } from './resources-view.js';
import { renderRewards } from './rewards-view.js';
import { renderWires } from './connections-view.js';

export function render(state, actions) {
  const focusId = document.activeElement?.id;
  replace('#route',
    el('div', { class: 'route-stop current' }, el('span', { class: 'route-number' }, '∞'), el('span', {}, '无尽探索')),
    el('span', {}, '深度 ' + state.floor),
    el('span', {}, '已清理 ' + (state.floor - (['reward', 'ready'].includes(state.phase) ? 0 : 1)) + ' 页'),
    el('span', { class: 'route-region' }, state.enemy.region));
  $('#floor-label').textContent = 'PAGE ' + String(state.floor).padStart(2, '0') + ' / ∞';
  renderForecast(state);
  renderEncounter(state, actions);
  $('#node-count').textContent = state.nodes.length + ' ELEMENTS';
  replace('#nodes', state.nodes.map(node => nodeView(state, node, actions)));
  replace('#turn-bar', el('span', {}, state.phase === 'combat'
    ? '回合 ' + state.turn + ' · 算力 ' + state.compute + ' / 数据 ' + state.data
    : state.phase === 'ready' ? '可预设后台与模式，下一页开始生效。' : '本页操作已结束'),
    state.phase === 'combat' ? el('button', { id: 'end-turn', class: 'primary', onclick: actions.endTurn }, '结束回合 →') :
    state.phase === 'ready' ? el('button', { id: 'next-floor', class: 'primary', onclick: actions.nextFloor }, '进入下一页 →') : null);
  renderRewards(state, actions);
  renderWires(state, actions);
  renderResources(state);
  replace('#trace', state.log.slice(0, 9).map(item => el('li', { class: item.kind },
    el('span', { class: 'trace-number' }, String(item.id).padStart(2, '0')), el('span', {}, item.text))));
  if (focusId) document.getElementById(focusId)?.focus({ preventScroll: true });
}

import { $, el, replace, meter } from './dom.js';
import { nodeView } from './node-view.js';
import { ENEMIES, enemyIntent } from '../content/enemies.js';
import { NODE_DEFS } from '../content/nodes.js';
import { REWARDS } from '../content/rewards.js';
import { canWire } from '../engine/game.js';

const ruleNames = { echo: '双重回响', cache: '缓存保护', repair: '连锁修复' };
function label(state, id) { const n = state.nodes.find(n => n.id === id); return `${NODE_DEFS[n.type].name} #${id.slice(1)}`; }

export function render(state, actions) {
  // Retain keyboard focus across deterministic DOM updates.
  const focusId = document.activeElement?.id;
  replace('#route', ENEMIES.map((enemy, i) => el('div', { class: `route-stop ${i + 1 === state.floor ? 'current' : i + 1 < state.floor ? 'complete' : ''}`, 'aria-current': i + 1 === state.floor ? 'step' : null },
    el('span', { class: 'route-number' }, i + 1 < state.floor ? '✓' : String(i + 1).padStart(2, '0')), el('span', {}, enemy.name), i === 5 ? el('small', {}, '最终页面') : null)));
  $('#floor-label').textContent = `PAGE ${String(state.floor).padStart(2, '0')} / 06`;
  renderEncounter(state, actions);
  $('#node-count').textContent = `${String(state.nodes.length).padStart(2, '0')} ELEMENT${state.nodes.length > 1 ? 'S' : ''}`;
  replace('#nodes', state.nodes.map(node => nodeView(state, node, actions.act)));
  replace('#turn-bar', el('span', {}, state.phase === 'combat' ? `回合 ${state.turn} · 剩余 ${state.ap} 次操作` : state.phase === 'ready' ? '构筑已更新。准备好就继续。' : '本页操作已结束'),
    state.phase === 'combat' ? el('button', { id: 'end-turn', class: 'primary', onclick: actions.endTurn }, '结束回合 →') :
      state.phase === 'ready' ? el('button', { id: 'next-floor', class: 'primary', onclick: actions.nextFloor }, '进入下一页 →') : null);
  renderRewards(state, actions);
  renderWires(state, actions);
  const hpLabel = el('div', { class: 'hp-label' }, el('span', {}, '页面完整度'), el('strong', {}, `${state.hp}`, el('small', {}, ` / ${state.maxHp}`)));
  replace('#system', hpLabel, meter(state.hp, state.maxHp, '页面完整度', state.hp < 12 ? 'danger' : ''),
    el('div', { class: 'system-row' }, el('span', {}, '当前护盾'), el('strong', {}, `${state.shield}`)),
    el('div', { class: 'system-row' }, el('span', {}, '可用操作'), el('span', { class: 'ap-dots', 'aria-label': `${state.phase === 'combat' ? state.ap : 0} 次` }, [0, 1, 2].map(i => el('span', { class: i < state.ap && state.phase === 'combat' ? 'filled' : '' })))),
    el('div', { class: 'rules-list' }, el('span', { class: 'eyebrow' }, '全局规则'), state.rules.length + state.wireBonus === 0 ? el('p', { class: 'fine-print' }, '一张白纸，等待你的改动。') :
      el('ul', {}, state.rules.map(rule => el('li', {}, ruleNames[rule])), state.wireBonus ? el('li', {}, `连接缓冲 · 每回合 +${state.wireBonus * 2} 护盾`) : null)));
  replace('#trace', state.log.slice(0, 9).map(item => el('li', { class: item.kind }, el('span', { class: 'trace-number' }, String(item.id).padStart(2, '0')), el('span', {}, item.text))));
  if (focusId) document.getElementById(focusId)?.focus({ preventScroll: true });
}

function renderEncounter(state, actions) {
  if (state.phase === 'won' || state.phase === 'lost') {
    const won = state.phase === 'won';
    replace('#encounter', el('div', { class: `ending ${won ? 'won' : 'lost'}` }, el('span', { class: 'eyebrow' }, won ? '200 / ALL CLEAR' : '503 / PAGE UNRESPONSIVE'),
      el('h2', { id: 'encounter-title', tabindex: '-1' }, won ? '这个网页，是你的作品了。' : '页面暂时停止了响应。'),
      el('p', {}, won ? `从一个按钮到 ${state.nodes.length} 个元素，你清理了全部六层。` : `你抵达了第 ${state.floor} 层。试试更多防护，或让一次动作触发更多元素。`),
      el('p', { class: 'ending-stats mono' }, `${state.stats.actions} 次操作 / ${state.stats.events} 个事件 / 最长 ${state.stats.maxChain} 节点连锁`),
      el('button', { class: 'primary', onclick: actions.restart }, '再构筑一张网页 ↗')));
    return;
  }
  const cleared = state.phase !== 'combat';
  replace('#encounter', el('div', { class: `enemy-object${cleared ? ' cleared' : ''}` },
    el('div', { class: 'enemy-top' }, el('code', {}, state.enemy.tag), el('span', { class: 'enemy-status' }, cleared ? '✓ 已清理' : '● 敌对元素')),
    el('div', { class: 'enemy-title-row' }, el('h2', { id: 'encounter-title' }, state.enemy.name), el('span', { class: 'error-code' }, state.enemy.code)),
    el('p', { class: 'enemy-description' }, state.enemy.description),
    el('div', { class: 'enemy-meter' }, meter(state.enemy.hp, state.enemy.maxHp, '敌对元素剩余完整度', 'enemy-progress'), el('span', { class: 'mono' }, `${state.enemy.hp} / ${state.enemy.maxHp}`)),
    el('div', { class: 'enemy-intent' }, el('span', {}, cleared ? '页面已恢复正常。选择改动，继续深入。' : `↳ 结束回合后：反击 ${enemyIntent(state)} 点`), !cleared && state.enemy.armor ? el('span', {}, `护盾 ${state.enemy.armor}`) : null)));
}

function renderRewards(state, actions) {
  $('#reward-section').hidden = state.phase !== 'reward';
  replace('#reward-target');
  replace('#rewards', state.rewards.map(id => {
    const reward = REWARDS.find(r => r.id === id);
    return el('button', { class: 'reward', onclick: () => {
      if (!reward.target) return actions.chooseReward(id);
      replace('#reward-target', el('p', {}, '选择要强化的按钮：'), state.nodes.filter(n => ['attack', 'shield'].includes(n.type)).map(n => el('button', { onclick: () => actions.chooseReward(id, n.id) }, `${label(state, n.id)} → +2`)));
      $('#reward-target button')?.focus();
    } }, el('span', { class: 'reward-category' }, reward.category), el('code', {}, reward.code), el('strong', {}, reward.title), el('span', { class: 'reward-description' }, reward.description), el('span', { class: 'reward-pick' }, '保留这个改动 ↗'));
  }));
}

function renderWires(state, actions) {
  $('#wire-count').textContent = `${state.connections.length} / ${state.wireCapacity} CONNECTIONS`;
  replace('#connections', state.connections.length ? state.connections.map((wire, index) => el('div', { class: 'connection' },
    el('span', {}, label(state, wire.from), el('small', {}, `.${NODE_DEFS[state.nodes.find(n => n.id === wire.from).type].event}`)), el('span', { class: 'wire-arrow' }, '→'),
    el('span', {}, label(state, wire.to), el('small', {}, '.click')), el('button', { class: 'text-button remove-wire', disabled: !canWire(state), 'aria-label': `移除 ${label(state, wire.from)} 到 ${label(state, wire.to)} 的连接`, onclick: () => actions.disconnect(index) }, '×'))) :
    el('div', { class: 'empty-wires' }, el('span', {}, '○ ─ ─ ─ → ○'), el('p', {}, state.wireCapacity ? '选择两个元素，给这张网页接上第一条线。' : '先清理第一页。新元素会带来第一条连接。')));
  $('#wire-form').hidden = !canWire(state) || state.connections.length >= state.wireCapacity || state.nodes.length < 2;
  replace('#wire-source', state.nodes.map(n => el('option', { value: n.id }, `${label(state, n.id)} · ${NODE_DEFS[n.type].event}`)));
  replace('#wire-target', state.nodes.filter(n => NODE_DEFS[n.type].kind === 'button').map(n => el('option', { value: n.id }, label(state, n.id))));
  const source = state.nodes.find(n => n.id !== $('#wire-target').value);
  if (source) $('#wire-source').value = source.id;
  $('#wire-help').textContent = state.wireCapacity ? '每回合首次操作前可改接。同一元素每条连锁只执行一次；最多处理 20 个节点。' : '不需要写代码，也不需要了解事件语法。';
}

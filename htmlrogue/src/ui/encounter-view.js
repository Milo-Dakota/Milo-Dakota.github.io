import { el, replace, meter } from './dom.js';
import { enemyIntent, mechanismText, FORMULAS } from '../content/enemies.js';

export function renderEncounter(state, actions) {
  if (state.phase === 'lost') {
    replace('#encounter', el('div', { class: 'ending lost' }, el('span', { class: 'eyebrow' }, '503 / PAGE UNRESPONSIVE'),
      el('h2', { id: 'encounter-title', tabindex: '-1' }, '页面暂时停止了响应。'),
      el('p', {}, `抵达第 ${state.floor} 页，已清理 ${state.floor - 1} 页。网页没有尽头，下一次让机器走得更远。`),
      el('p', { class: 'ending-stats mono' }, `${state.stats.actions} 次操作 / ${state.stats.events} 个事件 / 最长 ${state.stats.maxChain} 节点连锁`),
      el('button', { class: 'primary', onclick: actions.restart }, '再构筑一张网页 ↗')));
    return;
  }
  const cleared = state.phase !== 'combat';
  const enemy = state.enemy;
  replace('#encounter', el('div', { class: `enemy-object${cleared ? ' cleared' : ''}` },
    el('div', { class: 'enemy-top' }, el('code', {}, enemy.tag), el('span', { class: 'enemy-status' }, cleared ? '✓ 已清理' : '● 敌对元素')),
    el('div', { class: 'enemy-title-row' }, el('h2', { id: 'encounter-title' }, enemy.name), el('span', { class: 'error-code' }, enemy.code)),
    el('p', { class: 'enemy-description' }, `${enemy.region} / ${enemy.flavor}`),
    el('p', { class: 'mechanism-description' }, mechanismText(enemy)),
    el('p', { class: 'corrosion-status' }, '腐蚀 ' + enemy.corrosion + ' · 敌方行动前穿透结算，随后减 1'),
    el('div', { class: 'enemy-meter' }, meter(enemy.hp, enemy.maxHp, '敌对元素剩余完整度', 'enemy-progress'), el('span', { class: 'mono' }, `${enemy.hp} / ${enemy.maxHp}`)),
    el('div', { class: 'enemy-intent' }, el('span', {}, cleared ? '页面已恢复正常。选择改动，继续深入。' : `↳ 结束回合后：反击 ${enemyIntent(state)} 点`),
      !cleared ? el('span', {}, `基础攻击 ${enemy.damage} · 护盾 ${enemy.armor}`) : null)));
}

export function renderForecast(state) {
  const next = state.nextEnemy;
  replace('#forecast', el('span', { class: 'eyebrow' }, `NEXT / 第 ${next.floor} 页`),
    el('h3', {}, next.name), el('p', {}, `生命 ${next.maxHp} · 基础攻击 ${next.damage}`),
    el('p', {}, mechanismText(next)), el('small', {}, '已确定，不会随奖励选择改变。'));
}

// Mounted once so unfolding the formula reference survives combat actions.
export function mountFormulaReference() {
  replace('#formula-reference', el('summary', {}, 'Boss 数值如何计算？'),
    el('p', {}, 'n 为页数，t 为本场回合（从 1 开始），⌊ ⌋ 表示向下取整。'),
    FORMULAS.map(formula => el('p', { class: 'mono' }, formula)),
    el('p', {}, '每页等概率抽取一个机制，不组合。成长：反击 A(n) + (t − 1) × G(n)。护盾：每回合重置为 S(n)。名字与区域只影响风味。'));
}

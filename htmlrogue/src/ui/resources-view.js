import { el, replace, meter } from './dom.js';
const ruleNames = { buffer: '备用防线 · 回合开始 +4 护盾', prefetch: '预取回声 · 每回合 +1 数据' };
export function renderResources(state) {
  replace('#system',
    el('div', { class: 'hp-label' }, el('span', {}, '页面完整度'), el('strong', {}, state.hp, el('small', {}, ' / ' + state.maxHp))),
    meter(state.hp, state.maxHp, '页面完整度', state.hp < 12 ? 'danger' : ''),
    el('div', { class: 'resource-pair' },
      el('div', {}, el('span', {}, '算力'), el('strong', {}, state.compute), el('small', {}, '回合结束清空')),
      el('div', {}, el('span', {}, '数据'), el('strong', {}, state.data), el('small', {}, '跨回合保留 · 换页清空'))),
    el('div', { class: 'system-row' }, el('span', {}, '当前护盾'), el('strong', {}, state.shield)),
    el('div', { class: 'supply-preview' }, el('span', { class: 'eyebrow' }, 'NEXT INPUT'),
      el('p', {}, '下次补给：' + state.nextSupply.compute + ' 算力 / ' + (state.nextSupply.data + (state.rules.includes('prefetch') ? 1 : 0)) + ' 数据'),
      el('small', {}, '先补给，再支付已开启后台进程的费用。')),
    el('div', { class: 'rules-list' }, el('span', { class: 'eyebrow' }, '全局规则'),
      state.rules.length + state.wireBonus === 0 ? el('p', { class: 'fine-print' }, '把有限的输入，变成自己的工作流。') :
      el('ul', {}, state.rules.map(rule => el('li', {}, ruleNames[rule])),
        state.wireBonus ? el('li', {}, '连接缓冲 · 每回合 +' + state.wireBonus * 2 + ' 护盾') : null)));
}

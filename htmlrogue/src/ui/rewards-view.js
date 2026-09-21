import { $, el, replace } from './dom.js';
import { REWARDS } from '../content/rewards.js';
import { NODE_DEFS } from '../content/nodes.js';
import { nodeSpec } from '../engine/node-rules.js';
export function renderRewards(state, actions) {
  $('#reward-section').hidden = state.phase !== 'reward';
  replace('#reward-target');
  replace('#rewards', state.rewards.map(id => {
    const reward = REWARDS.find(r => r.id === id);
    return el('button', { class: 'reward', onclick: () => {
      if (!reward.target) return actions.chooseReward(id);
      replace('#reward-target', el('p', {}, '选择改写目标（展示升级后的规则）：'), state.nodes.map(node =>
        el('button', { class: 'upgrade-option', onclick: () => actions.chooseReward(id, node.id) },
          el('strong', {}, NODE_DEFS[node.type].name + ' #' + node.id.slice(1)),
          el('span', {}, nodeSpec({ ...node, level: node.level + 1 }).description))));
      $('#reward-target button')?.focus();
    } }, el('span', { class: 'reward-category' }, reward.category), el('code', {}, reward.code),
      el('strong', {}, reward.title), el('span', { class: 'reward-description' }, reward.description),
      el('span', { class: 'reward-pick' }, '保留这个改动 ↗'));
  }));
}

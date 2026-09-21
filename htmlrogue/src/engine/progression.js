import { createNode } from '../content/nodes.js';
import { REWARDS, rollRewards } from '../content/rewards.js';
import { record } from './log.js';

export function finishEncounter(state) {
  if (state.phase !== 'combat' || state.enemy.hp > 0) return false;
  state.phase = 'reward';
  state.compute = 0; state.shield = 0;
  state.rewards = rollRewards(state);
  state.hp = Math.min(state.maxHp, state.hp + 4);
  record(state, '第 ' + state.floor + ' 页清理完成 → 恢复 4 完整度。下一页重置数据。', 'heal');
  return true;
}
export function chooseReward(state, id, targetId) {
  if (state.phase !== 'reward' || !state.rewards.includes(id)) return false;
  const reward = REWARDS.find(r => r.id === id);
  if (!reward) return false;
  if (reward.target) {
    const target = state.nodes.find(n => n.id === targetId);
    if (!target) return false;
    target.level++;
  } else if (reward.node) state.nodes.push(createNode(reward.node, 'n' + state.nextId++));
  else if (reward.rule === 'wire') { state.wireCapacity++; state.wireBonus++; }
  else if (reward.rule === 'patch') { state.maxHp += 4; state.hp = Math.min(state.maxHp, state.hp + 4); }
  else state.rules.push(reward.rule);
  state.phase = 'ready'; state.rewards = [];
  record(state, '永久改动 → ' + reward.title, 'heal');
  return true;
}

import { createNode, NODE_DEFS } from '../content/nodes.js';
import { makeEnemy, enemyIntent, ENEMIES } from '../content/enemies.js';
import { REWARDS, rollRewards } from '../content/rewards.js';
import { MAX_AP, record } from './state.js';
import { dispatch } from './events.js';

export function act(state, id, value) {
  const node = state.nodes.find(n => n.id === id);
  if (state.phase !== 'combat' || state.ap <= 0 || !node || (NODE_DEFS[node.type].kind === 'button' && node.used)) return false;
  if (node.type === 'overclock' && (typeof value !== 'boolean' || value === node.value)) return false;
  if (node.type === 'mode' && (!['guard', 'burst'].includes(value) || value === node.value)) return false;
  if (node.type === 'power' && (!Number.isInteger(Number(value)) || Number(value) < 0 || Number(value) > 3 || Number(value) === node.value)) return false;
  if (NODE_DEFS[node.type].kind !== 'button') node.value = node.type === 'power' ? Number(value) : value;
  else node.used = true;
  state.ap--;
  state.stats.actions++;
  dispatch(state, node);
  if (state.enemy.hp <= 0) {
    state.shield = 0;
    if (state.floor === ENEMIES.length) {
      state.phase = 'won';
      record(state, '所有敌对页面已清理。这个网页，已经是你的作品了。', 'heal');
    } else {
      state.phase = 'reward';
      state.rewards = rollRewards(state);
      state.hp = Math.min(state.maxHp, state.hp + 4);
      record(state, `第 ${state.floor} 层清理完成 → 修复 4 完整度，选择一项永久改动。`, 'heal');
    }
  }
  return true;
}

function startTurn(state) {
  state.ap = MAX_AP;
  state.firstAction = true;
  state.nodes.forEach(n => { n.used = false; });
  state.shield = (state.rules.includes('cache') ? 4 : 0) + state.wireBonus * 2;
  state.enemy.armor = ['armor', 'boss'].includes(state.enemy.behavior) ? 3 : 0;
}

export function endTurn(state) {
  if (state.phase !== 'combat') return false;
  const hit = enemyIntent(state);
  const blocked = Math.min(hit, state.shield);
  const heat = state.nodes.filter(n => n.type === 'overclock' && n.value).length;
  state.hp = Math.max(0, state.hp - (hit - blocked) - heat);
  record(state, `敌方反击 ${hit} → 护盾抵消 ${blocked}，损失 ${hit - blocked}${heat ? ` + ${heat} 超频` : ''} 完整度`, 'enemy');
  state.shield = 0;
  state.chain = [];
  if (state.hp <= 0) { state.phase = 'lost'; record(state, '页面停止响应。可以带着这次的经验重新开始。', 'enemy'); }
  else { state.turn++; startTurn(state); record(state, `回合 ${state.turn} → 操作点已恢复`, 'system'); }
  return true;
}

export function chooseReward(state, id, targetId) {
  if (state.phase !== 'reward' || !state.rewards.includes(id)) return false;
  const reward = REWARDS.find(r => r.id === id);
  if (!reward) return false;
  if (reward.target) {
    const target = state.nodes.find(n => n.id === targetId && ['attack', 'shield'].includes(n.type));
    if (!target) return false;
    target.level++;
  } else if (reward.node) {
    const node = createNode(reward.node, `n${state.nextId++}`);
    state.nodes.push(node);
    if (state.floor === 1) {
      state.wireCapacity = 1;
      state.connections.push({ from: node.id, to: state.nodes[0].id });
      record(state, '赠送第一条连接 → 新元素变化时，自动攻击。可在回合开始前改接。', 'event');
    }
  } else if (reward.mutation === 'clone') {
    const original = state.nodes.filter(n => n.type === 'attack').sort((a, b) => b.level - a.level)[0];
    const node = createNode('attack', `n${state.nextId++}`);
    node.level = original.level;
    state.nodes.push(node);
  } else if (reward.rule === 'wire') { state.wireCapacity++; state.wireBonus++; }
  else state.rules.push(reward.rule);
  record(state, `永久改动 → ${reward.title}`, 'heal');
  state.phase = 'ready';
  state.rewards = [];
  return true;
}

export function nextFloor(state) {
  if (state.phase !== 'ready') return false;
  state.floor++;
  state.turn = 1;
  state.enemy = makeEnemy(state.floor);
  state.phase = 'combat';
  state.chain = [];
  startTurn(state);
  record(state, `进入第 ${state.floor} 层 → ${state.enemy.name}`, 'system');
  return true;
}

export function canWire(state) {
  return state.phase === 'ready' || (state.phase === 'combat' && state.ap === MAX_AP);
}

export function connect(state, from, to) {
  if (!canWire(state) || state.connections.length >= state.wireCapacity || from === to) return false;
  if (!state.nodes.some(n => n.id === from) || !state.nodes.some(n => n.id === to && NODE_DEFS[n.type].kind === 'button')) return false;
  if (state.connections.some(c => c.from === from && c.to === to)) return false;
  state.connections.push({ from, to });
  record(state, '已建立连接 → 下次操作即可触发。', 'event');
  return true;
}

export function disconnect(state, index) {
  if (!canWire(state) || !Number.isInteger(index) || index < 0 || index >= state.connections.length) return false;
  state.connections.splice(index, 1);
  return true;
}

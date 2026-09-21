import { createState } from './engine/state.js';
import * as game from './engine/game.js';
import { render } from './ui/render.js';
import { $ } from './ui/dom.js';

let state = createState();
function update(operation, ...args) {
  const oldPhase = state.phase;
  const changed = operation(state, ...args);
  if (!changed) return false;
  render(state, actions);
  if (state.phase === 'reward' && oldPhase !== 'reward') {
    $('#reward-section').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    $('#rewards button')?.focus({ preventScroll: true });
  }
  if (['won', 'lost'].includes(state.phase) && oldPhase !== state.phase) $('#encounter-title').focus();
  if (state.phase === 'ready' && oldPhase === 'reward') $('#next-floor').focus({ preventScroll: true });
  return true;
}
const actions = {
  act: (id, value) => update(game.act, id, value),
  endTurn: () => update(game.endTurn),
  chooseReward: (id, target) => update(game.chooseReward, id, target),
  nextFloor: () => { if (update(game.nextFloor)) $('#encounter').scrollIntoView({ behavior: 'smooth', block: 'start' }); },
  disconnect: index => update(game.disconnect, index),
  restart: () => $('#restart-dialog').showModal(),
};
$('#restart').addEventListener('click', actions.restart);
$('#restart-dialog').addEventListener('close', event => {
  if (event.target.returnValue !== 'restart') return;
  state = createState();
  render(state, actions);
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
$('#wire-form').addEventListener('submit', event => {
  event.preventDefault();
  if (!update(game.connect, $('#wire-source').value, $('#wire-target').value)) $('#wire-help').textContent = '请选择不同的起点与终点，同一条连接不能重复。';
});
render(state, actions);

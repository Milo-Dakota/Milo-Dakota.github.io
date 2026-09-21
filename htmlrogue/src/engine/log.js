export function record(state, text, kind = 'system') {
  state.log.unshift({ id: ++state.logId, text, kind });
  state.log = state.log.slice(0, 45);
}

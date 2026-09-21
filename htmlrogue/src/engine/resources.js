/** Supply randomness is independent from both encounters and rewards. */
export function supplyAt(seed, tick) {
  let h = Math.imul((seed ^ tick) >>> 0, 0x45d9f3b);
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b) >>> 0;
  const compute = 3 + h % 3;
  return { compute, data: 6 - compute };
}
export function canPay(state, cost) {
  return state.compute >= cost.compute && state.data >= cost.data;
}
export function pay(state, cost) {
  if (!canPay(state, cost)) return false;
  state.compute -= cost.compute;
  state.data -= cost.data;
  return true;
}
export function replenish(state) {
  state.supplyTick++;
  state.supply = supplyAt(state.resourceSeed, state.supplyTick);
  state.compute = state.supply.compute;
  state.data += state.supply.data + (state.rules.includes('prefetch') ? 1 : 0);
  state.nextSupply = supplyAt(state.resourceSeed, state.supplyTick + 1);
}

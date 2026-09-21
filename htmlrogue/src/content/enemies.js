import { enemyIdentity } from './enemy-names.js';

export const MECHANISMS = ['growth', 'shield'];
export const FORMULAS = [
  '生命 H(n) = 6 + 8 × (n − 1)',
  '基础攻击 A(n) = 2 + ⌊(n − 1) / 2⌋',
  '攻击成长 G(n) = 1 + ⌊(n − 1) / 6⌋',
  '刷新护盾 S(n) = 1 + ⌊(n − 1) / 4⌋',
];

export function enemyStats(floor) {
  if (!Number.isSafeInteger(floor) || floor < 1) throw new RangeError('Floor must be a positive safe integer');
  return { hp: 6 + 8 * (floor - 1), damage: 2 + Math.floor((floor - 1) / 2),
    growth: 1 + Math.floor((floor - 1) / 6), shield: 1 + Math.floor((floor - 1) / 4) };
}

// A separate deterministic stream keeps previews stable regardless of reward rolls.
function floorHash(seed, floor) {
  let value = (seed ^ Math.imul(floor, 0x9e3779b9)) >>> 0;
  value = Math.imul(value ^ (value >>> 16), 0x85ebca6b);
  value = Math.imul(value ^ (value >>> 13), 0xc2b2ae35);
  return (value ^ (value >>> 16)) >>> 0;
}

export function makeEnemy(floor, seed = 0, mechanism) {
  const variant = floorHash(seed, floor);
  mechanism ??= MECHANISMS[variant % MECHANISMS.length];
  if (!MECHANISMS.includes(mechanism)) throw new RangeError('Unknown enemy mechanism');
  const stats = enemyStats(floor);
  return { ...enemyIdentity(floor, mechanism, variant >>> 1), floor, mechanism,
    hp: stats.hp, maxHp: stats.hp, damage: stats.damage,
    magnitude: mechanism === 'growth' ? stats.growth : stats.shield,
    armor: mechanism === 'shield' ? stats.shield : 0, corrosion: 0 };
}

export function mechanismText(enemy) {
  return enemy.mechanism === 'growth'
    ? `攻击成长：每回合攻击 +${enemy.magnitude}，首回合从 ${enemy.damage} 开始。`
    : `刷新护盾：开战及每回合开始时，护盾重置为 ${enemy.magnitude}，不累积。`;
}

export function enemyIntent({ enemy, turn }) {
  return enemy.damage + (enemy.mechanism === 'growth' ? (turn - 1) * enemy.magnitude : 0);
}

export function refreshEnemy(enemy) {
  enemy.armor = enemy.mechanism === 'shield' ? enemy.magnitude : 0;
}

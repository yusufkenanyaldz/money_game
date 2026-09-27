import { CREATURES, HARMONY_LEVELS, MILESTONES } from '../data/creatures';
import { SCROLL_BY_ID } from '../data/scrolls';
import { Decimal, type BuffId, type GameState } from './state';

export const CIRCLE_COST = 2500;
export const TAP_UPGRADE_BASE = 15;
export const TAP_UPGRADE_RATIO = 1.6;
export const BASE_CRIT_CHANCE = 0.05;
export const BASE_CRIT_MULT = 10;
export const BASE_OFFLINE_EFF = 0.5;
export const BASE_OFFLINE_CAP_H = 2;
/** Bu süreden uzun aralar çevrimdışı sayılır (sn). */
export const OFFLINE_THRESHOLD = 60;
export const HUMA_INTERVAL: [number, number] = [90, 240];
export const HUMA_VISIBLE = 12;
/** Kütüphane, bu kadar Cüce Madenci enkazı kazınca açılır. */
export const LIBRARY_DWARF_COUNT = 10;

// ---- Parşömen etkileri ----

/** Alınmış parşömenlerin toplu etkisi. Parşömenler yalnızca eklendiği için sayıya göre önbelleklenir. */
interface ScrollSummary {
  creature: number[];
  global: number;
  resonance: number;
  tap: number;
  critChance: number;
  critMult: number;
  offlineEff: number;
  offlineCapH: number;
  humaFreq: number;
  humaPower: number;
}

const summaryCache = new WeakMap<Set<string>, { size: number; sum: ScrollSummary }>();

function scrollSummary(s: GameState): ScrollSummary {
  const hit = summaryCache.get(s.scrolls);
  if (hit && hit.size === s.scrolls.size) return hit.sum;
  const sum: ScrollSummary = {
    creature: CREATURES.map(() => 1),
    global: 1,
    resonance: 0,
    tap: 1,
    critChance: 0,
    critMult: 1,
    offlineEff: 0,
    offlineCapH: 0,
    humaFreq: 1,
    humaPower: 1,
  };
  for (const id of s.scrolls) {
    const e = SCROLL_BY_ID.get(id)?.effect;
    if (!e) continue;
    switch (e.kind) {
      case 'creature': sum.creature[e.creature] *= e.mult; break;
      case 'global': sum.global *= e.mult; break;
      case 'resonance': sum.resonance += e.pct; break;
      case 'tap': sum.tap *= e.mult; break;
      case 'critChance': sum.critChance += e.add; break;
      case 'critMult': sum.critMult *= e.mult; break;
      case 'offlineEff': sum.offlineEff += e.add; break;
      case 'offlineCap': sum.offlineCapH += e.hours; break;
      case 'humaFreq': sum.humaFreq *= e.mult; break;
      case 'humaPower': sum.humaPower *= e.mult; break;
    }
  }
  summaryCache.set(s.scrolls, { size: s.scrolls.size, sum });
  return sum;
}

// ---- Yaratıklar ----

export function creatureCost(i: number, owned: number, amount = 1): Decimal {
  const c = CREATURES[i];
  return Decimal.sumGeometricSeries(amount, c.baseCost, c.costRatio, owned);
}

export function maxAffordable(i: number, owned: number, mana: Decimal): number {
  const c = CREATURES[i];
  return Decimal.affordGeometricSeries(mana, c.baseCost, c.costRatio, owned).toNumber();
}

export function milestonesReached(owned: number): number {
  let n = 0;
  for (const m of MILESTONES) if (owned >= m) n++;
  return n;
}

export function nextMilestone(owned: number): number | undefined {
  return MILESTONES.find((m) => m > owned);
}

export function harmonyLevel(s: GameState): number {
  const min = Math.min(...s.creatures);
  let n = 0;
  for (const h of HARMONY_LEVELS) if (min >= h) n++;
  return n;
}

export function nextHarmony(s: GameState): number | undefined {
  return HARMONY_LEVELS[harmonyLevel(s)];
}

export function buffMult(s: GameState, id: BuffId): number {
  let m = 1;
  for (const b of s.buffs) if (b.id === id) m *= b.mult;
  return m;
}

/** Tek bir türün, genel çarpanlar hariç kendi çarpanı. */
export function creatureMult(s: GameState, i: number): number {
  return 2 ** milestonesReached(s.creatures[i]) * scrollSummary(s).creature[i];
}

/** Tüm üretime uygulanan kalıcı çarpan. */
export function globalMult(s: GameState): number {
  return 2 ** harmonyLevel(s) * scrollSummary(s).global;
}

/** Bir türün tanesi başına saniyelik üretimi (geçici etkiler dahil). */
export function perUnitProduction(s: GameState, i: number, withBuffs = true): Decimal {
  const b = withBuffs ? buffMult(s, 'huma-uretim') : 1;
  return new Decimal(CREATURES[i].baseProd).mul(creatureMult(s, i) * globalMult(s) * b);
}

export function productionOf(s: GameState, i: number, withBuffs = true): Decimal {
  if (s.creatures[i] === 0) return new Decimal(0);
  return perUnitProduction(s, i, withBuffs).mul(s.creatures[i]);
}

export function totalProduction(s: GameState, withBuffs = true): Decimal {
  let t = 0;
  for (let i = 0; i < CREATURES.length; i++) {
    if (s.creatures[i] > 0) t += s.creatures[i] * CREATURES[i].baseProd * creatureMult(s, i);
  }
  const b = withBuffs ? buffMult(s, 'huma-uretim') : 1;
  return new Decimal(t).mul(globalMult(s) * b);
}

// ---- Dokunuş ----

export function tapUpgradeCost(level: number): Decimal {
  return new Decimal(TAP_UPGRADE_BASE).mul(Decimal.pow(TAP_UPGRADE_RATIO, level));
}

export function resonancePct(s: GameState): number {
  return scrollSummary(s).resonance;
}

/** Kritik olmayan tek dokunuşun değeri. */
export function tapValue(s: GameState): Decimal {
  const base = (1 + s.tapLevel) * scrollSummary(s).tap;
  const res = totalProduction(s).mul(resonancePct(s) / 100);
  return res.add(base).mul(buffMult(s, 'huma-dokunus'));
}

export function critChance(s: GameState): number {
  const boost = buffMult(s, 'huma-dokunus') > 1 ? 0.25 : 0;
  return BASE_CRIT_CHANCE + scrollSummary(s).critChance + boost;
}

export function critMult(s: GameState): number {
  return BASE_CRIT_MULT * scrollSummary(s).critMult;
}

// ---- Çevrimdışı ve Hüma ----

export function offlineEfficiency(s: GameState): number {
  return Math.min(1, BASE_OFFLINE_EFF + scrollSummary(s).offlineEff);
}

export function offlineCapSeconds(s: GameState): number {
  return (BASE_OFFLINE_CAP_H + scrollSummary(s).offlineCapH) * 3600;
}

export function humaFrequency(s: GameState): number {
  return scrollSummary(s).humaFreq;
}

export function humaPower(s: GameState): number {
  return scrollSummary(s).humaPower;
}

export function libraryUnlocked(s: GameState): boolean {
  return s.floor >= 3;
}

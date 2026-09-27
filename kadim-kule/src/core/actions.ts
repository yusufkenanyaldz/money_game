import { HARMONY_LEVELS } from '../data/creatures';
import { SCROLL_BY_ID } from '../data/scrolls';
import type { GameEvent, HumaReward } from './events';
import {
  CIRCLE_COST,
  HUMA_INTERVAL,
  HUMA_VISIBLE,
  LIBRARY_DWARF_COUNT,
  creatureCost,
  critChance,
  critMult,
  harmonyLevel,
  humaFrequency,
  humaPower,
  maxAffordable,
  milestonesReached,
  tapUpgradeCost,
  tapValue,
  totalProduction,
} from './formulas';
import { Decimal, earn, type Buff, type BuffId, type GameState } from './state';

export type Rng = () => number;

export function tap(s: GameState, rng: Rng = Math.random): GameEvent {
  const crit = rng() < critChance(s);
  let amount = tapValue(s);
  if (crit) amount = amount.mul(critMult(s));
  earn(s, amount);
  s.stats.taps++;
  if (crit) s.stats.crits++;
  return { type: 'tap', amount, crit };
}

export function buyTapUpgrade(s: GameState): GameEvent[] {
  const cost = tapUpgradeCost(s.tapLevel);
  if (s.mana.lt(cost)) return [];
  s.mana = s.mana.sub(cost);
  s.tapLevel++;
  return [{ type: 'tapUpgrade', level: s.tapLevel }];
}

export function repairCircle(s: GameState): GameEvent[] {
  if (s.circleRepaired || s.mana.lt(CIRCLE_COST)) return [];
  s.mana = s.mana.sub(CIRCLE_COST);
  s.circleRepaired = true;
  return [{ type: 'circle' }, ...checkUnlocks(s)];
}

/** amount: 'max' ya da adet. Alınabilecek kadarını alır. */
export function buyCreature(s: GameState, i: number, amount: number | 'max'): GameEvent[] {
  if (!s.circleRepaired) return [];
  const owned = s.creatures[i];
  const n = amount === 'max' ? maxAffordable(i, owned, s.mana) : amount;
  if (n <= 0) return [];
  const cost = creatureCost(i, owned, n);
  if (s.mana.lt(cost)) return [];

  const harmonyBefore = harmonyLevel(s);
  const msBefore = milestonesReached(owned);
  s.mana = s.mana.sub(cost);
  s.creatures[i] += n;

  const events: GameEvent[] = [{ type: 'buy', creature: i, amount: n }];
  const msAfter = milestonesReached(s.creatures[i]);
  if (msAfter > msBefore) events.push({ type: 'milestone', creature: i, count: s.creatures[i] });
  const harmonyAfter = harmonyLevel(s);
  if (harmonyAfter > harmonyBefore) {
    events.push({ type: 'harmony', level: harmonyAfter, need: HARMONY_LEVELS[harmonyAfter - 1] });
  }
  events.push(...checkUnlocks(s));
  return events;
}

export function buyScroll(s: GameState, id: string): GameEvent[] {
  const def = SCROLL_BY_ID.get(id);
  if (!def || s.scrolls.has(id) || !def.requires(s)) return [];
  if (s.mana.lt(def.cost)) return [];
  s.mana = s.mana.sub(def.cost);
  s.scrolls.add(id);
  return [{ type: 'scroll', id }];
}

/** Kat açılışlarını denetler. */
export function checkUnlocks(s: GameState): GameEvent[] {
  const events: GameEvent[] = [];
  if (s.floor < 2 && s.circleRepaired) {
    s.floor = 2;
    events.push({ type: 'floor', floor: 2 });
  }
  if (s.floor === 2 && s.creatures[1] >= LIBRARY_DWARF_COUNT) {
    s.floor = 3;
    events.push({ type: 'floor', floor: 3 });
  }
  return events;
}

// ---- Hüma Kuşu ----

export function scheduleHuma(s: GameState, rng: Rng = Math.random): void {
  const [lo, hi] = HUMA_INTERVAL;
  s.huma.nextIn = (lo + rng() * (hi - lo)) / humaFrequency(s);
  s.huma.visibleFor = 0;
}

function addBuff(s: GameState, id: BuffId, duration: number, mult: number): void {
  const existing = s.buffs.find((b) => b.id === id);
  if (existing) {
    existing.remaining = Math.max(existing.remaining, duration);
    existing.duration = Math.max(existing.duration, duration);
    existing.mult = Math.max(existing.mult, mult);
  } else {
    const b: Buff = { id, remaining: duration, duration, mult };
    s.buffs.push(b);
  }
}

export function catchHuma(s: GameState, rng: Rng = Math.random): GameEvent[] {
  if (s.huma.visibleFor <= 0) return [];
  const power = humaPower(s);
  const roll = rng();
  let reward: HumaReward;
  let amount: Decimal | undefined;
  if (roll < 0.5) {
    reward = 'golge';
    addBuff(s, 'huma-uretim', 30 * power, 7);
  } else if (roll < 0.85) {
    reward = 'armagan';
    amount = Decimal.max(totalProduction(s).mul(600), tapValue(s).mul(50));
    earn(s, amount);
  } else {
    reward = 'firtina';
    addBuff(s, 'huma-dokunus', 20 * power, 10);
  }
  s.stats.humaCaught++;
  scheduleHuma(s, rng);
  return [{ type: 'humaCatch', reward, amount }];
}

// ---- Zaman ----

/** Oyunu dt saniye ilerletir (çevrimiçi). */
export function advance(s: GameState, dt: number, rng: Rng = Math.random): GameEvent[] {
  const events: GameEvent[] = [];
  let left = dt;
  // Etkiler adımın ortasında bitebilir; üretimi parça parça hesapla.
  while (left > 0) {
    const nextEnd = s.buffs.reduce((m, b) => Math.min(m, b.remaining), Infinity);
    const step = Math.min(left, nextEnd);
    const prod = totalProduction(s);
    if (prod.gt(0)) earn(s, prod.mul(step));
    for (const b of s.buffs) b.remaining -= step;
    const ended = s.buffs.filter((b) => b.remaining <= 1e-9);
    if (ended.length) {
      s.buffs = s.buffs.filter((b) => b.remaining > 1e-9);
      for (const b of ended) events.push({ type: 'buffEnd', id: b.id });
    }
    left -= step;
  }

  if (s.circleRepaired) {
    if (s.huma.visibleFor > 0) {
      s.huma.visibleFor -= dt;
      if (s.huma.visibleFor <= 0) {
        scheduleHuma(s, rng);
        events.push({ type: 'humaLeave' });
      }
    } else {
      s.huma.nextIn -= dt;
      if (s.huma.nextIn <= 0) {
        s.huma.visibleFor = HUMA_VISIBLE;
        events.push({ type: 'humaAppear' });
      }
    }
  }

  s.stats.playTime += dt;
  return events;
}

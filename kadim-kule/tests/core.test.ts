import { describe, expect, it } from 'vitest';
import {
  advance,
  buyCreature,
  buyScroll,
  buyTapUpgrade,
  catchHuma,
  repairCircle,
  tap,
} from '../src/core/actions';
import {
  CIRCLE_COST,
  LIBRARY_DWARF_COUNT,
  creatureCost,
  harmonyLevel,
  maxAffordable,
  milestonesReached,
  offlineCapSeconds,
  tapValue,
  totalProduction,
} from '../src/core/formulas';
import { currentGoal } from '../src/core/goals';
import { applyOffline } from '../src/core/offline';
import { Decimal, newGame, type GameState } from '../src/core/state';
import { CREATURES, HARMONY_LEVELS } from '../src/data/creatures';
import { SCROLLS } from '../src/data/scrolls';

const never = () => 0.99;
const always = () => 0;

function withMana(n: number | string, patch: Partial<GameState> = {}): GameState {
  const s = newGame(0);
  s.mana = new Decimal(n);
  return Object.assign(s, patch);
}

describe('dokunuş', () => {
  it('ilk dokunuş 1 mana verir ve sayılır', () => {
    const s = newGame(0);
    const ev = tap(s, never);
    expect(ev).toMatchObject({ type: 'tap', crit: false });
    expect(s.mana.toNumber()).toBe(1);
    expect(s.stats.taps).toBe(1);
  });

  it('kritik dokunuş ×10 verir', () => {
    const s = newGame(0);
    tap(s, always);
    expect(s.mana.toNumber()).toBe(10);
    expect(s.stats.crits).toBe(1);
  });

  it('Kristali Parlat dokunuşa +1 ekler ve maliyeti düşer', () => {
    const s = withMana(15);
    expect(buyTapUpgrade(s)).toHaveLength(1);
    expect(s.mana.toNumber()).toBe(0);
    expect(tapValue(s).toNumber()).toBe(2);
    expect(buyTapUpgrade(s)).toHaveLength(0);
  });
});

describe('çember ve katlar', () => {
  it('çember yeterli mana olmadan onarılamaz', () => {
    const s = withMana(CIRCLE_COST - 1);
    expect(repairCircle(s)).toEqual([]);
    expect(s.circleRepaired).toBe(false);
  });

  it('çember onarılınca Kat 2 açılır', () => {
    const s = withMana(CIRCLE_COST);
    const ev = repairCircle(s);
    expect(s.circleRepaired).toBe(true);
    expect(s.floor).toBe(2);
    expect(ev).toContainEqual({ type: 'floor', floor: 2 });
  });

  it('çember onarılmadan yaratık çağrılamaz', () => {
    const s = withMana(1e6);
    expect(buyCreature(s, 0, 1)).toEqual([]);
  });

  it(`${LIBRARY_DWARF_COUNT} Cüce Madenci Kütüphaneyi açar`, () => {
    const s = withMana(1e9, { circleRepaired: true, floor: 2 });
    const ev = buyCreature(s, 1, LIBRARY_DWARF_COUNT);
    expect(s.floor).toBe(3);
    expect(ev).toContainEqual({ type: 'floor', floor: 3 });
  });
});

describe('yaratıklar', () => {
  it('toplu alım maliyeti tek tek alımların toplamına eşittir', () => {
    let sum = 0;
    for (let n = 0; n < 10; n++) sum += creatureCost(0, n).toNumber();
    expect(creatureCost(0, 0, 10).toNumber()).toBeCloseTo(sum, 6);
  });

  it('MAKS, parası yetecek en çok adedi bulur', () => {
    const mana = new Decimal(1000);
    const n = maxAffordable(0, 0, mana);
    expect(creatureCost(0, 0, n).lte(mana)).toBe(true);
    expect(creatureCost(0, 0, n + 1).gt(mana)).toBe(true);
  });

  it('alım manayı düşer ve adedi artırır', () => {
    const s = withMana(1000, { circleRepaired: true, floor: 2 });
    buyCreature(s, 0, 'max');
    expect(s.creatures[0]).toBeGreaterThan(0);
    expect(s.mana.gte(0)).toBe(true);
    expect(s.mana.lt(creatureCost(0, s.creatures[0]))).toBe(true);
  });

  it('eşiğe ulaşınca o türün üretimi ikiye katlanır', () => {
    const s = withMana(0, { circleRepaired: true });
    s.creatures[0] = 9;
    const before = totalProduction(s).toNumber() / 9;
    s.creatures[0] = 10;
    const after = totalProduction(s).toNumber() / 10;
    expect(after / before).toBeCloseTo(2);
    expect(milestonesReached(10)).toBe(1);
    expect(milestonesReached(24)).toBe(1);
    expect(milestonesReached(25)).toBe(2);
  });

  it('eşik olayı alımda yayınlanır', () => {
    const s = withMana(1e9, { circleRepaired: true, floor: 3 });
    const ev = buyCreature(s, 0, 10);
    expect(ev).toContainEqual({ type: 'milestone', creature: 0, count: 10 });
  });

  it('her türden yeterince olunca Uyum tüm üretimi ikiye katlar', () => {
    const s = newGame(0);
    s.creatures = CREATURES.map(() => HARMONY_LEVELS[0] - 1);
    expect(harmonyLevel(s)).toBe(0);
    const before = totalProduction(s);
    s.creatures = CREATURES.map(() => HARMONY_LEVELS[0]);
    expect(harmonyLevel(s)).toBe(1);
    expect(totalProduction(s).gt(before.mul(2))).toBe(true);
  });
});

describe('parşömenler', () => {
  it('tüm parşömen kimlikleri benzersizdir', () => {
    expect(new Set(SCROLLS.map((d) => d.id)).size).toBe(SCROLLS.length);
  });

  it('koşulu sağlanmayan parşömen okunamaz', () => {
    const s = withMana(1e12);
    expect(buyScroll(s, 'peri-1')).toEqual([]);
  });

  it('türe özel parşömen o türü çarpar ve bir kez okunur', () => {
    const s = withMana(1e12, { circleRepaired: true, floor: 3 });
    s.creatures[0] = 10;
    const before = totalProduction(s);
    expect(buyScroll(s, 'peri-1')).toEqual([{ type: 'scroll', id: 'peri-1' }]);
    expect(totalProduction(s).div(before).toNumber()).toBeCloseTo(2);
    expect(buyScroll(s, 'peri-1')).toEqual([]);
  });

  it('Kopuz Teli dokunuşa saniyelik üretimin yüzdesini ekler', () => {
    const s = withMana(1e12, { circleRepaired: true, floor: 3 });
    s.creatures[3] = 50;
    const prod = totalProduction(s).toNumber();
    const base = tapValue(s).toNumber();
    buyScroll(s, 'kopuz-1');
    expect(tapValue(s).toNumber()).toBeCloseTo(base + prod * 0.02, 6);
  });

  it('çevrimdışı parşömenleri süre sınırını artırır', () => {
    const s = withMana(1e12);
    const cap = offlineCapSeconds(s);
    buyScroll(s, 'uyku-ninnisi');
    buyScroll(s, 'ruya-kapisi');
    expect(offlineCapSeconds(s)).toBe(cap + 4 * 3600);
  });
});

describe('zaman', () => {
  it('advance üretimi süreyle çarpıp ekler', () => {
    const s = withMana(0, { circleRepaired: true });
    s.creatures[0] = 4; // 4 × 1/sn
    advance(s, 10, never);
    expect(s.mana.toNumber()).toBeCloseTo(40);
    expect(s.manaRun.toNumber()).toBeCloseTo(40);
  });

  it('etki adımın ortasında biterse üretim bölünerek hesaplanır', () => {
    const s = withMana(0, { circleRepaired: true });
    s.creatures[0] = 1;
    s.buffs = [{ id: 'huma-uretim', remaining: 2, duration: 30, mult: 7 }];
    const ev = advance(s, 10, never);
    // 2 sn ×7 + 8 sn ×1
    expect(s.mana.toNumber()).toBeCloseTo(2 * 7 + 8);
    expect(ev).toContainEqual({ type: 'buffEnd', id: 'huma-uretim' });
    expect(s.buffs).toHaveLength(0);
  });

  it('Hüma zamanı gelince görünür, yakalanınca ödül verir', () => {
    const s = withMana(0, { circleRepaired: true });
    s.creatures[0] = 10;
    s.huma.nextIn = 1;
    expect(advance(s, 1.5, never)).toContainEqual({ type: 'humaAppear' });
    expect(s.huma.visibleFor).toBeGreaterThan(0);
    const ev = catchHuma(s, () => 0.1); // Hüma'nın Gölgesi
    expect(ev[0]).toMatchObject({ type: 'humaCatch', reward: 'golge' });
    expect(s.buffs[0]).toMatchObject({ id: 'huma-uretim', mult: 7 });
    expect(s.huma.visibleFor).toBe(0);
    expect(catchHuma(s)).toEqual([]);
  });

  it('Hüma çember onarılmadan gelmez', () => {
    const s = newGame(0);
    s.huma.nextIn = 1;
    expect(advance(s, 5, never)).toEqual([]);
  });
});

describe('çevrimdışı', () => {
  it('kısa aralar çevrimdışı sayılmaz', () => {
    const s = newGame(0);
    expect(applyOffline(s, 30)).toBeUndefined();
  });

  it('süre sınırı ve verimle hesaplanır, geçici etkiler silinir', () => {
    const s = withMana(0, { circleRepaired: true });
    s.creatures[0] = 1; // 1/sn
    s.buffs = [{ id: 'huma-uretim', remaining: 20, duration: 30, mult: 7 }];
    const r = applyOffline(s, 5 * 3600, never)!;
    expect(r.counted).toBe(2 * 3600);
    expect(r.efficiency).toBe(0.5);
    expect(r.gain.toNumber()).toBeCloseTo(3600);
    expect(s.mana.toNumber()).toBeCloseTo(3600);
    expect(s.buffs).toHaveLength(0);
  });
});

describe('hedefler', () => {
  it('ilk hedef çemberdir, sonra cüceler, sonra yeni yaratıklar', () => {
    const s = withMana(CIRCLE_COST / 2);
    expect(currentGoal(s)).toMatchObject({ action: 'circle', progress: 0.5 });
    s.circleRepaired = true;
    s.floor = 2;
    expect(currentGoal(s).text).toContain('Cüce');
    s.floor = 3;
    s.creatures[0] = 1;
    s.creatures[1] = 10;
    expect(currentGoal(s).text).toContain(CREATURES[2].name);
  });
});

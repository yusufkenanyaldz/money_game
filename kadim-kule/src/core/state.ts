import Decimal from 'break_infinity.js';
import { CREATURES } from '../data/creatures';

export { Decimal };

export type BuffId = 'huma-uretim' | 'huma-dokunus';

export interface Buff {
  id: BuffId;
  /** Kalan süre (oyun saniyesi). */
  remaining: number;
  duration: number;
  mult: number;
}

export type Notation = 'tr' | 'bilimsel';

export interface Settings {
  sfx: boolean;
  music: boolean;
  /** 0–1 */
  volume: number;
  notation: Notation;
  vibration: boolean;
}

export interface Stats {
  taps: number;
  crits: number;
  humaCaught: number;
  /** Açık oynanan süre (sn). */
  playTime: number;
  startedAt: number;
  manaAllTime: Decimal;
}

export interface HumaState {
  /** Bir sonraki görünüşe kalan süre (sn). */
  nextIn: number;
  /** >0 ise kuş ekranda; kalan süre (sn). */
  visibleFor: number;
}

export interface GameState {
  mana: Decimal;
  /** Bu turda kazanılan toplam mana (ileride prestij için). */
  manaRun: Decimal;
  tapLevel: number;
  circleRepaired: boolean;
  creatures: number[];
  scrolls: Set<string>;
  /** Açılmış en yüksek kule katı. */
  floor: number;
  buffs: Buff[];
  huma: HumaState;
  tipsSeen: Set<string>;
  settings: Settings;
  stats: Stats;
  /** Son güncellemenin duvar saati (ms). */
  lastTick: number;
}

export function defaultSettings(): Settings {
  return { sfx: true, music: true, volume: 0.7, notation: 'tr', vibration: true };
}

export function newGame(now = Date.now()): GameState {
  return {
    mana: new Decimal(0),
    manaRun: new Decimal(0),
    tapLevel: 0,
    circleRepaired: false,
    creatures: CREATURES.map(() => 0),
    scrolls: new Set(),
    floor: 1,
    buffs: [],
    huma: { nextIn: 60, visibleFor: 0 },
    tipsSeen: new Set(),
    settings: defaultSettings(),
    stats: {
      taps: 0,
      crits: 0,
      humaCaught: 0,
      playTime: 0,
      startedAt: now,
      manaAllTime: new Decimal(0),
    },
    lastTick: now,
  };
}

/** Kazanılan manayı ekler ve toplam sayaçları günceller. */
export function earn(s: GameState, amount: Decimal): void {
  s.mana = s.mana.add(amount);
  s.manaRun = s.manaRun.add(amount);
  s.stats.manaAllTime = s.stats.manaAllTime.add(amount);
}

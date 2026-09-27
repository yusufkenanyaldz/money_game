import { scheduleHuma, type Rng } from './actions';
import { OFFLINE_THRESHOLD, offlineCapSeconds, offlineEfficiency, totalProduction } from './formulas';
import { Decimal, earn, type GameState } from './state';

export interface OfflineReport {
  /** Gerçekte geçen süre (sn). */
  away: number;
  /** Kazanca sayılan süre (sn). */
  counted: number;
  efficiency: number;
  gain: Decimal;
}

/**
 * Uzun aradan dönüşte çağrılır. Geçici etkiler (Hüma) çevrimdışı sürmez;
 * üretim, süre sınırı ve verimle hesaplanır.
 */
export function applyOffline(s: GameState, awaySeconds: number, rng?: Rng): OfflineReport | undefined {
  if (awaySeconds < OFFLINE_THRESHOLD) return undefined;
  s.buffs = [];
  if (s.circleRepaired) scheduleHuma(s, rng);
  const counted = Math.min(awaySeconds, offlineCapSeconds(s));
  const efficiency = offlineEfficiency(s);
  const gain = totalProduction(s, false).mul(counted * efficiency);
  if (gain.gt(0)) earn(s, gain);
  return { away: awaySeconds, counted, efficiency, gain };
}

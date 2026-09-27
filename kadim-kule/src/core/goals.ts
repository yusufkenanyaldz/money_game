import { CREATURES } from '../data/creatures';
import { CIRCLE_COST, LIBRARY_DWARF_COUNT, creatureCost, nextHarmony } from './formulas';
import type { GameState } from './state';

export interface Goal {
  text: string;
  /** 0–1 */
  progress: number;
  /** Hedef çubuğunda düğme gösterilecekse. */
  action?: 'circle';
}

export function currentGoal(s: GameState): Goal {
  if (!s.circleRepaired) {
    return {
      text: 'Çağırma Çemberini onar',
      progress: Math.min(1, s.mana.toNumber() / CIRCLE_COST),
      action: 'circle',
    };
  }
  if (s.floor < 3) {
    return {
      text: `${LIBRARY_DWARF_COUNT} Cüce Madenci çağır: Kütüphanenin enkazını kazsınlar`,
      progress: s.creatures[1] / LIBRARY_DWARF_COUNT,
    };
  }
  const next = s.creatures.findIndex((n) => n === 0);
  if (next >= 0) {
    const cost = creatureCost(next, 0);
    return {
      text: `Yeni yaratık: ${CREATURES[next].name}`,
      progress: Math.min(1, s.mana.div(cost).toNumber()),
    };
  }
  const need = nextHarmony(s);
  if (need !== undefined) {
    return {
      text: `Uyum: her türden ${need} yaratık (tüm üretim ×2)`,
      progress: Math.min(...s.creatures) / need,
    };
  }
  return { text: 'Kulenin bütün uyumları sağlandı', progress: 1 };
}

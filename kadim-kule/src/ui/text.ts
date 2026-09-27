import { CREATURES } from '../data/creatures';
import type { ScrollEffect } from '../data/scrolls';
import type { HumaReward } from '../core/events';

/** Yüzde sayısından sonra gelen iyelik eki: %2'si, %3'ü, %5'i, %40'ı… */
export function iyelik(n: number): string {
  const birler: Record<number, string> = { 0: '', 1: 'i', 2: 'si', 3: 'ü', 4: 'ü', 5: 'i', 6: 'sı', 7: 'si', 8: 'i', 9: 'u' };
  const onlar: Record<number, string> = { 1: 'u', 2: 'si', 3: 'u', 4: 'ı', 5: 'si', 6: 'ı', 7: 'i', 8: 'i', 9: 'ı' };
  if (n % 100 === 0) return 'ü';
  const b = n % 10;
  return b ? birler[b] : onlar[Math.floor(n / 10) % 10];
}

export function effectText(e: ScrollEffect): string {
  switch (e.kind) {
    case 'creature':
      return `${CREATURES[e.creature].name} üretimi ×${e.mult}`;
    case 'global':
      return `Tüm üretim ×${e.mult}`;
    case 'resonance':
      return `Her dokunuş, saniyelik üretimin %${e.pct}'${iyelik(e.pct)} kadar ek mana verir`;
    case 'tap':
      return `Dokunuş gücü ×${e.mult}`;
    case 'critChance':
      return `Kritik dokunuş şansı +%${Math.round(e.add * 100)}`;
    case 'critMult':
      return `Kritik dokunuş çarpanı ×${e.mult}`;
    case 'offlineEff':
      return `Çevrimdışı kazanç verimi +%${Math.round(e.add * 100)}`;
    case 'offlineCap':
      return `Çevrimdışı süre sınırı +${e.hours} saat`;
    case 'humaFreq':
      return 'Hüma Kuşu daha sık gelir';
    case 'humaPower':
      return `Hüma'nın etkileri %${Math.round((e.mult - 1) * 100)} daha uzun sürer`;
  }
}

export const HUMA_REWARD_TEXT: Record<HumaReward, string> = {
  golge: "Hüma'nın Gölgesi: üretim ×7",
  armagan: "Hüma'nın Armağanı",
  firtina: 'Tüy Fırtınası: dokunuş ×10',
};

export const BUFF_TEXT = {
  'huma-uretim': "Hüma'nın Gölgesi",
  'huma-dokunus': 'Tüy Fırtınası',
} as const;

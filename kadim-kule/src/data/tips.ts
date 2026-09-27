import { CIRCLE_COST } from '../core/formulas';
import type { GameState } from '../core/state';

export interface TipDef {
  id: string;
  text: string;
  when: (s: GameState) => boolean;
}

/** Üstadın Ruhu'nun sırayla verdiği ipuçları. İlk uygun ve görülmemiş olan gösterilir. */
export const TIPS: TipDef[] = [
  {
    id: 'hosgeldin',
    text: 'Uyan, çırak… Kule uykuda, kristal sönmek üzere. Kristale dokun ve manasını geri çağır.',
    when: () => true,
  },
  {
    id: 'parlat',
    text: 'Güzel! Kristali parlatırsan her dokunuşun daha çok mana verir.',
    when: (s) => s.mana.gte(10) && s.tapLevel === 0,
  },
  {
    id: 'cember',
    text: 'Yukarıdaki Çağırma Çemberini görüyor musun? Yeterince mana toplayınca onar; yaratıklar senin için çalışsın.',
    when: (s) => !s.circleRepaired && s.mana.gte(CIRCLE_COST * 0.5),
  },
  {
    id: 'ilk-peri',
    text: 'Çember uyandı! Yaratıklar sekmesinden ilk periyi çağır. Periler sen dokunmasan da mana toplar.',
    when: (s) => s.circleRepaired && s.creatures[0] === 0,
  },
  {
    id: 'huma',
    text: 'Hüma Kuşu! Gölgesi kimin üstüne düşerse talih onundur. Uçup gitmeden ona dokun!',
    when: (s) => s.huma.visibleFor > 0,
  },
  {
    id: 'cevrimdisi',
    text: 'Bilmen gereken bir şey: kuleden ayrıldığında da yaratıkların çalışır. Döndüğünde topladıklarını bulursun.',
    when: (s) => s.creatures.reduce((a, b) => a + b, 0) >= 5,
  },
  {
    id: 'kutuphane',
    text: 'Kütüphanenin kapısı açıldı. Tozlu parşömenler yaratıklarını kat kat güçlendirir.',
    when: (s) => s.floor >= 3,
  },
  {
    id: 'esik',
    text: 'Bir türden 10, 25, 50, 100… yaratığa ulaştığında o türün üretimi ikiye katlanır. Kartlardaki çubuğu izle.',
    when: (s) => s.creatures.some((n) => n >= 10),
  },
];

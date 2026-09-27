import type { GameState } from '../core/state';
import type { IconName } from '../ui/icons.gen';
import { CREATURES } from './creatures';

export type ScrollEffect =
  | { kind: 'creature'; creature: number; mult: number }
  | { kind: 'global'; mult: number }
  | { kind: 'resonance'; pct: number }
  | { kind: 'tap'; mult: number }
  | { kind: 'critChance'; add: number }
  | { kind: 'critMult'; mult: number }
  | { kind: 'offlineEff'; add: number }
  | { kind: 'offlineCap'; hours: number }
  | { kind: 'humaFreq'; mult: number }
  | { kind: 'humaPower'; mult: number };

export interface ScrollDef {
  id: string;
  name: string;
  /** İsteğe bağlı kısa hikâye cümlesi. */
  flavor?: string;
  icon: IconName;
  cost: number;
  effect: ScrollEffect;
  /** Rafta görünme koşulu. */
  requires: (s: GameState) => boolean;
}

const CREATURE_SCROLL_NAMES: [string, string, string][] = [
  ['Peri Tozu', 'Ay Işığı Kanatları', 'Peri Padişahının Tacı'],
  ['Cüce Kazmaları', 'Derin Damarlar', 'Demirdağ Ocakları'],
  ['Pınar Sunusu', 'Gümüş Kova', 'Denizlerin Belleği'],
  ['Yaprak Şarkısı', 'Ak Kayın Yayları', 'Kadim Orman Yemini'],
  ['Gök Kurt Uluması', "Asena'nın İzi", 'Ergenekon Yolu'],
  ['Rün Kazıma', 'Kalp Taşı', 'Dağ Uyanır'],
  ['Rüzgâr Nalları', 'Gök Yelesi', 'Yedi Kat Gök'],
  ['Yılan Taşı', "Lokman'ın Defteri", "Şahmeran'ın Sırrı"],
  ['Kaf Dağı Tüyü', 'Küllerden Doğuş', 'Simurg Bakışı'],
  ['Ejder Pulu', 'Ejder Soluğu', 'İlk Ateş'],
];

/** Türe özel parşömenler: [gereken adet, taban maliyetin katı, çarpan] */
const CREATURE_TIERS: [number, number, number][] = [
  [10, 30, 2],
  [50, 3_000, 2],
  [100, 1_000_000, 3],
];

const creatureScrolls: ScrollDef[] = CREATURES.flatMap((c, i) =>
  CREATURE_TIERS.map(([need, costMult, mult], t) => ({
    id: `${c.id}-${t + 1}`,
    name: CREATURE_SCROLL_NAMES[i][t],
    icon: c.icon,
    cost: c.baseCost * costMult,
    effect: { kind: 'creature', creature: i, mult } as const,
    requires: (s: GameState) => s.creatures[i] >= need,
  })),
);

const owns = (i: number, n = 1) => (s: GameState) => s.creatures[i] >= n;
const has = (id: string) => (s: GameState) => s.scrolls.has(id);
const always = () => true;

const specialScrolls: ScrollDef[] = [
  // Genel üretim
  {
    id: 'ustat-notlari',
    name: 'Üstadın Notları',
    flavor: 'Kenarlarına aceleyle karalanmış formüller.',
    icon: 'kitap',
    cost: 20_000,
    effect: { kind: 'global', mult: 2 },
    requires: always,
  },
  {
    id: 'orhun',
    name: 'Orhun Yazıtları',
    flavor: 'Taşa kazınmış sözler; okudukça kristal parlıyor.',
    icon: 'yazit',
    cost: 50_000_000,
    effect: { kind: 'global', mult: 2 },
    requires: owns(4),
  },
  {
    id: 'ulugbey',
    name: "Uluğ Bey'in Yıldız Cetveli",
    flavor: 'Bin yıldızın yeri, bin manalık yol.',
    icon: 'rasathane',
    cost: 50_000_000_000,
    effect: { kind: 'global', mult: 2 },
    requires: owns(6),
  },
  {
    id: 'dede-korkut',
    name: "Dede Korkut'un Kitabı",
    flavor: 'Her boyun hikâyesi, her hikâyenin bir gücü var.',
    icon: 'kitap',
    cost: 50_000_000_000_000,
    effect: { kind: 'global', mult: 2 },
    requires: owns(8),
  },
  {
    id: 'divan',
    name: 'Divânu Lugâti’t-Türk',
    flavor: 'Kelimelerin kökünde saklı mana.',
    icon: 'yazit',
    cost: 50_000_000_000_000_000,
    effect: { kind: 'global', mult: 2 },
    requires: owns(9, 10),
  },
  // Rezonans: dokunuş, saniyelik üretimin bir kısmını da verir
  ...([2, 3, 5, 5, 5] as const).map((pct, t): ScrollDef => ({
    id: `kopuz-${t + 1}`,
    name: `${['Birinci', 'İkinci', 'Üçüncü', 'Dördüncü', 'Beşinci'][t]} Kopuz Teli`,
    flavor: t === 0 ? 'Kristal, kopuzun sesine karşılık veriyor.' : undefined,
    icon: 'kopuz',
    cost: 3_000 * 100 ** t,
    effect: { kind: 'resonance', pct },
    requires: t === 0 ? always : has(`kopuz-${t}`),
  })),
  // Dokunuş
  {
    id: 'keskin-kristal',
    name: 'Keskin Kristal',
    icon: 'kristalParlak',
    cost: 800,
    effect: { kind: 'tap', mult: 2 },
    requires: always,
  },
  {
    id: 'kristal-kalp',
    name: 'Kristal Kalp',
    icon: 'kristalParlak',
    cost: 80_000,
    effect: { kind: 'tap', mult: 3 },
    requires: has('keskin-kristal'),
  },
  {
    id: 'gok-tasi',
    name: 'Gök Taşı',
    flavor: 'Gökten düşen taş, kristale kardeş çıktı.',
    icon: 'yildiz',
    cost: 8_000_000,
    effect: { kind: 'tap', mult: 3 },
    requires: has('kristal-kalp'),
  },
  {
    id: 'parlak-goz',
    name: 'Parlak Göz',
    icon: 'goz',
    cost: 5_000,
    effect: { kind: 'critChance', add: 0.05 },
    requires: always,
  },
  {
    id: 'simsek-dokunus',
    name: 'Şimşek Dokunuşu',
    icon: 'simsek',
    cost: 500_000,
    effect: { kind: 'critMult', mult: 2 },
    requires: has('parlak-goz'),
  },
  // Çevrimdışı
  {
    id: 'uyku-ninnisi',
    name: 'Uyku Ninnisi',
    flavor: 'Sen uyurken yaratıkların daha istekli çalışır.',
    icon: 'uyku',
    cost: 50_000,
    effect: { kind: 'offlineEff', add: 0.25 },
    requires: always,
  },
  {
    id: 'ruya-kapisi',
    name: 'Rüya Kapısı',
    icon: 'kumSaati',
    cost: 5_000_000,
    effect: { kind: 'offlineCap', hours: 4 },
    requires: has('uyku-ninnisi'),
  },
  {
    id: 'derin-uyku',
    name: 'Derin Uyku',
    icon: 'kumSaati',
    cost: 5_000_000_000,
    effect: { kind: 'offlineCap', hours: 6 },
    requires: has('ruya-kapisi'),
  },
  // Hüma Kuşu
  {
    id: 'huma-tuyu',
    name: 'Hüma Tüyü',
    flavor: 'Talih kuşu, tüyünü taşıyana daha sık uğrar.',
    icon: 'tuy',
    cost: 20_000,
    effect: { kind: 'humaFreq', mult: 1.3 },
    requires: (s) => s.stats.humaCaught >= 1,
  },
  {
    id: 'talih-kusu',
    name: 'Talih Kuşu',
    icon: 'huma',
    cost: 20_000_000,
    effect: { kind: 'humaPower', mult: 1.5 },
    requires: has('huma-tuyu'),
  },
];

export const SCROLLS: ScrollDef[] = [...creatureScrolls, ...specialScrolls].sort(
  (a, b) => a.cost - b.cost,
);

export const SCROLL_BY_ID = new Map(SCROLLS.map((s) => [s.id, s]));

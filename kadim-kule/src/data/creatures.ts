import type { IconName } from '../ui/icons.gen';

export interface CreatureDef {
  id: string;
  name: string;
  lore: string;
  icon: IconName;
  baseCost: number;
  costRatio: number;
  /** Tek bir yaratığın çarpansız saniyelik mana üretimi. */
  baseProd: number;
  /** Madalyon gradyanı: açık ton, koyu ton. */
  colors: [string, string];
}

// Başlangıç değerleri denge simülasyonuyla (npm run sim) ayarlandı.
export const CREATURES: CreatureDef[] = [
  {
    id: 'peri',
    name: 'Peri',
    lore: 'Kristalin ışığına çekilen küçük, kanatlı ruhlar. Havadaki manayı toplarlar.',
    icon: 'peri',
    baseCost: 50,
    costRatio: 1.15,
    baseProd: 1,
    colors: ['#ff9ad5', '#a63ad6'],
  },
  {
    id: 'cuce',
    name: 'Cüce Madenci',
    lore: 'Dağların derinliklerinden mana damarları kazıp çıkarır.',
    icon: 'cuce',
    baseCost: 600,
    costRatio: 1.15,
    baseProd: 6,
    colors: ['#ffbe6b', '#b4541f'],
  },
  {
    id: 'su-iyesi',
    name: 'Su İyesi',
    lore: 'Her pınarın bir iyesi vardır. Suyun belleğindeki manayı sana taşır.',
    icon: 'suIyesi',
    baseCost: 7_000,
    costRatio: 1.15,
    baseProd: 35,
    colors: ['#6fe6ff', '#1f63c4'],
  },
  {
    id: 'elf',
    name: 'Orman Elfi',
    lore: 'Yaşlı ağaçların şarkısını dinler, yapraklardaki manayı toplar.',
    icon: 'elf',
    baseCost: 80_000,
    costRatio: 1.15,
    baseProd: 200,
    colors: ['#b4f57a', '#2c8a4f'],
  },
  {
    id: 'bozkurt',
    name: 'Bozkurt',
    lore: "Asena'nın soyundan. Uluması bozkırdaki dağınık manayı sürü gibi toplar.",
    icon: 'bozkurt',
    baseCost: 1_000_000,
    costRatio: 1.15,
    baseProd: 1_200,
    colors: ['#d5def7', '#5a6aa6'],
  },
  {
    id: 'golem',
    name: 'Taş Golem',
    lore: 'Rünlerle canlandırılmış taş. Yorulmaz, uyumaz, durmaz.',
    icon: 'golem',
    baseCost: 13_000_000,
    costRatio: 1.15,
    baseProd: 7_000,
    colors: ['#dccab0', '#76624d'],
  },
  {
    id: 'tulpar',
    name: 'Tulpar',
    lore: 'Kanatlı at. Yedi kat göğün rüzgârından mana süzer.',
    icon: 'tulpar',
    baseCost: 170_000_000,
    costRatio: 1.15,
    baseProd: 40_000,
    colors: ['#a6ecff', '#3a55e0'],
  },
  {
    id: 'sahmeran',
    name: 'Şahmeran',
    lore: 'Yılanların bilge kraliçesi. Yeraltının gizli bilgisini manaya dönüştürür.',
    icon: 'sahmeran',
    baseCost: 2_200_000_000,
    costRatio: 1.15,
    baseProd: 230_000,
    colors: ['#7cf2b8', '#0e7a62'],
  },
  {
    id: 'anka',
    name: 'Zümrüdüanka',
    lore: "Kaf Dağı'nın ardında yaşar. Kanat çırpışı çağları değiştirir.",
    icon: 'anka',
    baseCost: 30_000_000_000,
    costRatio: 1.15,
    baseProd: 1_300_000,
    colors: ['#ffd66e', '#e2402a'],
  },
  {
    id: 'ejderha',
    name: 'Kadim Ejderha',
    lore: 'Dünyanın ilk nefesini hatırlar. Soluğu saf manadır.',
    icon: 'ejderha',
    baseCost: 400_000_000_000,
    costRatio: 1.15,
    baseProd: 7_500_000,
    colors: ['#ff7a6b', '#6d1230'],
  },
];

/** Bir türden bu sayılara ulaşınca o türün üretimi ikiye katlanır. */
export const MILESTONES = [10, 25, 50, 100, 150, 200, 250, 300, 400, 500, 600, 700, 800, 900, 1000];

/** Her türden en az bu kadar yaratık olunca tüm üretim ikiye katlanır (Uyum). */
export const HARMONY_LEVELS = [25, 50, 100, 150, 200, 300, 400, 500];

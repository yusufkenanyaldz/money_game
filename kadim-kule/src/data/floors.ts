import type { IconName } from '../ui/icons.gen';

export interface FloorDef {
  n: number;
  name: string;
  desc: string;
  icon: IconName;
  /** Kilitliyken gösterilen ipucu. */
  hint: string;
  /** Bu sürümde henüz yapılmadı. */
  sealed?: boolean;
}

export const FLOORS: FloorDef[] = [
  {
    n: 1,
    name: 'Kristal Odası',
    desc: 'Kristale dokunarak mana topla.',
    icon: 'kristal',
    hint: '',
  },
  {
    n: 2,
    name: 'Çağırma Çemberi',
    desc: 'Yaratıklar sen yokken de mana toplar.',
    icon: 'cember',
    hint: 'Çemberi onar',
  },
  {
    n: 3,
    name: 'Kütüphane',
    desc: 'Parşömenler yaratıklarını ve dokunuşunu güçlendirir.',
    icon: 'kutuphane',
    hint: '10 Cüce Madenci çağır',
  },
  { n: 4, name: 'Büyü Salonu', desc: '', icon: 'buyu', hint: 'Mühürlü', sealed: true },
  { n: 5, name: 'Rasathane', desc: '', icon: 'rasathane', hint: 'Mühürlü', sealed: true },
  { n: 6, name: 'Portal', desc: '', icon: 'portal', hint: 'Mühürlü', sealed: true },
  { n: 7, name: 'Kadim Sunak', desc: '', icon: 'sunak', hint: 'Mühürlü', sealed: true },
];

// game-icons.net setinden (CC BY 3.0) yalnızca kullanılan ikonları src/ui/icons.gen.ts dosyasına çıkarır.
import { readFileSync, writeFileSync } from 'node:fs';

const ICONS = {
  // yaratıklar
  peri: 'fairy',
  cuce: 'dwarf-face',
  suIyesi: 'wave-crest',
  elf: 'woman-elf-face',
  bozkurt: 'wolf-howl',
  golem: 'rock-golem',
  tulpar: 'pegasus',
  sahmeran: 'snake-tongue',
  anka: 'condor-emblem',
  ejderha: 'spiked-dragon-head',
  // arayüz
  huma: 'dove',
  kristal: 'crystal-growth',
  cember: 'magic-swirl',
  kutuphane: 'spell-book',
  kule: 'stone-tower',
  ustat: 'wizard-face',
  kilit: 'padlock',
  sesAcik: 'sound-on',
  sesKapali: 'sound-off',
  muzik: 'musical-notes',
  uyku: 'night-sleep',
  kumSaati: 'hourglass',
  parsomen: 'scroll-unfurled',
  kitap: 'book-aura',
  yazit: 'stone-tablet',
  kopuz: 'harp',
  dokunus: 'click',
  simsek: 'lightning-arc',
  goz: 'crystal-eye',
  parilti: 'sparkles',
  kristalParlak: 'crystal-shine',
  tuy: 'feather',
  buyu: 'bolt-spell-cast',
  rasathane: 'moon-orbit',
  portal: 'magic-portal',
  sunak: 'star-altar',
  kupa: 'laurels-trophy',
  kaydet: 'save',
  yukle: 'cloud-upload',
  indir: 'cloud-download',
  ayar: 'settings-knobs',
  cop: 'trash-can',
  titresim: 'vibrating-smartphone',
  yildiz: 'falling-star',
};

const set = JSON.parse(
  readFileSync(new URL('../node_modules/@iconify-json/game-icons/icons.json', import.meta.url), 'utf8'),
);
const missing = Object.entries(ICONS).filter(([, n]) => !set.icons[n]);
if (missing.length) {
  console.error('Bulunamayan ikonlar:', missing);
  process.exit(1);
}

const lines = Object.entries(ICONS).map(
  ([key, name]) => `  ${key}: ${JSON.stringify(set.icons[name].body)}, // ${name}`,
);
const out = `// Otomatik üretildi: npm run icons (scripts/icons.mjs). Elle düzenleme.
// İkonlar: game-icons.net — CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/)
export const ICON_BODIES = {
${lines.join('\n')}
} as const;

export type IconName = keyof typeof ICON_BODIES;
`;
writeFileSync(new URL('../src/ui/icons.gen.ts', import.meta.url), out);
console.log(`${lines.length} ikon yazıldı.`);

/**
 * Denge simülasyonu: akıllı oynayan bir oyuncuyu taklit eder ve hangi dakikada neyin
 * açıldığını yazdırır. Çalıştır: npm run sim
 *
 * Oyuncu her an "bekleme süresi + geri ödeme süresi" en kısa olan alımı yapar.
 * Hüma Kuşu hesaba katılmaz (gerçek oyuncu biraz daha hızlı ilerler).
 */
import { buyCreature, buyScroll, buyTapUpgrade, checkUnlocks, repairCircle } from '../src/core/actions';
import {
  CIRCLE_COST,
  creatureCost,
  critChance,
  critMult,
  libraryUnlocked,
  offlineCapSeconds,
  offlineEfficiency,
  tapUpgradeCost,
  tapValue,
  totalProduction,
} from '../src/core/formulas';
import { Decimal, earn, newGame, type GameState } from '../src/core/state';
import { CREATURES, HARMONY_LEVELS } from '../src/data/creatures';
import { SCROLLS } from '../src/data/scrolls';
import { fmt, fmtTime } from '../src/i18n/format';

interface Profile {
  name: string;
  /** t anında saniyedeki dokunuş (oyun başından beri geçen sn). */
  tps: (t: number) => number;
  /** t anında oyuncu oyunda mı? Değilse bir sonraki dönüş zamanı. */
  online: (t: number) => true | number;
  /** Simülasyon süresi (sn). */
  duration: number;
}

const MIN = 60;
const HOUR = 3600;

const PROFILES: Profile[] = [
  {
    name: 'Aktif (hep oyunda)',
    tps: (t) => (t < 5 * MIN ? 3.5 : t < 20 * MIN ? 2 : t < HOUR ? 1 : 0.3),
    online: () => true,
    duration: 8 * HOUR,
  },
  {
    name: 'Rahat (ilk 20 dk oyunda, sonra her 3 saatte 5 dk)',
    tps: (t) => (t < 5 * MIN ? 3 : t < 20 * MIN ? 1.5 : 0.5),
    online: (t) => {
      if (t < 20 * MIN) return true;
      const cycle = 3 * HOUR;
      const into = (t - 20 * MIN) % cycle;
      return into < 5 * MIN ? true : t + (cycle - into);
    },
    duration: 3 * 24 * HOUR,
  },
];

function clone(s: GameState): GameState {
  return {
    ...s,
    mana: new Decimal(s.mana),
    manaRun: new Decimal(s.manaRun),
    creatures: [...s.creatures],
    scrolls: new Set(s.scrolls),
    buffs: [],
    huma: { ...s.huma },
    tipsSeen: new Set(),
    stats: { ...s.stats, manaAllTime: new Decimal(s.stats.manaAllTime) },
  };
}

function income(s: GameState, tps: number): Decimal {
  const tap = tapValue(s).mul(1 + critChance(s) * (critMult(s) - 1));
  return totalProduction(s).add(tap.mul(tps));
}

interface Option {
  label: string;
  cost: Decimal;
  gain: Decimal;
  apply: (s: GameState) => void;
}

function options(s: GameState, tps: number): Option[] {
  const now = income(s, tps);
  const opts: Option[] = [];
  const horizon = s.mana.add(now.mul(2 * HOUR));
  const probe = (label: string, cost: Decimal, apply: (s: GameState) => void) => {
    if (cost.gt(horizon)) return; // iki saatten uzak alımları düşünme
    const c = clone(s);
    c.mana = cost.add(1);
    apply(c);
    opts.push({ label, cost, gain: income(c, tps).sub(now), apply });
  };

  if (!s.circleRepaired) {
    // Hedef çubuğu gösterdiği için oyuncu çembere odaklanır; yolda ucuz dokunuş yükseltmelerini alır.
    const up = tapUpgradeCost(s.tapLevel);
    if (up.lt(CIRCLE_COST * 0.25)) probe('Kristali Parlat', up, buyTapUpgrade);
    else opts.push({ label: 'Çember', cost: new Decimal(CIRCLE_COST), gain: new Decimal(1e9), apply: repairCircle });
    return opts;
  }

  probe('Kristali Parlat', tapUpgradeCost(s.tapLevel), buyTapUpgrade);
  const highest = s.creatures.reduce((h, n, i) => (n > 0 ? i : h), -1);
  for (let i = 0; i <= Math.min(highest + 1, CREATURES.length - 1); i++) {
    probe(CREATURES[i].name, creatureCost(i, s.creatures[i]), (c) => buyCreature(c, i, 1));
  }
  if (libraryUnlocked(s)) {
    for (const sc of SCROLLS) {
      if (s.scrolls.has(sc.id) || !sc.requires(s)) continue;
      probe(sc.name, new Decimal(sc.cost), (c) => buyScroll(c, sc.id));
    }
  }
  return opts;
}

function pick(s: GameState, tps: number): Option | undefined {
  const inc = income(s, tps);
  let best: Option | undefined;
  let bestScore = Infinity;
  for (const o of options(s, tps)) {
    // Üretime etkisi olmayan (çevrimdışı, Hüma) parşömenler: ucuzsa al.
    if (o.gain.lte(0)) {
      if (o.cost.lt(inc.mul(120)) && o.cost.lte(s.mana)) return o;
      continue;
    }
    const wait = Decimal.max(0, o.cost.sub(s.mana)).div(inc).toNumber();
    const score = wait + o.cost.div(o.gain).toNumber();
    if (score < bestScore) {
      bestScore = score;
      best = o;
    }
  }
  return best;
}

function run(p: Profile): void {
  const s = newGame(0);
  let t = 0;
  const log: [number, string][] = [];
  const mark = (text: string) => log.push([t, text]);
  const firstOwned = new Set<number>();
  const manaMarks = [1e6, 1e9, 1e12, 1e15];
  let harmony = 0;
  const shares: string[] = [];
  const shareAt = [5, 10, 15, 30, 60, 120].map((m) => m * MIN);

  const note = () => {
    while (manaMarks.length && s.manaRun.gte(manaMarks[0])) mark(`Bu turda ${fmt(manaMarks.shift()!)} mana`);
    s.creatures.forEach((n, i) => {
      if (n > 0 && !firstOwned.has(i)) {
        firstOwned.add(i);
        mark(`İlk ${CREATURES[i].name}`);
      }
    });
    const minOwned = Math.min(...s.creatures);
    while (harmony < HARMONY_LEVELS.length && minOwned >= HARMONY_LEVELS[harmony]) {
      mark(`Uyum ${++harmony} (her türden ${HARMONY_LEVELS[harmony - 1]})`);
    }
  };

  let floor = 1;
  const progress = (dt: number, tps: number) => {
    const inc = income(s, tps);
    while (shareAt.length && t + dt >= shareAt[0]) {
      const tap = inc.sub(totalProduction(s));
      const pct = inc.gt(0) ? tap.div(inc).toNumber() * 100 : 0;
      shares.push(`${fmtTime(shareAt.shift()!)}: gelir ${fmt(inc, 1)}/sn, dokunuş payı %${pct.toFixed(0)}`);
    }
    earn(s, inc.mul(dt));
    t += dt;
  };

  while (t < p.duration) {
    const on = p.online(t);
    if (on !== true) {
      const away = Math.min(on, p.duration) - t;
      const counted = Math.min(away, offlineCapSeconds(s));
      earn(s, totalProduction(s).mul(counted * offlineEfficiency(s)));
      t += away;
      note();
      continue;
    }
    const tps = p.tps(t);
    const o = pick(s, tps);
    if (!o) {
      progress(10, tps);
      continue;
    }
    const inc = income(s, tps);
    if (s.mana.lt(o.cost)) {
      const wait = o.cost.sub(s.mana).div(inc).toNumber();
      // Uzun beklemede oturum bitebilir ya da dokunma temposu değişebilir: parça parça ilerle.
      progress(Math.min(Math.max(wait, 0.01), 30), tps);
      continue;
    }
    o.apply(s);
    checkUnlocks(s);
    if (s.floor > floor) {
      floor = s.floor;
      mark(`Kat ${floor} açıldı`);
    }
    if (o.label === 'Çember') mark('Çağırma Çemberi onarıldı (IDLE başlar)');
    note();
  }

  console.log(`\n=== ${p.name} ===`);
  for (const [time, text] of log) console.log(`${fmtTime(time).padStart(12)}  ${text}`);
  console.log('  -- gelir dağılımı --');
  for (const line of shares) console.log('  ' + line);
  console.log(
    `  Son: dokunuş seviyesi ${s.tapLevel}, yaratıklar [${s.creatures.join(', ')}], parşömen ${s.scrolls.size}/${SCROLLS.length}`,
  );
}

for (const p of PROFILES) run(p);

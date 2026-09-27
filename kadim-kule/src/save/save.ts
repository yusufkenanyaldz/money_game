import { CREATURES } from '../data/creatures';
import { SCROLL_BY_ID } from '../data/scrolls';
import { Decimal, defaultSettings, newGame, type Buff, type GameState } from '../core/state';

export const SAVE_VERSION = 1;
export const STORAGE_KEY = 'kadim-kule-kayit';
const EXPORT_PREFIX = 'KADIMKULE1:';

/** Kayıt dosyasının düz JSON biçimi. Yeni alanlar eklendikçe SAVE_VERSION artar. */
export interface SaveData {
  v: number;
  mana: string;
  manaRun: string;
  tapLevel: number;
  circleRepaired: boolean;
  creatures: number[];
  scrolls: string[];
  floor: number;
  buffs: Buff[];
  huma: { nextIn: number; visibleFor: number };
  tipsSeen: string[];
  settings: GameState['settings'];
  stats: Omit<GameState['stats'], 'manaAllTime'> & { manaAllTime: string };
  lastTick: number;
}

export function toSaveData(s: GameState): SaveData {
  return {
    v: SAVE_VERSION,
    mana: s.mana.toString(),
    manaRun: s.manaRun.toString(),
    tapLevel: s.tapLevel,
    circleRepaired: s.circleRepaired,
    creatures: [...s.creatures],
    scrolls: [...s.scrolls],
    floor: s.floor,
    buffs: s.buffs.map((b) => ({ ...b })),
    huma: { ...s.huma },
    tipsSeen: [...s.tipsSeen],
    settings: { ...s.settings },
    stats: { ...s.stats, manaAllTime: s.stats.manaAllTime.toString() },
    lastTick: s.lastTick,
  };
}

function num(v: unknown, fallback: number): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}

function dec(v: unknown): Decimal {
  if (typeof v !== 'string' && typeof v !== 'number') return new Decimal(0);
  try {
    const d = new Decimal(v);
    return Number.isFinite(d.mantissa) && d.gte(0) ? d : new Decimal(0);
  } catch {
    return new Decimal(0);
  }
}

/** Eski sürüm kayıtlarını güncel biçime taşır. Şimdilik yalnızca v1 var. */
function migrate(raw: Record<string, unknown>): Record<string, unknown> {
  const v = num(raw.v, 0);
  if (v > SAVE_VERSION) throw new Error('Bu kayıt oyunun daha yeni bir sürümüne ait.');
  return raw;
}

/** Güvenilmeyen veriden oyun durumu kurar; eksik ya da bozuk alanlara varsayılan verir. */
export function fromSaveData(input: unknown, now = Date.now()): GameState {
  if (!input || typeof input !== 'object') throw new Error('Kayıt okunamadı.');
  const raw = migrate(input as Record<string, unknown>);
  const s = newGame(now);

  s.mana = dec(raw.mana);
  s.manaRun = dec(raw.manaRun);
  s.tapLevel = Math.max(0, Math.floor(num(raw.tapLevel, 0)));
  s.circleRepaired = raw.circleRepaired === true;
  const owned = raw.creatures;
  if (Array.isArray(owned)) {
    s.creatures = CREATURES.map((_, i) => Math.max(0, Math.floor(num(owned[i], 0))));
  }
  if (Array.isArray(raw.scrolls)) {
    s.scrolls = new Set(raw.scrolls.filter((id): id is string => typeof id === 'string' && SCROLL_BY_ID.has(id)));
  }
  s.floor = Math.min(7, Math.max(1, Math.floor(num(raw.floor, 1))));
  if (Array.isArray(raw.buffs)) {
    s.buffs = raw.buffs
      .filter((b): b is Buff => !!b && typeof b === 'object' && (b.id === 'huma-uretim' || b.id === 'huma-dokunus'))
      .map((b) => ({ id: b.id, remaining: num(b.remaining, 0), duration: num(b.duration, 1), mult: num(b.mult, 1) }))
      .filter((b) => b.remaining > 0);
  }
  const huma = raw.huma as Partial<GameState['huma']> | undefined;
  s.huma = { nextIn: num(huma?.nextIn, 60), visibleFor: Math.max(0, num(huma?.visibleFor, 0)) };
  if (Array.isArray(raw.tipsSeen)) s.tipsSeen = new Set(raw.tipsSeen.filter((t): t is string => typeof t === 'string'));

  const set = (raw.settings ?? {}) as Partial<GameState['settings']>;
  const def = defaultSettings();
  s.settings = {
    sfx: typeof set.sfx === 'boolean' ? set.sfx : def.sfx,
    music: typeof set.music === 'boolean' ? set.music : def.music,
    volume: Math.min(1, Math.max(0, num(set.volume, def.volume))),
    notation: set.notation === 'bilimsel' ? 'bilimsel' : 'tr',
    vibration: typeof set.vibration === 'boolean' ? set.vibration : def.vibration,
  };

  const st = (raw.stats ?? {}) as Partial<SaveData['stats']>;
  s.stats = {
    taps: num(st.taps, 0),
    crits: num(st.crits, 0),
    humaCaught: num(st.humaCaught, 0),
    playTime: num(st.playTime, 0),
    startedAt: num(st.startedAt, now),
    manaAllTime: dec(st.manaAllTime),
  };
  s.lastTick = num(raw.lastTick, now);
  return s;
}

// ---- Tarayıcı deposu (her çağrı korumalı: gizli sekme vb. durumlarda hata atabilir) ----

export function saveToStorage(s: GameState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSaveData(s)));
    return true;
  } catch {
    return false;
  }
}

export function loadFromStorage(): GameState | undefined {
  try {
    const text = localStorage.getItem(STORAGE_KEY);
    if (!text) return undefined;
    return fromSaveData(JSON.parse(text));
  } catch {
    return undefined;
  }
}

export function clearStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // depo kapalıysa silinecek bir şey de yok
  }
}

// ---- Dışa / içe aktarma ----

function toBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function fromBase64(b64: string): string {
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function exportSave(s: GameState): string {
  return EXPORT_PREFIX + toBase64(JSON.stringify(toSaveData(s)));
}

export function importSave(text: string, now = Date.now()): GameState {
  const t = text.trim();
  if (!t.startsWith(EXPORT_PREFIX)) throw new Error('Bu bir Kadim Kule kaydı değil.');
  let data: unknown;
  try {
    data = JSON.parse(fromBase64(t.slice(EXPORT_PREFIX.length)));
  } catch {
    throw new Error('Kayıt metni bozuk ya da eksik kopyalanmış.');
  }
  return fromSaveData(data, now);
}

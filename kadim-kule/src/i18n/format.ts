import Decimal from 'break_infinity.js';
import type { Notation } from '../core/state';

/** 10^(3k) için Türkçe kısaltmalar: bin, milyon, milyar, trilyon, katrilyon… */
export const SUFFIXES = ['', 'B', 'Mn', 'Mr', 'Tn', 'Kd', 'Kn', 'Sk', 'Sp', 'Ok', 'Nn', 'Dc'];

let notation: Notation = 'tr';

export function setNotation(n: Notation): void {
  notation = n;
}

function comma(s: string): string {
  return s.replace('.', ',');
}

/** Ondalık basamağı yuvarlamadan keser (gösterilen, eldekinden fazla olmasın). */
function truncFixed(x: number, digits: number): string {
  const f = 10 ** digits;
  return comma((Math.floor(x * f + 1e-9) / f).toFixed(digits));
}

function mantissaDigits(m: number): number {
  return m < 10 ? 2 : m < 100 ? 1 : 0;
}

/** Binlik ayırıcılı tam sayı: 12.500 */
function grouped(n: number): string {
  return String(Math.floor(n + 1e-9)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Büyük sayı biçimi. Milyonun altı tam sayı olarak ("12.500"; küçük sayılarda decimals
 * kadar ondalıkla), üstü "1,23 Mn" ya da bilimsel "1,23e45" olarak yazılır.
 */
export function fmt(value: Decimal | number, decimals = 0): string {
  const d = value instanceof Decimal ? value : new Decimal(value);
  if (d.lt(0)) return '-' + fmt(d.neg(), decimals);
  const small = notation === 'tr' ? 1e6 : 1e3;
  if (d.lt(small)) {
    const n = d.toNumber();
    if (decimals === 0 || Number.isInteger(n) || n >= 100) return grouped(n);
    return truncFixed(n, n < 10 ? decimals : Math.min(decimals, 1));
  }
  const e = d.exponent;
  const tier = Math.floor(e / 3);
  if (notation === 'tr' && tier < SUFFIXES.length) {
    const m = d.div(Decimal.pow(10, tier * 3)).toNumber();
    return `${truncFixed(m, mantissaDigits(m))} ${SUFFIXES[tier]}`;
  }
  return `${truncFixed(d.mantissa, 2)}e${e}`;
}

/** Saniyelik üretim gibi küçük değerlerde bir ondalık gösterir. */
export function fmtRate(value: Decimal | number): string {
  return fmt(value, 1);
}

export function fmtTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  if (s < 60) return `${s} sn`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} dk${s % 60 && m < 10 ? ` ${s % 60} sn` : ''}`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} sa${m % 60 ? ` ${m % 60} dk` : ''}`;
  const g = Math.floor(h / 24);
  return `${g} gün${h % 24 ? ` ${h % 24} sa` : ''}`;
}

/** Türkçe büyük harf (i → İ). */
export function upperTr(s: string): string {
  return s.toLocaleUpperCase('tr-TR');
}

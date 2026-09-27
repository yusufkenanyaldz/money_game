import { afterEach, describe, expect, it } from 'vitest';
import { Decimal, newGame } from '../src/core/state';
import { fmt, fmtRate, fmtTime, setNotation, upperTr } from '../src/i18n/format';
import { exportSave, fromSaveData, importSave, toSaveData } from '../src/save/save';
import { effectText, iyelik } from '../src/ui/text';

describe('kayıt', () => {
  it('dışa aktarma ve içe aktarma durumu korur', () => {
    const s = newGame(1000);
    s.mana = new Decimal('1.2345e40');
    s.creatures[3] = 17;
    s.scrolls.add('peri-1');
    s.tipsSeen.add('hosgeldin');
    s.settings.notation = 'bilimsel';
    s.stats.taps = 42;
    const back = importSave(exportSave(s), 2000);
    expect(back.mana.eq(s.mana)).toBe(true);
    expect(back.creatures[3]).toBe(17);
    expect(back.scrolls.has('peri-1')).toBe(true);
    expect(back.tipsSeen.has('hosgeldin')).toBe(true);
    expect(back.settings.notation).toBe('bilimsel');
    expect(back.stats.taps).toBe(42);
  });

  it('Türkçe karakterli içerik base64 dönüşümünden sağlam çıkar', () => {
    const s = newGame(0);
    s.tipsSeen.add('ığüşöç-İ');
    expect(importSave(exportSave(s)).tipsSeen.has('ığüşöç-İ')).toBe(true);
  });

  it('bozuk ya da yabancı metni reddeder', () => {
    expect(() => importSave('merhaba')).toThrow('Kadim Kule kaydı değil');
    expect(() => importSave('KADIMKULE1:@@@')).toThrow('bozuk');
  });

  it('eksik ve geçersiz alanlara varsayılan verir', () => {
    const s = fromSaveData({ v: 1, mana: 'saçma', creatures: [5, -3, 'x'], scrolls: ['yok-boyle', 'peri-1'], floor: 99 });
    expect(s.mana.toNumber()).toBe(0);
    expect(s.creatures.slice(0, 3)).toEqual([5, 0, 0]);
    expect([...s.scrolls]).toEqual(['peri-1']);
    expect(s.floor).toBe(7);
    expect(s.settings.sfx).toBe(true);
  });

  it('daha yeni sürüm kaydını reddeder', () => {
    expect(() => fromSaveData({ ...toSaveData(newGame(0)), v: 999 })).toThrow('daha yeni');
  });
});

describe('sayı biçimi', () => {
  afterEach(() => setNotation('tr'));

  it('milyonun altı binlik ayırıcılı tam sayıdır', () => {
    expect(fmt(0)).toBe('0');
    expect(fmt(999.9)).toBe('999');
    expect(fmt(2500)).toBe('2.500');
    expect(fmt(999_999)).toBe('999.999');
  });

  it('küçük hızlar ondalıkla yazılır', () => {
    expect(fmtRate(0.5)).toBe('0,5');
    expect(fmtRate(12.34)).toBe('12,3');
    expect(fmtRate(150.7)).toBe('150');
  });

  it('büyük sayılar Türkçe kısaltmayla ve yuvarlanmadan yazılır', () => {
    expect(fmt(1_234_567)).toBe('1,23 Mn');
    expect(fmt(999_999_999)).toBe('999 Mn');
    expect(fmt(4.5e9)).toBe('4,50 Mr');
    expect(fmt(1e12)).toBe('1,00 Tn');
    expect(fmt(new Decimal('3.21e15'))).toBe('3,21 Kd');
  });

  it('kısaltmalar bitince ve bilimsel kipte e gösterimi kullanılır', () => {
    expect(fmt(new Decimal('1.5e40'))).toBe('1,50e40');
    setNotation('bilimsel');
    expect(fmt(1500)).toBe('1,50e3');
    expect(fmt(999)).toBe('999');
  });

  it('süreler okunur biçimde yazılır', () => {
    expect(fmtTime(45)).toBe('45 sn');
    expect(fmtTime(125)).toBe('2 dk 5 sn');
    expect(fmtTime(3 * 3600 + 20 * 60)).toBe('3 sa 20 dk');
    expect(fmtTime(26 * 3600)).toBe('1 gün 2 sa');
  });

  it('Türkçe büyük harf i/İ ayrımını korur', () => {
    expect(upperTr('çağırma iyesi')).toBe('ÇAĞIRMA İYESİ');
  });
});

describe('Türkçe metinler', () => {
  it('yüzde iyelik ekleri ünlü uyumuna uyar', () => {
    expect([2, 3, 5, 6, 9, 10, 25, 40, 100].map((n) => `%${n}'${iyelik(n)}`)).toEqual([
      "%2'si",
      "%3'ü",
      "%5'i",
      "%6'sı",
      "%9'u",
      "%10'u",
      "%25'i",
      "%40'ı",
      "%100'ü",
    ]);
  });

  it('parşömen etkileri anlaşılır yazılır', () => {
    expect(effectText({ kind: 'creature', creature: 0, mult: 2 })).toBe('Peri üretimi ×2');
    expect(effectText({ kind: 'resonance', pct: 3 })).toBe("Her dokunuş, saniyelik üretimin %3'ü kadar ek mana verir");
  });
});

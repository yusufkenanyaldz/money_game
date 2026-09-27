import {
  critChance,
  offlineCapSeconds,
  offlineEfficiency,
  tapValue,
  totalProduction,
} from '../core/formulas';
import { newGame, type Notation } from '../core/state';
import { FLOORS } from '../data/floors';
import { fmt, fmtRate, fmtTime } from '../i18n/format';
import { clearStorage, exportSave, importSave } from '../save/save';
import { h, icon, show, text, toggle } from './dom';
import type { IconName } from './icons.gen';
import type { Game, View } from './types';

export const VERSION = '0.1.0';

export class TowerView implements View {
  el: HTMLElement;
  private floorEls: { el: HTMLElement; name: (v: string) => void; desc: (v: string) => void }[] = [];
  private stats: [(v: string) => void, () => string][] = [];
  private shownFloor = 0;
  private switches: { btn: HTMLButtonElement; get: () => boolean }[] = [];

  constructor(private game: Game) {
    const tower = h('div', { class: 'kule' }, h('div', { class: 'kule-tepe', 'aria-hidden': 'true' }));
    for (const f of [...FLOORS].reverse()) {
      const nameEl = h('div', { class: 'kat-ad' });
      const descEl = h('div', { class: 'kat-aciklama' });
      const el = h(
        'div',
        { class: 'kat' },
        h('div', { class: 'kat-pencere' }, icon(f.icon)),
        h('div', {}, h('div', { class: 'kat-no' }, `${f.n}. KAT`), nameEl, descEl),
        h('div', { class: 'kat-kilit' }, icon('kilit')),
      );
      tower.append(el);
      this.floorEls[f.n] = { el, name: text(nameEl), desc: text(descEl) };
    }

    this.el = h(
      'section',
      { class: 'sayfa', 'aria-label': 'Kule' },
      h('h2', { class: 'bolum-baslik' }, 'Kadim Kule'),
      h('p', { class: 'bolum-not' }, 'Kule kat kat uyanıyor. Mühürlü katlar ileride açılacak.'),
      tower,
      h('h2', { class: 'bolum-baslik' }, 'Kayıtlar'),
      this.statsTable(),
      h('h2', { class: 'bolum-baslik' }, 'Ayarlar'),
      ...this.settings(),
      h('h2', { class: 'bolum-baslik' }, 'Kayıt'),
      this.saveSection(),
      h('h2', { class: 'bolum-baslik' }, 'Emeği geçenler'),
      h(
        'p',
        { class: 'kucuk-not' },
        'İkonlar: ',
        h('a', { href: 'https://game-icons.net', target: '_blank', rel: 'noopener' }, 'game-icons.net'),
        ' (Lorc, Delapouite ve diğer çizerler), ',
        h('a', { href: 'https://creativecommons.org/licenses/by/3.0/', target: '_blank', rel: 'noopener' }, 'CC BY 3.0'),
        ' lisansıyla. Yazı tipleri: El Messiri ve Alegreya Sans (SIL OFL). Sesler ve müzik oyun içinde üretilir.',
      ),
      h('p', { class: 'kucuk-not' }, `Kadim Kule · sürüm ${VERSION}`),
    );
  }

  private statsTable(): HTMLElement {
    const s = () => this.game.state;
    const rows: [string, () => string][] = [
      ['Saniyelik üretim', () => `${fmtRate(totalProduction(s()))} mana`],
      ['Dokunuş değeri', () => `${fmt(tapValue(s()), 1)} mana`],
      ['Kritik şansı', () => `%${Math.round(critChance(s()) * 100)}`],
      ['Toplam dokunuş', () => fmt(s().stats.taps)],
      ['Kritik dokunuş', () => fmt(s().stats.crits)],
      ['Yakalanan Hüma', () => fmt(s().stats.humaCaught)],
      ['Toplanan mana (tüm zamanlar)', () => fmt(s().stats.manaAllTime)],
      ['Oynama süresi', () => fmtTime(s().stats.playTime)],
      ['Çevrimdışı kazanç', () => `%${Math.round(offlineEfficiency(s()) * 100)}, en çok ${fmtTime(offlineCapSeconds(s()))}`],
    ];
    const table = h('div', { class: 'tablo' });
    for (const [label, get] of rows) {
      const v = h('div');
      table.append(h('div', {}, label), v);
      this.stats.push([text(v), get]);
    }
    return table;
  }

  private switchRow(ic: IconName, label: string, get: () => boolean, set: (v: boolean) => void): HTMLElement {
    const btn = h('button', {
      class: 'anahtar',
      type: 'button',
      role: 'switch',
      'aria-checked': String(get()),
      'aria-label': label,
      onclick: () => {
        set(!get());
        this.game.applySettings();
        this.game.save();
      },
    });
    this.switches.push({ btn, get });
    return h('div', { class: 'ayar' }, icon(ic), h('span', {}, label), btn);
  }

  private settings(): HTMLElement[] {
    const st = () => this.game.state.settings;
    const volume = h('input', {
      id: 'ses-duzeyi',
      type: 'range',
      min: '0',
      max: '100',
      step: '5',
      'aria-label': 'Ses düzeyi',
    });
    volume.value = String(Math.round(st().volume * 100));
    volume.addEventListener('input', () => {
      st().volume = Number(volume.value) / 100;
      this.game.applySettings();
    });
    volume.addEventListener('change', () => this.game.save());

    const notation = h('button', { class: 'dugme dugme-ikincil', type: 'button' });
    const notationText = text(notation);
    const labels: Record<Notation, string> = { tr: '1,5 Mn', bilimsel: '1,5e6' };
    notationText(labels[st().notation]);
    notation.addEventListener('click', () => {
      st().notation = st().notation === 'tr' ? 'bilimsel' : 'tr';
      notationText(labels[st().notation]);
      this.game.applySettings();
      this.game.save();
    });

    return [
      this.switchRow('sesAcik', 'Ses efektleri', () => st().sfx, (v) => (st().sfx = v)),
      this.switchRow('muzik', 'Müzik', () => st().music, (v) => (st().music = v)),
      h('div', { class: 'ayar' }, icon('sesAcik'), h('label', { for: 'ses-duzeyi' }, 'Ses düzeyi'), volume),
      this.switchRow('titresim', 'Titreşim', () => st().vibration, (v) => (st().vibration = v)),
      h('div', { class: 'ayar' }, icon('yazit'), h('span', {}, 'Sayı gösterimi'), notation),
    ];
  }

  private saveSection(): HTMLElement {
    const area = h('div', { class: 'sayfa' });
    const exportBtn = h('button', { class: 'dugme dugme-ikincil', type: 'button' }, icon('yukle'), 'Dışa aktar');
    const importBtn = h('button', { class: 'dugme dugme-ikincil', type: 'button' }, icon('indir'), 'İçe aktar');
    const resetBtn = h('button', { class: 'dugme dugme-tehlike', type: 'button' }, icon('cop'), 'Sıfırla');

    exportBtn.addEventListener('click', () => {
      const code = exportSave(this.game.state);
      const box = h('textarea', { id: 'kayit-disa', class: 'kayit-metni', readonly: true, 'aria-label': 'Kayıt metni' });
      box.value = code;
      const status = h('p', { class: 'kucuk-not' }, 'Bu metni güvenli bir yere kopyala. İçe aktar ile geri yükleyebilirsin.');
      const copy = h('button', { class: 'dugme', type: 'button' }, 'Kopyala');
      copy.addEventListener('click', () => {
        navigator.clipboard
          .writeText(code)
          .then(() => (status.textContent = 'Kopyalandı.'))
          .catch(() => {
            box.focus();
            box.select();
            status.textContent = 'Kopyalanamadı; metin seçildi, elle kopyalayabilirsin.';
          });
      });
      area.replaceChildren(box, copy, status);
    });

    importBtn.addEventListener('click', () => {
      const box = h('textarea', { id: 'kayit-ice', class: 'kayit-metni', 'aria-label': 'İçe aktarılacak kayıt', placeholder: 'KADIMKULE1:…' });
      const err = h('p', { class: 'hata', role: 'alert' });
      const load = h('button', { class: 'dugme', type: 'button' }, 'Kaydı yükle');
      load.addEventListener('click', () => {
        try {
          const s = importSave(box.value);
          this.game.replaceState(s);
          this.game.toast('Kayıt yüklendi.', 'kaydet');
          area.replaceChildren();
        } catch (e) {
          err.textContent = e instanceof Error ? e.message : 'Kayıt yüklenemedi.';
        }
      });
      area.replaceChildren(box, load, err);
    });

    resetBtn.addEventListener('click', () => {
      const yes = h('button', { class: 'dugme dugme-tehlike', type: 'button' }, 'Evet, her şeyi sil');
      const no = h('button', { class: 'dugme dugme-ikincil', type: 'button' }, 'Vazgeç');
      yes.addEventListener('click', () => {
        const keep = this.game.state.settings;
        clearStorage();
        const s = newGame();
        s.settings = keep;
        this.game.replaceState(s);
        area.replaceChildren();
      });
      no.addEventListener('click', () => area.replaceChildren());
      area.replaceChildren(
        h('p', { class: 'hata' }, 'Tüm ilerlemen silinir ve oyun baştan başlar. Bu geri alınamaz.'),
        h('div', { class: 'satir-dugmeler' }, no, yes),
      );
    });

    return h(
      'div',
      { class: 'sayfa' },
      h('p', { class: 'kucuk-not' }, 'Oyun kendini bu cihazda otomatik kaydeder. Başka cihaza taşımak için dışa aktar.'),
      h('div', { class: 'satir-dugmeler' }, exportBtn, importBtn, resetBtn),
      area,
    );
  }

  update(): void {
    const s = this.game.state;
    if (s.floor !== this.shownFloor) {
      this.shownFloor = s.floor;
      for (const f of FLOORS) {
        const v = this.floorEls[f.n];
        const open = s.floor >= f.n;
        toggle(v.el, 'acik', open);
        show(v.el.querySelector('.kat-kilit') as HTMLElement, !open);
        v.name(open ? f.name : f.sealed ? 'Mühürlü kat' : '???');
        v.desc(open ? f.desc : f.sealed ? 'Kapısı yakında açılacak.' : f.hint);
      }
    }
    for (const [set, get] of this.stats) set(get());
    for (const sw of this.switches) {
      const v = String(sw.get());
      if (sw.btn.getAttribute('aria-checked') !== v) sw.btn.setAttribute('aria-checked', v);
    }
  }
}

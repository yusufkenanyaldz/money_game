import { Sound } from '../audio/sound';
import { advance, catchHuma, repairCircle } from '../core/actions';
import type { GameEvent } from '../core/events';
import { CIRCLE_COST, HUMA_VISIBLE, OFFLINE_THRESHOLD, tapValue, totalProduction } from '../core/formulas';
import { currentGoal } from '../core/goals';
import { applyOffline, type OfflineReport } from '../core/offline';
import type { GameState } from '../core/state';
import { CREATURES } from '../data/creatures';
import { FLOORS } from '../data/floors';
import { SCROLL_BY_ID } from '../data/scrolls';
import { TIPS } from '../data/tips';
import { fmt, fmtRate, fmtTime, setNotation } from '../i18n/format';
import { saveToStorage } from '../save/save';
import { CreaturesView } from './creatures';
import { CrystalView } from './crystal';
import { cssVar, disable, h, icon, show, text, toggle } from './dom';
import type { IconName } from './icons.gen';
import { LibraryView } from './library';
import { Starfield } from './stars';
import { BUFF_TEXT, HUMA_REWARD_TEXT } from './text';
import { TowerView } from './tower';
import type { Game, TabId, View } from './types';

const TICK = 0.1;
const AUTOSAVE_MS = 10_000;

interface Tab {
  id: TabId;
  label: string;
  icon: IconName;
  view: View;
  btn: HTMLButtonElement;
  badge: HTMLElement;
  unlocked: () => boolean;
  shown: boolean;
  fresh: boolean;
}

export class App implements Game {
  state: GameState;
  readonly sound = new Sound();

  private root: HTMLElement;
  private main: HTMLElement;
  private tabs: Tab[] = [];
  private active: TabId = 'kristal';
  private toasts: HTMLElement;
  private stars: Starfield;

  // üst çubuk
  private manaText: (v: string) => void;
  private subText: (v: string) => void;
  private buffBox: HTMLElement;
  private buffKey = '';
  private buffBars: ((v: string) => void)[] = [];
  private buffLabels: ((v: string) => void)[] = [];
  private muteBtn: HTMLButtonElement;
  private muteIcon = '';

  // hedef
  private goalText: (v: string) => void;
  private goalBar: (v: string) => void;
  private goalBtn: HTMLButtonElement;
  private goalBtnCost: (v: string) => void;

  // üstat
  private mentor: HTMLElement;
  private mentorText: (v: string) => void;
  private mentorTip?: string;

  // Hüma
  private huma: HTMLButtonElement;
  private humaPath = { y: 0.3, dir: 1, amp: 40 };

  private acc = 0;
  private saveTimer?: number;
  private hiddenAt?: number;

  constructor(state: GameState) {
    this.state = state;
    setNotation(state.settings.notation);
    this.sound.configure(state.settings);

    this.stars = new Starfield();

    // ---- üst çubuk ----
    const manaNum = h('div', { class: 'mana-sayi', 'aria-live': 'off' });
    const sub = h('div', { class: 'mana-alt' });
    this.manaText = text(manaNum);
    this.subText = (() => {
      let last = '';
      return (v: string) => {
        if (v !== last) {
          sub.innerHTML = v;
          last = v;
        }
      };
    })();
    this.muteBtn = h('button', { class: 'yuvarlak', type: 'button', 'aria-label': 'Sesi aç/kapat', onclick: () => this.toggleMute() });
    this.buffBox = h('div', { class: 'etkiler' });
    const header = h(
      'header',
      { class: 'ust' },
      h('div', { class: 'mana' }, h('span', { class: 'mana-ikon' }, icon('kristal')), h('div', {}, manaNum, sub)),
      h('div', { class: 'ust-dugmeler' }, this.muteBtn),
      this.buffBox,
    );

    // ---- hedef ----
    const goalTextEl = h('div', { class: 'hedef-metin' });
    const goalBarEl = h('div', { class: 'cubuk' });
    const goalCost = h('span', { class: 'maliyet' });
    this.goalBtn = h(
      'button',
      { class: 'dugme hedef-dugme', type: 'button', onclick: () => this.handle(repairCircle(this.state)) },
      h('span', { class: 'ust-yazi' }, 'Onar'),
      goalCost,
    );
    this.goalText = text(goalTextEl);
    this.goalBar = cssVar(goalBarEl, '--p');
    this.goalBtnCost = text(goalCost);
    const goal = h(
      'div',
      { class: 'hedef', role: 'status' },
      h('div', {}, h('div', { class: 'hedef-etiket' }, 'HEDEF'), goalTextEl),
      this.goalBtn,
      goalBarEl,
    );

    // ---- sayfalar ve sekmeler ----
    this.main = h('main', { class: 'icerik' });
    const tabBar = h('nav', { class: 'sekmeler', role: 'tablist', 'aria-label': 'Kule katları' });
    const defs: [TabId, string, IconName, View, () => boolean][] = [
      ['kristal', 'Kristal', 'kristal', new CrystalView(this), () => true],
      ['yaratiklar', 'Yaratıklar', 'cember', new CreaturesView(this), () => this.state.floor >= 2],
      ['kutuphane', 'Kütüphane', 'kutuphane', new LibraryView(this), () => this.state.floor >= 3],
      ['kule', 'Kule', 'kule', new TowerView(this), () => true],
    ];
    for (const [id, label, ic, view, unlocked] of defs) {
      const badge = h('span', { class: 'rozet', hidden: true });
      const btn = h(
        'button',
        { class: 'sekme', type: 'button', role: 'tab', 'aria-selected': 'false', onclick: () => this.setTab(id) },
        icon(ic),
        label,
        badge,
      );
      tabBar.append(btn);
      view.el.hidden = true;
      this.main.append(view.el);
      const shown = unlocked();
      btn.hidden = !shown;
      this.tabs.push({ id, label, icon: ic, view, btn, badge, unlocked, shown, fresh: false });
    }

    // ---- Üstadın Ruhu ----
    const mentorTextEl = h('div', { class: 'ustat-metin' });
    this.mentorText = text(mentorTextEl);
    this.mentor = h(
      'div',
      { class: 'ustat', role: 'dialog', 'aria-live': 'polite', hidden: true },
      h('div', { class: 'ustat-yuz' }, icon('ustat')),
      h('div', { class: 'ustat-ad' }, 'ÜSTADIN RUHU'),
      mentorTextEl,
      h('button', { class: 'dugme', type: 'button', onclick: () => this.dismissTip() }, 'Anladım'),
    );

    // ---- Hüma ----
    this.huma = h('button', { class: 'huma', type: 'button', 'aria-label': 'Hüma Kuşu: yakalamak için dokun', hidden: true }, icon('huma'));
    this.huma.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.handle(catchHuma(this.state));
    });
    this.huma.addEventListener('click', () => this.handle(catchHuma(this.state)));

    this.toasts = h('div', { class: 'bildirimler', 'aria-live': 'polite' });

    this.root = h(
      'div',
      { class: 'uygulama' },
      header,
      goal,
      this.main,
      h('div', { class: 'alt-cerceve' }, this.mentor, tabBar),
    );
    document.body.append(this.stars.canvas, this.root, this.huma, this.toasts);

    // Tarayıcılar sesi ilk etkileşimden sonra açar.
    const unlock = () => this.sound.unlock();
    window.addEventListener('pointerdown', unlock, { capture: true });
    window.addEventListener('keydown', unlock, { capture: true });

    document.addEventListener('visibilitychange', () => this.onVisibility());
    window.addEventListener('pagehide', () => this.save());
    window.setInterval(() => this.save(), AUTOSAVE_MS);

    this.setTab('kristal');
    this.catchUp(true);
    requestAnimationFrame(() => this.frame());
  }

  // ---- Game arayüzü ----

  handle(events: GameEvent[]): void {
    let important = false;
    for (const e of events) {
      switch (e.type) {
        case 'tap':
          this.sound.tap(e.crit);
          this.vibrate(e.crit ? 25 : 8);
          break;
        case 'tapUpgrade':
          this.sound.tapUpgrade();
          break;
        case 'buy':
          this.sound.buy();
          important = true;
          break;
        case 'milestone':
          this.sound.milestone();
          this.toast(`${CREATURES[e.creature].name} üretimi ×2! (${e.count} tane)`, CREATURES[e.creature].icon, true);
          break;
        case 'harmony':
          this.sound.milestone();
          this.toast(`Uyum! Her türden ${e.need} yaratık: tüm üretim ×2`, 'parilti', true);
          break;
        case 'scroll': {
          this.sound.scroll();
          const def = SCROLL_BY_ID.get(e.id);
          if (def) this.toast(`Okundu: ${def.name}`, def.icon);
          important = true;
          break;
        }
        case 'circle':
          important = true;
          break;
        case 'floor':
          this.sound.floor();
          this.announceFloor(e.floor);
          important = true;
          break;
        case 'humaAppear':
          this.sound.humaAppear();
          this.humaPath = {
            y: 0.2 + Math.random() * 0.35,
            dir: Math.random() < 0.5 ? 1 : -1,
            amp: 30 + Math.random() * 40,
          };
          break;
        case 'humaCatch':
          this.sound.humaCatch();
          this.vibrate(40);
          this.toast(
            e.amount ? `${HUMA_REWARD_TEXT[e.reward]}: +${fmt(e.amount)} mana` : HUMA_REWARD_TEXT[e.reward],
            'huma',
            true,
          );
          break;
        case 'humaLeave':
        case 'buffEnd':
          break;
      }
    }
    if (important) this.saveSoon();
  }

  save(): void {
    this.state.lastTick = Date.now();
    saveToStorage(this.state);
  }

  toast(msg: string, ic: IconName = 'parilti', gold = false): void {
    const el = h('div', { class: 'bildirim' + (gold ? ' altin' : '') }, icon(ic), h('span', {}, msg));
    this.toasts.append(el);
    while (this.toasts.children.length > 3) this.toasts.firstElementChild?.remove();
    el.addEventListener('animationend', () => el.remove());
  }

  modal(build: (close: () => void) => HTMLElement[]): void {
    const close = () => {
      veil.remove();
    };
    const box = h('div', { class: 'pencere', role: 'dialog', 'aria-modal': 'true' }, ...build(close));
    const veil = h('div', { class: 'perde' }, box);
    document.body.append(veil);
    (box.querySelector('button') as HTMLButtonElement | null)?.focus({ preventScroll: true });
  }

  vibrate(ms: number): void {
    if (!this.state.settings.vibration) return;
    try {
      navigator.vibrate?.(ms);
    } catch {
      // bazı tarayıcılar titreşimi desteklemez
    }
  }

  applySettings(): void {
    setNotation(this.state.settings.notation);
    this.sound.configure(this.state.settings);
  }

  replaceState(s: GameState): void {
    this.state = s;
    this.applySettings();
    for (const t of this.tabs) {
      t.shown = t.unlocked();
      t.btn.hidden = !t.shown;
      t.fresh = false;
    }
    this.setTab('kristal');
    this.catchUp(false);
    this.save();
  }

  /** Canlı yeniden yayında durum korunsun diye (Artifact sıcak yenileme). */
  snapshot(): GameState {
    this.save();
    return this.state;
  }

  // ---- iç işler ----

  private saveSoon(): void {
    window.clearTimeout(this.saveTimer);
    this.saveTimer = window.setTimeout(() => this.save(), 1500);
  }

  private setTab(id: TabId): void {
    this.active = id;
    for (const t of this.tabs) {
      const on = t.id === id;
      t.btn.setAttribute('aria-selected', String(on));
      t.view.el.hidden = !on;
      if (on) {
        t.fresh = false;
        t.view.update();
      }
    }
    this.main.scrollTop = 0;
  }

  private toggleMute(): void {
    const st = this.state.settings;
    const on = st.sfx || st.music;
    st.sfx = !on;
    st.music = !on;
    this.sound.unlock();
    this.applySettings();
    this.save();
  }

  private announceFloor(n: number): void {
    const f = FLOORS.find((x) => x.n === n);
    if (!f) return;
    const tab = this.tabs.find((t) => (n === 2 ? t.id === 'yaratiklar' : n === 3 ? t.id === 'kutuphane' : false));
    this.modal((close) => [
      h('div', { class: 'pencere-ikon' }, icon(f.icon)),
      h('p', {}, `${n}. KAT UYANDI`),
      h('h2', {}, f.name),
      h('p', {}, f.desc),
      h(
        'button',
        {
          class: 'dugme hazir',
          type: 'button',
          onclick: () => {
            close();
            if (tab) this.setTab(tab.id);
          },
        },
        tab ? `${tab.label} sekmesine git` : 'Devam',
      ),
    ]);
  }

  private showOffline(r: OfflineReport): void {
    if (r.gain.lte(0)) return;
    const capped = r.counted < r.away;
    this.modal((close) => [
      h('div', { class: 'pencere-ikon' }, icon('uyku')),
      h('h2', {}, 'Hoş geldin, çırak!'),
      h('p', {}, `Sen ${fmtTime(r.away)} yokken yaratıkların şunu topladı:`),
      h('div', { class: 'buyuk-sayi' }, `+${fmt(r.gain)} mana`),
      h(
        'p',
        {},
        `Çevrimdışı verim %${Math.round(r.efficiency * 100)}` +
          (capped ? ` · en çok ${fmtTime(r.counted)} sayılır. Kütüphanedeki parşömenler bu sınırı artırır.` : ''),
      ),
      h('button', { class: 'dugme hazir', type: 'button', onclick: close }, 'Topla'),
    ]);
  }

  /** Açılışta ya da uzun aradan dönüşte geçen süreyi işler. */
  private catchUp(showReport: boolean): void {
    const now = Date.now();
    const away = Math.max(0, (now - this.state.lastTick) / 1000);
    const report = applyOffline(this.state, away);
    if (report) {
      if (showReport) this.showOffline(report);
    } else if (away > 0) {
      this.handle(advance(this.state, away));
    }
    this.state.lastTick = now;
    this.acc = 0;
  }

  private onVisibility(): void {
    if (document.hidden) {
      this.hiddenAt = Date.now();
      this.save();
      this.sound.setHidden(true);
      this.stars.pause(true);
    } else {
      this.sound.setHidden(false);
      this.stars.pause(false);
      if (this.hiddenAt !== undefined) this.catchUp(true);
      this.hiddenAt = undefined;
    }
  }

  private dismissTip(): void {
    if (this.mentorTip) this.state.tipsSeen.add(this.mentorTip);
    this.mentorTip = undefined;
    this.mentor.hidden = true;
    this.saveSoon();
  }

  private frame(): void {
    if (!document.hidden) {
      // Süreyi duvar saatinden ölç: tarayıcı kareleri yavaşlatsa da zaman kaybolmaz.
      const now = Date.now();
      const dt = (now - this.state.lastTick) / 1000;
      if (dt >= OFFLINE_THRESHOLD) this.catchUp(true);
      else {
        this.acc += Math.max(0, dt);
        this.state.lastTick = now;
        const events: GameEvent[] = [];
        while (this.acc >= TICK) {
          events.push(...advance(this.state, TICK));
          this.acc -= TICK;
        }
        if (events.length) this.handle(events);
      }
      this.render();
    }
    requestAnimationFrame(() => this.frame());
  }

  private render(): void {
    const s = this.state;
    const prod = totalProduction(s);

    // üst çubuk
    this.manaText(fmt(s.mana));
    const tapPart = `dokunuş <b>${fmt(tapValue(s), 1)}</b>`;
    this.subText(s.circleRepaired ? `<b>+${fmtRate(prod)}</b> /sn · ${tapPart}` : tapPart);
    const muted = !(s.settings.sfx || s.settings.music);
    const ic = muted ? 'sesKapali' : 'sesAcik';
    if (ic !== this.muteIcon) {
      this.muteIcon = ic;
      this.muteBtn.replaceChildren(icon(ic));
      this.muteBtn.setAttribute('aria-pressed', String(!muted));
    }
    this.renderBuffs();

    // hedef
    const goal = currentGoal(s);
    this.goalText(goal.text);
    this.goalBar(goal.progress.toFixed(3));
    const showBtn = goal.action === 'circle';
    show(this.goalBtn, showBtn);
    if (showBtn) {
      const can = s.mana.gte(CIRCLE_COST);
      this.goalBtnCost(fmt(CIRCLE_COST));
      disable(this.goalBtn, !can);
      toggle(this.goalBtn, 'hazir', can);
    }

    // sekmeler
    for (const t of this.tabs) {
      if (!t.shown && t.unlocked()) {
        t.shown = true;
        t.fresh = true;
        t.btn.hidden = false;
        t.btn.classList.add('beliriyor');
      }
      let badge: 'yeni' | 'nokta' | undefined;
      if (t.fresh) badge = 'yeni';
      else if (t.id === 'kutuphane' && t.shown && this.active !== t.id) {
        if (LibraryView.available(this).some((d) => s.mana.gte(d.cost))) badge = 'nokta';
      }
      show(t.badge, !!badge);
      toggle(t.badge, 'yeni', badge === 'yeni');
      const label = badge === 'yeni' ? 'Yeni' : '';
      if (t.badge.textContent !== label) t.badge.textContent = label;
    }
    this.tabs.find((t) => t.id === this.active)?.view.update();

    this.renderMentor();
    this.renderHuma();
  }

  private renderBuffs(): void {
    const buffs = this.state.buffs;
    const key = buffs.map((b) => b.id).join(',');
    if (key !== this.buffKey) {
      this.buffKey = key;
      this.buffBars = [];
      this.buffLabels = [];
      this.buffBox.replaceChildren(
        ...buffs.map((b) => {
          const label = h('span');
          const chip = h('span', { class: 'etki' }, icon(b.id === 'huma-uretim' ? 'huma' : 'tuy'), label);
          this.buffBars.push(cssVar(chip, '--p'));
          this.buffLabels.push(text(label));
          return chip;
        }),
      );
    }
    buffs.forEach((b, i) => {
      this.buffBars[i]?.((b.remaining / b.duration).toFixed(3));
      this.buffLabels[i]?.(`${BUFF_TEXT[b.id]} ×${b.mult} · ${Math.ceil(b.remaining)} sn`);
    });
  }

  private renderMentor(): void {
    if (this.mentorTip) return;
    const s = this.state;
    const tip = TIPS.find((t) => !s.tipsSeen.has(t.id) && t.when(s));
    if (!tip) return;
    this.mentorTip = tip.id;
    this.mentorText(tip.text);
    this.mentor.hidden = false;
  }

  private renderHuma(): void {
    const v = this.state.huma.visibleFor;
    const visible = this.state.circleRepaired && v > 0;
    show(this.huma, visible);
    if (!visible) return;
    const p = 1 - v / HUMA_VISIBLE;
    const w = window.innerWidth;
    const hgt = window.innerHeight;
    const { y, dir, amp } = this.humaPath;
    const x = dir > 0 ? -80 + p * (w + 160) : w + 80 - p * (w + 160);
    const yy = y * hgt + Math.sin(p * Math.PI * 4) * amp;
    this.huma.style.transform = `translate(${x - 38}px, ${yy - 38}px) scaleX(${dir > 0 ? 1 : -1})`;
  }
}

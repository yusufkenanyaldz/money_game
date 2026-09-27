import { buyCreature } from '../core/actions';
import {
  creatureCost,
  maxAffordable,
  nextMilestone,
  perUnitProduction,
  productionOf,
  totalProduction,
} from '../core/formulas';
import { CREATURES, MILESTONES } from '../data/creatures';
import { fmt, fmtRate, fmtTime } from '../i18n/format';
import { cssVar, disable, h, icon, show, text, toggle } from './dom';
import type { Game, View } from './types';

type BuyMode = 1 | 10 | 25 | 'max';
const MODES: [BuyMode, string][] = [
  [1, '×1'],
  [10, '×10'],
  [25, '×25'],
  ['max', 'MAKS'],
];

interface Card {
  el: HTMLElement;
  name: (v: string) => void;
  count: (v: string) => void;
  countEl: HTMLElement;
  rate: (v: string) => void;
  msText: (v: string) => void;
  msBar: (v: string) => void;
  msRow: HTMLElement;
  lore: HTMLElement;
  btn: HTMLButtonElement;
  top: (v: string) => void;
  cost: (v: string) => void;
  fill: (v: string) => void;
  medal: HTMLElement;
  silhouette?: boolean;
}

export class CreaturesView implements View {
  el: HTMLElement;
  private mode: BuyMode = 1;
  private modeBtns: HTMLButtonElement[] = [];
  private cards: Card[];

  constructor(private game: Game) {
    const modeBar = h('div', { class: 'kip', role: 'group', 'aria-label': 'Kaç tane çağrılsın' });
    for (const [m, label] of MODES) {
      const b = h('button', { type: 'button', 'aria-pressed': String(m === this.mode), onclick: () => this.setMode(m) }, label);
      this.modeBtns.push(b);
      modeBar.append(b);
    }

    this.cards = CREATURES.map((c, i) => {
      const nameEl = h('span', {}, c.name);
      const countEl = h('span', { class: 'adet' });
      const rateEl = h('div', { class: 'kart-satir' });
      const lore = h('div', { class: 'kart-hikaye' }, c.lore);
      const msTextEl = h('span');
      const msBarEl = h('div', { class: 'cubuk' });
      const msRow = h('div', { class: 'esik' }, msBarEl, msTextEl);
      const topEl = h('span', { class: 'ust-yazi' });
      const costEl = h('span', { class: 'maliyet' });
      const btn = h('button', { class: 'dugme', type: 'button', onclick: () => this.buy(i) }, topEl, costEl);
      const medal = h('div', { class: 'madalyon', style: { '--a': c.colors[0], '--b': c.colors[1] } }, icon(c.icon));
      const el = h(
        'div',
        { class: 'kart' },
        medal,
        h('div', { class: 'kart-govde' }, h('div', { class: 'kart-ad' }, nameEl, countEl), rateEl, lore, msRow),
        btn,
      );
      return {
        el,
        name: text(nameEl),
        count: text(countEl),
        countEl,
        rate: text(rateEl),
        msText: text(msTextEl),
        msBar: cssVar(msBarEl, '--p'),
        msRow,
        lore,
        btn,
        top: text(topEl),
        cost: text(costEl),
        fill: cssVar(btn, '--dolum'),
        medal,
      };
    });

    this.el = h(
      'section',
      { class: 'sayfa', 'aria-label': 'Çağırma Çemberi' },
      h('h2', { class: 'bolum-baslik' }, 'Çağırma Çemberi'),
      h('p', { class: 'bolum-not' }, 'Çağırdığın yaratıklar sen yokken de mana toplar.'),
      modeBar,
      ...this.cards.map((c) => c.el),
    );
  }

  private setMode(m: BuyMode): void {
    this.mode = m;
    this.modeBtns.forEach((b, i) => b.setAttribute('aria-pressed', String(MODES[i][0] === m)));
  }

  private amountFor(i: number): number {
    const s = this.game.state;
    if (this.mode === 'max') return Math.max(1, maxAffordable(i, s.creatures[i], s.mana));
    return this.mode;
  }

  private buy(i: number): void {
    const s = this.game.state;
    const n = this.mode === 'max' ? 'max' : this.mode;
    this.game.handle(buyCreature(s, i, n));
  }

  update(): void {
    const s = this.game.state;
    const highest = s.creatures.reduce((hi, n, i) => (n > 0 ? i : hi), -1);
    const total = totalProduction(s);
    const prodAll = total.gt(0);

    this.cards.forEach((card, i) => {
      const visible = i <= highest + 1;
      const silhouette = i === highest + 2;
      show(card.el, visible || silhouette);
      if (!visible && !silhouette) return;

      toggle(card.el, 'siluet', silhouette);
      show(card.lore, visible && s.creatures[i] === 0);
      show(card.msRow, visible && s.creatures[i] > 0);
      show(card.countEl, s.creatures[i] > 0);
      show(card.btn, visible);
      if (silhouette) {
        card.name('???');
        card.rate('Önceki yaratığı çağırınca belirir.');
        card.medal.style.setProperty('--a', '#223066');
        card.medal.style.setProperty('--b', '#223066');
        card.silhouette = true;
        return;
      }
      if (card.silhouette) {
        card.silhouette = false;
        card.medal.style.setProperty('--a', CREATURES[i].colors[0]);
        card.medal.style.setProperty('--b', CREATURES[i].colors[1]);
      }

      const owned = s.creatures[i];
      card.name(CREATURES[i].name);
      card.count(String(owned));
      const each = perUnitProduction(s, i);
      if (owned > 0) {
        const mine = productionOf(s, i);
        const share = prodAll ? Math.round(mine.div(total).toNumber() * 100) : 0;
        card.rate(`Tanesi ${fmtRate(each)}/sn · toplam ${fmtRate(mine)}/sn (%${share})`);
        const next = nextMilestone(owned);
        if (next !== undefined) {
          const prev = [...MILESTONES].reverse().find((m) => m <= owned) ?? 0;
          card.msBar(((owned - prev) / (next - prev)).toFixed(3));
          card.msText(`${next} olunca ×2`);
        } else {
          card.msBar('1');
          card.msText('Tüm eşikler tamam');
        }
      } else {
        card.rate(`Tanesi ${fmtRate(each)} mana/sn`);
      }

      const n = this.amountFor(i);
      const cost = creatureCost(i, owned, n);
      const can = s.circleRepaired && s.mana.gte(cost);
      card.cost(fmt(cost));
      if (can) card.top(`Çağır +${n}`);
      else if (prodAll) card.top(`≈ ${fmtTime(cost.sub(s.mana).div(total).toNumber())}`);
      else card.top(`+${n}`);
      card.fill(can ? '1' : Math.min(1, s.mana.div(cost).toNumber()).toFixed(3));
      disable(card.btn, !can);
      toggle(card.btn, 'hazir', can);
    });
  }
}

import { buyScroll } from '../core/actions';
import { totalProduction } from '../core/formulas';
import { SCROLLS, SCROLL_BY_ID, type ScrollDef } from '../data/scrolls';
import { fmt, fmtTime } from '../i18n/format';
import { cssVar, disable, h, icon, text, toggle } from './dom';
import { effectText } from './text';
import type { Game, View } from './types';

interface Card {
  def: ScrollDef;
  el: HTMLElement;
  btn: HTMLButtonElement;
  top: (v: string) => void;
  fill: (v: string) => void;
}

export class LibraryView implements View {
  el: HTMLElement;
  private list: HTMLElement;
  private owned: HTMLElement;
  private ownedSummary: (v: string) => void;
  private ownedWrap: HTMLDetailsElement;
  private cards: Card[] = [];
  private listKey = '';
  private ownedCount = -1;

  constructor(private game: Game) {
    this.list = h('div', { class: 'sayfa' });
    this.owned = h('div', { class: 'okunanlar' });
    const summary = h('summary');
    this.ownedSummary = text(summary);
    this.ownedWrap = h('details', { class: 'katlanir' }, summary, this.owned);
    this.el = h(
      'section',
      { class: 'sayfa', 'aria-label': 'Kütüphane' },
      h('h2', { class: 'bolum-baslik' }, 'Kütüphane'),
      h('p', { class: 'bolum-not' }, 'Her parşömen bir kez okunur ve etkisi kalıcıdır.'),
      this.list,
      this.ownedWrap,
    );
  }

  /** Rafta duran (koşulu sağlanmış, okunmamış) parşömenler. */
  static available(game: Game): ScrollDef[] {
    const s = game.state;
    return SCROLLS.filter((d) => !s.scrolls.has(d.id) && d.requires(s));
  }

  private rebuild(avail: ScrollDef[]): void {
    this.cards = avail.map((def) => {
      const topEl = h('span', { class: 'ust-yazi' });
      const btn = h(
        'button',
        { class: 'dugme', type: 'button', onclick: () => this.game.handle(buyScroll(this.game.state, def.id)) },
        topEl,
        h('span', { class: 'maliyet' }, fmt(def.cost)),
      );
      const el = h(
        'div',
        { class: 'kart' },
        h('div', { class: 'madalyon parsomen' }, icon(def.icon)),
        h(
          'div',
          { class: 'kart-govde' },
          h('div', { class: 'kart-ad' }, def.name),
          h('div', { class: 'kart-satir' }, h('b', {}, effectText(def.effect))),
          def.flavor ? h('div', { class: 'kart-hikaye' }, def.flavor) : null,
        ),
        btn,
      );
      return { def, el, btn, top: text(topEl), fill: cssVar(btn, '--dolum') };
    });
    this.list.replaceChildren(
      ...(this.cards.length
        ? this.cards.map((c) => c.el)
        : [h('p', { class: 'bos' }, 'Raflar şimdilik boş. Daha çok yaratık çağırdıkça yeni parşömenler bulunur.')]),
    );
  }

  private rebuildOwned(): void {
    const s = this.game.state;
    const defs = [...s.scrolls].map((id) => SCROLL_BY_ID.get(id)).filter((d): d is ScrollDef => !!d);
    this.owned.replaceChildren(
      ...defs.map((d) => h('span', { class: 'okunan', title: effectText(d.effect) }, icon(d.icon), d.name)),
    );
    this.ownedSummary(`Okunan parşömenler (${defs.length})`);
    this.ownedWrap.hidden = defs.length === 0;
  }

  update(): void {
    const s = this.game.state;
    const avail = LibraryView.available(this.game);
    const key = avail.map((d) => d.id).join(',');
    if (key !== this.listKey) {
      this.listKey = key;
      this.rebuild(avail);
    }
    if (s.scrolls.size !== this.ownedCount) {
      this.ownedCount = s.scrolls.size;
      this.rebuildOwned();
    }
    const prod = totalProduction(s);
    for (const c of this.cards) {
      const can = s.mana.gte(c.def.cost);
      disable(c.btn, !can);
      toggle(c.btn, 'hazir', can);
      c.fill(can ? '1' : Math.min(1, s.mana.toNumber() / c.def.cost).toFixed(3));
      if (can) c.top('Oku');
      else if (prod.gt(0)) c.top(`≈ ${fmtTime(s.mana.neg().add(c.def.cost).div(prod).toNumber())}`);
      else c.top('Oku');
    }
  }
}

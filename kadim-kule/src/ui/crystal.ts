import { buyTapUpgrade, tap } from '../core/actions';
import { critChance, critMult, tapUpgradeCost, tapValue, totalProduction } from '../core/formulas';
import { fmt, fmtTime } from '../i18n/format';
import { CrystalFx, type SpinGroup } from './crystal-fx';
import { cssVar, disable, h, icon, text, toggle } from './dom';
import type { Game, View } from './types';

/** Göktürk (Orhun) harfleriyle "Tengri · Türük"; halkada iki kez döner. */
const RUNES = ['𐱅', '𐰭', '𐰼', '𐰃', ':', '𐱅', '𐰇', '𐰼', '𐰜', ':'];
const RUNE_FONT = '"Noto Sans Old Turkic"';

const CRYSTAL = 'points="100,12 58,72 58,150 100,206 142,150 142,72"';

const SCENE_SVG = `
<svg viewBox="0 0 200 260" aria-hidden="true">
  <defs>
    <clipPath id="kr-sekil"><polygon ${CRYSTAL}/></clipPath>
    <radialGradient id="kr-cekirdek" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="0.35" stop-color="#b9fff4"/>
      <stop offset="1" stop-color="#45dcc8" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="kr-sol" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#e2fffa"/>
      <stop offset="1" stop-color="#4fe6d2"/>
    </linearGradient>
    <linearGradient id="kr-orta" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#5ff0dc"/>
      <stop offset="1" stop-color="#1fa7a6"/>
    </linearGradient>
    <linearGradient id="kr-sag" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#2cc2b6"/>
      <stop offset="1" stop-color="#0b4a6a"/>
    </linearGradient>
    <linearGradient id="kr-alt" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1b9c98"/>
      <stop offset="1" stop-color="#132a6a"/>
    </linearGradient>
    <linearGradient id="kr-isilti-g" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/>
      <stop offset="0.5" stop-color="#fff" stop-opacity="0.75"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="kr-tas" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3a4786"/>
      <stop offset="1" stop-color="#141a3c"/>
    </linearGradient>
    <linearGradient id="kr-oluk" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#45dcc8" stop-opacity="0"/>
      <stop offset="0.5" stop-color="#8ffff0"/>
      <stop offset="1" stop-color="#45dcc8" stop-opacity="0"/>
    </linearGradient>
    <filter id="kr-bulanik" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="9"/>
    </filter>
    <filter id="kr-run-isik" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="1.6" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <g class="kristal-yildiz" data-hiz="7" fill="none" stroke="#f3c35a" stroke-width="1.2">
    <rect x="30" y="40" width="140" height="140"/>
    <rect x="30" y="40" width="140" height="140" transform="rotate(45 100 110)"/>
    <circle cx="100" cy="110" r="99" stroke-opacity="0.45"/>
  </g>
  <g class="kristal-yildiz ic" data-hiz="-11" fill="none" stroke="#45dcc8" stroke-width="1">
    <rect x="54" y="64" width="92" height="92"/>
    <rect x="54" y="64" width="92" height="92" transform="rotate(45 100 110)"/>
  </g>
  <g class="run-halkasi" data-hiz="-4" filter="url(#kr-run-isik)"></g>

  <!-- Sunak -->
  <ellipse class="sunak-isik" cx="100" cy="226" rx="46" ry="9" fill="#45dcc8" filter="url(#kr-bulanik)"/>
  <polygon points="46,226 154,226 142,254 58,254" fill="url(#kr-tas)"/>
  <ellipse cx="100" cy="226" rx="54" ry="10" fill="#4a5aa3"/>
  <ellipse cx="100" cy="226" rx="44" ry="7" fill="#232d63"/>
  <rect class="sunak-oluk" x="54" y="238" width="92" height="2.5" rx="1.2" fill="url(#kr-oluk)"/>
  <g fill="#8ffff0" class="sunak-oluk">
    <path d="M100 243 l4 4 -4 4 -4 -4z"/>
    <path d="M76 244 l3 3 -3 3 -3 -3z"/>
    <path d="M124 244 l3 3 -3 3 -3 -3z"/>
  </g>

  <g class="kristal-suzul">
    <g class="kristal-govde">
      <polygon class="kristal-hale" ${CRYSTAL} fill="#45dcc8" filter="url(#kr-bulanik)"/>
      <polygon points="100,12 58,72 100,88" fill="url(#kr-sol)"/>
      <polygon points="100,12 100,88 142,72" fill="#62e4d3"/>
      <polygon points="58,72 58,150 100,166 100,88" fill="url(#kr-orta)"/>
      <polygon points="100,88 100,166 142,150 142,72" fill="url(#kr-sag)"/>
      <polygon points="58,150 100,206 100,166" fill="#1d9892"/>
      <polygon points="100,166 100,206 142,150" fill="url(#kr-alt)"/>
      <g clip-path="url(#kr-sekil)">
        <ellipse class="kristal-cekirdek" cx="100" cy="112" rx="34" ry="58" fill="url(#kr-cekirdek)"/>
        <g class="kristal-isilti"><rect x="0" y="0" width="28" height="220" transform="skewX(-18)" fill="url(#kr-isilti-g)"/></g>
        <polygon class="kristal-parlama" ${CRYSTAL} fill="#ffffff" opacity="0"/>
      </g>
      <polygon points="100,20 68,70 80,74" fill="#ffffff" fill-opacity="0.55"/>
      <polygon points="64,82 64,142 71,145 71,85" fill="#ffffff" fill-opacity="0.22"/>
      <polyline points="100,12 100,88 100,166 100,206" fill="none" stroke="#f0fffd" stroke-opacity="0.6" stroke-width="1"/>
      <polyline points="58,72 100,88 142,72" fill="none" stroke="#f0fffd" stroke-opacity="0.55" stroke-width="1"/>
      <polyline points="58,150 100,166 142,150" fill="none" stroke="#f0fffd" stroke-opacity="0.35" stroke-width="1"/>
      <polygon ${CRYSTAL} fill="none" stroke="#c9fff7" stroke-opacity="0.5" stroke-width="1"/>
    </g>
  </g>

  <g fill="#fffbe8">
    <path class="kristal-parilti" d="M70 44 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z"/>
    <path class="kristal-parilti" d="M150 110 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z"/>
    <path class="kristal-parilti" d="M82 182 l1.5 4.5 4.5 1.5 -4.5 1.5 -1.5 4.5 -1.5 -4.5 -4.5 -1.5 4.5 -1.5z"/>
  </g>
</svg>`;

const MAX_FLOATERS = 24;
const SVG_NS = 'http://www.w3.org/2000/svg';

export class CrystalView implements View {
  el: HTMLElement;
  private scene: HTMLElement;
  private btn: HTMLButtonElement;
  private body: SVGGElement;
  private flashEl: SVGPolygonElement;
  private fx: CrystalFx;
  private setAwake: (v: string) => void;
  private setEnergy: (v: string) => void;
  private info: (v: string) => void;
  private upLevel: (v: string) => void;
  private upCost: (v: string) => void;
  private upTop: (v: string) => void;
  private upFill: (v: string) => void;
  private upBtn: HTMLButtonElement;
  private floaters: HTMLElement[] = [];

  constructor(private game: Game) {
    this.btn = h('button', { class: 'kristal-dugme', type: 'button', 'aria-label': 'Kristale dokun' });
    this.btn.innerHTML = SCENE_SVG;
    this.body = this.btn.querySelector('.kristal-govde') as SVGGElement;
    this.flashEl = this.btn.querySelector('.kristal-parlama') as SVGPolygonElement;
    this.buildRunes(this.btn.querySelector('.run-halkasi') as SVGGElement);

    // Işık hüzmeleri düğmenin içinde, SVG'nin arkasında: uyanış süzgeci onları da etkilesin.
    this.btn.prepend(h('div', { class: 'kristal-isinlar', 'aria-hidden': 'true' }));
    this.scene = h('div', { class: 'kristal-sahne' });
    const spin: SpinGroup[] = [...this.btn.querySelectorAll<SVGGElement>('[data-hiz]')].map((el) => ({
      el,
      speed: Number(el.dataset.hiz),
      angle: 0,
    }));
    this.setEnergy = cssVar(this.scene, '--enerji');
    // Enerji 0,05'lik adımlarla yazılır: her karede stil hesabı olmasın.
    this.fx = new CrystalFx(this.scene, this.btn, spin, (e) => this.setEnergy((Math.round(e * 20) / 20).toFixed(2)));
    this.scene.append(this.fx.back, this.btn, this.fx.front);
    this.setAwake = cssVar(this.scene, '--uyanis');

    this.btn.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      this.doTap(e.clientX, e.clientY);
    });
    this.btn.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) {
        e.preventDefault();
        const r = this.btn.getBoundingClientRect();
        this.doTap(r.left + r.width / 2, r.top + r.height * 0.42);
      }
    });
    this.btn.addEventListener('contextmenu', (e) => e.preventDefault());

    const infoEl = h('p', { class: 'kristal-bilgi' });
    this.info = text(infoEl);

    const lvlEl = h('div', { class: 'kart-satir' });
    const costEl = h('span', { class: 'maliyet' });
    const topEl = h('span', { class: 'ust-yazi' });
    this.upBtn = h('button', { class: 'dugme', type: 'button', onclick: () => this.buyUpgrade() }, topEl, costEl);
    this.upLevel = text(lvlEl);
    this.upCost = text(costEl);
    this.upTop = text(topEl);
    this.upFill = cssVar(this.upBtn, '--dolum');

    const upgrade = h(
      'div',
      { class: 'kart' },
      h('div', { class: 'madalyon canli', style: { '--a': '#aefcf1', '--b': '#157f86' } }, icon('kristalParlak')),
      h('div', { class: 'kart-govde' }, h('div', { class: 'kart-ad' }, 'Kristali Parlat'), lvlEl),
      this.upBtn,
    );

    this.el = h('section', { class: 'sayfa', 'aria-label': 'Kristal Odası' }, this.scene, infoEl, upgrade);
  }

  /** Göktürk harflerini kristalin çevresine dizer; yazı tipi yüklenince görünür. */
  private buildRunes(ring: SVGGElement): void {
    const items = [...RUNES, ...RUNES];
    const r = 88;
    items.forEach((ch, k) => {
      // Orhun yazısı sağdan sola okunur: tepeden başlayıp saat yönünün tersine diz.
      const deg = -90 - (k * 360) / items.length;
      const rad = (deg * Math.PI) / 180;
      const x = 100 + Math.cos(rad) * r;
      const y = 110 + Math.sin(rad) * r;
      if (ch === ':') {
        for (const off of [-2.2, 2.2]) {
          const c = document.createElementNS(SVG_NS, 'circle');
          c.setAttribute('cx', String(x + Math.cos(rad) * off));
          c.setAttribute('cy', String(y + Math.sin(rad) * off));
          c.setAttribute('r', '1.1');
          ring.append(c);
        }
        return;
      }
      const t = document.createElementNS(SVG_NS, 'text');
      t.setAttribute('x', x.toFixed(2));
      t.setAttribute('y', y.toFixed(2));
      t.setAttribute('transform', `rotate(${(deg + 90).toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)})`);
      t.textContent = ch;
      ring.append(t);
    });
    const fonts = document.fonts;
    if (!fonts?.load) return;
    fonts
      .load(`14px ${RUNE_FONT}`, '𐱅')
      .then((faces) => {
        if (faces.length) ring.classList.add('hazir');
      })
      .catch(() => {});
  }

  setVisible(v: boolean): void {
    this.fx.setVisible(v);
  }

  private doTap(x: number, y: number): void {
    const ev = tap(this.game.state);
    this.game.handle([ev]);
    if (ev.type !== 'tap') return;
    const r = this.scene.getBoundingClientRect();
    const b = this.btn.getBoundingClientRect();
    this.fx.tap(x - r.left, y - r.top, ev.crit);
    this.floatNumber(x - r.left, y - r.top, ev.crit, (ev.crit ? 'Kritik! +' : '+') + fmt(ev.amount));

    // Kristal dokunulan yana doğru hafifçe eğilir
    const side = Math.max(-1, Math.min(1, (x - (b.left + b.width / 2)) / (b.width / 2)));
    this.body.animate(
      [
        { transform: `rotate(${(side * 5).toFixed(1)}deg) scale(0.92)` },
        { transform: `rotate(${(-side * 2).toFixed(1)}deg) scale(1.04)`, offset: 0.45 },
        { transform: 'rotate(0deg) scale(1)' },
      ],
      { duration: ev.crit ? 380 : 260, easing: 'cubic-bezier(.3,1.4,.5,1)' },
    );
    this.flashEl.animate([{ opacity: ev.crit ? 0.75 : 0.4 }, { opacity: 0 }], { duration: ev.crit ? 320 : 180, easing: 'ease-out' });
  }

  private floatNumber(x: number, y: number, crit: boolean, label: string): void {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const num = h('div', { class: 'ucan-sayi' + (crit ? ' kritik' : '') }, label);
    this.scene.append(num);
    this.floaters.push(num);
    if (this.floaters.length > MAX_FLOATERS) this.floaters.shift()?.remove();
    const dx = (Math.random() - 0.5) * 50;
    const anim = num.animate(
      [
        { transform: `translate(${x}px, ${y - 20}px) translate(-50%, -50%) scale(0.6)`, opacity: 1 },
        { transform: `translate(${x + dx * 0.5}px, ${y - 64}px) translate(-50%, -50%) scale(${crit ? 1.25 : 1.08})`, opacity: 1, offset: 0.25 },
        { transform: `translate(${x + dx}px, ${y - 130}px) translate(-50%, -50%) scale(1)`, opacity: 0 },
      ],
      { duration: reduce ? 400 : crit ? 1200 : 950, easing: 'ease-out', fill: 'forwards' },
    );
    anim.onfinish = () => {
      num.remove();
      this.floaters = this.floaters.filter((f) => f !== num);
    };
  }

  private buyUpgrade(): void {
    this.game.handle(buyTapUpgrade(this.game.state));
  }

  update(): void {
    const s = this.game.state;
    const awake = Math.min(1, 0.15 + s.stats.taps / 40);
    this.setAwake(awake.toFixed(2));
    this.fx.awake = awake;
    this.fx.setCreatures(s.creatures);
    const gold = s.buffs.some((b) => b.id === 'huma-uretim');
    const storm = s.buffs.some((b) => b.id === 'huma-dokunus');
    this.fx.gold = gold;
    this.fx.storm = storm;
    toggle(this.scene, 'altin', gold || storm);

    const crit = `kritik %${Math.round(critChance(s) * 100)} ×${critMult(s)}`;
    this.info(`Dokunuş başına ${fmt(tapValue(s), 1)} mana · ${crit}`);

    const cost = tapUpgradeCost(s.tapLevel);
    const can = s.mana.gte(cost);
    this.upLevel(`Seviye ${s.tapLevel} · her seviye dokunuşa +1 mana`);
    this.upCost(fmt(cost));
    const prod = totalProduction(s);
    const eta = !can && prod.gt(0) ? cost.sub(s.mana).div(prod).toNumber() : 0;
    this.upTop(can ? 'Parlat' : eta > 0 ? `≈ ${fmtTime(eta)}` : 'Parlat');
    this.upFill(can ? '1' : Math.min(1, s.mana.div(cost).toNumber()).toFixed(3));
    disable(this.upBtn, !can);
    toggle(this.upBtn, 'hazir', can);
  }
}

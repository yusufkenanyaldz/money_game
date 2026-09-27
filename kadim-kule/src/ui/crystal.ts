import { buyTapUpgrade, tap } from '../core/actions';
import { critChance, critMult, tapUpgradeCost, tapValue, totalProduction } from '../core/formulas';
import { fmt, fmtTime } from '../i18n/format';
import { cssVar, disable, h, icon, text, toggle } from './dom';
import type { Game, View } from './types';

const CRYSTAL_SVG = `
<svg viewBox="0 0 200 236" aria-hidden="true">
  <defs>
    <radialGradient id="kr-hale" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#45dcc8" stop-opacity="0.55"/>
      <stop offset="0.55" stop-color="#3160d8" stop-opacity="0.18"/>
      <stop offset="1" stop-color="#3160d8" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="kr-sol" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#d4fff8"/>
      <stop offset="1" stop-color="#45dcc8"/>
    </linearGradient>
    <linearGradient id="kr-sag" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#2bb7ab"/>
      <stop offset="1" stop-color="#0c4f5a"/>
    </linearGradient>
    <linearGradient id="kr-alt" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1b8f8c"/>
      <stop offset="1" stop-color="#0a3148"/>
    </linearGradient>
  </defs>
  <circle cx="100" cy="118" r="100" fill="url(#kr-hale)"/>
  <g class="kristal-yildiz" fill="none" stroke="#f3c35a" stroke-opacity="0.5" stroke-width="1.2">
    <rect x="30" y="48" width="140" height="140"/>
    <rect x="30" y="48" width="140" height="140" transform="rotate(45 100 118)"/>
    <circle cx="100" cy="118" r="99" stroke-opacity="0.25"/>
  </g>
  <g class="kristal-yildiz ters" fill="none" stroke="#45dcc8" stroke-opacity="0.35" stroke-width="1">
    <rect x="52" y="70" width="96" height="96"/>
    <rect x="52" y="70" width="96" height="96" transform="rotate(45 100 118)"/>
  </g>
  <ellipse cx="100" cy="222" rx="54" ry="8" fill="#45dcc8" fill-opacity="0.18"/>
  <g class="kristal-govde">
    <polygon points="100,20 58,80 100,96" fill="url(#kr-sol)"/>
    <polygon points="100,20 100,96 142,80" fill="#57d9c9"/>
    <polygon points="58,80 58,158 100,174 100,96" fill="#3fcfbe"/>
    <polygon points="100,96 100,174 142,158 142,80" fill="url(#kr-sag)"/>
    <polygon points="58,158 100,214 100,174" fill="#1c948f"/>
    <polygon points="100,174 100,214 142,158" fill="url(#kr-alt)"/>
    <polygon points="100,28 68,78 80,82" fill="#ffffff" fill-opacity="0.45"/>
    <polygon points="64,90 64,150 72,153 72,93" fill="#ffffff" fill-opacity="0.18"/>
    <polyline points="100,20 100,96 100,174 100,214" fill="none" stroke="#e9fffb" stroke-opacity="0.5" stroke-width="1"/>
    <polyline points="58,80 100,96 142,80" fill="none" stroke="#e9fffb" stroke-opacity="0.45" stroke-width="1"/>
    <polyline points="58,158 100,174 142,158" fill="none" stroke="#e9fffb" stroke-opacity="0.3" stroke-width="1"/>
  </g>
  <g fill="#fffbe8">
    <path class="kristal-parilti" d="M72 52 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z"/>
    <path class="kristal-parilti" d="M150 118 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z"/>
    <path class="kristal-parilti" d="M84 190 l1.5 4.5 4.5 1.5 -4.5 1.5 -1.5 4.5 -1.5 -4.5 -4.5 -1.5 4.5 -1.5z"/>
  </g>
</svg>`;

const MAX_FLOATERS = 24;

export class CrystalView implements View {
  el: HTMLElement;
  private scene: HTMLElement;
  private body!: SVGGElement;
  private setAwake: (v: string) => void;
  private info: (v: string) => void;
  private upLevel: (v: string) => void;
  private upCost: (v: string) => void;
  private upTop: (v: string) => void;
  private upFill: (v: string) => void;
  private upBtn: HTMLButtonElement;
  private floaters: HTMLElement[] = [];

  constructor(private game: Game) {
    const btn = h('button', { class: 'kristal-dugme', type: 'button', 'aria-label': 'Kristale dokun' });
    btn.innerHTML = CRYSTAL_SVG;
    this.body = btn.querySelector('.kristal-govde') as SVGGElement;
    this.scene = h('div', { class: 'kristal-sahne' }, btn);
    this.setAwake = cssVar(this.scene, '--uyanis');

    btn.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      this.doTap(e.clientX, e.clientY);
    });
    btn.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) {
        e.preventDefault();
        const r = btn.getBoundingClientRect();
        this.doTap(r.left + r.width / 2, r.top + r.height / 2);
      }
    });
    btn.addEventListener('contextmenu', (e) => e.preventDefault());

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
      h('div', { class: 'madalyon', style: { '--a': '#aefcf1', '--b': '#157f86' } }, icon('kristalParlak')),
      h(
        'div',
        { class: 'kart-govde' },
        h('div', { class: 'kart-ad' }, 'Kristali Parlat'),
        lvlEl,
      ),
      this.upBtn,
    );

    this.el = h('section', { class: 'sayfa', 'aria-label': 'Kristal Odası' }, this.scene, infoEl, upgrade);
  }

  private doTap(x: number, y: number): void {
    const ev = tap(this.game.state);
    this.game.handle([ev]);
    if (ev.type !== 'tap') return;
    this.burst(x, y, ev.crit, (ev.crit ? 'Kritik! +' : '+') + fmt(ev.amount));
    this.body.animate(
      [{ transform: 'scale(0.93)' }, { transform: 'scale(1.03)' }, { transform: 'scale(1)' }],
      { duration: 180, easing: 'ease-out' },
    );
  }

  private burst(clientX: number, clientY: number, crit: boolean, label: string): void {
    const r = this.scene.getBoundingClientRect();
    const x = clientX - r.left;
    const y = clientY - r.top;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const num = h('div', { class: 'ucan-sayi' + (crit ? ' kritik' : '') }, label);
    this.scene.append(num);
    this.floaters.push(num);
    if (this.floaters.length > MAX_FLOATERS) this.floaters.shift()?.remove();
    const dx = (Math.random() - 0.5) * 40;
    const anim = num.animate(
      [
        { transform: `translate(${x}px, ${y - 20}px) translate(-50%, -50%) scale(0.7)`, opacity: 1 },
        { transform: `translate(${x + dx * 0.5}px, ${y - 60}px) translate(-50%, -50%) scale(1.05)`, opacity: 1, offset: 0.25 },
        { transform: `translate(${x + dx}px, ${y - 120}px) translate(-50%, -50%) scale(1)`, opacity: 0 },
      ],
      { duration: reduce ? 400 : 950, easing: 'ease-out', fill: 'forwards' },
    );
    anim.onfinish = () => {
      num.remove();
      this.floaters = this.floaters.filter((f) => f !== num);
    };

    if (reduce) return;
    const count = crit ? 10 : 5;
    for (let i = 0; i < count; i++) {
      const p = h('div', { class: 'zerre' + (crit || Math.random() < 0.2 ? ' altin' : '') });
      this.scene.append(p);
      const a = Math.random() * Math.PI * 2;
      const d = 30 + Math.random() * (crit ? 80 : 45);
      p.animate(
        [
          { transform: `translate(${x}px, ${y}px) scale(1)`, opacity: 1 },
          { transform: `translate(${x + Math.cos(a) * d}px, ${y + Math.sin(a) * d}px) scale(0.2)`, opacity: 0 },
        ],
        { duration: 450 + Math.random() * 250, easing: 'cubic-bezier(.2,.8,.4,1)', fill: 'forwards' },
      ).onfinish = () => p.remove();
    }
  }

  private buyUpgrade(): void {
    this.game.handle(buyTapUpgrade(this.game.state));
  }

  update(): void {
    const s = this.game.state;
    this.setAwake(Math.min(1, 0.15 + s.stats.taps / 40).toFixed(2));
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

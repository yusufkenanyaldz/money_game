import { CREATURES } from '../data/creatures';
import { ICON_BODIES } from './icons.gen';

/**
 * Kristal sahnesinin tuval efektleri. İki tuval kullanılır: arkadaki (kristalin
 * gerisinde kalan zerreler ve yörüngenin arka yarısı) ve öndeki (kıvılcımlar,
 * şok dalgası, yörüngenin ön yarısı). Böylece yaratık ruhları kristalin
 * etrafında gerçekten dönüyormuş gibi görünür.
 */

interface Particle {
  kind: 'mote' | 'spark' | 'stream' | 'pop';
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
  /** Akış parçacıkları için başlangıç ve kontrol noktası. */
  sx?: number;
  sy?: number;
  cx?: number;
  cy?: number;
}

interface Spirit {
  i: number;
  angle: number;
  speed: number;
  radius: number;
  emitIn: number;
  path: Path2D;
  color: string;
  glow: string;
}

interface Ring {
  r: number;
  life: number;
  max: number;
  color: string;
}

export interface SpinGroup {
  el: SVGGElement;
  /** derece/sn; eksi ters yön */
  speed: number;
  angle: number;
}

const MAX_PARTICLES = 280;
const TURKUAZ = '#45dcc8';
const ALTIN = '#f3c35a';

function iconPath(i: number): Path2D {
  const body = ICON_BODIES[CREATURES[i].icon];
  const d = body.match(/\sd="([^"]+)"/)?.[1] ?? '';
  return new Path2D(d);
}

export class CrystalFx {
  readonly back: HTMLCanvasElement;
  readonly front: HTMLCanvasElement;
  private bctx: CanvasRenderingContext2D | null;
  private fctx: CanvasRenderingContext2D | null;
  private w = 0;
  private h = 0;
  /** Kristal merkezi ve yarıçapı (tuval koordinatı). */
  private cx = 0;
  private cy = 0;
  private cr = 60;
  private pedestalY = 0;

  private particles: Particle[] = [];
  private spirits: Spirit[] = [];
  private spiritKey = '';
  private counts: number[] = [];
  private rings: Ring[] = [];
  private flash = 0;
  private flashColor = TURKUAZ;
  private moteAcc = 0;

  private visible = false;
  private raf?: number;
  private last = 0;
  private reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** 0–1 arası; hızlı dokundukça yükselir, kendiliğinden söner. */
  energy = 0;
  /** 0–1; kristal uyanmadan efektler sönük kalır. */
  awake = 1;
  gold = false;
  storm = false;

  constructor(
    private scene: HTMLElement,
    private anchor: HTMLElement,
    private spin: SpinGroup[],
    private onFrame: (energy: number) => void,
  ) {
    this.back = document.createElement('canvas');
    this.front = document.createElement('canvas');
    this.back.className = 'kristal-tuval arka';
    this.front.className = 'kristal-tuval on';
    for (const c of [this.back, this.front]) c.setAttribute('aria-hidden', 'true');
    this.bctx = this.back.getContext('2d');
    this.fctx = this.front.getContext('2d');
    new ResizeObserver(() => this.resize()).observe(scene);
  }

  setVisible(v: boolean): void {
    this.visible = v;
    if (v && this.raf === undefined) {
      this.last = performance.now();
      this.resize();
      this.raf = requestAnimationFrame((t) => this.loop(t));
    }
  }

  /** Sahip olunan türler kristalin etrafında ruh olarak döner. */
  setCreatures(owned: number[]): void {
    this.counts = owned;
    const key = owned.map((n) => (n > 0 ? 1 : 0)).join('');
    if (key === this.spiritKey) return;
    this.spiritKey = key;
    const keep = new Map(this.spirits.map((s) => [s.i, s]));
    this.spirits = owned.flatMap((n, i) => {
      if (n <= 0) return [];
      const old = keep.get(i);
      if (old) return [old];
      return [
        {
          i,
          angle: (i / CREATURES.length) * Math.PI * 2 + Math.random() * 0.6,
          speed: 0.32 + (i % 4) * 0.05,
          radius: 1.28 + (i % 3) * 0.12,
          emitIn: Math.random() * 1.5,
          path: iconPath(i),
          color: CREATURES[i].colors[0],
          glow: CREATURES[i].colors[1],
        },
      ];
    });
  }

  /** Dokunuş: x, y sahneye göre koordinat. */
  tap(x: number, y: number, crit: boolean): void {
    this.energy = Math.min(1, this.energy + (crit ? 0.22 : 0.07));
    const color = crit || this.storm ? ALTIN : TURKUAZ;
    const n = this.reduce ? 4 : crit ? 28 : 12;
    for (let k = 0; k < n; k++) {
      const a = Math.random() * Math.PI * 2;
      const sp = (crit ? 180 : 110) + Math.random() * (crit ? 260 : 160);
      this.add({
        kind: 'spark',
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: 0,
        max: 0.35 + Math.random() * (crit ? 0.6 : 0.35),
        size: crit ? 3.2 : 2.4,
        color: Math.random() < 0.25 ? '#ffffff' : color,
      });
    }
    this.rings.push({ r: this.cr * 0.5, life: 0, max: crit ? 0.7 : 0.45, color });
    if (crit) this.rings.push({ r: this.cr * 0.3, life: -0.08, max: 0.8, color: '#ffffff' });
    this.flash = crit ? 0.9 : 0.45;
    this.flashColor = color;
  }

  private add(p: Particle): void {
    if (this.particles.length >= MAX_PARTICLES) this.particles.shift();
    this.particles.push(p);
  }

  private resize(): void {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const r = this.scene.getBoundingClientRect();
    const a = this.anchor.getBoundingClientRect();
    this.w = r.width;
    this.h = r.height;
    for (const [c, ctx] of [
      [this.back, this.bctx],
      [this.front, this.fctx],
    ] as const) {
      c.width = Math.max(1, Math.floor(this.w * dpr));
      c.height = Math.max(1, Math.floor(this.h * dpr));
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    // SVG görünüm kutusu 200×260; kristal merkezi (100,110), sunak üstü y=226.
    this.cx = a.left - r.left + a.width / 2;
    this.cy = a.top - r.top + a.height * (110 / 260);
    this.cr = a.width * 0.3;
    this.pedestalY = a.top - r.top + a.height * (224 / 260);
  }

  private loop(t: number): void {
    if (!this.visible || document.hidden) {
      this.raf = undefined;
      return;
    }
    const dt = Math.min(0.05, (t - this.last) / 1000);
    this.last = t;
    this.step(dt);
    this.draw();
    this.raf = requestAnimationFrame((n) => this.loop(n));
  }

  private step(dt: number): void {
    this.energy = Math.max(0, this.energy - dt * 0.4);
    const e = this.energy;
    this.onFrame(e);

    if (!this.reduce) {
      for (const g of this.spin) {
        g.angle = (g.angle + dt * g.speed * (1 + 3 * e)) % 360;
        g.el.setAttribute('transform', `rotate(${g.angle.toFixed(2)} 100 110)`);
      }
    }

    // Sunaktan kristale yükselen mana zerreleri
    if (!this.reduce) {
      this.moteAcc += dt * (4 + 26 * e + (this.gold ? 12 : 0)) * this.awake;
      while (this.moteAcc >= 1) {
        this.moteAcc--;
        const x = this.cx + (Math.random() - 0.5) * this.cr * 1.6;
        this.add({
          kind: 'mote',
          x,
          y: this.pedestalY + (Math.random() - 0.5) * 6,
          vx: 0,
          vy: -(28 + Math.random() * 40),
          life: 0,
          max: 1.6 + Math.random() * 1.2,
          size: 1 + Math.random() * 1.6,
          color: this.gold ? ALTIN : TURKUAZ,
        });
      }
    }

    // Yaratık ruhları: dönerler ve kristale mana akıtırlar
    for (const s of this.spirits) {
      s.angle += dt * s.speed * (1 + 1.5 * e);
      s.emitIn -= dt;
      if (s.emitIn <= 0) {
        const count = this.counts[s.i] ?? 1;
        s.emitIn = (0.9 + Math.random() * 1.6) / (1 + Math.log10(count + 1) * 0.6) / (this.gold ? 2 : 1);
        const p = this.spiritPos(s);
        this.add({
          kind: 'stream',
          x: p.x,
          y: p.y,
          vx: 0,
          vy: 0,
          life: 0,
          max: 0.75,
          size: 2.2,
          color: s.color,
          sx: p.x,
          sy: p.y,
          cx: (p.x + this.cx) / 2 + (Math.random() - 0.5) * this.cr,
          cy: Math.min(p.y, this.cy) - this.cr * 0.6,
        });
      }
    }

    for (const p of this.particles) {
      p.life += dt;
      if (p.kind === 'spark') {
        const drag = Math.exp(-3.2 * dt);
        p.vx *= drag;
        p.vy = p.vy * drag + 60 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      } else if (p.kind === 'mote') {
        // kristale doğru süzül
        const k = p.life / p.max;
        p.x += (this.cx - p.x) * dt * 0.9 + Math.sin(p.life * 5 + p.size) * 12 * dt;
        p.y += p.vy * dt * (1 - k * 0.5);
      } else if (p.kind === 'stream') {
        const k = Math.min(1, p.life / p.max);
        const u = 1 - k;
        p.x = u * u * p.sx! + 2 * u * k * p.cx! + k * k * this.cx;
        p.y = u * u * p.sy! + 2 * u * k * p.cy! + k * k * this.cy;
        if (p.life >= p.max) {
          this.add({ kind: 'pop', x: this.cx, y: this.cy, vx: 0, vy: 0, life: 0, max: 0.35, size: 10, color: p.color });
        }
      }
    }
    this.particles = this.particles.filter((p) => p.life < p.max);

    for (const r of this.rings) r.life += dt;
    this.rings = this.rings.filter((r) => r.life < r.max);
    this.flash = Math.max(0, this.flash - dt * 3);
  }

  private spiritPos(s: Spirit): { x: number; y: number; depth: number } {
    const rx = this.cr * s.radius;
    const ry = rx * 0.3;
    const tilt = -0.18;
    const ex = Math.cos(s.angle) * rx;
    const ey = Math.sin(s.angle) * ry;
    return {
      x: this.cx + ex * Math.cos(tilt) - ey * Math.sin(tilt),
      y: this.cy + this.cr * 0.35 + ex * Math.sin(tilt) + ey * Math.cos(tilt),
      depth: Math.sin(s.angle),
    };
  }

  private draw(): void {
    const b = this.bctx;
    const f = this.fctx;
    if (!b || !f) return;
    b.clearRect(0, 0, this.w, this.h);
    f.clearRect(0, 0, this.w, this.h);

    // Arkadaki parıltı: enerjiyle büyür
    const e = this.energy;
    const glowR = this.cr * (1.6 + e * 0.8);
    const g = b.createRadialGradient(this.cx, this.cy, 0, this.cx, this.cy, glowR);
    const glowColor = this.gold ? '243,195,90' : '69,220,200';
    g.addColorStop(0, `rgba(${glowColor},${(0.28 + e * 0.35) * this.awake})`);
    g.addColorStop(1, `rgba(${glowColor},0)`);
    b.fillStyle = g;
    b.fillRect(this.cx - glowR, this.cy - glowR, glowR * 2, glowR * 2);

    b.globalCompositeOperation = 'lighter';
    f.globalCompositeOperation = 'lighter';

    for (const p of this.particles) {
      const k = p.life / p.max;
      if (p.kind === 'mote') {
        b.globalAlpha = Math.sin(k * Math.PI) * 0.8;
        this.dot(b, p.x, p.y, p.size * 2.5, p.color);
      } else if (p.kind === 'spark') {
        f.globalAlpha = 1 - k;
        f.strokeStyle = p.color;
        f.lineWidth = p.size;
        f.lineCap = 'round';
        f.beginPath();
        f.moveTo(p.x, p.y);
        f.lineTo(p.x - p.vx * 0.06, p.y - p.vy * 0.06);
        f.stroke();
      } else if (p.kind === 'stream') {
        f.globalAlpha = 0.9 * (1 - k * 0.3);
        this.dot(f, p.x, p.y, p.size * 3, p.color);
      } else if (p.kind === 'pop') {
        f.globalAlpha = (1 - k) * 0.7;
        this.dot(f, p.x, p.y, p.size * (1 + k * 2), p.color);
      }
    }

    // Yaratık ruhları: arkadakiler arka tuvale (kristal onları örter), öndekiler öne
    for (const s of this.spirits) {
      const p = this.spiritPos(s);
      const ctx = p.depth < 0 ? b : f;
      const scale = 0.78 + 0.28 * (p.depth + 1) * 0.5;
      const alpha = p.depth < 0 ? 0.55 : 1;
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = alpha * 0.85;
      this.dot(ctx, p.x, p.y, 20 * scale, s.glow);
      ctx.globalAlpha = alpha * 0.9;
      this.dot(ctx, p.x, p.y, 11 * scale, s.color);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = alpha;
      const size = 17 * scale;
      ctx.save();
      ctx.translate(p.x - size / 2, p.y - size / 2);
      ctx.scale(size / 512, size / 512);
      ctx.fillStyle = '#ffffff';
      ctx.fill(s.path);
      ctx.restore();
    }

    f.globalCompositeOperation = 'lighter';
    for (const r of this.rings) {
      if (r.life < 0) continue;
      const k = r.life / r.max;
      f.globalAlpha = (1 - k) * 0.8;
      f.strokeStyle = r.color;
      f.lineWidth = 4 * (1 - k) + 0.5;
      f.beginPath();
      f.ellipse(this.cx, this.cy, r.r + k * this.cr * 2.2, (r.r + k * this.cr * 2.2) * 0.92, 0, 0, Math.PI * 2);
      f.stroke();
    }

    if (this.flash > 0) {
      f.globalAlpha = this.flash;
      const fg = f.createRadialGradient(this.cx, this.cy, 0, this.cx, this.cy, this.cr * 1.5);
      fg.addColorStop(0, '#ffffff');
      fg.addColorStop(0.3, this.flashColor);
      fg.addColorStop(1, 'rgba(0,0,0,0)');
      f.fillStyle = fg;
      f.fillRect(this.cx - this.cr * 1.5, this.cy - this.cr * 1.5, this.cr * 3, this.cr * 3);
    }

    b.globalAlpha = 1;
    f.globalAlpha = 1;
    b.globalCompositeOperation = 'source-over';
    f.globalCompositeOperation = 'source-over';
  }

  private dot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string): void {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
}

/** Arka plandaki gece göğü: yavaşça parıldayan yıldızlar ve yükselen mana zerreleri. */
interface Star {
  x: number;
  y: number;
  r: number;
  phase: number;
  speed: number;
  gold: boolean;
}

interface Mote {
  x: number;
  y: number;
  vy: number;
  r: number;
}

export class Starfield {
  readonly canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private stars: Star[] = [];
  private motes: Mote[] = [];
  private paused = false;
  private last = 0;
  private w = 0;
  private h = 0;
  private reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'yildizlar';
    this.canvas.setAttribute('aria-hidden', 'true');
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
    requestAnimationFrame((t) => this.loop(t));
  }

  pause(p: boolean): void {
    this.paused = p;
  }

  private resize(): void {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.canvas.width = Math.floor(this.w * dpr);
    this.canvas.height = Math.floor(this.h * dpr);
    this.ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round((this.w * this.h) / 5000);
    this.stars = Array.from({ length: count }, () => ({
      x: Math.random() * this.w,
      y: Math.random() * this.h,
      r: Math.random() < 0.9 ? 0.6 + Math.random() * 0.8 : 1.4 + Math.random() * 0.8,
      phase: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 1.2,
      gold: Math.random() < 0.12,
    }));
    this.motes = Array.from({ length: 14 }, () => this.newMote(true));
    this.draw(0);
  }

  private newMote(anywhere: boolean): Mote {
    return {
      x: Math.random() * this.w,
      y: anywhere ? Math.random() * this.h : this.h + 10,
      vy: 6 + Math.random() * 14,
      r: 1 + Math.random() * 1.8,
    };
  }

  private loop(t: number): void {
    // Pil dostu: saniyede ~20 kare yeter.
    if (!this.paused && !this.reduce && t - this.last > 50) {
      const dt = Math.min(0.1, (t - this.last) / 1000);
      this.last = t;
      for (const m of this.motes) {
        m.y -= m.vy * dt;
        if (m.y < -10) Object.assign(m, this.newMote(false));
      }
      this.draw(t / 1000);
    }
    requestAnimationFrame((n) => this.loop(n));
  }

  private draw(time: number): void {
    const c = this.ctx;
    if (!c) return;
    c.clearRect(0, 0, this.w, this.h);
    for (const s of this.stars) {
      const a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(time * s.speed + s.phase));
      c.globalAlpha = a;
      c.fillStyle = s.gold ? '#f3d58a' : '#dfe8ff';
      c.beginPath();
      c.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      c.fill();
    }
    for (const m of this.motes) {
      c.globalAlpha = 0.5;
      const g = c.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 4);
      g.addColorStop(0, 'rgba(69,220,200,0.9)');
      g.addColorStop(1, 'rgba(69,220,200,0)');
      c.fillStyle = g;
      c.beginPath();
      c.arc(m.x, m.y, m.r * 4, 0, Math.PI * 2);
      c.fill();
    }
    c.globalAlpha = 1;
  }
}

/**
 * Ses dosyası kullanmadan Web Audio ile üretilen efektler ve müzik.
 * - Efektler: kristal çanı, alım, parşömen, eşik, kat açılışı, Hüma.
 * - Müzik: re perdesinde dem sesi üstünde, Hicaz dizisinden saz benzeri
 *   (Karplus-Strong telli çalgı sentezi) gezinen bir ezgi.
 * Tarayıcılar sesi ancak ilk dokunuştan sonra açtığı için unlock() dokunuşta çağrılır.
 */

const A4 = 440;
const hz = (semitonesFromA4: number) => A4 * 2 ** (semitonesFromA4 / 12);
/** Re (D4) = A4'ten 7 yarım ses aşağı. */
const D4 = -7;

/** Dokunuş ezgisi: re pentatonik (Re Fa Sol La Do), iki oktav. */
const TAP_SCALE = [0, 3, 5, 7, 10, 12, 15, 17, 19, 22, 24].map((s) => hz(D4 + s));
/** Hicaz (re): Re Mi♭ Fa♯ Sol La Si♭ Do Re */
const HICAZ = [0, 1, 4, 5, 7, 8, 10, 12, 13, 16, 17, 19];

type Ctx = AudioContext;

export class Sound {
  private ctx?: Ctx;
  private master?: GainNode;
  private sfxBus?: GainNode;
  private musicBus?: GainNode;
  private reverb?: ConvolverNode;
  private voices = 0;
  private tapStep = 0;
  private lastTapAt = 0;
  private musicTimer?: number;
  private musicNextAt = 0;
  private melodyIndex = 4;
  private phraseLeft = 0;
  private drone?: { stop: () => void };
  private plucks = new Map<number, AudioBuffer>();

  private sfxOn = true;
  private musicOn = true;
  private volume = 0.7;
  private hidden = false;

  configure(opts: { sfx: boolean; music: boolean; volume: number }): void {
    this.sfxOn = opts.sfx;
    this.volume = opts.volume;
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    const wasMusic = this.musicOn;
    this.musicOn = opts.music;
    if (this.ctx && wasMusic !== this.musicOn) {
      if (this.musicOn) this.startMusic();
      else this.stopMusic();
    }
  }

  /** İlk kullanıcı etkileşiminde çağrılmalı. */
  unlock(): void {
    if (!this.ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      try {
        this.ctx = new AC();
      } catch {
        return;
      }
      const ctx = this.ctx;
      this.master = ctx.createGain();
      this.master.gain.value = this.volume;
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14;
      comp.ratio.value = 4;
      this.master.connect(comp).connect(ctx.destination);

      this.reverb = ctx.createConvolver();
      this.reverb.buffer = this.impulse(2.8);
      const wet = ctx.createGain();
      wet.gain.value = 0.35;
      this.reverb.connect(wet).connect(this.master);

      this.sfxBus = ctx.createGain();
      this.sfxBus.gain.value = 0.55;
      this.sfxBus.connect(this.master);
      this.sfxBus.connect(this.reverb);

      this.musicBus = ctx.createGain();
      this.musicBus.gain.value = 0.32;
      this.musicBus.connect(this.master);
      this.musicBus.connect(this.reverb);

      if (this.musicOn) this.startMusic();
    }
    if (this.ctx.state === 'suspended' && !this.hidden) void this.ctx.resume().catch(() => {});
  }

  setHidden(hidden: boolean): void {
    this.hidden = hidden;
    if (!this.ctx) return;
    if (hidden) void this.ctx.suspend().catch(() => {});
    else void this.ctx.resume().catch(() => {});
  }

  // ---- Efektler ----

  tap(crit: boolean): void {
    const ctx = this.ready();
    if (!ctx) return;
    const now = performance.now();
    // Art arda hızlı dokunuşlar ezgide yukarı tırmanır, ara verince başa döner.
    this.tapStep = now - this.lastTapAt < 450 ? (this.tapStep + 1) % TAP_SCALE.length : 0;
    this.lastTapAt = now;
    const f = TAP_SCALE[this.tapStep];
    this.bell(f, ctx.currentTime, crit ? 0.5 : 0.28, crit ? 1.1 : 0.5);
    if (crit) {
      this.bell(f * 1.5, ctx.currentTime + 0.06, 0.3, 0.9);
      this.bell(f * 2, ctx.currentTime + 0.12, 0.25, 1.2);
    }
  }

  buy(): void {
    const ctx = this.ready();
    if (!ctx) return;
    const t = ctx.currentTime;
    this.blip(hz(D4 + 7), hz(D4 + 12), t, 0.09, 0.3);
    this.blip(hz(D4 + 12), hz(D4 + 19), t + 0.07, 0.12, 0.25);
  }

  tapUpgrade(): void {
    const ctx = this.ready();
    if (!ctx) return;
    const t = ctx.currentTime;
    [0, 7, 12].forEach((s, i) => this.bell(hz(D4 + 12 + s), t + i * 0.05, 0.2, 0.6));
  }

  scroll(): void {
    const ctx = this.ready();
    if (!ctx || !this.sfxBus) return;
    const t = ctx.currentTime;
    // Sayfa hışırtısı: süzgeçten geçmiş kısa gürültü
    const src = ctx.createBufferSource();
    src.buffer = this.noise(0.35);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(1800, t);
    bp.frequency.exponentialRampToValueAtTime(5000, t + 0.3);
    bp.Q.value = 0.8;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.25, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
    src.connect(bp).connect(g).connect(this.sfxBus);
    src.start(t);
    src.stop(t + 0.36);
    this.bell(hz(D4 + 19), t + 0.18, 0.22, 1.2);
  }

  milestone(): void {
    const ctx = this.ready();
    if (!ctx) return;
    const t = ctx.currentTime;
    [0, 4, 7, 12].forEach((s, i) => this.pluck(hz(D4 + 12 + s), t + i * 0.09, 0.5));
  }

  floor(): void {
    const ctx = this.ready();
    if (!ctx) return;
    const t = ctx.currentTime;
    [0, 5, 7, 12, 17, 19, 24].forEach((s, i) => this.bell(hz(D4 + s), t + i * 0.11, 0.3, 1.8));
    this.swell(hz(D4 - 12), t, 2.5);
  }

  humaAppear(): void {
    const ctx = this.ready();
    if (!ctx) return;
    const t = ctx.currentTime;
    this.blip(hz(D4 + 31), hz(D4 + 36), t, 0.08, 0.12);
    this.blip(hz(D4 + 33), hz(D4 + 38), t + 0.14, 0.08, 0.1);
  }

  humaCatch(): void {
    const ctx = this.ready();
    if (!ctx) return;
    const t = ctx.currentTime;
    [24, 22, 19, 17, 15, 12].reverse().forEach((s, i) => this.bell(hz(D4 + s + 5), t + i * 0.06, 0.22, 1.4));
  }

  // ---- Müzik ----

  private startMusic(): void {
    const ctx = this.ctx;
    if (!ctx || !this.musicBus || this.musicTimer !== undefined) return;
    this.drone = this.startDrone();
    this.musicNextAt = ctx.currentTime + 1.5;
    this.phraseLeft = 0;
    this.musicTimer = window.setInterval(() => this.scheduleMusic(), 200);
  }

  private stopMusic(): void {
    if (this.musicTimer !== undefined) window.clearInterval(this.musicTimer);
    this.musicTimer = undefined;
    this.drone?.stop();
    this.drone = undefined;
  }

  private scheduleMusic(): void {
    const ctx = this.ctx;
    if (!ctx || this.hidden) return;
    const beat = 60 / 66;
    while (this.musicNextAt < ctx.currentTime + 0.6) {
      const t = this.musicNextAt;
      if (this.phraseLeft <= 0) {
        // Cümle arası: biraz sus, sonra yeni cümleye başla.
        this.phraseLeft = 4 + Math.floor(Math.random() * 5);
        this.musicNextAt += beat * (2 + Math.floor(Math.random() * 3));
        continue;
      }
      const stepChoices = [-2, -1, -1, 1, 1, 2, 0];
      this.melodyIndex = Math.max(0, Math.min(HICAZ.length - 1, this.melodyIndex + stepChoices[Math.floor(Math.random() * stepChoices.length)]));
      // Cümleler durak perdesine (re) dönme eğiliminde
      if (this.phraseLeft === 1 && Math.random() < 0.6) this.melodyIndex = Math.random() < 0.5 ? 0 : 7;
      const f = hz(D4 + HICAZ[this.melodyIndex]);
      this.pluck(f, t, 0.35, this.musicBus);
      if (Math.random() < 0.18) this.pluck(f * 2, t + beat / 4, 0.15, this.musicBus);
      this.phraseLeft--;
      const lengths = [0.5, 1, 1, 1, 1.5, 2];
      this.musicNextAt += beat * lengths[Math.floor(Math.random() * lengths.length)];
    }
  }

  private startDrone(): { stop: () => void } {
    const ctx = this.ctx!;
    const out = ctx.createGain();
    out.gain.value = 0.0001;
    out.gain.exponentialRampToValueAtTime(0.16, ctx.currentTime + 4);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 520;
    lp.connect(out).connect(this.musicBus!);
    const oscs = [hz(D4 - 24), hz(D4 - 17), hz(D4 - 12) * 1.003].map((f, i) => {
      const o = ctx.createOscillator();
      o.type = i === 0 ? 'sawtooth' : 'triangle';
      o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = i === 0 ? 0.35 : 0.5;
      o.connect(g).connect(lp);
      o.start();
      return o;
    });
    // Yavaş nefes alan süzgeç
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 180;
    lfo.connect(lfoGain).connect(lp.frequency);
    lfo.start();
    return {
      stop: () => {
        const t = ctx.currentTime;
        out.gain.cancelScheduledValues(t);
        out.gain.setTargetAtTime(0.0001, t, 0.4);
        [...oscs, lfo].forEach((o) => o.stop(t + 2));
      },
    };
  }

  // ---- Yapı taşları ----

  private ready(): Ctx | undefined {
    if (!this.sfxOn || !this.ctx || this.ctx.state !== 'running') return undefined;
    return this.voices > 24 ? undefined : this.ctx;
  }

  private track(node: AudioScheduledSourceNode): void {
    this.voices++;
    node.onended = () => this.voices--;
  }

  /** Kristal çanı: uyumsuz kısmi seslerle kısa, parlak bir tın. */
  private bell(f: number, t: number, level: number, decay: number): void {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(level, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    g.connect(this.sfxBus!);
    [
      [1, 1],
      [2.76, 0.35],
      [5.4, 0.12],
    ].forEach(([ratio, amp]) => {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = f * ratio;
      const pg = ctx.createGain();
      pg.gain.value = amp;
      o.connect(pg).connect(g);
      o.start(t);
      o.stop(t + decay + 0.05);
      this.track(o);
    });
  }

  private blip(f0: number, f1: number, t: number, dur: number, level: number): void {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(level, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.08);
    o.connect(g).connect(this.sfxBus!);
    o.start(t);
    o.stop(t + dur + 0.1);
    this.track(o);
  }

  private swell(f: number, t: number, dur: number): void {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.value = f;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(200, t);
    lp.frequency.exponentialRampToValueAtTime(1200, t + dur * 0.5);
    lp.frequency.exponentialRampToValueAtTime(200, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.18, t + dur * 0.4);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(lp).connect(g).connect(this.sfxBus!);
    o.start(t);
    o.stop(t + dur + 0.05);
    this.track(o);
  }

  /** Karplus-Strong ile saz benzeri tel sesi. Tamponlar nota başına bir kez üretilir. */
  private pluck(f: number, t: number, level: number, bus: AudioNode = this.sfxBus!): void {
    const ctx = this.ctx!;
    const key = Math.round(f * 10);
    let buf = this.plucks.get(key);
    if (!buf) {
      buf = this.karplus(f, 2.2);
      this.plucks.set(key, buf);
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const g = ctx.createGain();
    g.gain.value = level;
    src.connect(g).connect(bus);
    src.start(t);
    this.track(src);
  }

  private karplus(f: number, seconds: number): AudioBuffer {
    const ctx = this.ctx!;
    const sr = ctx.sampleRate;
    const len = Math.floor(sr * seconds);
    const buf = ctx.createBuffer(1, len, sr);
    const out = buf.getChannelData(0);
    const period = Math.max(2, Math.round(sr / f));
    const ring = new Float32Array(period);
    for (let i = 0; i < period; i++) ring[i] = Math.random() * 2 - 1;
    let idx = 0;
    let prev = 0;
    for (let i = 0; i < len; i++) {
      const cur = ring[idx];
      const next = ring[(idx + 1) % period];
      ring[idx] = 0.5 * (cur + next) * 0.996;
      // Hafif alçak geçiren: tını yumuşasın
      const y = 0.7 * cur + 0.3 * prev;
      prev = y;
      out[i] = y;
      idx = (idx + 1) % period;
    }
    // Başa çok kısa bir yükselme: tık sesi olmasın
    for (let i = 0; i < 64 && i < len; i++) out[i] *= i / 64;
    return buf;
  }

  private noise(seconds: number): AudioBuffer {
    const ctx = this.ctx!;
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  private impulse(seconds: number): AudioBuffer {
    const ctx = this.ctx!;
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3;
    }
    return buf;
  }
}

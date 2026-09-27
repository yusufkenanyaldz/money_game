import { ICON_BODIES, type IconName } from './icons.gen';

type Child = Node | string | null | undefined | false;
type Attrs = Record<string, unknown>;

/** Küçük DOM kurucu: h('div', { class: 'kart', onclick: fn }, 'metin', çocuk) */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs?: Attrs | null,
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v === undefined || v === null || v === false) continue;
      if (k === 'class') el.className = String(v);
      else if (k.startsWith('on') && typeof v === 'function') {
        el.addEventListener(k.slice(2), v as EventListener);
      } else if (k === 'style' && typeof v === 'object') {
        for (const [prop, val] of Object.entries(v as Record<string, string>)) el.style.setProperty(prop, val);
      }
      else if (v === true) el.setAttribute(k, '');
      else el.setAttribute(k, String(v));
    }
  }
  for (const c of children) if (c !== null && c !== undefined && c !== false) el.append(c);
  return el;
}

export function icon(name: IconName, cls = ''): SVGSVGElement {
  const t = document.createElement('template');
  t.innerHTML = `<svg viewBox="0 0 512 512" class="ikon ${cls}" aria-hidden="true" focusable="false">${ICON_BODIES[name]}</svg>`;
  return t.content.firstElementChild as SVGSVGElement;
}

/** Yalnızca değer değiştiğinde DOM'a yazan metin bağlayıcısı. */
export function text(el: HTMLElement): (v: string) => void {
  let last: string | undefined;
  return (v) => {
    if (v !== last) {
      el.textContent = v;
      last = v;
    }
  };
}

/** Değişince yazan stil değişkeni bağlayıcısı. */
export function cssVar(el: HTMLElement, name: string): (v: string) => void {
  let last: string | undefined;
  return (v) => {
    if (v !== last) {
      el.style.setProperty(name, v);
      last = v;
    }
  };
}

export function toggle(el: Element, cls: string, on: boolean): void {
  if (el.classList.contains(cls) !== on) el.classList.toggle(cls, on);
}

export function show(el: HTMLElement, visible: boolean): void {
  if (el.hidden === visible) el.hidden = !visible;
}

export function disable(el: HTMLButtonElement, off: boolean): void {
  if (el.disabled !== off) el.disabled = off;
}

/** Bir öğenin ortasından saçılan kıvılcımlar ve yükselen kısa bir yazı. */
export function burst(from: HTMLElement, color: string, count: number, label?: string): void {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const r = from.getBoundingClientRect();
  const x = r.left + r.width / 2;
  const y = r.top + r.height / 2;
  for (let k = 0; k < count; k++) {
    const p = h('div', { class: 'kivilcim', style: { background: color, 'box-shadow': `0 0 8px ${color}` } });
    document.body.append(p);
    const a = Math.random() * Math.PI * 2;
    const d = 26 + Math.random() * 38;
    p.animate(
      [
        { transform: `translate(${x}px, ${y}px) scale(1)`, opacity: 1 },
        { transform: `translate(${x + Math.cos(a) * d}px, ${y + Math.sin(a) * d}px) scale(0.2)`, opacity: 0 },
      ],
      { duration: 420 + Math.random() * 260, easing: 'cubic-bezier(.2,.8,.4,1)', fill: 'forwards' },
    ).onfinish = () => p.remove();
  }
  if (label) {
    const t = h('div', { class: 'kivilcim-yazi' }, label);
    document.body.append(t);
    t.animate(
      [
        { transform: `translate(${x}px, ${y - 10}px) translate(-50%, -50%) scale(0.7)`, opacity: 1 },
        { transform: `translate(${x}px, ${y - 56}px) translate(-50%, -50%) scale(1)`, opacity: 0 },
      ],
      { duration: 800, easing: 'ease-out', fill: 'forwards' },
    ).onfinish = () => t.remove();
  }
}

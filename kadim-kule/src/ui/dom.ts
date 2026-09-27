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

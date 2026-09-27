import type { Sound } from '../audio/sound';
import type { GameEvent } from '../core/events';
import type { GameState } from '../core/state';
import type { IconName } from './icons.gen';

export type TabId = 'kristal' | 'yaratiklar' | 'kutuphane' | 'kule';

/** Ekranların oyunla konuştuğu arayüz. */
export interface Game {
  readonly state: GameState;
  readonly sound: Sound;
  /** Bir eylemin olaylarını işler: ses, titreşim, bildirim, kayıt. */
  handle(events: GameEvent[]): void;
  save(): void;
  toast(text: string, icon?: IconName, gold?: boolean): void;
  modal(build: (close: () => void) => HTMLElement[]): void;
  vibrate(ms: number): void;
  /** Ayarlar değişince ses ve sayı biçimini günceller. */
  applySettings(): void;
  /** İçe aktarma ya da sıfırlama sonrası yeni durumla yeniden başlar. */
  replaceState(s: GameState): void;
}

export interface View {
  el: HTMLElement;
  update(): void;
}

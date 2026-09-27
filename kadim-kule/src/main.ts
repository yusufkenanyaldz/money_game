import './style.css';
import { newGame, type GameState } from './core/state';
import { exportSave, importSave, loadFromStorage } from './save/save';
import { App } from './ui/app';

interface HotApi {
  data?: { kayit?: string };
  ready?: (start: (data?: { kayit?: string }) => void) => void;
  snapshot?: (fn: () => { kayit: string }) => void;
}

const hot = (window as unknown as { claude?: { hot?: HotApi } }).claude?.hot;

function start(data?: { kayit?: string }): void {
  let state: GameState | undefined;
  if (data?.kayit) {
    try {
      state = importSave(data.kayit);
    } catch {
      state = undefined;
    }
  }
  state ??= loadFromStorage() ?? newGame();
  const app = new App(state);
  // Oyun yeniden yayınlanırsa açık sayfadaki ilerleme kaybolmasın.
  hot?.snapshot?.(() => ({ kayit: exportSave(app.snapshot()) }));
}

if (hot?.ready) hot.ready(start);
else start(hot?.data);

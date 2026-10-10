import { typeIn } from '../caption.js';
import { sleep } from '../util.js';

const DELAY = 0.3, STEP = 0.03, HOLD_MS = 1800;

// A scene with no stones or grid: just centred text on plain wood.
export function interlude(text) {
  return async ({ board, caption }) => {
    board.setGridVisible(false);
    caption.classList.add('centered');
    typeIn(caption, { text, delay: DELAY, step: STEP });
    await sleep(DELAY * 1000 + [...text].length * STEP * 1000 + 600 + HOLD_MS); // reveal, then time to read
  };
}

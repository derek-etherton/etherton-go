import { typeIn } from '../caption.js';
import { enableBlackPlay } from '../input.js';
import { sleep } from '../util.js';

// Opening scene: a lone white stone with a single liberty (below it).
// Resolves shortly after the visitor captures it.
export async function intro({ board, caption }) {
  board.place(0, 0, 'white', { animate: false });
  board.place(-1, 0, 'black', { animate: false });
  board.place(1, 0, 'black', { animate: false });
  board.place(0, -1, 'black', { animate: false });
  board.markLiberty(0, 1);
  typeIn(caption);

  const disableInput = enableBlackPlay(board);
  await new Promise((resolve) => board.addEventListener('capture', resolve, { once: true }));
  disableInput();
  await sleep(1200); // let the captured stone fade away
}

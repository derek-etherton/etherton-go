import { typeIn } from '../caption.js';

// Opening scene: a lone white stone with a single liberty (below it).
export function intro(board, caption) {
  board.place(0, 0, 'white', { animate: false });
  board.place(-1, 0, 'black', { animate: false });
  board.place(1, 0, 'black', { animate: false });
  board.place(0, -1, 'black', { animate: false });
  board.markLiberty(0, 1);
  typeIn(caption);
}

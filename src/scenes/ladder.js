import { waitForBlackAt } from '../input.js';
import { sleep } from '../util.js';

const BOARD_SIZE = 95;

// Two black stones in a ladder: white has them down to a single liberty.
// The visitor plays each indicated extension; white ataris again, down and to
// the right, until the ladder reaches the edge of the screen. Then we zoom out
// to show the whole (comically large) board.
export async function ladder({ board }) {
  // Whole-number bounds, so the grid lines always sit under the stones.
  const min = -Math.floor(BOARD_SIZE / 2);
  const max = min + BOARD_SIZE - 1;
  board.setBounds([min, min], [max, max]);
  board.setView({ center: [0.5, 0] });

  for (const [x, y] of [[0, 0], [1, 0]]) board.place(x, y, 'black', { animate: false });
  for (const [x, y] of [[1, -1], [0, -1], [-1, 0], [2, 0], [0, 1]]) {
    board.place(x, y, 'white', { animate: false });
  }

  // Black's extension and white's reply alternate between going right and down.
  const nextStep = (x, y, step) => {
    const goRight = step % 2 === 1;
    return {
      white: goRight ? [x, y + 1] : [x + 1, y],
      black: goRight ? [x + 1, y] : [x, y + 1],
    };
  };

  let [x, y] = [1, 1];
  board.markLiberty(x, y);
  for (let step = 1; ; step++) {
    await waitForBlackAt(board, x, y);
    await sleep(500);
    const reply = nextStep(x, y, step);
    board.place(...reply.white, 'white'); // white ataris
    [x, y] = reply.black;
    board.markLiberty(x, y);
    // Stop once white's next atari would fall off the screen.
    if (!board.isVisible(...nextStep(x, y, step + 1).white)) break;
  }

  await sleep(1500);
  const middle = (min + max) / 2;
  await board.animateView({ visibleCells: BOARD_SIZE + 6, center: [middle, middle] }, 6000);
}

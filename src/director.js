import { sleep } from './util.js';

const FADE_MS = 800;

// Runs scenes in order. A scene is an async function taking { board, caption }
// that sets up its position and resolves when it is ready to hand over; the
// director then fades out, clears the board, and fades the next scene in.
export async function runScenes(context, scenes) {
  const { board, caption } = context;
  for (const [index, scene] of scenes.entries()) {
    await scene(context);
    if (index === scenes.length - 1) break;

    document.body.classList.add('fading');
    await sleep(FADE_MS);
    board.clear();
    caption.replaceChildren();
    caption.classList.remove('centered');
    caption.removeAttribute('aria-label');
    document.body.classList.remove('fading');
    await sleep(FADE_MS);
  }
}

import { Board } from './board.js';
import { runScenes } from './director.js';
import { intro } from './scenes/intro.js';
import { interlude } from './scenes/interlude.js';
import { ladder } from './scenes/ladder.js';

const board = new Board(document.getElementById('stage'), { visibleCells: 5 });
const caption = document.getElementById('caption');

runScenes({ board, caption }, [
  intro,
  interlude("What a great master!\nI didn't know you could play..."),
  ladder,
]);

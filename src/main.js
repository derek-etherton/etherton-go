import { Board } from './board.js';
import { intro } from './scenes/intro.js';

const board = new Board(document.getElementById('stage'), { visibleCells: 5 });
intro(board, document.getElementById('caption'));

import { svgElement } from './svg.js';
import { drawDefs, drawGrid, drawStone, drawLiberty } from './board-view.js';
import { sleep } from './util.js';

// A zoomed-in window onto a Go board. Owns the board state (stones, liberty
// marks) and the screen geometry; drawing is delegated to board-view.js.
// Coordinates are integer offsets (x, y) from the centre intersection, so
// scenes are independent of screen size.
export class Board {
  // visibleCells: how many grid cells span the shorter screen edge
  constructor(root, { visibleCells = 5 } = {}) {
    this.visibleCells = visibleCells;
    this.stones = new Map();    // "x,y" -> 'black' | 'white'
    this.liberties = new Set(); // "x,y"
    this.svg = svgElement('svg', { role: 'img' }, root);
    this.render();
    addEventListener('resize', () => this.render());
  }

  place(x, y, color, { animate = true } = {}) {
    this.stones.set(key(x, y), color);
    return drawStone(this.layer, ...this.pixel(x, y), color, this.cell, { animate });
  }

  // A soft pulsing dot on an empty point (e.g. a last liberty).
  markLiberty(x, y) {
    this.liberties.add(key(x, y));
    return drawLiberty(this.layer, ...this.pixel(x, y), this.cell);
  }

  // Place a sequence of [x, y, color] moves, one after another.
  async play(moves, delay = 450) {
    for (const [x, y, color] of moves) {
      this.place(x, y, color);
      await sleep(delay);
    }
  }

  pixel(x, y) {
    return [this.cx + x * this.cell, this.cy + y * this.cell];
  }

  // Redraw everything from state for the current window size.
  render() {
    const width = innerWidth, height = innerHeight;
    this.cell = Math.min(width, height) / this.visibleCells;
    this.cx = width / 2;
    this.cy = height / 2;
    document.documentElement.style.setProperty('--cell', `${this.cell}px`);

    this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    this.svg.replaceChildren();
    drawDefs(this.svg, this.cell);
    drawGrid(this.svg, { width, height, cell: this.cell, cx: this.cx, cy: this.cy });
    this.layer = svgElement('g', {}, this.svg);

    for (const k of this.liberties) drawLiberty(this.layer, ...this.pixel(...parse(k)), this.cell);
    for (const [k, color] of this.stones) {
      drawStone(this.layer, ...this.pixel(...parse(k)), color, this.cell, { animate: false });
    }
  }
}

const key = (x, y) => `${x},${y}`;
const parse = (k) => k.split(',').map(Number);

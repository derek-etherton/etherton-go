import { svgElement } from './svg.js';
import { drawDefs, drawGrid, drawStone, drawLiberty } from './board-view.js';
import { sleep } from './util.js';
import { key, parse, capturedBy } from './rules.js';

// A zoomed-in window onto a Go board. Owns the board state (stones, liberty
// marks) and the screen geometry; drawing is delegated to board-view.js.
// Coordinates are integer offsets (x, y) from the centre intersection, so
// scenes are independent of screen size.
export class Board extends EventTarget {
  // visibleCells: how many grid cells span the shorter screen edge
  // center: the [x, y] point shown at the middle of the screen
  constructor(root, { visibleCells = 5, center = [0, 0] } = {}) {
    super();
    this.defaultView = { visibleCells, center };
    this.view = { ...this.defaultView };
    this.bounds = null; // { min: [x, y], max: [x, y] } for a finite board
    this.showGrid = true;
    this.stones = new Map();    // "x,y" -> 'black' | 'white'
    this.stoneNodes = new Map(); // "x,y" -> SVG element
    this.liberties = new Map(); // "x,y" -> marker element
    this.svg = svgElement('svg', { role: 'img' }, root);
    this.render();
    addEventListener('resize', () => this.render());
  }

  place(x, y, color, { animate = true } = {}) {
    this.stones.set(key(x, y), color);
    this.clearLiberty(x, y);
    const node = drawStone(this.layer, ...this.pixel(x, y), color, this.cell, { animate });
    this.stoneNodes.set(key(x, y), node);
    this.capture(capturedBy(this.stones, x, y));
    return node;
  }

  // Frame a different part of the board (omit options to restore the default).
  setView(view = {}) {
    this.view = { ...this.defaultView, ...view };
    this.render();
  }

  // Show plain wood with no grid lines (restored by clear()).
  setGridVisible(visible) {
    this.showGrid = visible;
    this.render();
  }

  // Make the board finite: points from min to max inclusive.
  setBounds(min, max) {
    this.bounds = { min, max };
    this.render();
  }

  // Smoothly move to another view. Zoom is interpolated geometrically so it
  // feels even whether going from 5 cells across to 5 or to 200.
  async animateView(view, duration = 3000) {
    const from = this.view;
    const to = { ...this.defaultView, ...view };
    const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
    const start = performance.now();
    await new Promise((resolve) => {
      const frame = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const e = ease(t);
        this.view = {
          visibleCells: Math.exp(Math.log(from.visibleCells) * (1 - e) + Math.log(to.visibleCells) * e),
          center: [0, 1].map((i) => from.center[i] + (to.center[i] - from.center[i]) * e),
        };
        this.render();
        if (t < 1) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
  }

  // Is the stone at (x, y) fully on screen?
  isVisible(x, y) {
    const [px, py] = this.pixel(x, y);
    const margin = this.cell / 2;
    return px >= margin && px <= innerWidth - margin && py >= margin && py <= innerHeight - margin;
  }

  // Remove every stone and mark, and restore the default view.
  clear() {
    this.bounds = null;
    this.showGrid = true;
    this.stones.clear();
    this.stoneNodes.clear();
    this.liberties.clear();
    this.setView();
  }

  // Remove stones from the board, fading them out.
  capture(keys) {
    if (keys.size) this.dispatchEvent(new CustomEvent('capture', { detail: [...keys] }));
    for (const k of keys) {
      this.stones.delete(k);
      const node = this.stoneNodes.get(k);
      this.stoneNodes.delete(k);
      node?.classList.add('captured');
      node?.addEventListener('animationend', () => node.remove(), { once: true });
    }
  }

  // A soft pulsing dot on an empty point (e.g. a last liberty).
  markLiberty(x, y) {
    const marker = drawLiberty(this.layer, ...this.pixel(x, y), this.cell);
    this.liberties.set(key(x, y), marker);
    return marker;
  }

  clearLiberty(x, y) {
    this.liberties.get(key(x, y))?.remove();
    this.liberties.delete(key(x, y));
  }

  isEmpty(x, y) {
    return !this.stones.has(key(x, y));
  }

  // The intersection nearest to a screen position, as [x, y] offsets.
  pointAt(px, py) {
    return [Math.round((px - this.originX) / this.cell), Math.round((py - this.originY) / this.cell)];
  }

  // A translucent preview stone, e.g. under the cursor.
  showGhost(x, y, color) {
    this.hideGhost();
    this.ghost = drawStone(this.layer, ...this.pixel(x, y), color, this.cell, { animate: false });
    this.ghost.classList.add('ghost');
    this.ghost.removeAttribute('filter'); // the shadow muddies the see-through look
  }

  hideGhost() {
    this.ghost?.remove();
    this.ghost = null;
  }

  // Place a sequence of [x, y, color] moves, one after another.
  async play(moves, delay = 450) {
    for (const [x, y, color] of moves) {
      this.place(x, y, color);
      await sleep(delay);
    }
  }

  pixel(x, y) {
    return [this.originX + x * this.cell, this.originY + y * this.cell];
  }

  // Redraw everything from state for the current window size.
  render() {
    const width = innerWidth, height = innerHeight;
    const { visibleCells, center: [centerX, centerY] } = this.view;
    this.cell = Math.min(width, height) / visibleCells;
    // screen position of point (0, 0)
    this.originX = width / 2 - centerX * this.cell;
    this.originY = height / 2 - centerY * this.cell;
    document.documentElement.style.setProperty('--cell', `${this.cell}px`);

    this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    this.svg.replaceChildren();
    drawDefs(this.svg, this.cell);
    drawGrid(this.svg, { width, height, cell: this.cell, originX: this.originX, originY: this.originY, bounds: this.bounds, showGrid: this.showGrid });
    this.layer = svgElement('g', {}, this.svg);
    this.ghost = null;

    for (const k of this.liberties.keys()) {
      this.liberties.set(k, drawLiberty(this.layer, ...this.pixel(...parse(k)), this.cell));
    }
    this.stoneNodes.clear();
    for (const [k, color] of this.stones) {
      const node = drawStone(this.layer, ...this.pixel(...parse(k)), color, this.cell, { animate: false });
      this.stoneNodes.set(k, node);
    }
  }
}

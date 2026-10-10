import { svgElement } from './svg.js';
import { theme } from './theme.js';

// Pure drawing: turns board state + geometry into SVG. Holds no game state.

export function drawDefs(svg, cell) {
  const defs = svgElement('defs', {}, svg);

  const wood = svgElement('linearGradient', { id: 'wood', x1: 0, y1: 0, x2: 1, y2: 1 }, defs);
  theme.wood.forEach((color, i) => svgElement('stop', { offset: i, 'stop-color': color }, wood));

  for (const [name, [light, dark]] of Object.entries(theme.stones)) {
    const gradient = svgElement('radialGradient', { id: name, cx: '35%', cy: '30%', r: '78%' }, defs);
    svgElement('stop', { offset: 0, 'stop-color': light }, gradient);
    svgElement('stop', { offset: 1, 'stop-color': dark }, gradient);
  }

  const shadow = svgElement('filter', { id: 'shadow', x: '-30%', y: '-30%', width: '170%', height: '170%' }, defs);
  svgElement('feDropShadow', {
    dx: cell * 0.04, dy: cell * 0.07, stdDeviation: cell * 0.05, 'flood-opacity': 0.45,
  }, shadow);
}

export function drawGrid(svg, { width, height, cell, cx, cy }) {
  svgElement('rect', { width: '100%', height: '100%', fill: 'url(#wood)' }, svg);
  const lines = svgElement('g', {
    stroke: theme.line, 'stroke-width': Math.max(1.5, cell * 0.018), 'stroke-linecap': 'square',
  }, svg);
  const cols = Math.ceil(width / 2 / cell) + 1;
  const rows = Math.ceil(height / 2 / cell) + 1;
  for (let i = -cols; i <= cols; i++) {
    svgElement('line', { x1: cx + i * cell, x2: cx + i * cell, y1: 0, y2: height }, lines);
  }
  for (let j = -rows; j <= rows; j++) {
    svgElement('line', { y1: cy + j * cell, y2: cy + j * cell, x1: 0, x2: width }, lines);
  }
}

export function drawStone(parent, px, py, color, cell, { animate }) {
  const group = svgElement('g', {
    class: animate ? 'stone drop' : 'stone', filter: 'url(#shadow)',
  }, parent);
  svgElement('circle', { cx: px, cy: py, r: cell * 0.47, fill: `url(#${color})` }, group);
  return group;
}

export function drawLiberty(parent, px, py, cell) {
  return svgElement('circle', {
    class: 'liberty', cx: px, cy: py, r: cell * 0.14, fill: theme.liberty,
  }, parent);
}

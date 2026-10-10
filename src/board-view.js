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

// Without bounds the grid fills the screen. With bounds ({ min, max } in
// board coordinates) a finite board is drawn on a table.
export function drawGrid(svg, { width, height, cell, originX, originY, bounds, showGrid }) {
  let [firstX, lastX, firstY, lastY] = [
    -Math.ceil(originX / cell), Math.floor((width - originX) / cell),
    -Math.ceil(originY / cell), Math.floor((height - originY) / cell),
  ];
  let [top, bottom, left, right] = [0, height, 0, width];

  if (bounds) {
    const { min, max } = bounds;
    [firstX, lastX, firstY, lastY] = [min[0], max[0], min[1], max[1]];
    [left, right] = [originX + (min[0] - 0.5) * cell, originX + (max[0] + 0.5) * cell];
    [top, bottom] = [originY + (min[1] - 0.5) * cell, originY + (max[1] + 0.5) * cell];
    svgElement('rect', { width: '100%', height: '100%', fill: theme.table }, svg);
  }
  svgElement('rect', { x: left, y: top, width: right - left, height: bottom - top, fill: 'url(#wood)' }, svg);
  if (!showGrid) return;
  const lines = svgElement('g', {
    stroke: theme.line, 'stroke-width': Math.max(0.5, cell * 0.018), 'stroke-linecap': 'square',
  }, svg);

  // Lines run to the edge of the wood (screen edge when unbounded).
  const lineTop = bounds ? originY + firstY * cell : 0, lineBottom = bounds ? originY + lastY * cell : height;
  const lineLeft = bounds ? originX + firstX * cell : 0, lineRight = bounds ? originX + lastX * cell : width;
  for (let i = firstX; i <= lastX; i++) {
    svgElement('line', { x1: originX + i * cell, x2: originX + i * cell, y1: lineTop, y2: lineBottom }, lines);
  }
  for (let j = firstY; j <= lastY; j++) {
    svgElement('line', { y1: originY + j * cell, y2: originY + j * cell, x1: lineLeft, x2: lineRight }, lines);
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

// Go capture rules over a stones Map of "x,y" -> color. The board is
// unbounded, so only stones can block a liberty.
const DIRECTIONS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

export const key = (x, y) => `${x},${y}`;
export const parse = (k) => k.split(',').map(Number);

const neighbors = (x, y) => DIRECTIONS.map(([dx, dy]) => [x + dx, y + dy]);

// The connected same-colour group containing (x, y), and whether it has a liberty.
function groupAt(stones, x, y) {
  const color = stones.get(key(x, y));
  const group = new Set([key(x, y)]);
  const queue = [[x, y]];
  let hasLiberty = false;
  while (queue.length) {
    const [cx, cy] = queue.pop();
    for (const [nx, ny] of neighbors(cx, cy)) {
      const k = key(nx, ny);
      if (!stones.has(k)) hasLiberty = true;
      else if (stones.get(k) === color && !group.has(k)) {
        group.add(k);
        queue.push([nx, ny]);
      }
    }
  }
  return { group, hasLiberty };
}

// Keys of opposing stones left without liberties by a stone just played at (x, y).
export function capturedBy(stones, x, y) {
  const color = stones.get(key(x, y));
  const captured = new Set();
  for (const [nx, ny] of neighbors(x, y)) {
    const k = key(nx, ny);
    if (!stones.has(k) || stones.get(k) === color || captured.has(k)) continue;
    const { group, hasLiberty } = groupAt(stones, nx, ny);
    if (!hasLiberty) group.forEach((g) => captured.add(g));
  }
  return captured;
}

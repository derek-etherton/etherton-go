// Let the visitor play black stones by clicking intersections.
// A translucent ghost stone follows the pointer over empty points.
// `allowed(x, y)` limits which empty points can be played (default: any).
// Returns a function that turns input off again.
export function enableBlackPlay(board, { onPlay, allowed = () => true } = {}) {
  const svg = board.svg;
  const controller = new AbortController();
  const { signal } = controller;

  const pointFor = (event) => {
    const [x, y] = board.pointAt(event.clientX, event.clientY);
    return board.isEmpty(x, y) && allowed(x, y) ? [x, y] : null;
  };

  svg.addEventListener('pointermove', (event) => {
    const point = event.pointerType === 'mouse' && pointFor(event);
    if (point) board.showGhost(...point, 'black');
    else board.hideGhost();
    svg.style.cursor = point ? 'pointer' : '';
  }, { signal });
  svg.addEventListener('pointerleave', () => board.hideGhost(), { signal });

  svg.addEventListener('click', (event) => {
    const point = pointFor(event);
    if (!point) return;
    board.hideGhost();
    board.place(...point, 'black');
    onPlay?.(...point);
  }, { signal });

  return () => {
    controller.abort();
    board.hideGhost();
    svg.style.cursor = '';
  };
}

// Resolve once the visitor plays black at exactly (x, y).
export function waitForBlackAt(board, x, y) {
  return new Promise((resolve) => {
    const disable = enableBlackPlay(board, {
      allowed: (px, py) => px === x && py === y,
      onPlay: () => { disable(); resolve(); },
    });
  });
}

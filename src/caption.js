// Reveal text (default: the element's own) letter by letter (animation lives in style.css).
export function typeIn(element, { delay = 0.8, step = 0.07, text = element.textContent } = {}) {
  element.setAttribute('aria-label', text);
  element.replaceChildren(...[...text].map((char, i) => {
    if (char === '\n') return document.createElement('br');
    const span = document.createElement('span');
    span.textContent = char;
    span.style.animationDelay = `${delay + i * step}s`;
    return span;
  }));
}

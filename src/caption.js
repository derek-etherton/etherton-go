// Reveal an element's text letter by letter (animation lives in style.css).
export function typeIn(element, { delay = 0.8, step = 0.07 } = {}) {
  const text = element.textContent;
  element.setAttribute('aria-label', text);
  element.replaceChildren(...[...text].map((char, i) => {
    const span = document.createElement('span');
    span.textContent = char;
    span.style.animationDelay = `${delay + i * step}s`;
    return span;
  }));
}

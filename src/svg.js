const SVG_NS = 'http://www.w3.org/2000/svg';

// Create an SVG element with attributes, optionally appending it to a parent.
export function svgElement(tag, attrs = {}, parent) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value);
  parent?.appendChild(node);
  return node;
}

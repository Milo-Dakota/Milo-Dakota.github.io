export const $ = selector => document.querySelector(selector);
export function el(tag, attributes = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attributes)) {
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key.startsWith('on')) node.addEventListener(key.slice(2), value);
    else if (value === true) node.setAttribute(key, '');
    else if (value !== false && value != null) node.setAttribute(key, value);
  }
  for (const child of children.flat()) if (child != null) node.append(child);
  return node;
}
export function replace(selector, ...children) { $(selector).replaceChildren(...children.flat().filter(child => child != null)); }
export function meter(value, max, label, className = '') {
  return el('progress', { value, max, 'aria-label': label, class: className });
}

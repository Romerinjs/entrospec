export const PRIMITIVE_NAMES = [
  'Frame', 'Region', 'Grid', 'GridArea', 'Stack', 'Cluster', 'Rail', 'Layer', 'Overlay', 'FreeformLayer',
  'TextBlock', 'Heading', 'Label', 'Figure', 'Media', 'Video', 'Diagram', 'Shape', 'Rule', 'Line', 'Badge',
  'Caption', 'Statistic', 'Quote', 'Marquee', 'Ticker', 'StickyFrame', 'ScrollSequence', 'CanvasLayer',
  'SVGScene', 'Navigation', 'InteractiveRegion'
] as const;

export type PrimitiveName = typeof PRIMITIVE_NAMES[number];
export type PrimitiveProps = Record<string, string | number | boolean | undefined>;

const tags: Record<PrimitiveName, string> = {
  Frame: 'div', Region: 'section', Grid: 'div', GridArea: 'div', Stack: 'div', Cluster: 'div', Rail: 'div', Layer: 'div', Overlay: 'div', FreeformLayer: 'div',
  TextBlock: 'p', Heading: 'h2', Label: 'span', Figure: 'figure', Media: 'figure', Video: 'video', Diagram: 'figure', Shape: 'span', Rule: 'hr', Line: 'span', Badge: 'span',
  Caption: 'figcaption', Statistic: 'figure', Quote: 'blockquote', Marquee: 'div', Ticker: 'div', StickyFrame: 'div', ScrollSequence: 'div', CanvasLayer: 'canvas', SVGScene: 'figure', Navigation: 'nav', InteractiveRegion: 'section'
};

const classes: Partial<Record<PrimitiveName, string>> = {
  TextBlock: 'primitive-copy', Heading: 'primitive-heading', Label: 'primitive-label', Statistic: 'primitive-statistic', Quote: 'primitive-quote',
  Diagram: 'primitive-diagram', Rule: 'primitive-rule', Line: 'primitive-line', Badge: 'primitive-badge', Caption: 'primitive-caption',
  Ticker: 'primitive-ticker', Rail: 'primitive-rail', Figure: 'primitive-figure', Media: 'primitive-media'
};

function escapeAttribute(value: string): string {
  return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character] || character));
}

/** Renders a whitelisted semantic primitive. innerHtml must be produced by the escaped content compiler. */
export function renderPrimitive(name: PrimitiveName, innerHtml = '', props: PrimitiveProps = {}): string {
  const tag = tags[name];
  const customClass = typeof props.className === 'string' && /^[\w -]{1,100}$/.test(props.className) ? props.className : '';
  const attributes: string[] = [`class="${escapeAttribute([classes[name] ?? `primitive-${name.toLowerCase()}`, customClass].filter(Boolean).join(' '))}"`, `data-primitive="${name}"`];
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === false) continue;
    if (!['id', 'role', 'aria-label', 'aria-labelledby', 'href', 'tabindex', 'data-purpose', 'data-axis', 'data-rhythm'].includes(key)) continue;
    if (key === 'href' && typeof value === 'string' && !/^(#[\w-]+|mailto:[^\s]+|tel:[+\d-]+)$/i.test(value)) continue;
    attributes.push(`${key === 'tabindex' ? 'tabindex' : key}="${escapeAttribute(String(value))}"`);
  }
  if (tag === 'hr') return `<hr ${attributes.join(' ')}>`;
  return `<${tag} ${attributes.join(' ')}>${innerHtml}</${tag}>`;
}

export function isPrimitiveName(value: string): value is PrimitiveName {
  return (PRIMITIVE_NAMES as readonly string[]).includes(value);
}

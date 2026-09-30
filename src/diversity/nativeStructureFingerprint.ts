export interface AiNativeStructureFingerprint {
  heroLayout: string;
  sectionCount: number;
  gridPatterns: string[];
  cardCount: number;
  equalColumnPatterns: string[];
  faqMorphology: string;
  ctaMorphology: string;
  mediaPlacement: string[];
  fullBleedUsage: number;
  stickyUsage: number;
  densityRhythm: string[];
}

const count = (source: string, pattern: RegExp) => [...source.matchAll(pattern)].length;
const classifyGrid = (declaration: string) => {
  const columns = declaration.match(/repeat\(\s*(\d+)/i)?.[1];
  if (columns) return `repeat-${columns}`;
  const tracks = declaration.split(/\s+(?![^()]*\))/).filter(Boolean).length;
  return `explicit-${tracks}`;
};

function sectionTexts(html: string): string[] {
  const sections = [...html.matchAll(/<section\b[^>]*>([\s\S]*?)<\/section>/gi)].map(match => match[1]);
  if (sections.length) return sections;
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? html;
  return [...main.matchAll(/<(?:article|div)\b[^>]*>([\s\S]*?)<\/(?:article|div)>/gi)].map(match => match[1]).slice(0, 12);
}

function visibleWords(fragment: string): number {
  return (fragment.replace(/<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&[\w#]+;/g, ' ').match(/[\p{L}\p{N}]+/gu) ?? []).length;
}

export function createAiNativeStructureFingerprint(html: string): AiNativeStructureFingerprint {
  const styles = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(match => match[1]).join('\n');
  const firstSection = html.match(/<(?:section|header)\b[^>]*>([\s\S]*?)<\/(?:section|header)>/i)?.[1] ?? html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? html;
  const heroRule = styles.match(/[^{}]*(?:hero|opening)[^{}]*\{([^}]+)\}/i)?.[1] ?? '';
  const heroGrid = heroRule.match(/grid-template-columns\s*:\s*([^;}]+)/i)?.[1] ?? '';
  const heroHasColumns = Boolean(heroGrid && (/repeat\(\s*[2-9]/i.test(heroGrid) || (heroGrid.match(/(?:1fr|minmax\([^)]*1fr\))/gi)?.length ?? 0) >= 2));
  const gridDeclarations = [...styles.matchAll(/grid-template-columns\s*:\s*([^;}]+)/gi)].map(match => match[1].trim());
  const cardClassCount = count(html, /class\s*=\s*["'][^"']*(?:\bcard\b|feature-card|service-card)[^"']*["']/gi);
  const articleCount = count(html, /<article\b/gi);
  const metricCount = count(html, /(?:\+\s?\d[\d.,]*\s?%|\b\d+(?:\.\d+)?\s?x\b|\b\d+[km]\+?\b)/gi);
  const sectionCount = count(html, /<section\b/gi) || Math.max(1, sectionTexts(html).length);
  const centers = /text-align\s*:\s*center|place-items\s*:\s*center|align-items\s*:\s*center/i.test(styles);
  const faqHtml = html.match(/<(?:section|div)[^>]*(?:faq|question|objection)[^>]*>([\s\S]*?)<\/(?:section|div)>/i)?.[1] ?? html;
  const faqMorphology = /<details\b/i.test(faqHtml) ? 'accordion'
    : /myth|reality|mito|realidad/i.test(faqHtml) ? 'myth-reality'
      : /<blockquote|conversation|dialog/i.test(faqHtml) ? 'conversation'
        : /\?|question|pregunta/i.test(faqHtml) ? 'editorial-q-and-a' : 'none-detected';
  const ctaMorphology = /position\s*:\s*sticky/i.test(styles) ? 'sticky-action'
    : /<form\b/i.test(html) ? 'form-stage'
      : /full[-_ ]?bleed|100vw/i.test(`${firstSection} ${styles}`) ? 'full-bleed-close'
        : centers ? 'centered-cta' : 'inline-conversion';
  const heroLayout = heroHasColumns || /(?:grid-template-columns\s*:[^;}]*\b2fr\b[^;}]*\b1fr\b|grid-template-columns\s*:[^;}]*\b1fr\b[^;}]*\b2fr\b)/i.test(styles)
    ? 'split-two-column'
    : /hero[^{}]*\{[^}]*display\s*:\s*grid/i.test(styles) && /grid-template-columns\s*:[^;}]*repeat\(\s*2/i.test(styles)
      ? 'split-two-column'
      : /text-align\s*:\s*center/i.test(styles) && /hero/i.test(html) ? 'centered-hero'
        : /full[-_ ]?bleed|100vw/i.test(`${firstSection} ${styles}`) ? 'full-bleed'
          : /hero|<h1\b/i.test(html) ? 'single-field' : 'opening-unknown';
  const mediaTags = [...html.matchAll(/<(?:img|video|svg|picture)\b[^>]*>/gi)];
  const mediaPlacement = mediaTags.map((match, index) => {
    const precedingSections = count(html.slice(0, match.index), /<section\b/gi);
    const tag = match[0].slice(1).match(/^\w+/)?.[0]?.toLowerCase() ?? 'media';
    return `${tag}:region-${Math.min(sectionCount, precedingSections + 1)}:item-${index + 1}`;
  });
  const rhythm = sectionTexts(html).map(fragment => {
    const words = visibleWords(fragment);
    return words < 35 ? 'sparse' : words < 100 ? 'moderate' : 'dense';
  });
  const equalColumns = gridDeclarations.filter(value => /repeat\(\s*\d+\s*,\s*(?:minmax\(0\s*,\s*)?1fr/i.test(value)).map(classifyGrid);
  return {
    heroLayout,
    sectionCount,
    gridPatterns: gridDeclarations.map(classifyGrid),
    cardCount: Math.max(cardClassCount, articleCount),
    equalColumnPatterns: equalColumns,
    faqMorphology,
    ctaMorphology,
    mediaPlacement,
    fullBleedUsage: /(?:100vw|full[-_ ]?bleed)/i.test(`${html} ${styles}`) ? 1 : 0,
    stickyUsage: /position\s*:\s*(?:sticky|fixed)/i.test(styles) ? 1 : 0,
    densityRhythm: rhythm.length ? rhythm : [metricCount >= 3 ? 'metric-dense' : 'unclassified']
  };
}

function sequenceSimilarity(a: string[], b: string[]): number {
  const left = new Set(a); const right = new Set(b);
  const intersection = [...left].filter(value => right.has(value)).length;
  return intersection / Math.max(new Set([...left, ...right]).size, 1) * (Math.min(a.length, b.length) / Math.max(a.length, b.length, 1));
}

export function compareAiNativeFingerprints(a: AiNativeStructureFingerprint, b: AiNativeStructureFingerprint): number {
  const values: Array<[number, number]> = [
    [a.heroLayout === b.heroLayout ? 1 : 0, 2],
    [sequenceSimilarity(a.gridPatterns, b.gridPatterns), 1.4],
    [sequenceSimilarity(a.equalColumnPatterns, b.equalColumnPatterns), 1.2],
    [a.faqMorphology === b.faqMorphology ? 1 : 0, 1.1],
    [a.ctaMorphology === b.ctaMorphology ? 1 : 0, 1],
    [sequenceSimilarity(a.mediaPlacement, b.mediaPlacement), 0.8],
    [sequenceSimilarity(a.densityRhythm, b.densityRhythm), 0.8],
    [a.cardCount === b.cardCount ? 1 : 0, 0.7],
    [a.sectionCount === b.sectionCount ? 1 : 0, 0.5],
    [a.fullBleedUsage === b.fullBleedUsage ? 1 : 0, 0.4],
    [a.stickyUsage === b.stickyUsage ? 1 : 0, 0.4]
  ];
  const weight = values.reduce((sum, [, w]) => sum + w, 0);
  return Number((values.reduce((sum, [score, w]) => sum + score * w, 0) / weight).toFixed(4));
}

export interface UnsupportedClaim { text: string; kind: 'quantitative' | 'guarantee' }
const claimPatterns: Array<{ kind: UnsupportedClaim['kind']; regex: RegExp }> = [
  { kind: 'quantitative', regex: /(?:[+<]\s?\d[\d.,]*\s?(?:%|x|×|k\b|mil\b|millones?\b|h\b|hrs?\b|horas?\b|d[ií]as?\b|clientes?\b|usuarios?\b|impactos?\b)?|\b\d[\d.,]*\s?(?:%|x|×|k\b|mil\b|millones?\b|h\b|hrs?\b|horas?\b|d[ií]as?\b|clientes?\b|usuarios?\b|impactos?\b))/gi },
  { kind: 'guarantee', regex: /\b(?:garantiza(?:do|da|n)?|garant[ií]a|guarantee(?:d|s)?)\b/gi }
];

function normalizedNumbers(text: string): string[] { return (text.match(/\d+(?:[.,]\d+)?/g) ?? []).map(value => value.replace(',', '.')); }

export function detectUnsupportedClaims(html: string, brief: object): UnsupportedClaim[] {
  const visibleText = html.replace(/<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>/gi, ' ').replace(/<\/?[a-z][^>]*>/gi, ' ').replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ');
  const sourceText = Object.values(brief).filter(value => typeof value === 'string').join(' ');
  const supportedNumbers = new Set(normalizedNumbers(sourceText));
  const supportedGuarantee = /\b(?:garantiza(?:do|da|n)?|garant[ií]a|guarantee(?:d|s)?)\b/i.test(sourceText);
  const claims: UnsupportedClaim[] = [];
  for (const { kind, regex } of claimPatterns) {
    regex.lastIndex = 0;
    for (const match of visibleText.matchAll(regex)) {
      const text = match[0].trim();
      const supported = kind === 'guarantee' ? supportedGuarantee : normalizedNumbers(text).every(number => supportedNumbers.has(number));
      if (!supported && !claims.some(claim => claim.text.toLowerCase() === text.toLowerCase())) claims.push({ text, kind });
    }
  }
  return claims;
}

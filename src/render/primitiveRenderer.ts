import type { BlueprintV2, ContentBlockV2, ContentNodeV2, SpatialRegionV2 } from '../design/blueprintV2';
import { isPrimitiveName, renderPrimitive } from './primitives';

export interface PrimitiveRenderInput { blueprint: BlueprintV2; visualDataUrl?: string; visualMimeType?: string; visualAlt?: string }

function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character] || character));
}

function cssToken(value: string, fallback: string): string {
  return /^[\w\s#(),.%/-]{1,100}$/.test(value) ? value : fallback;
}

function safeHref(value?: string): string {
  if (!value) return '#top';
  const clean = value.trim();
  return /^(#[\w-]+|mailto:[^\s]+|tel:[+\d-]+)$/i.test(clean) ? clean : '#top';
}

function safeSlug(value: string): string { return value.toLowerCase().replace(/[^a-z0-9-]/g, '-'); }

function renderBlock(block: ContentBlockV2, headingId?: string, primaryHeading = false): string {
  const text = escapeHtml(block.text);
  const label = block.label ? `<span class="primitive-label">${escapeHtml(block.label)}</span>` : '';
  switch (block.kind) {
    case 'headline': return primaryHeading ? `<h1 id="${escapeHtml(headingId || 'page-title')}" class="primitive-heading" data-primitive="Heading">${text}</h1>` : `<h2 id="${escapeHtml(headingId || 'region-heading')}" class="primitive-heading" data-primitive="Heading">${text}</h2>`;
    case 'statistic': return renderPrimitive('Statistic', `${label}<strong>${text}</strong>`);
    case 'quote':
    case 'testimonial': return renderPrimitive('Quote', `<p>${text}</p>${label ? `<footer>${label}</footer>` : ''}`);
    case 'question': return `<h3 class="primitive-question" data-primitive="Heading">${text}</h3>`;
    case 'answer': return renderPrimitive('TextBlock', text, { className: 'primitive-answer' });
    case 'cta': return `<a class="primitive-cta" data-primitive="Navigation" href="${escapeHtml(safeHref(block.href))}">${escapeHtml(block.label || block.text)}</a>`;
    case 'image': return renderPrimitive('Figure', `<figcaption>${escapeHtml(block.alt || block.text)}</figcaption>`);
    case 'label': return renderPrimitive('Label', text);
    case 'diagram': return renderPrimitive('Diagram', `<span>${text}</span>`, { role: 'img', 'aria-label': block.alt || block.text });
    case 'list': return renderPrimitive('TextBlock', `${label}${text}`);
    default: return renderPrimitive('TextBlock', `${label}${text}`);
  }
}

function cssPlacement(region: SpatialRegionV2): string {
  const { row, column, rowSpan, columnSpan, overlap, fullBleed } = region.placement;
  const safeRow = Math.max(1, Math.min(64, Math.floor(row)));
  const safeCol = Math.max(0, Math.min(15, Math.floor(column)));
  const safeRows = Math.max(1, Math.min(4, Math.floor(rowSpan)));
  const safeCols = Math.max(1, Math.min(16, Math.floor(columnSpan)));
  return `--region-row:${safeRow};--region-col:${safeCol + 1};--region-row-span:${safeRows};--region-col-span:${safeCols};--region-overlap:${Math.max(0, Math.min(0.85, overlap))};--region-fullbleed:${fullBleed ? 1 : 0};`;
}

function renderRegion(region: SpatialRegionV2, nodes: Map<string, ContentNodeV2>, visual: string, visualAlt: string, index: number, mobileOrder: number, mediaTargetId: string, genome: BlueprintV2['designGenome']): string {
  const contentNodes = region.contentNodeIds.map(id => nodes.get(id)).filter((node): node is ContentNodeV2 => Boolean(node));
  const hasHeadline = contentNodes.some(node => node.blocks.some(block => block.kind === 'headline'));
  const label = hasHeadline ? '' : `<h2 id="${escapeHtml(region.id)}-heading" class="visually-hidden">${escapeHtml(region.purpose)}</h2>`;
  const blockLookup = new Map(contentNodes.flatMap(node => node.blocks).map(block => [block.id, block]));
  let primaryHeadingUsed = false;
  const content = label + region.children.map(child => {
    const block = child.contentId ? blockLookup.get(child.contentId) : undefined;
    if (block) {
      const isHeadline = block.kind === 'headline';
      const isPrimary = region.purpose === 'introduce' && isHeadline && !primaryHeadingUsed;
      const headingId = !primaryHeadingUsed ? `${region.id}-heading` : `${region.id}-heading-${block.id}`;
      if (isHeadline) primaryHeadingUsed = true;
      return renderBlock(block, headingId, isPrimary);
    }
    if (child.text) return renderPrimitive(isPrimitiveName(child.primitive) ? child.primitive : 'TextBlock', escapeHtml(child.text), child.props);
    return '';
  }).join('\n');
  const media = region.id === mediaTargetId && visual ? `<figure class="region-media media-${safeSlug(genome.imageBehavior)} crop-${safeSlug(genome.croppingBehavior)}"><img src="${visual}" alt="${escapeHtml(visualAlt || 'Visual editorial')}"/><figcaption>${escapeHtml(region.composition)}</figcaption></figure>` : '';
  const className = region.composition.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  return `<section id="${escapeHtml(region.id)}" class="spatial-region morphology-${className} role-${escapeHtml(region.spatialRole)}${region.placement.sticky ? ' region-sticky' : ''}" data-purpose="${escapeHtml(region.purpose)}" data-rhythm="${escapeHtml(region.rhythmRole)}" style="${cssPlacement(region)}--mobile-order:${mobileOrder};" aria-labelledby="${escapeHtml(region.id)}-heading"><div class="region-inner"><p class="region-index">${String(index + 1).padStart(2, '0')} / ${escapeHtml(region.purpose)}</p><div class="region-content">${content}</div>${media}</div></section>`;
}

export function renderBlueprintV2(input: PrimitiveRenderInput): string {
  const { blueprint } = input;
  const visual = input.visualDataUrl && /^data:image\/(?:webp;base64,|svg\+xml(?:;charset=[^,;]+)?,|png;base64,|jpeg;base64,)/i.test(input.visualDataUrl) ? escapeHtml(input.visualDataUrl) : '';
  const nodes = new Map(blueprint.contentArchitecture.nodes.map(node => [node.id, node]));
  const mobileOrder = new Map(blueprint.responsiveStrategy.regionOrder.map((id, index) => [id, index]));
  const placement = blueprint.visualStrategy.placement.toLowerCase();
  const target = placement.includes('proof') || placement.includes('annotation')
    ? blueprint.spatialComposition.regions.find(region => region.purpose === 'prove')
    : placement.includes('clos')
      ? blueprint.spatialComposition.regions.find(region => region.purpose === 'convert')
      : placement.includes('sequence') || placement.includes('story')
        ? blueprint.spatialComposition.regions[1]
        : blueprint.spatialComposition.regions.find(region => region.purpose === 'introduce');
  const mediaTargetId = target?.id ?? blueprint.spatialComposition.regions[0]?.id ?? '';
  const regions = blueprint.spatialComposition.regions.map((region, index) => renderRegion(region, nodes, visual, input.visualAlt || blueprint.visualStrategy.alt, index, mobileOrder.get(region.id) ?? index, mediaTargetId, blueprint.designGenome)).join('\n');
  const tokens = blueprint.visualTokens;
  const background = cssToken(tokens.background, '#f4f1ea');
  const surface = cssToken(tokens.surface, '#e8e4dc');
  const accent = cssToken(tokens.accent, '#68735b');
  const foreground = cssToken(tokens.foreground, '#f4f2ec');
  const muted = cssToken(tokens.muted, '#b5b2a9');
  const display = cssToken(tokens.displayFont, 'system-ui');
  const body = cssToken(tokens.bodyFont, 'system-ui');
  const columns = Math.max(1, Math.min(16, blueprint.spatialComposition.grid.columns));
  const whitespace = blueprint.designGenome.whitespaceStrategy;
  const spatialGap = whitespace === 'compressed' ? 'clamp(.65rem,1.4vw,1.25rem)' : whitespace === 'expansive' ? 'clamp(2rem,7vw,7rem)' : whitespace === 'directional' ? 'clamp(1.5rem,5vw,5rem)' : whitespace === 'punctuated' ? 'clamp(1.25rem,4vw,3.5rem)' : 'clamp(1rem,3.5vw,3.5rem)';
  const displaySize = blueprint.designGenome.scaleContrast === 'extreme' || blueprint.designGenome.scaleContrast === 'typographic-monument' ? 'clamp(3rem,10vw,10rem)' : blueprint.designGenome.scaleContrast === 'strong' ? 'clamp(2.5rem,7vw,7rem)' : 'clamp(2rem,5vw,5rem)';
  const motionDuration = `${(0.2 + blueprint.designGenome.motionIntensity * 0.65).toFixed(2)}s`;
  const motionOrigin = blueprint.motionGrammar.transformOrigin === 'axis-start' ? '0 100%' : 'center';
  const responsiveBreakpoint = Math.max(560, Math.min(900, blueprint.responsiveStrategy.breakpoint));
  const responsiveTransformRules = `@media(max-width:${responsiveBreakpoint}px){body[data-responsive="poster-to-editorial-sequence"] .region-inner{border-bottom:1px solid color-mix(in srgb,var(--accent) 45%,transparent)}body[data-responsive="radial-to-linear-story"] .spatial-region:first-child .region-inner{border-radius:0 0 45% 0}body[data-responsive="grid-to-reordered-sequence"] .spatial-region{order:var(--mobile-order,0)}body[data-responsive="collage-to-layered-flow"] .spatial-region:nth-of-type(even){transform:translateX(-3vw);z-index:2}}@media(max-width:${responsiveBreakpoint}px) and (prefers-reduced-motion:no-preference){body[data-responsive="rail-to-snap-flow"] .spatial-field{flex-direction:row;overflow-x:auto;scroll-snap-type:x mandatory;overscroll-behavior-inline:contain}body[data-responsive="rail-to-snap-flow"] .spatial-region{flex:0 0 min(86vw,34rem);scroll-snap-align:start}}`;
  const navigationLinks = blueprint.spatialComposition.regions.map((region, index) => `<a href="#${escapeHtml(region.id)}" aria-label="Ir a ${escapeHtml(region.purpose)}">${String(index + 1).padStart(2, '0')}</a>`).join('');
  const motion = (() => {
    if (blueprint.motionGrammar.reducedMotionFallback === 'none') return '';
    const axis = blueprint.motionGrammar.directionality;
    const transform = axis.includes('diagonal') ? 'translate(1.1rem,-.65rem)' : axis.includes('horizontal') ? 'translateX(1.1rem)' : axis.includes('radial') ? 'scale(.94)' : 'translateY(.9rem)';
    const line = blueprint.motionGrammar.entrance === 'line-reveal';
    const mechanical = blueprint.motionGrammar.entrance === 'mechanical-step';
    const initial = line ? 'clip-path:inset(0 0 100% 0)' : `transform:${transform}`;
    const finished = line ? 'clip-path:inset(0)' : 'transform:none';
    return `.spatial-region{opacity:0;${initial};transform-origin:var(--motion-origin);transition:opacity var(--motion-duration) ease,transform var(--motion-duration) ${mechanical ? 'steps(4,end)' : 'cubic-bezier(.2,.7,.2,1)'},clip-path var(--motion-duration) ease}.spatial-region.is-entered{opacity:1;${finished}}.visually-hidden{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}@media(prefers-reduced-motion:reduce){.spatial-region{opacity:1!important;transform:none!important;clip-path:none!important;transition:none!important}}`;
  })();
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none';img-src data:;style-src 'unsafe-inline';script-src 'unsafe-inline';connect-src 'none'"><title>${escapeHtml(blueprint.strategy.brandName)} — ${escapeHtml(blueprint.metadata.title)}</title><style>
:root{color-scheme:dark;--bg:${background};--surface:${surface};--accent:${accent};--ink:${foreground};--muted:${muted};--display:${display};--body:${body};--grid-columns:${columns};--grid-gap:${blueprint.spatialComposition.grid.gap};--space-gap:${spatialGap};--display-size:${displaySize};--motion-duration:${motionDuration};--motion-origin:${motionOrigin};--overlap:${blueprint.designGenome.overlapLevel}}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.6 var(--body)}a{color:inherit}a:focus-visible,button:focus-visible{outline:3px solid var(--accent);outline-offset:4px}.site-header,.site-footer{max-width:1440px;margin:auto;padding:1.25rem clamp(1rem,4vw,4rem);display:flex;justify-content:space-between;align-items:center}.site-header{border-bottom:1px solid color-mix(in srgb,var(--muted) 25%,transparent)}.brand{font:700 1rem var(--display);letter-spacing:-.04em}.nav-index{font:12px ui-monospace,monospace;color:var(--muted)}main{max-width:1440px;margin:auto;padding:clamp(1rem,4vw,4rem)}.spatial-field{display:grid;grid-template-columns:repeat(var(--grid-columns),minmax(0,1fr));grid-auto-rows:minmax(3rem,auto);gap:var(--grid-gap);isolation:isolate}.spatial-region{grid-column:var(--region-col)/span var(--region-col-span);grid-row:var(--region-row)/span var(--region-row-span);min-width:0;align-self:stretch;position:relative;z-index:calc(1 + var(--region-overlap)*10);margin-block-start:calc(var(--region-overlap)*-3rem);overflow-wrap:anywhere}.spatial-region[style*="--region-fullbleed:1"]{grid-column:1/-1}.region-inner{height:100%;min-height:clamp(14rem,22vw,30rem);padding:clamp(1rem,3vw,3rem);display:flex;flex-direction:column;justify-content:space-between;align-items:flex-start;background:color-mix(in srgb,var(--surface) 72%,transparent);border-inline-start:calc(1px + var(--region-overlap)*3px) solid var(--accent)}.region-index,.primitive-label{font:11px ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase;color:var(--accent)}.region-content{max-width:68ch}.primitive-heading{font:700 clamp(2rem,6vw,6rem)/.97 var(--display);letter-spacing:-.065em;margin:.2em 0 .35em;max-width:15ch}.primitive-copy,.primitive-answer{font-size:clamp(1rem,1.35vw,1.25rem);max-width:60ch;color:var(--muted)}.primitive-statistic{display:grid;gap:.5rem;margin:1rem 0}.primitive-statistic strong{font:700 clamp(3rem,10vw,9rem)/.85 var(--display);letter-spacing:-.08em;color:var(--accent)}.primitive-quote{margin:2rem 0;padding-inline-start:1.5rem;border-inline-start:2px solid var(--accent);font:italic clamp(1.5rem,3vw,3.5rem)/1.15 var(--display)}.primitive-question{font:600 clamp(1.4rem,3vw,2.6rem)/1.1 var(--display)}.primitive-cta{display:inline-flex;padding:.9rem 1.4rem;border-block:1px solid var(--accent);text-decoration:none;font-weight:700;margin-block:1rem}.primitive-diagram{padding:2rem;border:1px dashed var(--accent);font:1rem ui-monospace,monospace}.primitive-list-line{padding-block:.8rem;border-bottom:1px solid color-mix(in srgb,var(--muted) 35%,transparent)}.region-media{width:min(100%,42rem);margin:2rem 0 0;align-self:flex-end}.region-media img{display:block;width:100%;max-height:55vh;object-fit:cover;clip-path:polygon(0 0,100% 4%,94% 100%,4% 94%)}.region-media figcaption{font:11px ui-monospace,monospace;color:var(--muted);padding:.5rem}.morphology-typographic-monument .region-inner,.morphology-manifesto-opening .region-inner{min-height:min(78vh,55rem);justify-content:center}.morphology-ticker .region-inner,.morphology-horizontal-index .region-inner{min-height:9rem;flex-direction:row;align-items:center}.morphology-annotated-diagram .region-inner,.morphology-technical-plate .region-inner{background:transparent;border:1px solid color-mix(in srgb,var(--accent) 60%,transparent)}.morphology-full-bleed-opening .region-inner,.morphology-full-bleed-close .region-inner{min-height:75vh;background:var(--surface)}.site-footer{margin-top:4rem;border-top:1px solid color-mix(in srgb,var(--muted) 25%,transparent);color:var(--muted)}
${motion}
.visually-hidden{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.morphology-editorial-spread .region-content,.morphology-claim-matrix .region-content{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(12rem,.8fr);gap:clamp(1rem,4vw,4rem);align-items:end}.morphology-timeline .region-content,.morphology-narrative-chapters .region-content{border-inline-start:1px solid var(--accent);padding-inline-start:clamp(1rem,3vw,2.5rem)}.morphology-statistic-field .region-content,.morphology-comparison-field .region-content{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,12rem),1fr));gap:clamp(1rem,3vw,2.5rem)}.morphology-ticker .region-content,.morphology-horizontal-index .region-content{display:flex;gap:clamp(1.5rem,5vw,5rem);overflow:auto;scroll-snap-type:x proximity}.morphology-annotated-diagram .region-content,.morphology-technical-plate .region-content{display:grid;grid-template-columns:minmax(0,1fr) minmax(10rem,.5fr);align-items:center;gap:2rem}.morphology-asymmetric-poster .region-inner,.morphology-diagonal-field .region-inner{transform:skewY(-1deg)}.morphology-full-bleed-opening .region-inner,.morphology-full-bleed-close .region-inner{min-height:75vh;background:var(--surface)}
.spatial-field{gap:var(--space-gap)}.primitive-heading{font-size:var(--display-size)}body[data-type="oversized-condensed"] .primitive-heading{font-stretch:condensed;letter-spacing:-.09em}body[data-type="technical-monospace"] .primitive-heading,body[data-type="technical-monospace"] .primitive-copy{font-family:ui-monospace,SFMono-Regular,monospace}body[data-type="high-contrast-serif"] .primitive-heading{font-family:Georgia,serif;font-weight:500;letter-spacing:-.04em}body[data-grid-behavior="broken"] .spatial-region:nth-of-type(even){transform:translateX(clamp(.5rem,3vw,2rem))}body[data-grid-behavior="flowing"] .region-inner{border-radius:3rem 1rem 3rem 1rem}body[data-grid-behavior="radial"] .spatial-region:first-child .region-inner{border-radius:50% 50% 1rem 1rem}body[data-symmetry="axial"] .spatial-region:nth-of-type(odd){margin-inline:auto}body[data-balance="directional"] .spatial-region:nth-of-type(even){justify-self:end}body[data-balance="counterweight"] .spatial-region:nth-of-type(3n){transform:translateY(1.5rem)}body[data-surface="glassmorphism"] .region-inner{background:color-mix(in srgb,var(--surface) 54%,transparent);backdrop-filter:blur(18px);border:1px solid color-mix(in srgb,var(--ink) 28%,transparent)}body[data-surface="paper"] .region-inner{background-color:var(--surface);background-image:repeating-linear-gradient(0deg,transparent 0 31px,color-mix(in srgb,var(--muted) 8%,transparent) 32px)}body[data-surface="brutalist-ui"] .region-inner{border:2px solid var(--ink);border-radius:0;box-shadow:5px 5px 0 var(--accent)}body[data-depth="layered-paper"] .region-inner{box-shadow:0 14px 0 color-mix(in srgb,var(--surface) 55%,black)}body[data-depth="cutout-depth"] .region-inner{box-shadow:9px 9px 0 var(--accent)}body[data-depth="foreground-background"] .region-media{transform:translateY(-1.25rem);z-index:2}body[data-ornament="art-deco"] .region-inner{outline:1px solid var(--accent);outline-offset:-.75rem}body[data-ornament="art-nouveau"] .region-inner{border-radius:45% 1rem 45% 1rem}body[data-ornament="constructivist-poster"] .region-index{border-block:1px solid var(--accent);padding-block:.4rem}body[data-ornament="patent-illustration"] .region-index:after{content:" ─────────────────";color:var(--muted)}body[data-axis="diagonal"] .spatial-region:nth-of-type(even){transform:translateY(1.2rem)}body[data-axis="horizontal"] .region-index{writing-mode:horizontal-tb}.spatial-region[data-rhythm="quiet"] .region-inner{min-height:clamp(10rem,20vw,22rem)}.spatial-region[data-rhythm="dense"] .region-inner{padding:clamp(.8rem,2vw,1.75rem)}.spatial-region[data-rhythm="interrupt"] .region-inner{min-height:clamp(22rem,45vw,42rem)}.spatial-region[data-rhythm="climax"] .region-inner{min-height:clamp(28rem,62vw,58rem)}.region-sticky{position:sticky;top:1rem}.media-photomontage img,.media-cropped-fragment img{object-position:65% 40%;clip-path:polygon(7% 0,100% 0,93% 88%,0 100%)}.media-full-bleed img{max-height:75vh}.media-annotated-figure img,.media-illustrative-diagram img{mix-blend-mode:screen}.site-nav{display:flex;gap:.65rem;align-items:center}.site-nav a{padding:.35rem;font:11px ui-monospace,monospace;color:var(--muted);text-decoration:none}.nav-side-rail{position:fixed;right:1rem;top:38vh;z-index:10;display:flex;flex-direction:column;background:color-mix(in srgb,var(--bg) 85%,transparent);padding:.5rem}.nav-floating-index a{border:1px solid color-mix(in srgb,var(--muted) 40%,transparent);border-radius:50%}.nav-chapter-nav a{border-bottom:1px solid var(--accent)}
@media(max-width:${Math.max(560, Math.min(900, blueprint.responsiveStrategy.breakpoint))}px){main{padding:1rem}.spatial-field{display:flex;flex-direction:column;gap:1.25rem}.spatial-region{grid-column:auto!important;grid-row:auto!important;margin-block-start:0!important;order:var(--mobile-order,0)}.region-inner{min-height:0;padding:clamp(1.25rem,6vw,2rem)}.morphology-typographic-monument .region-inner,.morphology-manifesto-opening .region-inner{min-height:60vh}.region-media{align-self:stretch;width:100%}.region-media img{max-height:45vh}.primitive-heading{font-size:clamp(2.4rem,12vw,5rem)}.site-header,.site-footer{gap:1rem}}
@media(max-width:${Math.max(560, Math.min(900, blueprint.responsiveStrategy.breakpoint))}px) and (prefers-reduced-motion:no-preference){body[data-responsive="rail-to-snap-flow"] .spatial-field{flex-direction:row;overflow-x:auto;scroll-snap-type:x mandatory;overscroll-behavior-inline:contain}body[data-responsive="rail-to-snap-flow"] .spatial-region{flex:0 0 min(86vw,34rem);scroll-snap-align:start}body[data-responsive="collage-to-layered-flow"] .spatial-region:nth-of-type(even){transform:translateX(4vw);margin-block-start:-1.5rem!important}}
${responsiveTransformRules}
.primitive-heading{font-size:clamp(1.5rem,3.5vw,3.5rem)}h1.primitive-heading{font-size:var(--display-size)}body[data-type="vertical-display"] h1.primitive-heading{writing-mode:vertical-rl;max-height:70vh}body[data-grid-family^="strict"] .spatial-field{align-items:start}body[data-grid-family*="radial"] .spatial-region:first-child .region-inner{border-radius:50% 50% 1rem 1rem}body[data-geometry*="diagonal"] .region-inner{clip-path:polygon(0 0,100% 0,96% 100%,4% 94%)}body[data-geometry*="circle"] .region-index{display:inline-flex;border:1px solid var(--accent);border-radius:50%;padding:.4rem}body[data-geometry*="organic"] .region-inner{border-radius:45% 1rem 45% 1rem}body[data-surface="flat"] .region-inner,body[data-surface="raw-html"] .region-inner{background:transparent}body[data-surface="flat"] .spatial-region[data-rhythm="interrupt"] .region-inner{border-inline-start-width:3px}body[data-art="vaporwave"] .region-index{letter-spacing:.22em}body[data-art="retrofuturism"] .region-index{font-family:ui-monospace,monospace}body[data-art="industrial"] .region-inner{border-block-start:2px solid var(--accent)}body[data-flow="horizontal-index"] .site-nav{overflow-x:auto;white-space:nowrap}@media(max-width:${responsiveBreakpoint}px){.nav-side-rail{position:static;flex-direction:row;overflow-x:auto}.site-nav a{min-width:2.25rem;min-height:2.25rem;display:inline-flex;align-items:center;justify-content:center}}
</style></head><body id="top" data-composition="${escapeHtml(blueprint.spatialComposition.family)}" data-responsive="${escapeHtml(blueprint.responsiveStrategy.transformation)}" data-type="${escapeHtml(blueprint.designGenome.typographicBehavior)}" data-grid-behavior="${escapeHtml(blueprint.designGenome.gridBehavior)}" data-grid-family="${escapeHtml(blueprint.designGenome.gridFamily)}" data-symmetry="${escapeHtml(blueprint.designGenome.symmetry)}" data-balance="${escapeHtml(blueprint.designGenome.balanceMode)}" data-surface="${escapeHtml(blueprint.designGenome.surfaceLanguage)}" data-depth="${escapeHtml(blueprint.designGenome.depthModel)}" data-ornament="${escapeHtml(blueprint.designGenome.ornamentation)}" data-geometry="${escapeHtml(blueprint.designGenome.geometryLanguage)}" data-art="${escapeHtml(blueprint.artDirection.artDirection)}" data-axis="${escapeHtml(blueprint.designGenome.dominantAxis)}" data-flow="${escapeHtml(blueprint.designGenome.contentFlow)}" data-hierarchy-priority="${escapeHtml(blueprint.designGenome.visualHierarchy[0] || 'scale')}" data-transition="${escapeHtml(blueprint.designGenome.transitionLanguage)}" data-motion-stagger="${escapeHtml(blueprint.motionGrammar.stagger)}"><header class="site-header"><a class="brand" href="#top">${escapeHtml(blueprint.strategy.brandName)}</a><nav aria-label="Navegación de la landing" class="site-nav nav-${safeSlug(blueprint.designGenome.navigationPattern)}">${navigationLinks}</nav></header><main><div class="spatial-field" aria-label="${escapeHtml(blueprint.strategy.objective)}"${blueprint.responsiveStrategy.overflowPolicy === 'scroll-snap' ? ' role="region" tabindex="0"' : ''}>${regions}</div></main><footer class="site-footer"><span>${escapeHtml(blueprint.strategy.brandName)}</span><span>${escapeHtml(blueprint.designGenome.compositionFamily)} / ${escapeHtml(blueprint.designGenome.density)}</span></footer><script>(()=>{const regions=[...document.querySelectorAll('.spatial-region')];const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;if(reduced||!('IntersectionObserver' in window)){regions.forEach(region=>region.classList.add('is-entered'));return}const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-entered');observer.unobserve(entry.target)}}),{threshold:.08});regions.forEach(region=>observer.observe(region))})();</script></body></html>`;
  return html;
}

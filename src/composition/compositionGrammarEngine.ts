import type { DesignGenome } from '../design/designGenome';
import type { ContentArchitectureV2, ContentPurpose, MotionGrammarV2, ResponsiveStrategyV2, SpatialCompositionV2, SpatialRegionV2 } from '../design/blueprintV2';
import { createSeedStreams } from '../seed/seedEngine';

export const REGION_MORPHOLOGIES: Record<string, readonly string[]> = {
  introduce: ['typographic-monument', 'manifesto-opening', 'editorial-spread', 'full-bleed-opening', 'diagram-opening', 'visual-index'],
  explain: ['editorial-list', 'annotated-diagram', 'story-chapters', 'technical-plate', 'process-sequence', 'visual-rail'],
  prove: ['statistic-field', 'ticker', 'editorial-quote', 'timeline', 'annotated-chart', 'giant-number', 'comparison-field'],
  compare: ['comparison-field', 'split-evidence', 'claim-matrix', 'parallel-rail', 'before-after-sequence'],
  demonstrate: ['annotated-product', 'interactive-rail', 'media-sequence', 'product-stage', 'technical-diagram'],
  reassure: ['testimonial-narrative', 'editorial-quote', 'trust-index', 'evidence-notes', 'logo-strip'],
  objection: ['editorial-q-and-a', 'myth-vs-reality', 'claim-evidence-pairs', 'margin-notes', 'conversation-sequence'],
  convert: ['manifesto-close', 'inline-conversion', 'full-bleed-close', 'progressive-action', 'editorial-closing'],
  navigate: ['visual-index', 'chapter-navigation', 'side-rail-index', 'horizontal-index'],
  contextualize: ['editorial-interlude', 'caption-field', 'timeline-context', 'full-bleed-interrupt'],
  storytelling: ['narrative-chapters', 'cinematic-sequence', 'visual-essay', 'scroll-story', 'image-rail']
};

export interface CompositionInput {
  genome: DesignGenome;
  content: ContentArchitectureV2;
  entropySeed: string;
}

function roleFor(purpose: string, index: number, count: number): SpatialRegionV2['spatialRole'] {
  if (index === 0 || purpose === 'introduce') return 'opening';
  if (purpose === 'convert' || index === count - 1) return 'close';
  if (purpose === 'prove' || purpose === 'compare') return 'interrupt';
  if (purpose === 'contextualize') return 'release';
  if (purpose === 'demonstrate' || purpose === 'storytelling') return 'develop';
  return 'support';
}

function rhythmFor(role: string, index: number, count: number, density: string): string {
  if (role === 'opening') return density === 'maximalist' ? 'climax' : 'quiet';
  if (role === 'close') return 'climax';
  if (role === 'interrupt') return 'interrupt';
  if (index === count - 1) return 'release';
  return index % 2 ? 'dense' : 'normal';
}

export function composeSpatialComposition(input: CompositionInput): SpatialCompositionV2 {
  const { genome, content, entropySeed } = input;
  const streams = createSeedStreams(entropySeed);
  const sequenceRng = streams.rngFor('region-sequence');
  const columns = genome.gridColumns;
  const regions = content.nodes.map((node, index): SpatialRegionV2 => {
    const local = streams.rngFor(`region:${node.id}`);
    const options = REGION_MORPHOLOGIES[node.purpose] ?? ['editorial-field', 'annotated-sequence', 'typographic-composition'];
    const genomeHints: Record<string, string[]> = {
      introduce: ['typographic-opening'], demonstrate: ['information-rail', 'annotated-figure'], prove: ['editorial-proof', 'annotated-figure'],
      objection: ['timeline'], convert: ['manifesto-close']
    };
    const compatibleHints = (genomeHints[node.purpose] ?? []).filter(hint => genome.sectionMorphology.includes(hint));
    const morphology = compatibleHints.length && local.next() < 0.2 ? local.pick(compatibleHints) : local.pick(options);
    const row = index * 2 + 1;
    const spanChoices = genome.density === 'dense' || genome.density === 'maximalist' ? [3, 4, 5] : [4, 5, 6, 7];
    const columnSpan = Math.min(columns, local.pick(spanChoices));
    const maxStart = Math.max(0, columns - columnSpan);
    const seedColumn = local.int(maxStart + 1);
    const diagonalPosition = content.nodes.length > 1 ? Math.round(index * maxStart / (content.nodes.length - 1)) : seedColumn;
    const column = genome.symmetry === 'axial' || genome.symmetry === 'near-symmetry' ? Math.floor(maxStart / 2)
      : genome.dominantAxis === 'diagonal' ? Math.min(maxStart, diagonalPosition)
        : genome.dominantAxis === 'horizontal' ? Math.min(maxStart, index % (maxStart + 1)) : seedColumn;
    const fullBleed = node.purpose === 'introduce' || node.purpose === 'convert' ? local.next() < 0.38 : local.next() < genome.overlapLevel * 0.25;
    const localOverlap = Math.max(0, Math.min(0.85, genome.overlapLevel * (0.55 + genome.intentionalIrregularity)));
    return {
      id: `region-${node.id}`,
      purpose: node.purpose,
      composition: morphology,
      spatialRole: roleFor(node.purpose, index, content.nodes.length),
      contentNodeIds: [node.id],
      placement: {
        row,
        column: fullBleed ? 0 : column,
        rowSpan: local.pick([1, 2, 3]),
        columnSpan: fullBleed ? columns : columnSpan,
        align: genome.balanceMode === 'counterweight' ? (index % 2 ? 'end' : 'start') : local.pick(['start', 'center', 'end', 'baseline']),
        overlap: local.next() < localOverlap ? Number(local.between(0.04, Math.max(0.05, localOverlap)).toFixed(2)) : 0,
        fullBleed,
        sticky: (morphology.includes('rail') || morphology.includes('scroll-story')) && local.next() < 0.25
      },
      localSeed: streams.seedFor(`region:${node.id}`),
      rhythmRole: rhythmFor(roleFor(node.purpose, index, content.nodes.length), index, content.nodes.length, genome.density),
      mediaStrategy: local.pick([genome.imageBehavior, genome.croppingBehavior, 'none']),
      children: node.blocks.map(block => ({ primitive: block.kind === 'statistic' ? 'Statistic' : block.kind === 'image' ? 'Figure' : block.kind === 'quote' || block.kind === 'testimonial' ? 'Quote' : block.kind === 'cta' ? 'Navigation' : 'TextBlock', contentId: block.id }))
    };
  });
  const rhythmProfile = sequenceRng.shuffle(regions.map(region => region.rhythmRole));
  return {
    family: genome.compositionFamily,
    grid: { family: genome.gridFamily, columns, gap: genome.density === 'dense' ? 'clamp(0.75rem, 2vw, 1.5rem)' : 'clamp(1rem, 4vw, 4rem)', behavior: genome.gridBehavior },
    dominantAxis: genome.dominantAxis,
    readingDirection: genome.readingDirection,
    rhythmProfile,
    regions,
    rationale: `Las regiones se eligieron por propósito y streams locales; ${genome.compositionFamily} define reglas globales sin fijar una secuencia de secciones.`
  };
}

export function planResponsiveStrategy(composition: SpatialCompositionV2, genome: DesignGenome): ResponsiveStrategyV2 {
  const transformation = genome.responsiveTransformation;
  const regionOrder = [...composition.regions].sort((a, b) => a.placement.row - b.placement.row).map(region => region.id);
  const overflowPolicy: ResponsiveStrategyV2['overflowPolicy'] = transformation.includes('rail') ? 'scroll-snap' : transformation.includes('reordered') ? 'reflow' : 'stack';
  return { transformation, breakpoint: 760, regionOrder, overflowPolicy, preserve: ['composition-family', 'reading-hierarchy', 'art-direction', 'semantic-dom-order', 'touch-targets'] };
}

export function planMotionGrammar(genome: DesignGenome): MotionGrammarV2 {
  const language = genome.motionGrammar;
  const directionality = genome.dominantAxis === 'diagonal' ? 'follow-diagonal-axis' : genome.dominantAxis === 'horizontal' ? 'follow-horizontal-axis' : genome.dominantAxis === 'radial' ? 'radial-outward' : 'follow-reading-order';
  return {
    language,
    entrance: language.includes('line') ? 'line-reveal' : language.includes('mask') || language.includes('clipped') ? 'mask-reveal' : language.includes('mechanical') ? 'mechanical-step' : language.includes('path') || language.includes('flow') ? 'path-reveal' : language.includes('directional') ? 'directional-enter' : 'editorial-opacity-position',
    directionality,
    stagger: genome.density === 'dense' ? 'tight-stagger' : 'purpose-groups',
    transformOrigin: genome.dominantAxis === 'diagonal' ? 'axis-start' : 'center',
    scrollBehavior: genome.sectionMorphology.some(item => item.includes('story')) ? 'chapter-observer' : 'region-observer',
    reducedMotionFallback: genome.motionIntensity === 0 ? 'none' : 'instant'
  };
}

export function isValidContentPurpose(value: string): value is ContentPurpose {
  return /^[a-z][a-z0-9-]{1,79}$/.test(value);
}

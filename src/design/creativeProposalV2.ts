import type { ContentArchitectureV2, ContentPurpose, BlueprintV2 } from './blueprintV2';
import type { ArtDirection } from './styleTaxonomy';
import type { NoveltyBudget, CreativeRisk } from './designGenome';
import type { BrandBrief } from '../generation/types';
import { interpretArtDirection } from './artDirectionEngine';
import { generateDesignGenome } from './genomeGenerator';
import { composeSpatialArchitecture } from '../composition/spatialComposer';
import { planResponsiveStrategy } from '../composition/responsivePlanner';
import { planMotionGrammar } from '../composition/motionGrammar';
import { planContentArchitecture } from '../composition/contentArchitecturePlanner';
import { createSeedStreams, SEED_STREAM_NAMES, SEED_VERSION } from '../seed/seedEngine';

export interface CreativeProposalV2 {
  strategy: { brandName: string; industry: string; audience: string; promise: string; objective: string; claims: string[] };
  artDirection: Partial<ArtDirection> & { styleSeed?: string };
  contentArchitecture: ContentArchitectureV2;
  visualStrategy: { mode: string; prompt: string; alt: string; placement: string; mediaSequence?: string[] };
  visualTokens?: BlueprintV2['visualTokens'];
  typographySystem?: BlueprintV2['typographySystem'];
  geometrySystem?: BlueprintV2['geometrySystem'];
  surfaceSystem?: BlueprintV2['surfaceSystem'];
  constraints?: Partial<BlueprintV2['constraints']>;
  interactionPlan?: BlueprintV2['interactionPlan'];
}

export interface CompleteProposalOptions {
  brief: BrandBrief;
  styleSeed: string;
  entropySeed: string;
  noveltyBudget?: NoveltyBudget;
  creativeRisk?: CreativeRisk;
  proposal: CreativeProposalV2;
}

const defaultTokens: BlueprintV2['visualTokens'] = { background: '#f4f1ea', surface: '#e8e4dc', accent: '#68735b', foreground: '#252522', muted: '#686861', displayFont: 'system-ui', bodyFont: 'system-ui' };

export const VisualConstraintPrecedence = ['USER_EXPLICIT', 'BRAND', 'MODEL', 'ART_DIRECTION', 'GENOME', 'ADAPTER', 'FALLBACK'] as const;

export function briefWithExplicitPromptColors(brief: BrandBrief, prompt: string): BrandBrief {
  const promptColors = Array.from(prompt.matchAll(/#[\da-f]{6}\b/gi), match => match[0]);
  return promptColors.length ? { ...brief, preferredColors: [...new Set([...promptColors, ...(brief.preferredColors ?? [])])] } : brief;
}

function resolveVisualTokens(modelTokens: BlueprintV2['visualTokens'] | undefined, brief: BrandBrief): BlueprintV2['visualTokens'] {
  const resolved = { ...defaultTokens, ...(modelTokens ?? {}) };
  const explicit = (brief.preferredColors ?? []).filter(color => /^#[\da-f]{6}$/i.test(color));
  if (explicit[0]) resolved.background = explicit[0];
  if (explicit[1]) resolved.accent = explicit[1];
  if (explicit[2]) resolved.surface = explicit[2];
  if (explicit[3]) resolved.foreground = explicit[3];
  return resolved;
}

export function createFallbackContentArchitecture(brief: BrandBrief): ContentArchitectureV2 {
  const brand = brief.brandName.trim() || 'La marca';
  const nodes: ContentArchitectureV2['nodes'] = [
    { id: 'opening', purpose: 'introduce', blocks: [{ id: 'opening-headline', kind: 'headline', text: brief.valueProposition, priority: 1 }, { id: 'opening-copy', kind: 'paragraph', text: `${brand} para ${brief.targetAudience}.`, priority: 2 }], dependsOn: [], priority: 10, copyIntensity: 'manifesto' },
    { id: 'mechanism', purpose: 'demonstrate', blocks: [{ id: 'mechanism-label', kind: 'label', text: brief.industry, priority: 1 }, { id: 'mechanism-copy', kind: 'paragraph', text: `Una forma más clara de trabajar: ${brief.brandPersonality.toLowerCase()}.`, priority: 2 }], dependsOn: ['opening'], priority: 7, copyIntensity: 'editorial' },
    { id: 'proof', purpose: 'prove', blocks: [{ id: 'proof-copy', kind: 'paragraph', text: 'Explica aquí la evidencia verificable que sostiene la promesa.', priority: 1 }], dependsOn: ['mechanism'], priority: 8, copyIntensity: 'compact' },
    { id: 'objections', purpose: 'objection', blocks: [{ id: 'objection-question', kind: 'question', text: '¿Qué hace que esta propuesta sea adecuada para tu equipo?', priority: 1 }, { id: 'objection-answer', kind: 'answer', text: `Una respuesta concreta, ${brief.toneOfVoice.toLowerCase()}, sin promesas que no se puedan demostrar.`, priority: 2 }], dependsOn: ['proof'], priority: 5, copyIntensity: 'compact' },
    { id: 'conversion', purpose: 'convert', blocks: [{ id: 'conversion-copy', kind: 'paragraph', text: brief.valueProposition, priority: 1 }, { id: 'conversion-cta', kind: 'cta', text: brief.primaryAction, label: brief.primaryAction, href: '#top', priority: 1 }], dependsOn: ['proof'], priority: 10, copyIntensity: 'micro' }
  ];
  return { objective: brief.valueProposition, readingLogic: nodes.map(node => node.id), nodes, requiredClaims: [brief.valueProposition], primaryAction: { label: brief.primaryAction, href: '#top' } };
}

export function completeCreativeProposal(options: CompleteProposalOptions): BlueprintV2 {
  const { proposal, brief, styleSeed, entropySeed } = options;
  const artDirection = interpretArtDirection({ ...proposal.artDirection, styleSeed: proposal.artDirection.styleSeed || styleSeed });
  const contentArchitecture = planContentArchitecture(brief, proposal.contentArchitecture) ?? createFallbackContentArchitecture(brief);
  const genome = generateDesignGenome({ artDirection, entropySeed, noveltyBudget: options.noveltyBudget, creativeRisk: options.creativeRisk });
  const spatialComposition = composeSpatialArchitecture({ genome, contentArchitecture, entropySeed });
  const responsiveStrategy = planResponsiveStrategy(spatialComposition, genome);
  const motionGrammar = planMotionGrammar(genome);
  const strategy = {
    brandName: proposal.strategy?.brandName || brief.brandName,
    industry: proposal.strategy?.industry || brief.industry,
    audience: proposal.strategy?.audience || brief.targetAudience,
    promise: proposal.strategy?.promise || brief.valueProposition,
    objective: proposal.strategy?.objective || contentArchitecture.objective,
    claims: proposal.strategy?.claims || contentArchitecture.requiredClaims
  };
  return {
    schemaVersion: 2,
    metadata: { title: `${strategy.brandName} — ${artDirection.compositionGrammar}`, engineVersion: '2.0.0', grammarVersion: 'grammar-v1', seedVersion: SEED_VERSION },
    strategy,
    visualTokens: resolveVisualTokens(proposal.visualTokens, brief),
    artDirection,
    designGenome: genome,
    compositionGrammar: { name: artDirection.compositionGrammar, rules: [artDirection.rationale, ...spatialComposition.regions.map(region => `${region.purpose} → ${region.composition}`)], noveltyBudget: genome.noveltyBudget, creativeRisk: genome.creativeRisk },
    contentArchitecture,
    regions: spatialComposition.regions,
    spatialComposition,
    visualStrategy: { ...proposal.visualStrategy, mediaSequence: proposal.visualStrategy.mediaSequence ?? [genome.imageBehavior] },
    typographySystem: proposal.typographySystem ?? { displayBehavior: genome.typographicBehavior, bodyBehavior: 'brand-tone-readable', scaleContrast: genome.scaleContrast, captionStyle: 'editorial-index' },
    geometrySystem: proposal.geometrySystem ?? { language: genome.geometryLanguage, motifs: [genome.geometryLanguage, genome.ornamentation], clipping: genome.overlapLevel > 0.45 ? 'controlled-clip' : 'none' },
    surfaceSystem: proposal.surfaceSystem ?? { language: genome.surfaceLanguage, texture: artDirection.ornamentation, depth: genome.depthModel },
    motionGrammar,
    responsiveStrategy,
    interactionPlan: proposal.interactionPlan ?? (genome.motionIntensity > 0 ? [{ id: 'region-entrance', trigger: 'scroll', behavior: motionGrammar.entrance, reducedMotion: 'instant' }] : []),
    constraints: { prohibitedPatterns: proposal.constraints?.prohibitedPatterns ?? genome.prohibitedPatterns, negativeLexicalConstraints: proposal.constraints?.negativeLexicalConstraints ?? [], maxRegions: Math.min(14, proposal.constraints?.maxRegions ?? 14), minimumTextSize: Math.max(16, proposal.constraints?.minimumTextSize ?? 16) },
    diversityMetadata: { engineVersion: '2.0.0', grammarVersion: 'grammar-v1', seedVersion: SEED_VERSION, styleSeed, entropySeed, seedStreams: Object.fromEntries(SEED_STREAM_NAMES.map(name => [name, createSeedStreams(entropySeed).seedFor(name)])), noveltyBudget: genome.noveltyBudget, creativeRisk: genome.creativeRisk }
  };
}

export function sanitizeCreativeProposal(value: unknown, brief: BrandBrief): CreativeProposalV2 {
  if (!value || typeof value !== 'object') throw new Error('La propuesta creativa v2 debe ser un objeto JSON.');
  const raw = value as Partial<CreativeProposalV2>;
  const limit = (value: unknown, fallback: string, max = 500) => typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : fallback.slice(0, max);
  const nodes = Array.isArray(raw.contentArchitecture?.nodes) ? raw.contentArchitecture.nodes.slice(0, 14) : [];
  const usedIds = new Set<string>();
  const safeNodes = nodes.map((node, index) => {
    const baseId = String(node.id || `region-${index + 1}`).replace(/[^a-z0-9-]/gi, '-').slice(0, 64) || `region-${index + 1}`;
    let id = baseId;
    let suffix = 2;
    while (usedIds.has(id)) id = `${baseId}-${suffix++}`;
    usedIds.add(id);
    const blockIds = new Set<string>();
    const blocks: ContentArchitectureV2['nodes'][number]['blocks'] = Array.isArray(node.blocks) ? node.blocks.slice(0, 40).map((block, blockIndex) => {
      const baseBlockId = limit(block.id, `block-${index}-${blockIndex}`, 80).replace(/[^a-z0-9-]/gi, '-');
      let blockId = baseBlockId; let blockSuffix = 2;
      while (blockIds.has(blockId)) blockId = `${baseBlockId}-${blockSuffix++}`;
      blockIds.add(blockId);
      return { ...block, id: blockId, kind: limit(block.kind, 'paragraph', 80).replace(/[^a-z0-9-]/gi, '-'), text: limit(block.text, '', 4000), label: block.label ? limit(block.label, '', 240) : undefined, href: block.href ? limit(block.href, '#top', 300) : undefined, alt: block.alt ? limit(block.alt, '', 500) : undefined, priority: Number.isFinite(block.priority) ? Math.max(0, Math.min(10, block.priority)) : 5 };
    }) : [];
    return {
      ...node,
      id,
      purpose: limit(node.purpose, index === 0 ? 'introduce' : index === nodes.length - 1 ? 'convert' : 'explain', 80).replace(/[^a-z0-9-]/gi, '-').toLowerCase() as ContentPurpose,
      blocks,
      dependsOn: Array.isArray(node.dependsOn) ? node.dependsOn.map(value => limit(value, '', 64)).slice(0, 14) : [],
      priority: Number.isFinite(node.priority) ? Math.max(0, Math.min(10, node.priority)) : 5,
      copyIntensity: ['micro', 'compact', 'editorial', 'narrative', 'manifesto'].includes(node.copyIntensity) ? node.copyIntensity : 'editorial'
    };
  });
  if (!safeNodes.some(node => node.purpose === 'introduce')) {
    let id = 'opening'; let suffix = 2; while (usedIds.has(id)) id = `opening-${suffix++}`;
    safeNodes.unshift({ id, purpose: 'introduce', blocks: [{ id: `${id}-headline`, kind: 'headline', text: brief.valueProposition, priority: 1 }], dependsOn: [], priority: 10, copyIntensity: 'manifesto' });
  }
  if (!safeNodes.some(node => node.purpose === 'convert')) {
    let id = 'conversion'; let suffix = 2; while (usedIds.has(id) || safeNodes.some(node => node.id === id)) id = `conversion-${suffix++}`;
    safeNodes.push({ id, purpose: 'convert', blocks: [], dependsOn: safeNodes.slice(-1).map(node => node.id), priority: 10, copyIntensity: 'micro' });
  }
  if (safeNodes.length > 14) {
    const opening = safeNodes.find(node => node.purpose === 'introduce')!;
    const conversion = safeNodes.find(node => node.purpose === 'convert')!;
    const middle = safeNodes.filter(node => node !== opening && node !== conversion).slice(0, 12);
    safeNodes.splice(0, safeNodes.length, opening, ...middle, conversion);
  }
  const conversionNode = safeNodes.find(node => node.purpose === 'convert')!;
  if (!conversionNode.blocks.some(block => block.kind === 'cta')) conversionNode.blocks.push({ id: 'primary-action', kind: 'cta', text: brief.primaryAction, label: brief.primaryAction, href: '#top', priority: 1 });
  if (safeNodes.length < 2) safeNodes.push({ id: 'explanation', purpose: 'explain', blocks: [{ id: 'explanation-copy', kind: 'paragraph', text: brief.valueProposition, priority: 1 }], dependsOn: [], priority: 5, copyIntensity: 'compact' });
  const validIds = new Set(safeNodes.map(node => node.id));
  for (const node of safeNodes) node.dependsOn = node.dependsOn.filter(id => validIds.has(id) && id !== node.id);
  const contentArchitecture = safeNodes.length >= 2 ? { ...raw.contentArchitecture!, objective: limit(raw.contentArchitecture?.objective, brief.valueProposition), nodes: safeNodes, readingLogic: safeNodes.map(node => node.id), requiredClaims: (raw.contentArchitecture?.requiredClaims ?? []).slice(0, 20).map(claim => limit(claim, '', 500)), primaryAction: { label: limit(raw.contentArchitecture?.primaryAction?.label, brief.primaryAction, 120), href: limit(raw.contentArchitecture?.primaryAction?.href, '#top', 300) } } : createFallbackContentArchitecture(brief);
  const direction = raw.artDirection ?? {};
  const inferredDirection = interpretArtDirection({ styleSeed: limit(direction.styleSeed, brief.brandPersonality || 'editorial × functional geometry', 240) });
  const colors = raw.visualTokens;
  return {
    strategy: { brandName: limit(raw.strategy?.brandName, brief.brandName), industry: limit(raw.strategy?.industry, brief.industry), audience: limit(raw.strategy?.audience, brief.targetAudience), promise: limit(raw.strategy?.promise, brief.valueProposition), objective: limit(raw.strategy?.objective, brief.valueProposition), claims: (raw.strategy?.claims ?? []).slice(0, 20).map(claim => limit(claim, '', 500)) },
    artDirection: { compositionGrammar: limit(direction.compositionGrammar, inferredDirection.compositionGrammar, 80), surfaceLanguage: limit(direction.surfaceLanguage, inferredDirection.surfaceLanguage, 80), artDirection: limit(direction.artDirection, inferredDirection.artDirection, 80), ornamentation: limit(direction.ornamentation, inferredDirection.ornamentation, 80), density: limit(direction.density, inferredDirection.density, 80), motionLanguage: limit(direction.motionLanguage, inferredDirection.motionLanguage, 80), styleSeed: limit(direction.styleSeed, inferredDirection.styleSeed, 240), rationale: limit(direction.rationale, inferredDirection.rationale, 800) },
    contentArchitecture,
    visualStrategy: { mode: limit(raw.visualStrategy?.mode, 'editorial-figure', 100), prompt: limit(raw.visualStrategy?.prompt, `${brief.brandPersonality}: ${brief.valueProposition}`, 2000), alt: limit(raw.visualStrategy?.alt, `Visual de ${brief.brandName}`, 500), placement: limit(raw.visualStrategy?.placement, 'region-led', 120), mediaSequence: (raw.visualStrategy?.mediaSequence ?? []).slice(0, 20).map(item => limit(item, '', 100)) },
    visualTokens: colors ? { background: /^#[\da-f]{6}$/i.test(colors.background) ? colors.background : defaultTokens.background, surface: /^#[\da-f]{6}$/i.test(colors.surface) ? colors.surface : defaultTokens.surface, accent: /^#[\da-f]{6}$/i.test(colors.accent) ? colors.accent : defaultTokens.accent, foreground: /^#[\da-f]{6}$/i.test(colors.foreground) ? colors.foreground : defaultTokens.foreground, muted: /^#[\da-f]{6}$/i.test(colors.muted) ? colors.muted : defaultTokens.muted, displayFont: limit(colors.displayFont, 'system-ui', 80), bodyFont: limit(colors.bodyFont, 'system-ui', 80) } : undefined,
    typographySystem: raw.typographySystem ? { displayBehavior: limit(raw.typographySystem.displayBehavior, 'editorial-scale', 120), bodyBehavior: limit(raw.typographySystem.bodyBehavior, 'readable', 120), scaleContrast: limit(raw.typographySystem.scaleContrast, 'strong', 80), captionStyle: limit(raw.typographySystem.captionStyle, 'editorial-index', 100) } : undefined,
    geometrySystem: raw.geometrySystem ? { language: limit(raw.geometrySystem.language, 'rectilinear', 100), motifs: raw.geometrySystem.motifs.slice(0, 20).map(item => limit(item, '', 100)), clipping: limit(raw.geometrySystem.clipping, 'none', 80) } : undefined,
    surfaceSystem: raw.surfaceSystem ? { language: limit(raw.surfaceSystem.language, 'flat', 80), texture: limit(raw.surfaceSystem.texture, 'none', 100), depth: limit(raw.surfaceSystem.depth, 'flat', 80) } : undefined,
    constraints: raw.constraints ? { prohibitedPatterns: (raw.constraints.prohibitedPatterns ?? []).slice(0, 40).map(item => limit(item, '', 120)), negativeLexicalConstraints: (raw.constraints.negativeLexicalConstraints ?? []).slice(0, 40).map(item => limit(item, '', 240)), maxRegions: Math.max(2, Math.min(14, raw.constraints.maxRegions ?? 14)), minimumTextSize: Math.max(16, Math.min(30, raw.constraints.minimumTextSize ?? 16)) } : undefined,
    interactionPlan: Array.isArray(raw.interactionPlan) ? raw.interactionPlan.slice(0, 20).map((item, index) => ({ id: limit(item.id, `interaction-${index}`, 80), trigger: limit(item.trigger, 'scroll', 80), behavior: limit(item.behavior, 'reveal', 120), reducedMotion: limit(item.reducedMotion, 'instant', 80) })) : undefined
  };
}

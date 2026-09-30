import type { LandingBlueprint } from '../generation/types';
import type { BlueprintV2, ContentArchitectureV2, ContentPurpose } from './blueprintV2';
import { generateDesignGenome } from './genomeGenerator';
import { interpretArtDirection } from './artDirectionEngine';
import { composeSpatialArchitecture } from '../composition/spatialComposer';
import { planMotionGrammar } from '../composition/motionGrammar';
import { planResponsiveStrategy } from '../composition/responsivePlanner';
import { createSeedStreams, SEED_STREAM_NAMES, SEED_VERSION } from '../seed/seedEngine';

const purposeByV1Type: Record<string, ContentPurpose> = {
  hero: 'introduce', proof: 'prove', feature: 'demonstrate', faq: 'objection', cta: 'convert', footer: 'navigate'
};

export function adaptBlueprintV1ToV2(blueprint: LandingBlueprint, options: { styleSeed?: string; entropySeed?: string; noveltyBudget?: 0 | 0.25 | 0.5 | 0.75 | 1; creativeRisk?: 'low' | 'moderate' | 'high' } = {}): BlueprintV2 {
  const entropySeed = options.entropySeed || blueprint.metadata.seed;
  const styleSeed = options.styleSeed || blueprint.layout.style;
  const artDirection = interpretArtDirection({ styleSeed });
  const genome = generateDesignGenome({ artDirection, entropySeed, noveltyBudget: options.noveltyBudget, creativeRisk: options.creativeRisk });
  const nodes = blueprint.sections.map((section, index) => {
    const purpose = purposeByV1Type[section.type] ?? (index === 0 ? 'introduce' : 'explain');
    const blocks = [
      { id: `${section.id}-heading`, kind: 'headline', text: section.heading, priority: 1 },
      { id: `${section.id}-body`, kind: 'paragraph', text: section.body, priority: 2 },
      ...(section.items ?? []).map((item, itemIndex) => ({ id: `${section.id}-item-${itemIndex}`, kind: purpose === 'prove' ? 'statistic' : purpose === 'objection' ? 'question' : 'feature', text: item.body, label: item.heading, priority: 3 })),
      ...(section.ctaLabel ? [{ id: `${section.id}-cta`, kind: 'cta', text: section.ctaLabel, label: section.ctaLabel, href: section.ctaAction, priority: 1 }] : [])
    ];
    return { id: section.id, purpose, blocks, dependsOn: index ? [blueprint.sections[index - 1].id] : [], priority: Math.max(1, 10 - index), copyIntensity: index === 0 ? 'manifesto' as const : 'editorial' as const };
  });
  const contentArchitecture: ContentArchitectureV2 = {
    objective: blueprint.brandInterpretation.promise,
    readingLogic: nodes.map(node => node.id),
    nodes,
    requiredClaims: nodes.filter(node => node.purpose === 'prove').flatMap(node => node.blocks.map(block => block.text)),
    primaryAction: { label: blueprint.sections.find(section => section.ctaLabel)?.ctaLabel || 'Continuar', href: blueprint.sections.find(section => section.ctaAction)?.ctaAction || '#end' }
  };
  const spatialComposition = composeSpatialArchitecture({ genome, contentArchitecture, entropySeed });
  const responsiveStrategy = planResponsiveStrategy(spatialComposition, genome);
  const motionGrammar = planMotionGrammar(genome);
  return {
    schemaVersion: 2,
    metadata: { title: blueprint.metadata.title, engineVersion: '2.0.0', grammarVersion: 'grammar-v1', seedVersion: SEED_VERSION },
    strategy: { brandName: blueprint.brandInterpretation.brandName, industry: blueprint.brandInterpretation.industry, audience: blueprint.brandInterpretation.audience, promise: blueprint.brandInterpretation.promise, objective: contentArchitecture.objective, claims: contentArchitecture.requiredClaims },
    visualTokens: { background: blueprint.designTokens.background, surface: blueprint.designTokens.surface, accent: blueprint.designTokens.accent, foreground: blueprint.designTokens.textPrimary, muted: blueprint.designTokens.textSecondary, displayFont: blueprint.designTokens.fontDisplay, bodyFont: blueprint.designTokens.fontBody },
    artDirection,
    designGenome: genome,
    compositionGrammar: { name: artDirection.compositionGrammar, rules: [artDirection.rationale, ...spatialComposition.regions.map(region => `${region.purpose} → ${region.composition}`)], noveltyBudget: genome.noveltyBudget, creativeRisk: genome.creativeRisk },
    contentArchitecture,
    regions: spatialComposition.regions,
    spatialComposition,
    visualStrategy: { mode: genome.imageBehavior, prompt: blueprint.visualDirection.imagePrompt, alt: blueprint.visualDirection.alt, placement: genome.croppingBehavior, mediaSequence: [genome.imageBehavior] },
    typographySystem: { displayBehavior: genome.typographicBehavior, bodyBehavior: 'brand-tone-readable', scaleContrast: genome.scaleContrast, captionStyle: 'editorial-index' },
    geometrySystem: { language: genome.geometryLanguage, motifs: [genome.geometryLanguage, genome.ornamentation], clipping: genome.overlapLevel > 0.45 ? 'controlled-clip' : 'none' },
    surfaceSystem: { language: genome.surfaceLanguage, texture: artDirection.ornamentation, depth: genome.depthModel },
    motionGrammar,
    responsiveStrategy,
    interactionPlan: blueprint.interactionPlan,
    constraints: { prohibitedPatterns: genome.prohibitedPatterns, negativeLexicalConstraints: ['revolucionario', 'soluciones integrales', 'lleva tu negocio al siguiente nivel'], maxRegions: 14, minimumTextSize: 16 },
    diversityMetadata: { engineVersion: '2.0.0', grammarVersion: 'grammar-v1', seedVersion: SEED_VERSION, styleSeed, entropySeed, seedStreams: Object.fromEntries(SEED_STREAM_NAMES.map(name => [name, createSeedStreams(entropySeed).seedFor(name)])), noveltyBudget: genome.noveltyBudget, creativeRisk: genome.creativeRisk }
  };
}

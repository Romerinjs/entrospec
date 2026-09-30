import type { LandingBlueprint } from '../generation/types';
import type { BlueprintV2 } from './blueprintV2';

const v1Type: Record<string, LandingBlueprint['sections'][number]['type']> = {
  introduce: 'hero', explain: 'feature', prove: 'proof', compare: 'proof', demonstrate: 'feature',
  reassure: 'proof', objection: 'faq', convert: 'cta', navigate: 'footer', contextualize: 'feature', storytelling: 'feature'
};

export function projectBlueprintV2ToV1(blueprint: BlueprintV2): LandingBlueprint {
  const sections: LandingBlueprint['sections'] = blueprint.contentArchitecture.nodes.map((node, index) => {
    const heading = node.blocks.find(block => block.kind === 'headline' || block.kind === 'question' || block.kind === 'label')?.text || node.purpose;
    const body = node.blocks.find(block => block.kind === 'paragraph' || block.kind === 'answer' || block.kind === 'quote')?.text || '';
    const action = node.blocks.find(block => block.kind === 'cta');
    const items = node.blocks.filter(block => block.kind === 'feature' || block.kind === 'statistic' || block.kind === 'question').map(block => ({ heading: block.label || block.text, body: block.text }));
    return { id: node.id, type: v1Type[node.purpose] ?? (index === 0 ? 'hero' : 'feature'), heading, body, ctaLabel: action?.label || action?.text, ctaAction: action?.href, items: items.length ? items : undefined };
  });
  if (!sections.some(section => section.type === 'hero')) sections.unshift({ id: 'compat-opening', type: 'hero', heading: blueprint.strategy.promise, body: blueprint.strategy.audience, ctaLabel: blueprint.contentArchitecture.primaryAction.label, ctaAction: blueprint.contentArchitecture.primaryAction.href });
  return {
    schemaVersion: 1,
    brandInterpretation: { brandName: blueprint.strategy.brandName, industry: blueprint.strategy.industry, audience: blueprint.strategy.audience, tone: blueprint.artDirection.styleSeed, promise: blueprint.strategy.promise },
    designTokens: { background: blueprint.visualTokens.background, surface: blueprint.visualTokens.surface, accent: blueprint.visualTokens.accent, textPrimary: blueprint.visualTokens.foreground, textSecondary: blueprint.visualTokens.muted, fontDisplay: blueprint.visualTokens.displayFont, fontBody: blueprint.visualTokens.bodyFont, radius: '0px' },
    layout: { style: blueprint.designGenome.compositionFamily, heroFocus: blueprint.designGenome.visualHierarchy.join(', '), scrollRhythm: blueprint.designGenome.sectionRhythm },
    sections,
    visualDirection: { concept: blueprint.artDirection.rationale, imagePrompt: blueprint.visualStrategy.prompt, alt: blueprint.visualStrategy.alt },
    interactionPlan: blueprint.interactionPlan,
    techniquePlan: [],
    negativeConstraints: blueprint.constraints.prohibitedPatterns,
    metadata: { seed: blueprint.diversityMetadata.entropySeed, title: blueprint.metadata.title, psychologyAngle: blueprint.strategy.objective }
  };
}

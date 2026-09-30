import { describe, expect, it } from 'vitest';
import type { BrandBrief } from '../generation/types';
import { completeCreativeProposal, createFallbackContentArchitecture } from './creativeProposalV2';
import { interpretArtDirection } from './artDirectionEngine';
import { runSubtractiveDesignPass } from './subtractiveDesignPass';

const brief: BrandBrief = { brandName: 'Atlas', industry: 'Science', valueProposition: 'Read evidence', targetAudience: 'Teams', brandPersonality: 'Exact', toneOfVoice: 'Direct', primaryAction: 'Explore' };

describe('subtractive design pass', () => {
  it('removes only explicitly decorative or duplicate primitives without changing composition family', () => {
    const blueprint = completeCreativeProposal({ brief, styleSeed: 'Swiss', entropySeed: 'subtract', proposal: { strategy: { brandName: 'Atlas', industry: 'Science', audience: 'Teams', promise: 'Read evidence', objective: 'Read evidence', claims: [] }, artDirection: interpretArtDirection({ styleSeed: 'Swiss', compositionGrammar: 'swiss' }), contentArchitecture: createFallbackContentArchitecture(brief), visualStrategy: { mode: 'atlas', prompt: 'atlas', alt: 'Atlas', placement: 'opening' } } });
    const changed = { ...blueprint, regions: blueprint.regions.map((region, index) => index ? region : { ...region, children: [...region.children, { primitive: 'Badge', props: { decorative: true } }, { primitive: 'Navigation', contentId: 'same-cta' }, { primitive: 'Navigation', contentId: 'same-cta' }] }) };
    const result = runSubtractiveDesignPass(changed);
    expect(result.blueprint.designGenome.compositionFamily).toBe(blueprint.designGenome.compositionFamily);
    expect(result.removed).toHaveLength(2);
  });
});

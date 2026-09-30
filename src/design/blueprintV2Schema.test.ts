import { describe, expect, it } from 'vitest';
import type { BrandBrief } from '../generation/types';
import { completeCreativeProposal, createFallbackContentArchitecture } from './creativeProposalV2';
import { interpretArtDirection } from './artDirectionEngine';
import { validateBlueprintV2 } from './blueprintV2Schema';
import { adaptBlueprintV1ToV2 } from './blueprintV1Adapter';
import type { LandingBlueprint } from '../generation/types';

const brief: BrandBrief = { brandName: 'Atlas', industry: 'Research', valueProposition: 'Readable evidence', targetAudience: 'Analysts', brandPersonality: 'Exact', toneOfVoice: 'Plain', primaryAction: 'Review evidence' };
const proposal = { strategy: { brandName: 'Atlas', industry: 'Research', audience: 'Analysts', promise: 'Readable evidence', objective: 'Improve decisions', claims: [] }, artDirection: interpretArtDirection({ styleSeed: 'Swiss atlas', compositionGrammar: 'swiss' }), contentArchitecture: createFallbackContentArchitecture(brief), visualStrategy: { mode: 'figure', prompt: 'atlas diagram', alt: 'diagram', placement: 'annotated' } };

describe('Blueprint V2 schema and V1 migration', () => {
  it('validates an engine-completed V2 blueprint with extensible purposes', () => {
    const blueprint = completeCreativeProposal({ brief, styleSeed: 'Swiss atlas', entropySeed: 'seed', proposal });
    const extension = { ...blueprint, contentArchitecture: { ...blueprint.contentArchitecture, nodes: blueprint.contentArchitecture.nodes.map((node, index) => index === 1 ? { ...node, purpose: 'contextualize-research' } : node) } };
    expect(validateBlueprintV2(extension).ok).toBe(true);
  });

  it('rejects unsafe spatial bounds and excessive region count', () => {
    const blueprint = completeCreativeProposal({ brief, styleSeed: 'Swiss atlas', entropySeed: 'seed', proposal });
    const invalid = { ...blueprint, regions: blueprint.regions.map((region, index) => index ? region : { ...region, placement: { ...region.placement, columnSpan: 99 } }) };
    expect(validateBlueprintV2(invalid)).toMatchObject({ ok: false });
  });

  it('adapts a persisted V1 record without discarding its copy or action', () => {
    const v1: LandingBlueprint = {
      schemaVersion: 1,
      brandInterpretation: { brandName: 'Atlas', industry: 'Research', audience: 'Analysts', tone: 'Plain', promise: 'Readable evidence' },
      designTokens: { background: '#000000', surface: '#111111', accent: '#ffffff', textPrimary: '#ffffff', textSecondary: '#aaaaaa', fontDisplay: 'system-ui', fontBody: 'system-ui', radius: '0' },
      layout: { style: 'Swiss', heroFocus: 'type', scrollRhythm: 'editorial' },
      sections: [{ id: 'hero', type: 'hero', heading: 'Keep the source text', body: 'Preserve original copy.', ctaLabel: 'Review', ctaAction: '#evidence' }, { id: 'evidence', type: 'proof', heading: 'Evidence', body: 'An audit trail.' }, { id: 'end', type: 'cta', heading: 'Continue', body: 'Next step', ctaLabel: 'Review', ctaAction: '#top' }],
      visualDirection: { concept: 'Atlas', imagePrompt: 'Atlas', alt: 'Map' }, interactionPlan: [], techniquePlan: [], negativeConstraints: [], metadata: { seed: 'legacy', title: 'Legacy Atlas', psychologyAngle: 'Trust' }
    };
    const v2 = adaptBlueprintV1ToV2(v1, { styleSeed: 'Swiss atlas', entropySeed: 'repeatable' });
    expect(v2.contentArchitecture.nodes.flatMap(node => node.blocks).map(block => block.text)).toContain('Keep the source text');
    expect(v2.contentArchitecture.primaryAction.label).toBe('Review');
    expect(v2.diversityMetadata.entropySeed).toBe('repeatable');
  });
});

import { describe, expect, it } from 'vitest';
import type { BrandBrief } from '../generation/types';
import { completeCreativeProposal, createFallbackContentArchitecture } from '../design/creativeProposalV2';
import { interpretArtDirection } from '../design/artDirectionEngine';
import { renderBlueprintV2 } from '../render/primitiveRenderer';
import { auditBlueprintV2 } from './auditEngineV2';
import { createStructureFingerprint } from '../diversity/structureFingerprint';

const brief: BrandBrief = { brandName: 'Northline', industry: 'Infrastructure', valueProposition: 'Clear evidence', targetAudience: 'Teams', brandPersonality: 'Precise', toneOfVoice: 'Direct', primaryAction: 'Explore' };
const blueprint = completeCreativeProposal({ brief, styleSeed: 'Swiss scientific', entropySeed: 'audit-seed', proposal: { strategy: { brandName: brief.brandName, industry: brief.industry, audience: brief.targetAudience, promise: brief.valueProposition, objective: 'Clarify operational decisions', claims: [] }, artDirection: interpretArtDirection({ styleSeed: 'Swiss scientific', compositionGrammar: 'swiss' }), contentArchitecture: createFallbackContentArchitecture(brief), visualStrategy: { mode: 'annotated-diagram', prompt: 'diagram', alt: 'Diagram', placement: 'proof-field' } } });

describe('AuditEngine V2', () => {
  it('reports functional, accessibility, CRO, fidelity and diversity dimensions independently', () => {
    const html = renderBlueprintV2({ blueprint });
    const audit = auditBlueprintV2({ blueprint, html });
    expect(Object.keys(audit.dimensions)).toEqual(expect.arrayContaining(['functionalQuality', 'accessibility', 'cro', 'artDirectionFidelity', 'structuralDistinctiveness', 'morphologicalDiversity', 'compositionCoherence', 'brandFidelity', 'responsiveness', 'techniqueFidelity', 'aiGenericity', 'repetitionPenalty']));
    expect(audit.blockers).toEqual([]);
    expect(audit.dimensions.accessibility.score).toBeGreaterThanOrEqual(0.8);
    expect(audit.dimensions.responsiveness.score).toBeLessThan(1);
    expect(audit.warnings.some(message => message.includes('medición DOM en viewport'))).toBe(true);
  });

  it('detects repetition without considering token/color changes as structural difference', () => {
    const fingerprint = createStructureFingerprint(blueprint);
    const html = renderBlueprintV2({ blueprint: { ...blueprint, visualTokens: { ...blueprint.visualTokens, accent: '#ff0000' } } });
    const audit = auditBlueprintV2({ blueprint: { ...blueprint, visualTokens: { ...blueprint.visualTokens, accent: '#ff0000' } }, html, recent: [{ id: 'same-layout', fingerprint }] });
    expect(audit.structuralSimilarityScore).toBe(1);
    expect(audit.warnings.some(message => message.includes('similitud estructural'))).toBe(true);
  });
});

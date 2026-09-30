import { describe, expect, it } from 'vitest';
import type { BrandBrief, LandingBlueprint } from '../generation/types';
import { adaptBlueprintV1ToV2 } from '../design/blueprintV1Adapter';
import { createStructureFingerprint } from './structureFingerprint';
import { compareStructureFingerprints, detectStructuralSimilarity } from './similarityDetector';
import { detectGenericity } from './genericityDetector';
import { runDiversityBenchmark } from './diversityBenchmark';

const brief: BrandBrief = { brandName: 'Example', industry: 'Scientific systems', valueProposition: 'Evidence-led operations', targetAudience: 'Teams', brandPersonality: 'Precise', toneOfVoice: 'Direct', primaryAction: 'Explore' };
const legacy: LandingBlueprint = {
  schemaVersion: 1,
  brandInterpretation: { brandName: brief.brandName, industry: brief.industry, audience: brief.targetAudience, tone: brief.toneOfVoice, promise: brief.valueProposition },
  designTokens: { background: '#0A0A0A', surface: '#141414', accent: '#22C55E', textPrimary: '#F3F3F3', textSecondary: '#A1A1A1', fontDisplay: 'system-ui', fontBody: 'system-ui', radius: '0' },
  layout: { style: 'Swiss', heroFocus: 'type', scrollRhythm: 'mixed' },
  sections: [
    { id: 'start', type: 'hero', heading: 'Evidence first', body: 'A clear promise', ctaLabel: 'Explore', ctaAction: '#proof' },
    { id: 'proof', type: 'proof', heading: 'Proof', body: 'Evidence' },
    { id: 'features', type: 'feature', heading: 'Mechanism', body: 'How it works' },
    { id: 'objection', type: 'faq', heading: 'Question', body: 'Answer' },
    { id: 'end', type: 'cta', heading: 'Continue', body: 'Take action', ctaLabel: 'Explore', ctaAction: '#top' }
  ],
  visualDirection: { concept: 'Scientific', imagePrompt: 'Scientific diagram', alt: 'Diagram' }, interactionPlan: [], techniquePlan: [], negativeConstraints: [], metadata: { seed: 'v1-seed', title: 'Example', psychologyAngle: 'Clarity' }
};

describe('structure fingerprint and diversity tools', () => {
  it('ignores palette changes when calculating structural similarity', () => {
    const a = adaptBlueprintV1ToV2(legacy, { styleSeed: 'Swiss', entropySeed: 'same-seed' });
    const b = { ...a, visualTokens: { ...a.visualTokens, accent: '#ff0000', background: '#fff000' } };
    expect(compareStructureFingerprints(createStructureFingerprint(a), createStructureFingerprint(b))).toBe(1);
  });

  it('detects an identical structure and returns a configurable similarity gate', () => {
    const fingerprint = createStructureFingerprint(adaptBlueprintV1ToV2(legacy, { entropySeed: 'same' }));
    expect(detectStructuralSimilarity(fingerprint, [{ id: 'previous', fingerprint }], 0.82)).toMatchObject({ structuralSimilarityScore: 1, mostSimilarId: 'previous', aboveThreshold: true });
    expect(detectStructuralSimilarity(fingerprint, [], 0.1).aboveThreshold).toBe(false);
  });

  it('measures a seed sample and exposes all diversity thresholds', () => {
    const v2Base = adaptBlueprintV1ToV2(legacy, { styleSeed: 'Swiss scientific atlas', entropySeed: 'benchmark-base' });
    const report = runDiversityBenchmark(v2Base, Array.from({ length: 30 }, (_, index) => `seed-${index}`));
    expect(report.sampleCount).toBe(30);
    expect(report.thresholds.maxAverageSimilarity).toBe(0.75);
    expect(report.uniqueHeroMorphologies).toBeGreaterThan(2);
    expect(report.passed).toBe(true);
    expect(report.averagePairwiseSimilarity).toBeLessThan(0.75);
  });

  it('reports card-based morphology without conflating it with palette or style surface', () => {
    const blueprint = adaptBlueprintV1ToV2(legacy, { entropySeed: 'genericity' });
    const fingerprint = createStructureFingerprint(blueprint);
    const result = detectGenericity(blueprint, fingerprint);
    expect(result.cardDependencyRatio).toBe(0);
    expect(result.genericityScore).toBe(0);
  });
});

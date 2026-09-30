import { describe, expect, it } from 'vitest';
import { evaluateCuratedBankEligibility } from './curatedBankGate';

const validV2 = { auditV2: { blockers: [], genericityPenalty: 0.1, cardDependencyRatio: 0, structuralSimilarityScore: 0.4, dimensions: { accessibility: { score: 1 }, cro: { score: 1 }, responsiveness: { score: 1 } } } };

describe('curated bank diversity gate', () => {
  it('accepts a safe V2 record with low genericity and structural similarity', () => {
    expect(evaluateCuratedBankEligibility(validV2)).toEqual({ eligible: true });
  });

  it('rejects structural duplicates and high card dependency', () => {
    expect(evaluateCuratedBankEligibility({ auditV2: { ...validV2.auditV2, structuralSimilarityScore: 0.9 } }).reason).toContain('demasiado similar');
    expect(evaluateCuratedBankEligibility({ auditV2: { ...validV2.auditV2, cardDependencyRatio: 0.7 } }).reason).toContain('cards');
  });

  it('preserves the legacy threshold for old project records', () => {
    expect(evaluateCuratedBankEligibility({ audit: { passesBank: true, scores: { average: 8.5 } } }).eligible).toBe(true);
    expect(evaluateCuratedBankEligibility({ audit: { passesBank: true, scores: { average: 8 } } }).eligible).toBe(false);
  });
});

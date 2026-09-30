import { describe, expect, it } from 'vitest';
import type { GenerationRecord } from '../generation/types';
import { selectTournamentWinner } from './tournamentScorer';

function record(id: string, values: Partial<Record<'functionalQuality' | 'accessibility' | 'cro' | 'artDirectionFidelity' | 'structuralDistinctiveness' | 'morphologicalDiversity' | 'compositionCoherence' | 'brandFidelity' | 'responsiveness' | 'techniqueFidelity', number>>, genericityPenalty = 0, repetitionPenalty = 0): GenerationRecord {
  const dimensions = Object.fromEntries(Object.entries(values).map(([key, score]) => [key, { score: score ?? 0.5, evidence: [] }])) as any;
  return { id, request: {} as any, blueprint: {} as any, htmlCode: '', visual: {} as any, audit: { passesBank: false, scores: { distinctiveness: 5, usabilityUx: 5, conversionCro: 5, stackFidelity: 5, average: 5 }, subtractiveDiagnosis: '', strengths: [], refactorSuggested: '', evidence: [], blockers: [] }, auditV2: { dimensions, genericityPenalty, recentSimilarityPenalty: repetitionPenalty } as any, callsUsed: { textCalls: 1, imageCalls: 0, totalCalls: 1 }, createdAt: '', collection: 'draft' };
}

describe('tournament scoring', () => {
  it('selects a coherent, accessible and distinctive candidate over a familiar high-conversion layout', () => {
    const conservative = record('safe', { functionalQuality: 1, accessibility: 1, cro: 1, artDirectionFidelity: 0.4, structuralDistinctiveness: 0.1, morphologicalDiversity: 0.2, compositionCoherence: 0.9, brandFidelity: 0.9, responsiveness: 1, techniqueFidelity: 1 });
    const distinctive = record('distinctive', { functionalQuality: 0.95, accessibility: 0.95, cro: 0.88, artDirectionFidelity: 1, structuralDistinctiveness: 0.95, morphologicalDiversity: 0.9, compositionCoherence: 0.88, brandFidelity: 0.95, responsiveness: 1, techniqueFidelity: 0.9 });
    expect(selectTournamentWinner([conservative, distinctive]).record?.id).toBe('distinctive');
  });

  it('penalizes a structurally repeated or generic candidate', () => {
    const good = record('new', { functionalQuality: 0.9, accessibility: 0.9, cro: 0.9, artDirectionFidelity: 0.9, structuralDistinctiveness: 0.9, morphologicalDiversity: 0.9, compositionCoherence: 0.9, brandFidelity: 0.9, responsiveness: 1, techniqueFidelity: 1 });
    const repeated = record('repeat', { functionalQuality: 1, accessibility: 1, cro: 1, artDirectionFidelity: 0.8, structuralDistinctiveness: 0.2, morphologicalDiversity: 0.2, compositionCoherence: 0.9, brandFidelity: 0.9, responsiveness: 1, techniqueFidelity: 1 }, 0.5, 0.8);
    expect(selectTournamentWinner([repeated, good]).record?.id).toBe('new');
  });
});

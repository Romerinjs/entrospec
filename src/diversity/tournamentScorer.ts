import type { GenerationRecord } from '../generation/types';

const weights = {
  functionalQuality: 0.13,
  accessibility: 0.13,
  cro: 0.13,
  artDirectionFidelity: 0.15,
  structuralDistinctiveness: 0.15,
  morphologicalDiversity: 0.11,
  compositionCoherence: 0.08,
  brandFidelity: 0.05,
  responsiveness: 0.04,
  techniqueFidelity: 0.03
} as const;

export function scoreTournamentCandidate(record: GenerationRecord): number {
  if (!record.auditV2) return Math.max(0, Math.min(1, Number(record.audit.scores.average || 0) / 10 * 0.55));
  const dimensions = record.auditV2.dimensions;
  const score = Object.entries(weights).reduce((total, [dimension, weight]) => total + Number(dimensions[dimension as keyof typeof dimensions]?.score ?? 0) * weight, 0);
  const genericityPenalty = Number(record.auditV2.genericityPenalty ?? 0);
  const repetitionPenalty = Number(record.auditV2.recentSimilarityPenalty ?? 0);
  return Number(Math.max(0, Math.min(1, score - genericityPenalty * 0.08 - repetitionPenalty * 0.08)).toFixed(4));
}

export function selectTournamentWinner(records: readonly GenerationRecord[]): { record?: GenerationRecord; index: number; score: number } {
  let winner: GenerationRecord | undefined;
  let index = -1;
  let score = -Infinity;
  records.forEach((record, candidateIndex) => {
    const candidateScore = scoreTournamentCandidate(record);
    if (candidateScore > score) { winner = record; index = candidateIndex; score = candidateScore; }
  });
  return { record: winner, index, score: Number.isFinite(score) ? score : 0 };
}

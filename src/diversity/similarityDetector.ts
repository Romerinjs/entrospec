import type { StructureFingerprint } from './structureFingerprint';

export interface SimilarityResult { structuralSimilarityScore: number; noveltyDistance: number; mostSimilarId?: string; aboveThreshold: boolean }
export interface FingerprintCandidate { id: string; fingerprint: StructureFingerprint }

function multisetSimilarity(a: readonly string[], b: readonly string[]): number {
  if (!a.length && !b.length) return 1;
  const left = new Map<string, number>(); const right = new Map<string, number>();
  a.forEach(item => left.set(item, (left.get(item) ?? 0) + 1));
  b.forEach(item => right.set(item, (right.get(item) ?? 0) + 1));
  const keys = new Set([...left.keys(), ...right.keys()]);
  let intersection = 0; let union = 0;
  for (const key of keys) { intersection += Math.min(left.get(key) ?? 0, right.get(key) ?? 0); union += Math.max(left.get(key) ?? 0, right.get(key) ?? 0); }
  return union ? intersection / union : 1;
}

function sequenceSimilarity(a: readonly string[], b: readonly string[]): number {
  const matrix = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
    matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  }
  return Math.max(0, 1 - matrix[a.length][b.length] / Math.max(a.length, b.length, 1));
}

function numericSimilarity(a: number, b: number): number { return Math.max(0, 1 - Math.abs(a - b)); }

export function compareStructureFingerprints(a: StructureFingerprint, b: StructureFingerprint): number {
  const weights: Array<[number, number]> = [
    [a.compositionFamily === b.compositionFamily ? 1 : 0, 1.5],
    [sequenceSimilarity(a.regionOrder, b.regionOrder), 2],
    [sequenceSimilarity(a.regionPurposes, b.regionPurposes), 1.4],
    [sequenceSimilarity(a.gridFamilies, b.gridFamilies), 0.7],
    [sequenceSimilarity(a.gridColumnPatterns.map(String), b.gridColumnPatterns.map(String)), 0.8],
    [sequenceSimilarity(a.dominantAxes, b.dominantAxes), 0.8],
    [sequenceSimilarity(a.alignments, b.alignments), 0.5],
    [multisetSimilarity(a.imagePlacements, b.imagePlacements), 0.6],
    [sequenceSimilarity(a.textPlacements, b.textPlacements), 0.8],
    [sequenceSimilarity([a.heroMorphology], [b.heroMorphology]), 1.2],
    [multisetSimilarity(a.proofMorphology, b.proofMorphology), 0.7],
    [multisetSimilarity(a.featureMorphology, b.featureMorphology), 0.7],
    [multisetSimilarity(a.objectionMorphology, b.objectionMorphology), 0.5],
    [sequenceSimilarity(a.densitySequence, b.densitySequence), 0.6],
    [sequenceSimilarity(a.overlapSequence.map(value => value < 0.1 ? 'none' : value < 0.35 ? 'light' : value < 0.6 ? 'medium' : 'strong'), b.overlapSequence.map(value => value < 0.1 ? 'none' : value < 0.35 ? 'light' : value < 0.6 ? 'medium' : 'strong')), 0.4],
    [multisetSimilarity(a.ctaMorphology, b.ctaMorphology), 0.5],
    [sequenceSimilarity(a.sectionHeightPattern.map(String), b.sectionHeightPattern.map(String)), 0.3],
    [sequenceSimilarity([a.navigationMorphology], [b.navigationMorphology]), 0.4],
    [numericSimilarity(a.cardUsage, b.cardUsage), 0.4],
    [numericSimilarity(a.fullBleedUsage, b.fullBleedUsage), 0.4],
    [numericSimilarity(a.regionCount / 10, b.regionCount / 10), 0.4]
  ];
  const totalWeight = weights.reduce((sum, [, weight]) => sum + weight, 0);
  return Number((weights.reduce((sum, [score, weight]) => sum + score * weight, 0) / totalWeight).toFixed(4));
}

export function detectStructuralSimilarity(fingerprint: StructureFingerprint, candidates: readonly FingerprintCandidate[], threshold = 0.82): SimilarityResult {
  let closest: FingerprintCandidate | undefined;
  let highest = 0;
  for (const candidate of candidates) {
    const score = compareStructureFingerprints(fingerprint, candidate.fingerprint);
    if (score > highest) { highest = score; closest = candidate; }
  }
  return { structuralSimilarityScore: highest, noveltyDistance: Number((1 - highest).toFixed(4)), mostSimilarId: closest?.id, aboveThreshold: Boolean(closest && highest > threshold) };
}

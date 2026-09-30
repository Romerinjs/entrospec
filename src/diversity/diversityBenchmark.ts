import type { LandingBlueprint } from '../generation/types';
import { adaptBlueprintV1ToV2 } from '../design/blueprintV1Adapter';
import { createStructureFingerprint } from './structureFingerprint';
import { compareStructureFingerprints } from './similarityDetector';
import type { BlueprintV2 } from '../design/blueprintV2';
import { generateDesignGenome } from '../design/genomeGenerator';
import { composeSpatialArchitecture } from '../composition/spatialComposer';
import { planResponsiveStrategy } from '../composition/responsivePlanner';

export interface DiversityThresholds { maxAverageSimilarity: number; maxDominantHeroShare: number; maxMeanCardRatio: number }
export interface DiversityBenchmarkReport {
  sampleCount: number;
  uniqueCompositionFamilies: number;
  uniqueHeroMorphologies: number;
  dominantHeroShare: number;
  heroMorphologyDistribution: Record<string, number>;
  averagePairwiseSimilarity: number;
  meanCardRatio: number;
  passed: boolean;
  warnings: string[];
  thresholds: DiversityThresholds;
}

const defaults: DiversityThresholds = { maxAverageSimilarity: 0.75, maxDominantHeroShare: 0.6, maxMeanCardRatio: 0.35 };

export function runDiversityBenchmark(blueprint: LandingBlueprint | BlueprintV2, seeds: readonly string[], overrides: Partial<DiversityThresholds> = {}): DiversityBenchmarkReport {
  const thresholds = { ...defaults, ...overrides };
  const fingerprints = seeds.map(entropySeed => {
    if (blueprint.schemaVersion === 1) return createStructureFingerprint(adaptBlueprintV1ToV2(blueprint, { styleSeed: blueprint.layout.style, entropySeed }));
    const genome = generateDesignGenome({ artDirection: blueprint.artDirection, entropySeed, noveltyBudget: blueprint.diversityMetadata.noveltyBudget as 0 | 0.25 | 0.5 | 0.75 | 1, creativeRisk: blueprint.diversityMetadata.creativeRisk as 'low' | 'moderate' | 'high' });
    const spatialComposition = composeSpatialArchitecture({ genome, contentArchitecture: blueprint.contentArchitecture, entropySeed });
    const candidate: BlueprintV2 = { ...blueprint, designGenome: genome, regions: spatialComposition.regions, spatialComposition, responsiveStrategy: planResponsiveStrategy(spatialComposition, genome) };
    return createStructureFingerprint(candidate);
  });
  const pairScores: number[] = [];
  for (let left = 0; left < fingerprints.length; left++) for (let right = left + 1; right < fingerprints.length; right++) pairScores.push(compareStructureFingerprints(fingerprints[left], fingerprints[right]));
  const averagePairwiseSimilarity = pairScores.length ? pairScores.reduce((sum, score) => sum + score, 0) / pairScores.length : 0;
  const heroCounts = new Map<string, number>();
  fingerprints.forEach(item => heroCounts.set(item.heroMorphology, (heroCounts.get(item.heroMorphology) ?? 0) + 1));
  const dominantHeroShare = fingerprints.length ? Math.max(0, ...heroCounts.values()) / fingerprints.length : 0;
  const meanCardRatio = fingerprints.length ? fingerprints.reduce((sum, item) => sum + item.cardUsage, 0) / fingerprints.length : 0;
  const warnings: string[] = [];
  if (averagePairwiseSimilarity > thresholds.maxAverageSimilarity) warnings.push(`La similitud promedio ${averagePairwiseSimilarity.toFixed(3)} supera ${thresholds.maxAverageSimilarity}.`);
  if (dominantHeroShare > thresholds.maxDominantHeroShare) warnings.push(`La morfología hero dominante ocupa ${(dominantHeroShare * 100).toFixed(1)}% de muestras.`);
  if (meanCardRatio > thresholds.maxMeanCardRatio) warnings.push(`El ratio de cards ${meanCardRatio.toFixed(3)} supera ${thresholds.maxMeanCardRatio}.`);
  return {
    sampleCount: seeds.length,
    uniqueCompositionFamilies: new Set(fingerprints.map(item => item.compositionFamily)).size,
    uniqueHeroMorphologies: heroCounts.size,
    dominantHeroShare: Number(dominantHeroShare.toFixed(4)),
    heroMorphologyDistribution: Object.fromEntries([...heroCounts.entries()].sort((a, b) => b[1] - a[1])),
    averagePairwiseSimilarity: Number(averagePairwiseSimilarity.toFixed(4)),
    meanCardRatio: Number(meanCardRatio.toFixed(4)),
    passed: warnings.length === 0,
    warnings,
    thresholds
  };
}

import type { BlueprintV2 } from '../design/blueprintV2';
import { generateDesignGenome } from '../design/genomeGenerator';
import { composeSpatialArchitecture } from '../composition/spatialComposer';
import { planMotionGrammar } from '../composition/motionGrammar';
import { planResponsiveStrategy } from '../composition/responsivePlanner';
import { createStructureFingerprint } from './structureFingerprint';
import { compareStructureFingerprints, type FingerprintCandidate } from './similarityDetector';
import { createSeedStreams, deriveSeed, SEED_STREAM_NAMES } from '../seed/seedEngine';

export interface CompositionRepairResult { blueprint: BlueprintV2; initialSimilarity: number; finalSimilarity: number; attempts: number; repaired: boolean }

/** Re-rolls only the spatial design genome; copy, strategy and visual assets remain untouched. */
export function repairCompositionForNovelty(blueprint: BlueprintV2, recent: readonly FingerprintCandidate[], threshold = 0.82, maxAttempts = 4): CompositionRepairResult {
  const originalFingerprint = createStructureFingerprint(blueprint);
  const similarity = (candidate: BlueprintV2) => recent.reduce((highest, item) => Math.max(highest, compareStructureFingerprints(createStructureFingerprint(candidate), item.fingerprint)), 0);
  const initialSimilarity = similarity(blueprint);
  if (initialSimilarity <= threshold || recent.length === 0) return { blueprint, initialSimilarity, finalSimilarity: initialSimilarity, attempts: 0, repaired: false };
  let best = blueprint;
  let bestScore = initialSimilarity;
  let attempts = 0;
  let selectedAlternative = false;
  for (let attempt = 1; attempt <= Math.max(1, maxAttempts); attempt++) {
    attempts = attempt;
    const attemptSeed = deriveSeed(blueprint.diversityMetadata.entropySeed, `composition-repair:${attempt}`);
    const genome = generateDesignGenome({ artDirection: blueprint.artDirection, entropySeed: attemptSeed, noveltyBudget: blueprint.diversityMetadata.noveltyBudget as 0 | 0.25 | 0.5 | 0.75 | 1, creativeRisk: blueprint.diversityMetadata.creativeRisk as 'low' | 'moderate' | 'high' });
    const spatialComposition = composeSpatialArchitecture({ genome, contentArchitecture: blueprint.contentArchitecture, entropySeed: attemptSeed });
    const candidate: BlueprintV2 = {
      ...blueprint,
      designGenome: genome,
      compositionGrammar: { ...blueprint.compositionGrammar, name: blueprint.artDirection.compositionGrammar, rules: [blueprint.artDirection.rationale, ...spatialComposition.regions.map(region => `${region.purpose} → ${region.composition}`)] },
      regions: spatialComposition.regions,
      spatialComposition,
      responsiveStrategy: planResponsiveStrategy(spatialComposition, genome),
      motionGrammar: planMotionGrammar(genome),
      visualStrategy: {
        ...blueprint.visualStrategy,
        placement: genome.croppingBehavior,
        prompt: `${blueprint.visualStrategy.prompt}. Art direction: ${blueprint.artDirection.styleSeed}; composition: ${genome.compositionFamily}; image treatment: ${genome.imageBehavior}; crop: ${genome.croppingBehavior}.`
      },
      diversityMetadata: { ...blueprint.diversityMetadata, compositionSeed: attemptSeed, seedStreams: Object.fromEntries(SEED_STREAM_NAMES.map(name => [name, createSeedStreams(attemptSeed).seedFor(name)])) }
    };
    const score = similarity(candidate);
    if (score < bestScore) { best = candidate; bestScore = score; selectedAlternative = true; }
    if (score <= threshold) break;
  }
  return { blueprint: best, initialSimilarity, finalSimilarity: bestScore, attempts, repaired: selectedAlternative && (createStructureFingerprint(best).compositionFamily !== originalFingerprint.compositionFamily || bestScore < initialSimilarity) };
}

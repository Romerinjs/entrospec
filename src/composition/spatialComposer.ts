import type { ContentArchitectureV2, SpatialCompositionV2 } from '../design/blueprintV2';
import type { DesignGenome } from '../design/designGenome';
import { composeSpatialComposition } from './compositionGrammarEngine';

export interface SpatialComposerInput { genome: DesignGenome; contentArchitecture: ContentArchitectureV2; entropySeed: string }

/** Maps content purpose to seeded morphology and placement; deliberately has no V1 section templates. */
export function composeSpatialArchitecture(input: SpatialComposerInput): SpatialCompositionV2 {
  return composeSpatialComposition({ genome: input.genome, content: input.contentArchitecture, entropySeed: input.entropySeed });
}

import type { BlueprintV2 } from '../design/blueprintV2';

export interface StructureFingerprint {
  compositionFamily: string;
  regionCount: number;
  regionOrder: string[];
  regionPurposes: string[];
  regionCompositionTypes: string[];
  gridFamilies: string[];
  gridColumnPatterns: number[];
  dominantAxes: string[];
  alignments: string[];
  imagePlacements: string[];
  textPlacements: string[];
  densitySequence: string[];
  overlapSequence: number[];
  fullBleedUsage: number;
  cardUsage: number;
  stickyUsage: number;
  horizontalScrollUsage: number;
  heroMorphology: string;
  proofMorphology: string[];
  featureMorphology: string[];
  objectionMorphology: string[];
  ctaMorphology: string[];
  navigationMorphology: string;
  sectionHeightPattern: number[];
}

export function createStructureFingerprint(blueprint: BlueprintV2): StructureFingerprint {
  const regions = blueprint.spatialComposition.regions;
  const byPurpose = (purpose: string) => regions.filter(region => region.purpose === purpose).map(region => region.composition);
  const total = Math.max(1, regions.length);
  const cardRegions = regions.filter(region => /card|bento/i.test(region.composition) || region.children.some(child => /^(Card|CardGrid|BentoCard)$/.test(child.primitive))).length;
  return {
    compositionFamily: blueprint.designGenome.compositionFamily,
    regionCount: regions.length,
    regionOrder: regions.map(region => region.composition),
    regionPurposes: regions.map(region => region.purpose),
    regionCompositionTypes: regions.map(region => region.composition),
    gridFamilies: [blueprint.designGenome.gridFamily],
    gridColumnPatterns: regions.map(region => region.placement.columnSpan),
    dominantAxes: [blueprint.designGenome.dominantAxis, blueprint.designGenome.readingDirection],
    alignments: regions.map(region => region.placement.align),
    imagePlacements: regions.filter(region => region.mediaStrategy && region.mediaStrategy !== 'none').map(region => region.mediaStrategy!),
    textPlacements: regions.map(region => `${region.purpose}:${region.placement.column}:${region.placement.columnSpan}`),
    densitySequence: regions.map(region => region.rhythmRole),
    overlapSequence: regions.map(region => region.placement.overlap),
    fullBleedUsage: regions.filter(region => region.placement.fullBleed).length / total,
    cardUsage: cardRegions / total,
    stickyUsage: regions.filter(region => region.placement.sticky).length / total,
    horizontalScrollUsage: /rail|horizontal/.test(blueprint.responsiveStrategy.transformation) ? 1 : 0,
    heroMorphology: regions.find(region => region.purpose === 'introduce')?.composition ?? 'none',
    proofMorphology: byPurpose('prove'),
    featureMorphology: byPurpose('demonstrate'),
    objectionMorphology: byPurpose('objection'),
    ctaMorphology: byPurpose('convert'),
    navigationMorphology: blueprint.designGenome.navigationPattern,
    sectionHeightPattern: regions.map(region => region.placement.rowSpan)
  };
}

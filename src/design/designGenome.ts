import type { ArtDirection } from './styleTaxonomy';

export type NoveltyBudget = 0 | 0.25 | 0.5 | 0.75 | 1;
export type CreativeRisk = 'low' | 'moderate' | 'high';
export type WhitespaceStrategy = 'balanced' | 'asymmetric' | 'directional' | 'compressed' | 'expansive' | 'punctuated' | 'cinematic' | 'organic';
export type RhythmRole = 'quiet' | 'normal' | 'dense' | 'interrupt' | 'climax' | 'release';

export interface DesignGenome {
  compositionFamily: string;
  gridFamily: string;
  gridColumns: number;
  gridBehavior: string;
  dominantAxis: string;
  readingDirection: string;
  symmetry: string;
  balanceMode: string;
  sectionRhythm: string;
  density: string;
  whitespaceStrategy: WhitespaceStrategy;
  scaleContrast: string;
  overlapLevel: number;
  depthModel: string;
  croppingBehavior: string;
  imageBehavior: string;
  typographicBehavior: string;
  surfaceLanguage: string;
  geometryLanguage: string;
  ornamentation: string;
  navigationPattern: string;
  sectionMorphology: string[];
  motionIntensity: number;
  motionGrammar: string;
  transitionLanguage: string;
  responsiveTransformation: string;
  ctaBehavior: string;
  contentFlow: string;
  visualHierarchy: string[];
  intentionalIrregularity: number;
  prohibitedPatterns: string[];
  noveltyBudget: NoveltyBudget;
  creativeRisk: CreativeRisk;
}

export interface DesignGenomeInput {
  artDirection: ArtDirection;
  entropySeed: string;
  noveltyBudget?: NoveltyBudget;
  creativeRisk?: CreativeRisk;
}

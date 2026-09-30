import type { DesignGenome } from './designGenome';
import type { ArtDirection } from './styleTaxonomy';

export type ContentPurpose = 'introduce' | 'explain' | 'prove' | 'compare' | 'demonstrate' | 'reassure' | 'objection' | 'convert' | 'navigate' | 'contextualize' | 'storytelling';
export type ContentKind = 'headline' | 'paragraph' | 'statistic' | 'testimonial' | 'image' | 'feature' | 'question' | 'answer' | 'cta' | 'logo' | 'price' | 'diagram' | 'label' | 'quote' | 'list';
export type SpatialRole = 'opening' | 'establish' | 'develop' | 'interrupt' | 'climax' | 'release' | 'close' | 'support';

export interface ContentBlockV2 {
  id: string;
  kind: ContentKind | string;
  text: string;
  label?: string;
  value?: string;
  alt?: string;
  href?: string;
  priority: number;
}

export interface ContentNodeV2 {
  id: string;
  purpose: ContentPurpose | string;
  blocks: ContentBlockV2[];
  dependsOn: string[];
  priority: number;
  copyIntensity: 'micro' | 'compact' | 'editorial' | 'narrative' | 'manifesto';
}

export interface ContentArchitectureV2 {
  objective: string;
  readingLogic: string[];
  nodes: ContentNodeV2[];
  requiredClaims: string[];
  primaryAction: { label: string; href: string };
}

export interface RegionPlacementV2 {
  row: number;
  column: number;
  rowSpan: number;
  columnSpan: number;
  align: string;
  overlap: number;
  fullBleed: boolean;
  sticky: boolean;
}

export interface SpatialRegionV2 {
  id: string;
  purpose: ContentPurpose | string;
  composition: string;
  spatialRole: SpatialRole | string;
  contentNodeIds: string[];
  placement: RegionPlacementV2;
  localSeed: string;
  rhythmRole: string;
  mediaStrategy?: string;
  children: Array<{ primitive: string; contentId?: string; text?: string; props?: Record<string, string | number | boolean> }>;
}

export interface SpatialCompositionV2 {
  family: string;
  grid: { family: string; columns: number; gap: string; behavior: string };
  dominantAxis: string;
  readingDirection: string;
  rhythmProfile: string[];
  regions: SpatialRegionV2[];
  rationale: string;
}

export interface ResponsiveStrategyV2 {
  transformation: string;
  breakpoint: number;
  regionOrder: string[];
  overflowPolicy: 'clip' | 'scroll-snap' | 'stack' | 'reflow';
  preserve: string[];
}

export interface MotionGrammarV2 {
  language: string;
  entrance: string;
  directionality: string;
  stagger: string;
  transformOrigin: string;
  scrollBehavior: string;
  reducedMotionFallback: 'instant' | 'fade' | 'none';
}

export interface BlueprintV2 {
  schemaVersion: 2;
  metadata: { title: string; engineVersion: string; grammarVersion: string; seedVersion: string };
  strategy: { brandName: string; industry: string; audience: string; promise: string; objective: string; claims: string[] };
  visualTokens: { background: string; surface: string; accent: string; foreground: string; muted: string; displayFont: string; bodyFont: string };
  artDirection: ArtDirection;
  designGenome: DesignGenome;
  compositionGrammar: { name: string; rules: string[]; noveltyBudget: number; creativeRisk: string };
  contentArchitecture: ContentArchitectureV2;
  regions: SpatialRegionV2[];
  spatialComposition: SpatialCompositionV2;
  visualStrategy: { mode: string; prompt: string; alt: string; placement: string; mediaSequence: string[] };
  typographySystem: { displayBehavior: string; bodyBehavior: string; scaleContrast: string; captionStyle: string };
  geometrySystem: { language: string; motifs: string[]; clipping: string };
  surfaceSystem: { language: string; texture: string; depth: string };
  motionGrammar: MotionGrammarV2;
  responsiveStrategy: ResponsiveStrategyV2;
  interactionPlan: Array<{ id: string; trigger: string; behavior: string; reducedMotion: string }>;
  constraints: { prohibitedPatterns: string[]; negativeLexicalConstraints: string[]; maxRegions: number; minimumTextSize: number };
  diversityMetadata: { engineVersion: string; grammarVersion: string; seedVersion: string; styleSeed: string; entropySeed: string; compositionSeed?: string; seedStreams: Record<string, string>; noveltyBudget: number; creativeRisk: string };
}

export interface BlueprintV1Like {
  schemaVersion: 1;
  brandInterpretation: { brandName: string; industry: string; audience: string; tone: string; promise: string };
  designTokens: { background: string; surface: string; accent: string; textPrimary: string; textSecondary: string; fontDisplay: string; fontBody: string; radius: string };
  layout: { style: string; heroFocus: string; scrollRhythm: string };
  sections: Array<{ id: string; type: string; heading: string; body: string; ctaLabel?: string; ctaAction?: string; items?: Array<{ heading: string; body: string }> }>;
  visualDirection: { concept: string; imagePrompt: string; alt: string };
  interactionPlan: Array<{ id: string; trigger: string; behavior: string; reducedMotion: string }>;
  techniquePlan: Array<{ techniqueId: number; intent: string; evidence: string }>;
  negativeConstraints: string[];
  metadata: { seed: string; title: string; psychologyAngle: string };
}

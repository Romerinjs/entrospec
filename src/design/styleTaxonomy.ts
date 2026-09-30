export const COMPOSITION_GRAMMARS = [
  'swiss', 'bauhaus', 'constructivism', 'deconstructivism', 'editorial',
  'international-typographic', 'poster', 'modular', 'organic-flow', 'radial',
  'asymmetric', 'axial'
] as const;

export const SURFACE_LANGUAGES = [
  'flat', 'material', 'glassmorphism', 'neomorphism', 'brutalist-ui', 'paper',
  'chrome', 'gloss', 'crt', 'frosted', 'raw-html'
] as const;

export const ART_DIRECTIONS = [
  'cyberpunk', 'vaporwave', 'retrofuturism', 'frutiger-aero', 'pop-art', 'grunge',
  'tactile-craft', 'editorial-1970s', 'scientific', 'industrial', 'luxury-fashion'
] as const;

export const ORNAMENTATION_LANGUAGES = [
  'none', 'art-nouveau', 'art-deco', 'arts-and-crafts', 'constructivist-poster',
  'mid-century-technical', 'patent-illustration', 'victorian-print', 'rules-and-bars',
  'geometric-motifs'
] as const;

export const DENSITY_LEVELS = ['minimal', 'restrained', 'balanced', 'dense', 'maximalist', 'eclectic'] as const;
export const MOTION_LANGUAGES = [
  'none', 'subtle', 'editorial', 'mechanical', 'elastic', 'kinetic', 'cinematic',
  'scroll-narrative', 'diagrammatic', 'glitch', 'physical', 'parallax'
] as const;

export type CompositionGrammarName = typeof COMPOSITION_GRAMMARS[number];
export type SurfaceLanguage = typeof SURFACE_LANGUAGES[number];
export type ArtDirectionName = typeof ART_DIRECTIONS[number];
export type OrnamentationLanguage = typeof ORNAMENTATION_LANGUAGES[number];
export type DensityLevel = typeof DENSITY_LEVELS[number];
export type MotionLanguage = typeof MOTION_LANGUAGES[number];

export interface ArtDirection {
  compositionGrammar: CompositionGrammarName | string;
  surfaceLanguage: SurfaceLanguage | string;
  artDirection: ArtDirectionName | string;
  ornamentation: OrnamentationLanguage | string;
  density: DensityLevel | string;
  motionLanguage: MotionLanguage | string;
  styleSeed: string;
  rationale: string;
  allowedTypographyBehaviors?: readonly string[];
}

export interface StyleAdapterRules {
  preferredAxes: readonly string[];
  gridCharacter: 'strict' | 'modular' | 'broken' | 'flowing' | 'radial' | 'axial';
  hierarchy: readonly string[];
  geometry: readonly string[];
  imagePlacement: readonly string[];
  whitespace: readonly string[];
  repetition: readonly string[];
  ornament: readonly string[];
  motion: readonly string[];
}

export const STYLE_ADAPTERS: Record<string, StyleAdapterRules> = {
  swiss: { preferredAxes: ['vertical', 'horizontal'], gridCharacter: 'strict', hierarchy: ['scale', 'alignment'], geometry: ['rectilinear'], imagePlacement: ['cropped-editorial', 'asymmetric-field'], whitespace: ['directional', 'expansive'], repetition: ['measured'], ornament: ['minimal-rules'], motion: ['precise-reveal', 'line-reveal'] },
  'international-typographic': { preferredAxes: ['vertical', 'horizontal'], gridCharacter: 'strict', hierarchy: ['typographic-scale', 'alignment'], geometry: ['rectilinear'], imagePlacement: ['documentary-crop'], whitespace: ['expansive', 'asymmetric'], repetition: ['modular'], ornament: ['minimal-rules'], motion: ['editorial-reveal'] },
  bauhaus: { preferredAxes: ['vertical', 'horizontal', 'diagonal'], gridCharacter: 'modular', hierarchy: ['form-type-relationship', 'scale'], geometry: ['circle', 'square', 'triangle'], imagePlacement: ['geometric-frame', 'modular-field'], whitespace: ['balanced', 'punctuated'], repetition: ['modular'], ornament: ['primary-forms'], motion: ['mechanical', 'geometric-reveal'] },
  constructivism: { preferredAxes: ['diagonal', 'horizontal'], gridCharacter: 'broken', hierarchy: ['direction', 'compressed-scale'], geometry: ['bars', 'circles', 'diagonal-planes'], imagePlacement: ['photomontage', 'overlap'], whitespace: ['compressed', 'directional'], repetition: ['rhythmic-bands'], ornament: ['poster-marks'], motion: ['directional', 'mechanical'] },
  'art-deco': { preferredAxes: ['vertical', 'axial'], gridCharacter: 'axial', hierarchy: ['symmetry', 'vertical-scale'], geometry: ['stepped', 'framed', 'radial'], imagePlacement: ['framed-stage', 'centered-figure'], whitespace: ['punctuated', 'balanced'], repetition: ['ornamental-rhythm'], ornament: ['stepped-frames', 'rays'], motion: ['mechanical-reveal'] },
  'art-nouveau': { preferredAxes: ['curvilinear', 'vertical'], gridCharacter: 'flowing', hierarchy: ['path', 'integrated-illustration'], geometry: ['organic-curves', 'asymmetric-boundaries'], imagePlacement: ['integrated-illustration', 'flowing-mask'], whitespace: ['organic', 'expansive'], repetition: ['organic-rhythm'], ornament: ['botanical-lines', 'ornamental-boundaries'], motion: ['path-based', 'flowing'] },
  deconstructivism: { preferredAxes: ['diagonal', 'vertical', 'horizontal'], gridCharacter: 'broken', hierarchy: ['offset-scale', 'fragmentation'], geometry: ['fragmented-planes', 'clipped-forms'], imagePlacement: ['cropped-fragments', 'controlled-overlap'], whitespace: ['punctuated', 'compressed-expanded'], repetition: ['intentional-variation'], ornament: ['structural-marks'], motion: ['directional', 'clipped-reveal'] },
  editorial: { preferredAxes: ['vertical', 'horizontal'], gridCharacter: 'modular', hierarchy: ['typographic-scale', 'reading-sequence'], geometry: ['columns', 'rules'], imagePlacement: ['editorial-figure', 'full-bleed-interrupt'], whitespace: ['punctuated', 'expansive'], repetition: ['chapter-rhythm'], ornament: ['captions', 'rules'], motion: ['editorial', 'mask-reveal'] },
  modular: { preferredAxes: ['vertical', 'horizontal'], gridCharacter: 'modular', hierarchy: ['module-scale', 'grouping'], geometry: ['rectilinear-modules'], imagePlacement: ['module-spans', 'image-rail'], whitespace: ['balanced'], repetition: ['variable-modules'], ornament: ['index-marks'], motion: ['staggered-modules'] },
  'organic-flow': { preferredAxes: ['curvilinear'], gridCharacter: 'flowing', hierarchy: ['path', 'scale'], geometry: ['organic-curves'], imagePlacement: ['flowing-sequence'], whitespace: ['organic'], repetition: ['asymmetric-rhythm'], ornament: ['integrated-linework'], motion: ['flowing', 'path-based'] },
  radial: { preferredAxes: ['radial'], gridCharacter: 'radial', hierarchy: ['center-periphery', 'scale'], geometry: ['concentric', 'radial-lines'], imagePlacement: ['central-stage', 'orbiting-figures'], whitespace: ['radial'], repetition: ['orbital'], ornament: ['radial-marks'], motion: ['orbital', 'radial-reveal'] },
  asymmetric: { preferredAxes: ['vertical', 'diagonal'], gridCharacter: 'broken', hierarchy: ['mass-balance', 'scale'], geometry: ['variable-spans'], imagePlacement: ['off-axis', 'cropped-field'], whitespace: ['asymmetric', 'directional'], repetition: ['heterogeneous'], ornament: ['selective'], motion: ['directional'] },
  axial: { preferredAxes: ['vertical', 'horizontal'], gridCharacter: 'axial', hierarchy: ['axis', 'symmetry'], geometry: ['framed', 'concentric'], imagePlacement: ['axis-aligned'], whitespace: ['balanced'], repetition: ['mirrored'], ornament: ['axis-marks'], motion: ['axis-reveal'] }
};

export function getStyleAdapter(name: string): StyleAdapterRules | undefined {
  return STYLE_ADAPTERS[name.toLowerCase()];
}

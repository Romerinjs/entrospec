import type { DesignGenome, DesignGenomeInput, WhitespaceStrategy } from './designGenome';
import { getStyleAdapter } from './styleTaxonomy';
import { createSeedStreams } from '../seed/seedEngine';

const patterns = ['generic-split-hero', 'three-card-feature-grid', 'four-card-bento', 'metrics-card-row', 'accordion-faq', 'centered-rounded-cta', 'gradient-orb-background', 'floating-dashboard-mockup', 'purple-saas-gradient', 'repeated-two-column-sections'];

export function generateDesignGenome(input: DesignGenomeInput): DesignGenome {
  const streams = createSeedStreams(input.entropySeed);
  const compositionRng = streams.rngFor('composition');
  const gridRng = streams.rngFor('grid');
  const hierarchyRng = streams.rngFor('hierarchy');
  const direction = input.artDirection;
  const adapter = getStyleAdapter(direction.compositionGrammar);
  const noveltyBudget = input.noveltyBudget ?? 0.5;
  const risk = input.creativeRisk ?? 'moderate';
  const grids = adapter?.gridCharacter === 'strict' ? ['strict-columns', 'editorial-columns', 'asymmetric-columns']
    : adapter?.gridCharacter === 'broken' ? ['broken-modular', 'diagonal-field', 'offset-columns']
      : adapter?.gridCharacter === 'flowing' ? ['organic-flow', 'contour-grid', 'freeform-flow']
        : adapter?.gridCharacter === 'radial' ? ['radial-orbit', 'concentric-field', 'radial-modules']
          : adapter?.gridCharacter === 'axial' ? ['axial-frame', 'stepped-axis', 'mirrored-modules']
            : ['modular-field', 'variable-columns', 'asymmetric-modules'];
  const familyOptions = adapter ? [direction.compositionGrammar, `${direction.compositionGrammar}-editorial`, `${direction.compositionGrammar}-poster`] : ['editorial-field', 'asymmetric-poster', 'modular-narrative'];
  const density = direction.density === 'balanced' ? ['balanced', 'medium-high', 'restrained'] : [direction.density, 'balanced', 'medium-high'];
  const whitespace: WhitespaceStrategy[] = adapter?.gridCharacter === 'strict' ? ['asymmetric', 'expansive', 'directional']
    : adapter?.gridCharacter === 'broken' ? ['compressed', 'punctuated', 'directional']
      : adapter?.gridCharacter === 'flowing' ? ['organic' as WhitespaceStrategy, 'expansive', 'punctuated']
        : ['balanced', 'punctuated', 'directional'];
  const gridsChoice = gridRng.pick(grids);
  const overlapBase = adapter?.gridCharacter === 'broken' ? 0.48 : adapter?.gridCharacter === 'flowing' ? 0.25 : 0.08;
  const riskFactor = risk === 'high' ? 0.18 : risk === 'low' ? -0.12 : 0;
  const novelty = Math.max(0, Math.min(1, noveltyBudget));
  const overlapLevel = Math.max(0, Math.min(0.85, overlapBase + novelty * 0.22 + riskFactor + compositionRng.next() * 0.1));
  const sectionMorphology = hierarchyRng.shuffle(['typographic-opening', 'information-rail', 'annotated-figure', 'editorial-proof', 'timeline', 'manifesto-close']).slice(0, 4 + hierarchyRng.int(3));
  return {
    compositionFamily: compositionRng.pick(familyOptions),
    gridFamily: gridsChoice,
    gridColumns: gridRng.pick([6, 7, 8, 10, 12]),
    gridBehavior: adapter?.gridCharacter ?? 'modular',
    dominantAxis: compositionRng.pick(adapter?.preferredAxes.length ? adapter.preferredAxes : ['vertical', 'horizontal', 'diagonal']),
    readingDirection: compositionRng.pick(['vertical-chapters', 'horizontal-index', 'diagonal-sweep', 'radial-outward']),
    symmetry: adapter?.gridCharacter === 'axial' ? compositionRng.pick(['axial', 'near-symmetry', 'stepped-symmetry']) : compositionRng.pick(['asymmetric', 'intentionally-broken', 'weighted-balance']),
    balanceMode: compositionRng.pick(['mass-offset', 'counterweight', 'directional', 'modular-tension']),
    sectionRhythm: compositionRng.pick(['compressed-expanded', 'quiet-dense-release', 'editorial-visual-conversion', 'interrupt-climax-release']),
    density: compositionRng.pick(density),
    whitespaceStrategy: compositionRng.pick(whitespace),
    scaleContrast: compositionRng.pick(['subtle', 'strong', 'extreme', 'typographic-monument']),
    overlapLevel,
    depthModel: direction.surfaceLanguage === 'glassmorphism' ? 'layered-translucency' : compositionRng.pick(['flat', 'layered-paper', 'foreground-background', 'cutout-depth']),
    croppingBehavior: compositionRng.pick(adapter?.imagePlacement.length ? adapter.imagePlacement : ['full-bleed', 'cropped-fragment', 'editorial-figure']),
    imageBehavior: compositionRng.pick(['full-bleed', 'cropped-fragment', 'photomontage', 'annotated-figure', 'object-on-canvas', 'visual-sequence', 'image-rail']),
    typographicBehavior: compositionRng.pick(direction.allowedTypographyBehaviors?.length ? [...direction.allowedTypographyBehaviors] : ['oversized-condensed', 'editorial-scale', 'mixed-scale']),
    surfaceLanguage: direction.surfaceLanguage,
    geometryLanguage: compositionRng.pick(adapter?.geometry.length ? adapter.geometry : ['rectilinear', 'variable-spans', 'curved-boundaries']),
    ornamentation: direction.ornamentation,
    navigationPattern: compositionRng.pick(['minimal-index', 'side-rail', 'chapter-nav', 'floating-index', 'classic-nav']),
    sectionMorphology,
    motionIntensity: direction.motionLanguage === 'none' ? 0 : Math.min(0.75, novelty * 0.5 + compositionRng.next() * 0.2),
    motionGrammar: compositionRng.pick(adapter?.motion.length ? adapter.motion : [direction.motionLanguage, 'editorial-reveal']),
    transitionLanguage: compositionRng.pick(['cut', 'mask-reveal', 'rule-wipe', 'spatial-shift', 'quiet-crossfade']),
    responsiveTransformation: compositionRng.pick(['poster-to-editorial-sequence', 'rail-to-snap-flow', 'collage-to-layered-flow', 'radial-to-linear-story', 'grid-to-reordered-sequence']),
    ctaBehavior: compositionRng.pick(['manifesto-close', 'inline-conversion', 'full-bleed-close', 'sticky-action', 'editorial-close', 'progressive-action']),
    contentFlow: compositionRng.pick(['story-chapters', 'problem-proof-action', 'visual-index', 'claim-evidence-objection', 'narrative-arc']),
    visualHierarchy: hierarchyRng.shuffle(['scale', 'alignment', 'contrast', 'position', 'typography', 'color']).slice(0, 4),
    intentionalIrregularity: Math.min(1, novelty * (risk === 'high' ? 0.9 : risk === 'low' ? 0.45 : 0.7) + hierarchyRng.next() * 0.12),
    prohibitedPatterns: patterns,
    noveltyBudget: input.noveltyBudget ?? 0.5,
    creativeRisk: risk
  };
}

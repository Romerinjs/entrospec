import type { ArtDirection } from './styleTaxonomy';
import { getStyleAdapter } from './styleTaxonomy';

export interface ArtDirectionRequest {
  styleSeed: string;
  compositionGrammar?: string;
  surfaceLanguage?: string;
  artDirection?: string;
  ornamentation?: string;
  density?: string;
  motionLanguage?: string;
}

const token = (value: string | undefined, fallback: string) => value?.trim().toLowerCase().replace(/\s+/g, '-') || fallback;

export function interpretArtDirection(request: ArtDirectionRequest): ArtDirection {
  const styleSeed = request.styleSeed.trim() || 'brand-led visual direction';
  const seed = styleSeed.toLowerCase();
  const compositionGrammar = token(request.compositionGrammar, seed.includes('constructiv') ? 'constructivism' : seed.includes('bauhaus') ? 'bauhaus' : seed.includes('nouveau') ? 'organic-flow' : seed.includes('deconstruct') ? 'deconstructivism' : seed.includes('swiss') ? 'swiss' : 'editorial');
  const surfaceLanguage = token(request.surfaceLanguage, seed.includes('glass') ? 'glassmorphism' : seed.includes('paper') ? 'paper' : seed.includes('brutal') ? 'brutalist-ui' : 'flat');
  const artDirection = token(request.artDirection, seed.includes('cyberpunk') ? 'cyberpunk' : seed.includes('scientific') ? 'scientific' : seed.includes('deco') ? 'industrial' : seed.includes('retro') ? 'retrofuturism' : 'editorial-1970s');
  const ornamentation = token(request.ornamentation, seed.includes('patent') ? 'patent-illustration' : seed.includes('deco') ? 'art-deco' : seed.includes('nouveau') ? 'art-nouveau' : 'rules-and-bars');
  const density = token(request.density, seed.includes('maximal') ? 'maximalist' : seed.includes('minimal') ? 'minimal' : 'balanced');
  const motionLanguage = token(request.motionLanguage, seed.includes('kinetic') ? 'kinetic' : seed.includes('glitch') ? 'glitch' : 'editorial');
  const rules = getStyleAdapter(compositionGrammar);
  const rationale = rules
    ? `${compositionGrammar} gobierna composición/retícula; ${surfaceLanguage} gobierna materiales; ${artDirection} aporta tono cultural; ${ornamentation} ornamenta; ${density} controla carga; ${motionLanguage} controla tiempo.`
    : `La gramática ${compositionGrammar} se conserva como extensión; superficie, arte, ornamento, densidad y movimiento permanecen en capas separadas.`;
  const allowedTypographyBehaviors = /mono|technical|terminal|code/.test(seed)
    ? ['technical-monospace', 'editorial-scale', 'mixed-scale']
    : ['oversized-condensed', 'editorial-scale', 'mixed-scale', 'high-contrast-serif'];
  return { compositionGrammar, surfaceLanguage, artDirection, ornamentation, density, motionLanguage, styleSeed, rationale, allowedTypographyBehaviors };
}

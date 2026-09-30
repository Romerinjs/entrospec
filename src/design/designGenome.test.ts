import { describe, expect, it } from 'vitest';
import { createSeedStreams, deriveSeed } from '../seed/seedEngine';
import type { ArtDirection } from './styleTaxonomy';
import { STYLE_ADAPTERS, getStyleAdapter } from './styleTaxonomy';
import { generateDesignGenome } from './genomeGenerator';

const artDirection: ArtDirection = {
  compositionGrammar: 'swiss', surfaceLanguage: 'glassmorphism', artDirection: 'scientific',
  ornamentation: 'patent-illustration', density: 'restrained', motionLanguage: 'editorial',
  styleSeed: 'Swiss × scientific atlas', rationale: 'Estructura precisa con anotación técnica.'
};

describe('style taxonomy and seed streams', () => {
  it('keeps composition, surface, art direction and motion as independent axes', () => {
    expect(artDirection.compositionGrammar).toBe('swiss');
    expect(artDirection.surfaceLanguage).toBe('glassmorphism');
    expect(artDirection.artDirection).toBe('scientific');
    expect(artDirection.motionLanguage).toBe('editorial');
    expect(getStyleAdapter(artDirection.compositionGrammar)?.gridCharacter).toBe('strict');
    expect(STYLE_ADAPTERS.constructivism.gridCharacter).toBe('broken');
  });

  it('derives stable independent named streams and reproducible PRNG values', () => {
    const first = createSeedStreams('seed-A');
    const second = createSeedStreams('seed-A');
    expect(first.seedFor('composition')).toBe(second.seedFor('composition'));
    expect(first.seedFor('composition')).not.toBe(first.seedFor('grid'));
    expect(first.rngFor('composition').next()).toBe(second.rngFor('composition').next());
    expect(deriveSeed('seed-A', 'region:proof')).not.toBe(deriveSeed('seed-A', 'region:hero'));
  });

  it('changes the stream when entropy seed or seed version changes', () => {
    expect(deriveSeed('seed-A', 'hero')).not.toBe(deriveSeed('seed-B', 'hero'));
    expect(deriveSeed('seed-A', 'hero', 'seed-v1')).not.toBe(deriveSeed('seed-A', 'hero', 'seed-v2'));
  });

  it('provides deterministic sampling helpers', () => {
    const left = createSeedStreams('stable').rngFor('grid');
    const right = createSeedStreams('stable').rngFor('grid');
    expect(left.shuffle([1, 2, 3, 4, 5])).toEqual(right.shuffle([1, 2, 3, 4, 5]));
    expect(createSeedStreams('stable').rngFor('grid').pick(['a', 'b', 'c'])).toBe(
      createSeedStreams('stable').rngFor('grid').pick(['a', 'b', 'c'])
    );
  });

  it('preserves structural invariants for distinct art grammars', () => {
    const make = (compositionGrammar: string, ornamentation = 'patent-illustration') => generateDesignGenome({ artDirection: { ...artDirection, compositionGrammar, ornamentation }, entropySeed: 'golden-seed' });
    expect(make('swiss').gridBehavior).toBe('strict');
    expect(make('constructivism').gridBehavior).toBe('broken');
    expect(make('axial', 'art-deco').gridBehavior).toBe('axial');
    expect(make('organic-flow').gridBehavior).toBe('flowing');
  });

  it('lets ArtDirection constrain typography before composition RNG samples', () => {
    const constrained = { ...artDirection, allowedTypographyBehaviors: ['editorial-scale', 'high-contrast-serif'] };
    for (const entropySeed of ['a', 'b', 'c', 'd', 'e']) {
      expect(generateDesignGenome({ artDirection: constrained, entropySeed }).typographicBehavior).not.toBe('technical-monospace');
    }
  });
});

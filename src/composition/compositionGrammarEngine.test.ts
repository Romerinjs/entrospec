import { describe, expect, it } from 'vitest';
import type { BrandBrief } from '../generation/types';
import { createFallbackContentArchitecture, completeCreativeProposal } from '../design/creativeProposalV2';
import { interpretArtDirection } from '../design/artDirectionEngine';
import { composeSpatialComposition, planMotionGrammar, planResponsiveStrategy } from './compositionGrammarEngine';

const brief: BrandBrief = { brandName: 'Northline', industry: 'Infraestructura', valueProposition: 'Decisiones claras', targetAudience: 'Equipos técnicos', brandPersonality: 'Precisa', toneOfVoice: 'Directo', primaryAction: 'Explorar' };

describe('composition grammar engine', () => {
  it('keeps purpose/content independent from regional morphology', () => {
    const content = createFallbackContentArchitecture(brief);
    const direction = interpretArtDirection({ styleSeed: 'Swiss scientific atlas', compositionGrammar: 'swiss', surfaceLanguage: 'glassmorphism' });
    const genome = completeCreativeProposal({ brief, styleSeed: 'Swiss scientific atlas', entropySeed: 'entropy-a', proposal: { strategy: { brandName: 'Northline', industry: 'Infraestructura', audience: 'Equipos técnicos', promise: 'Decisiones claras', objective: 'Claridad', claims: [] }, artDirection: direction, contentArchitecture: content, visualStrategy: { mode: 'diagram', prompt: 'Technical atlas', alt: 'Atlas', placement: 'annotated' } } }).designGenome;
    const composition = composeSpatialComposition({ genome, content, entropySeed: 'entropy-a' });
    expect(composition.regions.map(region => region.purpose)).toEqual(content.nodes.map(node => node.purpose));
    expect(new Set(composition.regions.map(region => region.composition)).size).toBeGreaterThan(1);
    expect(composition.family).toContain('swiss');
  });

  it('is reproducible for one seed and may produce a different morphology with another', () => {
    const content = createFallbackContentArchitecture(brief);
    const direction = interpretArtDirection({ styleSeed: 'Constructivist poster', compositionGrammar: 'constructivism' });
    const make = (entropySeed: string) => {
      const blueprint = completeCreativeProposal({ brief, styleSeed: direction.styleSeed, entropySeed, proposal: { strategy: { brandName: 'Northline', industry: 'Infraestructura', audience: 'Equipos técnicos', promise: 'Decisiones claras', objective: 'Claridad', claims: [] }, artDirection: direction, contentArchitecture: content, visualStrategy: { mode: 'poster', prompt: 'Poster', alt: 'Poster', placement: 'full-bleed' } } });
      const composition = composeSpatialComposition({ genome: blueprint.designGenome, content, entropySeed });
      return { blueprint, composition };
    };
    expect(make('repeat').composition).toEqual(make('repeat').composition);
    expect(make('repeat').blueprint.designGenome).toEqual(make('repeat').blueprint.designGenome);
    expect(make('repeat').composition.regions).not.toEqual(make('different').composition.regions);
  });

  it('derives motion and mobile transformations from the genome', () => {
    const content = createFallbackContentArchitecture(brief);
    const direction = interpretArtDirection({ styleSeed: 'Constructivist', compositionGrammar: 'constructivism' });
    const blueprint = completeCreativeProposal({ brief, styleSeed: direction.styleSeed, entropySeed: 'axis-seed', proposal: { strategy: { brandName: 'Northline', industry: 'Infraestructura', audience: 'Equipos técnicos', promise: 'Decisiones claras', objective: 'Claridad', claims: [] }, artDirection: direction, contentArchitecture: content, visualStrategy: { mode: 'poster', prompt: 'Poster', alt: 'Poster', placement: 'full-bleed' } } });
    const responsive = planResponsiveStrategy(blueprint.spatialComposition, blueprint.designGenome);
    const motion = planMotionGrammar(blueprint.designGenome);
    expect(responsive.preserve).toContain('semantic-dom-order');
    expect(responsive.regionOrder).toHaveLength(content.nodes.length);
    expect(motion.directionality).toContain('diagonal');
  });
});

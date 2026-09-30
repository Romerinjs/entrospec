import { describe, expect, it } from 'vitest';
import { composeGenerationPrompt, estimateGenerationCalls } from './promptComposer';

const brief = {
  brandName: 'Northline',
  industry: 'Infraestructura',
  valueProposition: 'Decisiones más claras',
  targetAudience: 'Equipos técnicos',
  brandPersonality: 'Sobria',
  toneOfVoice: 'Directo',
  primaryAction: 'Solicitar acceso'
};

describe('composeGenerationPrompt', () => {
  it('includes only active technique contracts and the native output contract', () => {
    const bundle = composeGenerationPrompt({
      brief,
      ssot: { seed: 'Abc123!xyZ890', layout: 'Brutalismo Suizo', palette: { name: 'Carbon', background: '#0A0A0A', surface: '#141414', accent: '#22C55E' } },
      activeTechniqueIds: [1, 4],
      imageMode: 'generated',
      capabilities: ['svg', 'css-motion']
    });
    expect(bundle.masterPrompt).toContain('Técnica 01');
    expect(bundle.masterPrompt).toContain('Técnica 04');
    expect(bundle.masterPrompt).not.toContain('Técnica 02');
    expect(bundle.masterPrompt).toContain('HTML5');
    expect(bundle.masterPrompt).toContain('JSON');
    expect(bundle.executedPrompt).toBe(bundle.masterPrompt);
    // 2 técnicas activas -> 2 * 3 = 6 prompts candidatos
    expect(bundle.totalCandidatesCount).toBe(6);
    expect(bundle.techniqueCandidates.length).toBe(6);
  });

  it('generates 3 prompts for 1 technique and 9 prompts for 3 techniques', () => {
    const single = composeGenerationPrompt({
      brief,
      ssot: { seed: 'Abc123!xyZ890', layout: 'Brutalismo Suizo', palette: { name: 'Carbon', background: '#0A0A0A', surface: '#141414', accent: '#22C55E' } },
      activeTechniqueIds: [1],
      imageMode: 'procedural',
      capabilities: ['svg']
    });
    expect(single.totalCandidatesCount).toBe(3);

    const triple = composeGenerationPrompt({
      brief,
      ssot: { seed: 'Abc123!xyZ890', layout: 'Brutalismo Suizo', palette: { name: 'Carbon', background: '#0A0A0A', surface: '#141414', accent: '#22C55E' } },
      activeTechniqueIds: [1, 2, 5],
      imageMode: 'procedural',
      capabilities: ['svg']
    });
    expect(triple.totalCandidatesCount).toBe(9);
  });

  it('estimates one text call for optimal combined mode and N * 3 calls for multi_prompt mode', () => {
    expect(estimateGenerationCalls([1, 4], 'generated')).toEqual({ textCalls: 1, imageCalls: 1, totalCalls: 2 });
    expect(estimateGenerationCalls([1, 4], 'procedural')).toEqual({ textCalls: 1, imageCalls: 0, totalCalls: 1 });
    expect(estimateGenerationCalls([1, 2], 'procedural', 'multi_prompt')).toEqual({ textCalls: 6, imageCalls: 0, totalCalls: 6 });
    expect(estimateGenerationCalls([1, 2, 3], 'procedural', 'multi_prompt')).toEqual({ textCalls: 9, imageCalls: 0, totalCalls: 9 });
    expect(estimateGenerationCalls([1, 2, 3, 5, 6, 7, 8], 'procedural', 'combined_techniques')).toEqual({ textCalls: 1, imageCalls: 0, totalCalls: 1 });
    expect(estimateGenerationCalls([], 'generated', 'image_only')).toEqual({ textCalls: 0, imageCalls: 1, totalCalls: 1 });
    expect(estimateGenerationCalls([1], 'procedural', 'seed_only')).toEqual({ textCalls: 1, imageCalls: 0, totalCalls: 1 });
  });
});

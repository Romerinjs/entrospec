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
    expect(bundle.masterPrompt).toContain('Técnica 1');
    expect(bundle.masterPrompt).toContain('Técnica 4');
    expect(bundle.masterPrompt).not.toContain('Técnica 2');
    expect(bundle.masterPrompt).toContain('HTML5');
    expect(bundle.masterPrompt).toContain('JSON');
    expect(bundle.executedPrompt).toBe(bundle.masterPrompt);
  });

  it('estimates one text call and an optional image call', () => {
    expect(estimateGenerationCalls([1, 4], 'generated')).toEqual({ textCalls: 1, imageCalls: 1 });
    expect(estimateGenerationCalls([1, 4], 'procedural')).toEqual({ textCalls: 1, imageCalls: 0 });
  });
});

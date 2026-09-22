import { describe, expect, it } from 'vitest';
import { validateTechniques } from './techniqueValidators';

const blueprint: any = {
  metadata: { seed: 'abc123' },
  techniquePlan: [{ techniqueId: 1, intent: 'seed', evidence: 'chunks' }, { techniqueId: 4, intent: 'hero', evidence: 'asset' }, { techniqueId: 8, intent: 'copy', evidence: 'cta' }],
  sections: [{ type: 'hero', heading: 'Decide', body: 'Claro', ctaLabel: 'Empieza', ctaAction: '#go' }],
  interactionPlan: [{ id: 'motion', reducedMotion: 'instant' }],
  negativeConstraints: ['no bento']
};

describe('validateTechniques', () => {
  it('marks disabled techniques as not requested', () => {
    const result = validateTechniques({ blueprint, html: '<!doctype html><main><h1>Decide</h1></main>', activeTechniqueIds: [] as number[], visualSource: 'procedural' });
    expect(result.find(item => item.techniqueId === 4)?.status).toBe('not_requested');
  });

  it('provides applied evidence for SSoT, image, and human copy', () => {
    const result = validateTechniques({ blueprint, html: '<!doctype html><main><h1>Decide</h1><a>Empieza</a></main>', activeTechniqueIds: [1, 4, 8], visualSource: 'generated' });
    expect(result.filter(item => item.status === 'applied').map(item => item.techniqueId)).toEqual(expect.arrayContaining([1, 4, 8]));
  });
});

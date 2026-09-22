import { describe, expect, it, vi } from 'vitest';
import { createGenerationPipeline } from './generationPipeline';
import type { GenerationRequest, LandingBlueprint } from './types';

const blueprint: LandingBlueprint = {
  schemaVersion: 1,
  brandInterpretation: { brandName: 'Northline', industry: 'Infra', audience: 'Teams', tone: 'Directo', promise: 'Claridad' },
  designTokens: { background: '#0A0A0A', surface: '#141414', accent: '#22C55E', textPrimary: '#F3F3F3', textSecondary: '#A1A1A1', fontDisplay: 'system-ui', fontBody: 'system-ui', radius: '4px' },
  layout: { style: 'Brutalismo Suizo', heroFocus: 'Punto focal', scrollRhythm: 'Lento' },
  sections: [{ id: 'hero', type: 'hero', heading: 'Claro', body: 'Ahora', ctaLabel: 'Entrar', ctaAction: '#cta' }, { id: 'proof', type: 'proof', heading: 'Prueba', body: 'Hechos' }, { id: 'cta', type: 'cta', heading: 'Listo', body: 'Acceso' }],
  visualDirection: { concept: 'Cristal', imagePrompt: 'Cristal', alt: 'Cristal' }, interactionPlan: [], techniquePlan: [{ techniqueId: 4, intent: 'hero', evidence: 'asset' }], negativeConstraints: [], metadata: { seed: 'abc123', title: 'Northline', psychologyAngle: 'clarity' }
};
const request: GenerationRequest = { brief: { brandName: 'Northline', industry: 'Infra', valueProposition: 'Claridad', targetAudience: 'Teams', brandPersonality: 'Sobria', toneOfVoice: 'Directo', primaryAction: 'Entrar' }, executedPrompt: 'prompt', ssotSeed: 'abc123', activeTechniqueIds: [4], imageMode: 'generated', capabilities: ['svg'] };

describe('generation pipeline', () => {
  it('uses one text and one image call for generated mode', async () => {
    const gateway = { requestBlueprint: vi.fn().mockResolvedValue(blueprint), requestHeroImage: vi.fn().mockResolvedValue({ mimeType: 'image/png', data: 'aGVsbG8=' }) };
    const cache = { get: vi.fn().mockResolvedValue(undefined), put: vi.fn() };
    const pipeline = createGenerationPipeline({ gateway, cache, codec: { compress: vi.fn().mockResolvedValue({ dataUrl: 'data:image/webp;base64,aGVsbG8=', byteLength: 5 }) } });
    const result = await pipeline.run(request);
    expect(result.callsUsed).toEqual({ textCalls: 1, imageCalls: 1 });
    expect(gateway.requestHeroImage).toHaveBeenCalledTimes(1);
    expect(result.htmlCode).toContain('<!DOCTYPE html>');
  });

  it('falls back to procedural visual when image generation fails', async () => {
    const gateway = { requestBlueprint: vi.fn().mockResolvedValue(blueprint), requestHeroImage: vi.fn().mockRejectedValue(new Error('quota')) };
    const pipeline = createGenerationPipeline({ gateway, cache: { get: vi.fn().mockResolvedValue(undefined), put: vi.fn() }, codec: { compress: vi.fn() } });
    const result = await pipeline.run(request);
    expect(result.visual.source).toBe('fallback-procedural');
  });
});

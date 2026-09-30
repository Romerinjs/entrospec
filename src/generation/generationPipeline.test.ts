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
    expect(result.callsUsed).toEqual({ textCalls: 1, imageCalls: 1, totalCalls: 2 });
    expect(gateway.requestHeroImage).toHaveBeenCalledTimes(1);
    expect(result.htmlCode).toContain('<!DOCTYPE html>');
  });

  it('uses exactly 1 text call for seed_only execution mode', async () => {
    const gateway = { requestBlueprint: vi.fn().mockResolvedValue(blueprint), requestHeroImage: vi.fn() };
    const pipeline = createGenerationPipeline({ gateway, cache: { get: vi.fn(), put: vi.fn() }, codec: { compress: vi.fn() } });
    const result = await pipeline.run({ ...request, executionMode: 'seed_only', activeTechniqueIds: [1], imageMode: 'procedural' });
    expect(result.callsUsed).toEqual({ textCalls: 1, imageCalls: 0, totalCalls: 1 });
    expect(gateway.requestBlueprint).toHaveBeenCalledTimes(1);
    expect(gateway.requestHeroImage).not.toHaveBeenCalled();
    expect(result.visual.source).toBe('procedural');
  });

  it('uses exactly 1 text call when combining multiple techniques without AI image', async () => {
    const gateway = { requestBlueprint: vi.fn().mockResolvedValue(blueprint), requestHeroImage: vi.fn() };
    const pipeline = createGenerationPipeline({ gateway, cache: { get: vi.fn(), put: vi.fn() }, codec: { compress: vi.fn() } });
    const result = await pipeline.run({ ...request, executionMode: 'combined_techniques', activeTechniqueIds: [1, 2, 3, 5, 6, 7, 8], imageMode: 'procedural' });
    expect(result.callsUsed).toEqual({ textCalls: 1, imageCalls: 0, totalCalls: 1 });
    expect(gateway.requestBlueprint).toHaveBeenCalledTimes(1);
    expect(gateway.requestHeroImage).not.toHaveBeenCalled();
  });

  it('uses exactly 1 image call for image_only mode with existing blueprint', async () => {
    const gateway = { requestBlueprint: vi.fn(), requestHeroImage: vi.fn().mockResolvedValue({ mimeType: 'image/png', data: 'aGVsbG8=' }) };
    const pipeline = createGenerationPipeline({ gateway, cache: { get: vi.fn().mockResolvedValue(undefined), put: vi.fn() }, codec: { compress: vi.fn().mockResolvedValue({ dataUrl: 'data:image/webp;base64,aGVsbG8=', byteLength: 5 }) } });
    const result = await pipeline.run({ ...request, executionMode: 'image_only', existingBlueprint: blueprint, imageMode: 'generated' });
    expect(result.callsUsed).toEqual({ textCalls: 0, imageCalls: 1, totalCalls: 1 });
    expect(gateway.requestBlueprint).not.toHaveBeenCalled();
    expect(gateway.requestHeroImage).toHaveBeenCalledTimes(1);
  });

  it('falls back to procedural visual when image generation fails and allowFallback is enabled', async () => {
    const gateway = { requestBlueprint: vi.fn().mockResolvedValue(blueprint), requestHeroImage: vi.fn().mockRejectedValue(new Error('quota')) };
    const pipeline = createGenerationPipeline({ gateway, cache: { get: vi.fn().mockResolvedValue(undefined), put: vi.fn() }, codec: { compress: vi.fn() } });
    const result = await pipeline.run({ ...request, allowFallback: true });
    expect(result.visual.source).toBe('fallback-procedural');
  });

  it('throws honest error when AI text model fails and allowFallback is false', async () => {
    const gateway = { requestBlueprint: vi.fn().mockRejectedValue(new Error('503 UNAVAILABLE')), requestHeroImage: vi.fn() };
    const pipeline = createGenerationPipeline({ gateway, cache: { get: vi.fn().mockResolvedValue(undefined), put: vi.fn() }, codec: { compress: vi.fn() } });
    await expect(pipeline.run({ ...request, allowFallback: false })).rejects.toThrow('503 UNAVAILABLE');
  });

  it('falls back to procedural blueprint when AI text model fails and allowFallback is enabled', async () => {
    const gateway = { requestBlueprint: vi.fn().mockRejectedValue(new Error('503 UNAVAILABLE')), requestHeroImage: vi.fn() };
    const pipeline = createGenerationPipeline({ gateway, cache: { get: vi.fn().mockResolvedValue(undefined), put: vi.fn() }, codec: { compress: vi.fn() } });
    const result = await pipeline.run({ ...request, allowFallback: true });
    expect(result.blueprint).toBeDefined();
    expect(result.blueprint.brandInterpretation.brandName).toBe('Northline');
    expect(result.htmlCode).toContain('<!DOCTYPE html>');
  });
});

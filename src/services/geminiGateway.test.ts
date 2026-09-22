import { afterEach, describe, expect, it, vi } from 'vitest';
import { createGeminiGateway } from './geminiGateway';

const blueprint = {
  schemaVersion: 1,
  brandInterpretation: { brandName: 'Northline', industry: 'Infra', audience: 'Teams', tone: 'Directo', promise: 'Claridad' },
  designTokens: { background: '#0A0A0A', surface: '#141414', accent: '#22C55E', textPrimary: '#F3F3F3', textSecondary: '#A1A1A1', fontDisplay: 'system-ui', fontBody: 'system-ui', radius: '4px' },
  layout: { style: 'Brutalismo Suizo', heroFocus: 'Punto focal', scrollRhythm: 'Lento' },
  sections: [
    { id: 'hero', type: 'hero', heading: 'Claro', body: 'Ahora', ctaLabel: 'Entrar', ctaAction: '#cta' },
    { id: 'proof', type: 'proof', heading: 'Prueba', body: 'Hechos' },
    { id: 'cta', type: 'cta', heading: 'Listo', body: 'Acceso' }
  ],
  visualDirection: { concept: 'Cristal', imagePrompt: 'Cristal', alt: 'Cristal' },
  interactionPlan: [], techniquePlan: [{ techniqueId: 1, intent: 'seed', evidence: 'seed' }], negativeConstraints: [], metadata: { seed: 'Abc123', title: 'Northline', psychologyAngle: 'clarity' }
};

const request = { prompt: 'return blueprint', activeTechniqueIds: [1] };

afterEach(() => vi.unstubAllGlobals());

describe('Gemini gateway', () => {
  it('parses a stopped structured blueprint', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify(blueprint) }] } }] }), { status: 200 })));
    const result = await createGeminiGateway({ apiKey: 'key', textModel: 'text', imageModel: 'image' }).requestBlueprint(request);
    expect(result).toEqual(blueprint);
  });

  it('maps quota failures and rejects missing candidates', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('quota', { status: 429 })));
    await expect(createGeminiGateway({ apiKey: 'key', textModel: 'text', imageModel: 'image' }).requestBlueprint(request)).rejects.toMatchObject({ code: 'QUOTA_EXCEEDED' });
  });

  it('extracts inline image data', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ candidates: [{ content: { parts: [{ inlineData: { mimeType: 'image/png', data: 'aGVsbG8=' } }] } }] }), { status: 200 })));
    const result = await createGeminiGateway({ apiKey: 'key', textModel: 'text', imageModel: 'image' }).requestHeroImage('macro');
    expect(result).toEqual({ mimeType: 'image/png', data: 'aGVsbG8=' });
  });
});

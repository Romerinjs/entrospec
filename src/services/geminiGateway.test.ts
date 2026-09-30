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
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => Promise.resolve(new Response('quota', { status: 429 }))));
    await expect(createGeminiGateway({ apiKey: 'key', textModel: 'text', imageModel: 'image' }).requestBlueprint(request)).rejects.toMatchObject({ code: 'QUOTA_EXCEEDED' });
  });

  it('falls back to secondary model when primary model returns 503', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response('Unavailable', { status: 503 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify(blueprint) }] } }] }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const result = await createGeminiGateway({ apiKey: 'key', textModel: 'model-a', fallbackTextModels: ['model-b'], imageModel: 'image' }).requestBlueprint(request);
    expect(result).toEqual(blueprint);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('extracts inline image data', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ candidates: [{ content: { parts: [{ inlineData: { mimeType: 'image/png', data: 'aGVsbG8=' } }] } }] }), { status: 200 })));
    const result = await createGeminiGateway({ apiKey: 'key', textModel: 'text', imageModel: 'image' }).requestHeroImage('macro');
    expect(result).toEqual({ mimeType: 'image/png', data: 'aGVsbG8=' });
  });

  it('tests connection and reports available models with latency', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      models: [{ name: 'models/gemini-3.5-flash' }, { name: 'models/gemini-2.5-flash-image' }]
    }), { status: 200 })));
    const result = await createGeminiGateway({ apiKey: 'valid-key', textModel: 'gemini-3.5-flash', imageModel: 'gemini-2.5-flash-image' }).testConnection();
    expect(result.ok).toBe(true);
    expect(result.availableModels).toContain('gemini-3.5-flash');
    expect(result.availableModels).toContain('gemini-2.5-flash-image');
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it('reports failure when API key is missing or invalid', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('API_KEY_INVALID', { status: 400 })));
    const result = await createGeminiGateway({ apiKey: 'bad-key', textModel: 'text', imageModel: 'image' }).testConnection();
    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('synthesizes creative prompt with AI in requestPromptSynthesis', async () => {
    const aiPrompt = 'Eres director creativo para QuantumCloud. Diseña una landing con arquitectura centered_monumental.';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      candidates: [{ finishReason: 'STOP', content: { parts: [{ text: aiPrompt }] } }]
    }), { status: 200 })));

    const result = await createGeminiGateway({ apiKey: 'key', textModel: 'text', imageModel: 'image' }).requestPromptSynthesis({
      brief: { brandName: 'QuantumCloud', industry: 'Cloud' },
      techniqueDirectives: ['Técnica 01: SSoT'],
      seed: 'seed123'
    });
    expect(result).toBe(aiPrompt);
  });

  it('transmits the complete creative prompt plus only the documented HTML contract', async () => {
    const userPrompt = 'Crea una landing crema #FDFBF7 y verde. Conserva exactamente esta paleta.';
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: '```html\n<!doctype html><html><head><style>body{background:#FDFBF7}</style></head><body><main>OK</main></body></html>\n```' }] } }] }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const result = await createGeminiGateway({ apiKey: 'secret-never-display', textModel: 'gemini-test', imageModel: 'image' }).requestHtmlDocument({ prompt: userPrompt });
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body.contents[0].parts[0].text).toBe(result.transmittedPrompt);
    expect(result.transmittedPrompt).toBe(composeNativeHtmlPrompt(userPrompt));
    expect(result.transmittedPrompt.startsWith(userPrompt)).toBe(true);
    expect(result.extractedHtml).toContain('#FDFBF7');
    expect(body.generationConfig).toMatchObject({ responseMimeType: 'text/plain', temperature: 0.82 });
    expect(JSON.stringify(result)).not.toContain('secret-never-display');
  });
});

import { composeNativeHtmlPrompt } from '../generation/nativeHtmlPrompt';

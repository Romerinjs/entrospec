import { expect, it } from 'vitest';
import { createGeminiGateway } from './geminiGateway';

const env = (import.meta as unknown as { env: Record<string, string | undefined> }).env;
const live = env.VITE_GEMINI_REAL_TEST === '1' && env.VITE_GEMINI_API_KEY ? it : it.skip;

live('returns a valid blueprint with the real API', async () => {
  const gateway = createGeminiGateway({
    apiKey: env.VITE_GEMINI_API_KEY || '',
    textModel: env.VITE_GEMINI_TEXT_MODEL || 'gemini-3.5-flash',
    imageModel: env.VITE_GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image'
  });
  const result = await gateway.requestBlueprint({ prompt: 'Devuelve un blueprint mínimo de tres secciones para una marca sobria.', activeTechniqueIds: [] });
  expect(result.sections.length).toBeGreaterThanOrEqual(3);
}, 60000);

live('validates API key and reports available models via testConnection', async () => {
  const gateway = createGeminiGateway({
    apiKey: env.VITE_GEMINI_API_KEY || '',
    textModel: env.VITE_GEMINI_TEXT_MODEL || 'gemini-3.5-flash',
    imageModel: env.VITE_GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image'
  });
  const testRes = await gateway.testConnection();
  expect(testRes.ok).toBe(true);
  expect(testRes.availableModels?.length).toBeGreaterThan(0);
}, 30000);

live('generates a hero image with the real Gemini image model', async () => {
  const gateway = createGeminiGateway({
    apiKey: env.VITE_GEMINI_API_KEY || '',
    textModel: env.VITE_GEMINI_TEXT_MODEL || 'gemini-3.5-flash',
    imageModel: env.VITE_GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image'
  });
  const result = await gateway.requestHeroImage('Minimalist dark texture, brutalist architecture');
  expect(result.mimeType).toContain('image');
  expect(result.data.length).toBeGreaterThan(100);
}, 60000);

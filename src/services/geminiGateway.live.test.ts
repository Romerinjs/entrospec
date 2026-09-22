import { expect, it } from 'vitest';
import { createGeminiGateway } from './geminiGateway';

const env = (import.meta as unknown as { env: Record<string, string | undefined> }).env;
const live = env.VITE_GEMINI_REAL_TEST === '1' && env.VITE_GEMINI_API_KEY ? it : it.skip;

live('returns a valid blueprint with the real API', async () => {
  const gateway = createGeminiGateway({
    apiKey: env.VITE_GEMINI_API_KEY || '',
    textModel: env.VITE_GEMINI_TEXT_MODEL || 'gemini-2.5-flash',
    imageModel: env.VITE_GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image'
  });
  const result = await gateway.requestBlueprint({ prompt: 'Devuelve un blueprint mínimo de tres secciones para una marca sobria.', activeTechniqueIds: [] });
  expect(result.sections.length).toBeGreaterThanOrEqual(3);
});

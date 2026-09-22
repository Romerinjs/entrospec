import { LANDING_BLUEPRINT_SCHEMA } from '../generation/blueprintSchema';
import { validateBlueprint } from '../generation/blueprintSchema';
import type { GenerationError, LandingBlueprint } from '../generation/types';

export interface GeminiGatewayConfig { apiKey: string; textModel: string; imageModel: string; endpoint?: string }
export interface BlueprintGatewayRequest { prompt: string; activeTechniqueIds: number[]; references?: Array<{ mimeType: string; data: string }> }
export interface RawGeneratedImage { mimeType: string; data: string }
export interface GeminiGateway {
  requestBlueprint(request: BlueprintGatewayRequest, signal?: AbortSignal): Promise<LandingBlueprint>;
  requestHeroImage(prompt: string, references?: Array<{ mimeType: string; data: string }>, signal?: AbortSignal): Promise<RawGeneratedImage>;
}

function error(code: GenerationError['code'], message: string, status?: number): GenerationError {
  const result = new Error(message) as GenerationError;
  result.code = code;
  result.status = status;
  return result;
}

function mapStatus(status: number): GenerationError['code'] {
  if (status === 401 || status === 403) return 'INVALID_API_KEY';
  if (status === 429) return 'QUOTA_EXCEEDED';
  return 'TEXT_MODEL_ERROR';
}

async function readResponse(response: Response, kind: 'text' | 'image') {
  if (!response.ok) {
    const body = await response.text();
    throw error(kind === 'image' ? 'IMAGE_MODEL_ERROR' : mapStatus(response.status), `Gemini respondió ${response.status}: ${body.slice(0, 240)}`, response.status);
  }
  return response.json() as Promise<any>;
}

export function createGeminiGateway(config: GeminiGatewayConfig): GeminiGateway {
  const base = config.endpoint || 'https://generativelanguage.googleapis.com/v1beta/models';
  const requireKey = () => {
    if (!config.apiKey.trim()) throw error('MISSING_API_KEY', 'No hay una clave Gemini configurada.');
  };
  const call = async (model: string, body: unknown, signal?: AbortSignal, kind: 'text' | 'image' = 'text') => {
    requireKey();
    try {
      const response = await fetch(`${base}/${model}:generateContent?key=${encodeURIComponent(config.apiKey)}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal
      });
      return readResponse(response, kind);
    } catch (cause) {
      if ((cause as GenerationError).code) throw cause;
      if (cause instanceof DOMException && cause.name === 'AbortError') throw error('CANCELLED', 'Generación cancelada.');
      throw error('NETWORK_ERROR', cause instanceof Error ? cause.message : 'No fue posible contactar Gemini.');
    }
  };
  return {
    async requestBlueprint(request, signal) {
      const parts: Array<Record<string, unknown>> = [{ text: request.prompt }];
      for (const reference of request.references || []) parts.push({ inlineData: { mimeType: reference.mimeType, data: reference.data } });
      const data = await call(config.textModel, {
        contents: [{ parts }],
        generationConfig: { temperature: 0.75, maxOutputTokens: 8192, responseMimeType: 'application/json', responseSchema: LANDING_BLUEPRINT_SCHEMA }
      }, signal);
      const candidate = data?.candidates?.[0];
      if (!candidate?.content?.parts?.length || candidate.finishReason === 'MAX_TOKENS') throw error('TEXT_MODEL_ERROR', 'Gemini devolvió una respuesta incompleta.');
      const text = candidate.content.parts.map((part: { text?: string }) => part.text || '').join('').trim();
      let parsed: unknown;
      try { parsed = JSON.parse(text); } catch { throw error('TEXT_MODEL_ERROR', 'Gemini no devolvió JSON válido.'); }
      const result = validateBlueprint(parsed, request.activeTechniqueIds);
      if (!result.ok) throw error('INVALID_BLUEPRINT', result.issues.map(issue => `${issue.path}: ${issue.message}`).join(' '));
      return result.value;
    },
    async requestHeroImage(prompt, references, signal) {
      const parts: Array<Record<string, unknown>> = [{ text: prompt }];
      for (const reference of references || []) parts.push({ inlineData: { mimeType: reference.mimeType, data: reference.data } });
      const data = await call(config.imageModel, { contents: [{ parts }], generationConfig: { responseModalities: ['IMAGE'] } }, signal, 'image');
      const part = data?.candidates?.flatMap((candidate: any) => candidate.content?.parts || []).find((item: any) => item.inlineData?.data);
      if (!part) throw error('IMAGE_MODEL_ERROR', 'Gemini no devolvió un activo de imagen.');
      return { mimeType: part.inlineData.mimeType || 'image/png', data: part.inlineData.data };
    }
  };
}

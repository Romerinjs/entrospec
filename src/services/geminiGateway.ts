import { LANDING_BLUEPRINT_SCHEMA, sanitizeBlueprint, validateBlueprint } from '../generation/blueprintSchema';
import type { GenerationError, LandingBlueprint } from '../generation/types';
import type { CreativeProposalV2 } from '../design/creativeProposalV2';

export interface GeminiGatewayConfig {
  apiKey: string;
  textModel: string;
  imageModel: string;
  endpoint?: string;
  fallbackTextModels?: string[];
  fallbackImageModels?: string[];
}
export interface BlueprintGatewayRequest { prompt: string; activeTechniqueIds: number[]; references?: Array<{ mimeType: string; data: string }> }
export interface PromptSynthesisRequest {
  brief: {
    brandName?: string;
    industry?: string;
    valueProposition?: string;
    targetAudience?: string;
    brandPersonality?: string;
    toneOfVoice?: string;
    primaryAction?: string;
  };
  techniqueDirectives: string[];
  seed: string;
}
export interface RawGeneratedImage { mimeType: string; data: string }
export interface GeminiConnectionTestResult {
  ok: boolean;
  textModel: string;
  imageModel: string;
  latencyMs: number;
  availableModels?: string[];
  error?: string;
}

export interface GeminiGateway {
  requestBlueprint(request: BlueprintGatewayRequest, signal?: AbortSignal): Promise<LandingBlueprint>;
  requestCreativeProposalV2(request: { prompt: string; references?: Array<{ mimeType: string; data: string }> }, signal?: AbortSignal): Promise<CreativeProposalV2>;
  requestHtmlDocument(request: { prompt: string }, signal?: AbortSignal): Promise<{ transmittedPrompt: string; rawModelText: string; extractedHtml: string; model: string; temperature: number; responseMimeType: string }>;
  requestHeroImage(prompt: string, references?: Array<{ mimeType: string; data: string }>, signal?: AbortSignal): Promise<RawGeneratedImage>;
  requestPromptSynthesis(request: PromptSynthesisRequest, signal?: AbortSignal): Promise<string>;
  testConnection(signal?: AbortSignal): Promise<GeminiConnectionTestResult>;
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

const DEFAULT_TEXT_FALLBACKS = [
  'gemini-3.5-flash',
  'gemini-2.5-flash',
  'gemini-3-flash-preview',
  'gemini-3.6-flash',
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash-lite',
  'gemini-flash-latest'
];
const DEFAULT_IMAGE_FALLBACKS = ['gemini-2.5-flash-image', 'gemini-3.1-flash-image', 'gemini-3.1-flash-lite-image'];

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
      return await readResponse(response, kind);
    } catch (cause) {
      if ((cause as GenerationError).code) throw cause;
      if (cause instanceof DOMException && cause.name === 'AbortError') throw error('CANCELLED', 'Generación cancelada.');
      if (signal?.aborted) throw error('CANCELLED', 'Generación cancelada.');
      throw error('NETWORK_ERROR', cause instanceof Error ? cause.message : 'No fue posible contactar Gemini.');
    }
  };
  return {
    async requestHtmlDocument(request, signal) {
      const { composeNativeHtmlPrompt, extractHtmlDocument } = await import('../generation/nativeHtmlPrompt');
      const transmittedPrompt = composeNativeHtmlPrompt(request.prompt);
      const temperature = 0.82;
      const responseMimeType = 'text/plain';
      const data = await call(config.textModel, {
        contents: [{ parts: [{ text: transmittedPrompt }] }],
        generationConfig: { temperature, maxOutputTokens: 16384, responseMimeType }
      }, signal);
      const candidate = data?.candidates?.[0];
      if (!candidate?.content?.parts?.length || candidate.finishReason === 'MAX_TOKENS') throw error('TEXT_MODEL_ERROR', `Gemini (${config.textModel}) devolvió una respuesta HTML incompleta.`);
      const rawModelText = candidate.content.parts.map((part: { text?: string }) => part.text || '').join('');
      const extractedHtml = extractHtmlDocument(rawModelText);
      if (!extractedHtml) throw error('TEXT_MODEL_ERROR', `Gemini (${config.textModel}) no devolvió HTML.`);
      return { transmittedPrompt, rawModelText, extractedHtml, model: config.textModel, temperature, responseMimeType };
    },
    async requestCreativeProposalV2(request, signal) {
      const parts: Array<Record<string, unknown>> = [{ text: request.prompt }];
      for (const reference of request.references || []) parts.push({ inlineData: { mimeType: reference.mimeType, data: reference.data } });
      const models = Array.from(new Set([config.textModel, ...(config.fallbackTextModels || DEFAULT_TEXT_FALLBACKS)])).filter(Boolean);
      let lastError: unknown;
      for (let index = 0; index < models.length; index++) {
        try {
          const data = await call(models[index], {
            contents: [{ parts }],
            generationConfig: { temperature: 0.82, maxOutputTokens: 8192, responseMimeType: 'application/json' }
          }, signal);
          const candidate = data?.candidates?.[0];
          if (!candidate?.content?.parts?.length || candidate.finishReason === 'MAX_TOKENS') throw error('TEXT_MODEL_ERROR', `Gemini (${models[index]}) devolvió una propuesta v2 incompleta.`);
          const text = candidate.content.parts.map((part: { text?: string }) => part.text || '').join('').trim();
          let parsed: unknown;
          try { parsed = JSON.parse(text); } catch { throw error('TEXT_MODEL_ERROR', `Gemini (${models[index]}) no devolvió JSON v2 válido.`); }
          if (!parsed || typeof parsed !== 'object' || !('contentArchitecture' in parsed) || !('artDirection' in parsed)) throw error('INVALID_BLUEPRINT', 'La propuesta debe incluir contentArchitecture y artDirection.');
          return parsed as CreativeProposalV2;
        } catch (cause: any) {
          lastError = cause;
          if (cause.code === 'CANCELLED' || cause.code === 'INVALID_API_KEY' || cause.code === 'MISSING_API_KEY') throw cause;
          if (index < models.length - 1) {
            console.warn(`[GeminiGateway] Propuesta V2 falló en '${models[index]}'. Probando '${models[index + 1]}'.`);
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        }
      }
      throw (lastError as GenerationError) || error('TEXT_MODEL_ERROR', 'Ningún modelo pudo proponer el Blueprint V2.');
    },
    async requestBlueprint(request, signal) {
      const parts: Array<Record<string, unknown>> = [{ text: request.prompt }];
      for (const reference of request.references || []) parts.push({ inlineData: { mimeType: reference.mimeType, data: reference.data } });

      const textCandidates = Array.from(new Set([
        config.textModel,
        ...(config.fallbackTextModels || DEFAULT_TEXT_FALLBACKS)
      ])).filter(Boolean);

      let lastError: unknown;

      for (let i = 0; i < textCandidates.length; i++) {
        const model = textCandidates[i];
        try {
          const data = await call(model, {
            contents: [{ parts }],
            generationConfig: {
              temperature: 0.75,
              maxOutputTokens: 8192,
              responseMimeType: 'application/json',
              responseSchema: LANDING_BLUEPRINT_SCHEMA
            }
          }, signal);

          const candidate = data?.candidates?.[0];
          if (!candidate?.content?.parts?.length || candidate.finishReason === 'MAX_TOKENS') {
            throw error('TEXT_MODEL_ERROR', `Gemini (${model}) devolvió una respuesta incompleta.`);
          }
          const text = candidate.content.parts.map((part: { text?: string }) => part.text || '').join('').trim();
          let parsed: unknown;
          try {
            parsed = JSON.parse(text);
          } catch {
            throw error('TEXT_MODEL_ERROR', `Gemini (${model}) no devolvió JSON válido.`);
          }
          const sanitized = sanitizeBlueprint(parsed, request.activeTechniqueIds);
          const result = validateBlueprint(sanitized, request.activeTechniqueIds);
          if (!result.ok) {
            throw error('INVALID_BLUEPRINT', result.issues.map(issue => `${issue.path}: ${issue.message}`).join(' '));
          }
          return result.value;
        } catch (cause: any) {
          lastError = cause;
          if (cause.code === 'CANCELLED' || cause.code === 'INVALID_API_KEY' || cause.code === 'MISSING_API_KEY') {
            throw cause;
          }
          if (i < textCandidates.length - 1) {
            console.warn(`[GeminiGateway] Modelo '${model}' falló (${cause.message}). Probando con '${textCandidates[i + 1]}'...`);
            // Breve pausa para descongestión
            await new Promise(resolve => setTimeout(resolve, 500));
            continue;
          }
        }
      }

      throw (lastError as GenerationError) || error('TEXT_MODEL_ERROR', 'Ningún modelo del harness de Gemini pudo responder.');
    },
    async requestHeroImage(prompt, references, signal) {
      const parts: Array<Record<string, unknown>> = [{ text: prompt }];
      for (const reference of references || []) parts.push({ inlineData: { mimeType: reference.mimeType, data: reference.data } });

      const imageCandidates = Array.from(new Set([
        config.imageModel,
        ...(config.fallbackImageModels || DEFAULT_IMAGE_FALLBACKS)
      ])).filter(Boolean);

      let lastError: unknown;

      for (let i = 0; i < imageCandidates.length; i++) {
        const model = imageCandidates[i];
        try {
          const data = await call(model, { contents: [{ parts }], generationConfig: { responseModalities: ['IMAGE'] } }, signal, 'image');
          const part = data?.candidates?.flatMap((candidate: any) => candidate.content?.parts || []).find((item: any) => item.inlineData?.data);
          if (!part) throw error('IMAGE_MODEL_ERROR', `Gemini (${model}) no devolvió un activo de imagen.`);
          return { mimeType: part.inlineData.mimeType || 'image/png', data: part.inlineData.data };
        } catch (cause: any) {
          lastError = cause;
          if (cause.code === 'CANCELLED' || cause.code === 'INVALID_API_KEY' || cause.code === 'MISSING_API_KEY') {
            throw cause;
          }
          if (i < imageCandidates.length - 1) {
            console.warn(`[GeminiGateway] Modelo de imagen '${model}' falló (${cause.message}). Probando con '${imageCandidates[i + 1]}'...`);
            continue;
          }
        }
      }

      throw (lastError as GenerationError) || error('IMAGE_MODEL_ERROR', 'Ningún modelo de imagen de Gemini pudo responder.');
    },
    async requestPromptSynthesis(request, signal) {
      const { brief, techniqueDirectives, seed } = request;
      const metaPrompt = [
        'Actúa como Director Creativo Ejecutivo y Estratega de Conversión de Silicon Valley.',
        'Tu misión es redactar el PROMPT MAESTRO DEFINITIVO (SUPER PRO) que se enviará a una IA para construir una landing page de clase mundial.',
        '',
        'DATOS DE LA MARCA Y MERCADO:',
        `• Marca: ${brief.brandName || 'Marca confidencial'}`,
        `• Sector/Industria: ${brief.industry || 'Tecnología e innovación'}`,
        `• Propuesta de valor: ${brief.valueProposition || 'Solución innovadora sin fricción'}`,
        `• Audiencia objetivo: ${brief.targetAudience || 'Usuarios y profesionales exigentes'}`,
        `• Personalidad y tono: ${brief.brandPersonality || 'Audaz, innovadora'} (${brief.toneOfVoice || 'Directo, convincente, sin rodeos'})`,
        `• CTA Principal: ${brief.primaryAction || 'Empezar ahora'}`,
        `• Semilla SSoT: ${seed}`,
        '',
        'DIRECTIVAS ESTRATÉGICAS Y TÉCNICAS A INTEGRAR:',
        techniqueDirectives.length > 0
          ? techniqueDirectives.map(d => `• ${d}`).join('\n')
          : '• Enfoque de alta conversión, jerarquía editorial y diseño sustractivo.',
        '',
        'ESTRUCTURA OBLIGATORIA DEL PROMPT MAESTRO QUE DEBES REDACTAR:',
        'El prompt que generes debe estar redactado en español y tener estas 4 secciones densas y completas:',
        '1. OBJETIVO Y POSICIONAMIENTO RADICAL: Define el rol de la IA, el dolor visceral del cliente en el sector y la propuesta que destruye la alternativa mediocre.',
        '2. ARQUITECTURA DE CONTENIDO Y COPYWRITING: Detalla con precisión qué debe contener cada una de las secciones (Hero con titular demoledor, Features con soluciones concretas, Proof con números/métricas cuantitativas audaces, FAQ desmantelando objeciones reales, y CTA con microcopy de tranquilidad).',
        '3. DIRECCIÓN DE ARTE Y AESTHETICS: Especifica la personalidad visual (arquetipo de layout, paleta de colores cromática adecuada al sector, contraste tipográfico y ritmo de lectura).',
        '4. RESTRICCIONES TÉCNICAS: Cero dependencias externas, compilación nativa en HTML5, CSS y JS embebidos, sin clichés de IA.',
        '',
        'REGLAS DE SALIDA:',
        '- DEVUELVE ÚNICAMENTE EL TEXTO DEL PROMPT MAESTRO COMPLETO. No uses intros, ni saludos, ni comentarios.',
        '- NUNCA DEJES EL PROMPT INCOMPLETO NI CORTADO A LA MITAD; concluye todas las secciones con total solidez.'
      ].join('\n');

      const textCandidates = Array.from(new Set([
        config.textModel,
        ...(config.fallbackTextModels || DEFAULT_TEXT_FALLBACKS)
      ])).filter(Boolean);

      let lastError: unknown;

      for (let i = 0; i < textCandidates.length; i++) {
        const model = textCandidates[i];
        try {
          const data = await call(model, {
            contents: [{ parts: [{ text: metaPrompt }] }],
            generationConfig: {
              temperature: 0.82,
              maxOutputTokens: 8192
            }
          }, signal);

          const candidate = data?.candidates?.[0];
          if (!candidate?.content?.parts?.length) {
            throw error('TEXT_MODEL_ERROR', `Gemini (${model}) devolvió una respuesta vacía al sintetizar el prompt.`);
          }
          const text = candidate.content.parts.map((p: { text?: string }) => p.text || '').join('').trim();
          if (!text) {
            throw error('TEXT_MODEL_ERROR', `Gemini (${model}) no generó texto para el prompt.`);
          }
          return text;
        } catch (cause: any) {
          lastError = cause;
          if (cause.code === 'CANCELLED' || cause.code === 'INVALID_API_KEY' || cause.code === 'MISSING_API_KEY') {
            throw cause;
          }
          if (i < textCandidates.length - 1) {
            console.warn(`[GeminiGateway] Modelo '${model}' falló al sintetizar prompt (${cause.message}). Probando con '${textCandidates[i + 1]}'...`);
            continue;
          }
        }
      }

      throw (lastError as GenerationError) || error('TEXT_MODEL_ERROR', 'No fue posible generar el prompt con IA.');
    },
    async testConnection(signal) {
      const start = performance.now();
      try {
        requireKey();
        const response = await fetch(`${base}?key=${encodeURIComponent(config.apiKey)}`, {
          method: 'GET',
          signal
        });
        if (!response.ok) {
          const body = await response.text();
          throw error(mapStatus(response.status), `Gemini respondió ${response.status}: ${body.slice(0, 160)}`, response.status);
        }
        const data = await response.json();
        const availableModels: string[] = (data.models || []).map((m: any) => m.name ? m.name.replace(/^models\//, '') : '');
        const latencyMs = Math.round(performance.now() - start);
        return {
          ok: true,
          textModel: config.textModel,
          imageModel: config.imageModel,
          latencyMs,
          availableModels
        };
      } catch (cause: any) {
        const latencyMs = Math.round(performance.now() - start);
        return {
          ok: false,
          textModel: config.textModel,
          imageModel: config.imageModel,
          latencyMs,
          error: cause instanceof Error ? cause.message : 'Error desconocido de conexión'
        };
      }
    }
  };
}

import { auditLanding } from './auditEngine';
import { renderLandingDocument } from './nativeRenderer';
import { createProceduralBlueprint } from './proceduralBlueprint';
import { createProceduralVisual, makeVisualCacheKey, normalizeGeneratedImage, type ImageCodec, type VisualAssetCache } from './visualAssets';
import type { GeneratedVisualAsset, GenerationRecord, GenerationRequest, GenerationStage, LandingBlueprint } from './types';

interface Gateway { requestBlueprint(request: { prompt: string; activeTechniqueIds: number[]; references?: Array<{ mimeType: string; data: string }> }, signal?: AbortSignal): Promise<LandingBlueprint>; requestHeroImage(prompt: string, references?: Array<{ mimeType: string; data: string }>, signal?: AbortSignal): Promise<{ mimeType: string; data: string }> }
export interface GenerationPipelineDependencies { gateway: Gateway; cache: VisualAssetCache; codec: ImageCodec; now?: () => string }
export interface GenerationListeners { onStage?: (stage: GenerationStage) => void; onError?: (error: Error) => void; onComplete?: (record: GenerationRecord) => void }

function fallbackAsset(request: GenerationRequest, blueprint: LandingBlueprint): GeneratedVisualAsset {
  const asset = createProceduralVisual({ seed: request.ssotSeed, accent: blueprint.designTokens.accent, background: blueprint.designTokens.background, alt: blueprint.visualDirection.alt });
  return { ...asset, source: 'fallback-procedural' };
}

export function createGenerationPipeline(deps: GenerationPipelineDependencies) {
  let activeController: AbortController | undefined;
  let runId = 0;
  const run = async (request: GenerationRequest, listeners: GenerationListeners = {}): Promise<GenerationRecord> => {
    activeController?.abort();
    const controller = new AbortController();
    activeController = controller;
    const currentRun = ++runId;
    const emit = (stage: GenerationStage) => listeners.onStage?.(stage);
    try {
      const mode = request.executionMode || (request.imageMode === 'generated' && request.activeTechniqueIds.includes(4) ? 'full' : 'combined_techniques');
      const reference = request.visualReference ? { mimeType: request.visualReference.mimeType, data: request.visualReference.dataUrl.split(',')[1] || request.visualReference.dataUrl } : undefined;

      let blueprint: LandingBlueprint;
      let blueprintSource: 'gemini' | 'procedural' = 'procedural';
      let textCalls = 0;

      if (mode === 'image_only' && request.existingBlueprint) {
        blueprint = request.existingBlueprint;
        blueprintSource = 'gemini';
        textCalls = 0;
      } else if (mode === 'procedural') {
        emit('generating_blueprint');
        blueprint = createProceduralBlueprint(request);
        blueprintSource = 'procedural';
        textCalls = 0;
      } else {
        emit('generating_blueprint');
        try {
          blueprint = await deps.gateway.requestBlueprint({ prompt: request.executedPrompt, activeTechniqueIds: request.activeTechniqueIds, references: reference ? [reference] : undefined }, controller.signal);
          blueprintSource = 'gemini';
          textCalls = 1;
        } catch (cause) {
          if (controller.signal.aborted) throw cause;
          if (!request.allowFallback) {
            throw cause;
          }
          console.warn('[GenerationPipeline] Modelos de IA saturados. Activando generador de contingencia SSoT procedimental...', cause);
          blueprint = createProceduralBlueprint(request);
          blueprintSource = 'procedural';
          textCalls = 0;
        }
      }

      if (currentRun !== runId) throw new Error('Superseded generation');
      emit('generating_visual');
      let visual: GeneratedVisualAsset;
      let imageCalls = 0;

      const wantsImage = mode !== 'seed_only' && mode !== 'procedural' && (mode === 'image_only' || (request.imageMode === 'generated' && request.activeTechniqueIds.includes(4)));

      if (!wantsImage) {
        visual = createProceduralVisual({ seed: request.ssotSeed, accent: blueprint.designTokens.accent, background: blueprint.designTokens.background, alt: blueprint.visualDirection.alt });
      } else {
        const cacheKey = await makeVisualCacheKey({ prompt: blueprint.visualDirection.imagePrompt, seed: request.ssotSeed, referenceHash: request.visualReference?.dataUrl.slice(0, 64) });
        const cached = await deps.cache.get(cacheKey);
        if (cached) {
          visual = cached;
          imageCalls = 0;
        } else {
          try {
            const raw = await deps.gateway.requestHeroImage(blueprint.visualDirection.imagePrompt, reference ? [reference] : undefined, controller.signal);
            const created = await normalizeGeneratedImage(raw, deps.codec, cacheKey, blueprint.visualDirection.alt);
            await deps.cache.put(created);
            visual = created;
            imageCalls = 1;
          } catch (cause) {
            if (controller.signal.aborted) throw cause;
            if (!request.allowFallback) {
              throw cause;
            }
            visual = fallbackAsset(request, blueprint);
            imageCalls = 0;
          }
        }
      }

      if (currentRun !== runId) throw new Error('Superseded generation');
      emit('compiling');
      const htmlCode = renderLandingDocument({ blueprint, visual, capabilities: request.capabilities, activeTechniqueIds: request.activeTechniqueIds, ssot: { seed: request.ssotSeed } });
      emit('auditing');
      const audit = auditLanding({ html: htmlCode, blueprint, activeTechniqueIds: request.activeTechniqueIds, visualSource: visual.source });
      const record: GenerationRecord = {
        id: `generation-${Date.now()}`,
        request,
        blueprint,
        blueprintSource,
        htmlCode,
        visual,
        audit,
        callsUsed: { textCalls, imageCalls, totalCalls: textCalls + imageCalls },
        createdAt: (deps.now || (() => new Date().toISOString()))(),
        collection: 'draft'
      };
      emit('complete');
      listeners.onComplete?.(record);
      return record;
    } catch (cause) {
      const error = cause instanceof Error ? cause : new Error('Generation failed');
      emit('failed');
      listeners.onError?.(error);
      throw error;
    }
  };
  return { run, cancel: () => activeController?.abort() };
}

import { auditLanding } from './auditEngine';
import { renderLandingDocument } from './nativeRenderer';
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
      emit('generating_blueprint');
      const reference = request.visualReference ? { mimeType: request.visualReference.mimeType, data: request.visualReference.dataUrl.split(',')[1] || request.visualReference.dataUrl } : undefined;
      const blueprint = await deps.gateway.requestBlueprint({ prompt: request.executedPrompt, activeTechniqueIds: request.activeTechniqueIds, references: reference ? [reference] : undefined }, controller.signal);
      if (currentRun !== runId) throw new Error('Superseded generation');
      emit('generating_visual');
      let visual: GeneratedVisualAsset;
      const wantsImage = request.imageMode === 'generated' && request.activeTechniqueIds.includes(4);
      if (!wantsImage) {
        visual = createProceduralVisual({ seed: request.ssotSeed, accent: blueprint.designTokens.accent, background: blueprint.designTokens.background, alt: blueprint.visualDirection.alt });
      } else {
        const cacheKey = await makeVisualCacheKey({ prompt: blueprint.visualDirection.imagePrompt, seed: request.ssotSeed, referenceHash: request.visualReference?.dataUrl.slice(0, 64) });
        visual = await deps.cache.get(cacheKey) || await (async () => {
          try {
            const raw = await deps.gateway.requestHeroImage(blueprint.visualDirection.imagePrompt, reference ? [reference] : undefined, controller.signal);
            const created = await normalizeGeneratedImage(raw, deps.codec, cacheKey, blueprint.visualDirection.alt);
            await deps.cache.put(created);
            return created;
          } catch (cause) {
            if (controller.signal.aborted) throw cause;
            return fallbackAsset(request, blueprint);
          }
        })();
      }
      if (currentRun !== runId) throw new Error('Superseded generation');
      emit('compiling');
      const htmlCode = renderLandingDocument({ blueprint, visual, capabilities: request.capabilities, activeTechniqueIds: request.activeTechniqueIds, ssot: { seed: request.ssotSeed } });
      emit('auditing');
      const audit = auditLanding({ html: htmlCode, blueprint, activeTechniqueIds: request.activeTechniqueIds, visualSource: visual.source });
      const record: GenerationRecord = { id: `generation-${Date.now()}`, request, blueprint, htmlCode, visual, audit, callsUsed: { textCalls: 1, imageCalls: wantsImage && !visual.cacheHit ? 1 : 0 }, createdAt: (deps.now || (() => new Date().toISOString()))(), collection: 'draft' };
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

import type { GeminiGateway } from '../services/geminiGateway';
import type { ImageCodec, VisualAssetCache } from './visualAssets';
import { makeVisualCacheKey, normalizeGeneratedImage, createProceduralVisual } from './visualAssets';
import type { GeneratedVisualAsset, GenerationRecord, GenerationRequest, GenerationStage } from './types';
import { composeArchitecturePromptV2, deriveStyleSeedFromBrief } from './promptComposerV2';
import { briefWithExplicitPromptColors, completeCreativeProposal, createFallbackContentArchitecture, sanitizeCreativeProposal, type CreativeProposalV2 } from '../design/creativeProposalV2';
import { interpretArtDirection } from '../design/artDirectionEngine';
import { adaptBlueprintV1ToV2 } from '../design/blueprintV1Adapter';
import { validateBlueprintV2 } from '../design/blueprintV2Schema';
import { projectBlueprintV2ToV1 } from '../design/blueprintV2Projection';
import { renderBlueprintV2 } from '../render/primitiveRenderer';
import { runSubtractiveDesignPass } from '../design/subtractiveDesignPass';
import { auditBlueprintV2 } from '../audit/auditEngineV2';
import { auditLanding } from './auditEngine';
import { createStructureFingerprint } from '../diversity/structureFingerprint';
import type { FingerprintCandidate } from '../diversity/similarityDetector';
import { repairCompositionForNovelty } from '../diversity/compositionRepair';
import { repairResponsiveComposition } from '../composition/repairEngine';
import { validateGeneratedDocument } from './documentValidator';
import { TECHNIQUE_CATALOG } from './techniqueCatalog';

export interface GenerationPipelineV2Dependencies {
  gateway: Pick<GeminiGateway, 'requestCreativeProposalV2' | 'requestHeroImage' | 'requestHtmlDocument'>;
  cache: VisualAssetCache;
  codec: ImageCodec;
  recentStructures?: () => Promise<FingerprintCandidate[]>;
  similarityThreshold?: number;
  now?: () => string;
}

export interface GenerationPipelineV2Listeners { onStage?: (stage: GenerationStage) => void; onError?: (error: Error) => void; onComplete?: (record: GenerationRecord) => void }

function proceduralProposal(brief: GenerationRequest['brief'], styleSeed: string): CreativeProposalV2 {
  return {
    strategy: { brandName: brief.brandName, industry: brief.industry, audience: brief.targetAudience, promise: brief.valueProposition, objective: brief.valueProposition, claims: [] },
    artDirection: interpretArtDirection({ styleSeed }),
    contentArchitecture: createFallbackContentArchitecture(brief),
    visualStrategy: { mode: 'procedural-geometry', prompt: `${styleSeed}; ${brief.valueProposition}`, alt: `Composición procedural para ${brief.brandName}`, placement: 'region-led' }
  };
}

function completeProceduralBrief(brief: GenerationRequest['brief']): GenerationRequest['brief'] {
  return {
    ...brief,
    brandName: brief.brandName.trim() || 'La marca',
    industry: brief.industry.trim() || 'General',
    valueProposition: brief.valueProposition.trim() || 'Una propuesta clara para el trabajo diario',
    targetAudience: brief.targetAudience.trim() || 'Personas que necesitan tomar decisiones',
    brandPersonality: brief.brandPersonality.trim() || 'Clara',
    toneOfVoice: brief.toneOfVoice.trim() || 'Directo',
    primaryAction: brief.primaryAction.trim() || 'Conocer más'
  };
}

export function createGenerationPipelineV2(deps: GenerationPipelineV2Dependencies) {
  let activeController: AbortController | undefined;
  let runId = 0;
  return {
    async run(request: GenerationRequest, listeners: GenerationPipelineV2Listeners = {}): Promise<GenerationRecord> {
      activeController?.abort();
      const controller = new AbortController(); activeController = controller;
      const thisRun = ++runId;
      const emit = (stage: GenerationStage) => listeners.onStage?.(stage);
      const entropySeed = request.ssotSeed || 'entrospec-default-entropy';
        const styleSeed = request.styleSeed?.trim() || deriveStyleSeedFromBrief(request.brief);
      try {
        emit('building_prompt');
        if (request.executionMode === 'ai_native_html') {
          emit('generating_blueprint');
          const nativeResult = await deps.gateway.requestHtmlDocument({ prompt: request.executedPrompt }, controller.signal);
          if (thisRun !== runId) throw new Error('Superseded generation');
          const documentReport = validateGeneratedDocument(nativeResult.extractedHtml);
          if (documentReport.blockingIssues.length) throw new Error(`Documento HTML inválido: ${documentReport.blockingIssues.map(issue => issue.message).join(' ')}`);
          emit('compiling');
          emit('auditing');
          const htmlCode = nativeResult.extractedHtml;
          const brandName = request.brief.brandName || 'Documento AI Native';
          const blueprint = { metadata: { title: brandName }, brandInterpretation: { brandName } } as GenerationRecord['blueprint'];
          const neutralVisual: GeneratedVisualAsset = { cacheKey: 'ai-native-html', source: 'generated', mimeType: 'image/svg+xml', dataUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E', alt: '', byteLength: 0 };
          const score = { distinctiveness: 0, usabilityUx: 0, conversionCro: 0, stackFidelity: 0, average: 0 };
          const record: GenerationRecord = {
            id: `generation-${(deps.now ?? (() => new Date().toISOString()))().replace(/[^0-9]/g, '')}`,
            request: { ...request, architectureVersion: 2 }, blueprint, blueprintSource: 'gemini', htmlCode, visual: neutralVisual,
            audit: { passesBank: false, scores: score, subtractiveDiagnosis: 'Auditoría pendiente de DOM real.', strengths: [], refactorSuggested: '', evidence: [], blockers: documentReport.warnings.map(issue => issue.message) },
            callsUsed: { textCalls: 1, imageCalls: 0, totalCalls: 1 },
            requestDiagnostics: { ...nativeResult, executionMode: 'ai_native_html' },
            techniqueTrace: TECHNIQUE_CATALOG.map(def => { const active = request.activeTechniqueIds.includes(def.id); const injectedDirectives = def.promptDirectives.filter(directive => request.executedPrompt.includes(directive)); return { id: def.id, technique: def.title, active, injected: active && injectedDirectives.length === def.promptDirectives.length, audited: false, evidence: injectedDirectives.length ? `En prompt: ${injectedDirectives.join(' ')}` : 'Sin evidencia trazable.', directive: def.promptDirectives.join(' ') }; }),
            createdAt: (deps.now ?? (() => new Date().toISOString()))(), collection: 'draft'
          };
          emit('complete'); listeners.onComplete?.(record); return record;
        }
        const recent = await deps.recentStructures?.() ?? [];
        const effectiveBrief = briefWithExplicitPromptColors(request.brief, request.executedPrompt);
        const proceduralBrief = completeProceduralBrief(effectiveBrief);
        const recentSummaries = recent.slice(0, 8).map(item => `${item.fingerprint.compositionFamily}: ${item.fingerprint.regionOrder.slice(0, 5).join(' → ')}`);
        const promptBundle = composeArchitecturePromptV2({ brief: request.brief, styleSeed, entropySeed, noveltyBudget: request.noveltyBudget ?? 0.5, creativeRisk: request.creativeRisk ?? 'moderate', recentSummaries, activeTechniqueIds: request.activeTechniqueIds });
        const references = request.visualReference ? [{ mimeType: request.visualReference.mimeType, data: request.visualReference.dataUrl.split(',')[1] || request.visualReference.dataUrl }] : undefined;
        let blueprintV2;
        let legacyBlueprint;
        let blueprintSource: 'gemini' | 'procedural' = 'gemini';
        let textCalls = 0;
        if (request.executionMode === 'image_only' && request.existingBlueprint) {
          legacyBlueprint = request.existingBlueprint;
          blueprintV2 = adaptBlueprintV1ToV2(legacyBlueprint, { styleSeed, entropySeed, noveltyBudget: request.noveltyBudget, creativeRisk: request.creativeRisk });
        } else if (request.executionMode === 'procedural') {
          emit('generating_blueprint');
          blueprintV2 = completeCreativeProposal({ brief: proceduralBrief, styleSeed, entropySeed, noveltyBudget: request.noveltyBudget, creativeRisk: request.creativeRisk, proposal: proceduralProposal(proceduralBrief, styleSeed) });
          blueprintSource = 'procedural';
        } else {
          emit('generating_blueprint');
          try {
            const executedPrompt = request.executedPrompt?.trim() ?? '';
            const fullPrompt = executedPrompt.includes('SEPARA propósito comercial')
              ? executedPrompt
              : `${executedPrompt ? `Preferencias creativas del usuario (contexto; no elijas estructura fija):\n${executedPrompt}\n\n` : ''}${promptBundle.prompt}`;
            const proposal = await deps.gateway.requestCreativeProposalV2({ prompt: fullPrompt, references }, controller.signal);
            emit('validating_blueprint');
            const sanitized = sanitizeCreativeProposal(proposal, effectiveBrief);
            const userDirectedProposal = request.styleSeed?.trim()
              ? { ...sanitized, artDirection: { ...sanitized.artDirection, styleSeed: request.styleSeed.trim() } }
              : sanitized;
            blueprintV2 = completeCreativeProposal({ brief: effectiveBrief, styleSeed, entropySeed, noveltyBudget: request.noveltyBudget, creativeRisk: request.creativeRisk, proposal: userDirectedProposal });
            textCalls = 1;
          } catch (cause) {
            if (controller.signal.aborted || !request.allowFallback) throw cause;
            blueprintV2 = completeCreativeProposal({ brief: effectiveBrief, styleSeed, entropySeed, noveltyBudget: request.noveltyBudget, creativeRisk: request.creativeRisk, proposal: proceduralProposal(effectiveBrief, styleSeed) });
            blueprintSource = 'procedural';
          }
        }
        if (thisRun !== runId) throw new Error('Superseded generation');
        const validation = validateBlueprintV2(blueprintV2);
        if (!validation.ok) throw new Error(`Blueprint V2 inválido: ${validation.issues.map(issue => `${issue.path}: ${issue.message}`).join('; ')}`);
        blueprintV2 = validation.value;
        const noveltyRepair = repairCompositionForNovelty(blueprintV2, recent, deps.similarityThreshold ?? 0.82);
        blueprintV2 = noveltyRepair.blueprint;
        emit('generating_visual');
        let visual: GeneratedVisualAsset;
        let imageCalls = 0;
        const wantsGeneratedImage = request.executionMode !== 'seed_only' && request.executionMode !== 'procedural' && request.imageMode === 'generated' && request.activeTechniqueIds.includes(4);
        if (!wantsGeneratedImage) {
          visual = createProceduralVisual({ seed: entropySeed, accent: blueprintV2.visualTokens.accent, background: blueprintV2.visualTokens.background, alt: blueprintV2.visualStrategy.alt });
        } else {
          const cacheKey = await makeVisualCacheKey({ prompt: blueprintV2.visualStrategy.prompt, seed: entropySeed, referenceHash: request.visualReference?.dataUrl.slice(0, 64) });
          const cached = await deps.cache.get(cacheKey);
          if (cached) visual = cached;
          else {
            try {
              const raw = await deps.gateway.requestHeroImage(blueprintV2.visualStrategy.prompt, references, controller.signal);
              visual = await normalizeGeneratedImage(raw, deps.codec, cacheKey, blueprintV2.visualStrategy.alt);
              await deps.cache.put(visual); imageCalls = 1;
            } catch (cause) {
              if (controller.signal.aborted || !request.allowFallback) throw cause;
              visual = { ...createProceduralVisual({ seed: entropySeed, accent: blueprintV2.visualTokens.accent, background: blueprintV2.visualTokens.background, alt: blueprintV2.visualStrategy.alt }), source: 'fallback-procedural' };
            }
          }
        }
        if (thisRun !== runId) throw new Error('Superseded generation');
        emit('compiling');
        const subtractive = runSubtractiveDesignPass(blueprintV2);
        blueprintV2 = { ...subtractive.blueprint, spatialComposition: { ...subtractive.blueprint.spatialComposition, regions: subtractive.blueprint.regions } };
        blueprintV2 = repairResponsiveComposition(blueprintV2).blueprint;
        const htmlCode = renderBlueprintV2({ blueprint: blueprintV2, visualDataUrl: visual.dataUrl, visualMimeType: visual.mimeType, visualAlt: visual.alt });
        emit('auditing');
        const auditV2 = auditBlueprintV2({ blueprint: blueprintV2, html: htmlCode, recent, similarityThreshold: deps.similarityThreshold });
        legacyBlueprint = legacyBlueprint ?? projectBlueprintV2ToV1(blueprintV2);
        const legacyAudit = auditLanding({ html: htmlCode, blueprint: legacyBlueprint, activeTechniqueIds: request.activeTechniqueIds, visualSource: visual.source });
        const record: GenerationRecord = {
          schemaVersion: 2,
          id: `generation-${(deps.now ?? (() => new Date().toISOString()))().replace(/[^0-9]/g, '')}`,
          request: { ...request, architectureVersion: 2, styleSeed, ssotSeed: entropySeed },
          blueprint: legacyBlueprint,
          blueprintV2,
          blueprintSource,
          htmlCode,
          visual,
          audit: legacyAudit,
          auditV2,
          structureFingerprint: createStructureFingerprint(blueprintV2),
          engineVersion: blueprintV2.metadata.engineVersion,
          grammarVersion: blueprintV2.metadata.grammarVersion,
          seedDerivation: { styleSeed, entropySeed, compositionSeed: blueprintV2.diversityMetadata.compositionSeed, seedVersion: blueprintV2.metadata.seedVersion, subSeeds: blueprintV2.diversityMetadata.seedStreams },
          compositionRepair: { initialSimilarity: noveltyRepair.initialSimilarity, finalSimilarity: noveltyRepair.finalSimilarity, attempts: noveltyRepair.attempts, repaired: noveltyRepair.repaired },
          techniqueTrace: TECHNIQUE_CATALOG.map(def => { const active = request.activeTechniqueIds.includes(def.id); const evidence = legacyAudit.evidence.find(item => item.techniqueId === def.id); const injected = active && request.executionMode !== 'procedural' && def.compatibleModes.includes((request.executionMode ?? 'combined_techniques') as any); return { id: def.id, technique: def.title, active, injected, audited: Boolean(evidence && evidence.status !== 'not_requested'), evidence: evidence?.summary ?? (injected ? `En prompt: ${def.promptDirectives.join(' ')}` : 'Sin evidencia verificable.'), directive: def.promptDirectives.join(' ') }; }),
          callsUsed: { textCalls, imageCalls, totalCalls: textCalls + imageCalls },
          createdAt: (deps.now ?? (() => new Date().toISOString()))(),
          collection: 'draft'
        };
        emit('complete'); listeners.onComplete?.(record); return record;
      } catch (cause) {
        const error = cause instanceof Error ? cause : new Error('Generation V2 failed');
        emit('failed'); listeners.onError?.(error); throw error;
      }
    },
    cancel() { activeController?.abort(); }
  };
}

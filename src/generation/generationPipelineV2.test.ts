import { describe, expect, it, vi } from 'vitest';
import type { BrandBrief, GenerationRequest } from './types';
import { createGenerationPipelineV2 } from './generationPipelineV2';
import { createFallbackContentArchitecture } from '../design/creativeProposalV2';
import { createStructureFingerprint } from '../diversity/structureFingerprint';
import * as primitiveRenderer from '../render/primitiveRenderer';

const brief: BrandBrief = { brandName: 'Northline', industry: 'Scientific systems', valueProposition: 'Evidence-led decisions', targetAudience: 'Operations teams', brandPersonality: 'Precise', toneOfVoice: 'Direct', primaryAction: 'Explore the system' };
const proposal = {
  strategy: { brandName: brief.brandName, industry: brief.industry, audience: brief.targetAudience, promise: brief.valueProposition, objective: 'Make verified evidence actionable', claims: [] },
  artDirection: { compositionGrammar: 'swiss', surfaceLanguage: 'flat', artDirection: 'scientific', ornamentation: 'patent-illustration', density: 'restrained', motionLanguage: 'editorial', styleSeed: 'Swiss scientific atlas', rationale: 'Precise grid and annotated evidence.' },
  contentArchitecture: createFallbackContentArchitecture(brief),
  visualStrategy: { mode: 'annotated-diagram', prompt: 'Scientific diagram, cropped and annotated', alt: 'Annotated diagram', placement: 'proof-field', mediaSequence: ['diagram'] }
};

function createPipeline(recentStructures?: () => Promise<any[]>) {
  const gateway = { requestCreativeProposalV2: vi.fn().mockResolvedValue(proposal), requestHeroImage: vi.fn(), requestHtmlDocument: vi.fn() };
  const pipeline = createGenerationPipelineV2({ gateway: gateway as any, cache: { get: vi.fn().mockResolvedValue(undefined), put: vi.fn() }, codec: { compress: vi.fn() }, recentStructures });
  return { pipeline, gateway };
}

function request(entropySeed: string): GenerationRequest {
  return { brief, executedPrompt: 'Create a distinctive spatial composition.', ssotSeed: entropySeed, styleSeed: 'Swiss × scientific atlas', activeTechniqueIds: [1, 3], imageMode: 'procedural', capabilities: ['svg'], architectureVersion: 2, noveltyBudget: 0.75, creativeRisk: 'moderate' };
}

describe('generation pipeline v2', () => {
  it('uses the V2 creative proposal, then composes and renders spatial regions', async () => {
    const { pipeline, gateway } = createPipeline();
    const record = await pipeline.run(request('entropy-alpha'));
    expect(gateway.requestCreativeProposalV2).toHaveBeenCalledTimes(1);
    expect(record.blueprintV2?.schemaVersion).toBe(2);
    expect(record.htmlCode).toContain('data-composition=');
    expect(record.htmlCode).toContain('spatial-region');
    expect(record.auditV2?.dimensions.artDirectionFidelity.score).toBeGreaterThan(0.5);
    expect(record.seedDerivation).toMatchObject({ styleSeed: 'Swiss × scientific atlas', entropySeed: 'entropy-alpha' });
  });

  it('AI Native returns Gemini HTML intact without entering V2 genome or renderer', async () => {
    const html = '<!doctype html><html><head><style>body{background:#FDFBF7;color:#284b3d}</style></head><body><main><h1>Crema</h1></main></body></html>';
    const { pipeline, gateway } = createPipeline();
    gateway.requestHtmlDocument = vi.fn().mockResolvedValue({ transmittedPrompt: 'brief + contract', rawModelText: html, extractedHtml: html, model: 'gemini-test', temperature: 0.82, responseMimeType: 'text/plain' });
    const render = vi.spyOn(primitiveRenderer, 'renderBlueprintV2');
    const result = await pipeline.run({ ...request('native-seed'), executionMode: 'ai_native_html' });
    expect(result.htmlCode).toBe(html);
    expect(result.htmlCode).toContain('#FDFBF7');
    expect(gateway.requestHtmlDocument).toHaveBeenCalledTimes(1);
    expect(gateway.requestCreativeProposalV2).not.toHaveBeenCalled();
    expect(render).not.toHaveBeenCalled();
    expect(result.callsUsed).toEqual({ textCalls: 1, imageCalls: 0, totalCalls: 1 });
    render.mockRestore();
  });

  it('reproduces the same genome and composition for identical seeds', async () => {
    const first = await createPipeline().pipeline.run(request('fixed-entropy'));
    const second = await createPipeline().pipeline.run(request('fixed-entropy'));
    expect(first.blueprintV2?.designGenome).toEqual(second.blueprintV2?.designGenome);
    expect(first.blueprintV2?.spatialComposition).toEqual(second.blueprintV2?.spatialComposition);
    expect(first.htmlCode).toBe(second.htmlCode);
  });

  it('changes structural decisions when entropy seed changes while keeping the style seed', async () => {
    const first = await createPipeline().pipeline.run(request('entropy-A'));
    const second = await createPipeline().pipeline.run(request('entropy-B'));
    expect(first.blueprintV2?.artDirection.styleSeed).toBe(second.blueprintV2?.artDirection.styleSeed);
    expect(first.structureFingerprint).not.toEqual(second.structureFingerprint);
  });

  it('tries spatial-only novelty repair against recent fingerprints', async () => {
    let previous: any;
    const recentStructures = async () => previous ? [{ id: 'prior', fingerprint: createStructureFingerprint(previous.blueprintV2) }] : [];
    const pipeline = createPipeline(recentStructures).pipeline;
    previous = await pipeline.run(request('repeat-seed'));
    const next = await pipeline.run(request('repeat-seed'));
    expect(next.auditV2?.structuralSimilarityScore).toBeLessThan(1);
    expect(next.structureFingerprint).not.toEqual(previous.structureFingerprint);
    expect(next.blueprintV2?.contentArchitecture).toEqual(previous.blueprintV2?.contentArchitecture);
    expect(next.blueprintV2?.strategy).toEqual(previous.blueprintV2?.strategy);
  });

  it('can generate without a Gemini text call in procedural mode', async () => {
    const { pipeline, gateway } = createPipeline();
    const record = await pipeline.run({ ...request('procedural-seed'), executionMode: 'procedural' });
    expect(gateway.requestCreativeProposalV2).not.toHaveBeenCalled();
    expect(gateway.requestHtmlDocument).not.toHaveBeenCalled();
    expect(record.blueprintSource).toBe('procedural');
    expect(record.callsUsed.textCalls).toBe(0);
  });

  it('preserves the exact requested color in procedural rendering over fallback tokens', async () => {
    const result = await createPipeline().pipeline.run({ ...request('explicit-color'), executedPrompt: 'La marca requiere el color explícito #FDFBF7 en el lienzo.', executionMode: 'procedural' });
    expect(result.htmlCode).toContain('#FDFBF7');
    expect(result.htmlCode).not.toContain('#0b0b0b');
  });

  it('uses the V2 procedural architecture as a fallback instead of returning to a V1 template', async () => {
    const gateway = { requestCreativeProposalV2: vi.fn().mockRejectedValue(new Error('provider unavailable')), requestHeroImage: vi.fn() };
    const pipeline = createGenerationPipelineV2({ gateway: gateway as any, cache: { get: vi.fn(), put: vi.fn() }, codec: { compress: vi.fn() } });
    const record = await pipeline.run({ ...request('fallback-seed'), allowFallback: true });
    expect(record.blueprintSource).toBe('procedural');
    expect(record.blueprintV2?.schemaVersion).toBe(2);
    expect(record.blueprintV2?.spatialComposition.regions.length).toBeGreaterThan(2);
    expect(record.callsUsed.textCalls).toBe(0);
  });

  it('uses a V2-aware procedural visual fallback only when explicitly allowed', async () => {
    const gateway = { requestCreativeProposalV2: vi.fn().mockResolvedValue(proposal), requestHeroImage: vi.fn().mockRejectedValue(new Error('image quota')) };
    const pipeline = createGenerationPipelineV2({ gateway: gateway as any, cache: { get: vi.fn().mockResolvedValue(undefined), put: vi.fn() }, codec: { compress: vi.fn() } });
    const record = await pipeline.run({ ...request('visual-fallback-seed'), imageMode: 'generated', activeTechniqueIds: [4], allowFallback: true });
    expect(record.visual.source).toBe('fallback-procedural');
    expect(record.callsUsed.imageCalls).toBe(0);
  });
});

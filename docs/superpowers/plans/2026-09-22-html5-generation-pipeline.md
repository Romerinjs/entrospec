# Verifiable Native HTML5 Generation Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Entrospec's free-form HTML generation and optimistic audit with a local, low-cost pipeline that turns an editable brand prompt into a validated, self-contained HTML5/CSS/vanilla-JS landing page with optional Gemini imagery and auditable technique evidence.

**Architecture:** Gemini produces one schema-constrained creative blueprint rather than executable HTML. A deterministic renderer compiles the blueprint and one cached generated-or-procedural hero asset into a single offline document, then local validators calculate evidence-based scores before the result can enter the curated bank.

**Tech Stack:** React 18, TypeScript 5.7, Vite 6, Tailwind CSS for the Entrospec shell only, Gemini REST API, IndexedDB, Vitest, Testing Library, jsdom, fake-indexeddb, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-22-html5-generation-pipeline-design.md`

## Global Constraints

- Generated output is one self-contained document using only HTML5, embedded native CSS, and embedded vanilla JavaScript.
- Generated output contains no React, Next.js, Tailwind, Three.js, GSAP, Framer Motion, CDN, imports, modules, remote fonts, or runtime network requests.
- Normal construction consumes exactly one text call and zero or one image call.
- Audit, validation, compilation, fallback generation, and cached image reuse consume zero API calls.
- No billable retry or refinement happens without a new explicit user action.
- Image generation is optional and produces at most one compressed WebP asset per construction.
- The application remains local-only; surface a warning that a `VITE_` API key is browser-visible and unsuitable for public deployment.
- A curated-bank record requires an average score of at least 8.5, no blocking failure, a self-contained document, and evidence for every active technique.
- Preserve legacy localStorage projects until a verified IndexedDB migration has succeeded.
- Preserve the existing untracked `.vscode/` directory and unrelated user changes.

## Review Focus

1. **Hostile or unusually long brand copy:** angle brackets, quotes, script fragments, and multi-kilobyte fields must render as text, never execute or break the compiled document. Task 5 owns the regression tests.
2. **Schema-valid but semantically unusable Gemini output:** empty sections, invalid colors, absent active-technique plans, or a CTA without an action must fail blueprint validation with field-level issues. Tasks 1 and 3 own the tests.
3. **Rapid consecutive generations:** starting a second run must abort or supersede the first so a late response cannot replace the latest landing. Task 7 owns the race test.
4. **Repeated image request for the same prompt, seed, and reference:** the second run must use IndexedDB cache and make no image API call. Tasks 4 and 7 own the tests.
5. **Corrupt legacy storage or unavailable IndexedDB:** the app must retain the last in-memory result, report `STORAGE_ERROR`, and never delete the legacy key before a verified write. Task 8 owns the tests.

---

## File Map

### Generation domain

- Create `src/generation/types.ts` — brand, blueprint, evidence, asset, state, and error contracts.
- Create `src/generation/blueprintSchema.ts` — Gemini response schema and semantic validator.
- Create `src/generation/techniqueCatalog.ts` — the eight stable technique definitions.
- Create `src/generation/promptComposer.ts` — visible prompt composition and call estimate.
- Create `src/generation/visualAssets.ts` — generated-image normalization and procedural fallback.
- Create `src/generation/nativeRenderer.ts` — deterministic offline HTML compiler.
- Create `src/generation/documentValidator.ts` — offline/document safety checks.
- Create `src/generation/techniqueValidators.ts` — evidence checks for techniques 1–8.
- Create `src/generation/auditEngine.ts` — evidence-weighted NoveltyBench scores.
- Create `src/generation/generationPipeline.ts` — staged orchestration and cancellation.

### Gemini and storage

- Create `src/services/geminiGateway.ts` — text/image REST calls and typed API failures.
- Modify `src/services/geminiService.ts` — keep compatibility during foundation work, then remove the optimistic audit after App migrates.
- Create `src/storage/entrospecDb.ts` — IndexedDB open/transaction primitives.
- Create `src/storage/projectRepository.ts` — drafts, curated records, asset cache, and migration.

### React shell

- Create `src/components/BrandBriefForm.tsx` — structured brand inputs and file references.
- Create `src/components/OutputContract.tsx` — native-output capabilities and estimated calls.
- Create `src/components/GenerationProgress.tsx` — real pipeline stage and failure status.
- Create `src/components/GenerationInspector.tsx` — blueprint, prompt, visual provenance, and evidence.
- Modify `src/components/PromptViewer.tsx` — editable executed prompt and reset action.
- Modify `src/components/TechniquesSelector.tsx` — preconditions and post-generation status.
- Modify `src/components/SandboxPreview.tsx` — strict sandbox, result state, and curated/draft actions.
- Modify `src/components/NoveltyBenchAudit.tsx` — evidence-based results without fake refactor boosts.
- Modify `src/components/LandingBank.tsx` — async repository data and side-by-side prompt requirement.
- Modify `src/App.tsx` — adopt the pipeline, repository, and new application state.
- Modify `src/types/index.ts` — re-export new contracts during migration.

### Verification and documentation

- Modify `package.json` — test scripts and development-only test dependencies.
- Create `vitest.config.ts` and `src/test/setup.ts` — jsdom/fake IndexedDB test runtime.
- Create unit/integration tests beside the files they cover using `*.test.ts` and `*.test.tsx`.
- Create `playwright.config.ts` and `tests/e2e/generation.spec.ts` — browser flow with intercepted Gemini responses.
- Create `docs/GUIA_DE_PRUEBAS.md` — operation, manual cases, real-API smoke test, and cost expectations.

---

### Task 1: Test Harness and Domain Contracts

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Create: `src/generation/types.ts`
- Create: `src/generation/blueprintSchema.ts`
- Create: `src/generation/blueprintSchema.test.ts`
- Modify: `src/types/index.ts:1-87`

**Interfaces:**
- Produces: `validateBlueprint(value: unknown, activeTechniqueIds: number[]): BlueprintValidationResult`
- Produces: `LANDING_BLUEPRINT_SCHEMA: Record<string, unknown>` for Gemini structured output.
- Produces: shared types `BrandBrief`, `LandingBlueprint`, `GenerationRequest`, `GeneratedVisualAsset`, `TechniqueEvidence`, `GenerationState`, `GenerationError`, and `GenerationRecord`.

- [ ] **Step 1: Install the development-only test stack and add scripts**

Run:

~~~powershell
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom fake-indexeddb @playwright/test cross-env
~~~

Add these scripts without changing the existing build commands:

~~~json
{
  "test": "vitest run",
  "test:watch": "vitest",
  "test:real": "cross-env VITE_GEMINI_REAL_TEST=1 vitest run src/services/geminiGateway.live.test.ts",
  "test:e2e": "playwright test"
}
~~~

- [ ] **Step 2: Configure Vitest and browser-like setup**

Create `vitest.config.ts`:

~~~ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true
  }
});
~~~

Create `src/test/setup.ts`:

~~~ts
import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';
~~~

- [ ] **Step 3: Write failing blueprint contract tests**

Cover a complete valid object, an empty `sections` array, a non-hex token, a CTA with blank label, and active technique 4 missing from `techniquePlan`:

~~~ts
const result = validateBlueprint(validBlueprint, [1, 4, 8]);
expect(result.ok).toBe(true);

const missingTechnique = validateBlueprint(
  { ...validBlueprint, techniquePlan: validBlueprint.techniquePlan.filter(item => item.techniqueId !== 4) },
  [1, 4, 8]
);
expect(missingTechnique).toEqual(expect.objectContaining({
  ok: false,
  issues: expect.arrayContaining([
    expect.objectContaining({ path: 'techniquePlan.4' })
  ])
}));
~~~

- [ ] **Step 4: Run the focused test and confirm failure**

Run: `npm test -- src/generation/blueprintSchema.test.ts`
Expected: FAIL because `validateBlueprint` and the domain types do not exist.

- [ ] **Step 5: Implement the shared domain and semantic validator**

Define a discriminated result and stable stage/error unions:

~~~ts
export type BlueprintValidationResult =
  | { ok: true; value: LandingBlueprint }
  | { ok: false; issues: ValidationIssue[] };

export type GenerationStage =
  | 'idle'
  | 'building_prompt'
  | 'generating_blueprint'
  | 'validating_blueprint'
  | 'generating_visual'
  | 'compiling'
  | 'auditing'
  | 'complete'
  | 'failed';

export type GenerationErrorCode =
  | 'MISSING_API_KEY'
  | 'INVALID_API_KEY'
  | 'QUOTA_EXCEEDED'
  | 'NETWORK_ERROR'
  | 'TEXT_MODEL_ERROR'
  | 'INVALID_BLUEPRINT'
  | 'IMAGE_MODEL_ERROR'
  | 'IMAGE_COMPRESSION_ERROR'
  | 'DOCUMENT_VALIDATION_ERROR'
  | 'STORAGE_ERROR'
  | 'CANCELLED';
~~~

Implement explicit semantic checks after structural parsing: at least three meaningful sections, `#RRGGBB` colors, nonblank CTA label/action, unique technique IDs, and one plan entry for every active technique. Keep `additionalProperties: false` in the exported Gemini schema.

- [ ] **Step 6: Run tests and the production build**

Run: `npm test -- src/generation/blueprintSchema.test.ts && npm run build`
Expected: PASS and a successful Vite production build.

- [ ] **Step 7: Commit the domain foundation**

~~~powershell
git add package.json package-lock.json vitest.config.ts src/test/setup.ts src/generation/types.ts src/generation/blueprintSchema.ts src/generation/blueprintSchema.test.ts src/types/index.ts
git commit -m "test: establish generation contracts"
~~~

---

### Task 2: Technique Catalog, Prompt Composer, and Call Estimate

**Files:**
- Create: `src/generation/techniqueCatalog.ts`
- Create: `src/generation/promptComposer.ts`
- Create: `src/generation/promptComposer.test.ts`

**Interfaces:**
- Consumes: `BrandBrief`, `SsotEntropyVector`, and the domain types from Task 1.
- Produces: `composeGenerationPrompt(input: PromptComposerInput): PromptBundle`.
- Produces: `estimateGenerationCalls(activeTechniqueIds: number[], imageMode: ImageMode): GenerationCallEstimate`.
- Produces: `TECHNIQUE_CATALOG: readonly TechniqueDefinition[]`.

- [ ] **Step 1: Write failing tests for exact technique inclusion**

~~~ts
const bundle = composeGenerationPrompt({
  brief,
  ssot,
  activeTechniqueIds: [1, 4],
  imageMode: 'generated',
  capabilities: ['svg', 'css-motion']
});

expect(bundle.masterPrompt).toContain('Técnica 1');
expect(bundle.masterPrompt).toContain('Técnica 4');
expect(bundle.masterPrompt).not.toContain('Técnica 2');
expect(bundle.executedPrompt).toBe(bundle.masterPrompt);
expect(estimateGenerationCalls([1, 4], 'generated')).toEqual({
  textCalls: 1,
  imageCalls: 1
});
expect(estimateGenerationCalls([1, 4], 'procedural').imageCalls).toBe(0);
~~~

Also assert that the output contract says embedded CSS/JS, bans network dependencies, and contains the generated schema version.

- [ ] **Step 2: Confirm the tests fail**

Run: `npm test -- src/generation/promptComposer.test.ts`
Expected: FAIL because the composer and catalog do not exist.

- [ ] **Step 3: Move the eight definitions into the stable catalog**

Give each definition `id`, `title`, `directive`, `requiredEvidence`, and `validatorKey`. Retain the Spanish descriptions currently displayed, but remove claims that a disabled technique still applies.

- [ ] **Step 4: Implement prompt composition and call estimation**

Use a deterministic section order:

~~~ts
export function estimateGenerationCalls(
  activeTechniqueIds: number[],
  imageMode: ImageMode
): GenerationCallEstimate {
  return {
    textCalls: 1,
    imageCalls:
      activeTechniqueIds.includes(4) && imageMode === 'generated' ? 1 : 0
  };
}
~~~

The master prompt must request blueprint JSON, not HTML. Include the brief, SSoT trace, active technique contracts, native output contract, visual mode, and negative constraints. Leave `src/core/promptBuilders.ts` unchanged until `App.tsx` migrates in Task 9, so this commit does not break the current UI.

- [ ] **Step 5: Run focused and full tests**

Run: `npm test -- src/generation/promptComposer.test.ts && npm test`
Expected: PASS.

- [ ] **Step 6: Commit the prompt contract**

~~~powershell
git add src/generation/techniqueCatalog.ts src/generation/promptComposer.ts src/generation/promptComposer.test.ts
git commit -m "feat: compose schema-driven landing prompts"
~~~

---

### Task 3: Typed Gemini Text and Image Gateway

**Files:**
- Create: `src/services/geminiGateway.ts`
- Create: `src/services/geminiGateway.test.ts`
- Create: `src/services/geminiGateway.live.test.ts`
- Modify: `src/services/geminiService.ts:1-119`

**Interfaces:**
- Consumes: `LANDING_BLUEPRINT_SCHEMA` and `validateBlueprint`.
- Produces: `createGeminiGateway(config: GeminiGatewayConfig): GeminiGateway`.
- `GeminiGateway.requestBlueprint(request, signal): Promise<LandingBlueprint>`.
- `GeminiGateway.requestHeroImage(prompt, references, signal): Promise<RawGeneratedImage>`.

- [ ] **Step 1: Write failing gateway tests with mocked fetch**

Test: valid structured response; HTTP 400 with invalid key; HTTP 429; network rejection; missing candidate; truncated/unsafe finish reason; syntactically valid but semantically invalid JSON; valid inline image data.

~~~ts
fetchMock.mockResolvedValueOnce(jsonResponse({
  candidates: [{
    finishReason: 'STOP',
    content: { parts: [{ text: JSON.stringify(validBlueprint) }] }
  }]
}));

await expect(gateway.requestBlueprint(request)).resolves.toEqual(validBlueprint);

fetchMock.mockResolvedValueOnce(new Response('quota', { status: 429 }));
await expect(gateway.requestBlueprint(request)).rejects.toMatchObject({
  code: 'QUOTA_EXCEEDED'
});
~~~

- [ ] **Step 2: Confirm the gateway tests fail**

Run: `npm test -- src/services/geminiGateway.test.ts`
Expected: FAIL because `createGeminiGateway` does not exist.

- [ ] **Step 3: Implement one configurable REST boundary**

Use defaults that can be overridden locally:

~~~ts
const config = {
  apiKey: import.meta.env.VITE_GEMINI_API_KEY ?? '',
  textModel: import.meta.env.VITE_GEMINI_TEXT_MODEL ?? 'gemini-2.5-flash',
  imageModel: import.meta.env.VITE_GEMINI_IMAGE_MODEL ?? 'gemini-2.5-flash-image'
};
~~~

For text, send `responseMimeType: 'application/json'` and `responseSchema: LANDING_BLUEPRINT_SCHEMA`. Parse all text parts, verify `finishReason === 'STOP'`, parse JSON, and run semantic validation. Map status and payload errors to stable `GenerationErrorCode` values.

For images, parse the first supported `inlineData` part, validate MIME type and nonempty base64, and return bytes plus provenance. Never retry automatically.

- [ ] **Step 4: Add an explicitly skipped live smoke test**

~~~ts
const live =
  import.meta.env.VITE_GEMINI_REAL_TEST === '1' &&
  import.meta.env.VITE_GEMINI_API_KEY
    ? it
    : it.skip;

live('returns one valid blueprint only when the real-api script is invoked', async () => {
  const gateway = createGeminiGateway(configFromEnv());
  const result = await gateway.requestBlueprint(minimalRequest);
  expect(result.sections.length).toBeGreaterThanOrEqual(3);
});
~~~

The normal `npm test` command must mock fetch and never consume the API. Document that `npm run test:real` is the only real-API test entry.

- [ ] **Step 5: Replace legacy behavior with compatibility exports**

Keep `computeLocalNoveltyAudit` and `callGeminiLive` as deprecated compatibility exports while `App.tsx` still imports them. Do not add new callers. Their removal belongs to Task 9, in the same commit that migrates App, so every intermediate commit continues to build.

- [ ] **Step 6: Run gateway tests and build**

Run: `npm test -- src/services/geminiGateway.test.ts && npm run build`
Expected: PASS. Do not run `npm run test:real` during implementation.

- [ ] **Step 7: Commit the Gemini boundary**

~~~powershell
git add src/services/geminiGateway.ts src/services/geminiGateway.test.ts src/services/geminiGateway.live.test.ts src/services/geminiService.ts
git commit -m "feat: add typed Gemini generation gateway"
~~~

---

### Task 4: Hybrid Visual Asset Pipeline

**Files:**
- Create: `src/generation/visualAssets.ts`
- Create: `src/generation/visualAssets.test.ts`

**Interfaces:**
- Consumes: `RawGeneratedImage`, `LandingBlueprint.visualDirection`, design tokens, and SSoT.
- Produces: `makeVisualCacheKey(input: VisualCacheKeyInput): Promise<string>`.
- Produces: `normalizeGeneratedImage(raw, codec): Promise<GeneratedVisualAsset>`.
- Produces: `createProceduralVisual(input): GeneratedVisualAsset`.
- Produces: `VisualAssetCache` with `get(cacheKey): Promise<GeneratedVisualAsset | undefined>` and `put(asset): Promise<void>` so Task 7 can use an in-memory fake before Task 8 supplies IndexedDB.
- Uses injected `ImageCodec` so resizing/compression can be tested without a real browser decoder.

- [ ] **Step 1: Write failing visual pipeline tests**

Test deterministic cache keys, reference hash participation, WebP output, maximum 1600px width, rejected unsupported MIME, procedural SVG escaping, and no remote URL in the fallback.

~~~ts
const first = await makeVisualCacheKey({ prompt: 'macro glass', seed: 'abc', referenceHash: '123' });
const second = await makeVisualCacheKey({ prompt: 'macro glass', seed: 'abc', referenceHash: '123' });
expect(first).toBe(second);

const asset = createProceduralVisual({ blueprint, ssot });
expect(asset.source).toBe('procedural');
expect(asset.dataUrl).toMatch(/^data:image\/svg\+xml/);
expect(decodeURIComponent(asset.dataUrl)).not.toContain('https://');
~~~

- [ ] **Step 2: Confirm tests fail**

Run: `npm test -- src/generation/visualAssets.test.ts`
Expected: FAIL because the visual functions do not exist.

- [ ] **Step 3: Implement hashing, normalization, and procedural fallback**

Hash a canonical JSON string using `crypto.subtle.digest('SHA-256', bytes)`. Convert generated data through the injected codec with:

~~~ts
const limits = {
  maxWidth: 1600,
  maxHeight: 1200,
  mimeType: 'image/webp',
  quality: 0.78,
  warningBytes: 450_000
} as const;
~~~

The SVG fallback must derive geometry from the seed, use only validated tokens, include a meaningful `role="img"`/`aria-label` when rendered, and contain no script.

- [ ] **Step 4: Run focused tests**

Run: `npm test -- src/generation/visualAssets.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit the visual pipeline**

~~~powershell
git add src/generation/visualAssets.ts src/generation/visualAssets.test.ts
git commit -m "feat: add cached-ready hybrid hero assets"
~~~

---

### Task 5: Deterministic Native HTML Renderer

**Files:**
- Create: `src/generation/nativeRenderer.ts`
- Create: `src/generation/nativeRenderer.test.ts`

**Interfaces:**
- Consumes: `LandingBlueprint`, `GeneratedVisualAsset`, `SsotEntropyVector`, active technique IDs, and enabled native capabilities.
- Produces: `renderLandingDocument(input: NativeRenderInput): string`.

- [ ] **Step 1: Write failing renderer tests**

Test doctype, semantic landmarks, embedded style/script, mobile viewport, generated data URI, procedural SVG, reduced motion, keyboard focus, and the absence of external resources or framework markers.

Pin hostile input:

~~~ts
const hostile = {
  ...blueprint,
  brandInterpretation: {
    ...blueprint.brandInterpretation,
    brandName: '</title><script>window.pwned=true</script>'
  }
};

const html = renderLandingDocument({ ...input, blueprint: hostile });
expect(html).not.toContain('<script>window.pwned=true</script>');
expect(html).toContain('&lt;/title&gt;');
expect(html).not.toMatch(/<(script|link)[^>]+src=/i);
expect(html).not.toMatch(/https?:\/\//i);
~~~

Add a long-copy test asserting the renderer preserves content while applying wrapping and bounded measure instead of truncating it.

- [ ] **Step 2: Confirm renderer tests fail**

Run: `npm test -- src/generation/nativeRenderer.test.ts`
Expected: FAIL because `renderLandingDocument` does not exist.

- [ ] **Step 3: Implement safe serialization and layout primitives**

Implement separate escaping helpers for text, attributes, CSS values, and JSON placed in scripts. Reject unvalidated colors and identifiers rather than interpolating them.

Build five native composition functions matching the SSoT layouts, but drive their copy, section order, visual, colors, and interactions from the blueprint. Every layout must remain visually different without changing the document contract.

- [ ] **Step 4: Implement native interactions**

Allow only capability-owned scripts:

- `canvas`: seed-driven Canvas 2D visual.
- `svg`: inline, inert SVG.
- `css-motion`: orchestrated CSS animation with reduced-motion override.
- `interaction-js`: navigation/menu/accordion behavior with keyboard semantics.

Do not emit a script for an unselected capability. Avoid decorative telemetry and fake metrics.

- [ ] **Step 5: Preserve the old generator until App migrates**

Do not change `generateLandingCode` yet because `App.tsx` still needs its old signature for the initial page. The new pipeline must call `renderLandingDocument` directly. Task 9 removes the old caller and static templates atomically.

- [ ] **Step 6: Run renderer tests and build**

Run: `npm test -- src/generation/nativeRenderer.test.ts && npm run build`
Expected: PASS; generated fixtures contain no remote URL.

- [ ] **Step 7: Commit the native compiler**

~~~powershell
git add src/generation/nativeRenderer.ts src/generation/nativeRenderer.test.ts
git commit -m "feat: compile blueprints to offline html5"
~~~

---

### Task 6: Document, Technique, and Novelty Audit Validators

**Files:**
- Create: `src/generation/documentValidator.ts`
- Create: `src/generation/documentValidator.test.ts`
- Create: `src/generation/techniqueValidators.ts`
- Create: `src/generation/techniqueValidators.test.ts`
- Create: `src/generation/auditEngine.ts`
- Create: `src/generation/auditEngine.test.ts`

**Interfaces:**
- Produces: `validateGeneratedDocument(html: string): DocumentValidationReport`.
- Produces: `validateTechniques(input: TechniqueValidationInput): TechniqueEvidence[]`.
- Produces: `auditLanding(input: AuditInput): NoveltyAuditResult`.

- [ ] **Step 1: Write failing document validation tests**

Reject remote `script`/`link`/`img` URLs, `fetch`, `XMLHttpRequest`, WebSocket, dynamic import, missing doctype, missing main, absent focus style, and motion without a reduced-motion rule.

~~~ts
const report = validateGeneratedDocument('<!doctype html><script src="https://cdn.example/x.js"></script>');
expect(report.blockingIssues).toEqual(expect.arrayContaining([
  expect.objectContaining({ code: 'REMOTE_DEPENDENCY' })
]));
~~~

- [ ] **Step 2: Write failing table tests for all eight techniques**

For every technique, supply a passing fixture, a partial fixture, and a failing fixture. Assert `not_requested` whenever its ID is absent:

~~~ts
expect(validateTechniques({ ...input, activeTechniqueIds: [] }))
  .toEqual(expect.arrayContaining([
    expect.objectContaining({ techniqueId: 4, status: 'not_requested' })
  ]));
~~~

- [ ] **Step 3: Write failing audit tests**

Assert a minimal weak document does not start near 9, a blocking dependency prevents admission regardless of average, and a fully evidenced fixture passes at 8.5 or higher.

- [ ] **Step 4: Confirm all validator tests fail**

Run: `npm test -- src/generation/documentValidator.test.ts src/generation/techniqueValidators.test.ts src/generation/auditEngine.test.ts`
Expected: FAIL because the validators do not exist.

- [ ] **Step 5: Implement document and technique validators**

Parse the document with `DOMParser`. Return evidence with a stable location:

~~~ts
export interface EvidenceItem {
  checkId: string;
  status: 'pass' | 'partial' | 'fail';
  message: string;
  location?: string;
  weight: number;
}
~~~

The SSoT validator compares saved mappings; persuasion checks objections and CTA; visual checks asset provenance; motion checks implementation and reduced motion; subtractive checks repeated wrappers/density; anti-slop scans banned patterns; human-copy checks action language and claims.

- [ ] **Step 6: Implement declared scoring**

Calculate each dimension from weighted checks on a 1–10 scale:

~~~ts
const scoreDimension = (checks: EvidenceItem[]) => {
  const total = checks.reduce((sum, check) => sum + check.weight, 0);
  const earned = checks.reduce((sum, check) => {
    const factor = check.status === 'pass' ? 1 : check.status === 'partial' ? 0.5 : 0;
    return sum + check.weight * factor;
  }, 0);
  return Number((1 + (earned / Math.max(total, 1)) * 9).toFixed(1));
};
~~~

Admission must additionally require zero blockers and no `failed` active technique.

- [ ] **Step 7: Run the full suite**

Run: `npm test`
Expected: PASS.

- [ ] **Step 8: Commit evidence-based auditing**

~~~powershell
git add src/generation/documentValidator.ts src/generation/documentValidator.test.ts src/generation/techniqueValidators.ts src/generation/techniqueValidators.test.ts src/generation/auditEngine.ts src/generation/auditEngine.test.ts
git commit -m "feat: audit generated landings from evidence"
~~~

---

### Task 7: Generation Orchestrator and Cost-Safe State Machine

**Files:**
- Create: `src/generation/generationPipeline.ts`
- Create: `src/generation/generationPipeline.test.ts`

**Interfaces:**
- Consumes: `GeminiGateway`, `VisualAssetCache`, renderer, validators, and audit engine.
- Produces: `createGenerationPipeline(dependencies): GenerationPipeline`.
- `GenerationPipeline.run(request, listeners): Promise<GenerationRecord>`.
- `GenerationPipeline.cancel(): void`.
- `GenerationPipeline.refine(previous, editedPrompt, listeners): Promise<GenerationRecord>` as a separate explicit action.

- [ ] **Step 1: Write failing orchestration tests**

Cover: standard procedural run makes one text/zero image calls; generated mode makes one/one; image failure produces `fallback-procedural`; cached asset prevents an image call; text failure preserves the previous record; and a second run supersedes a delayed first run.

~~~ts
const first = pipeline.run(firstRequest, listeners);
const second = pipeline.run(secondRequest, listeners);
resolveFirstBlueprint(firstBlueprint);

await expect(first).rejects.toMatchObject({ code: 'CANCELLED' });
await expect(second).resolves.toMatchObject({
  executedPrompt: secondRequest.executedPrompt
});
expect(listeners.onComplete).toHaveBeenCalledTimes(1);
~~~

- [ ] **Step 2: Confirm orchestration tests fail**

Run: `npm test -- src/generation/generationPipeline.test.ts`
Expected: FAIL because the pipeline does not exist.

- [ ] **Step 3: Implement the staged pipeline**

Sequence exactly:

~~~ts
emit('generating_blueprint');
const blueprint = await gateway.requestBlueprint(request, signal);
emit('validating_blueprint');
const validated = requireValidBlueprint(blueprint, request.activeTechniqueIds);
emit('generating_visual');
const visual = await resolveVisual(validated, request, signal);
emit('compiling');
const html = renderLandingDocument({ blueprint: validated, visual, ...request });
emit('auditing');
const audit = auditLanding({ html, blueprint: validated, visual, ...request });
emit('complete');
~~~

Use one `AbortController` per run and a monotonically increasing run ID. Catch image errors locally to produce a fallback; propagate text, blueprint, renderer, and cancellation failures without changing the last completed record.

- [ ] **Step 4: Enforce cache and call budgets**

Calculate the visual key before calling the image endpoint. Query cache first, persist successful normalized assets, and record `textCallsUsed`/`imageCallsUsed` in provenance. Throw an internal invariant error if the used count exceeds the precomputed estimate.

- [ ] **Step 5: Run pipeline and full tests**

Run: `npm test -- src/generation/generationPipeline.test.ts && npm test`
Expected: PASS.

- [ ] **Step 6: Commit orchestration**

~~~powershell
git add src/generation/generationPipeline.ts src/generation/generationPipeline.test.ts
git commit -m "feat: orchestrate cost-safe landing generation"
~~~

---

### Task 8: IndexedDB Repository, Asset Cache, and Legacy Migration

**Files:**
- Create: `src/storage/entrospecDb.ts`
- Create: `src/storage/projectRepository.ts`
- Create: `src/storage/projectRepository.test.ts`

**Interfaces:**
- Produces: `createProjectRepository(options): ProjectRepository`.
- Repository methods: `listDrafts`, `listCurated`, `getProject`, `saveDraft`, `saveCurated`, `deleteProject`, `getVisualAsset`, `putVisualAsset`, `migrateLegacyProjects`.
- Implements the `VisualAssetCache` consumed by Task 7.

- [ ] **Step 1: Write failing repository tests**

Test draft/curated separation, rejection of an ineligible curated record, asset round-trip, successful migration, corrupt legacy JSON, and a transaction failure that retains the legacy key.

~~~ts
await expect(repository.saveCurated(failingRecord)).rejects.toMatchObject({
  code: 'STORAGE_ERROR',
  message: expect.stringContaining('8.5')
});

await repository.migrateLegacyProjects(storage);
expect(storage.getItem('entrospec_landing_bank')).toBeNull();
expect(await repository.listCurated()).toHaveLength(1);
~~~

For a forced IndexedDB failure, assert the key is still present and the in-memory current record remains usable by the caller.

- [ ] **Step 2: Confirm repository tests fail**

Run: `npm test -- src/storage/projectRepository.test.ts`
Expected: FAIL because the repository does not exist.

- [ ] **Step 3: Implement versioned IndexedDB stores**

Use database `entrospec` version 1 with object stores:

- `projects` keyed by `id`, indexed by `collection` and `createdAt`.
- `visualAssets` keyed by `cacheKey`, indexed by `createdAt`.
- `meta` keyed by `key` for migration/version markers.

Wrap requests and transactions in promises that convert failures to `STORAGE_ERROR`.

- [ ] **Step 4: Implement safe legacy migration**

Parse each old record independently, map valid fields, mark `legacy: true`, and write all records in one transaction. Read them back before removing `entrospec_landing_bank`. If parsing or verification fails, keep the original key and return a migration warning.

- [ ] **Step 5: Run repository tests**

Run: `npm test -- src/storage/projectRepository.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit persistence**

~~~powershell
git add src/storage/entrospecDb.ts src/storage/projectRepository.ts src/storage/projectRepository.test.ts
git commit -m "feat: persist generation records in indexeddb"
~~~

---

### Task 9: Brand Brief, Editable Prompt, and Generation Controls

**Files:**
- Create: `src/components/BrandBriefForm.tsx`
- Create: `src/components/BrandBriefForm.test.tsx`
- Create: `src/components/OutputContract.tsx`
- Create: `src/components/GenerationProgress.tsx`
- Modify: `src/components/PromptViewer.tsx:1-end`
- Create: `src/components/PromptViewer.test.tsx`
- Modify: `src/components/TechniquesSelector.tsx:1-end`
- Modify: `src/core/promptBuilders.ts:1-end`
- Modify: `src/core/landingTemplates.ts:1-end`
- Modify: `src/services/geminiService.ts:1-end`
- Modify: `src/App.tsx:24-333`

**Interfaces:**
- Consumes: generation types, prompt composer, pipeline state, and technique evidence.
- `PromptViewer` receives `value`, `generatedValue`, `onChange`, `onReset`, and `disabled`.
- `BrandBriefForm` receives `value: BrandBrief` and `onChange(next: BrandBrief)`.

- [ ] **Step 1: Write failing component tests**

Test editing required brand fields, uploading an accepted logo, rejecting an unsupported/oversized reference, prompt edits persisting, resetting from the brief, call estimate changes, and “Ejecutar prompt” forwarding the exact edited value.

~~~tsx
await user.clear(screen.getByLabelText(/prompt maestro/i));
await user.type(screen.getByLabelText(/prompt maestro/i), 'Prompt manual exacto');
await user.click(screen.getByRole('button', { name: /ejecutar prompt/i }));
expect(onExecute).toHaveBeenCalledWith('Prompt manual exacto');
~~~

- [ ] **Step 2: Confirm component tests fail**

Run: `npm test -- src/components/BrandBriefForm.test.tsx src/components/PromptViewer.test.tsx`
Expected: FAIL because the new props/components do not exist.

- [ ] **Step 3: Build the brand brief and output contract**

Use visible labels for every field. Accept PNG, JPEG, and WebP references up to 4 MB; show an actionable error without altering the previous valid file. Replace `AVAILABLE_STACKS` with native capabilities:

~~~ts
const NATIVE_CAPABILITIES = [
  { id: 'canvas', label: 'Canvas 2D' },
  { id: 'svg', label: 'SVG inline' },
  { id: 'css-motion', label: 'Animación CSS' },
  { id: 'interaction-js', label: 'Interacción JS' }
] as const;
~~~

Show `1 llamada de texto` and `0/1 llamada de imagen` before execution. Show the local-key warning next to configuration help.

- [ ] **Step 4: Make the prompt editor executable**

Remove `readOnly` from the master prompt tab only. Keep derived image, constraints, and blueprint views read-only. Disable editing while a run is active, provide “Restaurar desde brief,” and label the primary action “Ejecutar prompt.”

- [ ] **Step 5: Display technique contracts and evidence states**

Before generation show `requiredEvidence`. After generation show `applied`, `partial`, `failed`, or `not_requested` with a concise evidence summary. Do not use decorative pulses or AI badges.

- [ ] **Step 6: Integrate the staged state into App**

Replace `handleSynthesizeLanding` and fake delays with `pipeline.run`. Keep `lastCompletedRecord` separate from the current attempt so failures do not clear the preview. Remove the framework selector and optimistic `handleSubtractiveRefactor` score manipulation.

Once no imports remain, delete the old hard-coded `generateLandingCode` templates, the old HTML-oriented `buildPromptBundle` implementation, `callGeminiLive`, and `computeLocalNoveltyAudit`. Keep a compatibility re-export only when a migrated component still consumes the same domain type.

- [ ] **Step 7: Run component tests and build**

Run: `npm test -- src/components && npm run build`
Expected: PASS.

- [ ] **Step 8: Commit the Studio input flow**

~~~powershell
git add src/components/BrandBriefForm.tsx src/components/BrandBriefForm.test.tsx src/components/OutputContract.tsx src/components/GenerationProgress.tsx src/components/PromptViewer.tsx src/components/PromptViewer.test.tsx src/components/TechniquesSelector.tsx src/core/promptBuilders.ts src/core/landingTemplates.ts src/services/geminiService.ts src/App.tsx
git commit -m "feat: add executable brand generation studio"
~~~

---

### Task 10: Result Inspector, Strict Preview, and Honest Audit UI

**Files:**
- Create: `src/components/GenerationInspector.tsx`
- Create: `src/components/GenerationInspector.test.tsx`
- Modify: `src/components/SandboxPreview.tsx:1-end`
- Create: `src/components/SandboxPreview.test.tsx`
- Modify: `src/components/NoveltyBenchAudit.tsx:1-end`
- Modify: `src/App.tsx:333-349`

**Interfaces:**
- Consumes: `GenerationRecord`, `GenerationState`, and repository actions.
- `SandboxPreview` receives `record`, `onSaveDraft`, `onSaveCurated`, and `savingState`.

- [ ] **Step 1: Write failing result-view tests**

Assert the inspector displays the executed prompt, parsed blueprint, generated/procedural/fallback provenance, calls used, technique evidence, blockers, and exact scores. Assert a failed run leaves the previous preview visible with a separate error.

Assert the iframe uses only:

~~~tsx
<iframe sandbox="allow-scripts" srcDoc={record.htmlCode} />
~~~

- [ ] **Step 2: Confirm tests fail**

Run: `npm test -- src/components/GenerationInspector.test.tsx src/components/SandboxPreview.test.tsx`
Expected: FAIL because the result contract is not implemented.

- [ ] **Step 3: Implement the inspector and audit presentation**

Provide tabs for `Prompt ejecutado`, `Blueprint`, `Evidencia`, and `Código`. Render JSON using escaped text in `pre`, never `dangerouslySetInnerHTML`. Replace the current “refactor completed” fabricated boost with the audit engine's blockers and recommendations.

- [ ] **Step 4: Enforce save eligibility and honest visual provenance**

Enable “Enviar al banco” only when `audit.passesBank` is true. Keep “Guardar borrador” available after a valid compile. Show one of:

- “Imagen generada y comprimida”
- “Visual procedural solicitado”
- “Respaldo procedural por fallo de imagen”

- [ ] **Step 5: Run result tests and build**

Run: `npm test -- src/components/GenerationInspector.test.tsx src/components/SandboxPreview.test.tsx && npm run build`
Expected: PASS.

- [ ] **Step 6: Commit the result workspace**

~~~powershell
git add src/components/GenerationInspector.tsx src/components/GenerationInspector.test.tsx src/components/SandboxPreview.tsx src/components/SandboxPreview.test.tsx src/components/NoveltyBenchAudit.tsx src/App.tsx
git commit -m "feat: expose generation evidence and safe preview"
~~~

---

### Task 11: Curated Bank and Reproducible Reopen Flow

**Files:**
- Modify: `src/components/LandingBank.tsx:1-end`
- Create: `src/components/LandingBank.test.tsx`
- Modify: `src/App.tsx:90-238`

**Interfaces:**
- Consumes: `ProjectRepository` and `GenerationRecord`.
- Produces UI actions `onOpenInStudio(record)` and `onDeleteProject(id)`.

- [ ] **Step 1: Write failing bank tests**

Test async curated loading, empty state, landing/prompt side-by-side view, evidence metadata, download, deletion, and re-opening with the exact prompt/seed/brief/techniques.

~~~tsx
expect(screen.getByTitle('Saved Landing Preview')).toBeVisible();
expect(screen.getByLabelText(/prompt de origen/i)).toHaveValue(record.executedPrompt);

await user.click(screen.getByRole('button', { name: /abrir en studio/i }));
expect(onOpenInStudio).toHaveBeenCalledWith(record);
~~~

Also assert draft records never appear in the curated list.

- [ ] **Step 2: Confirm bank tests fail**

Run: `npm test -- src/components/LandingBank.test.tsx`
Expected: FAIL because the component still consumes the legacy synchronous array.

- [ ] **Step 3: Migrate App from localStorage state to the repository**

On mount, run migration once, load curated count, and expose storage errors without clearing the in-memory record. Save drafts/curated records through repository calls. Remove the effect that writes the full bank to localStorage.

- [ ] **Step 4: Implement the required side-by-side bank view**

On desktop use two columns: curated landing preview and exact executed prompt. On mobile stack preview before prompt. Include seed, brief, active techniques, audit, visual provenance, and creation date. Legacy records show “Registro heredado” and keep their original code/prompt.

- [ ] **Step 5: Run bank tests and the full suite**

Run: `npm test -- src/components/LandingBank.test.tsx && npm test`
Expected: PASS.

- [ ] **Step 6: Commit the bank migration**

~~~powershell
git add src/components/LandingBank.tsx src/components/LandingBank.test.tsx src/App.tsx
git commit -m "feat: curate reproducible landing bank records"
~~~

---

### Task 12: End-to-End Verification and User Guide

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/generation.spec.ts`
- Create: `tests/fixtures/valid-blueprint.json`
- Create: `tests/fixtures/generated-image.json`
- Create: `docs/GUIA_DE_PRUEBAS.md`
- Modify: `package.json`

**Interfaces:**
- Exercises the public UI only.
- Intercepts Gemini endpoints; makes zero real API calls.

- [ ] **Step 1: Configure Playwright with the local Vite server**

~~~ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: 'http://127.0.0.1:4173', trace: 'retain-on-failure' },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: true
  },
  projects: [
    { name: 'mobile', use: { ...devices['iPhone 13'] } },
    { name: 'tablet', use: { viewport: { width: 768, height: 1024 } } },
    { name: 'desktop', use: { viewport: { width: 1280, height: 900 } } },
    { name: 'wide', use: { viewport: { width: 1920, height: 1080 } } }
  ]
});
~~~

- [ ] **Step 2: Write the mocked complete-flow E2E test**

Intercept text/image calls with fixtures. Fill the brand brief, edit the prompt, activate image generation, execute, wait for `complete`, inspect mobile/desktop previews, verify evidence, save to the curated bank, and assert the bank shows the exact prompt next to the iframe.

Add separate cases for image 429 fallback and text 429 preserving the previous result.

- [ ] **Step 3: Run E2E and resolve only product failures**

Run: `npx playwright install chromium` once, then `npm run test:e2e`.
Expected: all four viewport projects pass, with no unexpected console errors and no unmocked network request.

- [ ] **Step 4: Write the Spanish operation and testing guide**

The guide must contain:

1. Local setup and API variables.
2. Explanation of brief → prompt → blueprint → visual → compiler → audit → bank.
3. Meaning of all eight techniques and their visible evidence.
4. Cost table: normal procedural 1+0 calls; generated image 1+1; cached image 1+0; manual refine starts a new run.
5. Manual test matrix for each technique on/off.
6. Failure tests for missing key, invalid key, quota, offline mode, invalid blueprint, and image fallback.
7. Responsive checks at 375, 768, 1280, and 1920 px.
8. How to run unit, E2E, build, and opt-in real API smoke tests.
9. Expected bank admission behavior and legacy migration.
10. Troubleshooting steps tied to stable error codes.

- [ ] **Step 5: Perform the final automated verification**

Run:

~~~powershell
npm test
npm run build
npm run test:e2e
~~~

Expected: every command exits 0. Do not run `npm run test:real` unless the user explicitly chooses to spend the API calls.

- [ ] **Step 6: Perform visual QA**

Open the running app and capture the Studio, generated result, and Bank at 375, 768, 1280, and 1920 px. Check overflow, clipping, focus states, loading/error clarity, iframe scrolling, and side-by-side bank behavior. Correct source issues and repeat until the checklist passes.

- [ ] **Step 7: Commit verification and documentation**

~~~powershell
git add playwright.config.ts tests package.json package-lock.json docs/GUIA_DE_PRUEBAS.md
git commit -m "test: verify native landing generation flow"
~~~

---

## Final Acceptance Checklist

- [ ] `npm test` passes without network access or API consumption.
- [ ] `npm run build` passes with no TypeScript errors.
- [ ] `npm run test:e2e` passes at mobile, tablet, desktop, and wide viewports.
- [ ] The generated document is one downloadable HTML file and works offline.
- [ ] Generated HTML contains no runtime external URL, framework, import, or CDN.
- [ ] Editing and executing the prompt inside Entrospec changes the generated blueprint and landing.
- [ ] Technique toggles change requirements, output, evidence, and scoring.
- [ ] Generated image mode performs at most one image call and uses cache on repeat.
- [ ] Image failure visibly produces a procedural fallback.
- [ ] Text failure never silently replaces the previous valid landing.
- [ ] Only eligible records enter the curated bank.
- [ ] The Bank presents the landing beside its exact executed prompt.
- [ ] Legacy projects remain recoverable throughout migration.
- [ ] `docs/GUIA_DE_PRUEBAS.md` explains the system and repeatable test procedures.

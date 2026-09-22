# Resilient Landing Generation Design

**Date:** 2026-09-22
**Status:** Approved in conversation; pending review of this written specification

## 1. Purpose

Entrospec will generate visually distinctive, conversion-oriented landing pages without exposing provider credentials or presenting low-quality contingency output as a completed design. The system will keep its deterministic SSoT foundation and safe native HTML compiler, but replace the current fixed blueprint and single renderer with a richer, controlled design language and a multi-family rendering system.

The generation path will use a persistent Node.js server, Gemini as the only AI provider, two successful text-generation phases, and an optional image-generation phase. Transient Gemini failures will be retried for at most five minutes. If that deadline expires, the job will fail recoverably while preserving the original request.

## 2. Goals

- Keep the Gemini API key exclusively on the Node.js server.
- Survive temporary `408`, `429`, and `5xx` responses without duplicating work.
- Produce five composition families that are visibly different in structure, not merely in color and copy.
- Compile validated design data into one self-contained HTML5 document with embedded CSS, JavaScript, fonts, and visual assets.
- Preserve deterministic behavior: the same brief, selected options, and SSoT seed produce the same compiled result.
- Use a creator-critic flow based on rendered desktop and mobile evidence.
- Prevent incomplete or low-scoring results from entering the curated landing bank.
- Give the user accurate progress, retry, failure, and recovery states.
- Preserve the existing Carbon Editorial, subtractive-design, and anti-AI-slop constraints.

## 3. Non-goals

- Supporting providers other than Gemini.
- Allowing Gemini to return executable HTML, CSS, or JavaScript.
- Building a distributed job system or multi-node queue in the first release.
- Generating arbitrary application interfaces; the contract is limited to marketing landing pages.
- Automatically publishing generated pages to a hosting provider.
- Silently replacing a failed generated image or failed text generation with a generic contingency landing.

## 4. Product behavior

The browser submits a generation request and receives a job identifier immediately. It then subscribes to server-sent events for progress. The job advances through these user-visible phases:

1. Waiting for capacity.
2. Creating the design direction.
3. Preparing the visual asset when requested.
4. Compiling the first landing.
5. Reviewing desktop and mobile renders.
6. Applying the refinement.
7. Validating the final artifact.
8. Complete, failed, or cancelled.

Provider attempts, elapsed time, and the active model may be displayed as operational status. Raw provider payloads, API keys, signed asset locations, prompts containing binary reference data, and stack traces must never be displayed.

If no Gemini model succeeds within five minutes, the job becomes `failed_recoverable`. Its brief, seed, selected techniques, prompt, and uploaded references remain available. The user can resume the same logical request without re-entering data. A resumed job receives a new execution identifier but retains a `parentJobId` link to the failed job.

There is no automatic procedural text fallback. Procedural visuals remain available only when the user explicitly selects procedural visual mode; they are not used as an undeclared substitute for failed image generation.

## 5. System architecture

### 5.1 Browser application

The existing Vite and React application remains responsible for:

- Editing the brand brief and generation prompt.
- Selecting techniques, capabilities, visual mode, and seed.
- Uploading and locally previewing allowed reference assets.
- Creating, cancelling, resuming, and observing generation jobs.
- Rendering the final HTML inside the existing sandboxed preview.
- Displaying audit evidence and bank eligibility.
- Downloading the final self-contained HTML document.

The browser must not import the Gemini SDK, construct Gemini URLs, or receive `GEMINI_API_KEY`. All `VITE_GEMINI_*` variables are removed from the client build.

### 5.2 Persistent Node.js server

The server will be a TypeScript Node.js process using Fastify. It owns:

- HTTP request validation and upload limits.
- Job creation, idempotency, cancellation, recovery, and SSE delivery.
- The bounded in-process queue.
- Gemini SDK calls and retry policy.
- Blueprint validation and normalization.
- HTML compilation.
- Playwright rendering at desktop and mobile viewports.
- Local deterministic audit checks.
- SQLite persistence and asset metadata.
- Redacted structured logging.

The server is the authoritative source for new generation records and curated-bank membership.

### 5.3 Queue and recovery

The first release uses an in-process queue with a default concurrency of two jobs. Concurrency is configurable through a server-only environment variable and cannot be increased from the browser.

SQLite is authoritative for job state. When the server starts, jobs left in an active state are moved to `queued_recovery` and re-enter the queue if they have not been cancelled or superseded. A stage writes its durable output before the next stage begins so a process restart does not repeat a successful image or creator call unnecessarily.

The queue is intentionally single-node. Running multiple server replicas against the same SQLite file is unsupported.

## 6. Generation data flow

### 6.1 Request normalization

The server validates the brief, seed, selected techniques, capabilities, visual mode, prompt length, and reference MIME types. It computes a canonical request hash after removing transport-only fields. The `Idempotency-Key` header and canonical hash prevent double-clicks or network retries from creating duplicate jobs.

### 6.2 Creator phase

Gemini receives the normalized brief, SSoT vector, technique directives, negative constraints, and the `DesignBlueprintV2` response schema. It returns structured JSON only.

The server validates the response without inventing missing creative fields. Normalization may trim whitespace, canonicalize colors, sort evidence identifiers, and apply safe defaults for purely technical metadata. It must not fabricate headlines, layouts, proof points, or technique evidence to make an invalid response pass.

### 6.3 Visual phase

If the request uses generated visual mode and the active technique contract calls for a hero image, the server sends the validated visual direction to Gemini image generation. The returned raster is normalized to WebP, capped at 1600 by 1200 pixels, and stored as a content-addressed asset.

If generated visual mode cannot complete within the job deadline, the job fails recoverably. If procedural mode was explicitly selected, the server creates a deterministic SVG from the approved blueprint and SSoT seed without making an image call.

### 6.4 Draft compilation and evidence capture

The compiler converts the creator blueprint and resolved visual asset into a complete offline HTML document. Playwright renders the document at:

- Desktop: 1440 by 1000 CSS pixels.
- Mobile: 390 by 844 CSS pixels.

The evidence collector records screenshots and deterministic diagnostics, including viewport overflow, element overlap, missing accessible names, color contrast, focus visibility, remote requests, broken internal anchors, and reduced-motion behavior.

### 6.5 Critic-refiner phase

The second successful Gemini text call receives:

- The original normalized request.
- The creator blueprint.
- Desktop and mobile screenshots.
- Deterministic diagnostics.
- The NoveltyBench rubric.
- The exact negative constraints.

Gemini returns a complete refined `DesignBlueprintV2`. It does not return prose, source code, or a patch language. Returning a complete blueprint makes the second result independently validatable and avoids ambiguous patch application.

The critic may change copy, layout variants, proportions, typography, palette, section order, and media treatment. It may not introduce unsupported primitives, external resources, or a second image-generation request.

### 6.6 Final compilation and admission

The refined blueprint is compiled with the already resolved visual asset. The final artifact is rendered again at both viewports and audited locally.

A final result with no document or accessibility blocker is available as a draft. It is eligible for the curated bank only when:

- Its NoveltyBench average is at least 8.5 out of 10.
- Every objective blocking check passes.
- Every requested technique has observable evidence.
- The visual source matches the user's chosen mode.

Results below the threshold remain reviewable and downloadable as drafts, with explicit audit findings. They cannot be sent to the curated bank.

## 7. DesignBlueprintV2

`DesignBlueprintV2` is a constrained visual language. It exposes meaningful design decisions while preventing arbitrary code injection.

### 7.1 Top-level structure

```ts
interface DesignBlueprintV2 {
  schemaVersion: 2;
  strategy: BrandStrategy;
  artDirection: ArtDirection;
  tokens: DesignTokensV2;
  page: PageComposition;
  sections: LandingSectionV2[];
  motion: MotionPlan;
  techniqueEvidence: TechniqueEvidencePlan[];
  metadata: BlueprintMetadataV2;
}
```

`BrandStrategy` contains the brand name, audience, market sophistication, primary promise, primary objection, objection response, tone, and primary action. Proof claims must come from the user's brief; Gemini may not invent customer counts, awards, certifications, prices, guarantees, or testimonials.

### 7.2 Art direction

`ArtDirection.family` is one of:

- `swiss-split`
- `bauhaus-asymmetry`
- `fibonacci-editorial`
- `broken-type-grid`
- `seventies-editorial`

Art direction also selects density, focal position, contrast mode, image treatment, section rhythm, and editorial motif. These values are enums or bounded numeric scales; they are not raw CSS.

### 7.3 Tokens

Tokens define validated hexadecimal colors, a bounded typography scale, spacing scale, surface hierarchy, maximum content width, and limited corner-radius values. Font choices come from an allowlist of bundled, embeddable font assets and system fallbacks. Hanken Grotesk is the default interface family; generated pages may use approved display and body combinations selected by the blueprint.

Generated documents do not use remote fonts. When a bundled font is selected, the compiler embeds a locally licensed WOFF2 subset into the HTML.

### 7.4 Sections

Sections are discriminated unions for:

- Hero.
- Proof.
- Features or capabilities.
- Objection handling.
- FAQ.
- CTA.
- Footer.

Every section carries semantic content plus an allowlisted composition variant. Examples include `hero/split-monumental`, `hero/type-led`, `proof/editorial-ledger`, `proof/number-line`, `objection/counterpoint`, and `cta/quiet-field`.

Each variant exposes only bounded layout controls such as column ratio, alignment, media position, text measure, vertical span, and emphasis order. Raw class names, style strings, selectors, URLs, scripts, and event handlers are forbidden in blueprint data.

### 7.5 SSoT determinism

The 24-to-32-character SSoT seed is divided into four chunks and hashed deterministically. The chunks select:

1. Composition family and grid behavior.
2. Palette and contrast mode.
3. motion and interaction intensity.
4. Hero focus and objection strategy.

Gemini receives these selections as constraints rather than suggestions. The compiler records the selected vector. With the same normalized request, seed, resolved visual asset, and blueprint, compilation is byte-stable apart from explicitly excluded timestamps and record identifiers.

Changing the seed must change at least the composition family or grid variant, the palette, and the hero focal treatment. A seed does not override explicit user color exclusions or accessibility constraints.

## 8. Renderer architecture

The renderer is split into focused registries:

- A page-family registry controls global grid, navigation, background rhythm, and section sequencing.
- A section-variant registry renders semantic section data into safe markup.
- A token compiler converts validated tokens into CSS custom properties and bounded rules.
- A motion compiler emits allowlisted progressive enhancement and reduced-motion alternatives.
- An asset embedder converts approved local assets into data URLs.
- A document assembler produces the final HTML shell and security metadata.

The five families must differ in DOM composition, proportions, focal hierarchy, and whitespace rhythm. They may share low-level primitives, but they may not resolve to the same section template with different token values.

All user and model text is HTML-escaped. URLs are limited to internal fragment links and embedded data assets. The compiler does not evaluate model-provided code.

The generated interface follows these constraints:

- No decorative borders or divider lines.
- No generic bento grids.
- No purple-cyan AI gradients.
- No redundant icons, decorative status dots, or AI badges.
- No generic corporate superlatives or banned copy clichés.
- Focus indication uses tonal change and an accessible box-shadow treatment rather than decorative outlines.
- Motion is optional, purposeful, and disabled or simplified under `prefers-reduced-motion`.
- Layouts are mobile-first and must not horizontally overflow at 320 CSS pixels or wider.

## 9. Gemini resilience policy

Gemini is the only provider. The server uses the official Gemini Node.js SDK and server-only `GEMINI_API_KEY`.

The ordered text-model pool is:

1. `gemini-3.8-flash`
2. `gemini-3.7-flash`
3. `gemini-3.6-flash`

The ordered image-model pool is configured server-side from currently supported Gemini image models. A deployment must validate configured model identifiers at startup by listing model capabilities. An invalid configured identifier prevents the server from becoming ready.

Each job has a five-minute wall-clock deadline covering queue-external provider work. Time spent waiting behind other jobs does not consume the five-minute provider deadline. Cancellation aborts the active SDK request and prevents later stages from starting.

Only `408`, `429`, and `5xx` responses are retried. The default retry delays are 1, 2, 4, 8, 16, 30, 45, and 60 seconds with plus or minus 20 percent jitter, capped by the remaining deadline. A valid `Retry-After` value takes precedence when it fits within the remaining deadline.

After three consecutive transient failures from one model, the request moves to the next compatible Gemini model. The attempt counter, model, status code, and sanitized provider request identifier are persisted.

`400`, `401`, `403`, unsupported-model errors, schema incompatibility, safety blocks, and locally invalid requests are not retried as capacity failures. They produce typed, user-safe errors. Structured output that violates `DesignBlueprintV2` is reported as `invalid_blueprint`; the server does not silently sanitize creative omissions into a passing result.

The system tracks physical provider attempts separately from the two logical text phases. Cost and diagnostics show both values.

## 10. HTTP API

### `POST /api/generations`

Consumes a multipart or JSON generation request and requires an `Idempotency-Key` header. Returns `202 Accepted` with `jobId`, `statusUrl`, `eventsUrl`, and `createdAt`.

### `GET /api/generations/:jobId`

Returns current state, user-safe progress, timestamps, attempt summary, available artifact links, audit summary, and recoverability.

### `GET /api/generations/:jobId/events`

Streams monotonic events with an event sequence number. Clients reconnect with `Last-Event-ID`. Events contain stage, elapsed provider time, model, attempt number, and a user-safe message.

### `POST /api/generations/:jobId/retry`

Creates a new execution linked to a recoverable failed job. It reuses the persisted request and assets and returns `202 Accepted` with the new job identifier.

### `DELETE /api/generations/:jobId`

Marks the job cancelled, aborts active provider work, and closes its SSE stream. Completed artifacts are not deleted by this endpoint.

### `GET /api/generations/:jobId/artifact`

Returns the final HTML only for a completed job. Draft results include their audit eligibility metadata in the job resource, not inside the downloaded page.

### Bank endpoints

The server exposes list, admit, remove, and retrieve operations for generation records. Admission rejects jobs that do not meet the audit gate even if a client attempts to bypass the interface.

## 11. Persistence model

SQLite stores:

- `generation_jobs`: identifiers, parent relationship, canonical hash, state, deadlines, timestamps, and cancellation state.
- `generation_requests`: normalized briefs, prompt, seed, technique identifiers, capabilities, and visual mode.
- `generation_attempts`: phase, model, attempt number, timing, status code, provider request identifier, and sanitized error classification.
- `generation_blueprints`: creator and refined JSON with schema version and validation result.
- `generation_artifacts`: HTML location, checksum, byte size, visual source, and audit eligibility.
- `generation_events`: monotonic SSE sequence, stage, message code, and timestamp.
- `visual_assets`: content hash, MIME type, dimensions, storage path, provenance, and cache metadata.
- `audit_results`: deterministic findings, NoveltyBench scores, blockers, and technique evidence.
- `bank_entries`: admitted artifact identifier, admission timestamp, and display metadata.

Binary reference uploads, screenshots, images, and HTML artifacts live under a configured server data directory. SQLite stores relative paths only. Path resolution rejects traversal outside that directory.

## 12. Security and privacy

- `GEMINI_API_KEY` is read only by the Node.js process and is never serialized.
- Server logs use structured redaction for authorization material, query parameters, inline image data, prompts, and provider response bodies.
- Reference uploads accept an allowlist of image MIME types, validated by file signature as well as declared MIME type.
- Request sizes and prompt lengths have explicit server limits.
- CORS uses an explicit deployment origin allowlist.
- Job creation and retry endpoints are rate-limited.
- Preview rendering remains sandboxed and generated documents cannot perform network requests.
- Playwright rendering uses a fresh isolated context with outbound networking blocked.
- Generated HTML receives a restrictive content security policy compatible with embedded local assets.
- Error responses use stable error codes and user-safe messages; stack traces remain server-side.
- The currently exposed client-side Gemini credential must be revoked before the new server is used.

## 13. Audit and quality gate

### 13.1 Objective blockers

The final audit fails bank eligibility for:

- Invalid or unsafe HTML.
- Any network request from the generated document.
- Horizontal overflow at supported viewports.
- Detectable text or interactive-element overlap.
- Missing semantic heading order or accessible CTA name.
- Broken internal navigation.
- Insufficient text contrast.
- Missing visible keyboard focus.
- Motion without a reduced-motion alternative.
- Missing required section or requested technique evidence.
- Banned visual or copy patterns.
- A generated visual whose provenance does not match the selected mode.

### 13.2 NoveltyBench scores

The four scores remain:

- Distinctiveness.
- Usability and comprehension.
- Conversion and anxiety reduction.
- Stack fidelity.

Scores are derived from explicit observable checks. The critic may supply qualitative findings, but it cannot override an objective blocker or directly mark a job eligible. The local audit calculates the final score and threshold decision.

### 13.3 Quality transparency

The inspector shows creator blueprint, refined blueprint, model attempts, visual provenance, deterministic findings, technique evidence, exact score calculation, and bank eligibility. It does not describe a failed or incomplete phase as successful.

## 14. Testing strategy

### 14.1 Unit tests

- Retry classification, backoff, jitter bounds, deadline handling, model switching, cancellation, and `Retry-After` behavior with fake timers.
- Blueprint V2 parsing, rejection of raw code fields, bounded values, prohibited URLs, and missing creative fields.
- Deterministic SSoT selection and byte-stable compilation.
- Escaping, token compilation, section registry resolution, and embedded assets.
- Audit scoring and every objective blocker.
- Idempotency and state-transition rules.

### 14.2 Server integration tests

- Job creation through artifact retrieval with mocked Gemini responses.
- SSE replay using `Last-Event-ID`.
- Restart recovery from every active durable stage.
- Recoverable timeout and linked retry.
- Invalid credentials, quota responses, safety blocks, invalid blueprint, image failure, and cancellation.
- Bank admission enforced on the server.
- Credential and payload redaction.

### 14.3 Browser end-to-end tests

- Submit, observe progress, preview, download, and admit an eligible landing.
- Cancel an active job.
- Resume a timed-out job without re-entering the brief.
- Display a low-scoring result as a draft and block bank admission.
- Confirm no Gemini credential or direct Gemini request appears in the browser.

### 14.4 Visual regression

Each composition family has approved desktop and mobile fixtures. Regression checks verify that the five families retain different DOM structures and visual silhouettes. Fixtures cover long Spanish headings, sparse copy, maximum item counts, missing optional sections, generated images, and intentional procedural visuals.

### 14.5 Live smoke test

A separately invoked test uses a real server-only Gemini key and a minimal request. It is skipped by default, never runs in the normal unit suite, and reports model availability without printing credentials or response bodies.

## 15. Rollout

Implementation is delivered through four independently verifiable milestones:

1. **Server and security:** persistent Node.js service, SQLite jobs, SSE, Gemini SDK, typed errors, retry policy, and removal of the browser credential.
2. **Blueprint and compiler:** `DesignBlueprintV2`, five family registries, section variants, deterministic SSoT selection, and offline document assembly.
3. **Creator-critic quality loop:** visual asset handling, draft rendering, Playwright evidence, critic-refiner phase, final audit, and admission gate.
4. **Frontend migration and QA:** job-based client, progress and recovery states, server-backed bank, artifact download, E2E coverage, and visual regression approval.

The existing client-only generator remains available only during development behind an explicit local migration flag. Production builds must fail if that flag is enabled or if any `VITE_GEMINI_*` variable is referenced.

Existing IndexedDB records remain readable during migration. New generation and bank writes use the server. A one-time browser action can copy legacy completed records into the server after validating their schema and marking them as legacy; legacy records are not automatically eligible for the curated bank.

## 16. Acceptance criteria

- No Gemini credential or direct Gemini URL is present in the production browser bundle or browser network log.
- A temporary `503` can recover within the five-minute window without creating a duplicate logical job.
- Non-transient provider and request errors are not mislabeled as capacity failures.
- The UI accurately shows queued, active, retrying, recoverable failure, cancellation, draft, and completed states.
- The same normalized request and seed compile deterministically.
- Changing the seed changes grid or family, palette, and hero focal treatment while honoring explicit constraints.
- All five composition families are distinguishable in DOM structure and approved desktop and mobile visual fixtures.
- The final downloaded document works with outbound networking disabled.
- Generated mode never silently substitutes a procedural asset after provider failure.
- A draft with blockers or an average below 8.5 cannot enter the curated bank through either UI or direct API use.
- Provider attempts and successful logical calls are counted separately and accurately.
- Server restart recovery does not repeat already persisted successful stages.
- Unit, integration, end-to-end, and visual regression suites pass.

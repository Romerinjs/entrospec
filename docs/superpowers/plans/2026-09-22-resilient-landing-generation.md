# Resilient Landing Generation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the browser-side Gemini call and fixed landing template with a secure persistent Node.js generation service, a deterministic five-family compiler, and a creator-critic quality gate.

**Architecture:** A Fastify server owns Gemini, a SQLite-backed queue, artifact storage, Playwright evidence capture, and bank admission. Gemini returns `DesignBlueprintV2` twice—creator then critic-refiner—while a local compiler produces the offline HTML and a deterministic audit decides bank eligibility. The React client talks only to the server through typed HTTP and SSE contracts.

**Tech Stack:** TypeScript 5, React 18, Vite 6, Fastify, `@google/genai`, TypeBox, SQLite through `better-sqlite3`, Sharp, Playwright, axe-core, Vitest, and Tailwind CSS.

**Spec:** `docs/superpowers/specs/2026-09-22-resilient-landing-generation-design.md`

## Global Constraints

- Gemini is the only AI provider; text model order is `gemini-3.8-flash`, `gemini-3.7-flash`, then `gemini-3.6-flash`.
- The provider deadline is five minutes after a job leaves the queue; queue wait time does not consume it.
- Retry only `408`, `429`, and `5xx`; use delays of 1, 2, 4, 8, 16, 30, 45, and 60 seconds with ±20% jitter and honor a usable `Retry-After` value.
- A job has two successful logical text phases and zero or one image phase; physical retry attempts are counted separately.
- Generated-image failure must never silently become a procedural visual. Procedural mode is valid only when explicitly selected.
- Gemini returns `DesignBlueprintV2`, never executable HTML, CSS, JavaScript, class names, selectors, or external URLs.
- The final artifact is one offline HTML5 document with embedded CSS, JavaScript, font assets, and visual assets.
- The first release is single-node and uses one SQLite database plus an in-process queue with default concurrency two.
- `GEMINI_API_KEY` is server-only; production builds fail if `VITE_GEMINI_*` or a direct Gemini API URL enters the client bundle.
- Bank admission requires zero objective blockers, all requested technique evidence, matching visual provenance, and NoveltyBench average ≥ 8.5.
- Generated designs use no decorative borders, generic bento grids, purple-cyan AI gradients, redundant icons, AI badges, decorative status dots, remote fonts, or banned corporate clichés.
- Focus indication uses tonal change and accessible box shadow; every motion path has a `prefers-reduced-motion` alternative.
- Existing user changes in the working tree are preserved; each task stages only the files listed for its commit.

## Review Focus

- A reference image whose declared MIME disagrees with its file signature must return `415 unsupported_reference` before it reaches storage or Gemini; Task 2 and Task 14 pin this behavior.
- Reusing an `Idempotency-Key` with a different canonical request hash must return `409 idempotency_conflict`, while an identical request returns the original job; Task 3 and Task 14 pin this behavior.
- A restart after creator persistence but before visual generation must resume at the visual phase without repeating the creator call; Task 4 and Task 13 pin this behavior.
- An SSE reconnect with `Last-Event-ID` must replay only later monotonic events and then continue live; Task 14 pins this behavior.
- A long Spanish headline at 320px must neither overflow nor overlap the CTA in any family; Task 12 and Task 17 pin this behavior.

## File and Responsibility Map

### Shared contracts

- `src/shared/blueprintV2.ts` — serializable Blueprint V2 types and allowlisted enum values.
- `src/shared/generationApi.ts` — generation request, job status, event, artifact, audit, and bank DTOs.
- `src/shared/errorCodes.ts` — stable server/client error codes.

### Server

- `server/config.ts` — validated server-only environment configuration.
- `server/app.ts` and `server/index.ts` — Fastify composition and process entry point.
- `server/db/database.ts` and `server/db/migrations.ts` — SQLite lifecycle and schema.
- `server/storage/artifactStore.ts` — traversal-safe content-addressed file storage.
- `server/jobs/jobRepository.ts` — durable jobs, requests, events, attempts, blueprints, audits, and bank records.
- `server/jobs/jobState.ts` and `server/jobs/jobQueue.ts` — legal transitions, concurrency, cancellation, and restart recovery.
- `server/gemini/retryPolicy.ts` — retry classification, delay calculation, model switching, and deadline enforcement.
- `server/gemini/geminiClient.ts` — official SDK adapter behind a testable `GeminiPort`.
- `server/generation/blueprintSchemaV2.ts` — TypeBox schema and strict validation.
- `server/generation/evidenceCollector.ts` — isolated Playwright rendering and deterministic browser evidence.
- `server/generation/visualAssetService.ts` — explicit procedural visuals and generated-image normalization.
- `server/generation/generationWorker.ts` — durable creator → visual → draft → critic → final pipeline.
- `server/routes/generations.ts` and `server/routes/bank.ts` — HTTP and SSE API.
- `server/security/redaction.ts` — structured log and error redaction.

### Deterministic compiler and audit

- `src/generation-v2/ssotV2.ts` — deterministic vector and distinct-seed generation.
- `src/generation-v2/compiler/*` — safe document assembly, tokens, motion, assets, section variants, and page families.
- `src/generation-v2/audit/*` — objective blockers, technique evidence, and NoveltyBench score calculation.

### Browser

- `src/services/generationApiClient.ts` — HTTP and SSE adapter.
- `src/hooks/useGenerationJob.ts` — job lifecycle state machine for React.
- Existing `App.tsx`, progress, inspector, preview, and bank components — consume server DTOs and remove direct Gemini/storage writes.

### Verification

- `server/**/*.test.ts` — Node-environment unit and integration tests.
- `src/generation-v2/**/*.test.ts` — compiler and deterministic audit tests.
- `tests/fixtures/v2/*` — stable creator, critic, asset, and error fixtures.
- `tests/e2e/generation-v2.spec.ts` — full browser-to-server workflow.
- `tests/visual/families.spec.ts` — desktop, mobile, and 320px visual regression.

---

### Task 1: Establish the persistent Node server and secret boundary

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `vite.config.ts`
- Modify: `tsconfig.json`
- Modify: `.env.example`
- Modify: `.gitignore`
- Create: `vitest.server.config.ts`
- Create: `server/config.ts`
- Create: `server/app.ts`
- Create: `server/index.ts`
- Create: `server/app.test.ts`
- Create: `scripts/check-client-secrets.mjs`

**Interfaces:**
- Consumes: existing Vite client on port 5173.
- Produces: `loadServerConfig(env): ServerConfig`, `buildApp(deps?): FastifyInstance`, API port 8787, client proxy `/api`, production static hosting, and a client-bundle secret guard.

- [ ] **Step 1: Add a failing server health test**

```ts
// server/app.test.ts
// @vitest-environment node
import { afterEach, describe, expect, it } from 'vitest';
import { buildApp } from './app';

describe('server app', () => {
  const apps: Awaited<ReturnType<typeof buildApp>>[] = [];
  afterEach(async () => Promise.all(apps.splice(0).map(app => app.close())));

  it('exposes health without serializing secrets', async () => {
    const app = await buildApp({ config: {
      host: '127.0.0.1', port: 8787, clientOrigin: 'http://127.0.0.1:5173',
      dataDir: '.data-test', databasePath: ':memory:', geminiApiKey: 'secret-value',
      queueConcurrency: 2, providerDeadlineMs: 300_000,
      textModels: ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash'],
      imageModels: ['gemini-3.1-flash-image']
    }});
    apps.push(app);
    const response = await app.inject({ method: 'GET', url: '/api/health' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
    expect(response.body).not.toContain('secret-value');
  });
});
```

- [ ] **Step 2: Run the test and confirm the server modules do not exist**

Run: `npx vitest run --config vitest.server.config.ts server/app.test.ts`

Expected: FAIL because `server/app.ts` is missing.

- [ ] **Step 3: Install the server and build dependencies**

Run:

```bash
npm install fastify @fastify/cors @fastify/multipart @fastify/rate-limit @fastify/static @google/genai @sinclair/typebox @fontsource-variable/hanken-grotesk better-sqlite3 sharp playwright axe-core
npm install --save-dev @types/better-sqlite3 @types/node concurrently tsx tsup
```

Update `package.json` scripts to these exact responsibilities:

```json
{
  "dev": "concurrently -k \"npm:dev:client\" \"npm:dev:server\"",
  "dev:client": "vite",
  "dev:server": "tsx watch server/index.ts",
  "build:client": "tsc -p tsconfig.json && vite build --outDir dist/client",
  "build:server": "tsup server/index.ts --format esm --platform node --out-dir dist/server --sourcemap",
  "build": "npm run build:client && npm run build:server && npm run check:no-client-secrets",
  "start": "node dist/server/index.js",
  "test:server": "vitest run --config vitest.server.config.ts",
  "test:real": "cross-env GEMINI_REAL_TEST=1 vitest run --config vitest.server.config.ts server/gemini/geminiClient.live.test.ts",
  "check:no-client-secrets": "node scripts/check-client-secrets.mjs"
}
```

- [ ] **Step 4: Implement validated configuration and the Fastify shell**

```ts
// server/config.ts
export interface ServerConfig {
  host: string; port: number; clientOrigin: string; dataDir: string; databasePath: string;
  geminiApiKey: string; queueConcurrency: number; providerDeadlineMs: number;
  textModels: string[]; imageModels: string[];
}

export function loadServerConfig(env: NodeJS.ProcessEnv): ServerConfig {
  const geminiApiKey = env.GEMINI_API_KEY?.trim();
  if (!geminiApiKey) throw new Error('GEMINI_API_KEY is required');
  return {
    host: env.HOST || '127.0.0.1', port: Number(env.PORT || 8787),
    clientOrigin: env.CLIENT_ORIGIN || 'http://127.0.0.1:5173',
    dataDir: env.ENTROSPEC_DATA_DIR || '.data',
    databasePath: env.ENTROSPEC_DB_PATH || '.data/entrospec.sqlite', geminiApiKey,
    queueConcurrency: Number(env.GENERATION_CONCURRENCY || 2), providerDeadlineMs: 300_000,
    textModels: (env.GEMINI_TEXT_MODELS || 'gemini-3.8-flash,gemini-3.7-flash,gemini-3.6-flash').split(','),
    imageModels: (env.GEMINI_IMAGE_MODELS || 'gemini-3.1-flash-image,gemini-3-pro-image').split(',')
  };
}
```

`buildApp()` registers CORS for `clientOrigin`, multipart limits, rate limiting, `GET /api/health`, and `@fastify/static` only when `dist/client` exists. `server/index.ts` calls `loadServerConfig(process.env)`, builds the app, and listens with graceful `SIGINT`/`SIGTERM` shutdown.

- [ ] **Step 5: Configure client proxy, TypeScript, test environment, and secrets**

Set the Vite proxy target to `http://127.0.0.1:8787`. Add Node types and `server` to type checking without changing the browser lib assumptions by creating the server test config with `environment: 'node'`. Replace `.env.example` with server-only variables:

```dotenv
GEMINI_API_KEY=replace_with_a_new_rotated_key
GEMINI_TEXT_MODELS=gemini-3.8-flash,gemini-3.7-flash,gemini-3.6-flash
GEMINI_IMAGE_MODELS=gemini-3.1-flash-image,gemini-3-pro-image
ENTROSPEC_DATA_DIR=.data
ENTROSPEC_DB_PATH=.data/entrospec.sqlite
GENERATION_CONCURRENCY=2
CLIENT_ORIGIN=http://127.0.0.1:5173
```

Ignore `.data/`. `scripts/check-client-secrets.mjs` recursively scans `dist/client` and exits non-zero if it finds `VITE_GEMINI_`, `generativelanguage.googleapis.com`, or the value of `GEMINI_API_KEY`.

- [ ] **Step 6: Verify the server shell and production boundary**

Run:

```bash
npm run test:server -- server/app.test.ts
npm run build
```

Expected: health test passes; client and server build; secret guard passes.

- [ ] **Step 7: Commit the server foundation**

```bash
git add package.json package-lock.json vite.config.ts tsconfig.json .env.example .gitignore vitest.server.config.ts server/config.ts server/app.ts server/index.ts server/app.test.ts scripts/check-client-secrets.mjs
git commit -m "feat: establish secure generation server"
```

---

### Task 2: Define strict shared contracts and DesignBlueprintV2

**Files:**
- Create: `src/shared/errorCodes.ts`
- Create: `src/shared/generationApi.ts`
- Create: `src/shared/blueprintV2.ts`
- Create: `server/generation/blueprintSchemaV2.ts`
- Create: `server/generation/blueprintSchemaV2.test.ts`
- Create: `server/uploads/referenceValidation.ts`
- Create: `server/uploads/referenceValidation.test.ts`
- Create: `tests/fixtures/v2/blueprint.ts`

**Interfaces:**
- Consumes: `BrandBrief`, technique identifiers, capabilities, visual mode, and SSoT seed from the current client.
- Produces: `DesignBlueprintV2`, `GenerationRequestV2`, `GenerationJobDto`, `GenerationEventDto`, `ApiErrorCode`, `validateBlueprintV2(value)`, and `validateReference(bytes, declaredMime)`.

- [ ] **Step 1: Write failing contract tests**

```ts
// server/generation/blueprintSchemaV2.test.ts
// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { makeBlueprintV2 } from '../../tests/fixtures/v2/blueprint';
import { validateBlueprintV2 } from './blueprintSchemaV2';

describe('DesignBlueprintV2', () => {
  it('accepts a complete allowlisted blueprint', () => {
    expect(validateBlueprintV2(makeBlueprintV2()).ok).toBe(true);
  });

  it.each(['className', 'style', 'script', 'url'])('rejects model field %s', forbidden => {
    const value = makeBlueprintV2();
    (value.sections[0] as unknown as Record<string, unknown>)[forbidden] = 'https://example.com';
    expect(validateBlueprintV2(value)).toMatchObject({ ok: false });
  });

  it('rejects invented proof claims that lack a source brief key', () => {
    const value = makeBlueprintV2();
    value.sections[1].items = [{ heading: '10,000 clientes', body: 'Certificados', sourceBriefKey: 'missing' }];
    expect(validateBlueprintV2(value, new Set(['valueProposition']))).toMatchObject({ ok: false });
  });
});
```

```ts
// server/uploads/referenceValidation.test.ts
it('rejects a MIME and file-signature mismatch', () => {
  const jpeg = Uint8Array.from([0xff, 0xd8, 0xff, 0xdb]);
  expect(() => validateReference(jpeg, 'image/png')).toThrowError(expect.objectContaining({ code: 'unsupported_reference', status: 415 }));
});
```

- [ ] **Step 2: Run the tests and confirm missing modules**

Run: `npm run test:server -- server/generation/blueprintSchemaV2.test.ts server/uploads/referenceValidation.test.ts`

Expected: FAIL on missing shared contracts and validators.

- [ ] **Step 3: Define the exact shared blueprint types**

Create allowlisted string unions for the five families, density, focal position, contrast, image treatment, rhythm, font pair, composition variants, motion intensity, and section kinds. The central shape is:

```ts
export interface DesignBlueprintV2 {
  schemaVersion: 2;
  strategy: {
    brandName: string; audience: string; marketSophistication: 'low'|'medium'|'high';
    primaryPromise: string; primaryObjection: string; objectionResponse: string;
    tone: string; primaryAction: string;
  };
  artDirection: {
    family: 'swiss-split'|'bauhaus-asymmetry'|'fibonacci-editorial'|'broken-type-grid'|'seventies-editorial';
    density: 'airy'|'balanced'|'dense'; focalPosition: 'left'|'center'|'right';
    contrast: 'high'|'soft'; imageTreatment: 'full-bleed'|'contained'|'masked'|'none';
    rhythm: 'measured'|'alternating'|'cinematic'; motif: string;
  };
  tokens: DesignTokensV2;
  page: { maxWidth: 1080|1200|1320; navigation: 'minimal'|'indexed'; sectionGap: 72|96|128 };
  sections: LandingSectionV2[];
  motion: { intensity: 'none'|'subtle'|'expressive'; reveals: boolean; parallax: boolean };
  techniqueEvidence: Array<{ techniqueId: number; intent: string; observableEvidence: string }>;
  metadata: { seed: string; title: string; sourceBriefKeys: string[] };
}

export interface SsotVectorV2 {
  seed: string;
  chunks: Array<{ index: 1|2|3|4; raw: string; hash: number; selectedId: string }>;
  family: DesignBlueprintV2['artDirection']['family'];
  palette: { id: string; background: string; surface: string; accent: string; textPrimary: string; textSecondary: string };
  motionIntensity: 'none'|'subtle'|'expressive'; heroFocus: 'left'|'center'|'right';
  objectionStrategy: 'technical-proof'|'cost-of-inaction'|'risk-reversal'|'process-clarity'|'selective-fit';
}
```

`LandingSectionV2` is a discriminated union for `hero`, `proof`, `features`, `objection`, `faq`, `cta`, and `footer`. Every union member contains only semantic content and bounded layout fields. Item claims contain `sourceBriefKey`.

- [ ] **Step 4: Define API DTOs and stable error codes**

```ts
export type GenerationJobState =
  | 'queued' | 'queued_recovery' | 'creating' | 'preparing_visual' | 'compiling_draft'
  | 'reviewing' | 'refining' | 'validating' | 'complete' | 'failed_recoverable'
  | 'failed_permanent' | 'cancelled';

export interface GenerationRequestV2 {
  brief: BrandBrief; executedPrompt: string; ssotSeed: string; activeTechniqueIds: number[];
  imageMode: 'generated'|'procedural'; capabilities: Array<'svg'|'css-motion'|'interaction-js'|'canvas'>;
  referenceAssetId?: string;
}

export interface GenerationEventDto {
  sequence: number; jobId: string; state: GenerationJobState; messageCode: string;
  elapsedProviderMs: number; model?: string; attempt?: number; occurredAt: string;
}

export interface AuditCheckDto {
  id: string; category: 'document'|'accessibility'|'distinctiveness'|'ux'|'cro'|'stack'|'technique';
  status: 'pass'|'partial'|'fail'; weight: number; message: string; locations: string[];
}

export interface NoveltyAuditV2 {
  passesBank: boolean;
  scores: { distinctiveness: number; usabilityUx: number; conversionCro: number; stackFidelity: number; average: number };
  checks: AuditCheckDto[]; blockers: string[];
  techniqueEvidence: Array<{ techniqueId: number; status: 'applied'|'partial'|'failed'; summary: string; checkIds: string[] }>;
}

export interface BrowserEvidenceDto {
  viewports: Array<{ width: 1440|390|320; height: number; horizontalOverflow: boolean; screenshotPath?: string }>;
  overlaps: Array<{ first: string; second: string }>;
  remoteRequests: string[];
  headingOrderValid: boolean; brokenAnchors: string[]; unnamedInteractive: string[];
  contrastFailures: Array<{ selector: string; ratio: number; required: number }>;
  focusVisible: boolean; reducedMotionValid: boolean; axeViolationIds: string[];
}

export interface GenerationJobDto {
  id: string; parentJobId?: string; state: GenerationJobState; message: string;
  createdAt: string; updatedAt: string; providerElapsedMs: number; recoverable: boolean;
  currentAttempt?: { phase: 'creator'|'critic'|'image'; model: string; attempt: number };
  callSummary: { successfulTextPhases: 0|1|2; successfulImagePhases: 0|1; providerAttempts: number };
  artifact?: { url: string; downloadUrl: string; checksum: string; byteSize: number; visualSource: 'generated'|'procedural' };
  audit?: NoveltyAuditV2;
}
```

Error codes include `invalid_request`, `unsupported_reference`, `idempotency_conflict`, `provider_unavailable`, `quota_exceeded`, `invalid_credentials`, `invalid_blueprint`, `safety_block`, `job_not_found`, `job_not_recoverable`, and `artifact_not_ready`.

- [ ] **Step 5: Implement strict TypeBox validation and file-signature validation**

Set `additionalProperties: false` on every model-returned object. `validateBlueprintV2()` uses `Value.Errors` and returns `{ ok: true, value }` or `{ ok: false, issues }`; it accepts the allowed brief source keys to verify claims. `validateReference()` accepts PNG, JPEG, and WebP only, checks magic bytes, and caps reference size at 10 MiB.

- [ ] **Step 6: Verify contract tests and TypeScript**

Run:

```bash
npm run test:server -- server/generation/blueprintSchemaV2.test.ts server/uploads/referenceValidation.test.ts
npx tsc -p tsconfig.json --noEmit
```

Expected: all contract tests pass and types compile.

- [ ] **Step 7: Commit shared contracts**

```bash
git add src/shared server/generation/blueprintSchemaV2.ts server/generation/blueprintSchemaV2.test.ts server/uploads tests/fixtures/v2/blueprint.ts
git commit -m "feat: define strict landing blueprint v2"
```

---

### Task 3: Add SQLite persistence and traversal-safe artifact storage

**Files:**
- Create: `server/db/database.ts`
- Create: `server/db/migrations.ts`
- Create: `server/db/database.test.ts`
- Create: `server/storage/artifactStore.ts`
- Create: `server/storage/artifactStore.test.ts`
- Create: `server/jobs/jobRepository.ts`
- Create: `server/jobs/jobRepository.test.ts`

**Interfaces:**
- Consumes: shared job states, request DTOs, blueprints, audit DTOs, and server data paths.
- Produces: `openDatabase(path)`, `ArtifactStore`, and `JobRepository` with durable stage outputs, monotonic events, attempts, idempotency, bank admission, and legacy import.

- [ ] **Step 1: Write failing repository and path-safety tests**

```ts
it('returns the original job for an identical idempotent request', () => {
  const first = repository.createJob({ idempotencyKey: 'same', requestHash: 'hash-a', request });
  const second = repository.createJob({ idempotencyKey: 'same', requestHash: 'hash-a', request });
  expect(second.id).toBe(first.id);
});

it('rejects reuse of a key with a different request hash', () => {
  repository.createJob({ idempotencyKey: 'same', requestHash: 'hash-a', request });
  expect(() => repository.createJob({ idempotencyKey: 'same', requestHash: 'hash-b', request }))
    .toThrowError(expect.objectContaining({ code: 'idempotency_conflict' }));
});

it('never resolves an artifact path outside the data directory', async () => {
  await expect(store.read('../secret.txt')).rejects.toMatchObject({ code: 'artifact_path_invalid' });
});
```

- [ ] **Step 2: Run the tests and confirm persistence is absent**

Run: `npm run test:server -- server/db/database.test.ts server/storage/artifactStore.test.ts server/jobs/jobRepository.test.ts`

Expected: FAIL on missing database and repository modules.

- [ ] **Step 3: Create the SQLite schema in one transactional migration**

Create the nine tables from the spec with foreign keys enabled. The essential durable columns are:

```sql
CREATE TABLE generation_jobs (
  id TEXT PRIMARY KEY, parent_job_id TEXT, idempotency_key TEXT NOT NULL UNIQUE,
  request_hash TEXT NOT NULL, state TEXT NOT NULL, current_stage TEXT NOT NULL,
  provider_started_at TEXT, deadline_at TEXT, cancelled_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE generation_requests (job_id TEXT PRIMARY KEY, payload_json TEXT NOT NULL, FOREIGN KEY(job_id) REFERENCES generation_jobs(id));
CREATE TABLE generation_attempts (id INTEGER PRIMARY KEY AUTOINCREMENT, job_id TEXT NOT NULL, phase TEXT NOT NULL, model TEXT NOT NULL, attempt INTEGER NOT NULL, status_code INTEGER, error_code TEXT, provider_request_id TEXT, started_at TEXT NOT NULL, ended_at TEXT, FOREIGN KEY(job_id) REFERENCES generation_jobs(id));
CREATE TABLE generation_blueprints (job_id TEXT NOT NULL, phase TEXT NOT NULL, blueprint_json TEXT NOT NULL, valid INTEGER NOT NULL, created_at TEXT NOT NULL, PRIMARY KEY(job_id, phase));
CREATE TABLE generation_artifacts (job_id TEXT PRIMARY KEY, html_path TEXT NOT NULL, checksum TEXT NOT NULL, byte_size INTEGER NOT NULL, visual_source TEXT NOT NULL, bank_eligible INTEGER NOT NULL, FOREIGN KEY(job_id) REFERENCES generation_jobs(id));
CREATE TABLE generation_events (job_id TEXT NOT NULL, sequence INTEGER NOT NULL, state TEXT NOT NULL, message_code TEXT NOT NULL, payload_json TEXT NOT NULL, occurred_at TEXT NOT NULL, PRIMARY KEY(job_id, sequence));
CREATE TABLE visual_assets (content_hash TEXT PRIMARY KEY, mime_type TEXT NOT NULL, width INTEGER NOT NULL, height INTEGER NOT NULL, relative_path TEXT NOT NULL, provenance TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE audit_results (job_id TEXT PRIMARY KEY, result_json TEXT NOT NULL, average REAL NOT NULL, blocker_count INTEGER NOT NULL, FOREIGN KEY(job_id) REFERENCES generation_jobs(id));
CREATE TABLE bank_entries (job_id TEXT PRIMARY KEY, admitted_at TEXT NOT NULL, display_json TEXT NOT NULL, FOREIGN KEY(job_id) REFERENCES generation_jobs(id));
```

Store a migration version with `PRAGMA user_version = 1`.

- [ ] **Step 4: Implement content-addressed artifact storage**

`ArtifactStore.write(kind, bytes, extension)` computes SHA-256, writes through a temporary file and atomic rename under `<dataDir>/<kind>/<hash>.<extension>`, then returns metadata. `read(relativePath)` resolves both root and candidate with `path.resolve` and rejects candidates outside the configured root.

- [ ] **Step 5: Implement JobRepository transactions**

Expose these exact methods:

```ts
interface JobRepository {
  createJob(input: CreateJobInput): GenerationJobRow;
  getJob(id: string): GenerationJobRow | undefined;
  getRequest(id: string): GenerationRequestV2;
  transition(id: string, next: GenerationJobState, messageCode: string, payload?: object): GenerationEventDto;
  appendAttempt(input: ProviderAttemptRow): number;
  finishAttempt(id: number, result: { statusCode?: number; errorCode?: string; providerRequestId?: string }): void;
  saveBlueprint(jobId: string, phase: 'creator'|'refined', blueprint: DesignBlueprintV2): void;
  getBlueprint(jobId: string, phase: 'creator'|'refined'): DesignBlueprintV2 | undefined;
  saveArtifact(input: ArtifactRow): void;
  getArtifact(jobId: string): ArtifactRow | undefined;
  saveAudit(jobId: string, audit: NoveltyAuditV2): void;
  getAudit(jobId: string): NoveltyAuditV2 | undefined;
  listEvents(jobId: string, afterSequence: number): GenerationEventDto[];
  listRecoverableActiveJobs(): GenerationJobRow[];
  admitToBank(jobId: string, display: BankDisplayDto): void;
  listBank(): BankDisplayDto[];
  removeFromBank(jobId: string): void;
  importLegacy(records: unknown[]): { imported: number; rejected: number };
  countJobs(): number;
}
```

Define the consumed row types in the same module:

```ts
interface CreateJobInput { idempotencyKey: string; requestHash: string; request: GenerationRequestV2; parentJobId?: string }
interface GenerationJobRow { id: string; parentJobId?: string; requestHash: string; state: GenerationJobState; currentStage: string; deadlineAt?: string; createdAt: string; updatedAt: string }
interface ProviderAttemptRow { jobId: string; phase: 'creator'|'critic'|'image'; model: string; attempt: number; startedAt: string }
interface ArtifactRow { jobId: string; htmlPath: string; checksum: string; byteSize: number; visualSource: 'generated'|'procedural'; bankEligible: boolean }
interface BankDisplayDto { title: string; brandName: string; valueProposition: string; seed: string; average: number }
```

Define artifact storage explicitly:

```ts
interface StoredAsset { contentHash: string; relativePath: string; byteSize: number }
interface ArtifactStore {
  write(kind: 'references'|'images'|'screenshots'|'html', bytes: Uint8Array, extension: string): Promise<StoredAsset>;
  read(relativePath: string): Promise<Uint8Array>;
  resolve(relativePath: string): string;
}
```

`admitToBank` re-reads the stored audit and rejects average below 8.5 or blockers above zero.

- [ ] **Step 6: Run persistence tests**

Run: `npm run test:server -- server/db server/storage server/jobs/jobRepository.test.ts`

Expected: schema, idempotency, monotonic event, admission, and path tests pass.

- [ ] **Step 7: Commit persistence**

```bash
git add server/db server/storage server/jobs/jobRepository.ts server/jobs/jobRepository.test.ts
git commit -m "feat: persist generation jobs and artifacts"
```

---

### Task 4: Implement legal job transitions, bounded concurrency, cancellation, and recovery

**Files:**
- Create: `server/jobs/jobState.ts`
- Create: `server/jobs/jobState.test.ts`
- Create: `server/jobs/jobQueue.ts`
- Create: `server/jobs/jobQueue.test.ts`
- Modify: `server/app.ts`

**Interfaces:**
- Consumes: `JobRepository`, `GenerationJobState`, configured concurrency.
- Produces: `assertTransition(from, to)`, `JobQueue.enqueue(jobId)`, `cancel(jobId)`, `recover()`, and a worker callback `(jobId, signal) => Promise<void>`.

- [ ] **Step 1: Write failing state and queue tests**

```ts
it('rejects skipping from queued to complete', () => {
  expect(() => assertTransition('queued', 'complete')).toThrowError(/illegal transition/i);
});

it('never runs more than two jobs concurrently', async () => {
  const gate = deferred<void>();
  const worker = vi.fn(async () => gate.promise);
  const queue = new JobQueue({ concurrency: 2, repository, worker });
  queue.enqueue('job-1'); queue.enqueue('job-2'); queue.enqueue('job-3');
  await vi.waitFor(() => expect(worker).toHaveBeenCalledTimes(2));
  gate.resolve();
  await vi.waitFor(() => expect(worker).toHaveBeenCalledTimes(3));
});

it('recovers after creator without repeating creator work', async () => {
  repository.saveBlueprint('job-1', 'creator', makeBlueprintV2());
  repository.forceStateForTest('job-1', 'preparing_visual');
  await queue.recover();
  expect(worker).toHaveBeenCalledWith('job-1', expect.any(AbortSignal));
  expect(repository.getBlueprint('job-1', 'creator')).toBeDefined();
});
```

- [ ] **Step 2: Run tests and confirm missing state machine**

Run: `npm run test:server -- server/jobs/jobState.test.ts server/jobs/jobQueue.test.ts`

Expected: FAIL because queue and transition guard are missing.

- [ ] **Step 3: Implement the explicit transition graph**

Allow only:

```ts
const transitions: Record<GenerationJobState, readonly GenerationJobState[]> = {
  queued: ['creating', 'cancelled'], queued_recovery: ['creating', 'preparing_visual', 'compiling_draft', 'reviewing', 'refining', 'validating', 'cancelled'],
  creating: ['preparing_visual', 'failed_recoverable', 'failed_permanent', 'cancelled'],
  preparing_visual: ['compiling_draft', 'failed_recoverable', 'failed_permanent', 'cancelled'],
  compiling_draft: ['reviewing', 'failed_permanent', 'cancelled'], reviewing: ['refining', 'failed_permanent', 'cancelled'],
  refining: ['validating', 'failed_recoverable', 'failed_permanent', 'cancelled'],
  validating: ['complete', 'failed_permanent', 'cancelled'],
  complete: [], failed_recoverable: [], failed_permanent: [], cancelled: []
};
```

- [ ] **Step 4: Implement the queue**

Use an array of pending job IDs, a `Map<string, AbortController>` for active jobs, and a `Set<string>` to prevent duplicate enqueue. `recover()` asks the repository for active jobs, changes them to `queued_recovery`, and queues them. `cancel()` aborts active work or removes pending work, then records `cancelled` exactly once.

- [ ] **Step 5: Register queue startup and shutdown in Fastify lifecycle hooks**

Start recovery in `onReady`; abort active jobs and close the database in `onClose`. Do not begin provider work from the HTTP request handler.

- [ ] **Step 6: Run queue tests**

Run: `npm run test:server -- server/jobs/jobState.test.ts server/jobs/jobQueue.test.ts`

Expected: transition, concurrency, cancellation, duplicate enqueue, and recovery tests pass.

- [ ] **Step 7: Commit queue behavior**

```bash
git add server/jobs/jobState.ts server/jobs/jobState.test.ts server/jobs/jobQueue.ts server/jobs/jobQueue.test.ts server/app.ts
git commit -m "feat: add durable bounded generation queue"
```

---

### Task 5: Add resilient Gemini retry execution and the official SDK adapter

**Files:**
- Create: `server/security/redaction.ts`
- Create: `server/security/redaction.test.ts`
- Create: `server/gemini/retryPolicy.ts`
- Create: `server/gemini/retryPolicy.test.ts`
- Create: `server/gemini/geminiClient.ts`
- Create: `server/gemini/geminiClient.test.ts`
- Create: `server/gemini/geminiClient.live.test.ts`
- Modify: `server/app.ts`

**Interfaces:**
- Consumes: server config, strict Blueprint V2 schema, `JobRepository`, and `@google/genai`.
- Produces: `RetryExecutor`, `GeminiPort`, `createGeminiClient(config, repository)`, `validateConfiguredModels()`, and redacted errors.

- [ ] **Step 1: Write failing retry tests with fake time**

```ts
it('backs off and switches model after three 503 responses', async () => {
  vi.useFakeTimers();
  const operation = vi.fn()
    .mockRejectedValueOnce(providerError(503))
    .mockRejectedValueOnce(providerError(503))
    .mockRejectedValueOnce(providerError(503))
    .mockResolvedValue({ value: 'ok', providerRequestId: 'req-4' });
  const promise = executor.run({ phase: 'creator', models: ['a', 'b'], deadlineAt: clock.now() + 300_000, operation });
  await vi.runAllTimersAsync();
  await expect(promise).resolves.toMatchObject({ value: 'ok', model: 'b', attempts: 4 });
});

it.each([400, 401, 403])('does not retry status %s', async status => {
  const operation = vi.fn().mockRejectedValue(providerError(status));
  await expect(executor.run({ phase: 'creator', models: ['a'], deadlineAt: Date.now() + 300_000, operation })).rejects.toBeDefined();
  expect(operation).toHaveBeenCalledTimes(1);
});

it('uses Retry-After when it fits the remaining deadline', async () => {
  expect(nextDelayMs({ attempt: 1, retryAfter: '7', remainingMs: 20_000, jitter: () => 0.5 })).toBe(7000);
});
```

- [ ] **Step 2: Run tests and confirm the retry layer is missing**

Run: `npm run test:server -- server/gemini/retryPolicy.test.ts server/security/redaction.test.ts`

Expected: FAIL on missing modules.

- [ ] **Step 3: Implement typed provider errors and RetryExecutor**

```ts
export interface RetryRunInput<T> {
  phase: 'creator'|'critic'|'image'; models: string[]; deadlineAt: number; signal?: AbortSignal;
  operation(model: string, signal?: AbortSignal): Promise<{ value: T; providerRequestId?: string }>;
}

export interface RetryRunResult<T> { value: T; model: string; attempts: number; providerRequestId?: string }
```

Use the approved delay list, inject `clock`, `sleep`, and `random` for tests, classify only `408`, `429`, and `500–599` as transient, switch model after three consecutive transient failures, and throw `provider_unavailable` when the deadline cannot fit another attempt. Every attempt begins and ends a persisted attempt row.

- [ ] **Step 4: Implement the GeminiPort adapter**

```ts
export interface GeminiPort {
  validateConfiguredModels(): Promise<void>;
  createBlueprint(input: CreatorInput, signal?: AbortSignal): Promise<ProviderResult<DesignBlueprintV2>>;
  refineBlueprint(input: CriticInput, signal?: AbortSignal): Promise<ProviderResult<DesignBlueprintV2>>;
  createImage(input: ImageInput, signal?: AbortSignal): Promise<ProviderResult<{ mimeType: string; data: Uint8Array }>>;
}
```

Define its transport types beside the port so callers do not depend on SDK shapes:

```ts
interface ProviderResult<T> { value: T; providerRequestId?: string }
interface CreatorInput { request: GenerationRequestV2; ssot: SsotVectorV2; techniqueDirectives: string[]; briefSourceKeys: string[] }
interface CriticInput { request: GenerationRequestV2; creator: DesignBlueprintV2; findings: BrowserEvidenceDto; desktopWebp: Uint8Array; mobileWebp: Uint8Array }
interface ImageInput { prompt: string; references: Array<{ mimeType: 'image/png'|'image/jpeg'|'image/webp'; data: Uint8Array }> }
```

Use `GoogleGenAI` with `responseMimeType: 'application/json'` and the strict schema for both text phases. Creator temperature is `0.7`; critic temperature is `0.35`. Validate the returned JSON with `validateBlueprintV2`; do not fill missing creative fields. Image responses must contain supported inline image data.

- [ ] **Step 5: Validate configured models at server readiness**

List models once during startup. Every configured text model must support content generation and structured output; every image model must support image output. An invalid configuration rejects readiness and logs only the model identifier and stable error code.

- [ ] **Step 6: Implement recursive redaction**

Redact keys matching `/key|authorization|token|inlineData|dataUrl|prompt/i`, strip URL query strings, and truncate provider bodies to a stable classification. Add a test that serializing a nested error never contains `secret-value`, base64 image data, or the prompt.

- [ ] **Step 7: Add mocked adapter tests and a skipped live smoke test**

The adapter test injects a fake SDK client and asserts schema, model, and signal forwarding. The live test runs only when `GEMINI_REAL_TEST=1`, loads `GEMINI_API_KEY`, calls a minimal creator fixture, and prints only success/model/elapsed time.

- [ ] **Step 8: Verify retry and Gemini adapter tests**

Run: `npm run test:server -- server/gemini server/security/redaction.test.ts`

Expected: all mocked tests pass; live test is skipped.

- [ ] **Step 9: Commit provider resilience**

```bash
git add server/gemini server/security server/app.ts
git commit -m "feat: add resilient server-side Gemini gateway"
```

---

### Task 6: Create deterministic SSoT V2 selection

**Files:**
- Create: `src/generation-v2/ssotV2.ts`
- Create: `src/generation-v2/ssotV2.test.ts`
- Modify: `src/core/ssotEngine.ts`
- Modify: `src/types/index.ts`

**Interfaces:**
- Consumes: 24–32-character seed, selected capabilities, preferred and excluded colors.
- Produces: `deriveSsotV2(seed, constraints): SsotVectorV2` and `generateDistinctSeed(previous, randomBytes): string`.

- [ ] **Step 1: Write failing determinism and distinctness tests**

```ts
it('maps the same seed to the same vector', () => {
  expect(deriveSsotV2(SEED, constraints)).toEqual(deriveSsotV2(SEED, constraints));
});

it('generates a replacement that changes family, palette, and focal treatment', () => {
  const current = deriveSsotV2(SEED, constraints);
  const nextSeed = generateDistinctSeed(current, deterministicBytes);
  const next = deriveSsotV2(nextSeed, constraints);
  expect(next.family).not.toBe(current.family);
  expect(next.palette.id).not.toBe(current.palette.id);
  expect(next.heroFocus).not.toBe(current.heroFocus);
});

it('never selects an explicitly excluded accent', () => {
  expect(deriveSsotV2(SEED, { ...constraints, avoidColors: ['#22C55E'] }).palette.accent).not.toBe('#22C55E');
});
```

- [ ] **Step 2: Run tests and confirm V2 selection is absent**

Run: `npm test -- src/generation-v2/ssotV2.test.ts`

Expected: FAIL on missing module.

- [ ] **Step 3: Implement four-chunk deterministic mapping**

Define stable arrays for the five family IDs, five accessible palettes, three motion levels, five focal treatments, and five objection strategies. Use sum-mod for chunks one, two, and four and rolling hash for chunk three. Return both raw chunk evidence and selected IDs.

`generateDistinctSeed` tries at most 256 candidate seeds from injected bytes and returns the first whose family, palette ID, and hero focus all differ. Throw a descriptive error if the injected source cannot produce one.

- [ ] **Step 4: Delegate existing display data to SSoT V2 without changing current UI labels**

Keep `generateRandomSeed` for the browser, but route the displayed layout, palette, hero focus, and psychology angle through `deriveSsotV2`. Remove direct `window` access from pure hash functions so server code can import them.

- [ ] **Step 5: Verify existing and V2 SSoT tests**

Run: `npm test -- src/generation-v2/ssotV2.test.ts src/core`

Expected: deterministic V2 tests pass and existing UI compilation remains valid.

- [ ] **Step 6: Commit SSoT V2**

```bash
git add src/generation-v2/ssotV2.ts src/generation-v2/ssotV2.test.ts src/core/ssotEngine.ts src/types/index.ts
git commit -m "feat: derive deterministic landing direction"
```

---

### Task 7: Build the safe offline compiler foundation

**Files:**
- Create: `src/generation-v2/compiler/escape.ts`
- Create: `src/generation-v2/compiler/tokens.ts`
- Create: `src/generation-v2/compiler/motion.ts`
- Create: `src/generation-v2/compiler/assets.ts`
- Create: `src/generation-v2/compiler/document.ts`
- Create: `src/generation-v2/compiler/index.ts`
- Create: `src/generation-v2/compiler/compiler.test.ts`

**Interfaces:**
- Consumes: validated Blueprint V2, resolved embedded visual, and compiler options.
- Produces: `compileLanding(input): { html: string; checksumInput: string; manifest: CompileManifest }` with no model-provided executable code.

Define the compiler boundary in `compiler/index.ts`:

```ts
export interface ResolvedVisual { source: 'generated'|'procedural'; mimeType: 'image/webp'|'image/svg+xml'; dataUrl: string; alt: string }
export interface CompileManifest { family: DesignBlueprintV2['artDirection']['family']; sectionVariants: string[]; motionEnabled: boolean; embeddedAssetCount: number; techniqueIds: number[] }
export interface CompileLandingInput { blueprint: DesignBlueprintV2; visual: ResolvedVisual; fontAssets: Record<string, Uint8Array> }
export interface CompileLandingResult { html: string; checksumInput: string; manifest: CompileManifest }
export function compileLanding(input: CompileLandingInput): CompileLandingResult;
```

- [ ] **Step 1: Write failing compiler security tests**

```ts
it('escapes model and user text and emits no external request', () => {
  const blueprint = makeBlueprintV2({ strategy: { brandName: '<script>alert(1)</script>' } });
  const result = compileLanding({ blueprint, visual: proceduralVisual, fontAssets });
  expect(result.html).not.toContain('<script>alert(1)</script>');
  expect(result.html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
  expect(result.html).not.toMatch(/https?:\/\//);
});

it('is byte-stable for identical inputs', () => {
  const input = { blueprint: makeBlueprintV2(), visual: proceduralVisual, fontAssets };
  expect(compileLanding(input).html).toBe(compileLanding(input).html);
});

it('embeds a restrictive content security policy', () => {
  expect(compileLanding(input).html).toContain("default-src 'none'");
  expect(compileLanding(input).html).toContain("img-src data:");
});
```

- [ ] **Step 2: Run tests and confirm compiler modules are missing**

Run: `npm test -- src/generation-v2/compiler/compiler.test.ts`

Expected: FAIL on missing compiler.

- [ ] **Step 3: Implement escaping, allowlisted tokens, embedded assets, and motion**

`escapeHtml` and `escapeAttr` encode all five special characters. Token compilation accepts only schema-validated colors, sizes, family IDs, and numeric scales. Asset embedding accepts only validated `data:image/*` values or trusted server-provided bytes. Motion compiler emits one allowlisted reveal behavior and a `prefers-reduced-motion` override; it never concatenates blueprint script text.

- [ ] **Step 4: Assemble the offline document**

The document contains semantic `header`, `main`, `section`, and `footer`, an inline WOFF2 `@font-face`, embedded visual data, inline deterministic CSS, and allowlisted progressive JavaScript. It includes this CSP:

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; font-src data:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'none'; media-src data:">
```

Do not embed record IDs or timestamps, so repeated compilation stays byte-stable.

- [ ] **Step 5: Add the licensed font subset and license**

Resolve `@fontsource-variable/hanken-grotesk/files/hanken-grotesk-latin-wght-normal.woff2` with `createRequire(import.meta.url)`. Read and embed it server-side; the package supplies the Open Font License. Tests inject a short byte fixture rather than snapshotting the full font.

- [ ] **Step 6: Verify compiler security and determinism**

Run: `npm test -- src/generation-v2/compiler/compiler.test.ts`

Expected: escaping, CSP, offline, font embedding, and byte-stability tests pass.

- [ ] **Step 7: Commit the compiler foundation**

```bash
git add src/generation-v2/compiler
git commit -m "feat: compile safe offline landing documents"
```

---

### Task 8: Add semantic section variants and the Swiss family

**Files:**
- Create: `src/generation-v2/compiler/sections/types.ts`
- Create: `src/generation-v2/compiler/sections/registry.ts`
- Create: `src/generation-v2/compiler/sections/hero.ts`
- Create: `src/generation-v2/compiler/sections/proof.ts`
- Create: `src/generation-v2/compiler/sections/content.ts`
- Create: `src/generation-v2/compiler/sections/cta.ts`
- Create: `src/generation-v2/compiler/families/types.ts`
- Create: `src/generation-v2/compiler/families/registry.ts`
- Create: `src/generation-v2/compiler/families/swissSplit.ts`
- Create: `src/generation-v2/compiler/families/swissSplit.test.ts`
- Modify: `src/generation-v2/compiler/index.ts`

**Interfaces:**
- Consumes: individual `LandingSectionV2` unions and family-level blueprint direction.
- Produces: `renderSection(section, context)`, `renderFamilyShell(family, sections, context)`, and the `swiss-split` family.

- [ ] **Step 1: Write a failing Swiss composition test**

```ts
it('renders Swiss split with a structural signature and semantic regions', () => {
  const blueprint = makeBlueprintV2({ artDirection: { family: 'swiss-split' } });
  const html = compileLanding({ blueprint, visual, fontAssets }).html;
  expect(html).toContain('data-family="swiss-split"');
  expect(html).toContain('data-grid="12-column-split"');
  expect(html).toContain('<section');
  expect(html).toContain('data-variant="hero/split-monumental"');
});
```

- [ ] **Step 2: Run the test and confirm the registry is missing**

Run: `npm test -- src/generation-v2/compiler/families/swissSplit.test.ts`

Expected: FAIL because section and family registries do not exist.

- [ ] **Step 3: Implement the section registry**

Support these initial variants with exhaustive switches: `hero/split-monumental`, `hero/type-led`, `proof/editorial-ledger`, `proof/number-line`, `features/offset-list`, `objection/counterpoint`, `faq/stacked`, `cta/quiet-field`, and `footer/indexed`. Unknown variants throw before document assembly.

- [ ] **Step 4: Implement Swiss structural markup and CSS**

Use a 12-column desktop grid, left-aligned monumental type, a 7/5 hero split, quiet tonal surfaces, and an indexed navigation. Mobile collapses to one column at 760px, keeps body text at least 16px, and uses no decorative borders.

- [ ] **Step 5: Verify section exhaustiveness and Swiss output**

Run: `npm test -- src/generation-v2/compiler/families/swissSplit.test.ts src/generation-v2/compiler/compiler.test.ts`

Expected: all variants resolve and the existing compiler tests remain green.

- [ ] **Step 6: Commit Swiss family and shared sections**

```bash
git add src/generation-v2/compiler/sections src/generation-v2/compiler/families src/generation-v2/compiler/index.ts
git commit -m "feat: add Swiss editorial landing family"
```

---

### Task 9: Add Bauhaus and Fibonacci families with distinct DOM composition

**Files:**
- Create: `src/generation-v2/compiler/families/bauhausAsymmetry.ts`
- Create: `src/generation-v2/compiler/families/fibonacciEditorial.ts`
- Create: `src/generation-v2/compiler/families/bauhausFibonacci.test.ts`
- Modify: `src/generation-v2/compiler/families/registry.ts`

**Interfaces:**
- Consumes: family registry contract from Task 8.
- Produces: `bauhaus-asymmetry` and `fibonacci-editorial` renderers with unique structural signatures.

- [ ] **Step 1: Write failing distinctness tests**

```ts
it.each([
  ['bauhaus-asymmetry', 'offset-stage'],
  ['fibonacci-editorial', 'golden-rail']
] as const)('renders %s with signature %s', (family, signature) => {
  const html = compileLanding({ blueprint: makeBlueprintV2({ artDirection: { family } }), visual, fontAssets }).html;
  expect(html).toContain(`data-family="${family}"`);
  expect(html).toContain(`data-grid="${signature}"`);
});

it('does not reuse the Swiss hero DOM ordering', () => {
  const outputs = ['swiss-split', 'bauhaus-asymmetry', 'fibonacci-editorial'].map(family => normalizedStructure(compileFamily(family)));
  expect(new Set(outputs).size).toBe(3);
});
```

- [ ] **Step 2: Run the tests and confirm the families are unregistered**

Run: `npm test -- src/generation-v2/compiler/families/bauhausFibonacci.test.ts`

Expected: FAIL for unsupported family IDs.

- [ ] **Step 3: Implement Bauhaus asymmetry**

Use an offset stage with unequal blocks, a top-right focal visual, vertical type accents rendered as text rather than decorative lines, and alternating section alignment. DOM order places the visual before hero copy while CSS preserves accessible reading order through explicit grid areas, not flex `order`.

- [ ] **Step 4: Implement Fibonacci editorial**

Use a golden-ratio rail, restrained serif display type, progressive section widths, and a proof ledger that expands from narrow to wide. The visual occupies the large golden region and copy stays within a 62-character measure.

- [ ] **Step 5: Verify structure, accessibility order, and regressions**

Run: `npm test -- src/generation-v2/compiler/families src/generation-v2/compiler/compiler.test.ts`

Expected: three family structures are distinct and compiler security remains green.

- [ ] **Step 6: Commit two families**

```bash
git add src/generation-v2/compiler/families
git commit -m "feat: add Bauhaus and Fibonacci landing families"
```

---

### Task 10: Add broken-grid and seventies editorial families

**Files:**
- Create: `src/generation-v2/compiler/families/brokenTypeGrid.ts`
- Create: `src/generation-v2/compiler/families/seventiesEditorial.ts`
- Create: `src/generation-v2/compiler/families/brokenSeventies.test.ts`
- Modify: `src/generation-v2/compiler/families/registry.ts`

**Interfaces:**
- Consumes: family registry and shared section variants.
- Produces: the final two composition families and a registry containing all five approved IDs.

- [ ] **Step 1: Write failing all-family uniqueness tests**

```ts
it('provides five unique family structures', () => {
  const families = ['swiss-split','bauhaus-asymmetry','fibonacci-editorial','broken-type-grid','seventies-editorial'] as const;
  const signatures = families.map(family => normalizedStructure(compileFamily(family)));
  expect(new Set(signatures).size).toBe(5);
});

it.each(['broken-type-grid', 'seventies-editorial'] as const)('contains no border or gradient CSS in %s', family => {
  const html = compileFamily(family);
  expect(html).not.toMatch(/\bborder(?:-|:)/i);
  expect(html).not.toMatch(/linear-gradient|radial-gradient/i);
});
```

- [ ] **Step 2: Run tests and confirm two families are missing**

Run: `npm test -- src/generation-v2/compiler/families/brokenSeventies.test.ts`

Expected: FAIL for unregistered families.

- [ ] **Step 3: Implement broken type grid**

Use controlled row and column offsets, oversized clipped typography with accessible full text still present, deliberate empty fields, and a media block crossing two grid regions. At mobile width, remove clipping and restore ordinary document flow.

- [ ] **Step 4: Implement seventies editorial**

Use warm tonal surfaces, serif/sans contrast, a masthead-like hero, staggered text columns, and restrained typographic ornaments made from characters. Keep all ornaments `aria-hidden` and avoid decorative container boundaries.

- [ ] **Step 5: Verify all five families**

Run: `npm test -- src/generation-v2/compiler`

Expected: five distinct structures; no external URLs, borders, generic gradients, or unsafe content.

- [ ] **Step 6: Commit final family set**

```bash
git add src/generation-v2/compiler/families
git commit -m "feat: complete five landing composition families"
```

---

### Task 11: Replace shallow scoring with deterministic quality and admission audit

**Files:**
- Create: `src/generation-v2/audit/types.ts`
- Create: `src/generation-v2/audit/documentChecks.ts`
- Create: `src/generation-v2/audit/techniqueChecks.ts`
- Create: `src/generation-v2/audit/noveltyScore.ts`
- Create: `src/generation-v2/audit/index.ts`
- Create: `src/generation-v2/audit/audit.test.ts`
- Create: `tests/fixtures/v2/evidence.ts`

**Interfaces:**
- Consumes: final HTML, refined blueprint, selected techniques, visual provenance, and browser evidence.
- Produces: `auditLandingV2(input): NoveltyAuditV2` with explicit checks, four scores, average, blockers, and `passesBank`.

- [ ] **Step 1: Write failing blocker and score tests**

```ts
it.each([
  ['horizontal-overflow', { horizontalOverflow: true }],
  ['element-overlap', { overlaps: [{ first: '#hero h1', second: '#hero .cta' }] }],
  ['remote-request', { remoteRequests: ['https://example.com/font.woff2'] }],
  ['missing-focus', { focusVisible: false }]
])('blocks the bank for %s', (_name, evidencePatch) => {
  const audit = auditLandingV2(makeAuditInput(evidencePatch));
  expect(audit.passesBank).toBe(false);
  expect(audit.blockers.length).toBeGreaterThan(0);
});

it('requires matching visual provenance and average 8.5', () => {
  const audit = auditLandingV2(makeAuditInput({ visualSource: 'procedural', requestedImageMode: 'generated' }));
  expect(audit.passesBank).toBe(false);
});
```

- [ ] **Step 2: Run tests and confirm audit V2 is missing**

Run: `npm test -- src/generation-v2/audit/audit.test.ts`

Expected: FAIL on missing audit implementation.

- [ ] **Step 3: Implement objective document and accessibility blockers**

Represent every check as `{ id, category, status, weight, message, locations }`. Add checks for unsafe HTML, remote requests, horizontal overflow, overlaps, accessible CTA name, heading order, anchors, contrast, focus visibility, reduced motion, missing sections, visual provenance, and banned copy/visual patterns.

- [ ] **Step 4: Implement observable technique checks**

Map each technique ID to evidence from the refined blueprint, compiler manifest, and browser evidence. Remove any unconditional passing check. Technique 3 passes only when both creator and critic blueprints exist and the final audit is computed; technique 4 uses exact asset provenance.

- [ ] **Step 5: Calculate four independent NoveltyBench scores**

Distinctiveness weights family uniqueness, focal hierarchy, and anti-slop results. UX weights comprehension, overflow, contrast, focus, and heading structure. CRO weights promise, objection response, proof grounding, and CTA specificity. Stack fidelity weights offline behavior, safe compilation, reduced motion, and valid evidence. Convert weighted ratios to 1–10 separately; average them; set `passesBank` only when average ≥ 8.5 and blockers are empty.

- [ ] **Step 6: Verify every objective blocker and threshold edge**

Run: `npm test -- src/generation-v2/audit/audit.test.ts`

Expected: each blocker test fails admission; 8.4 is rejected; 8.5 with no blocker is accepted.

- [ ] **Step 7: Commit deterministic audit**

```bash
git add src/generation-v2/audit tests/fixtures/v2/evidence.ts
git commit -m "feat: enforce observable landing quality gate"
```

---

### Task 12: Capture isolated desktop and mobile evidence with Playwright

**Files:**
- Create: `server/generation/evidenceCollector.ts`
- Create: `server/generation/evidenceCollector.test.ts`
- Create: `server/generation/browserProbe.ts`
- Modify: `server/storage/artifactStore.ts`

**Interfaces:**
- Consumes: compiled HTML and `ArtifactStore`.
- Produces: `EvidenceCollector.capture(jobId, html, signal): Promise<BrowserEvidence>` with screenshots and deterministic diagnostics.

Reuse the shared evidence contract in `evidenceCollector.ts`:

```ts
import type { BrowserEvidenceDto } from '../../src/shared/generationApi';
export type BrowserEvidence = BrowserEvidenceDto;
```

- [ ] **Step 1: Write a failing evidence test including the 320px review case**

```ts
it('detects long-headline overflow and blocks all outbound requests', async () => {
  const html = fixtureHtml({ heading: 'Una decisión operativa extremadamente extensa que debe seguir siendo legible sin invadir la acción principal' });
  const evidence = await collector.capture('job-1', html);
  expect(evidence.viewports.map(item => item.width)).toEqual([1440, 390, 320]);
  expect(evidence.remoteRequests).toEqual([]);
  expect(evidence.viewports.find(item => item.width === 320)?.horizontalOverflow).toBe(false);
  expect(evidence.overlaps).toEqual([]);
});
```

- [ ] **Step 2: Run the test and confirm the collector is missing**

Run: `npm run test:server -- server/generation/evidenceCollector.test.ts`

Expected: FAIL on missing evidence collector.

- [ ] **Step 3: Implement isolated browser contexts and network denial**

Create one new Playwright context per capture. Route all requests and abort any URL whose protocol is not `data:`, `about:`, or `blob:` while recording it as a remote request. Set reduced motion once to `no-preference` and once to `reduce`. Close the page and context in `finally`, including cancellation.

- [ ] **Step 4: Implement browser probes**

At 1440×1000, 390×844, and 320×800 collect document scroll width, element bounding boxes, heading order, anchor targets, accessible names, computed foreground/background colors, focus treatment, and motion-state differences. Use axe-core for WCAG AA findings and add custom overlap checks for visible text and interactive elements.

- [ ] **Step 5: Persist screenshots and return stable evidence**

Save desktop and mobile WebP screenshots through `ArtifactStore`. Do not send the 320px screenshot to Gemini; use it only for local validation. Sort findings by ID and selector so repeated runs are stable.

- [ ] **Step 6: Verify evidence capture**

Run: `npm run test:server -- server/generation/evidenceCollector.test.ts`

Expected: normal fixture has no overflow or overlap; intentionally broken fixture reports both; outbound request is aborted and recorded.

- [ ] **Step 7: Commit browser evidence capture**

```bash
git add server/generation/evidenceCollector.ts server/generation/evidenceCollector.test.ts server/generation/browserProbe.ts server/storage/artifactStore.ts
git commit -m "feat: capture landing quality evidence"
```

---

### Task 13: Orchestrate the durable creator-visual-critic pipeline

**Files:**
- Create: `server/generation/visualAssetService.ts`
- Create: `server/generation/visualAssetService.test.ts`
- Create: `server/generation/generationWorker.ts`
- Create: `server/generation/generationWorker.test.ts`
- Modify: `server/app.ts`
- Modify: `server/jobs/jobQueue.ts`

**Interfaces:**
- Consumes: `GeminiPort`, `RetryExecutor`, `JobRepository`, `ArtifactStore`, compiler, evidence collector, audit, and queue signal.
- Produces: `GenerationWorker.run(jobId, signal): Promise<void>` and durable resumable stages.

- [ ] **Step 1: Write failing successful-flow, no-fallback, and recovery tests**

```ts
it('runs two text phases and one requested image phase', async () => {
  await worker.run('job-1', new AbortController().signal);
  expect(gemini.createBlueprint).toHaveBeenCalledTimes(1);
  expect(gemini.createImage).toHaveBeenCalledTimes(1);
  expect(gemini.refineBlueprint).toHaveBeenCalledTimes(1);
  expect(repository.getJob('job-1')?.state).toBe('complete');
});

it('does not substitute procedural output after generated image failure', async () => {
  gemini.createImage.mockRejectedValue(providerUnavailable());
  await worker.run('job-1', new AbortController().signal);
  expect(repository.getJob('job-1')?.state).toBe('failed_recoverable');
  expect(repository.getArtifact('job-1')).toBeUndefined();
});

it('resumes from persisted creator output', async () => {
  repository.saveBlueprint('job-1', 'creator', makeBlueprintV2());
  repository.forceStateForTest('job-1', 'queued_recovery');
  await worker.run('job-1', new AbortController().signal);
  expect(gemini.createBlueprint).not.toHaveBeenCalled();
  expect(gemini.createImage).toHaveBeenCalledTimes(1);
});
```

- [ ] **Step 2: Run tests and confirm worker is missing**

Run: `npm run test:server -- server/generation/visualAssetService.test.ts server/generation/generationWorker.test.ts`

Expected: FAIL on missing worker and visual service.

- [ ] **Step 3: Implement explicit visual modes**

For `generated`, call Gemini through RetryExecutor, validate PNG/JPEG/WebP bytes, normalize with Sharp to WebP within 1600×1200, and store by content hash. For `procedural`, generate an SVG derived from the approved family, palette, focal position, and seed. The result provenance is exactly `generated` or `procedural`; remove `fallback-procedural` from V2.

- [ ] **Step 4: Implement stage-aware durable orchestration**

For each stage, first check whether its durable output already exists. The ordered work is:

```ts
creator blueprint -> visual asset -> draft compile -> evidence capture -> critic blueprint -> final compile -> final evidence -> audit -> artifact -> complete
```

Persist each output before transitioning. Start the five-minute provider deadline immediately before the first provider phase. Compile and local audit time do not reset the deadline. Convert exhausted transient errors to `failed_recoverable`; invalid request, schema, safety, and compiler failures become `failed_permanent`; cancellation remains `cancelled`.

- [ ] **Step 5: Build exact creator and critic inputs**

Creator receives normalized request, SSoT V2 vector, technique definitions, negative constraints, and brief source keys. Critic receives the same request, creator blueprint, deterministic draft findings, and base64 desktop/mobile screenshots. Critic output is a complete Blueprint V2 and cannot trigger another image call.

- [ ] **Step 6: Record physical attempts and logical call totals**

The artifact summary reports `{ successfulTextPhases: 2, successfulImagePhases: 0|1, providerAttempts: number }`. A recovered stage reads persisted totals rather than incrementing successful phases again.

- [ ] **Step 7: Verify the worker suite and full server suite**

Run:

```bash
npm run test:server -- server/generation
npm run test:server
```

Expected: success, generated failure, procedural choice, cancellation, invalid blueprint, deadline, and restart-resume tests pass.

- [ ] **Step 8: Commit the generation worker**

```bash
git add server/generation/visualAssetService.ts server/generation/visualAssetService.test.ts server/generation/generationWorker.ts server/generation/generationWorker.test.ts server/app.ts server/jobs/jobQueue.ts
git commit -m "feat: orchestrate creator critic landing jobs"
```

---

### Task 14: Expose generation, SSE, artifact, retry, cancellation, bank, and legacy-import APIs

**Files:**
- Create: `server/routes/generations.ts`
- Create: `server/routes/generations.test.ts`
- Create: `server/routes/bank.ts`
- Create: `server/routes/bank.test.ts`
- Create: `server/routes/legacyImport.ts`
- Create: `server/routes/legacyImport.test.ts`
- Modify: `server/app.ts`

**Interfaces:**
- Consumes: repository, queue, upload validation, artifact store, and shared DTOs.
- Produces: the HTTP API specified in the design, replayable SSE, server-enforced bank gate, and a one-time legacy import.

- [ ] **Step 1: Write failing route tests for creation, conflict, and MIME mismatch**

```ts
it('returns 202 and deduplicates an identical idempotent request', async () => {
  const first = await app.inject({ method: 'POST', url: '/api/generations', headers: { 'idempotency-key': 'key-1' }, payload: request });
  const second = await app.inject({ method: 'POST', url: '/api/generations', headers: { 'idempotency-key': 'key-1' }, payload: request });
  expect(first.statusCode).toBe(202);
  expect(second.json().jobId).toBe(first.json().jobId);
});

it('returns 409 when the key is reused for different content', async () => {
  await create('key-1', request);
  const response = await create('key-1', { ...request, ssotSeed: 'DifferentSeedValue1234567890' });
  expect(response.statusCode).toBe(409);
  expect(response.json().code).toBe('idempotency_conflict');
});

it('returns 415 before persisting a mismatched reference', async () => {
  const response = await uploadReference({ declaredMime: 'image/png', bytes: jpegBytes });
  expect(response.statusCode).toBe(415);
  expect(repository.countJobs()).toBe(0);
});
```

- [ ] **Step 2: Write a failing SSE replay test**

```ts
it('replays only events after Last-Event-ID and continues live', async () => {
  repository.appendTestEvents('job-1', [1, 2, 3]);
  const stream = await openEventStream(app, 'job-1', { lastEventId: '1' });
  expect(await stream.next()).toMatchObject({ id: '2' });
  expect(await stream.next()).toMatchObject({ id: '3' });
  repository.transition('job-1', 'creating', 'creator_started');
  expect(await stream.next()).toMatchObject({ id: '4' });
});
```

- [ ] **Step 3: Run route tests and confirm endpoints are missing**

Run: `npm run test:server -- server/routes`

Expected: FAIL with 404 or missing route modules.

- [ ] **Step 4: Implement generation and artifact routes**

Implement the exact endpoints from the spec. Canonicalize JSON by recursively sorting object keys before hashing. Require `Idempotency-Key` on creation. Return only user-safe DTOs. Artifact route sets `Content-Type: text/html; charset=utf-8` and `Content-Disposition: attachment` when `?download=1`.

- [ ] **Step 5: Implement replayable SSE**

Parse `Last-Event-ID`, send persisted events with larger sequence values, subscribe to repository event notifications, emit heartbeats every 20 seconds, and clean up listeners on connection close. Event IDs are the persisted sequence numbers.

- [ ] **Step 6: Implement retry and cancellation**

Retry accepts only `failed_recoverable`, creates a child job with a new idempotency key generated server-side, preserves request and assets, and sets `parentJobId`. Cancellation is idempotent and returns the current job DTO.

- [ ] **Step 7: Implement bank and legacy import enforcement**

Bank admission revalidates the stored audit. List and retrieve return server records; remove deletes only the bank entry, not the artifact. Legacy import accepts an array of completed IndexedDB records, validates their old schema, stores them as `legacy: true` drafts, and never admits them automatically.

- [ ] **Step 8: Add request limits and route-level error mapping**

Limit JSON to 1 MiB, references to 10 MiB, prompt to 20,000 characters, creation to 10 requests per minute per IP, and retry to 6 per hour per job. Map stable error codes to 400/401/403/404/409/415/429/500/503 without returning stack traces.

- [ ] **Step 9: Verify all API routes**

Run: `npm run test:server -- server/routes`

Expected: creation, deduplication, conflict, upload validation, SSE replay, cancellation, recovery, download, bank gate, and legacy import tests pass.

- [ ] **Step 10: Commit the HTTP API**

```bash
git add server/routes server/app.ts
git commit -m "feat: expose durable landing generation API"
```

---

### Task 15: Add the typed browser API client and React job hook

**Files:**
- Create: `src/services/generationApiClient.ts`
- Create: `src/services/generationApiClient.test.ts`
- Create: `src/hooks/useGenerationJob.ts`
- Create: `src/hooks/useGenerationJob.test.tsx`
- Delete: `src/services/geminiGateway.ts`
- Delete: `src/services/geminiGateway.test.ts`
- Delete: `src/services/geminiGateway.live.test.ts`

**Interfaces:**
- Consumes: shared API DTOs and relative `/api` endpoints.
- Produces: `GenerationApiClient` and `useGenerationJob()` with create, reconnect, cancel, retry, reset, and terminal result loading.

- [ ] **Step 1: Write failing client and hook tests**

```ts
it('uses only relative API URLs and sends idempotency', async () => {
  await client.createGeneration(request, 'idempotency-1');
  expect(fetchMock).toHaveBeenCalledWith('/api/generations', expect.objectContaining({
    method: 'POST', headers: expect.objectContaining({ 'Idempotency-Key': 'idempotency-1' })
  }));
  expect(JSON.stringify(fetchMock.mock.calls)).not.toContain('generativelanguage.googleapis.com');
});

it('reconnects SSE from the last event and loads the completed artifact', async () => {
  const { result } = renderHook(() => useGenerationJob(client));
  await act(() => result.current.start(request));
  fakeEvents.emit({ sequence: 4, state: 'complete', messageCode: 'complete' });
  await waitFor(() => expect(result.current.job?.state).toBe('complete'));
  expect(client.getArtifact).toHaveBeenCalledWith(result.current.job?.id);
});
```

- [ ] **Step 2: Run tests and confirm the new client is absent**

Run: `npm test -- src/services/generationApiClient.test.ts src/hooks/useGenerationJob.test.tsx`

Expected: FAIL on missing modules.

- [ ] **Step 3: Implement the API client**

Expose `createGeneration`, `getJob`, `subscribeEvents`, `cancel`, `retry`, `getArtifact`, `listBank`, `admitToBank`, `removeFromBank`, and `importLegacy`. Convert non-2xx JSON to an `ApiClientError` containing only stable code, status, and message.

Because native `EventSource` cannot set `Last-Event-ID`, use `fetch` streaming and parse SSE frames. Reconnect with the last sequence in the header and exponential client reconnect delays capped at 10 seconds; stop reconnecting at terminal job states.

- [ ] **Step 4: Implement the React hook**

The hook owns `job`, `events`, `artifactHtml`, `error`, and `isBusy`. It preserves the last completed preview while a later job is active or fails. `retry()` calls the server retry endpoint rather than resubmitting the brief.

- [ ] **Step 5: Remove all browser Gemini code**

Delete the old gateway and live test. Remove imports and references in preparation for App migration. Do not remove legacy generation modules until App no longer consumes them in Task 16.

- [ ] **Step 6: Verify client and hook tests**

Run: `npm test -- src/services/generationApiClient.test.ts src/hooks/useGenerationJob.test.tsx`

Expected: relative URL, idempotency, replay, retry, cancellation, terminal state, and preserved-preview tests pass.

- [ ] **Step 7: Commit the browser transport migration**

```bash
git add src/services src/hooks
git commit -m "feat: consume generation jobs from browser"
```

---

### Task 16: Migrate Studio, progress, inspector, preview, and bank to server jobs

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/GenerationProgress.tsx`
- Modify: `src/components/GenerationInspector.tsx`
- Modify: `src/components/SandboxPreview.tsx`
- Modify: `src/components/LandingBank.tsx`
- Modify: `src/components/GenerationInspector.test.tsx`
- Modify: `src/components/SandboxPreview.test.tsx`
- Modify: `src/components/LandingBank.test.tsx`
- Create: `src/components/GenerationProgress.test.tsx`
- Modify: `src/storage/projectRepository.ts`
- Modify: `src/storage/projectRepository.test.ts`

**Interfaces:**
- Consumes: `useGenerationJob`, server job DTOs, artifacts, audit details, and bank endpoints.
- Produces: accurate job UX, server-backed bank, one-time legacy import, and safe artifact download.

- [ ] **Step 1: Write failing progress and inspector tests**

```tsx
it('shows retry state without raw provider data', () => {
  render(<GenerationProgress job={makeJob({ state: 'creating', currentAttempt: { model: 'gemini-3.8-flash', attempt: 2 }, message: 'Esperando capacidad' })} />);
  expect(screen.getByText('Esperando capacidad')).toBeVisible();
  expect(screen.getByText(/intento 2/i)).toBeVisible();
  expect(screen.queryByText(/api key|stack|inlineData/i)).not.toBeInTheDocument();
});

it('blocks bank action for a draft below 8.5', () => {
  render(<SandboxPreview job={makeCompletedJob({ average: 8.4, passesBank: false })} />);
  expect(screen.getByRole('button', { name: /enviar al banco/i })).toBeDisabled();
  expect(screen.getByText(/no alcanza el umbral/i)).toBeVisible();
});
```

- [ ] **Step 2: Run component tests and confirm prop contracts fail**

Run: `npm test -- src/components/GenerationProgress.test.tsx src/components/GenerationInspector.test.tsx src/components/SandboxPreview.test.tsx src/components/LandingBank.test.tsx`

Expected: FAIL because components still require legacy `GenerationRecord` and local repository callbacks.

- [ ] **Step 3: Replace App's client pipeline with `useGenerationJob`**

Remove `createGeminiGateway`, `createGenerationPipeline`, and browser codec creation from `App.tsx`. Build a `GenerationRequestV2`, create a cryptographically random idempotency key per deliberate submission, and call `start`. Keep the last artifact visible during later work. Expose cancel while busy and retry only for `failed_recoverable`.

- [ ] **Step 4: Render all durable states accurately**

Map every server state to Spanish copy. Show current model, physical attempt, provider elapsed time, and a functional cancellation action. Do not show decorative live indicators. Recoverable failure displays `Reintentar generación`; permanent failure explains the stable error without a retry button.

- [ ] **Step 5: Expand the inspector**

Tabs become `solicitud`, `creator`, `refinado`, `evidencia`, and `intentos`. Show exact successful logical phases separately from provider attempts. Include visual provenance, all objective checks, four independent scores, blockers, technique evidence, and admission decision.

- [ ] **Step 6: Move bank and downloads to the server**

`SandboxPreview` downloads through the artifact endpoint and admits through the bank endpoint. `LandingBank` loads, opens, and removes server records. On first load, read existing IndexedDB records, call `importLegacy`, and mark successful migration locally; keep failed legacy imports intact for another attempt.

- [ ] **Step 7: Retire legacy browser writes after migration**

Reduce `projectRepository` to legacy-read and migration-marker responsibilities. Remove new draft, curated, and visual-asset writes. Keep its old tests only for safe legacy parsing and non-destructive failed import.

- [ ] **Step 8: Verify all browser tests**

Run:

```bash
npm test -- src/components src/hooks src/services/generationApiClient.test.ts src/storage/projectRepository.test.ts
npm run build
```

Expected: components represent every state, below-threshold admission is disabled, legacy migration is safe, and no browser Gemini symbol remains.

- [ ] **Step 9: Commit the Studio migration**

```bash
git add src/App.tsx src/components src/storage/projectRepository.ts src/storage/projectRepository.test.ts
git commit -m "feat: migrate Studio to persistent generation jobs"
```

---

### Task 17: Complete end-to-end, visual, security, restart, and operating documentation

**Files:**
- Create: `server/test/testServer.ts`
- Create: `server/test/fakeGemini.ts`
- Create: `tests/fixtures/v2/creator-blueprint.json`
- Create: `tests/fixtures/v2/critic-blueprint.json`
- Create: `tests/e2e/generation-v2.spec.ts`
- Create: `tests/e2e/security.spec.ts`
- Create: `tests/visual/families.spec.ts`
- Modify: `playwright.config.ts`
- Modify: `docs/GUIA_DE_PRUEBAS.md`
- Create: `docs/OPERACION_SERVIDOR.md`
- Delete: `tests/e2e/generation.spec.ts`
- Delete: `tests/fixtures/valid-blueprint.json`
- Delete: `tests/fixtures/generated-image.json`

**Interfaces:**
- Consumes: complete server, browser application, five families, fake Gemini, and durable database.
- Produces: reproducible browser verification, visual fixtures, restart proof, security checks, and operating instructions.

- [ ] **Step 1: Create a deterministic fake Gemini and test server**

`FakeGemini` implements `GeminiPort`, records calls, and selects fixture responses from request header `X-Test-Scenario`. Supported scenarios are `success-generated`, `success-procedural`, `transient-503`, `permanent-401`, `invalid-blueprint`, `image-failure`, and `slow-cancellable`. `testServer.ts` injects the fake, uses a temporary SQLite/data directory, and listens on 8787 only when `NODE_ENV=test`.

- [ ] **Step 2: Update Playwright to launch both processes**

Use two `webServer` entries: Vite at 4173 with proxy target 8787, and the test server at 8787. Remove every `VITE_GEMINI_API_KEY` value. Retain desktop, tablet, and mobile projects and add a `visual-320` project with viewport 320×800.

- [ ] **Step 3: Write the failing full generation test**

```ts
test('creates, reviews, downloads, and admits a qualified landing', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Nombre de marca').fill('Northline');
  await page.getByRole('button', { name: /construir landing/i }).click();
  await expect(page.getByText('Completado')).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTitle('Landing Sandbox Preview')).toBeVisible();
  await expect(page.getByText(/2 fases de texto/i)).toBeVisible();
  await page.getByRole('button', { name: /enviar al banco/i }).click();
  await page.getByRole('button', { name: /^Banco \(1\)$/i }).click();
  await expect(page.getByLabel('Prompt de origen')).toBeVisible();
});
```

- [ ] **Step 4: Run the new E2E test and confirm the legacy client cannot satisfy it**

Run: `npm run test:e2e -- tests/e2e/generation-v2.spec.ts`

Expected: FAIL because the browser still calls the legacy direct Gemini path or the two-phase server job is not available to the test harness.

- [ ] **Step 5: Add recovery, cancellation, and bank-gate E2E cases**

Verify transient 503 eventually completes without a second job, five-minute exhaustion shows preserved retry data using an injected short test deadline, cancellation remains terminal, invalid credentials fail permanently, image failure never renders a procedural substitute, and an 8.4 draft cannot be admitted.

- [ ] **Step 6: Add the browser security test**

Capture all requests and loaded scripts. Assert no request host contains `generativelanguage.googleapis.com`, no script text contains `VITE_GEMINI_`, and neither the configured fake secret nor `GEMINI_API_KEY` appears in page content or built client assets.

- [ ] **Step 7: Add visual regression for every family**

For each family fixture, render final HTML at 1440×1000, 390×844, and 320×800. Assert `document.documentElement.scrollWidth <= innerWidth`, no overlap evidence, and snapshot the full page. Add a DOM-signature assertion that all five families differ.

- [ ] **Step 8: Add a restart-resume integration case**

Run the worker until creator persistence, terminate the first test server, start a second server on the same temporary database/data directory, and assert the completed job made zero additional creator calls and one critic call.

- [ ] **Step 9: Document setup and operations**

`docs/OPERACION_SERVIDOR.md` contains Node requirements, dependency installation, key rotation, environment variables, database/data backup, `npm run dev`, `npm run build`, `npm start`, health check, single-node limitation, graceful shutdown, Playwright browser installation, and recovery behavior. Update the test guide with unit, server, E2E, visual snapshot update, and opt-in live Gemini commands.

- [ ] **Step 10: Run the complete verification matrix**

Run:

```bash
npm test
npm run test:server
npm run build
npm run test:e2e
npm run check:no-client-secrets
rg -n "VITE_GEMINI_|generativelanguage.googleapis.com|createGeminiGateway|fallback-procedural" src dist/client
```

Expected: all tests and builds pass; the final `rg` returns no matches.

- [ ] **Step 11: Rotate the exposed key before real smoke verification**

Revoke the credential previously exposed through the browser and create a new server-only key. Store it only as `GEMINI_API_KEY`. Run:

```bash
npm run test:real
```

Expected: one opt-in smoke test passes or reports a typed transient availability error without printing the key, prompt body, or provider response body.

- [ ] **Step 12: Commit end-to-end verification and operating docs**

```bash
git add server/test tests playwright.config.ts docs/GUIA_DE_PRUEBAS.md docs/OPERACION_SERVIDOR.md
git add -u tests/e2e/generation.spec.ts tests/fixtures/valid-blueprint.json tests/fixtures/generated-image.json
git commit -m "test: verify resilient landing generation end to end"
```

---

## Final Review Gate

- [ ] Compare every acceptance criterion in the spec with Tasks 1–17 and record the passing command or test name in the implementation summary.
- [ ] Inspect `git status --short` and confirm unrelated pre-existing working-tree files were not staged.
- [ ] Run `git diff --check` and resolve whitespace errors.
- [ ] Run the complete verification matrix from Task 17 once more after the last commit.
- [ ] Review the generated desktop, mobile, and 320px snapshots for all five families; reject any family that looks like a token-only variation of another.
- [ ] Confirm the production client bundle contains no secret, Gemini URL, legacy gateway, or procedural fallback marker.
- [ ] Confirm a below-threshold job is rejected by the bank API even when called directly.
- [ ] Confirm a killed-and-restarted server resumes after the last durable stage without repeating the creator call.

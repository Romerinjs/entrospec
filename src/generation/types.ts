export type ImageMode = 'generated' | 'procedural';
export type VisualSource = 'generated' | 'procedural' | 'fallback-procedural';

export interface BrandBrief {
  brandName: string;
  industry: string;
  valueProposition: string;
  targetAudience: string;
  brandPersonality: string;
  toneOfVoice: string;
  primaryAction: string;
  preferredColors?: string[];
  avoidColors?: string[];
  logoReference?: string;
  visualReference?: string;
}

export interface DesignTokens {
  background: string;
  surface: string;
  accent: string;
  textPrimary: string;
  textSecondary: string;
  fontDisplay: string;
  fontBody: string;
  radius: string;
}

export interface LandingSection {
  id: string;
  type: 'hero' | 'proof' | 'feature' | 'faq' | 'cta' | 'footer';
  heading: string;
  body: string;
  ctaLabel?: string;
  ctaAction?: string;
  items?: Array<{ heading: string; body: string }>;
}

export interface LandingBlueprint {
  schemaVersion: 1;
  brandInterpretation: {
    brandName: string;
    industry: string;
    audience: string;
    tone: string;
    promise: string;
  };
  designTokens: DesignTokens;
  layout: { style: string; heroFocus: string; scrollRhythm: string };
  sections: LandingSection[];
  visualDirection: { concept: string; imagePrompt: string; alt: string };
  interactionPlan: Array<{ id: string; trigger: string; behavior: string; reducedMotion: string }>;
  techniquePlan: Array<{ techniqueId: number; intent: string; evidence: string }>;
  negativeConstraints: string[];
  metadata: { seed: string; title: string; psychologyAngle: string };
}

export interface ValidationIssue {
  path: string;
  message: string;
}

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

export interface GenerationError extends Error {
  code: GenerationErrorCode;
  status?: number;
}

export interface GeneratedVisualAsset {
  cacheKey: string;
  source: VisualSource;
  mimeType: 'image/webp' | 'image/svg+xml';
  dataUrl: string;
  alt: string;
  byteLength: number;
  cacheHit?: boolean;
}

export type ExecutionMode = 'full' | 'seed_only' | 'image_only' | 'combined_techniques' | 'multi_prompt' | 'procedural' | 'ai_native_html';

export interface TechniquePromptCandidate {
  techniqueId: number;
  variationId: 1 | 2 | 3;
  techniqueTitle: string;
  variationLabel: string;
  angle: string;
  prompt: string;
}

export interface GenerationCallEstimate {
  textCalls: number;
  imageCalls: number;
  totalCalls: number;
}

export interface GenerationRequest {
  brief: BrandBrief;
  executedPrompt: string;
  ssotSeed: string;
  activeTechniqueIds: number[];
  imageMode: ImageMode;
  capabilities: string[];
  visualReference?: { dataUrl: string; mimeType: string };
  executionMode?: ExecutionMode;
  existingBlueprint?: LandingBlueprint;
  allowFallback?: boolean;
  architectureVersion?: 1 | 2;
  styleSeed?: string;
  noveltyBudget?: 0 | 0.25 | 0.5 | 0.75 | 1;
  creativeRisk?: 'low' | 'moderate' | 'high';
}

export interface TechniqueEvidence {
  techniqueId: number;
  status: 'applied' | 'partial' | 'failed' | 'not_requested';
  summary: string;
  checks: Array<{ checkId: string; status: 'pass' | 'partial' | 'fail'; message: string; location?: string; weight: number }>;
}

export interface NoveltyScores {
  distinctiveness: number;
  usabilityUx: number;
  conversionCro: number;
  stackFidelity: number;
  average: number;
}

export interface NoveltyAuditResult {
  passesBank: boolean;
  scores: NoveltyScores;
  subtractiveDiagnosis: string;
  strengths: string[];
  refactorSuggested: string;
  evidence: TechniqueEvidence[];
  blockers: string[];
}

export interface GenerationRecord {
  schemaVersion?: 1 | 2;
  id: string;
  request: GenerationRequest;
  blueprint: LandingBlueprint;
  blueprintSource?: 'gemini' | 'procedural';
  htmlCode: string;
  visual: GeneratedVisualAsset;
  audit: NoveltyAuditResult;
  callsUsed: GenerationCallEstimate;
  createdAt: string;
  collection: 'draft' | 'curated';
  blueprintV2?: import('../design/blueprintV2').BlueprintV2;
  auditV2?: import('../audit/auditEngineV2').AuditV2Result;
  structureFingerprint?: import('../diversity/structureFingerprint').StructureFingerprint;
  engineVersion?: string;
  grammarVersion?: string;
  seedDerivation?: { styleSeed: string; entropySeed: string; compositionSeed?: string; seedVersion: string; subSeeds?: Record<string, string> };
  compositionRepair?: { initialSimilarity: number; finalSimilarity: number; attempts: number; repaired: boolean };
  requestDiagnostics?: { transmittedPrompt: string; rawModelText: string; extractedHtml: string; model: string; temperature: number; responseMimeType: string; executionMode: ExecutionMode };
  techniqueTrace?: Array<{ id: number; technique: string; active: boolean; injected: boolean; audited: boolean; evidence: string; directive: string }>;
}

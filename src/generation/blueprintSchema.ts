import type { BlueprintValidationResult, LandingBlueprint, ValidationIssue } from './types';

export const LANDING_BLUEPRINT_SCHEMA: Record<string, unknown> = {
  type: 'object',
  additionalProperties: false,
  required: ['schemaVersion', 'brandInterpretation', 'designTokens', 'layout', 'sections', 'visualDirection', 'interactionPlan', 'techniquePlan', 'negativeConstraints', 'metadata'],
  properties: {
    schemaVersion: { type: 'integer', enum: [1] },
    brandInterpretation: { type: 'object' },
    designTokens: { type: 'object' },
    layout: { type: 'object' },
    sections: { type: 'array', minItems: 3 },
    visualDirection: { type: 'object' },
    interactionPlan: { type: 'array' },
    techniquePlan: { type: 'array' },
    negativeConstraints: { type: 'array' },
    metadata: { type: 'object' }
  }
};

const HEX = /^#[0-9A-F]{6}$/i;

export function validateBlueprint(value: unknown, activeTechniqueIds: number[]): BlueprintValidationResult {
  const issues: ValidationIssue[] = [];
  const candidate = value as Partial<LandingBlueprint> | null;
  if (!candidate || candidate.schemaVersion !== 1) issues.push({ path: 'schemaVersion', message: 'Debe ser la versión 1.' });
  if (!candidate?.brandInterpretation?.brandName?.trim()) issues.push({ path: 'brandInterpretation.brandName', message: 'La marca es obligatoria.' });
  if (!candidate?.sections || candidate.sections.length < 3) issues.push({ path: 'sections', message: 'Se requieren al menos tres secciones.' });
  const tokens = candidate?.designTokens;
  for (const field of ['background', 'surface', 'accent', 'textPrimary', 'textSecondary'] as const) {
    if (!tokens || !HEX.test(tokens[field])) issues.push({ path: `designTokens.${field}`, message: 'Debe ser un color hexadecimal válido.' });
  }
  const hero = candidate?.sections?.find(section => section.type === 'hero');
  if (!hero?.heading?.trim()) issues.push({ path: 'sections.hero.heading', message: 'El hero necesita un titular.' });
  if (!hero?.ctaLabel?.trim() || !hero?.ctaAction?.trim()) issues.push({ path: 'sections.hero.cta', message: 'El hero necesita una acción clara.' });
  if (!candidate?.visualDirection?.imagePrompt?.trim()) issues.push({ path: 'visualDirection.imagePrompt', message: 'Falta la dirección visual.' });
  const planned = new Set((candidate?.techniquePlan ?? []).map(item => item.techniqueId));
  for (const id of activeTechniqueIds) if (!planned.has(id)) issues.push({ path: `techniquePlan.${id}`, message: `Falta la evidencia planificada para la técnica ${id}.` });
  if (!candidate?.metadata?.seed?.trim()) issues.push({ path: 'metadata.seed', message: 'Falta la semilla.' });
  return issues.length ? { ok: false, issues } : { ok: true, value: candidate as LandingBlueprint };
}

import type { BlueprintValidationResult, LandingBlueprint, ValidationIssue } from './types';

export const LANDING_BLUEPRINT_SCHEMA: Record<string, unknown> = {
  type: 'OBJECT',
  required: [
    'schemaVersion',
    'brandInterpretation',
    'designTokens',
    'layout',
    'sections',
    'visualDirection',
    'interactionPlan',
    'techniquePlan',
    'negativeConstraints',
    'metadata'
  ],
  properties: {
    schemaVersion: { type: 'INTEGER', description: 'Debe ser 1' },
    brandInterpretation: {
      type: 'OBJECT',
      required: ['brandName', 'industry', 'audience', 'tone', 'promise'],
      properties: {
        brandName: { type: 'STRING' },
        industry: { type: 'STRING' },
        audience: { type: 'STRING' },
        tone: { type: 'STRING' },
        promise: { type: 'STRING' }
      }
    },
    designTokens: {
      type: 'OBJECT',
      required: ['background', 'surface', 'accent', 'textPrimary', 'textSecondary', 'fontDisplay', 'fontBody', 'radius'],
      properties: {
        background: { type: 'STRING', description: 'Color hexadecimal de fondo, e.g. #0A0A0A' },
        surface: { type: 'STRING', description: 'Color hexadecimal de superficie, e.g. #141414' },
        accent: { type: 'STRING', description: 'Color hexadecimal de acento, e.g. #22C55E' },
        textPrimary: { type: 'STRING', description: 'Color hexadecimal de texto principal, e.g. #F3F3F3' },
        textSecondary: { type: 'STRING', description: 'Color hexadecimal de texto secundario, e.g. #A1A1A1' },
        fontDisplay: { type: 'STRING' },
        fontBody: { type: 'STRING' },
        radius: { type: 'STRING' }
      }
    },
    layout: {
      type: 'OBJECT',
      required: ['style', 'heroFocus', 'scrollRhythm'],
      properties: {
        style: { type: 'STRING' },
        heroFocus: { type: 'STRING' },
        scrollRhythm: { type: 'STRING' }
      }
    },
    sections: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        required: ['id', 'type', 'heading', 'body'],
        properties: {
          id: { type: 'STRING' },
          type: {
            type: 'STRING',
            enum: ['hero', 'proof', 'feature', 'faq', 'cta', 'footer']
          },
          heading: { type: 'STRING' },
          body: { type: 'STRING' },
          ctaLabel: { type: 'STRING' },
          ctaAction: { type: 'STRING' },
          items: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              required: ['heading', 'body'],
              properties: {
                heading: { type: 'STRING' },
                body: { type: 'STRING' }
              }
            }
          }
        }
      }
    },
    visualDirection: {
      type: 'OBJECT',
      required: ['concept', 'imagePrompt', 'alt'],
      properties: {
        concept: { type: 'STRING' },
        imagePrompt: { type: 'STRING' },
        alt: { type: 'STRING' }
      }
    },
    interactionPlan: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        required: ['id', 'trigger', 'behavior', 'reducedMotion'],
        properties: {
          id: { type: 'STRING' },
          trigger: { type: 'STRING' },
          behavior: { type: 'STRING' },
          reducedMotion: { type: 'STRING' }
        }
      }
    },
    techniquePlan: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        required: ['techniqueId', 'intent', 'evidence'],
        properties: {
          techniqueId: { type: 'INTEGER' },
          intent: { type: 'STRING' },
          evidence: { type: 'STRING' }
        }
      }
    },
    negativeConstraints: {
      type: 'ARRAY',
      items: { type: 'STRING' }
    },
    metadata: {
      type: 'OBJECT',
      required: ['seed', 'title', 'psychologyAngle'],
      properties: {
        seed: { type: 'STRING' },
        title: { type: 'STRING' },
        psychologyAngle: { type: 'STRING' }
      }
    }
  }
};

const HEX = /^#[0-9A-F]{6}$/i;

export function sanitizeBlueprint(value: unknown, activeTechniqueIds: number[] = []): unknown {
  if (!value || typeof value !== 'object') return value;
  const candidate = { ...(value as any) };
  if (!candidate.schemaVersion) candidate.schemaVersion = 1;

  if (!candidate.metadata || typeof candidate.metadata !== 'object') candidate.metadata = {};
  if (!candidate.metadata.seed?.trim()) candidate.metadata.seed = 'seed-' + Math.random().toString(36).slice(2, 10);
  if (!candidate.metadata.title?.trim() && candidate.brandInterpretation?.brandName) candidate.metadata.title = candidate.brandInterpretation.brandName;
  if (!candidate.metadata.psychologyAngle?.trim()) candidate.metadata.psychologyAngle = 'Claridad y conversión';

  if (!candidate.visualDirection || typeof candidate.visualDirection !== 'object') candidate.visualDirection = {};
  if (!candidate.visualDirection.concept?.trim()) candidate.visualDirection.concept = 'Dirección visual sobria y técnica';
  if (!candidate.visualDirection.imagePrompt?.trim()) candidate.visualDirection.imagePrompt = candidate.visualDirection.concept;
  if (!candidate.visualDirection.alt?.trim()) candidate.visualDirection.alt = 'Visual de marca';

  if (Array.isArray(candidate.sections)) {
    const hero = candidate.sections.find((s: any) => s && s.type === 'hero');
    if (hero) {
      if (!hero.heading?.trim()) hero.heading = candidate.brandInterpretation?.promise || candidate.brandInterpretation?.brandName || 'Propuesta de Valor';
      if (!hero.ctaLabel?.trim()) hero.ctaLabel = 'Descubrir más';
      if (!hero.ctaAction?.trim()) hero.ctaAction = '#proof';
    }
  }

  if (Array.isArray(activeTechniqueIds) && activeTechniqueIds.length > 0) {
    if (!Array.isArray(candidate.techniquePlan)) candidate.techniquePlan = [];
    const planned = new Set(candidate.techniquePlan.map((item: any) => item?.techniqueId));
    for (const id of activeTechniqueIds) {
      if (!planned.has(id)) {
        candidate.techniquePlan.push({
          techniqueId: id,
          intent: `Aplicación de técnica ${id}`,
          evidence: `Técnica ${id} integrada en el blueprint`
        });
      }
    }
  }

  return candidate;
}

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

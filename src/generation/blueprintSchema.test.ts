import { describe, expect, it } from 'vitest';
import { validateBlueprint } from './blueprintSchema';
import type { LandingBlueprint } from './types';

const validBlueprint: LandingBlueprint = {
  schemaVersion: 1,
  brandInterpretation: {
    brandName: 'Northline',
    industry: 'Infraestructura',
    audience: 'Equipos técnicos',
    tone: 'Sobrio y preciso',
    promise: 'Decisiones más claras'
  },
  designTokens: {
    background: '#0A0A0A',
    surface: '#141414',
    accent: '#22C55E',
    textPrimary: '#F3F3F3',
    textSecondary: '#A1A1A1',
    fontDisplay: 'system-ui',
    fontBody: 'system-ui',
    radius: '4px'
  },
  layout: { style: 'Brutalismo Suizo', heroFocus: 'Punto focal', scrollRhythm: 'Lento' },
  sections: [
    { id: 'hero', type: 'hero', heading: 'Decide con claridad', body: 'Una promesa concreta.', ctaLabel: 'Ver cómo funciona', ctaAction: '#proof' },
    { id: 'proof', type: 'proof', heading: 'Evidencia útil', body: 'Datos que explican el valor.' },
    { id: 'close', type: 'cta', heading: 'Empieza ahora', body: 'Acceso directo.' }
  ],
  visualDirection: { concept: 'Cristal técnico', imagePrompt: 'Macro de cristal oscuro', alt: 'Textura técnica oscura' },
  interactionPlan: [{ id: 'reveal', trigger: 'scroll', behavior: 'reveal', reducedMotion: 'instant' }],
  techniquePlan: [1, 4, 8].map(techniqueId => ({ techniqueId, intent: `Aplicar técnica ${techniqueId}`, evidence: `Evidencia ${techniqueId}` })),
  negativeConstraints: ['sin dependencias externas'],
  metadata: { seed: 'Abc123!xyZ890', title: 'Northline', psychologyAngle: 'Reducir duda' }
};

describe('validateBlueprint', () => {
  it('accepts a complete blueprint for the active techniques', () => {
    const result = validateBlueprint(validBlueprint, [1, 4, 8]);
    expect(result.ok).toBe(true);
  });

  it('reports a missing active technique plan entry', () => {
    const result = validateBlueprint(
      { ...validBlueprint, techniquePlan: validBlueprint.techniquePlan.filter(item => item.techniqueId !== 4) },
      [1, 4, 8]
    );
    expect(result).toEqual(expect.objectContaining({
      ok: false,
      issues: expect.arrayContaining([expect.objectContaining({ path: 'techniquePlan.4' })])
    }));
  });

  it('rejects empty sections and invalid colors', () => {
    const result = validateBlueprint({ ...validBlueprint, sections: [], designTokens: { ...validBlueprint.designTokens, accent: 'purple' } }, [1]);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.issues.map(issue => issue.path)).toEqual(expect.arrayContaining(['sections', 'designTokens.accent']));
  });
});

import { describe, expect, it } from 'vitest';
import { renderLandingDocument } from './nativeRenderer';

const blueprint: any = {
  schemaVersion: 1,
  brandInterpretation: { brandName: 'Northline', industry: 'Infra', audience: 'Teams', tone: 'Directo', promise: 'Claridad' },
  designTokens: { background: '#0A0A0A', surface: '#141414', accent: '#22C55E', textPrimary: '#F3F3F3', textSecondary: '#A1A1A1', fontDisplay: 'system-ui', fontBody: 'system-ui', radius: '4px' },
  layout: { style: 'Retícula Rota', heroFocus: 'Punto focal', scrollRhythm: 'Lento' },
  sections: [
    { id: 'hero', type: 'hero', heading: 'Decide con claridad', body: 'Una propuesta verificable.', ctaLabel: 'Ver prueba', ctaAction: '#proof' },
    { id: 'proof', type: 'proof', heading: 'Hechos que ayudan', body: 'Explicación concreta.' },
    { id: 'cta', type: 'cta', heading: 'Empieza ahora', body: 'Acceso directo.' }
  ],
  visualDirection: { concept: 'Cristal', imagePrompt: 'Cristal', alt: 'Cristal' }, interactionPlan: [{ id: 'reveal', trigger: 'scroll', behavior: 'reveal', reducedMotion: 'instant' }], techniquePlan: [], negativeConstraints: [], metadata: { seed: 'abc123', title: 'Northline', psychologyAngle: 'clarity' }
};

const input: any = {
  blueprint,
  visual: { cacheKey: 'x', source: 'procedural', mimeType: 'image/svg+xml', dataUrl: 'data:image/svg+xml,%3Csvg%3E%3C/svg%3E', alt: 'Visual', byteLength: 20 },
  capabilities: ['svg', 'css-motion', 'interaction-js'],
  activeTechniqueIds: [5, 8],
  ssot: { seed: 'abc123' }
};

describe('renderLandingDocument', () => {
  it('compiles an offline semantic document with native styles and script', () => {
    const html = renderLandingDocument(input);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<main');
    expect(html).toContain('<style>');
    expect(html).toContain('<script>');
    expect(html).toContain('prefers-reduced-motion');
    expect(html).not.toMatch(/<(script|link)[^>]+src=/i);
    expect(html).not.toMatch(/https?:\/\//i);
  });

  it('escapes hostile brand copy before insertion', () => {
    const html = renderLandingDocument({ ...input, blueprint: { ...blueprint, brandInterpretation: { ...blueprint.brandInterpretation, brandName: '</title><script>window.pwned=true</script>' } } });
    expect(html).not.toContain('<script>window.pwned=true</script>');
    expect(html).toContain('&lt;/title&gt;');
  });
});

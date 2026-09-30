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
    expect(html).toContain(':focus-visible');
    expect(html).not.toMatch(/<(script|link)[^>]+src=/i);
    expect(html).not.toMatch(/https?:\/\//i);
  });

  it('escapes hostile brand copy before insertion', () => {
    const html = renderLandingDocument({ ...input, blueprint: { ...blueprint, brandInterpretation: { ...blueprint.brandInterpretation, brandName: '</title><script>window.pwned=true</script>' } } });
    expect(html).not.toContain('<script>window.pwned=true</script>');
    expect(html).toContain('&lt;/title&gt;');
  });

  it('renders different layout archetypes based on blueprint style', () => {
    const monumentalHtml = renderLandingDocument({
      ...input,
      blueprint: { ...blueprint, layout: { ...blueprint.layout, style: 'centered_monumental' } }
    });
    expect(monumentalHtml).toContain('archetype-layout-centered_monumental');

    const terminalHtml = renderLandingDocument({
      ...input,
      blueprint: { ...blueprint, layout: { ...blueprint.layout, style: 'terminal_tech' } }
    });
    expect(terminalHtml).toContain('archetype-layout-terminal_tech');

    const luxuryHtml = renderLandingDocument({
      ...input,
      blueprint: { ...blueprint, layout: { ...blueprint.layout, style: 'luxury_magazine' } }
    });
    expect(luxuryHtml).toContain('archetype-layout-luxury_magazine');
  });

  it('specializes section layouts for features, metrics proof, and faq accordion', () => {
    const richBlueprint = {
      ...blueprint,
      sections: [
        { id: 'hero', type: 'hero', heading: 'Plataforma Cuántica', body: 'Precisión absoluta.' },
        {
          id: 'features',
          type: 'feature',
          heading: 'Capacidades Centrales',
          body: 'Diseñado para alta concurrencia.',
          items: [{ heading: 'Criptografía', body: 'Aislamiento en hardware.' }]
        },
        {
          id: 'proof',
          type: 'proof',
          heading: 'Rendimiento Verificado',
          body: 'Métricas auditadas.',
          items: [{ heading: '99.99%', body: 'Disponibilidad garantizada.' }]
        },
        {
          id: 'faq',
          type: 'faq',
          heading: 'Preguntas Frecuentes',
          body: 'Respuestas directas a dudas operativas.',
          items: [{ heading: '¿Cómo se integra?', body: 'Con una llamada directa sin librerías.' }]
        },
        { id: 'cta', type: 'cta', heading: 'Comienza hoy', body: 'Despliegue inmediato.', ctaLabel: 'Iniciar', ctaAction: '#signup' }
      ]
    };

    const html = renderLandingDocument({ ...input, blueprint: richBlueprint });
    expect(html).toContain('feature-grid');
    expect(html).toContain('feature-index');
    expect(html).toContain('metrics-grid');
    expect(html).toContain('metric-value');
    expect(html).toContain('faq-accordion');
    expect(html).toContain('<details class="faq-item"');
    expect(html).toContain('section-cta-banner');
  });
});


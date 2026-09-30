import type { GenerationRequest, LandingBlueprint } from './types';

export function createProceduralBlueprint(request: GenerationRequest): LandingBlueprint {
  const brand = request.brief?.brandName?.trim() || 'Entrospec';
  const prop = request.brief?.valueProposition?.trim() || 'Arquitectura web de alto rendimiento y diseño editorial sin concesiones.';
  const action = request.brief?.primaryAction?.trim() || 'Comenzar ahora';
  const audience = request.brief?.targetAudience?.trim() || 'Equipos y profesionales exigentes';
  const tone = request.brief?.toneOfVoice?.trim() || 'Directo, técnico y sobrio';

  const archetypes = [
    { style: 'asym_editorial', display: '"Helvetica Neue", -apple-system, sans-serif', bg: '#0A0A0A', surface: '#141414', accent: '#EAB308' },
    { style: 'centered_monumental', display: '"Arial Black", "Helvetica Neue", sans-serif', bg: '#08090A', surface: '#121518', accent: '#3B82F6' },
    { style: 'terminal_tech', display: 'ui-monospace, "SF Mono", monospace', bg: '#050709', surface: '#0D1117', accent: '#10B981' },
    { style: 'luxury_magazine', display: '"Iowan Old Style", Charter, Georgia, serif', bg: '#0C0A09', surface: '#1C1917', accent: '#F59E0B' },
    { style: 'modular_split', display: '-apple-system, BlinkMacSystemFont, sans-serif', bg: '#090D16', surface: '#131B2E', accent: '#06B6D4' }
  ];
  const seed = request.ssotSeed || 'ssot-seed-default';
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  const config = archetypes[hash % archetypes.length];

  return {
    schemaVersion: 1,
    brandInterpretation: {
      brandName: brand,
      industry: request.brief?.industry || 'Tecnología',
      audience,
      tone,
      promise: prop
    },
    designTokens: {
      background: config.bg,
      surface: config.surface,
      accent: config.accent,
      textPrimary: '#F1F5F9',
      textSecondary: '#94A3B8',
      fontDisplay: config.display,
      fontBody: 'system-ui, -apple-system, sans-serif',
      radius: config.style === 'terminal_tech' ? '0px' : '6px'
    },
    layout: {
      style: config.style,
      heroFocus: 'Punto focal tipográfico con jerarquía visual calculada',
      scrollRhythm: 'Dinámica modular de 4 fases'
    },
    sections: [
      {
        id: 'hero',
        type: 'hero',
        heading: prop,
        body: `${brand} redefine la experiencia digital para ${audience} con un enfoque ${tone.toLowerCase()}.`,
        ctaLabel: action,
        ctaAction: '#proof'
      },
      {
        id: 'proof',
        type: 'proof',
        heading: 'Rendimiento y Precisión Comprobada',
        body: 'Cada componente está calibrado para máxima velocidad de renderizado, accesibilidad y conversión.',
        items: [
          { heading: 'Latencia Cero', body: 'Código nativo sin dependencias externas ni scripts bloqueantes.' },
          { heading: 'Diseño Sustractivo', body: 'Eliminación del 30% del ruido decorativo en favor de pura jerarquía visual.' },
          { heading: 'Identidad Única', body: 'Tokens de diseño calibrados matemáticamente con String Seed of Thought.' }
        ]
      },
      {
        id: 'features',
        type: 'feature',
        heading: 'Capacidades de Nueva Generación',
        body: 'Arquitectura construida para destacar frente a las interfaces genéricas estándar.',
        items: [
          { heading: 'Micro-interacciones Fluidas', body: 'Transiciones de estado instantáneas con respeto estricto a reduced-motion.' },
          { heading: 'Semántica HTML5 Pura', body: 'Estructura validada y optimizada para indexación y accesibilidad nativa.' }
        ]
      },
      {
        id: 'cta',
        type: 'cta',
        heading: 'Comienza la Transformación de tu Marca',
        body: `Descubre cómo ${brand} puede elevar tu presencia digital al estándar de la industria.`,
        ctaLabel: action,
        ctaAction: '#hero'
      }
    ],
    visualDirection: {
      concept: `Dirección visual técnica y contemporánea para ${brand}`,
      imagePrompt: `Composición abstracta geométrica de alta definición con materiales oscuros y acentos sutiles para ${brand}`,
      alt: `Composición visual de ${brand}`
    },
    interactionPlan: [
      { id: 'scroll-reveal', trigger: 'scroll', behavior: 'reveal-fade', reducedMotion: 'instant' },
      { id: 'hover-focus', trigger: 'hover', behavior: 'subtle-scale', reducedMotion: 'none' }
    ],
    techniquePlan: (request.activeTechniqueIds || []).map(techniqueId => ({
      techniqueId,
      intent: `Garantizar cumplimiento de la técnica ${techniqueId}`,
      evidence: `Implementación nativa conforme al estándar de técnica ${techniqueId}`
    })),
    negativeConstraints: [
      'sin dependencias externas',
      'sin degradados genéricos de IA',
      'sin fuentes remotas bloqueantes'
    ],
    metadata: {
      seed: request.ssotSeed || 'ssot-seed-default',
      title: `${brand} — Landing Oficial`,
      psychologyAngle: 'Reducción de fricción y convicción por evidencia'
    }
  };
}

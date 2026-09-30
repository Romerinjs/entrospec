import type { BrandBrief } from './types';
import { getTechniqueDefinition } from './techniqueCatalog';

export interface ArchitecturePromptInput {
  brief: BrandBrief;
  styleSeed: string;
  entropySeed: string;
  noveltyBudget: number;
  creativeRisk: 'low' | 'moderate' | 'high';
  recentSummaries?: string[];
  activeTechniqueIds?: number[];
  outputFormat?: 'blueprint' | 'creative';
}

export function deriveStyleSeedFromBrief(brief: BrandBrief): string {
  return [brief.industry, brief.brandPersonality].map(value => value.trim()).filter(Boolean).join(' × ') || 'Auto — derivar del brief';
}

export function composeArchitecturePromptV2(input: ArchitecturePromptInput): { prompt: string; negativeConstraints: string[] } {
  const { brief } = input;
  const styleSeed = input.styleSeed.trim() || deriveStyleSeedFromBrief(brief);
  const industry = brief.industry.toLowerCase();
  const negativeConstraints = [
    'No convertir todo contenido en cards; cards no son la representación predeterminada.',
    'No asumir hero dividido, features en cards, métricas en fila, FAQ acordeón ni CTA centrado.',
    'No permitir que cambios de color/fuente cuenten como diversidad estructural.'
  ];
  if (/saas|software|tecnolog|fintech/.test(industry)) negativeConstraints.push('Evitar dashboard flotante, glow orb, gradiente púrpura SaaS y bento sin justificación.');
  if (/restaur|hotel|gastronom|comida/.test(industry)) negativeConstraints.push('Evitar hero de stock gastronómico, plantilla de lujo centrada y tres tarjetas de beneficios.');
  if (input.recentSummaries?.length) negativeConstraints.push(`Reducir repetición de estas familias recientes: ${input.recentSummaries.slice(0, 8).join('; ')}.`);
  const techniqueDirectives = (input.activeTechniqueIds ?? []).map(id => getTechniqueDefinition(id)).filter(Boolean).flatMap(technique => technique!.promptDirectives);
  const prompt = [
    input.outputFormat === 'creative'
      ? 'Eres Art Director, estratega de contenido y arquitecto espacial. Define con claridad identidad, jerarquía, contenido y dirección visual para construir una landing.'
      : 'Eres Art Director, estratega de contenido y arquitecto espacial. Devuelve únicamente JSON válido para una propuesta semántica Blueprint V2; no generes HTML, CSS, clases ni plantilla.',
    'SEPARA propósito comercial (purpose), contenido (blocks) y presentación (morphology/composition). La presentación no determina ni altera la semántica.',
    'ORDEN OBLIGATORIO: strategy → artDirection → contentArchitecture → visualStrategy. No comiences escogiendo layouts de hero/features/FAQ.',
    'ArtDirection es multidimensional: compositionGrammar, surfaceLanguage, artDirection, ornamentation, density, motionLanguage, styleSeed y rationale. Cada capa conserva su responsabilidad.',
    'contentArchitecture.nodes es una secuencia lógica de 3 a 7 nodos con id, purpose, blocks[{id,kind,text,label?,priority}], dependsOn, priority y copyIntensity. Purpose puede ser introduce, explain, prove, compare, demonstrate, reassure, objection, convert, navigate, contextualize o storytelling.',
    'Elige morfologías heterogéneas que expresen dirección artística y estrategia: poster, rail, editorial spread, annotated diagram, timeline, ticker, typographic field, collage, manifesto, full-bleed narrative, etc. No repetir la misma morfología por defecto.',
    'COPY: usa frases humanas, concisas y propias del tono; no inventes cifras, testimonials ni claims no provistos. Evita revolucionario, innovador, soluciones integrales, ecosistema y “lleva tu negocio al siguiente nivel”.',
    `styleSeed (Auto — derivado del brief, editable en modo Manual): ${styleSeed}`,
    `entropySeed (variación estructural reproducible, no elige un único layout): ${input.entropySeed}`,
    `noveltyBudget=${input.noveltyBudget}; creativeRisk=${input.creativeRisk}. Novedad no sacrifica legibilidad ni accesibilidad.`,
    `MARCA: ${brief.brandName}\nSECTOR: ${brief.industry}\nPROMESA: ${brief.valueProposition}\nAUDIENCIA: ${brief.targetAudience}\nPERSONALIDAD: ${brief.brandPersonality}\nTONO: ${brief.toneOfVoice}\nACCIÓN: ${brief.primaryAction}`,
    `DIRECTIVAS DE TÉCNICAS ACTIVAS:\n${techniqueDirectives.length ? techniqueDirectives.map(line => `- ${line}`).join('\n') : '- Ninguna técnica seleccionada.'}`,
    `Restricciones dinámicas:\n- ${negativeConstraints.join('\n- ')}`,
    ...(input.outputFormat === 'creative' ? [] : ['JSON shape: {"strategy":{"brandName":"","industry":"","audience":"","promise":"","objective":"","claims":[]},"artDirection":{"compositionGrammar":"","surfaceLanguage":"","artDirection":"","ornamentation":"","density":"","motionLanguage":"","styleSeed":"","rationale":""},"contentArchitecture":{"objective":"","readingLogic":[],"nodes":[],"requiredClaims":[],"primaryAction":{"label":"","href":"#top"}},"visualStrategy":{"mode":"","prompt":"","alt":"","placement":"","mediaSequence":[]},"interactionPlan":[{"id":"","trigger":"","behavior":"","reducedMotion":"instant"}]}'])
  ].join('\n\n');
  return { prompt, negativeConstraints };
}

import type { ImageMode, BrandBrief, GenerationCallEstimate, TechniquePromptCandidate, ExecutionMode } from './types';
import { getTechniqueDefinition } from './techniqueCatalog';

export interface PromptComposerInput {
  brief: BrandBrief;
  ssot: { seed: string; layout: string; palette: { name: string; background: string; surface: string; accent: string } };
  activeTechniqueIds: number[];
  imageMode: ImageMode;
  capabilities: string[];
}

export interface PromptBundle {
  masterPrompt: string;
  executedPrompt: string;
  imagePrompt: string;
  negativeConstraints: string[];
  techniqueCandidates: TechniquePromptCandidate[];
  totalCandidatesCount: number;
}

export function estimateGenerationCalls(
  activeTechniqueIds: number[],
  imageMode: ImageMode,
  executionMode?: ExecutionMode
): GenerationCallEstimate {
  if (executionMode === 'procedural') {
    return { textCalls: 0, imageCalls: 0, totalCalls: 0 };
  }
  if (executionMode === 'ai_native_html') {
    return { textCalls: 1, imageCalls: 0, totalCalls: 1 };
  }
  if (executionMode === 'image_only') {
    return { textCalls: 0, imageCalls: 1, totalCalls: 1 };
  }
  if (executionMode === 'seed_only') {
    return { textCalls: 1, imageCalls: 0, totalCalls: 1 };
  }
  if (executionMode === 'multi_prompt') {
    // 3 llamadas por cada técnica activa seleccionada
    const textCalls = Math.max(1, activeTechniqueIds.length * 3);
    const wantsImage = activeTechniqueIds.includes(4) && imageMode === 'generated';
    const imageCalls = wantsImage ? 1 : 0;
    return { textCalls, imageCalls, totalCalls: textCalls + imageCalls };
  }
  // En modo combinado (optimal), todas las técnicas activas se envían en 1 SOLA llamada de texto
  const wantsImage = activeTechniqueIds.includes(4) && imageMode === 'generated';
  const textCalls = 1;
  const imageCalls = wantsImage ? 1 : 0;
  return { textCalls, imageCalls, totalCalls: textCalls + imageCalls };
}

export function composeGenerationPrompt(input: PromptComposerInput): PromptBundle {
  const active = input.activeTechniqueIds.map(getTechniqueDefinition).filter(Boolean);
  const constraints = [
    'El resultado final será compilado por Entrospec como HTML5 con CSS nativo y JavaScript vanilla embebidos.',
    'No produzcas HTML ejecutable, frameworks, CDN, imports, módulos, fuentes remotas ni solicitudes de red.',
    'No uses bento grid, degradados púrpura/cian, emojis decorativos, badges de IA ni clichés corporativos.'
  ];

  const brandName = input.brief.brandName?.trim() || '[Nombre de marca]';
  const industry = input.brief.industry?.trim() || '[Sector / Industria]';
  const valueProp = input.brief.valueProposition?.trim() || '[Propuesta de valor]';
  const audience = input.brief.targetAudience?.trim() || '[Audiencia objetivo]';
  const personality = input.brief.brandPersonality?.trim() || '[Personalidad de marca]';
  const tone = input.brief.toneOfVoice?.trim() || '[Tono de voz]';
  const action = input.brief.primaryAction?.trim() || '[Acción principal / CTA]';

  // 1. Generar los N * 3 prompts (3 prompts por cada técnica activa)
  const techniqueCandidates: TechniquePromptCandidate[] = [];
  for (const tech of active) {
    if (!tech) continue;
    for (const variation of tech.variations) {
      const variationPrompt = [
        `Actúa como director creativo y arquitecto web para "${brandName}".`,
        `Crea una landing page de alto nivel para el sector "${industry}".`,
        `• Propuesta de valor: ${valueProp}`,
        `• Audiencia objetivo: ${audience}`,
        `• Personalidad y tono: ${personality} (${tone})`,
        `• Llamada a la acción (CTA): ${action}`,
        '',
        `Enfoque técnico: Técnica 0${tech.id} (${tech.title}) — Variante 0${variation.id} [${variation.label}]`,
        `Ángulo estratégico: ${variation.angle}`,
         `Directiva de diseño: ${tech.promptDirectives.join(' ')} ${variation.directiveAddition}`,
        '',
        'Pautas de dirección creativa y arquitectura visual:',
        '- Define en layout.style una dirección visual distintiva y adaptada a la marca (ej: "centered_monumental", "asym_editorial", "terminal_tech", "luxury_magazine", "modular_split").',
        '- Estructura narrativa rica en secciones semánticas: "hero", "feature" (capacidades concretas), "proof" (métricas de impacto cuantitativo en headings), "faq" (objeciones directas), y "cta".',
        '- Diseño sustractivo de alta gama sin plantillas clichés, sin degradados trillados violeta/cian.',
        '- Cero dependencias externas: compilará como HTML5 con CSS moderno y JavaScript vanilla embebidos.'
      ].join('\n');

      techniqueCandidates.push({
        techniqueId: tech.id,
        variationId: variation.id,
        techniqueTitle: tech.title,
        variationLabel: variation.label,
        angle: variation.angle,
        prompt: variationPrompt
      });
    }
  }

  // 2. Generar el Prompt Óptimo Sintetizado (combina ÚNICAMENTE las técnicas activas)
  const techniquesBlock = active.length > 0
    ? active.map(tech => `• Técnica 0${tech!.id} (${tech!.title}): ${tech!.promptDirectives.join(' ')} [${tech!.variations[0].directiveAddition}]`).join('\n')
    : '• Enfoque de claridad editorial, jerarquía innovadora y conversión directa.';

  const masterPrompt = [
    `Actúa como director creativo y arquitecto web para "${brandName}".`,
    `Crea una landing page de alto nivel para el sector "${industry}".`,
    `• Propuesta de valor: ${valueProp}`,
    `• Audiencia objetivo: ${audience}`,
    `• Personalidad y tono: ${personality} (${tone})`,
    `• Llamada a la acción (CTA): ${action}`,
    '',
    `Técnicas seleccionadas (${active.length} ${active.length === 1 ? 'técnica activa' : 'técnicas combinadas en 1 llamada'}):`,
    techniquesBlock,
    '',
    'Pautas de dirección creativa y arquitectura visual:',
    '- Innovación gráfica: Selecciona un arquetipo visual coherente en layout.style (ej: "centered_monumental", "asym_editorial", "terminal_tech", "luxury_magazine", o "modular_split").',
    '- Narrativa rica en secciones semánticas especializadas: combina "hero", "feature" (capacidades), "proof" (métricas de impacto cuantificables), "faq" (resolución de objeciones) y "cta" (conversión final).',
    '- Identidad tipográfica intencional en designTokens: define combinaciones sobrias de contraste acordes al arquetipo.',
    '- Redacción persuasiva, humana y orientada al beneficio inmediato sin adjetivos vacíos.',
    '- Devuelve la respuesta en formato JSON estructurado según el schema de diseño.',
    '- Cero dependencias externas: compilará como HTML5 con CSS moderno y JavaScript vanilla embebidos.'
  ].join('\n');

  return {
    masterPrompt,
    executedPrompt: masterPrompt,
    imagePrompt: `Hero editorial de ${brandName}: ${valueProp}. ${personality}.`,
    negativeConstraints: constraints,
    techniqueCandidates,
    totalCandidatesCount: techniqueCandidates.length
  };
}

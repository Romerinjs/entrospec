import type { ImageMode, BrandBrief, GenerationCallEstimate } from './types';
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
}

export function estimateGenerationCalls(activeTechniqueIds: number[], imageMode: ImageMode): GenerationCallEstimate {
  return { textCalls: 1, imageCalls: activeTechniqueIds.includes(4) && imageMode === 'generated' ? 1 : 0 };
}

export function composeGenerationPrompt(input: PromptComposerInput): PromptBundle {
  const active = input.activeTechniqueIds.map(getTechniqueDefinition).filter(Boolean);
  const constraints = [
    'El resultado final será compilado por Entrospec como HTML5 con CSS nativo y JavaScript vanilla embebidos.',
    'No produzcas HTML ejecutable, frameworks, CDN, imports, módulos, fuentes remotas ni solicitudes de red.',
    'No uses bento grid, degradados púrpura/cian, emojis decorativos, badges de IA ni clichés corporativos.'
  ];
  const masterPrompt = [
    'Eres director creativo y arquitecto de una landing page de marca.',
    'Devuelve únicamente JSON válido conforme al schema de blueprint indicado por el sistema; nunca devuelvas HTML.',
    `Marca: ${input.brief.brandName}. Sector: ${input.brief.industry}. Propuesta: ${input.brief.valueProposition}.`,
    `Audiencia: ${input.brief.targetAudience}. Personalidad: ${input.brief.brandPersonality}. Tono: ${input.brief.toneOfVoice}. CTA: ${input.brief.primaryAction}.`,
    `SSoT: semilla ${input.ssot.seed}; retícula ${input.ssot.layout}; paleta ${input.ssot.palette.name} (${input.ssot.palette.background}, ${input.ssot.palette.surface}, ${input.ssot.palette.accent}).`,
    `Capacidades nativas permitidas: ${input.capabilities.join(', ') || 'ninguna'}. Modo visual: ${input.imageMode}.`,
    'Técnicas activas y evidencia obligatoria:',
    active.map(item => `Técnica ${item!.id} — ${item!.title}: ${item!.directive} Evidencia: ${item!.requiredEvidence}`).join('\n'),
    'Restricciones:',
    constraints.map(item => `- ${item}`).join('\n'),
    'Incluye al menos tres secciones, un hero con CTA, dirección visual, plan de interacción con reduced-motion y un plan de evidencia por técnica activa.'
  ].join('\n\n');
  return {
    masterPrompt,
    executedPrompt: masterPrompt,
    imagePrompt: `Hero de ${input.brief.brandName}: ${input.brief.valueProposition}. ${input.brief.brandPersonality}.`,
    negativeConstraints: constraints
  };
}

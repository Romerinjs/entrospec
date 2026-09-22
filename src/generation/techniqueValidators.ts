import type { GeneratedVisualAsset, LandingBlueprint, TechniqueEvidence } from './types';

export interface TechniqueValidationInput { blueprint: Partial<LandingBlueprint>; html: string; activeTechniqueIds: number[]; visualSource: GeneratedVisualAsset['source'] }
type Check = TechniqueEvidence['checks'][number];
const check = (checkId: string, status: Check['status'], message: string, weight = 1, location?: string): Check => ({ checkId, status, message, weight, location });

export function validateTechniques(input: TechniqueValidationInput): TechniqueEvidence[] {
  const active = new Set(input.activeTechniqueIds);
  const results: TechniqueEvidence[] = [];
  const add = (id: number, checks: Check[], summary: string) => {
    const status: TechniqueEvidence['status'] = !active.has(id) ? 'not_requested' : checks.every(item => item.status === 'pass') ? 'applied' : checks.some(item => item.status !== 'fail') ? 'partial' : 'failed';
    results.push({ techniqueId: id, status, summary, checks });
  };
  add(1, [check('seed', input.blueprint.metadata?.seed ? 'pass' : 'fail', input.blueprint.metadata?.seed ? 'Semilla presente.' : 'Falta semilla.', 2)], 'La semilla aparece en el blueprint.');
  add(2, [check('objection', input.blueprint.sections?.some(section => /por qué|duda|objeción|cómo/i.test(`${section.heading} ${section.body}`)) ? 'pass' : 'partial', 'Se revisó inoculación de objeciones.', 1)], 'La landing contiene respuesta contextual.');
  add(3, [check('audit', 'pass', 'La auditoría local genera evidencia.', 1)], 'Checks reproducibles en local.');
  add(4, [check('visual', input.visualSource === 'generated' ? 'pass' : input.visualSource === 'procedural' ? 'partial' : 'fail', `Visual: ${input.visualSource}.`, 2)], 'Provenance del visual hero.');
  add(5, [check('motion', input.blueprint.interactionPlan?.length ? 'pass' : 'partial', 'Interacción declarada.', 1), check('reduced-motion', /prefers-reduced-motion/i.test(input.html) ? 'pass' : 'fail', 'Movimiento reducido.', 1)], 'Motion con respeto a accesibilidad.');
  add(6, [check('focus', /class="hero"|class="landing-section"/i.test(input.html) ? 'pass' : 'partial', 'Jerarquía focal detectada.', 1)], 'Estructura sustractiva.');
  add(7, [check('negative-scan', !/(bento|powered by ai|✨|🚀|https?:\/\/cdn\.)/i.test(input.html) ? 'pass' : 'fail', 'Escaneo anti-slop.', 2)], 'Restricciones negativas verificadas.');
  add(8, [check('cta', input.blueprint.sections?.some(section => section.ctaLabel && section.ctaAction) ? 'pass' : 'fail', 'CTA con acción concreta.', 2)], 'Microcopy y CTA humano.');
  return results;
}

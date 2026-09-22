export interface TechniqueDefinition {
  id: number;
  title: string;
  directive: string;
  requiredEvidence: string;
  validatorKey: string;
}

export const TECHNIQUE_CATALOG: readonly TechniqueDefinition[] = [
  { id: 1, title: 'SSoT', directive: 'Derivar composición, color, interacción y psicología desde cuatro chunks de la semilla.', requiredEvidence: 'Semilla, chunks y decisiones derivadas.', validatorKey: 'ssot' },
  { id: 2, title: 'Persuasión profunda', directive: 'Explicar audiencia, sofisticación de mercado y objeciones antes del CTA.', requiredEvidence: 'Audiencia, objeción y respuesta visible.', validatorKey: 'persuasion' },
  { id: 3, title: 'Creator-Critic', directive: 'Exponer auditoría local con cuatro dimensiones y diagnóstico accionable.', requiredEvidence: 'Puntuación y checks reproducibles.', validatorKey: 'audit' },
  { id: 4, title: 'Imagen generativa', directive: 'Crear un hero visual coherente o declarar respaldo procedural.', requiredEvidence: 'Provenance del activo y prompt visual.', validatorKey: 'image' },
  { id: 5, title: 'Motion', directive: 'Usar una interacción con propósito y respetar movimiento reducido.', requiredEvidence: 'Interacción y regla reduced-motion.', validatorKey: 'motion' },
  { id: 6, title: 'Diseño sustractivo', directive: 'Eliminar ruido decorativo y preservar foco en valor y CTA.', requiredEvidence: 'Diagnóstico de densidad y foco.', validatorKey: 'subtractive' },
  { id: 7, title: 'Restricciones anti-slop', directive: 'Bloquear clichés visuales, vocabulario vacío y dependencias externas.', requiredEvidence: 'Escaneo negativo sin bloqueos.', validatorKey: 'antiSlop' },
  { id: 8, title: 'Microcopy humano', directive: 'Usar copy directo, legible y orientado a una acción concreta.', requiredEvidence: 'CTA con acción y beneficio.', validatorKey: 'humanCopy' }
];

export function getTechniqueDefinition(id: number): TechniqueDefinition | undefined {
  return TECHNIQUE_CATALOG.find(item => item.id === id);
}

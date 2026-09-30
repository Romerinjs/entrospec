export interface CuratedBankDecision { eligible: boolean; reason?: string }

export function evaluateCuratedBankEligibility(record: any): CuratedBankDecision {
  if (!record.auditV2) {
    const eligible = Boolean(record.audit?.passesBank && Number(record.audit?.scores?.average ?? 0) >= 8.5);
    return eligible ? { eligible: true } : { eligible: false, reason: 'La auditoría legacy requiere score >= 8.5 y passesBank.' };
  }
  const audit = record.auditV2;
  if (audit.blockers?.length) return { eligible: false, reason: 'La auditoría funcional o responsive contiene bloqueos.' };
  if (Number(audit.genericityPenalty ?? 1) > 0.55) return { eligible: false, reason: 'La genericidad supera el límite del banco.' };
  if (Number(audit.cardDependencyRatio ?? 1) > 0.35) return { eligible: false, reason: 'La dependencia de cards supera el límite del banco.' };
  if (Number(audit.dimensions?.accessibility?.score ?? 0) < 0.8) return { eligible: false, reason: 'La evidencia de accesibilidad es insuficiente.' };
  if (Number(audit.dimensions?.cro?.score ?? 0) < 0.75) return { eligible: false, reason: 'La composición no conserva una ruta de conversión verificable.' };
  if (Number(audit.dimensions?.responsiveness?.score ?? 0) < 1) return { eligible: false, reason: 'Falta una estrategia responsive válida.' };
  const similarity = Number(audit.structuralSimilarityScore ?? 0);
  if (similarity > 0.82) return { eligible: false, reason: 'La estructura es demasiado similar a una entrada reciente del banco.' };
  return { eligible: true };
}

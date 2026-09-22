import { validateGeneratedDocument } from './documentValidator';
import { validateTechniques } from './techniqueValidators';
import type { LandingBlueprint, NoveltyAuditResult, GeneratedVisualAsset } from './types';

export interface AuditInput { html: string; blueprint: LandingBlueprint; activeTechniqueIds: number[]; visualSource: GeneratedVisualAsset['source'] }

function score(checks: Array<{ status: 'pass' | 'partial' | 'fail'; weight: number }>): number {
  const total = checks.reduce((sum, item) => sum + item.weight, 0) || 1;
  const earned = checks.reduce((sum, item) => sum + item.weight * (item.status === 'pass' ? 1 : item.status === 'partial' ? .5 : 0), 0);
  return Number((1 + (earned / total) * 9).toFixed(1));
}

export function auditLanding(input: AuditInput): NoveltyAuditResult {
  const document = validateGeneratedDocument(input.html);
  const evidence = validateTechniques(input);
  const activeEvidence = evidence.filter(item => item.status !== 'not_requested');
  const checks = activeEvidence.flatMap(item => item.checks);
  const base = score(checks);
  const blockers = document.blockingIssues.map(issue => issue.message);
  const scores = { distinctiveness: base, usabilityUx: base, conversionCro: base, stackFidelity: document.blockingIssues.length ? 1 : base, average: 0 };
  scores.average = Number(((scores.distinctiveness + scores.usabilityUx + scores.conversionCro + scores.stackFidelity) / 4).toFixed(1));
  const failedActive = activeEvidence.filter(item => item.status === 'failed');
  blockers.push(...failedActive.map(item => `Técnica ${item.techniqueId} falló.`));
  return {
    passesBank: scores.average >= 8.5 && blockers.length === 0,
    scores,
    subtractiveDiagnosis: 'La puntuación se deriva de checks observables; no se aplican bonos artificiales.',
    strengths: activeEvidence.filter(item => item.status === 'applied').map(item => item.summary),
    refactorSuggested: blockers.length ? 'Resolver los bloqueos listados y ejecutar una nueva refinación manual.' : 'Calidad lista para revisión de banco.',
    evidence,
    blockers
  };
}

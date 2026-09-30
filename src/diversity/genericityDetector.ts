import type { BlueprintV2 } from '../design/blueprintV2';
import type { StructureFingerprint } from './structureFingerprint';

export interface GenericityResult { genericityScore: number; cardDependencyRatio: number; evidence: string[] }

export function detectGenericity(blueprint: BlueprintV2, fingerprint: StructureFingerprint, legacyHtml = ''): GenericityResult {
  const evidence: string[] = [];
  const regions = blueprint.spatialComposition.regions;
  const allCopy = blueprint.contentArchitecture.nodes.flatMap(node => node.blocks.map(block => block.text)).join(' ');
  const repeatedMorphologies = regions.length - new Set(regions.map(region => region.composition)).size;
  if (fingerprint.cardUsage > 0.35) evidence.push('Una proporción alta de regiones usa morfología card/bento.');
  if (repeatedMorphologies >= Math.max(2, Math.floor(regions.length * 0.5))) evidence.push('La morfología de región se repite con poca variación.');
  const openings = regions.filter(region => region.purpose === 'introduce');
  if (openings.length && openings.every(region => /split|two-column/i.test(region.composition))) evidence.push('La apertura repite un hero dividido genérico.');
  if (regions.some(region => /accordion-faq|faq-accordion/i.test(region.composition))) evidence.push('Las objeciones se representaron como acordeón por defecto.');
  if (/gradient-orb|purple-saas|floating-dashboard-mockup/i.test(legacyHtml)) evidence.push('Se detectó un motivo visual SaaS genérico.');
  if (/three-card-feature-grid|feature-grid/.test(legacyHtml)) evidence.push('Se detectó una cuadrícula de cards de features.');
  if (/revolucionari[oa]s?|soluciones integrales|ecosistema|lleva tu negocio al siguiente nivel|transforma tu negocio/i.test(allCopy)) evidence.push('Se detectó léxico publicitario genérico en el copy.');
  if (/radial-gradient\([^)]*(?:purple|violet|#[6-9a-f][0-9a-f]{5})/i.test(legacyHtml)) evidence.push('Se detectó un glow/gradiente púrpura genérico.');
  if (blueprint.visualStrategy.mode.toLowerCase().includes('stock') || /generic stock|stock photo|corporate handshake/i.test(blueprint.visualStrategy.prompt)) evidence.push('La estrategia visual describe imagery stock genérica.');
  if (regions.filter(region => region.children.some(child => child.primitive === 'Badge')).length > regions.length * 0.35) evidence.push('Hay sobrecarga de badges sin función estructural.');
  const cardDependencyRatio = Number(fingerprint.cardUsage.toFixed(3));
  const genericityScore = Number(Math.min(1, evidence.reduce((score, _, index) => score + (index === 0 ? 0.25 : 0.15), 0) + Math.max(0, cardDependencyRatio - 0.15)).toFixed(3));
  return { genericityScore, cardDependencyRatio, evidence };
}

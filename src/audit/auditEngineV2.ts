import { validateGeneratedDocument } from '../generation/documentValidator';
import type { BlueprintV2 } from '../design/blueprintV2';
import { getStyleAdapter } from '../design/styleTaxonomy';
import { createStructureFingerprint } from '../diversity/structureFingerprint';
import { detectStructuralSimilarity, type FingerprintCandidate } from '../diversity/similarityDetector';
import { detectGenericity } from '../diversity/genericityDetector';

export interface AuditV2Input { blueprint: BlueprintV2; html: string; recent?: readonly FingerprintCandidate[]; similarityThreshold?: number }
export interface AuditDimension { score: number; evidence: string[] }
export interface AuditV2Result {
  dimensions: { functionalQuality: AuditDimension; accessibility: AuditDimension; cro: AuditDimension; artDirectionFidelity: AuditDimension; structuralDistinctiveness: AuditDimension; morphologicalDiversity: AuditDimension; compositionCoherence: AuditDimension; brandFidelity: AuditDimension; responsiveness: AuditDimension; techniqueFidelity: AuditDimension; aiGenericity: AuditDimension; repetitionPenalty: AuditDimension };
  structuralDiversityScore: number;
  morphologicalDiversityScore: number;
  artDirectionFidelityScore: number;
  genericityPenalty: number;
  recentSimilarityPenalty: number;
  compositionEntropy: number;
  cardDependencyRatio: number;
  structuralSimilarityScore: number;
  noveltyDistance: number;
  fingerprint: ReturnType<typeof createStructureFingerprint>;
  blockers: string[];
  warnings: string[];
}

function distinctiveness(values: string[]): number {
  if (values.length < 2) return 0.35;
  const counts = new Map<string, number>(); values.forEach(value => counts.set(value, (counts.get(value) ?? 0) + 1));
  const entropy = [...counts.values()].reduce((sum, count) => { const p = count / values.length; return sum - p * Math.log2(p); }, 0);
  return Math.min(1, entropy / Math.log2(values.length));
}

function dimension(score: number, ...evidence: string[]): AuditDimension { return { score: Number(Math.max(0, Math.min(1, score)).toFixed(3)), evidence }; }

function relativeLuminance(hex: string): number {
  const value = /^#([\da-f]{6})$/i.exec(hex)?.[1];
  if (!value) return 0;
  const channels = [0, 2, 4].map(offset => parseInt(value.slice(offset, offset + 2), 16) / 255).map(channel => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrastRatio(first: string, second: string): number {
  const [lighter, darker] = [relativeLuminance(first), relativeLuminance(second)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

export function auditBlueprintV2(input: AuditV2Input): AuditV2Result {
  const { blueprint, html } = input;
  const doc = validateGeneratedDocument(html);
  const fingerprint = createStructureFingerprint(blueprint);
  const similarity = detectStructuralSimilarity(fingerprint, input.recent ?? [], input.similarityThreshold ?? 0.82);
  const genericity = detectGenericity(blueprint, fingerprint, html);
  const blockers = doc.blockingIssues.map(issue => issue.message);
  const warnings = doc.warnings.map(issue => issue.message);
  const morphologies = fingerprint.regionCompositionTypes;
  const morphologyScore = distinctiveness(morphologies);
  const adapter = getStyleAdapter(blueprint.artDirection.compositionGrammar);
  const artEvidence: string[] = [];
  if (adapter && blueprint.designGenome.gridBehavior === adapter.gridCharacter) artEvidence.push('La gramática se refleja en el comportamiento de retícula.');
  if (blueprint.designGenome.dominantAxis && blueprint.spatialComposition.dominantAxis === blueprint.designGenome.dominantAxis) artEvidence.push('El eje compositivo declarado se conserva en la espacialización.');
  if (blueprint.designGenome.geometryLanguage && blueprint.geometrySystem.language === blueprint.designGenome.geometryLanguage) artEvidence.push('La geometría del genome llega al sistema de geometría.');
  const fidelity = artEvidence.length / 3;
  const regionVariety = new Set(morphologies).size / Math.max(1, morphologies.length);
  const rhythmVariety = new Set(blueprint.spatialComposition.rhythmProfile).size / Math.max(1, blueprint.spatialComposition.rhythmProfile.length);
  const compositionCoherence = Math.max(0, 1 - Math.abs((regionVariety + rhythmVariety) / 2 - 0.68));
  const mobileSafe = blueprint.responsiveStrategy.breakpoint >= 560 && blueprint.responsiveStrategy.breakpoint <= 900 && blueprint.responsiveStrategy.regionOrder.length === blueprint.regions.length;
  const responsiveMetadataScore = mobileSafe ? 0.5 : 0;
  const foregroundContrast = contrastRatio(blueprint.visualTokens.foreground, blueprint.visualTokens.background);
  const mutedContrast = contrastRatio(blueprint.visualTokens.muted, blueprint.visualTokens.background);
  const accessibleImageAlt = [...html.matchAll(/<img\b[^>]*>/gi)].every(([tag]) => /\balt\s*=\s*["'][^"']*["']/i.test(tag));
  const ids = new Set([...html.matchAll(/\bid=["']([^"']+)["']/gi)].map(([, id]) => id));
  const brokenAnchors = [...html.matchAll(/\bhref=["']#([^"']+)["']/gi)].map(([, id]) => id).filter(id => !ids.has(id));
  const accessibilityChecks = [/<main\b/i.test(html), /<h1\b/i.test(html), /:focus-visible/i.test(html), /prefers-reduced-motion/i.test(html), /<html\s+lang=/i.test(html), !/<(?:script|link|img|video|source)\b[^>]+(?:src|href)=['"]https?:/i.test(html), accessibleImageAlt, brokenAnchors.length === 0, foregroundContrast >= 4.5, mutedContrast >= 4.5];
  const accessibilityScore = accessibilityChecks.filter(Boolean).length / accessibilityChecks.length;
  const functionalScore = doc.blockingIssues.length ? 0 : /<main\b/i.test(html) && /<section\b/i.test(html) ? 1 : 0.6;
  const conversionScore = blueprint.contentArchitecture.nodes.some(node => node.purpose === 'convert') && Boolean(blueprint.contentArchitecture.primaryAction.label) ? 1 : 0.45;
  const techniqueScore = blueprint.interactionPlan.every(item => item.reducedMotion) ? 1 : 0.7;
  const repetitionPenalty = similarity.aboveThreshold ? similarity.structuralSimilarityScore : 0;
  if (similarity.aboveThreshold) warnings.push(`Alta similitud estructural (${similarity.structuralSimilarityScore}) con ${similarity.mostSimilarId}.`);
  if (genericity.cardDependencyRatio > 0.35) warnings.push('La proporción de regiones basadas en cards supera 0.35.');
  if (!mobileSafe) blockers.push('ResponsiveStrategy incompleta o fuera de rangos seguros.');
  warnings.push('La estrategia responsive es metadata; requiere medición DOM en viewport para confirmar overflow, clipping y colisiones.');
  if (accessibilityScore < 0.8) warnings.push('Falta evidencia estática suficiente de accesibilidad.');
  if (brokenAnchors.length) warnings.push(`Hay fragmentos sin destino: ${brokenAnchors.join(', ')}.`);
  return {
    dimensions: {
      functionalQuality: dimension(functionalScore, ...doc.blockingIssues.map(issue => issue.message)),
      accessibility: dimension(accessibilityScore, ...accessibilityChecks.map((pass, index) => `${['main landmark', 'h1 hierarchy', 'focus visible', 'reduced motion', 'lang', 'no remote resources', 'image alt', 'fragment targets', 'foreground contrast', 'muted contrast'][index]}: ${pass ? 'ok' : 'missing'}${index === 8 ? ` (${foregroundContrast.toFixed(2)}:1)` : index === 9 ? ` (${mutedContrast.toFixed(2)}:1)` : ''}`)),
      cro: dimension(conversionScore, conversionScore === 1 ? 'Existe propósito convert y acción primaria.' : 'No se encontró región de conversión.'),
      artDirectionFidelity: dimension(fidelity, ...artEvidence, ...(artEvidence.length < 3 ? ['La gramática puede no sobrevivir a una lectura sin tokens de color.'] : [])),
      structuralDistinctiveness: dimension(similarity.noveltyDistance, `Comparación contra ${input.recent?.length ?? 0} estructuras recientes.`),
      morphologicalDiversity: dimension(morphologyScore, `${new Set(morphologies).size} morfologías distintas de ${morphologies.length} regiones.`),
      compositionCoherence: dimension(compositionCoherence, `Variedad morfológica ${regionVariety.toFixed(2)}; variación rítmica ${rhythmVariety.toFixed(2)}.`),
      brandFidelity: dimension(blueprint.strategy.brandName && blueprint.strategy.promise ? 1 : 0.4, 'Marca y promesa conservadas desde estrategia.'),
      responsiveness: dimension(responsiveMetadataScore, mobileSafe ? `${blueprint.responsiveStrategy.transformation} declarada; validación DOM real pendiente.` : 'Falta orden responsive consistente.'),
      techniqueFidelity: dimension(techniqueScore, ...blueprint.interactionPlan.map(item => `${item.id}: ${item.reducedMotion}`)),
      aiGenericity: dimension(1 - genericity.genericityScore, ...genericity.evidence),
      repetitionPenalty: dimension(1 - repetitionPenalty, similarity.mostSimilarId ? `Más similar a ${similarity.mostSimilarId}.` : 'Sin historial de comparación.')
    },
    structuralDiversityScore: similarity.noveltyDistance,
    morphologicalDiversityScore: morphologyScore,
    artDirectionFidelityScore: fidelity,
    genericityPenalty: genericity.genericityScore,
    recentSimilarityPenalty: repetitionPenalty,
    compositionEntropy: morphologyScore,
    cardDependencyRatio: genericity.cardDependencyRatio,
    structuralSimilarityScore: similarity.structuralSimilarityScore,
    noveltyDistance: similarity.noveltyDistance,
    fingerprint,
    blockers,
    warnings
  };
}

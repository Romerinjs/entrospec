import type { BlueprintV2, ContentPurpose } from './blueprintV2';
import { REGION_MORPHOLOGIES } from '../composition/compositionGrammarEngine';

export interface BlueprintV2Issue { path: string; message: string }
export type BlueprintV2Validation = { ok: true; value: BlueprintV2 } | { ok: false; issues: BlueprintV2Issue[] };

const safeString = (value: unknown, max = 4000): value is string => typeof value === 'string' && value.length <= max;
const purposes = new Set(Object.keys(REGION_MORPHOLOGIES));

export function validateBlueprintV2(value: unknown): BlueprintV2Validation {
  const issues: BlueprintV2Issue[] = [];
  if (!value || typeof value !== 'object') return { ok: false, issues: [{ path: '$', message: 'Se esperaba un objeto BlueprintV2.' }] };
  const candidate = value as Partial<BlueprintV2>;
  if (candidate.schemaVersion !== 2) issues.push({ path: 'schemaVersion', message: 'Debe ser 2.' });
  for (const key of ['brandName', 'industry', 'audience', 'promise', 'objective'] as const) if (!safeString(candidate.strategy?.[key], 500) || !candidate.strategy?.[key].trim()) issues.push({ path: `strategy.${key}`, message: 'El campo es obligatorio y tiene un máximo de 500 caracteres.' });
  if ((candidate.strategy?.claims?.length ?? 0) > 20 || !Array.isArray(candidate.strategy?.claims)) issues.push({ path: 'strategy.claims', message: 'Claims inválidos o excesivos.' });
  if (!candidate.artDirection || !candidate.designGenome) issues.push({ path: 'designGenome', message: 'ArtDirection y DesignGenome son obligatorios.' });
  for (const key of ['compositionGrammar', 'surfaceLanguage', 'artDirection', 'ornamentation', 'density', 'motionLanguage', 'styleSeed', 'rationale'] as const) if (!safeString(candidate.artDirection?.[key], 800)) issues.push({ path: `artDirection.${key}`, message: 'Dimensión estilística inválida o demasiado larga.' });
  if ((candidate.designGenome?.prohibitedPatterns?.length ?? 0) > 40 || (candidate.designGenome?.sectionMorphology?.length ?? 0) > 20) issues.push({ path: 'designGenome', message: 'Metadata del genome excede los límites.' });
  const nodes = candidate.contentArchitecture?.nodes;
  if (!Array.isArray(nodes) || nodes.length < 2 || nodes.length > 14) issues.push({ path: 'contentArchitecture.nodes', message: 'Se requieren entre 2 y 14 nodos de contenido.' });
  const nodeList = Array.isArray(nodes) ? nodes : [];
  const regions = candidate.regions;
  if (!Array.isArray(regions) || regions.length < 2 || regions.length > 14) issues.push({ path: 'regions', message: 'Se requieren entre 2 y 14 regiones espaciales.' });
  const regionList = Array.isArray(regions) ? regions : [];
  const nodeIds = new Set(nodeList.map(node => node?.id).filter((id): id is string => typeof id === 'string'));
  const regionIds = new Set<string>();
  for (const [index, region] of regionList.entries()) {
    if (!region || typeof region !== 'object') { issues.push({ path: `regions.${index}`, message: 'La región debe ser un objeto.' }); continue; }
    if (!safeString(region.id, 100)) issues.push({ path: `regions.${index}.id`, message: 'ID inválido.' });
    if (regionIds.has(region.id)) issues.push({ path: `regions.${index}.id`, message: 'Los IDs de regiones deben ser únicos.' });
    regionIds.add(region.id);
    if (!safeString(region.composition, 120)) issues.push({ path: `regions.${index}.composition`, message: 'Morfología inválida.' });
    if (!safeString(region.purpose, 80)) issues.push({ path: `regions.${index}.purpose`, message: 'Propósito inválido.' });
    if (!Number.isInteger(region.placement?.columnSpan) || region.placement.columnSpan < 1 || region.placement.columnSpan > 16) issues.push({ path: `regions.${index}.placement.columnSpan`, message: 'Span fuera de límites.' });
    if (!Array.isArray(region.children) || region.children.length > 40) issues.push({ path: `regions.${index}.children`, message: 'Primitivas inválidas o excesivas.' });
    if (!Array.isArray(region.contentNodeIds) || region.contentNodeIds.some(id => !nodeIds.has(id))) issues.push({ path: `regions.${index}.contentNodeIds`, message: 'La región referencia nodos inexistentes.' });
    if (!region.placement || region.placement.row < 1 || region.placement.row > 64 || region.placement.rowSpan < 1 || region.placement.rowSpan > 4) issues.push({ path: `regions.${index}.placement`, message: 'Posición vertical fuera de límites.' });
    if (region.placement && (region.placement.column < 0 || region.placement.column + region.placement.columnSpan > (candidate.designGenome?.gridColumns ?? 16))) issues.push({ path: `regions.${index}.placement`, message: 'La región sobrepasa la retícula.' });
  }
  for (const [index, node] of nodeList.entries()) {
    if (!node || typeof node !== 'object') { issues.push({ path: `contentArchitecture.nodes.${index}`, message: 'El nodo debe ser un objeto.' }); continue; }
    if (!purposes.has(node.purpose) && !/^[a-z][a-z0-9-]{1,79}$/.test(node.purpose)) issues.push({ path: `contentArchitecture.nodes.${index}.purpose`, message: 'Purpose debe ser un identificador semántico extensible.' });
    if (!Array.isArray(node.blocks) || node.blocks.length > 40) issues.push({ path: `contentArchitecture.nodes.${index}.blocks`, message: 'Bloques inválidos o excesivos.' });
    const blocks = Array.isArray(node.blocks) ? node.blocks : [];
    for (const [blockIndex, block] of blocks.entries()) {
      if (!block || !safeString(block.text)) issues.push({ path: `contentArchitecture.nodes.${index}.blocks.${blockIndex}.text`, message: 'Texto inválido o demasiado largo.' });
    }
  }
  const columns = candidate.designGenome?.gridColumns;
  if (!Number.isInteger(columns) || (columns ?? 0) < 1 || (columns ?? 0) > 16) issues.push({ path: 'designGenome.gridColumns', message: 'La retícula debe tener entre 1 y 16 columnas.' });
  if ((candidate.designGenome?.overlapLevel ?? -1) < 0 || (candidate.designGenome?.overlapLevel ?? 2) > 0.85) issues.push({ path: 'designGenome.overlapLevel', message: 'Overlap sobrepasa el límite seguro.' });
  if (!candidate.visualTokens || !candidate.spatialComposition || !candidate.responsiveStrategy || !candidate.motionGrammar) issues.push({ path: '$', message: 'Faltan sistemas de visual tokens, composición, responsive o motion.' });
  if (nodeList.some(node => !node || !Array.isArray(node.blocks) || node.blocks.length > 40 || node.blocks.some(block => !block || typeof block.text !== 'string' || block.text.length > 4000))) issues.push({ path: 'contentArchitecture.nodes.blocks', message: 'Contenido excede límites de tamaño.' });
  if ((candidate.spatialComposition?.regions?.length ?? -1) !== regionList.length) issues.push({ path: 'spatialComposition.regions', message: 'La proyección y composición espacial deben contener las mismas regiones.' });
  if (!candidate.contentArchitecture?.primaryAction?.label?.trim()) issues.push({ path: 'contentArchitecture.primaryAction', message: 'Se requiere una acción primaria.' });
  return issues.length ? { ok: false, issues } : { ok: true, value: candidate as BlueprintV2 };
}

export function normalizePurpose(value: string): ContentPurpose | string {
  return value.trim().toLowerCase();
}

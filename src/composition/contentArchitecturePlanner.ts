import type { ContentArchitectureV2 } from '../design/blueprintV2';
import type { BrandBrief } from '../generation/types';

/** Preserves the model's semantic order while normalizing dependencies and bounds. */
export function planContentArchitecture(brief: BrandBrief, proposed?: Partial<ContentArchitectureV2>): ContentArchitectureV2 | undefined {
  if (!Array.isArray(proposed?.nodes) || proposed.nodes.length < 2) return undefined;
  const nodes = proposed.nodes.slice(0, 14);
  const ids = new Set(nodes.map(node => node.id));
  const orderedIds = Array.isArray(proposed.readingLogic) ? proposed.readingLogic.filter(id => ids.has(id)) : [];
  const readingLogic = [...new Set([...orderedIds, ...nodes.map(node => node.id)])];
  const normalizedNodes = nodes.map(node => ({
    ...node,
    blocks: node.blocks.slice(0, 40).map(block => ({ ...block, text: block.text.slice(0, 4000), priority: Math.max(0, Math.min(10, block.priority)) })),
    dependsOn: [...new Set(node.dependsOn.filter(id => ids.has(id) && id !== node.id))],
    priority: Math.max(0, Math.min(10, node.priority))
  })).sort((left, right) => readingLogic.indexOf(left.id) - readingLogic.indexOf(right.id));
  const action = proposed.primaryAction?.label?.trim() ? proposed.primaryAction : { label: brief.primaryAction || 'Continuar', href: '#top' };
  return {
    objective: proposed.objective?.trim() || brief.valueProposition,
    readingLogic,
    nodes: normalizedNodes,
    requiredClaims: (proposed.requiredClaims ?? []).filter(Boolean).slice(0, 20),
    primaryAction: { label: action.label.slice(0, 120), href: action.href.slice(0, 300) }
  };
}

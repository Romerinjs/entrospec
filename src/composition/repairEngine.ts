import type { BlueprintV2 } from '../design/blueprintV2';

export interface RepairFinding { regionId: string; repair: 'span-clamp' | 'column-clamp' | 'overlap-clamp' | 'row-clamp'; before: number; after: number }

/** Repairs spatial bounds while preserving composition family, art direction and reading intent. */
export function repairResponsiveComposition(blueprint: BlueprintV2): { blueprint: BlueprintV2; findings: RepairFinding[] } {
  const maxColumns = Math.max(1, Math.min(16, Math.floor(blueprint.spatialComposition.grid.columns)));
  const findings: RepairFinding[] = [];
  const regions = blueprint.spatialComposition.regions.map(region => {
    const placement = { ...region.placement };
    if (placement.columnSpan > blueprint.spatialComposition.grid.columns || placement.columnSpan < 1) {
      const before = placement.columnSpan;
      placement.columnSpan = Math.max(1, Math.min(blueprint.spatialComposition.grid.columns, placement.columnSpan));
      findings.push({ regionId: region.id, repair: 'span-clamp', before, after: placement.columnSpan });
    }
    const maxStart = Math.max(0, maxColumns - placement.columnSpan);
    if (placement.column > maxStart || placement.column < 0) {
      const before = placement.column;
      placement.column = Math.max(0, Math.min(maxStart, Math.floor(placement.column)));
      findings.push({ regionId: region.id, repair: 'column-clamp', before, after: placement.column });
    }
    if (placement.overlap < 0 || placement.overlap > 0.85) {
      const before = placement.overlap;
      placement.overlap = Math.max(0, Math.min(0.85, placement.overlap));
      findings.push({ regionId: region.id, repair: 'overlap-clamp', before, after: placement.overlap });
    }
    if (placement.row < 1 || placement.row > 64) {
      const before = placement.row;
      placement.row = Math.max(1, Math.min(64, Math.floor(placement.row)));
      findings.push({ regionId: region.id, repair: 'row-clamp', before, after: placement.row });
    }
    return { ...region, placement };
  });
  const repaired = { ...blueprint, regions, spatialComposition: { ...blueprint.spatialComposition, regions } };
  return { blueprint: repaired, findings };
}

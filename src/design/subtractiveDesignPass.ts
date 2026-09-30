import type { BlueprintV2 } from './blueprintV2';

export interface SubtractiveFinding { regionId: string; primitive: string; reason: string }
export interface SubtractiveResult { blueprint: BlueprintV2; removed: SubtractiveFinding[] }

export function runSubtractiveDesignPass(blueprint: BlueprintV2): SubtractiveResult {
  const removed: SubtractiveFinding[] = [];
  const regions = blueprint.regions.map(region => {
    const seenCtas = new Set<string>();
    const children = region.children.filter(child => {
      if (child.props?.decorative === true && child.props?.communicative !== true) {
        removed.push({ regionId: region.id, primitive: child.primitive, reason: 'Ornamento declarado sin función de comunicación.' });
        return false;
      }
      if (child.primitive === 'Badge' && child.props?.purpose === 'decorative') {
        removed.push({ regionId: region.id, primitive: child.primitive, reason: 'Badge ornamental sin propósito de orientación o evidencia.' });
        return false;
      }
      if (child.primitive === 'Navigation' && child.contentId) {
        if (seenCtas.has(child.contentId)) {
          removed.push({ regionId: region.id, primitive: child.primitive, reason: 'CTA duplicado en la misma región.' });
          return false;
        }
        seenCtas.add(child.contentId);
      }
      return true;
    });
    return { ...region, children };
  });
  return { blueprint: { ...blueprint, regions, spatialComposition: { ...blueprint.spatialComposition, regions } }, removed };
}

import React, { useMemo } from 'react';

export const DiversityBankSummary: React.FC<{ records: any[] }> = ({ records }) => {
  const summary = useMemo(() => {
    const v2 = records.filter(record => record.blueprintV2);
    const distribution = new Map<string, number>();
    const heroMorphologies = new Map<string, number>();
    for (const record of v2) {
      const family = record.blueprintV2.designGenome.compositionFamily;
      distribution.set(family, (distribution.get(family) ?? 0) + 1);
      const hero = record.structureFingerprint?.heroMorphology || 'unknown';
      heroMorphologies.set(hero, (heroMorphologies.get(hero) ?? 0) + 1);
    }
    const cardRatio = v2.length ? v2.reduce((sum, record) => sum + Number(record.auditV2?.cardDependencyRatio ?? record.structureFingerprint?.cardUsage ?? 0), 0) / v2.length : 0;
    return { v2Count: v2.length, distribution: [...distribution.entries()].sort((a, b) => b[1] - a[1]), heroMorphologies: [...heroMorphologies.entries()].sort((a, b) => b[1] - a[1]), cardRatio };
  }, [records]);
  if (!records.length) return null;
  return <section aria-label="Distribución de diversidad del banco" className="mb-5 flex flex-wrap gap-5 border border-[#292929] bg-[#111] p-4 text-xs">
    <div><p className="mono text-[10px] text-[#737373]">GENOMES V2</p><strong className="text-[#F3F3F3]">{summary.v2Count}</strong></div>
    <div><p className="mono text-[10px] text-[#737373]">FAMILIAS COMPOSITIVAS</p><div className="flex flex-wrap gap-2">{summary.distribution.length ? summary.distribution.map(([family, count]) => <span key={family} className="border border-[#333] px-2 py-1 text-[#A1A1A1]">{family} · {count}</span>) : <span className="text-[#737373]">Aún no hay fingerprints V2.</span>}</div></div>
    <div><p className="mono text-[10px] text-[#737373]">MORFOLOGÍAS DE APERTURA</p><div className="flex flex-wrap gap-2">{summary.heroMorphologies.map(([morphology, count]) => <span key={morphology} className="border border-[#333] px-2 py-1 text-[#A1A1A1]">{morphology} · {count}</span>)}</div></div>
    <div><p className="mono text-[10px] text-[#737373]">CARD DEPENDENCY</p><strong className={summary.cardRatio > 0.35 ? 'text-[#E06D53]' : 'text-[#22C55E]'}>{summary.cardRatio.toFixed(2)}</strong></div>
  </section>;
};

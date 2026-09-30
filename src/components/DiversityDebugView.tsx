import React from 'react';
import { compareStructureFingerprints } from '../diversity/similarityDetector';
import type { GenerationRecord } from '../generation/types';

export const DiversityDebugView: React.FC<{ records: GenerationRecord[] }> = ({ records }) => {
  const v2 = records.filter(record => record.blueprintV2 && record.structureFingerprint);
  if (v2.length < 2) return null;
  return <section aria-label="Comparador de diversidad estructural" className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
    {v2.map((record, index) => {
      const nearest = v2.filter((_, candidateIndex) => candidateIndex !== index).map(other => ({ id: other.id, score: compareStructureFingerprints(record.structureFingerprint!, other.structureFingerprint!) })).sort((a, b) => b.score - a.score)[0];
      const genome = record.blueprintV2!.designGenome;
      const audit = record.auditV2;
      return <article key={record.id} className="border border-[#292929] bg-[#111] p-3">
        <iframe title={`Thumbnail estructural ${index + 1}`} sandbox="allow-scripts" srcDoc={record.htmlCode} className="mb-3 h-48 w-full bg-[#0A0A0A]" />
        <div className="flex justify-between gap-3 text-xs"><strong>{genome.compositionFamily}</strong><span>cards {audit?.cardDependencyRatio.toFixed(2) ?? '—'}</span></div>
        <p className="mt-2 text-[11px] text-[#A1A1A1]">Apertura: {record.structureFingerprint?.heroMorphology}</p>
        <p className="text-[11px] text-[#A1A1A1]">Regiones: {record.structureFingerprint?.regionCompositionTypes.join(' → ')}</p>
        <p className="text-[11px] text-[#A1A1A1]">Eje {genome.dominantAxis} · {genome.gridFamily} · {genome.density}</p>
        <p className="mt-2 font-mono text-[10px] text-[#22C55E]">Similitud más cercana: {nearest ? `${nearest.score.toFixed(3)} · ${nearest.id}` : '—'}</p>
      </article>;
    })}
  </section>;
};

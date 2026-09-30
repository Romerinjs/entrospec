import React, { useState } from 'react';
import type { GenerationRecord } from '../generation/types';

export const GenerationInspector: React.FC<{ record: GenerationRecord }> = ({ record }) => {
  const [tab, setTab] = useState('prompt');
  const architectureTabs = record.blueprintV2 ? ['prompt', 'art-direction', 'genome', 'composition', 'fingerprint', 'evidence'] : ['prompt', 'blueprint', 'evidence'];
  const totalCalls = record.callsUsed.totalCalls ?? (record.callsUsed.textCalls + record.callsUsed.imageCalls);

  return (
    <aside className="bg-[#141414] p-5 flex min-h-[520px] flex-col gap-4">
      <div>
        <p className="mono text-[11px] uppercase tracking-widest text-[#737373]">INSPECCIÓN</p>
        <h2 className="text-lg font-medium text-[#F3F3F3]">{record.blueprint.metadata.title}</h2>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs bg-[#191919] p-3">
        <div className="flex flex-col gap-0.5">
          <span className="mono text-[10px] text-[#737373] uppercase">LLAMADAS API</span>
          <span className="mono font-semibold text-[#22C55E]">
            {totalCalls} {totalCalls === 1 ? 'llamada' : 'llamadas'}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="mono text-[10px] text-[#737373] uppercase">BLUEPRINT / TEXTO</span>
          <span className="mono text-[#F3F3F3]">
            {record.blueprintSource === 'gemini' ? 'Gemini API (1 call)' : 'Procedural SSoT'}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="mono text-[10px] text-[#737373] uppercase">ACTIVO VISUAL</span>
          <span className="mono text-[#F3F3F3]">{record.visual.source}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="mono text-[10px] text-[#737373] uppercase">TÉCNICAS ACTIVAS</span>
          <span className="mono text-[#F3F3F3]">
            {record.request?.activeTechniqueIds?.length ?? 0} en 1 prompt
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        {architectureTabs.map(item => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`px-3 py-2 text-xs transition-colors ${
              tab === item ? 'bg-[#282828] text-[#F3F3F3]' : 'bg-[#1F1F1F] text-[#737373] hover:text-[#A1A1A1]'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {tab === 'prompt' && (
        <textarea
          aria-label="Prompt ejecutado"
          readOnly
          value={record.request.executedPrompt}
          rows={12}
          className="flex-1 resize-none bg-[#0A0A0A] p-3 font-mono text-xs text-[#A1A1A1]"
        />
      )}

      {tab === 'blueprint' && !record.blueprintV2 && (
        <pre className="flex-1 overflow-auto bg-[#0A0A0A] p-3 font-mono text-[11px] text-[#A1A1A1]">
          {JSON.stringify(record.blueprint, null, 2)}
        </pre>
      )}

      {tab === 'art-direction' && record.blueprintV2 && (
        <pre className="flex-1 overflow-auto bg-[#0A0A0A] p-3 font-mono text-[11px] text-[#A1A1A1]">
          {JSON.stringify({ artDirection: record.blueprintV2.artDirection, visualStrategy: record.blueprintV2.visualStrategy, motionGrammar: record.blueprintV2.motionGrammar }, null, 2)}
        </pre>
      )}

      {tab === 'genome' && record.blueprintV2 && (
        <pre className="flex-1 overflow-auto bg-[#0A0A0A] p-3 font-mono text-[11px] text-[#A1A1A1]">
          {JSON.stringify({ designGenome: record.blueprintV2.designGenome, responsiveStrategy: record.blueprintV2.responsiveStrategy, seedDerivation: record.seedDerivation }, null, 2)}
        </pre>
      )}

      {tab === 'composition' && record.blueprintV2 && (
        <pre className="flex-1 overflow-auto bg-[#0A0A0A] p-3 font-mono text-[11px] text-[#A1A1A1]">
          {JSON.stringify(record.blueprintV2.spatialComposition, null, 2)}
        </pre>
      )}

      {tab === 'fingerprint' && record.blueprintV2 && (
        <div className="flex flex-1 flex-col gap-3 overflow-auto bg-[#0A0A0A] p-3 text-xs text-[#A1A1A1]">
          <p>Similitud estructural: <strong className="text-[#F3F3F3]">{record.auditV2?.structuralSimilarityScore.toFixed(3) ?? 'sin historial'}</strong></p>
          <p>Diversidad estructural: <strong className="text-[#F3F3F3]">{record.auditV2?.structuralDiversityScore.toFixed(3) ?? '—'}</strong></p>
          <p>Morfologías distintas: <strong className="text-[#F3F3F3]">{record.auditV2?.morphologicalDiversityScore.toFixed(3) ?? '—'}</strong></p>
          <p>Genericidad: <strong className="text-[#F3F3F3]">{record.auditV2?.genericityPenalty.toFixed(3) ?? '—'}</strong></p>
          <p>Ratio cards: <strong className="text-[#F3F3F3]">{record.auditV2?.cardDependencyRatio.toFixed(3) ?? '—'}</strong></p>
          {record.compositionRepair && <p>Recomposición por similitud: <strong className="text-[#F3F3F3]">{record.compositionRepair.repaired ? 'sí' : 'no'} · {record.compositionRepair.initialSimilarity.toFixed(3)} → {record.compositionRepair.finalSimilarity.toFixed(3)} · {record.compositionRepair.attempts} intentos</strong></p>}
          <pre className="overflow-auto whitespace-pre-wrap font-mono text-[10px]">{JSON.stringify(record.structureFingerprint, null, 2)}</pre>
        </div>
      )}

      {tab === 'evidence' && (
        <div className="flex flex-col gap-3 text-xs">
          {record.auditV2 && <div className="border border-[#2a2a2a] bg-[#101010] p-3">
            <p className="mono mb-2 text-[10px] text-[#22C55E]">AUDITORÍA ARQUITECTÓNICA V2</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {Object.entries(record.auditV2.dimensions).map(([name, item]) => <div key={name} className="border-b border-[#252525] pb-1">
                <div className="flex justify-between gap-2"><span className="text-[#A1A1A1]">{name}</span><strong>{item.score.toFixed(2)}</strong></div>
                {item.evidence[0] && <p className="mt-1 text-[10px] text-[#737373]">{item.evidence[0]}</p>}
              </div>)}
            </div>
            {record.auditV2.warnings.map(warning => <p key={warning} className="mt-2 text-[10px] text-[#EAB308]">{warning}</p>)}
          </div>}
          <div className="flex justify-between items-center bg-[#191919] p-3">
            <span className="text-[#737373]">Consumo total API</span>
            <span className="mono font-semibold text-[#F3F3F3]">
              {record.callsUsed.textCalls} texto · {record.callsUsed.imageCalls} imagen
            </span>
          </div>
          <div className="flex justify-between items-center bg-[#191919] p-3">
            <span className="text-[#737373]">Internal Technique Score</span>
            <span className="mono font-semibold text-[#22C55E]">{record.audit.scores.average}/10</span>
          </div>
          {record.audit.evidence.map(item => (
            <div key={item.techniqueId} className="bg-[#1F1F1F] p-3">
              <div className="flex justify-between items-center">
                <span className="font-medium text-[#F3F3F3]">Técnica 0{item.techniqueId}</span>
                <span className="mono text-[11px] text-[#22C55E]">{item.status}</span>
              </div>
              <p className="mt-1 text-[#A1A1A1]">{item.summary}</p>
            </div>
          ))}
          {record.techniqueTrace && <div className="overflow-auto bg-[#101010] p-3"><h3 className="mb-2 text-[#F3F3F3]">Technique trace</h3><table className="w-full text-left text-[11px]"><thead><tr>{['Technique', 'Active', 'Injected', 'Audited', 'Evidence'].map(label => <th key={label} className="px-2 py-1 text-[#737373]">{label}</th>)}</tr></thead><tbody>{record.techniqueTrace.map(row => <tr key={row.id} className="align-top"><td className="px-2 py-1">{row.technique}</td><td className="px-2 py-1">{String(row.active)}</td><td className="px-2 py-1">{String(row.injected)}</td><td className="px-2 py-1">{String(row.audited)}</td><td className="px-2 py-1 text-[#A1A1A1]">{row.evidence}</td></tr>)}</tbody></table></div>}
          {record.audit.blockers.map(blocker => (
            <p key={blocker} className="text-[#E06D53] bg-[#2A1614] p-3">{blocker}</p>
          ))}
        </div>
      )}
    </aside>
  );
};

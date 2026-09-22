import React, { useState } from 'react';
import type { GenerationRecord } from '../generation/types';

export const GenerationInspector: React.FC<{ record: GenerationRecord }> = ({ record }) => {
  const [tab, setTab] = useState<'prompt' | 'blueprint' | 'evidence'>('prompt');
  return <aside className="bg-[#141414] p-5 flex min-h-[520px] flex-col gap-4">
    <div><p className="mono text-[11px] uppercase tracking-widest text-[#737373]">INSPECCIÓN</p><h2 className="text-lg font-medium">{record.blueprint.metadata.title}</h2></div>
    <div className="flex justify-between text-xs text-[#737373]"><span>Visual</span><span className="text-[#F3F3F3]">{record.visual.source}</span></div>
    <div className="flex gap-2">{(['prompt', 'blueprint', 'evidence'] as const).map(item => <button key={item} type="button" onClick={() => setTab(item)} className={`px-3 py-2 text-xs ${tab === item ? 'bg-[#282828] text-[#F3F3F3]' : 'bg-[#1F1F1F] text-[#737373]'}`}>{item}</button>)}</div>
    {tab === 'prompt' && <textarea aria-label="Prompt ejecutado" readOnly value={record.request.executedPrompt} rows={12} className="flex-1 resize-none bg-[#0A0A0A] p-3 font-mono text-xs text-[#A1A1A1]" />}
    {tab === 'blueprint' && <pre className="flex-1 overflow-auto bg-[#0A0A0A] p-3 font-mono text-[11px] text-[#A1A1A1]">{JSON.stringify(record.blueprint, null, 2)}</pre>}
    {tab === 'evidence' && <div className="flex flex-col gap-3 text-xs"><div className="flex justify-between"><span className="text-[#737373]">Llamadas</span><span>{record.callsUsed.textCalls} texto · {record.callsUsed.imageCalls} imagen</span></div><div className="flex justify-between"><span className="text-[#737373]">Promedio</span><span>{record.audit.scores.average}/10</span></div>{record.audit.evidence.map(item => <div key={item.techniqueId} className="bg-[#1F1F1F] p-3"><div className="flex justify-between"><span>Técnica {item.techniqueId}</span><span className="text-[#22C55E]">{item.status}</span></div><p className="mt-1 text-[#A1A1A1]">{item.summary}</p></div>)}{record.audit.blockers.map(blocker => <p key={blocker} className="text-[#E06D53]">{blocker}</p>)}</div>}
  </aside>;
};

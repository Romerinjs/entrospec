import React, { useMemo, useState } from 'react';
import { Header } from './components/Header';
import { BrandBriefForm } from './components/BrandBriefForm';
import { OutputContract } from './components/OutputContract';
import { GenerationProgress } from './components/GenerationProgress';
import { PromptViewer } from './components/PromptViewer';
import { SandboxPreview } from './components/SandboxPreview';
import { GenerationInspector } from './components/GenerationInspector';
import { LandingBank } from './components/LandingBank';
import { generateRandomSeed, computeSsotVector } from './core/ssotEngine';
import { composeGenerationPrompt } from './generation/promptComposer';
import { TECHNIQUE_CATALOG } from './generation/techniqueCatalog';
import { createGenerationPipeline } from './generation/generationPipeline';
import { createGeminiGateway } from './services/geminiGateway';
import { createProjectRepository } from './storage/projectRepository';
import type { BrandBrief, GenerationRecord, GenerationStage, ImageMode } from './generation/types';
import type { ActiveTab } from './types';

const env = (import.meta as unknown as { env: Record<string, string | undefined> }).env;
const initialBrief: BrandBrief = { brandName: 'Northline', industry: 'Infraestructura técnica', valueProposition: 'Decisiones operativas más claras, con evidencia que se puede leer.', targetAudience: 'Equipos de producto y arquitectura', brandPersonality: 'Sobria, precisa y con tensión editorial', toneOfVoice: 'Directo, humano y verificable', primaryAction: 'Ver cómo funciona' };

function browserCodec() {
  return { compress: async ({ dataUrl }: { mimeType: string; dataUrl: string }) => {
    try {
      const image = new Image(); image.src = dataUrl; await image.decode();
      const ratio = Math.min(1, 1600 / image.width, 1200 / image.height); const canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.round(image.width * ratio)); canvas.height = Math.max(1, Math.round(image.height * ratio));
      canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height); const compressed = canvas.toDataURL('image/webp', .78); return { dataUrl: compressed, byteLength: Math.round(compressed.length * .75) };
    } catch { return { dataUrl, byteLength: Math.round(dataUrl.length * .75) }; }
  } };
}

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('studio');
  const [brief, setBrief] = useState<BrandBrief>(initialBrief);
  const [seed, setSeed] = useState(() => generateRandomSeed(28));
  const [techniques, setTechniques] = useState(() => TECHNIQUE_CATALOG.map(item => ({ id: item.id, title: item.title, enabled: true })));
  const [capabilities, setCapabilities] = useState<string[]>(['svg', 'css-motion', 'interaction-js']);
  const [imageMode, setImageMode] = useState<ImageMode>('generated');
  const [reference, setReference] = useState<{ dataUrl: string; mimeType: string }>();
  const [stage, setStage] = useState<GenerationStage>('idle');
  const [error, setError] = useState<string>();
  const [record, setRecord] = useState<GenerationRecord>();
  const [prompt, setPrompt] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [bank, setBank] = useState<any[]>([]);
  const ssot = useMemo(() => computeSsotVector(seed, ['HTML5', 'CSS nativo', 'JavaScript vanilla']), [seed]);
  const activeTechniqueIds = techniques.filter(item => item.enabled).map(item => item.id);
  const promptBundle = useMemo(() => composeGenerationPrompt({ brief, ssot, activeTechniqueIds, imageMode, capabilities }), [brief, ssot, activeTechniqueIds.join(','), imageMode, capabilities.join(',')]);
  const repository = useMemo(() => createProjectRepository(), []);
  const pipeline = useMemo(() => createGenerationPipeline({ gateway: createGeminiGateway({ apiKey: env.VITE_GEMINI_API_KEY || '', textModel: env.VITE_GEMINI_TEXT_MODEL || 'gemini-2.5-flash', imageModel: env.VITE_GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image' }), cache: { get: repository.getVisualAsset.bind(repository), put: repository.putVisualAsset.bind(repository) }, codec: browserCodec() }), [repository]);

  React.useEffect(() => { setPrompt(current => current || promptBundle.masterPrompt); setGeneratedPrompt(promptBundle.masterPrompt); }, [promptBundle.masterPrompt]);
  React.useEffect(() => { repository.listCurated().then(setBank).catch(() => undefined); }, [repository]);

  const handleRun = async () => {
    setError(undefined); setStage('building_prompt');
    try {
      const next = await pipeline.run({ brief, executedPrompt: prompt, ssotSeed: seed, activeTechniqueIds, imageMode, capabilities, visualReference: reference }, { onStage: setStage, onError: errorValue => setError(errorValue.message) });
      setRecord(next); setStage('complete');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo construir la landing.'); }
  };
  const toggleTechnique = (id: number) => setTechniques(items => items.map(item => item.id === id ? { ...item, enabled: !item.enabled } : item));
  const toggleCapability = (id: string) => setCapabilities(items => items.includes(id) ? items.filter(item => item !== id) : [...items, id]);
  const saveDraft = async () => { if (record) await repository.saveDraft(record); };
  const saveCurated = async () => { if (!record) return; await repository.saveCurated({ ...record, collection: 'curated' }); setBank(await repository.listCurated()); };
  const openRecord = (item: any) => { setRecord(item); setPrompt(item.request?.executedPrompt || item.prompts?.masterPrompt || ''); setActiveTab('studio'); };

  return <div className="min-h-screen bg-[#0A0A0A] text-[#F3F3F3]"><Header activeTab={activeTab} setActiveTab={setActiveTab} bankCount={bank.length} />{activeTab === 'studio' ? <main className="mx-auto flex w-full max-w-[1720px] flex-col gap-6 px-6 py-8 md:px-10"><div className="flex flex-col gap-2"><span className="mono text-[11px] uppercase tracking-widest text-[#737373]">SINTETIZADOR NATIVO</span><h1 className="text-3xl font-semibold tracking-tight">Construye una landing sobre tu marca</h1><p className="max-w-2xl text-sm text-[#A1A1A1]">El resultado se compila como un único HTML5 offline. Gemini interpreta; Entrospec valida y construye.</p></div><BrandBriefForm value={brief} onChange={setBrief} onReference={setReference} /><OutputContract capabilities={capabilities} onToggle={toggleCapability} estimate={{ textCalls: 1, imageCalls: imageMode === 'generated' && activeTechniqueIds.includes(4) ? 1 : 0 }} /><section className="bg-[#141414] p-5 flex flex-col gap-4"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="mono text-[11px] uppercase tracking-widest text-[#737373]">DIRECCIÓN</p><p className="text-xs text-[#A1A1A1]">Semilla <span className="text-[#F3F3F3]">{seed}</span></p></div><div className="flex gap-2"><button type="button" onClick={() => setSeed(generateRandomSeed(28))} className="bg-[#1F1F1F] px-3 py-2 text-xs text-[#A1A1A1]">Nueva semilla</button><button type="button" onClick={() => setImageMode(mode => mode === 'generated' ? 'procedural' : 'generated')} className="bg-[#1F1F1F] px-3 py-2 text-xs text-[#A1A1A1]">Visual: {imageMode === 'generated' ? 'Gemini + respaldo' : 'Procedural'}</button></div></div><div className="flex flex-wrap gap-2">{techniques.map(item => <button key={item.id} type="button" onClick={() => toggleTechnique(item.id)} className={`px-3 py-2 text-xs ${item.enabled ? 'bg-[#1E2E20] text-[#22C55E]' : 'bg-[#1F1F1F] text-[#737373]'}`}>0{item.id} · {item.title.split('(')[0]}</button>)}</div></section><GenerationProgress stage={stage} error={error} /><PromptViewer value={prompt} generatedValue={generatedPrompt} onChange={setPrompt} onExecute={handleRun} onReset={() => setPrompt(promptBundle.masterPrompt)} disabled={stage !== 'idle' && stage !== 'complete' && stage !== 'failed'} /><button type="button" onClick={handleRun} disabled={stage !== 'idle' && stage !== 'complete' && stage !== 'failed'} className="self-start bg-[#F3F3F3] px-6 py-3 text-xs font-semibold text-[#0A0A0A] disabled:opacity-40">{stage === 'generating_blueprint' || stage === 'compiling' ? 'CONSTRUYENDO…' : 'CONSTRUIR LANDING'}</button>{record && <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,.8fr)]"><SandboxPreview record={record} onSaveDraft={saveDraft} onSaveCurated={saveCurated} /><GenerationInspector record={record} /></section>}</main> : <main className="mx-auto w-full max-w-[1720px] px-6 py-8 md:px-10"><LandingBank projects={bank} onSelectProjectForStudio={openRecord} onDeleteProject={async id => { await repository.deleteProject?.(id); setBank(await repository.listCurated()); }} /></main>}<footer className="px-8 py-8 text-xs text-[#737373]">ENTROSPEC // HTML5 native generation</footer></div>;
};

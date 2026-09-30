import React, { useMemo, useState } from 'react';
import { Header } from './components/Header';
import { BrandBriefForm } from './components/BrandBriefForm';
import { OutputContract } from './components/OutputContract';
import { GenerationProgress } from './components/GenerationProgress';
import { PromptViewer } from './components/PromptViewer';
import { PromptExecutionConsole } from './components/PromptExecutionConsole';
import { SandboxPreview } from './components/SandboxPreview';
import { GenerationInspector } from './components/GenerationInspector';
import { DiversityBankSummary } from './components/DiversityBankSummary';
import { DiversityDebugView } from './components/DiversityDebugView';
import { LandingBank } from './components/LandingBank';
import { TechniquesSelector, type TechniqueItemView } from './components/TechniquesSelector';
import { generateRandomSeed, computeSsotVector } from './core/ssotEngine';
import { composeGenerationPrompt, estimateGenerationCalls } from './generation/promptComposer';
import { composeArchitecturePromptV2 } from './generation/promptComposerV2';
import { createGenerationPipelineV2 } from './generation/generationPipelineV2';
import { adaptBlueprintV1ToV2 } from './design/blueprintV1Adapter';
import { createStructureFingerprint } from './diversity/structureFingerprint';
import { scoreTournamentCandidate, selectTournamentWinner } from './diversity/tournamentScorer';
import { createGeminiGateway } from './services/geminiGateway';
import { createProjectRepository } from './storage/projectRepository';
import { TECHNIQUE_CATALOG } from './generation/techniqueCatalog';
import type { BrandBrief, ExecutionMode, GenerationRecord, GenerationStage, ImageMode } from './generation/types';
import type { ActiveTab } from './types';

const env = (import.meta as unknown as { env: Record<string, string | undefined> }).env;
const initialBrief: BrandBrief = {
  brandName: '',
  industry: '',
  valueProposition: '',
  targetAudience: '',
  brandPersonality: '',
  toneOfVoice: '',
  primaryAction: ''
};

const initialTechniques: TechniqueItemView[] = TECHNIQUE_CATALOG.map(technique => ({
  id: technique.id, title: technique.title, description: technique.auditRules.join(' '),
  directive: technique.promptDirectives.join(' '), riskMitigated: technique.auditRules.join(' '), enabled: technique.id !== 4
}));

function browserCodec() {
  return {
    compress: async ({ dataUrl }: { mimeType: string; dataUrl: string }) => {
      try {
        const image = new Image();
        image.src = dataUrl;
        await image.decode();
        const ratio = Math.min(1, 1600 / image.width, 1200 / image.height);
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * ratio));
        canvas.height = Math.max(1, Math.round(image.height * ratio));
        canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL('image/webp', 0.78);
        return { dataUrl: compressed, byteLength: Math.round(compressed.length * 0.75) };
      } catch {
        return { dataUrl, byteLength: Math.round(dataUrl.length * 0.75) };
      }
    }
  };
}

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('studio');
  const [brief, setBrief] = useState<BrandBrief>(initialBrief);
  const [seed, setSeed] = useState(() => generateRandomSeed(28));
  const [styleSeed, setStyleSeed] = useState('');
  const [styleSeedMode, setStyleSeedMode] = useState<'auto' | 'manual' | 'experimental'>('auto');
  const [selectedExecutionMode, setSelectedExecutionMode] = useState<'ai_native_html' | 'procedural'>('ai_native_html');
  const [comparisonRecords, setComparisonRecords] = useState<GenerationRecord[]>([]);
  const [noveltyBudget, setNoveltyBudget] = useState<0 | 0.25 | 0.5 | 0.75 | 1>(0.5);
  const [creativeRisk, setCreativeRisk] = useState<'low' | 'moderate' | 'high'>('moderate');
  const [techniques, setTechniques] = useState<TechniqueItemView[]>(() => initialTechniques);
  const [capabilities, setCapabilities] = useState<string[]>(['svg', 'css-motion', 'interaction-js']);
  const [imageMode, setImageMode] = useState<ImageMode>('procedural');
  const [reference, setReference] = useState<{ dataUrl: string; mimeType: string }>();
  const [stage, setStage] = useState<GenerationStage>('idle');
  const [error, setError] = useState<string>();
  const [record, setRecord] = useState<GenerationRecord>();
  const [tournamentRecords, setTournamentRecords] = useState<GenerationRecord[]>([]);
  const [tournamentIndex, setTournamentIndex] = useState<number>(0);
  const [prompt, setPrompt] = useState('');
  const [executionPrompt, setExecutionPrompt] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isGeneratingPromptWithAI, setIsGeneratingPromptWithAI] = useState(false);
  const [isAiGeneratedPrompt, setIsAiGeneratedPrompt] = useState(false);
  const [bank, setBank] = useState<any[]>([]);
  const recentRecordsRef = React.useRef<GenerationRecord[]>([]);

  const [apiStatus, setApiStatus] = useState<{
    hasKey: boolean;
    testing: boolean;
    lastResult?: { ok: boolean; latencyMs?: number; textModel?: string; error?: string };
  }>({
    hasKey: Boolean((env.VITE_GEMINI_API_KEY || '').trim()),
    testing: false
  });

  const ssot = useMemo(() => computeSsotVector(seed, ['HTML5', 'CSS nativo', 'JavaScript vanilla']), [seed]);
  const activeTechniqueIds = techniques.filter(item => item.enabled).map(item => item.id);

  const promptBundle = useMemo(() => {
    const legacyBundle = composeGenerationPrompt({ brief, ssot, activeTechniqueIds, imageMode, capabilities });
    const architecturePrompt = composeArchitecturePromptV2({ brief, styleSeed, entropySeed: seed, noveltyBudget, creativeRisk, outputFormat: 'creative', activeTechniqueIds });
    return { ...legacyBundle, masterPrompt: architecturePrompt.prompt, executedPrompt: architecturePrompt.prompt, negativeConstraints: architecturePrompt.negativeConstraints };
  },
    [brief, ssot, activeTechniqueIds.join(','), imageMode, capabilities.join(','), styleSeed, seed, noveltyBudget, creativeRisk]
  );

  const repository = useMemo(() => createProjectRepository(), []);

  const gateway = useMemo(
    () =>
      createGeminiGateway({
        apiKey: env.VITE_GEMINI_API_KEY || '',
        textModel: env.VITE_GEMINI_TEXT_MODEL || 'gemini-3.5-flash',
        imageModel: env.VITE_GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image'
      }),
    []
  );

  const pipeline = useMemo(
    () =>
      createGenerationPipelineV2({
        gateway,
        cache: { get: repository.getVisualAsset.bind(repository), put: repository.putVisualAsset.bind(repository) },
        codec: browserCodec(),
        similarityThreshold: 0.82,
        recentStructures: async () => {
          const curated = await repository.listCurated();
          return [...curated, ...recentRecordsRef.current].flatMap(item => {
            const fingerprint = item.structureFingerprint ?? (item.blueprintV2
              ? createStructureFingerprint(item.blueprintV2)
              : item.blueprint?.schemaVersion === 1 ? createStructureFingerprint(adaptBlueprintV1ToV2(item.blueprint)) : undefined);
            return fingerprint ? [{ id: item.id, fingerprint }] : [];
          });
        }
      }),
    [gateway, repository]
  );

  React.useEffect(() => {
    setPrompt(promptBundle.masterPrompt);
    setGeneratedPrompt(promptBundle.masterPrompt);
    setIsAiGeneratedPrompt(false);
    setExecutionPrompt(prev => (!prev || prev === generatedPrompt ? promptBundle.masterPrompt : prev));
  }, [promptBundle.masterPrompt]);

  React.useEffect(() => {
    repository.listCurated().then(setBank).catch(() => undefined);
  }, [repository]);

  const handleGeneratePromptWithAI = async () => {
    setError(undefined);
    setIsGeneratingPromptWithAI(true);
    try {
      const activeDefs = techniques
        .filter(t => t.enabled)
        .map(t => `Técnica 0${t.id} (${t.title}): ${t.directive}`);

      const synthesized = await gateway.requestPromptSynthesis({
        brief,
        techniqueDirectives: activeDefs,
        seed
      });

      setPrompt(synthesized);
      setExecutionPrompt(synthesized);
      setIsAiGeneratedPrompt(true);
    } catch (cause: any) {
      setError(cause instanceof Error ? cause.message : 'No fue posible redactar el prompt con IA.');
    } finally {
      setIsGeneratingPromptWithAI(false);
    }
  };

  const handleTestApi = async () => {
    setApiStatus(prev => ({ ...prev, testing: true }));
    try {
      const res = await gateway.testConnection();
      setApiStatus({
        hasKey: Boolean((env.VITE_GEMINI_API_KEY || '').trim()),
        testing: false,
        lastResult: res
      });
    } catch (e: any) {
      setApiStatus({
        hasKey: Boolean((env.VITE_GEMINI_API_KEY || '').trim()),
        testing: false,
        lastResult: { ok: false, error: e.message }
      });
    }
  };

  const estimate = useMemo(
    () => estimateGenerationCalls(activeTechniqueIds, imageMode, selectedExecutionMode),
    [activeTechniqueIds.join(','), imageMode, selectedExecutionMode]
  );

  const handleRun = async (overrideMode?: ExecutionMode, overridePrompt?: string) => {
    setError(undefined);
    setStage('building_prompt');
    const targetMode = overrideMode || selectedExecutionMode;
    const promptToSend = overridePrompt || executionPrompt || prompt;
    // Desplazar suavemente hacia el Sandbox para que el usuario observe la construcción del HTML
    setTimeout(() => {
      document.getElementById('sandbox-container')?.scrollIntoView({ behavior: 'smooth' });
    }, 150);

    try {
      const next = await pipeline.run(
        {
          brief,
          executedPrompt: promptToSend,
          ssotSeed: seed,
          activeTechniqueIds,
          imageMode,
          capabilities,
          visualReference: reference,
          executionMode: targetMode,
          existingBlueprint: targetMode === 'image_only' ? record?.blueprint : undefined,
          allowFallback: false,
          architectureVersion: 2,
          styleSeed,
          noveltyBudget,
          creativeRisk
        },
        { onStage: setStage, onError: errorValue => setError(errorValue.message) }
      );
      recentRecordsRef.current = [...recentRecordsRef.current, next].slice(-50);
      setRecord(next);
      setStage('complete');
      setTimeout(() => {
        document.getElementById('sandbox-container')?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo construir la landing.');
    }
  };

  const handleRunCandidate = async (candidatePrompt: string) => {
    setExecutionPrompt(candidatePrompt);
    setError(undefined);
    setStage('building_prompt');
    setTimeout(() => {
      document.getElementById('sandbox-container')?.scrollIntoView({ behavior: 'smooth' });
    }, 150);

    try {
      const next = await pipeline.run(
        {
          brief,
          executedPrompt: candidatePrompt,
          ssotSeed: seed,
          activeTechniqueIds,
          imageMode: 'procedural',
          capabilities,
          executionMode: 'seed_only',
          allowFallback: false,
          architectureVersion: 2,
          styleSeed,
          noveltyBudget,
          creativeRisk
        },
        { onStage: setStage, onError: errorValue => setError(errorValue.message) }
      );
      recentRecordsRef.current = [...recentRecordsRef.current, next].slice(-50);
      setRecord(next);
      setStage('complete');
      setTimeout(() => {
        document.getElementById('sandbox-container')?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo construir la landing.');
    }
  };

  const handleRunAllCandidates = async () => {
    setError(undefined);
    setStage('building_prompt');
    const candidates = promptBundle.techniqueCandidates;
    if (!candidates.length) return;

    setTournamentRecords([]);
    const results: GenerationRecord[] = [];

    setTimeout(() => {
      document.getElementById('sandbox-container')?.scrollIntoView({ behavior: 'smooth' });
    }, 150);

    for (let i = 0; i < candidates.length; i++) {
      const cand = candidates[i];
      try {
        const next = await pipeline.run(
          {
            brief,
            executedPrompt: cand.prompt,
            ssotSeed: seed,
            activeTechniqueIds: [cand.techniqueId],
            imageMode: 'procedural',
            capabilities,
            executionMode: 'seed_only',
            allowFallback: false,
            architectureVersion: 2,
            styleSeed,
            noveltyBudget,
            creativeRisk
          },
          {
            onStage: setStage,
            onError: err => console.warn(`Error en candidato ${cand.techniqueId}-${cand.variationId}:`, err)
          }
        );
        results.push(next);
        recentRecordsRef.current = [...recentRecordsRef.current, next].slice(-50);
        setTournamentRecords([...results]);
        setRecord(next);
      } catch (err) {
        console.error(err);
      }
    }

    if (results.length > 0) {
      const winner = selectTournamentWinner(results);
      setRecord(winner.record ?? results[0]);
      setTournamentIndex(winner.index < 0 ? 0 : winner.index);
      setStage('complete');
    } else {
      setError('No fue posible completar la generación de variantes.');
      setStage('failed');
    }
  };

  const toggleTechnique = (id: number) => {
    setTechniques(items => {
      const next = items.map(item => (item.id === id ? { ...item, enabled: !item.enabled } : item));
      const hasImage = next.find(t => t.id === 4)?.enabled;
      setImageMode(hasImage ? 'generated' : 'procedural');
      return next;
    });
  };

  const isolateTechnique = (id: number) => {
    setTechniques(items => items.map(t => ({ ...t, enabled: t.id === id })));
    setImageMode(id === 4 ? 'generated' : 'procedural');
  };

  const selectAllTechniques = () => {
    setTechniques(items => items.map(t => ({ ...t, enabled: true })));
    setImageMode('generated');
  };

  const deselectAllTechniques = () => {
    setTechniques(items => items.map(t => ({ ...t, enabled: false })));
    setImageMode('procedural');
  };

  const toggleCapability = (id: string) => {
    setCapabilities(items => (items.includes(id) ? items.filter(item => item !== id) : [...items, id]));
  };

  const saveDraft = async () => {
    if (record) await repository.saveDraft(record);
  };

  const saveCurated = async () => {
    if (!record) return;
    await repository.saveCurated({ ...record, collection: 'curated' });
    setBank(await repository.listCurated());
  };

  const openRecord = (item: any) => {
    setRecord(item);
    setPrompt(item.request?.executedPrompt || item.prompts?.masterPrompt || '');
    setActiveTab('studio');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F3F3F3]">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        bankCount={bank.length}
        apiStatus={apiStatus}
        onTestApi={handleTestApi}
      />

      {activeTab === 'studio' ? (
        <main className="mx-auto flex w-full max-w-[1720px] flex-col gap-6 px-6 py-8 md:px-10">
          <div className="flex flex-col gap-2">
            <span className="mono text-[11px] uppercase tracking-widest text-[#737373]">SINTETIZADOR NATIVO</span>
            <h1 className="text-3xl font-semibold tracking-tight">Construye una landing sobre tu marca</h1>
            <p className="max-w-2xl text-sm text-[#A1A1A1]">
              AI Native entrega el HTML/CSS/JS a Gemini; Procedural V2 diseña y compila localmente. Elige el motor para cada ejecución.
            </p>
          </div>

          <BrandBriefForm value={brief} onChange={setBrief} onReference={setReference} />

          {/* Las 8 Técnicas del Sistema: Control unificado de combinación y llamadas API */}
          <TechniquesSelector
            techniques={techniques}
            onToggleTechnique={toggleTechnique}
            onIsolateTechnique={isolateTechnique}
            onSelectAll={selectAllTechniques}
            onDeselectAll={deselectAllTechniques}
            totalCalls={estimate.totalCalls}
          />

          <OutputContract
            capabilities={capabilities}
            onToggle={toggleCapability}
            estimate={estimate}
            combinedTechniquesCount={activeTechniqueIds.length}
          />

          {/* Barra de dirección y semilla SSoT */}
          <section className="bg-[#141414] p-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="mono text-[11px] uppercase tracking-widest text-[#737373]">DIRECCIÓN Y SEMILLA SSoT</p>
              <p className="text-xs text-[#A1A1A1]">
                Semilla <span className="mono font-semibold text-[#F3F3F3]">{seed}</span> · Técnicas activas:{' '}
                <span className="mono text-[#22C55E] uppercase">{activeTechniqueIds.length}/8</span>
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSeed(generateRandomSeed(28))}
                className="bg-[#1F1F1F] hover:bg-[#282828] px-3 py-2 text-xs text-[#A1A1A1] hover:text-[#F3F3F3] transition-colors"
              >
                Nueva semilla
              </button>
              <button type="button" onClick={() => void handleRun('procedural')} disabled={stage !== 'idle' && stage !== 'complete' && stage !== 'failed'} className="bg-[#1F1F1F] px-3 py-2 text-xs text-[#22C55E] disabled:opacity-40">Motor procedural local — sin Gemini</button>
            </div>
            <p className="w-full text-xs text-[#737373]">Entrospec diseña y compila localmente. No utiliza generación de texto IA.</p>
            <div className="flex items-center gap-2 text-xs text-[#A1A1A1]">
              Dirección artística
              {(['auto', 'manual', 'experimental'] as const).map(mode => <button key={mode} type="button" onClick={() => { setStyleSeedMode(mode); if (mode === 'auto') setStyleSeed(''); }} aria-pressed={styleSeedMode === mode} className={`px-2 py-1 ${styleSeedMode === mode ? 'bg-[#282828] text-white' : 'bg-[#1F1F1F]'}`}>{mode === 'auto' ? 'Auto — derivar del brief' : mode === 'manual' ? 'Manual' : 'Experimental'}</button>)}
            </div>
            <label className="flex min-w-[260px] flex-1 flex-col gap-1 text-xs text-[#A1A1A1]">
              {styleSeedMode === 'experimental' ? 'Semilla de estilo experimental' : 'Semilla de estilo manual'}
              <input aria-label="Dirección artística" value={styleSeed} onChange={event => { setStyleSeed(event.target.value); setStyleSeedMode('manual'); }} disabled={styleSeedMode === 'auto'} placeholder="Auto — derivar del brief" className="bg-[#0A0A0A] px-3 py-2 text-sm text-[#F3F3F3] disabled:opacity-50" />
            </label>
            <label className="flex min-w-[190px] flex-col gap-1 text-xs text-[#A1A1A1]">
              Novedad estructural · {noveltyBudget.toFixed(2)}
              <input aria-label="Novedad estructural" type="range" min="0" max="4" step="1" value={Math.round(noveltyBudget * 4)} onChange={event => setNoveltyBudget((Number(event.target.value) / 4) as 0 | 0.25 | 0.5 | 0.75 | 1)} />
            </label>
            <label className="flex min-w-[150px] flex-col gap-1 text-xs text-[#A1A1A1]">
              Riesgo creativo
              <select aria-label="Riesgo creativo" value={creativeRisk} onChange={event => setCreativeRisk(event.target.value as 'low' | 'moderate' | 'high')} className="border border-[#333] bg-[#0A0A0A] px-3 py-2 text-sm text-[#F3F3F3]"><option value="low">Bajo</option><option value="moderate">Moderado</option><option value="high">Alto</option></select>
            </label>
          </section>

          <GenerationProgress stage={stage} error={error} executionMode={selectedExecutionMode} />

          {/* PASO 1: Laboratorio de Prompts de Técnica (Prompt 1) */}
          <PromptViewer
            value={prompt}
            generatedValue={generatedPrompt}
            onChange={setPrompt}
            onTransferToExecution={text => setExecutionPrompt(text)}
            onGeneratePromptWithAI={handleGeneratePromptWithAI}
            isGeneratingPromptWithAI={isGeneratingPromptWithAI}
            isAiGenerated={isAiGeneratedPrompt}
            onExecute={() => handleRun()}
            onExecuteCandidate={handleRunCandidate}
            onExecuteAllCandidates={handleRunAllCandidates}
            onReset={() => {
              setPrompt(promptBundle.masterPrompt);
              setExecutionPrompt(promptBundle.masterPrompt);
              setIsAiGeneratedPrompt(false);
            }}
            disabled={stage !== 'idle' && stage !== 'complete' && stage !== 'failed'}
            candidates={promptBundle.techniqueCandidates}
            optimalPrompt={promptBundle.masterPrompt}
          />

          {/* PASO 2: Consola de Ejecución con IA (Gemini) */}
          <PromptExecutionConsole
            prompt={executionPrompt}
            onChangePrompt={setExecutionPrompt}
            onExecute={() => handleRun()}
            onResetToSource={() => setExecutionPrompt(prompt)}
            disabled={stage !== 'idle' && stage !== 'complete' && stage !== 'failed'}
            stage={stage}
            estimate={estimate}
            activeTechniqueCount={activeTechniqueIds.length}
            executionMode={selectedExecutionMode}
            onSelectMode={setSelectedExecutionMode}
            requestDiagnostics={record?.requestDiagnostics}
          />

          <button type="button" onClick={async () => {
            setComparisonRecords([]);
            const both: GenerationRecord[] = [];
            try {
              for (const mode of ['ai_native_html', 'procedural'] as const) {
                const next = await pipeline.run({ brief, executedPrompt: executionPrompt || prompt, ssotSeed: seed, activeTechniqueIds, imageMode: 'procedural', capabilities, visualReference: reference, executionMode: mode, allowFallback: false, architectureVersion: 2, styleSeed, noveltyBudget, creativeRisk });
                both.push(next); setComparisonRecords([...both]);
              }
            } catch (cause) {
              setError(cause instanceof Error ? cause.message : 'No fue posible completar la comparación.');
            }
          }} className="self-start bg-[#1F1F1F] px-4 py-2 text-xs text-[#F3F3F3]">Generar el mismo prompt en ambos modos</button>
          {comparisonRecords.length > 0 && <section aria-label="Comparación de motores" className="grid gap-4 xl:grid-cols-2">{comparisonRecords.map(item => <div key={item.id + item.request.executionMode} className="min-w-0 bg-[#141414] p-3"><div className="mb-2 flex flex-wrap justify-between gap-2 text-xs text-[#A1A1A1]"><strong>{item.request.executionMode === 'ai_native_html' ? 'AI Native' : 'Procedural V2'}</strong><span>{item.requestDiagnostics?.model || 'Sin Gemini'} · {item.callsUsed.totalCalls} llamadas · {item.request.executionMode}</span></div><p className="mb-2 text-[11px] text-[#737373]">Auditoría: {item.request.executionMode === 'ai_native_html' ? 'validación de documento; medición DOM pendiente' : `Internal Technique Score ${item.audit.scores.average}/10 · responsive ${item.auditV2?.dimensions.responsiveness.score ?? 'pendiente'}`}</p><iframe title={`Comparación ${item.request.executionMode}`} srcDoc={item.htmlCode} sandbox="allow-scripts" className="h-[600px] w-full bg-white" /></div>)}</section>}

          {record && record.request.executionMode !== 'ai_native_html' && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => handleRun('image_only')}
                disabled={stage !== 'idle' && stage !== 'complete' && stage !== 'failed'}
                className="bg-[#1F1F1F] hover:bg-[#282828] px-4 py-2.5 text-xs text-[#F3F3F3] transition-colors disabled:opacity-40"
              >
                REGENERAR SOLO IMAGEN HERO (1 LLAMADA)
              </button>
            </div>
          )}

          {tournamentRecords.length > 1 && (
            <section className="bg-[#141414] p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="mono text-[11px] uppercase tracking-widest text-[#22C55E] font-bold">
                  TORNEO DE PROMPTS ({tournamentRecords.length} LLAMADAS EJECUTADAS)
                </span>
                <span className="text-xs text-[#A1A1A1]">
                  Compara los blueprints generados para cada técnica y variante. Selecciona la ganadora:
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {tournamentRecords.map((item, idx) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setTournamentIndex(idx);
                      setRecord(item);
                    }}
                    className={`px-3 py-1.5 text-xs mono transition-colors ${
                      tournamentIndex === idx
                        ? 'bg-[#22C55E] text-[#0A0A0A] font-bold'
                        : 'bg-[#1F1F1F] text-[#A1A1A1] hover:text-[#F3F3F3]'
                    }`}
                  >
                    Variante {idx + 1} · V2 {scoreTournamentCandidate(item).toFixed(2)}
                  </button>
                ))}
              </div>
            </section>
          )}

          {tournamentRecords.length > 1 && <DiversityDebugView records={tournamentRecords} />}

          {record ? (
            <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,.8fr)]">
              <SandboxPreview
                record={record}
                onSaveDraft={saveDraft}
                onSaveCurated={saveCurated}
                isGenerating={stage !== 'idle' && stage !== 'complete' && stage !== 'failed'}
              />
              <GenerationInspector record={record} />
            </section>
          ) : (
            <section
              id="sandbox-container"
              className="bg-[#141414] border border-[#222222] p-10 text-center flex flex-col items-center justify-center min-h-[280px] gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center text-[#22C55E] text-base mono">
                ✦
              </div>
              <h3 className="text-sm font-semibold tracking-wide uppercase mono text-[#F3F3F3]">
                {selectedExecutionMode === 'ai_native_html' ? 'AI Native · HTML directo desde Gemini' : 'Motor procedural local · Procedural V2'}
              </h3>
              <p className="text-xs text-[#A1A1A1] max-w-lg leading-relaxed">
                Completa el brief y revisa el prompt. {selectedExecutionMode === 'ai_native_html' ? <>Gemini construirá el HTML/CSS/JS final en una llamada.</> : <>Entrospec diseñará y compilará localmente, sin generación de texto IA.</>}
              </p>
            </section>
          )}
        </main>
      ) : (
        <main className="mx-auto w-full max-w-[1720px] px-6 py-8 md:px-10">
          <DiversityBankSummary records={bank} />
          <LandingBank
            projects={bank}
            onSelectProjectForStudio={openRecord}
            onDeleteProject={async id => {
              await repository.deleteProject?.(id);
              setBank(await repository.listCurated());
            }}
          />
        </main>
      )}

      <footer className="px-8 py-8 text-xs text-[#737373]">
        ENTROSPEC // HTML5 native generation · Gemini API verified
      </footer>
    </div>
  );
};

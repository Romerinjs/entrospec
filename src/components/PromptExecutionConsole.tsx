import React from 'react';
import type { GenerationCallEstimate, GenerationStage } from '../generation/types';

interface Props {
  prompt: string;
  onChangePrompt: (value: string) => void;
  onExecute: () => void;
  onResetToSource?: () => void;
  disabled?: boolean;
  stage: GenerationStage;
  estimate: GenerationCallEstimate;
  activeTechniqueCount: number;
  executionMode?: string;
  onSelectMode?: (mode: 'ai_native_html' | 'procedural') => void;
  requestDiagnostics?: { transmittedPrompt: string; model: string; temperature: number; responseMimeType: string; executionMode: string };
}

export const PromptExecutionConsole: React.FC<Props> = ({
  prompt,
  onChangePrompt,
  onExecute,
  onResetToSource,
  disabled,
  stage,
  estimate,
  activeTechniqueCount,
  executionMode = 'ai_native_html',
  onSelectMode,
  requestDiagnostics
}) => {
  const isRunning = stage === 'generating_blueprint' || stage === 'compiling' || stage === 'generating_visual' || stage === 'building_prompt';

  return (
    <section className="bg-[#141414] p-5 flex flex-col gap-4 border border-[#22C55E]/20">
      {/* Encabezado del Paso 2 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="mono text-[10px] font-bold bg-[#22C55E] text-[#0A0A0A] px-2 py-0.5 uppercase tracking-wider">
              PASO 2
            </span>
            <p className="mono text-[11px] uppercase tracking-widest text-[#737373]">
              {executionMode === 'ai_native_html' ? 'AI NATIVE · GEMINI GENERA EL DOCUMENTO' : 'MOTOR PROCEDURAL V2 · EJECUCIÓN LOCAL'}
            </p>
          </div>
          <h2 className="text-lg font-medium text-[#F3F3F3] mt-1">
            Prompt creativo de ejecución
          </h2>
          <p className="text-xs text-[#A1A1A1]">
            Este campo editable es la fuente creativa. El request final añade únicamente el contrato de salida mostrado tras ejecutar.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onResetToSource && (
            <button
              type="button"
              onClick={onResetToSource}
              disabled={disabled || isRunning}
              className="bg-[#1F1F1F] hover:bg-[#282828] px-3 py-2 text-xs text-[#A1A1A1] hover:text-[#F3F3F3] transition-colors disabled:opacity-50"
              title="Restaurar el contenido original desde el Paso 1"
            >
              Restaurar desde Prompt 1
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Modo de ejecución">
        <span className="self-center text-xs text-[#737373]">Modo:</span>
        {(['ai_native_html', 'procedural'] as const).map(mode => <button key={mode} type="button" data-mode={mode} onClick={() => onSelectMode?.(mode)} aria-pressed={executionMode === mode} className={`px-3 py-2 text-xs ${executionMode === mode ? 'bg-[#282828] text-[#F3F3F3]' : 'bg-[#1F1F1F] text-[#A1A1A1]'}`}>{mode === 'ai_native_html' ? 'AI Native · Gemini construye HTML' : 'Procedural V2 · motor local'}</button>)}
      </div>
      {requestDiagnostics && <section aria-label="Request final enviado a Gemini" className="flex flex-col gap-2 bg-[#101010] p-3">
        <h3 className="text-sm text-[#F3F3F3]">Request final enviado a Gemini</h3>
        <p className="mono text-[11px] text-[#A1A1A1]">model: {requestDiagnostics.model} · temperature: {requestDiagnostics.temperature} · responseMimeType: {requestDiagnostics.responseMimeType} · executionMode: {requestDiagnostics.executionMode}</p>
        <textarea aria-label="Request final enviado a Gemini" readOnly value={requestDiagnostics.transmittedPrompt} rows={8} className="w-full resize-y bg-[#0A0A0A] p-3 font-mono text-xs text-[#A1A1A1]" />
      </section>}

      {/* Editor del Prompt de Ejecución */}
      <div className="relative">
        <textarea
          aria-label="Campo de ejecución con IA"
          value={prompt}
          onChange={event => onChangePrompt(event.target.value)}
          disabled={disabled || isRunning}
          rows={8}
          placeholder="Escribe o pega aquí el prompt que deseas enviar a Gemini..."
          className="w-full resize-y bg-[#0A0A0A] p-4 font-mono text-xs leading-relaxed text-[#F3F3F3] border border-[#262626] focus:border-[#22C55E] focus:outline-none transition-colors"
        />
        <div className="absolute bottom-3 right-3 text-[10px] mono text-[#555] pointer-events-none">
          {prompt.length} caracteres
        </div>
      </div>

      {/* Barra de Lanzamiento y Métricas de Ejecución */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#1A1A1A] px-3 py-1.5 border border-[#2E2E2E]">
            <span className="text-[11px] text-[#A1A1A1]">Llamadas API:</span>
            <span className="mono text-xs font-bold text-[#22C55E]">
              {estimate.totalCalls} {estimate.totalCalls === 1 ? 'LLAMADA' : 'LLAMADAS'}
            </span>
          </div>
          <span className="text-xs text-[#737373]">
            ({activeTechniqueCount} {activeTechniqueCount === 1 ? 'técnica combinada' : 'técnicas combinadas'})
          </span>
        </div>

        <button
          type="button"
          onClick={onExecute}
          disabled={disabled || isRunning || !prompt.trim()}
          className="bg-[#22C55E] hover:bg-[#16A34A] text-[#0A0A0A] px-6 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-40 disabled:hover:bg-[#22C55E]"
        >
          {isRunning ? (
            <>
              <span className="inline-block w-2.5 h-2.5 border-2 border-[#0A0A0A] border-t-transparent animate-spin rounded-full" />
               <span>{executionMode === 'ai_native_html' ? 'GEMINI GENERA HTML…' : 'COMPILANDO EN LOCAL…'}</span>
            </>
          ) : (
            <>
             <span>{executionMode === 'ai_native_html' ? 'EJECUTAR CON GEMINI · 1 LLAMADA' : 'EJECUTAR MOTOR PROCEDURAL · 0 LLAMADAS'}</span>
              <span className="mono text-[10px] bg-[#0A0A0A] text-[#22C55E] px-2 py-0.5 rounded-sm">
                CONSTRUIR LANDING
              </span>
            </>
          )}
        </button>
      </div>
    </section>
  );
};

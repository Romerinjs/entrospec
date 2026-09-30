import React, { useState } from 'react';
import type { TechniquePromptCandidate } from '../generation/types';

interface Props {
  value?: string;
  generatedValue?: string;
  onChange?: (value: string) => void;
  onExecute?: () => void;
  onExecuteCandidate?: (prompt: string) => void;
  onExecuteAllCandidates?: () => void;
  onTransferToExecution?: (prompt: string) => void;
  onGeneratePromptWithAI?: () => void;
  isGeneratingPromptWithAI?: boolean;
  isAiGenerated?: boolean;
  onReset?: () => void;
  disabled?: boolean;
  prompts?: { masterPrompt: string };
  candidates?: TechniquePromptCandidate[];
  optimalPrompt?: string;
}

export const PromptViewer: React.FC<Props> = ({
  value,
  generatedValue,
  onChange,
  onExecute,
  onExecuteCandidate,
  onExecuteAllCandidates,
  onTransferToExecution,
  onGeneratePromptWithAI,
  isGeneratingPromptWithAI,
  isAiGenerated,
  onReset,
  disabled,
  prompts,
  candidates = [],
  optimalPrompt
}) => {
  const [selectedKey, setSelectedKey] = useState<string>('optimal');
  const [transferredFeedback, setTransferredFeedback] = useState<boolean>(false);

  const optimalText = optimalPrompt || generatedValue || prompts?.masterPrompt || value || '';
  const currentOptimal = value ?? optimalText;

  // Encontrar el prompt seleccionado según la pestaña activa
  let displayedPrompt = currentOptimal;
  let activeCandidate: TechniquePromptCandidate | undefined;

  if (selectedKey !== 'optimal') {
    activeCandidate = candidates.find(c => `${c.techniqueId}-${c.variationId}` === selectedKey);
    if (activeCandidate) {
      displayedPrompt = activeCandidate.prompt;
    }
  }

  React.useEffect(() => {
    if (selectedKey !== 'optimal') {
      const stillExists = candidates.some(c => `${c.techniqueId}-${c.variationId}` === selectedKey);
      if (!stillExists) {
        setSelectedKey('optimal');
      }
    }
  }, [candidates, selectedKey]);

  const handleSelectTab = (key: string) => {
    setSelectedKey(key);
    const textToEmit = key === 'optimal'
      ? optimalText
      : candidates.find(c => `${c.techniqueId}-${c.variationId}` === key)?.prompt || '';
    
    onChange?.(textToEmit);
  };

  const handleTransfer = () => {
    const textToTransfer = displayedPrompt;
    if (onTransferToExecution) {
      onTransferToExecution(textToTransfer);
    } else if (onExecuteCandidate && activeCandidate) {
      onExecuteCandidate(activeCandidate.prompt);
    } else if (onExecute) {
      onExecute();
    }
    setTransferredFeedback(true);
    setTimeout(() => setTransferredFeedback(false), 2200);
  };

  const totalCandidates = candidates.length;

  return (
    <section className="bg-[#141414] p-5 flex flex-col gap-4 border border-[#2E2E2E]">
      {/* Header del Paso 1 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="mono text-[10px] font-bold bg-[#F3F3F3] text-[#0A0A0A] px-2 py-0.5 uppercase tracking-wider">
              PASO 1
            </span>
            <p className="mono text-[11px] uppercase tracking-widest text-[#737373]">
              LABORATORIO DE PROMPTS DE TÉCNICA
            </p>
            {isAiGenerated ? (
              <span className="mono text-[10px] bg-[#1E2E20] text-[#22C55E] px-2 py-0.5 font-semibold">
                ✓ Redactado en vivo por Gemini
              </span>
            ) : (
              <span className="mono text-[10px] bg-[#1F1F1F] text-[#A1A1A1] px-2 py-0.5">
                Plantilla base editable
              </span>
            )}
            {totalCandidates > 0 && (
              <span className="mono text-[10px] bg-[#1E2E20] text-[#22C55E] px-2 py-0.5">
                {totalCandidates} variantes
              </span>
            )}
          </div>
          <h2 className="text-lg font-medium text-[#F3F3F3] mt-1">
            {selectedKey === 'optimal'
              ? 'Prompt 1: Dirección creativa de técnicas activas'
              : activeCandidate
              ? `Prompt 1 Técnica 0${activeCandidate.techniqueId}: ${activeCandidate.techniqueTitle} · ${activeCandidate.variationLabel}`
              : 'Prompt 1 de técnica para renderizar'}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onGeneratePromptWithAI && (
            <button
              type="button"
              onClick={onGeneratePromptWithAI}
              disabled={disabled || isGeneratingPromptWithAI}
              className="bg-[#22C55E] hover:bg-[#16A34A] text-[#0A0A0A] px-3.5 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-50"
              title="Llama a Gemini para que redacte creativamente el prompt en vez de usar una plantilla"
            >
              {isGeneratingPromptWithAI ? (
                <>
                  <span className="inline-block w-2.5 h-2.5 border-2 border-[#0A0A0A] border-t-transparent animate-spin rounded-full" />
                  <span>REDACTANDO CON IA…</span>
                </>
              ) : (
                <>
                  <span>GENERAR PROMPT CON IA</span>
                  <span className="mono text-[9px] bg-[#0A0A0A] text-[#22C55E] px-1.5 py-0.5 rounded-sm">
                    LLAMADA 1
                  </span>
                </>
              )}
            </button>
          )}

          {onReset && (
            <button
              type="button"
              onClick={onReset}
              disabled={disabled || isGeneratingPromptWithAI}
              className="bg-[#1F1F1F] hover:bg-[#282828] px-3 py-2 text-xs text-[#A1A1A1] hover:text-[#F3F3F3] transition-colors disabled:opacity-50"
            >
              Restaurar plantilla
            </button>
          )}
        </div>
      </div>

      {/* Selector de Pestañas: Prompt Óptimo vs Variantes de Técnicas */}
      <div className="flex flex-col gap-2 bg-[#191919] p-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleSelectTab('optimal')}
            className={`px-3 py-1.5 text-xs mono transition-colors ${
              selectedKey === 'optimal'
                ? 'bg-[#22C55E] text-[#0A0A0A] font-bold'
                : 'bg-[#141414] text-[#F3F3F3] hover:bg-[#202020]'
            }`}
          >
            ★ Prompt Óptimo Sintetizado
          </button>

          {candidates.map(c => {
            const key = `${c.techniqueId}-${c.variationId}`;
            const isSelected = selectedKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSelectTab(key)}
                className={`px-2.5 py-1.5 text-[11px] mono transition-colors ${
                  isSelected
                    ? 'bg-[#282828] text-[#22C55E] font-semibold'
                    : 'bg-[#141414] text-[#737373] hover:text-[#A1A1A1] hover:bg-[#1E1E1E]'
                }`}
                title={`Técnica 0${c.techniqueId}: ${c.techniqueTitle} - ${c.variationLabel}`}
              >
                0{c.techniqueId}.{c.variationId} {c.variationLabel.split(' ')[0]}
              </button>
            );
          })}
        </div>

        {activeCandidate && (
          <div className="text-[11px] text-[#A1A1A1] bg-[#141414] p-2 flex justify-between items-center">
            <span>
              <strong className="text-[#F3F3F3]">Ángulo de esta variante:</strong> {activeCandidate.angle}
            </span>
            <span className="mono text-[10px] text-[#22C55E] uppercase bg-[#191919] px-2 py-0.5">
              Variante individual
            </span>
          </div>
        )}
      </div>

      {/* Visor / Editor del Prompt 1 */}
      <textarea
        aria-label="Prompt maestro"
        value={displayedPrompt}
        onChange={event => onChange?.(event.target.value)}
        disabled={disabled || !onChange}
        rows={8}
        className="w-full resize-y bg-[#0A0A0A] p-4 font-mono text-xs leading-relaxed text-[#F3F3F3] border border-[#262626] focus:border-[#555] focus:outline-none"
      />

      {/* Botón de Desligado / Transferencia hacia el Paso 2 */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <p className="text-[11px] text-[#737373]">
          Elige o edita el Prompt 1 arriba y transfiérelo al campo de ejecución abajo para enviarlo a Gemini.
        </p>

        <div className="flex flex-wrap items-center gap-2">
          {totalCandidates > 1 && onExecuteAllCandidates && (
            <button
              type="button"
              onClick={onExecuteAllCandidates}
              disabled={disabled}
              className="bg-[#1F1F1F] hover:bg-[#282828] text-[#A1A1A1] hover:text-[#F3F3F3] px-3 py-2 text-xs flex items-center gap-1.5 transition-colors border border-[#333]"
              title={`Generar las ${totalCandidates} variantes para comparar en torneo`}
            >
              <span>Generar las {totalCandidates} variantes</span>
              <span className="mono text-[10px] bg-[#141414] text-[#22C55E] px-1 py-0.5">
                {totalCandidates} LLAMADAS
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={handleTransfer}
            disabled={disabled || !displayedPrompt.trim()}
            className="bg-[#262626] hover:bg-[#333333] text-[#F3F3F3] px-4 py-2 text-xs font-semibold flex items-center gap-2 transition-colors border border-[#404040]"
          >
            <span>{transferredFeedback ? '✓ ¡Transferido al Paso 2!' : 'Transferir al campo de ejecución ↓'}</span>
          </button>
        </div>
      </div>
    </section>
  );
};


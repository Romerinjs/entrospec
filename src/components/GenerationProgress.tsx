import React from 'react';
import type { GenerationStage } from '../generation/types';

const stageSteps: { id: GenerationStage; label: string; desc: string }[] = [
  { id: 'building_prompt', label: '1. Sintetizando Prompt', desc: 'Ensamblando vector SSoT y directivas de técnicas seleccionadas' },
  { id: 'generating_blueprint', label: '2. Consultando Gemini API', desc: 'Generando blueprint estructurado y copy de alto impacto con IA' },
  { id: 'generating_visual', label: '3. Resolviendo Activo Visual', desc: 'Componiendo visual generativo o shader procedural nativo' },
  { id: 'compiling', label: '4. Compilando HTML5 Nativo', desc: 'Construyendo DOM semántico, CSS nativo y micro-animaciones' },
  { id: 'auditing', label: '5. Auditoría Editorial', desc: 'Validando contraste, accesibilidad y anti-AI slop (9.0+/10)' }
];

export const GenerationProgress: React.FC<{ stage: GenerationStage; error?: string; executionMode?: string }> = ({ stage, error, executionMode = 'ai_native_html' }) => {
  if (stage === 'idle' && !error) {
    return null;
  }

  const currentIndex = stageSteps.findIndex(s => s.id === stage);
  const isComplete = stage === 'complete';
  const isFailed = stage === 'failed' || Boolean(error);

  return (
    <div
      aria-live="polite"
      className="bg-[#141414] border border-[#222222] p-4 flex flex-col gap-3 my-2"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span
            className={`w-3 h-3 rounded-full ${
              isComplete
                ? 'bg-[#22C55E]'
                : isFailed
                ? 'bg-[#EF4444]'
                : 'bg-[#EAB308] animate-pulse'
            }`}
          />
          <span className="mono text-xs uppercase tracking-wider font-bold text-[#F3F3F3]">
            {isComplete
              ? '✓ LANDING COMPILADA EXITOSAMENTE'
              : isFailed
              ? '⚠ REQUIERE ATENCIÓN'
              : 'CONSTRUYENDO LANDING EN VIVO...'}
          </span>
        </div>
        <span className="mono text-[11px] text-[#A1A1A1]">
          {isComplete
            ? '100% Completado'
            : isFailed
            ? 'Error en la llamada'
            : `${Math.min(100, Math.max(15, (currentIndex + 1) * 20))}%`}
        </span>
      </div>

      {/* Barra de progreso visual */}
      <div className="w-full bg-[#1F1F1F] h-1.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${
            isComplete ? 'bg-[#22C55E] w-full' : isFailed ? 'bg-[#EF4444] w-full' : 'bg-[#EAB308]'
          }`}
          style={{
            width: isComplete ? '100%' : isFailed ? '100%' : `${(currentIndex + 1) * 20}%`
          }}
        />
      </div>

      {/* Detalle del paso activo */}
      {!isComplete && !isFailed && currentIndex >= 0 && (
        <div className="flex items-baseline justify-between text-xs pt-1">
          <span className="text-[#F3F3F3] font-medium">{stage === 'generating_blueprint' && executionMode === 'procedural' ? '2. Diseñando con motor local' : stageSteps[currentIndex].label}</span>
          <span className="text-[#737373] text-[11px]">{stage === 'generating_blueprint' && executionMode === 'procedural' ? 'Generación procedural V2; sin llamadas a Gemini' : stageSteps[currentIndex].desc}</span>
        </div>
      )}

      {error && (
        <div className="bg-[#2A1215] border border-[#E06D53] p-3 text-xs text-[#FCA5A5] flex flex-col gap-1">
          <strong>Error de ejecución:</strong>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

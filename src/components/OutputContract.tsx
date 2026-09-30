import React from 'react';
import type { GenerationCallEstimate } from '../generation/types';

export const OutputContract: React.FC<{
  capabilities: string[];
  onToggle: (id: string) => void;
  estimate: GenerationCallEstimate;
  combinedTechniquesCount?: number;
}> = ({ capabilities, onToggle, estimate, combinedTechniquesCount = 0 }) => {
  const isCombinedSingleCall = estimate.totalCalls === 1 && estimate.textCalls === 1 && combinedTechniquesCount > 1;

  return (
    <section className="bg-[#141414] p-6 flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mono text-[11px] uppercase tracking-widest text-[#737373]">CONTRATO DE SALIDA Y LLAMADAS API</p>
          <h2 className="text-xl font-medium text-[#F3F3F3]">HTML5 + CSS + JavaScript nativo</h2>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            {isCombinedSingleCall && (
              <span className="mono text-[10px] uppercase tracking-wider bg-[#1E2E20] text-[#22C55E] px-2 py-0.5">
                {combinedTechniquesCount} técnicas en 1 sola llamada
              </span>
            )}
            <span className="mono text-xs font-semibold text-[#F3F3F3] bg-[#1F1F1F] px-2.5 py-1">
              {estimate.totalCalls} {estimate.totalCalls === 1 ? 'llamada' : 'llamadas'} a Gemini
            </span>
          </div>
          <span className="mono text-[11px] text-[#A1A1A1]">
            Texto: {estimate.textCalls} · Imagen: {estimate.imageCalls}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {['canvas', 'svg', 'css-motion', 'interaction-js'].map(id => (
          <button
            key={id}
            type="button"
            onClick={() => onToggle(id)}
            className={`px-3 py-2 text-xs transition-colors ${
              capabilities.includes(id) ? 'bg-[#282828] text-[#F3F3F3]' : 'bg-[#1F1F1F] text-[#737373] hover:text-[#A1A1A1]'
            }`}
          >
            {id}
          </button>
        ))}
      </div>
      <p className="text-xs text-[#737373]">
        Compilación autónoma: cero frameworks, cero CDN, cero fuentes remotas y cero llamadas de red externas en el HTML exportado.
      </p>
    </section>
  );
};


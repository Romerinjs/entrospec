import React from 'react';
import { SsotEntropyVector } from '../types';

interface SsotVisualizerProps {
  ssot: SsotEntropyVector;
  onRegenerateSeed: () => void;
}

export const SsotVisualizer: React.FC<SsotVisualizerProps> = ({
  ssot,
  onRegenerateSeed
}) => {
  return (
    <div className="p-5 rounded-lg bg-[#141414] flex flex-col gap-5">
      {/* Top Header & Regeneration */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#F3F3F3]">
              Motor SSoT // Muestreo Local DAG (ICLR 2026)
            </span>
            <span className="text-[10px] mono px-2 py-0.5 rounded-sm bg-[#1F1F1F] text-[#22C55E]">
              Entropía Activa
            </span>
          </div>
          <span className="text-[11px] text-[#737373]">
            Descomposición de cadena semilla pseudoaleatoria en 4 vectores ortogonales
          </span>
        </div>

        <button
          onClick={onRegenerateSeed}
          className="h-8 px-4 rounded-sm bg-[#1F1F1F] hover:bg-[#282828] text-xs mono text-[#F3F3F3] transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <span>↻</span>
          <span>Regenerar Semilla</span>
        </button>
      </div>

      {/* Seed Raw Display */}
      <div className="p-3.5 rounded-md bg-[#0A0A0A] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="text-[11px] uppercase mono text-[#737373]">SEMILLA ({ssot.length} chars):</span>
          <span className="text-xs mono font-bold text-[#22C55E] tracking-wider select-all">
            {ssot.seed}
          </span>
        </div>
        <span className="text-[10px] mono text-[#737373]">
          H₂(X) = Max Entropía
        </span>
      </div>

      {/* 4 Chunks Mathematical Decomposition */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {ssot.chunks.map(chunk => (
          <div
            key={chunk.chunkIndex}
            className="p-3.5 rounded-md bg-[#191919] flex flex-col justify-between gap-2"
          >
            <div className="flex justify-between items-center text-[11px]">
              <span className="mono font-semibold text-[#A1A1A1]">CHUNK 0{chunk.chunkIndex}</span>
              <span className="mono text-[10px] px-1.5 py-0.5 rounded-sm bg-[#141414] text-[#737373]">
                {chunk.rawString}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase text-[#737373] tracking-wide">
                {chunk.label}
              </span>
              <span className="text-xs font-semibold text-[#F3F3F3] tracking-tight">
                {chunk.mappedValue}
              </span>
            </div>

            <div className="text-[10px] mono text-[#737373] pt-1">
              {chunk.details}
            </div>
          </div>
        ))}
      </div>

      {/* Resulting Palette Indicator */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-md bg-[#191919] text-xs">
        <span className="text-[#737373] mono text-[11px]">Cromática Calibrada:</span>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: ssot.palette.background }}></span>
          <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: ssot.palette.surface }}></span>
          <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: ssot.palette.accent }}></span>
          <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: ssot.palette.textPrimary }}></span>
        </div>
        <span className="text-[#F3F3F3] font-medium">{ssot.palette.name}</span>
        <span className="text-[11px] text-[#A1A1A1] hidden md:inline">— {ssot.palette.description}</span>
      </div>
    </div>
  );
};

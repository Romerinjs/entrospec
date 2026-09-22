import React, { useState } from 'react';
import { SsotEntropyVector } from '../types';

interface SsotVisualizerProps {
  ssot: SsotEntropyVector;
  onRegenerateSeed: () => void;
}

export const SsotVisualizer: React.FC<SsotVisualizerProps> = ({
  ssot,
  onRegenerateSeed
}) => {
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRegenerate = async () => {
    if (isRegenerating) return;
    setIsRegenerating(true);
    onRegenerateSeed();
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRegenerating(false);
  };

  return (
    <div className="relative p-6 bg-[#141414] flex flex-col gap-5 overflow-hidden">
      {/* Loading Overlay de 1 segundo para toda la sección */}
      {isRegenerating && (
        <div className="absolute inset-0 bg-[#0A0A0A]/85 backdrop-blur-sm z-30 flex flex-col items-center justify-center gap-3 animate-fade-in">
          <div className="w-7 h-7 border-2 border-[#282828] border-t-[#22C55E] rounded-full animate-spin"></div>
          <span className="mono text-xs text-[#22C55E] tracking-widest uppercase">
            REGENERANDO SEMILLA SSoT...
          </span>
        </div>
      )}

      {/* 3. Top Header: Titulo simplificado exactamente a "MOTOR SSOT" */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-base md:text-lg font-bold uppercase tracking-tight text-[#F3F3F3]">
            MOTOR SSOT
          </span>
          <span className="text-xs text-[#737373]">
            Descomposición de cadena semilla pseudoaleatoria en vectores ortogonales
          </span>
        </div>

        <button
          onClick={handleRegenerate}
          disabled={isRegenerating}
          className="h-9 px-4 bg-[#1F1F1F] hover:bg-[#282828] text-xs mono text-[#F3F3F3] transition-colors flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
        >
          <span className={isRegenerating ? 'animate-spin' : ''}>↻</span>
          <span>Regenerar Semilla</span>
        </button>
      </div>

      {/* 1. 6 Cards con alineación perfecta de subtítulos y títulos principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 items-stretch">
        
        {/* Card 1 (1/6): Semilla SSoT (2. Sin texto de H2(X) = Max Entropia) */}
        <div className="p-5 bg-[#191919] flex flex-col justify-between gap-3 min-h-[140px]">
          <div className="flex justify-between items-center text-[10px]">
            <span className="mono font-semibold text-[#737373]">SEMILLA SSoT</span>
            <span className="mono text-[#22C55E] bg-[#141414] px-1.5 py-0.5">
              {ssot.length} CHARS
            </span>
          </div>
          <div className="flex flex-col gap-1.5 flex-1 justify-center">
            <span className="text-[10px] uppercase text-[#737373] tracking-wide">
              Cadena de Alta Entropía
            </span>
            <span className="text-sm md:text-base font-bold mono text-[#22C55E] tracking-wider select-all break-all leading-snug">
              {ssot.seed}
            </span>
          </div>
        </div>

        {/* Card 2 (2/6): Chunk 01 - Retícula & Composición */}
        <div className="p-5 bg-[#191919] flex flex-col justify-between gap-3 min-h-[140px]">
          <div className="flex justify-between items-center text-[10px]">
            <span className="mono font-semibold text-[#737373]">CHUNK 01</span>
            <span className="mono text-[#737373] bg-[#141414] px-1.5 py-0.5">
              {ssot.chunks[0]?.rawString}
            </span>
          </div>
          <div className="flex flex-col gap-1.5 flex-1 justify-center">
            <span className="text-[10px] uppercase text-[#737373] tracking-wide">
              {ssot.chunks[0]?.label}
            </span>
            <span className="text-sm md:text-base font-bold text-[#F3F3F3] tracking-tight leading-snug">
              {ssot.chunks[0]?.mappedValue}
            </span>
          </div>
        </div>

        {/* Card 3 (3/6): Chunk 02 - Cromática con Paleta Integrada */}
        <div className="p-5 bg-[#191919] flex flex-col justify-between gap-3 min-h-[140px]">
          <div className="flex justify-between items-center text-[10px]">
            <span className="mono font-semibold text-[#737373]">CHUNK 02</span>
            <span className="mono text-[#737373] bg-[#141414] px-1.5 py-0.5">
              {ssot.chunks[1]?.rawString}
            </span>
          </div>
          <div className="flex flex-col gap-1.5 flex-1 justify-center">
            <span className="text-[10px] uppercase text-[#737373] tracking-wide">
              {ssot.chunks[1]?.label}
            </span>
            <span className="text-sm md:text-base font-bold text-[#F3F3F3] tracking-tight leading-snug">
              {ssot.chunks[1]?.mappedValue}
            </span>
            {/* Swatches de color */}
            <div className="flex items-center gap-2 pt-0.5">
              <span
                className="w-4 h-4 shadow-inner"
                style={{ backgroundColor: ssot.palette.background }}
                title={`Fondo: ${ssot.palette.background}`}
              />
              <span
                className="w-4 h-4 shadow-inner"
                style={{ backgroundColor: ssot.palette.surface }}
                title={`Superficie: ${ssot.palette.surface}`}
              />
              <span
                className="w-4 h-4 shadow-inner"
                style={{ backgroundColor: ssot.palette.accent }}
                title={`Acento: ${ssot.palette.accent}`}
              />
              <span
                className="w-4 h-4 shadow-inner"
                style={{ backgroundColor: ssot.palette.textPrimary }}
                title={`Texto: ${ssot.palette.textPrimary}`}
              />
            </div>
          </div>
        </div>

        {/* Card 4 (4/6): Chunk 03 - Comportamiento del Stack */}
        <div className="p-5 bg-[#191919] flex flex-col justify-between gap-3 min-h-[140px]">
          <div className="flex justify-between items-center text-[10px]">
            <span className="mono font-semibold text-[#737373]">CHUNK 03</span>
            <span className="mono text-[#737373] bg-[#141414] px-1.5 py-0.5">
              {ssot.chunks[2]?.rawString}
            </span>
          </div>
          <div className="flex flex-col gap-1.5 flex-1 justify-center">
            <span className="text-[10px] uppercase text-[#737373] tracking-wide">
              {ssot.chunks[2]?.label}
            </span>
            <span className="text-sm md:text-base font-bold text-[#F3F3F3] tracking-tight leading-snug">
              {ssot.chunks[2]?.mappedValue}
            </span>
          </div>
        </div>

        {/* Card 5 (5/6): Chunk 04 - Hero Section & Psicología */}
        <div className="p-5 bg-[#191919] flex flex-col justify-between gap-3 min-h-[140px]">
          <div className="flex justify-between items-center text-[10px]">
            <span className="mono font-semibold text-[#737373]">CHUNK 04</span>
            <span className="mono text-[#737373] bg-[#141414] px-1.5 py-0.5">
              {ssot.chunks[3]?.rawString}
            </span>
          </div>
          <div className="flex flex-col gap-1.5 flex-1 justify-center">
            <span className="text-[10px] uppercase text-[#737373] tracking-wide">
              {ssot.chunks[3]?.label}
            </span>
            <span className="text-sm md:text-base font-bold text-[#F3F3F3] tracking-tight leading-snug">
              {ssot.chunks[3]?.mappedValue}
            </span>
          </div>
        </div>

        {/* Card 6 (6/6): Estado DAG & Teorema */}
        <div className="p-5 bg-[#191919] flex flex-col justify-between gap-3 min-h-[140px]">
          <div className="flex justify-between items-center text-[10px]">
            <span className="mono font-semibold text-[#737373]">ESTADO DAG</span>
            <span className="mono text-[#22C55E]">UNIFORME</span>
          </div>
          <div className="flex flex-col gap-1.5 flex-1 justify-center">
            <span className="text-[10px] uppercase text-[#737373] tracking-wide">
              Distribución Entrópica
            </span>
            <span className="text-sm md:text-base font-bold text-[#F3F3F3] tracking-tight leading-snug">
              Sum-Mod Theorem 4.2
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

import React, { useEffect, useRef } from 'react';
import { ActiveTab } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  bankCount: number;
  apiStatus?: {
    hasKey: boolean;
    testing?: boolean;
    lastResult?: { ok: boolean; latencyMs?: number; textModel?: string; error?: string };
  };
  onTestApi?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  bankCount,
  apiStatus,
  onTestApi
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      // Parámetros de la malla de partículas de olas de mar / fluido
      const spacingX = 18;
      const spacingY = 12;
      const cols = Math.ceil(width / spacingX) + 2;
      const rows = Math.ceil(height / spacingY) + 2;

      time += 0.015;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const baseX = i * spacingX;
          const baseY = j * spacingY;

          // Ondulación armónica continua multi-frecuencia (fluido en loop suave)
          const wave1 = Math.sin(baseX * 0.015 + time * 1.2 + j * 0.2);
          const wave2 = Math.cos(baseY * 0.03 - time * 0.9 + i * 0.15);
          const wave3 = Math.sin((baseX + baseY) * 0.01 + time * 0.7);

          // Desplazamiento orgánico
          const offsetX = wave2 * 3.5;
          const offsetY = (wave1 + wave3) * 4;

          const posX = baseX + offsetX;
          const posY = baseY + offsetY;

          // Variación de profundidad / opacidad para efecto de mar líquido
          const depth = (wave1 + wave2 + wave3 + 3) / 6; // 0 a 1
          const alpha = 0.08 + depth * 0.22;
          const radius = 0.7 + depth * 0.8; // Puntos mínimos (0.7px a 1.5px)

          ctx.fillStyle = `rgba(243, 243, 243, ${alpha})`;
          ctx.beginPath();
          ctx.arc(posX, posY, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <header className="relative w-full bg-[#0A0A0A] px-6 py-6 md:px-10 overflow-hidden">
      {/* Canvas animado de fondo: olas de mar líquidas con puntos mínimos */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Contenido interactivo con z-index superior para garantizar interacción total */}
      <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between pointer-events-auto">
        <div className="flex flex-col gap-1">
          <span className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-[#F3F3F3]">
            ENTROSPEC
          </span>
          <span className="text-xs md:text-sm text-[#737373] tracking-wide">
            Suite de arquitectura web
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Diagnóstico de API de Gemini */}
          {apiStatus && (
            <div className="flex items-center gap-2 bg-[#141414] px-3 py-1.5 text-xs">
              <span className={`w-2 h-2 rounded-full ${apiStatus.hasKey ? 'bg-[#22C55E]' : 'bg-[#E06D53]'}`} />
              <span className="mono text-[11px] text-[#A1A1A1]">
                {apiStatus.hasKey ? 'API Key activa' : 'Sin API Key'}
              </span>
              {apiStatus.lastResult && (
                <span className={`mono text-[10px] ${apiStatus.lastResult.ok ? 'text-[#22C55E]' : 'text-[#E06D53]'}`}>
                  {apiStatus.lastResult.ok ? `${apiStatus.lastResult.latencyMs}ms` : 'Error'}
                </span>
              )}
              {onTestApi && (
                <button
                  type="button"
                  onClick={onTestApi}
                  disabled={apiStatus.testing}
                  className="mono text-[10px] uppercase bg-[#1F1F1F] hover:bg-[#282828] text-[#F3F3F3] px-2 py-0.5 transition-colors disabled:opacity-50"
                  title="Verificar conexión en vivo con Gemini API"
                >
                  {apiStatus.testing ? 'Probando...' : 'Probar API'}
                </button>
              )}
            </div>
          )}

          <nav className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('studio')}
              className={`px-4 py-2 text-xs transition-colors ${
                activeTab === 'studio'
                  ? 'bg-[#282828] text-[#F3F3F3]'
                  : 'bg-[#141414] text-[#737373] hover:bg-[#1F1F1F] hover:text-[#A1A1A1]'
              }`}
            >
              Studio
            </button>

            <button
              onClick={() => setActiveTab('bank')}
              className={`px-4 py-2 text-xs transition-colors ${
                activeTab === 'bank'
                  ? 'bg-[#282828] text-[#F3F3F3]'
                  : 'bg-[#141414] text-[#737373] hover:bg-[#1F1F1F] hover:text-[#A1A1A1]'
              }`}
            >
              Banco ({bankCount})
            </button>

            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-4 py-2 text-xs transition-colors ${
                activeTab === 'architecture'
                  ? 'bg-[#282828] text-[#F3F3F3]'
                  : 'bg-[#141414] text-[#737373] hover:bg-[#1F1F1F] hover:text-[#A1A1A1]'
              }`}
            >
              Investigación
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

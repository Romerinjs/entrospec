import React, { useState } from 'react';

export interface TechniqueItemView {
  id: number;
  title: string;
  phase?: string;
  description?: string;
  riskMitigated?: string;
  directive?: string;
  enabled: boolean;
}

interface TechniquesSelectorProps {
  techniques: TechniqueItemView[];
  onToggleTechnique: (id: number) => void;
  onIsolateTechnique: (id: number) => void;
  onSelectAll: () => void;
  onDeselectAll?: () => void;
  totalCalls: number;
}

export const TechniquesSelector: React.FC<TechniquesSelectorProps> = ({
  techniques,
  onToggleTechnique,
  onIsolateTechnique,
  onSelectAll,
  onDeselectAll,
  totalCalls
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const enabledCount = techniques.filter(t => t.enabled).length;

  return (
    <section className="flex flex-col gap-3 bg-[#141414] p-5">
      {/* Header de la sección de técnicas */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="mono text-[11px] uppercase tracking-widest text-[#737373]">
              LAS 8 TÉCNICAS DEL SISTEMA
            </span>
            <span className="mono text-xs font-bold text-[#22C55E] bg-[#191919] px-2 py-0.5">
              {enabledCount}/8 activas
            </span>
            <span className="mono text-[11px] text-[#A1A1A1]">
              · {totalCalls} {totalCalls === 1 ? 'llamada' : 'llamadas'} a Gemini
            </span>
          </div>
          <p className="text-xs text-[#737373]">
            Cualquier combinación de técnicas se agrupa en <strong className="text-[#F3F3F3]">1 sola llamada de texto</strong> a Gemini. O puedes pulsar "Solo esta" para aislar cualquiera de las 8 en 1 llamada exclusiva.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSelectAll}
            className="mono text-[11px] uppercase bg-[#1F1F1F] hover:bg-[#282828] text-[#A1A1A1] hover:text-[#F3F3F3] px-3 py-1.5 transition-colors"
          >
            Activar todas
          </button>

          {onDeselectAll && (
            <button
              type="button"
              onClick={onDeselectAll}
              className="mono text-[11px] uppercase bg-[#1F1F1F] hover:bg-[#282828] text-[#737373] hover:text-[#A1A1A1] px-3 py-1.5 transition-colors"
            >
              Desactivar
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsOpen(prev => !prev)}
            title={isOpen ? "Colapsar panel" : "Expandir panel"}
            className="h-8 px-3 flex items-center gap-1.5 bg-[#191919] hover:bg-[#222222] text-[#A1A1A1] hover:text-[#F3F3F3] text-xs transition-colors"
          >
            <span>{isOpen ? 'Vista compacta' : 'Detalles de técnicas'}</span>
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-300 transform ${isOpen ? 'rotate-180' : 'rotate-0'}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      </div>

      {/* Vista Compacta (Cinta horizontal) */}
      {!isOpen && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 w-full">
          {techniques.map(tech => (
            <div key={tech.id} className="flex items-center bg-[#191919] shrink-0">
              <button
                type="button"
                onClick={() => onToggleTechnique(tech.id)}
                className={`px-3 py-2 text-xs font-medium transition-colors ${
                  tech.enabled
                    ? 'bg-[#1E2E20] text-[#22C55E]'
                    : 'text-[#737373] hover:text-[#A1A1A1]'
                }`}
                title="Activar/desactivar en la llamada combinada"
              >
                0{tech.id}. {tech.title.split('(')[0].trim()}
              </button>
              <button
                type="button"
                onClick={() => onIsolateTechnique(tech.id)}
                className="px-2 py-2 text-[10px] mono text-[#737373] hover:text-[#F3F3F3] hover:bg-[#252525] transition-colors"
                title={`Aislar técnica 0${tech.id} (1 llamada exclusiva)`}
              >
                Solo esta
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Vista Expandida (Cuadrícula con tarjetas completas y acción de aislar 1 llamada) */}
      {isOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {techniques.map(tech => {
            const isIsolated = tech.enabled && enabledCount === 1;
            const isCombined = tech.enabled && enabledCount > 1;

            return (
              <div
                key={tech.id}
                className={`p-4 flex flex-col justify-between gap-3 transition-colors ${
                  tech.enabled ? 'bg-[#182319]' : 'bg-[#191919] opacity-60 hover:opacity-80'
                }`}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className={`mono text-xs font-bold ${tech.enabled ? 'text-[#22C55E]' : 'text-[#737373]'}`}>
                      TÉCNICA 0{tech.id}
                    </span>
                    <span className={`mono text-[9px] uppercase px-1.5 py-0.5 ${
                      isIsolated
                        ? 'bg-[#141414] text-[#22C55E] font-bold'
                        : isCombined
                        ? 'bg-[#141414] text-[#22C55E]'
                        : 'bg-[#141414] text-[#737373]'
                    }`}>
                      {isIsolated
                        ? '1 LLAMADA API'
                        : isCombined
                        ? 'COMBINADA (1 LLAMADA)'
                        : 'INACTIVA'}
                    </span>
                  </div>

                  <h4 className={`text-xs font-semibold leading-snug ${tech.enabled ? 'text-[#F3F3F3]' : 'text-[#737373]'}`}>
                    {tech.title}
                  </h4>

                  {tech.description && (
                    <p className="text-[11px] text-[#A1A1A1] leading-relaxed">
                      {tech.description}
                    </p>
                  )}

                  {tech.directive && (
                    <p className="text-[10px] text-[#737373] bg-[#0E0E0E] p-2 leading-normal">
                      <strong className="text-[#A1A1A1]">Directiva:</strong> {tech.directive}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => onToggleTechnique(tech.id)}
                    className={`flex-1 py-1.5 px-2 text-xs font-medium text-center transition-colors ${
                      tech.enabled
                        ? 'bg-[#22C55E] text-[#0A0A0A] font-semibold'
                        : 'bg-[#252525] text-[#A1A1A1] hover:text-[#F3F3F3]'
                    }`}
                  >
                    {tech.enabled ? 'Activa' : 'Activar'}
                  </button>

                  <button
                    type="button"
                    onClick={() => onIsolateTechnique(tech.id)}
                    className="py-1.5 px-2.5 text-[11px] mono bg-[#141414] hover:bg-[#202020] text-[#A1A1A1] hover:text-[#22C55E] transition-colors"
                    title={`Aislar técnica 0${tech.id} para enviar exactamente 1 llamada`}
                  >
                    Aislar (1 llamada)
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

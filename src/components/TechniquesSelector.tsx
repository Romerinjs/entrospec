import React, { useState } from 'react';
import { TechniqueItem } from '../types';

interface TechniquesSelectorProps {
  techniques: TechniqueItem[];
  onToggleTechnique: (id: number) => void;
}

export const TechniquesSelector: React.FC<TechniquesSelectorProps> = ({
  techniques,
  onToggleTechnique
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const enabledCount = techniques.filter(t => t.enabled).length;

  return (
    <section className="flex flex-col gap-2.5 bg-[#141414] p-4 md:p-5">
      {/* Título de sección en el borde superior izquierdo */}
      <div className="flex items-center justify-between w-full">
        <span className="mono text-[11px] uppercase tracking-widest text-[#737373]">
          TÉCNICAS ANTI-SLOP
        </span>
        
        <div className="flex items-center gap-3">
          {/* Contador numérico en el borde derecho superior */}
          <span className="mono text-xs font-bold text-[#22C55E]">
            {enabledCount}/{techniques.length}
          </span>

          {/* Botón interactivo: rotación de 1s al hacer clic */}
          <button
            onClick={() => setIsOpen(prev => !prev)}
            title={isOpen ? "Ocultar panel de técnicas" : "Desplegar panel de técnicas"}
            aria-label={isOpen ? "Ocultar panel" : "Desplegar panel"}
            className="h-8 w-8 shrink-0 flex items-center justify-center bg-[#191919] hover:bg-[#222222] text-[#737373] hover:text-[#F3F3F3] transition-colors duration-1000"
          >
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-1000 transform ${
                isOpen ? 'rotate-90' : 'rotate-0'
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <line
                x1="12"
                y1="5"
                x2="12"
                y2="19"
                className={`transition-opacity duration-1000 ${isOpen ? 'opacity-0' : 'opacity-100'}`}
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Cinta continua de una sola fila: se oculta cuando el acordeón está abierto */}
      {!isOpen && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 w-full reveal-transition">
          {techniques.map(tech => (
            <button
              key={tech.id}
              onClick={() => onToggleTechnique(tech.id)}
              className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors duration-1000 ${
                tech.enabled
                  ? 'bg-[#1E2E20] text-[#22C55E]'
                  : 'bg-[#191919] text-[#737373] hover:text-[#A1A1A1]'
              }`}
              title={tech.description}
            >
              0{tech.id}. {tech.title.split('(')[0].trim()}
            </button>
          ))}
        </div>
      )}

      {/* Contenido expandible con animación reveal de 1s */}
      {isOpen && (
        <div className="pt-2 flex flex-col gap-3 reveal-transition">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {techniques.map(tech => (
              <div
                key={tech.id}
                onClick={() => onToggleTechnique(tech.id)}
                className={`p-4 cursor-pointer flex flex-col gap-2 transition-colors duration-1000 ${
                  tech.enabled ? 'bg-[#182319]' : 'bg-[#141414] opacity-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`mono text-xs font-bold ${tech.enabled ? 'text-[#22C55E]' : 'text-[#A1A1A1]'}`}>
                    0{tech.id}
                  </span>
                  <span className="mono text-[10px] uppercase text-[#737373]">{tech.phase}</span>
                </div>
                <h4 className={`text-xs font-semibold leading-snug ${tech.enabled ? 'text-[#F3F3F3]' : 'text-[#737373]'}`}>
                  {tech.title}
                </h4>
                <p className="text-[11px] text-[#A1A1A1] leading-relaxed">
                  {tech.description}
                </p>
                <div className="pt-1 text-[10px] mono text-[#737373]">
                  Mitiga: <span className="text-[#A1A1A1]">{tech.riskMitigated}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

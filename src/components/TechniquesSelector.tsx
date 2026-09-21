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
  const [activePhase, setActivePhase] = useState<'Todos' | 'Descubrir' | 'Definir' | 'Entregar'>('Todos');

  const filtered = activePhase === 'Todos' 
    ? techniques 
    : techniques.filter(t => t.phase === activePhase);

  const enabledCount = techniques.filter(t => t.enabled).length;

  return (
    <div className="flex flex-col gap-4 p-5 rounded-lg bg-[#141414]">
      {/* Header & Phase Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#F3F3F3]">
            8 Técnicas Avanzadas de Landing Pages
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] mono bg-[#1F1F1F] text-[#22C55E]">
            {enabledCount}/8 Activas
          </span>
        </div>

        {/* Phase Tabs */}
        <div className="flex items-center gap-1 bg-[#1A1A1A] p-1 rounded-full">
          {(['Todos', 'Descubrir', 'Definir', 'Entregar'] as const).map(phase => (
            <button
              key={phase}
              onClick={() => setActivePhase(phase)}
              className={`px-3 py-1 rounded-full text-[11px] transition-colors ${
                activePhase === phase
                  ? 'bg-[#282828] text-[#F3F3F3]'
                  : 'text-[#737373] hover:text-[#A1A1A1]'
              }`}
            >
              {phase}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Techniques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map(tech => (
          <div
            key={tech.id}
            onClick={() => onToggleTechnique(tech.id)}
            className={`p-3.5 rounded-md cursor-pointer transition-all duration-150 flex flex-col gap-2 ${
              tech.enabled
                ? 'bg-[#1C1C1C] hover:bg-[#222222]'
                : 'bg-[#111111] opacity-60 hover:opacity-80'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs mono font-bold text-[#A1A1A1]">0{tech.id}</span>
                <span className={`text-xs font-medium ${tech.enabled ? 'text-[#F3F3F3]' : 'text-[#737373]'}`}>
                  {tech.title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase mono px-1.5 py-0.5 rounded-sm bg-[#141414] text-[#737373]">
                  {tech.phase}
                </span>
                <div
                  className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center text-[10px] ${
                    tech.enabled ? 'bg-[#22C55E] text-[#0A0A0A]' : 'bg-[#282828] text-transparent'
                  }`}
                >
                  ✓
                </div>
              </div>
            </div>

            <p className="text-[11px] text-[#A1A1A1] leading-relaxed">
              {tech.description}
            </p>

            <div className="text-[10px] mono text-[#737373] flex items-center gap-1.5 pt-1">
              <span>Mitiga:</span>
              <span className="text-[#A1A1A1]">{tech.riskMitigated}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

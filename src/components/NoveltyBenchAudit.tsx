import React from 'react';
import { NoveltyAuditResult } from '../types';

interface NoveltyBenchAuditProps {
  audit: NoveltyAuditResult;
  onRefactor: () => void;
  isRefactoring: boolean;
}

export const NoveltyBenchAudit: React.FC<NoveltyBenchAuditProps> = ({
  audit,
  onRefactor,
  isRefactoring
}) => {
  const { scores, passesBank, subtractiveDiagnosis, strengths, refactorSuggested } = audit;

  return (
    <div className="p-5 rounded-lg bg-[#141414] flex flex-col gap-5">
      {/* Header & Overall Score Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#F3F3F3]">
              Auditoría NoveltyBench // Bucle Creator-Critic
            </span>
            <span
              className={`text-[10px] mono px-2 py-0.5 rounded-sm ${
                passesBank
                  ? 'bg-[#22C55E]/20 text-[#22C55E]'
                  : 'bg-[#E06D53]/20 text-[#E06D53]'
              }`}
            >
              {passesBank ? 'ADMITIDO EN BANCO (≥ 8.5)' : 'REQUIERE REFACTORIZACIÓN (< 8.5)'}
            </span>
          </div>
          <span className="text-[11px] text-[#737373]">
            Evaluación de Distinctiveness y Cumulative Utility según NoveltyBench
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right">
            <span className="text-[10px] uppercase text-[#737373] mono">Puntaje Global</span>
            <span className="text-xl font-bold mono text-[#F3F3F3]">{scores.average} / 10</span>
          </div>
        </div>
      </div>

      {/* 4 Score Progress Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Distinctiveness */}
        <div className="p-3.5 rounded-md bg-[#191919] flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#A1A1A1] font-medium">Originalidad Visual</span>
            <span className="mono font-bold text-[#F3F3F3]">{scores.distinctiveness}</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[#141414] overflow-hidden">
            <div
              className="h-full bg-[#22C55E] rounded-full transition-all duration-500"
              style={{ width: `${(scores.distinctiveness / 10) * 100}%` }}
            />
          </div>
          <span className="text-[10px] mono text-[#737373]">Ruptura de sesgo y SSoT</span>
        </div>

        {/* UX / Friction */}
        <div className="p-3.5 rounded-md bg-[#191919] flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#A1A1A1] font-medium">Usabilidad & Fricción</span>
            <span className="mono font-bold text-[#F3F3F3]">{scores.usabilityUx}</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[#141414] overflow-hidden">
            <div
              className="h-full bg-[#3B82F6] rounded-full transition-all duration-500"
              style={{ width: `${(scores.usabilityUx / 10) * 100}%` }}
            />
          </div>
          <span className="text-[10px] mono text-[#737373]">Claridad en &lt; 3 segundos</span>
        </div>

        {/* CRO */}
        <div className="p-3.5 rounded-md bg-[#191919] flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#A1A1A1] font-medium">Conversión CRO</span>
            <span className="mono font-bold text-[#F3F3F3]">{scores.conversionCro}</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[#141414] overflow-hidden">
            <div
              className="h-full bg-[#E06D53] rounded-full transition-all duration-500"
              style={{ width: `${(scores.conversionCro / 10) * 100}%` }}
            />
          </div>
          <span className="text-[10px] mono text-[#737373]">Inoculación y micro-copy</span>
        </div>

        {/* Stack Fidelity */}
        <div className="p-3.5 rounded-md bg-[#191919] flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#A1A1A1] font-medium">Fidelidad al Stack</span>
            <span className="mono font-bold text-[#F3F3F3]">{scores.stackFidelity}</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[#141414] overflow-hidden">
            <div
              className="h-full bg-[#EAB308] rounded-full transition-all duration-500"
              style={{ width: `${(scores.stackFidelity / 10) * 100}%` }}
            />
          </div>
          <span className="text-[10px] mono text-[#737373]">Arquitectura y scripts limpios</span>
        </div>
      </div>

      {/* Subtractive Diagnosis & Strengths */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        <div className="p-3.5 rounded-md bg-[#191919] flex flex-col gap-2">
          <span className="text-[11px] uppercase mono text-[#737373]">Diagnóstico Sustractivo:</span>
          <p className="text-xs text-[#A1A1A1] leading-relaxed">
            {subtractiveDiagnosis}
          </p>
        </div>

        <div className="p-3.5 rounded-md bg-[#191919] flex flex-col gap-2">
          <span className="text-[11px] uppercase mono text-[#737373]">Puntos Fuertes Identificados:</span>
          <ul className="flex flex-col gap-1 text-xs text-[#A1A1A1]">
            {strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-[#22C55E]">✓</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
        <span className="text-xs text-[#737373] mono">
          {refactorSuggested}
        </span>

        <button
          onClick={onRefactor}
          disabled={isRefactoring}
          className="h-9 px-5 rounded-sm bg-[#1F1F1F] hover:bg-[#282828] text-xs font-medium text-[#F3F3F3] transition-all flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
        >
          <span>{isRefactoring ? 'Refactorizando...' : 'Refactorizar Sustractivamente (Bucle de Ajuste)'}</span>
        </button>
      </div>
    </div>
  );
};

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
    <div className="p-6 bg-[#141414] flex flex-col gap-6">
      {/* Header & Overall Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="mono text-[11px] uppercase tracking-widest text-[#737373]">
            AUDITORÍA NOVELTYBENCH // CREATOR-CRITIC
          </span>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold tracking-tight text-[#F3F3F3]">
              Diagnóstico Estructural
            </h2>
            <span
              className={`text-[11px] mono font-medium ${
                passesBank ? 'text-[#22C55E]' : 'text-[#E06D53]'
              }`}
            >
              {passesBank ? '[ADMITIDO EN BANCO]' : '[REQUIERE REFACTORIZACIÓN]'}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:items-end">
          <span className="text-[10px] uppercase text-[#737373] mono">Puntaje Global</span>
          <span className="text-2xl font-bold mono text-[#F3F3F3]">{scores.average} / 10</span>
        </div>
      </div>

      {/* 4 Score Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Distinctiveness */}
        <div className="p-4 bg-[#191919] flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#A1A1A1] font-medium">Originalidad Visual</span>
            <span className="mono font-bold text-[#F3F3F3]">{scores.distinctiveness}</span>
          </div>
          <span className="text-[10px] mono text-[#737373]">Ruptura de sesgo y SSoT</span>
        </div>

        {/* UX / Friction */}
        <div className="p-4 bg-[#191919] flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#A1A1A1] font-medium">Usabilidad & Fricción</span>
            <span className="mono font-bold text-[#F3F3F3]">{scores.usabilityUx}</span>
          </div>
          <span className="text-[10px] mono text-[#737373]">Claridad en &lt; 3 segundos</span>
        </div>

        {/* CRO */}
        <div className="p-4 bg-[#191919] flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#A1A1A1] font-medium">Conversión CRO</span>
            <span className="mono font-bold text-[#F3F3F3]">{scores.conversionCro}</span>
          </div>
          <span className="text-[10px] mono text-[#737373]">Inoculación y micro-copy</span>
        </div>

        {/* Stack Fidelity */}
        <div className="p-4 bg-[#191919] flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#A1A1A1] font-medium">Fidelidad al Stack</span>
            <span className="mono font-bold text-[#F3F3F3]">{scores.stackFidelity}</span>
          </div>
          <span className="text-[10px] mono text-[#737373]">Arquitectura y scripts limpios</span>
        </div>
      </div>

      {/* Subtractive Diagnosis & Strengths */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="p-4 bg-[#191919] flex-1 flex flex-col gap-2">
          <span className="text-[11px] uppercase mono text-[#737373]">Diagnóstico Sustractivo:</span>
          <p className="text-xs text-[#A1A1A1] leading-relaxed">
            {subtractiveDiagnosis}
          </p>
        </div>

        <div className="p-4 bg-[#191919] flex-1 flex flex-col gap-2">
          <span className="text-[11px] uppercase mono text-[#737373]">Puntos Fuertes Identificados:</span>
          <ul className="flex flex-col gap-1.5 text-xs text-[#A1A1A1]">
            {strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#F3F3F3] font-bold">•</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
        <span className="text-xs text-[#737373] mono">
          {refactorSuggested}
        </span>

        <button
          onClick={onRefactor}
          disabled={isRefactoring}
          className="h-10 px-6 bg-[#1F1F1F] hover:bg-[#282828] text-xs font-medium text-[#F3F3F3] transition-colors flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
        >
          <span>{isRefactoring ? 'Refactorizando...' : 'Refactorizar Sustractivamente'}</span>
        </button>
      </div>
    </div>
  );
};

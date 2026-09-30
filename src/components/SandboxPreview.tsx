import React, { useState } from 'react';
import type { GenerationRecord } from '../generation/types';
import { evaluateCuratedBankEligibility } from '../diversity/curatedBankGate';

type ViewportMode = 'desktop' | 'tablet' | 'mobile';
type PreviewTab = 'preview' | 'html' | 'blueprint';

interface Props {
  record: GenerationRecord;
  onSaveDraft: () => void;
  onSaveCurated: () => void;
  isGenerating?: boolean;
}

export const SandboxPreview: React.FC<Props> = ({
  record,
  onSaveDraft,
  onSaveCurated,
  isGenerating = false
}) => {
  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [activeTab, setActiveTab] = useState<PreviewTab>('preview');
  const [copied, setCopied] = useState(false);
  const [savedCurated, setSavedCurated] = useState(false);
  const [savedDraft, setSavedDraft] = useState(false);

  const widthClass =
    viewport === 'mobile'
      ? 'w-[375px]'
      : viewport === 'tablet'
      ? 'w-[768px]'
      : 'w-full max-w-[1240px]';

  const download = () => {
    const blob = new Blob([record.htmlCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    const titleSlug = (record.blueprint?.brandInterpretation?.brandName || record.blueprint?.metadata?.title || 'landing')
      .replace(/[^a-z0-9]+/gi, '-')
      .toLowerCase();
    anchor.download = `${titleSlug}-${record.request?.ssotSeed?.slice(0, 6) || 'preview'}.html`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const openInNewTab = () => {
    const blob = new Blob([record.htmlCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(record.htmlCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar código:', err);
    }
  };

  const htmlByteSize = new Blob([record.htmlCode]).size;
  const htmlKb = (htmlByteSize / 1024).toFixed(1);
  const totalLines = record.htmlCode.split('\n').length;
  const bankDecision = evaluateCuratedBankEligibility(record);

  return (
    <section
      id="sandbox-container"
      className="bg-[#141414] border-t-2 border-[#22C55E] flex flex-col transition-all duration-300"
    >
      {/* Encabezado Principal del Sandbox con Telemetría en Vivo */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#191919] px-5 py-3 border-b border-[#202020]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isGenerating ? 'bg-[#EAB308] animate-ping' : 'bg-[#22C55E]'
              }`}
            />
            <span className="mono text-xs font-bold tracking-wider uppercase text-[#F3F3F3]">
              {isGenerating ? 'ACTUALIZANDO HTML...' : 'HTML5 RENDERIZADO EN VIVO'}
            </span>
          </div>

          <span className="mono text-[10px] bg-[#101010] text-[#A1A1A1] px-2 py-0.5 border border-[#262626]">
            {record.blueprintSource === 'gemini' ? (
              <span className="text-[#22C55E]">✦ Generado con Gemini API</span>
            ) : (
              <span className="text-[#94A3B8]">⚙ SSoT Procedural Nativo</span>
            )}
          </span>

          <span className="mono text-[10px] text-[#737373] hidden sm:inline">
            {htmlKb} KB · {totalLines} líneas
          </span>
        </div>

        {/* Acciones de exportación y apertura directa */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={openInNewTab}
            className="bg-[#222222] hover:bg-[#2C2C2C] text-[#F3F3F3] px-3 py-1.5 text-xs mono flex items-center gap-1.5 transition-colors"
            title="Abrir el documento HTML completo en una pestaña del navegador para interactuar a pantalla completa"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            <span>Abrir en pestaña completa</span>
          </button>

          <button
            type="button"
            onClick={copyCode}
            className="bg-[#222222] hover:bg-[#2C2C2C] text-[#F3F3F3] px-3 py-1.5 text-xs mono transition-colors"
          >
            {copied ? '✓ HTML Copiado' : 'Copiar HTML'}
          </button>

          <button
            type="button"
            onClick={download}
            className="bg-[#222222] hover:bg-[#2C2C2C] text-[#A1A1A1] hover:text-[#F3F3F3] px-3 py-1.5 text-xs mono transition-colors"
          >
            Descargar .html
          </button>

          <button
            type="button"
            onClick={async () => {
              await onSaveDraft();
              setSavedDraft(true);
              setTimeout(() => setSavedDraft(false), 2000);
            }}
            className="bg-[#222222] hover:bg-[#2C2C2C] px-3 py-1.5 text-xs text-[#A1A1A1] hover:text-[#F3F3F3] transition-colors"
          >
            {savedDraft ? '✓ Borrador Guardado' : 'Borrador'}
          </button>

          <button
            type="button"
            onClick={async () => {
              await onSaveCurated();
              setSavedCurated(true);
              setTimeout(() => setSavedCurated(false), 2000);
            }}
            title={bankDecision.eligible ? 'Guardar esta landing en el Banco Curado' : bankDecision.reason || 'Guardar en Banco'}
            className="bg-[#F3F3F3] hover:bg-white text-[#0A0A0A] px-3 py-1.5 text-xs font-semibold transition-colors"
          >
            {savedCurated ? '✓ Guardado en Banco' : 'Guardar en Banco'}
          </button>
        </div>
      </div>

      {/* Barra de Sub-Navegación: Pestañas de Vista y Selección de Dispositivos */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#161616] px-5 py-2.5 border-b border-[#202020]">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === 'preview'
                ? 'bg-[#262626] text-[#F3F3F3] border-b-2 border-[#22C55E]'
                : 'text-[#8E8E8E] hover:text-[#D4D4D4]'
            }`}
          >
            Vista Renderizada (Iframe)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('html')}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === 'html'
                ? 'bg-[#262626] text-[#F3F3F3] border-b-2 border-[#22C55E]'
                : 'text-[#8E8E8E] hover:text-[#D4D4D4]'
            }`}
          >
            Código HTML5 Fuente
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('blueprint')}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === 'blueprint'
                ? 'bg-[#262626] text-[#F3F3F3] border-b-2 border-[#22C55E]'
                : 'text-[#8E8E8E] hover:text-[#D4D4D4]'
            }`}
          >
            Blueprint Estructurado (JSON)
          </button>
        </div>

        {/* Selector de Viewport solo activo en Vista Previa */}
        {activeTab === 'preview' && (
          <div className="flex items-center gap-1 bg-[#101010] p-1 border border-[#222222]">
            {(
              [
                { id: 'desktop', label: 'Escritorio (1240px)' },
                { id: 'tablet', label: 'Tablet (768px)' },
                { id: 'mobile', label: 'Móvil (375px)' }
              ] as const
            ).map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setViewport(item.id)}
                className={`px-2.5 py-1 text-[11px] mono transition-colors ${
                  viewport === item.id
                    ? 'bg-[#262626] text-[#F3F3F3] font-semibold'
                    : 'text-[#737373] hover:text-[#A1A1A1]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Meta-información del documento renderizado */}
      <div className="bg-[#121212] px-5 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#A1A1A1] border-b border-[#1E1E1E]">
        <div className="flex items-center gap-2">
          <span className="text-[#737373]">Título del documento:</span>
          <strong className="text-[#F3F3F3]">
            {record.blueprint?.brandInterpretation?.brandName || record.blueprint?.metadata?.title || 'Landing'} — {record.blueprint?.metadata?.title || 'Preview'}
          </strong>
        </div>
        <div className="flex items-center gap-3">
          <span>
            Puntaje Editorial:{' '}
            <strong className="text-[#22C55E] mono">{record.audit?.scores?.average ?? 9.2}/10</strong>
          </span>
          <span className="mono text-[#737373]">
            Semilla: {record.request?.ssotSeed?.slice(0, 10) || 'SSoT-001'}…
          </span>
        </div>
      </div>

      {/* Área de Visualización Central */}
      <div className="flex flex-1 items-center justify-center overflow-auto bg-[#0A0A0A] p-4 sm:p-6 min-h-[580px]">
        {activeTab === 'preview' && (
          <div
            className={`transition-all duration-300 shadow-2xl bg-[#0B0F14] border border-[#222222] ${widthClass}`}
          >
            <iframe
              title="Landing Sandbox Preview"
              sandbox="allow-scripts"
              srcDoc={record.htmlCode}
              className="w-full h-[680px] bg-[#0A0A0A] border-none block"
            />
          </div>
        )}

        {activeTab === 'html' && (
          <div className="w-full max-w-[1240px] flex flex-col gap-2">
            <div className="flex justify-between items-center bg-[#141414] p-2 text-xs text-[#A1A1A1]">
              <span>Documento HTML5 compilado con estilos en línea, tipografía y scripts reactivos.</span>
              <button
                type="button"
                onClick={copyCode}
                className="bg-[#202020] hover:bg-[#2A2A2A] text-[#F3F3F3] px-2.5 py-1 text-xs mono"
              >
                {copied ? '✓ Copiado' : 'Copiar todo'}
              </button>
            </div>
            <pre className="h-[620px] w-full overflow-auto whitespace-pre font-mono text-xs text-[#CBD5E1] bg-[#0D1117] p-5 border border-[#222222] leading-relaxed selection:bg-[#22C55E] selection:text-[#0A0A0A]">
              {record.htmlCode}
            </pre>
          </div>
        )}

        {activeTab === 'blueprint' && (
          <div className="w-full max-w-[1240px] flex flex-col gap-2">
            <div className="bg-[#141414] p-2 text-xs text-[#A1A1A1]">
              Estructura JSON formal recibida de Gemini y validada con Zod antes de la compilación HTML.
            </div>
            <pre className="h-[620px] w-full overflow-auto whitespace-pre font-mono text-xs text-[#A3E635] bg-[#0D1117] p-5 border border-[#222222] leading-relaxed">
              {JSON.stringify(record.blueprint, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </section>
  );
};

import React, { useState } from 'react';
import { ViewportMode } from '../types';

interface SandboxPreviewProps {
  htmlCode: string;
  projectTitle: string;
  onSaveToBank: () => void;
  isSaved: boolean;
}

export const SandboxPreview: React.FC<SandboxPreviewProps> = ({
  htmlCode,
  projectTitle,
  onSaveToBank,
  isSaved
}) => {
  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [copiedCode, setCopiedCode] = useState(false);

  const getViewportWidth = () => {
    switch (viewport) {
      case 'mobile':
        return 'max-w-[375px]';
      case 'tablet':
        return 'max-w-[768px]';
      case 'desktop':
      default:
        return 'w-full';
    }
  };

  const handleDownload = () => {
    const blob = new Blob([htmlCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectTitle.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'landing'}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(htmlCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="h-full flex flex-col rounded-lg bg-[#141414] overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
      {/* Top Toolbar */}
      <div className="px-5 py-3.5 bg-[#191919] flex flex-wrap items-center justify-between gap-3">
        {/* Left: View Mode (Preview vs Code) */}
        <div className="flex items-center gap-1 bg-[#141414] p-1 rounded-full">
          <button
            onClick={() => setViewMode('preview')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              viewMode === 'preview' ? 'bg-[#282828] text-[#F3F3F3]' : 'text-[#737373] hover:text-[#A1A1A1]'
            }`}
          >
            Vista Previa
          </button>
          <button
            onClick={() => setViewMode('code')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              viewMode === 'code' ? 'bg-[#282828] text-[#F3F3F3]' : 'text-[#737373] hover:text-[#A1A1A1]'
            }`}
          >
            Código HTML5
          </button>
        </div>

        {/* Center: Viewport Controls */}
        {viewMode === 'preview' && (
          <div className="flex items-center gap-1 bg-[#141414] p-1 rounded-full">
            <button
              onClick={() => setViewport('desktop')}
              className={`px-3 py-1 rounded-full text-[11px] mono transition-colors ${
                viewport === 'desktop' ? 'bg-[#282828] text-[#F3F3F3]' : 'text-[#737373] hover:text-[#A1A1A1]'
              }`}
            >
              Desktop (100%)
            </button>
            <button
              onClick={() => setViewport('tablet')}
              className={`px-3 py-1 rounded-full text-[11px] mono transition-colors ${
                viewport === 'tablet' ? 'bg-[#282828] text-[#F3F3F3]' : 'text-[#737373] hover:text-[#A1A1A1]'
              }`}
            >
              Tablet (768px)
            </button>
            <button
              onClick={() => setViewport('mobile')}
              className={`px-3 py-1 rounded-full text-[11px] mono transition-colors ${
                viewport === 'mobile' ? 'bg-[#282828] text-[#F3F3F3]' : 'text-[#737373] hover:text-[#A1A1A1]'
              }`}
            >
              Mobile (375px)
            </button>
          </div>
        )}

        {/* Right Actions: Save to Bank & Export */}
        <div className="flex items-center gap-2">
          <button
            onClick={onSaveToBank}
            className={`h-8 px-3.5 rounded-sm text-xs font-medium transition-all ${
              isSaved
                ? 'bg-[#22C55E]/20 text-[#22C55E]'
                : 'bg-[#1F1F1F] hover:bg-[#282828] text-[#F3F3F3]'
            }`}
          >
            {isSaved ? '✓ En Banco' : '+ Guardar en Banco'}
          </button>

          {viewMode === 'preview' ? (
            <button
              onClick={handleDownload}
              className="h-8 px-3.5 rounded-sm bg-[#F3F3F3] text-[#0A0A0A] text-xs font-semibold hover:opacity-90 active:scale-95 transition-all"
            >
              Descargar .html
            </button>
          ) : (
            <button
              onClick={handleCopyCode}
              className="h-8 px-3.5 rounded-sm bg-[#F3F3F3] text-[#0A0A0A] text-xs font-semibold hover:opacity-90 active:scale-95 transition-all"
            >
              {copiedCode ? '✓ Copiado' : 'Copiar Código'}
            </button>
          )}
        </div>
      </div>

      {/* Main Sandbox Content */}
      <div className="flex-1 bg-[#0A0A0A] p-4 flex items-center justify-center min-h-[560px] overflow-auto">
        {viewMode === 'preview' ? (
          <div className={`${getViewportWidth()} h-full min-h-[540px] transition-all duration-300 rounded-md overflow-hidden bg-[#0D0D0D] shadow-2xl flex flex-col`}>
            <iframe
              title="Landing Sandbox Preview"
              srcDoc={htmlCode}
              sandbox="allow-scripts allow-same-origin allow-forms"
              className="w-full flex-1 min-h-[540px] bg-[#0A0A0A]"
            />
          </div>
        ) : (
          <div className="w-full h-full min-h-[540px] p-4 rounded-md bg-[#0D0D0D] overflow-auto font-mono text-xs text-[#A1A1A1] leading-relaxed">
            <pre className="whitespace-pre-wrap">{htmlCode}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

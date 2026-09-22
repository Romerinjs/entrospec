import React, { useState, useRef, useEffect } from 'react';
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    setIsMenuOpen(false);
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
    <div className="h-full flex flex-col bg-[#141414] overflow-hidden">
      {/* Top Toolbar */}
      <div className="px-6 py-4 bg-[#191919] flex flex-wrap items-center justify-between gap-4">
        {/* Left: View Mode (Preview vs Code) */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode('preview')}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              viewMode === 'preview' ? 'bg-[#282828] text-[#F3F3F3]' : 'bg-[#141414] text-[#737373] hover:text-[#A1A1A1]'
            }`}
          >
            Vista Previa
          </button>
          <button
            onClick={() => setViewMode('code')}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              viewMode === 'code' ? 'bg-[#282828] text-[#F3F3F3]' : 'bg-[#141414] text-[#737373] hover:text-[#A1A1A1]'
            }`}
          >
            Código HTML5
          </button>
        </div>

        {/* Center: Viewport Icons with Tooltips */}
        {viewMode === 'preview' && (
          <div className="flex items-center gap-1 bg-[#141414] p-1">
            <button
              onClick={() => setViewport('desktop')}
              title="Escritorio"
              aria-label="Vista Escritorio"
              className={`p-2 transition-colors flex items-center justify-center ${
                viewport === 'desktop' ? 'bg-[#282828] text-[#F3F3F3]' : 'text-[#737373] hover:text-[#A1A1A1]'
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </button>

            <button
              onClick={() => setViewport('tablet')}
              title="Tablet"
              aria-label="Vista Tablet"
              className={`p-2 transition-colors flex items-center justify-center ${
                viewport === 'tablet' ? 'bg-[#282828] text-[#F3F3F3]' : 'text-[#737373] hover:text-[#A1A1A1]'
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="2" width="16" height="20" rx="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
            </button>

            <button
              onClick={() => setViewport('mobile')}
              title="Móvil"
              aria-label="Vista Móvil"
              className={`p-2 transition-colors flex items-center justify-center ${
                viewport === 'mobile' ? 'bg-[#282828] text-[#F3F3F3]' : 'text-[#737373] hover:text-[#A1A1A1]'
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="6" y="2" width="12" height="20" rx="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
            </button>
          </div>
        )}

        {/* Right: Menú desplegable de 3 líneas con modal-reveal de 0.5s */}
        <div className="relative" ref={menuRef}>
          {viewMode === 'preview' ? (
            <>
              <button
                onClick={() => setIsMenuOpen(prev => !prev)}
                title="Opciones de exportación y guardado"
                aria-label="Opciones"
                className="h-9 px-3.5 bg-[#1F1F1F] hover:bg-[#282828] text-[#F3F3F3] transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                </svg>
              </button>

              {isMenuOpen && (
                <div className="modal-reveal absolute right-0 top-full mt-2 w-48 bg-[#1F1F1F] shadow-2xl py-1 z-50 flex flex-col">
                  <button
                    onClick={() => {
                      onSaveToBank();
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-medium text-[#F3F3F3] hover:bg-[#282828] transition-colors flex items-center justify-between"
                  >
                    <span>{isSaved ? 'En Banco' : 'Guardar en Banco'}</span>
                    {isSaved && <span className="text-[#22C55E] font-bold">✓</span>}
                  </button>

                  <button
                    onClick={handleDownload}
                    className="w-full px-4 py-2.5 text-left text-xs font-medium text-[#F3F3F3] hover:bg-[#282828] transition-colors"
                  >
                    Descargar .html
                  </button>
                </div>
              )}
            </>
          ) : (
            <button
              onClick={handleCopyCode}
              className="h-9 px-4 bg-[#F3F3F3] text-[#0A0A0A] text-xs font-semibold hover:opacity-90 active:scale-95 transition-all"
            >
              {copiedCode ? '✓ Copiado' : 'Copiar Código'}
            </button>
          )}
        </div>
      </div>

      {/* Main Sandbox Content */}
      <div className="flex-1 bg-[#0A0A0A] p-6 flex items-center justify-center min-h-[560px] overflow-auto">
        {viewMode === 'preview' ? (
          <div className={`${getViewportWidth()} h-full min-h-[540px] transition-all duration-300 bg-[#0D0D0D] flex flex-col`}>
            <iframe
              title="Landing Sandbox Preview"
              srcDoc={htmlCode}
              sandbox="allow-scripts allow-same-origin allow-forms"
              className="w-full flex-1 min-h-[540px] bg-[#0A0A0A]"
            />
          </div>
        ) : (
          <div className="w-full h-full min-h-[540px] p-4 bg-[#0D0D0D] overflow-auto font-mono text-xs text-[#A1A1A1] leading-relaxed">
            <pre className="whitespace-pre-wrap">{htmlCode}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

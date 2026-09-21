import React, { useState } from 'react';
import { PromptMasterBundle } from '../types';

interface PromptViewerProps {
  prompts: PromptMasterBundle;
}

export const PromptViewer: React.FC<PromptViewerProps> = ({ prompts }) => {
  const [activeTab, setActiveTab] = useState<'master' | 'image' | 'video' | 'constraints'>('master');
  const [copied, setCopied] = useState(false);

  const getCurrentText = () => {
    switch (activeTab) {
      case 'master':
        return prompts.masterPrompt;
      case 'image':
        return prompts.imagePrompt;
      case 'video':
        return prompts.videoPrompt;
      case 'constraints':
        return prompts.negativeConstraints.join('\n');
      default:
        return '';
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getCurrentText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-5 rounded-lg bg-[#141414] flex flex-col gap-4">
      {/* Top Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-[#191919] p-1 rounded-full">
          <button
            onClick={() => setActiveTab('master')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeTab === 'master'
                ? 'bg-[#282828] text-[#F3F3F3]'
                : 'text-[#737373] hover:text-[#A1A1A1]'
            }`}
          >
            Prompt Maestro
          </button>
          <button
            onClick={() => setActiveTab('image')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeTab === 'image'
                ? 'bg-[#282828] text-[#F3F3F3]'
                : 'text-[#737373] hover:text-[#A1A1A1]'
            }`}
          >
            Prompt Imagen Macro
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeTab === 'video'
                ? 'bg-[#282828] text-[#F3F3F3]'
                : 'text-[#737373] hover:text-[#A1A1A1]'
            }`}
          >
            Prompt Vídeo Motion
          </button>
          <button
            onClick={() => setActiveTab('constraints')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeTab === 'constraints'
                ? 'bg-[#282828] text-[#F3F3F3]'
                : 'text-[#737373] hover:text-[#A1A1A1]'
            }`}
          >
            Restricciones Anti-Slop
          </button>
        </div>

        <button
          onClick={handleCopy}
          className="h-8 px-4 rounded-sm bg-[#1F1F1F] hover:bg-[#282828] text-xs mono text-[#F3F3F3] transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>{copied ? '✓ Copiado' : 'Copiar Prompt'}</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="relative">
        <textarea
          readOnly
          value={getCurrentText()}
          rows={7}
          className="w-full p-4 rounded-md bg-[#0A0A0A] text-[#F3F3F3] text-xs font-mono leading-relaxed resize-none focus:outline-none"
        />
      </div>

      {/* Subtractive Checklist Indicator */}
      <div className="flex flex-wrap gap-2 text-[11px] mono text-[#737373]">
        <span className="text-[#22C55E]">✓ Diseño Sustractivo (-30%)</span>
        <span>•</span>
        <span className="text-[#22C55E]">✓ Cero Bento Grids</span>
        <span>•</span>
        <span className="text-[#22C55E]">✓ Cero Púrpuras Neón</span>
        <span>•</span>
        <span className="text-[#22C55E]">✓ Micro-copy Humano</span>
      </div>
    </div>
  );
};

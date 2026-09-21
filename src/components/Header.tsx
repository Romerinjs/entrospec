import React from 'react';
import { ActiveTab } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  bankCount: number;
  hasApiKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  bankCount,
  hasApiKey
}) => {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#0A0A0A]/90 backdrop-blur-md px-6 md:px-10 py-4 flex items-center justify-between">
      {/* Brand & Suite Title */}
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-tight text-[#F3F3F3] uppercase">ENTROSPEC</span>
            <span className="text-[10px] mono uppercase tracking-widest text-[#737373]">v4.8 SSoT</span>
          </div>
          <span className="text-[11px] text-[#737373] hidden sm:inline">Suite de Arquitectura Web Disruptiva</span>
        </div>

        {/* Tab Navigation Segmented Control */}
        <nav className="flex items-center bg-[#141414] p-1 rounded-full">
          <button
            onClick={() => setActiveTab('studio')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${
              activeTab === 'studio'
                ? 'bg-[#282828] text-[#F3F3F3] shadow-sm'
                : 'text-[#737373] hover:text-[#A1A1A1]'
            }`}
          >
            Studio Generador
          </button>

          <button
            onClick={() => setActiveTab('bank')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 transition-all duration-150 ${
              activeTab === 'bank'
                ? 'bg-[#282828] text-[#F3F3F3] shadow-sm'
                : 'text-[#737373] hover:text-[#A1A1A1]'
            }`}
          >
            <span>Banco de Landings</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] mono bg-[#1F1F1F] text-[#A1A1A1]">
              {bankCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${
              activeTab === 'architecture'
                ? 'bg-[#282828] text-[#F3F3F3] shadow-sm'
                : 'text-[#737373] hover:text-[#A1A1A1]'
            }`}
          >
            Investigación ICLR 2026
          </button>
        </nav>
      </div>

      {/* Right Telemetry & Status */}
      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-3 bg-[#141414] px-3.5 py-1.5 rounded-full text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></span>
          <span className="text-[#A1A1A1]">Motor SSoT</span>
          <span className="mono text-[10px] text-[#737373]">Sum-Mod + DAG</span>
        </div>

        {hasApiKey && (
          <div className="hidden sm:flex items-center gap-2 bg-[#141414] px-3 py-1.5 rounded-full text-[11px] mono text-[#22C55E]">
            <span>GEMINI LIVE</span>
          </div>
        )}
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import { LandingProject, ViewportMode } from '../types';

interface LandingBankProps {
  projects: LandingProject[];
  onDeleteProject: (id: string) => void;
  onSelectProjectForStudio: (project: LandingProject) => void;
}

export const LandingBank: React.FC<LandingBankProps> = ({
  projects,
  onDeleteProject,
  onSelectProjectForStudio
}) => {
  const [selectedId, setSelectedId] = useState<string>(projects[0]?.id || '');
  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [activeTab, setActiveTab] = useState<'preview' | 'prompt' | 'audit'>('preview');
  const [filterStack, setFilterStack] = useState<string>('Todos');

  const selectedProject = projects.find(p => p.id === selectedId) || projects[0];

  const filteredProjects = filterStack === 'Todos'
    ? projects
    : projects.filter(p => p.techStack.includes(filterStack) || p.ssotVector.layout === filterStack);

  const handleDownload = (project: LandingProject) => {
    const blob = new Blob([project.htmlCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (projects.length === 0) {
    return (
      <section className="mx-auto flex max-w-2xl flex-col gap-5 bg-[#141414] p-16 text-center">
        <h3 className="text-lg font-semibold text-[#F3F3F3]">
          Banco de Landing Pages vacío
        </h3>

        <p className="text-xs leading-relaxed text-[#A1A1A1]">
          Guarda una arquitectura desde el Studio para verla aquí.
        </p>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-[#141414]">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#F3F3F3]">
            Banco de Landing Pages Curadas
          </span>
          <span className="text-xs mono text-[#737373]">
            ({projects.length} registradas)
          </span>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {['Todos', 'Brutalismo Suizo', 'Asimetría Bauhaus', 'Proporción Áurea / Espiral Fibonacci', 'Tailwind CSS'].map(tag => (
            <button
              key={tag}
              onClick={() => setFilterStack(tag)}
              className={`px-3 py-1.5 text-xs whitespace-nowrap transition-colors ${
                filterStack === tag ? 'bg-[#282828] text-[#F3F3F3]' : 'bg-[#1F1F1F] text-[#737373] hover:text-[#A1A1A1]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Workspace Section */}
      <div className="flex flex-col lg:flex-row gap-8 items-start min-h-[640px]">
        {/* Left Column: List of Projects + Selected Project Metadata */}
        <div className="w-full lg:w-5/12 flex flex-col gap-6">
          {/* Scrollable Project Cards */}
          <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
            {filteredProjects.map(item => (
              <div
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`p-4 cursor-pointer transition-colors flex flex-col gap-2 ${
                  item.id === selectedProject?.id
                    ? 'bg-[#1F1F1F]'
                    : 'bg-[#141414] hover:bg-[#1A1A1A]'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-[#F3F3F3] tracking-tight line-clamp-1">
                    {item.title}
                  </span>
                  <span className="text-[11px] mono text-[#22C55E]">
                    {item.audit.scores.average} / 10
                  </span>
                </div>

                <p className="text-[11px] text-[#A1A1A1] line-clamp-1">
                  {item.valueProp}
                </p>

                <div className="flex items-center justify-between pt-1 text-[10px] mono text-[#737373]">
                  <span>{item.ssotVector.layout}</span>
                  <span>{item.techStack.slice(0, 2).join(', ')}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Project Full Metadata & Prompt Box */}
          {selectedProject && (
            <div className="p-6 bg-[#141414] flex flex-col gap-5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('prompt')}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                      activeTab === 'prompt' ? 'bg-[#282828] text-[#F3F3F3]' : 'bg-[#1F1F1F] text-[#737373] hover:text-[#A1A1A1]'
                    }`}
                  >
                    Prompt de Origen
                  </button>
                  <button
                    onClick={() => setActiveTab('audit')}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                      activeTab === 'audit' ? 'bg-[#282828] text-[#F3F3F3]' : 'bg-[#1F1F1F] text-[#737373] hover:text-[#A1A1A1]'
                    }`}
                  >
                    Ficha NoveltyBench
                  </button>
                </div>

                <button
                  onClick={() => onSelectProjectForStudio(selectedProject)}
                  className="text-xs text-[#F3F3F3] hover:underline mono"
                >
                  Abrir en Studio →
                </button>
              </div>

              {activeTab === 'prompt' ? (
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] mono text-[#737373]">
                    Semilla SSoT: <span className="text-[#F3F3F3]">{selectedProject.ssotVector.seed}</span>
                  </span>
                  <textarea
                    readOnly
                    value={selectedProject.prompts.masterPrompt}
                    rows={8}
                    className="w-full p-3 bg-[#0A0A0A] text-xs font-mono text-[#A1A1A1] resize-none focus:outline-none"
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-3 p-4 bg-[#0A0A0A] text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#737373]">Originalidad Visual:</span>
                    <span className="font-mono text-[#F3F3F3]">{selectedProject.audit.scores.distinctiveness}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#737373]">Usabilidad UX:</span>
                    <span className="font-mono text-[#F3F3F3]">{selectedProject.audit.scores.usabilityUx}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#737373]">Conversión CRO:</span>
                    <span className="font-mono text-[#F3F3F3]">{selectedProject.audit.scores.conversionCro}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#737373]">Fidelidad Stack:</span>
                    <span className="font-mono text-[#F3F3F3]">{selectedProject.audit.scores.stackFidelity}</span>
                  </div>
                  <div className="pt-3 text-[11px] text-[#A1A1A1]">
                    {selectedProject.audit.subtractiveDiagnosis}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => onDeleteProject(selectedProject.id)}
                  className="text-xs text-[#E06D53] hover:underline"
                >
                  Eliminar del Banco
                </button>
                <button
                  onClick={() => handleDownload(selectedProject)}
                  className="h-9 px-4 bg-[#F3F3F3] text-[#0A0A0A] text-xs font-medium hover:opacity-90"
                >
                  Descargar .html
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Sandbox Preview of Selected Item */}
        <div className="w-full lg:w-7/12 flex flex-col bg-[#141414] min-h-[640px]">
          {/* Top Bar for Sandbox */}
          <div className="px-6 py-4 bg-[#191919] flex items-center justify-between">
            <span className="text-xs font-medium text-[#F3F3F3] line-clamp-1">
              {selectedProject?.title || 'Previsualización'}
            </span>

            {/* Viewport Icons with Tooltip */}
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
          </div>

          {/* Iframe Viewport */}
          <div className="flex-1 bg-[#0A0A0A] p-6 flex items-center justify-center min-h-[540px]">
            {selectedProject ? (
              <div
                className={`${
                  viewport === 'mobile'
                    ? 'max-w-[375px]'
                    : viewport === 'tablet'
                    ? 'max-w-[768px]'
                    : 'w-full'
                } h-full min-h-[540px] bg-[#0A0A0A] flex flex-col transition-all duration-300`}
              >
                <iframe
                  title="Saved Landing Preview"
                  srcDoc={selectedProject.htmlCode}
                  sandbox="allow-scripts allow-same-origin"
                  className="w-full flex-1 min-h-[540px] bg-[#0A0A0A]"
                />
              </div>
            ) : (
              <span className="text-xs text-[#737373]">Selecciona un proyecto para previsualizar</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

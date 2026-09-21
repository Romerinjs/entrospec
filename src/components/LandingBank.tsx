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
      <div className="p-16 rounded-lg bg-[#141414] text-center flex flex-col items-center justify-center gap-4 max-w-2xl mx-auto">
        <span className="text-3xl">🏛️</span>
        <h3 className="text-lg font-semibold text-[#F3F3F3]">Banco de Landing Pages Vacío</h3>
        <p className="text-xs text-[#A1A1A1] leading-relaxed">
          Aún no has guardado ninguna landing page en el banco. Genera una arquitectura en el Studio y haz clic en &quot;+ Guardar en Banco&quot;.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-[#141414]">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#F3F3F3]">
            Banco de Landing Pages Curadas
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] mono bg-[#1F1F1F] text-[#22C55E]">
            {projects.length} Registradas
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['Todos', 'Brutalismo Suizo', 'Asimetría Bauhaus', 'Proporción Áurea / Espiral Fibonacci', 'Tailwind CSS'].map(tag => (
            <button
              key={tag}
              onClick={() => setFilterStack(tag)}
              className={`px-3 py-1 rounded-full text-[11px] whitespace-nowrap transition-colors ${
                filterStack === tag ? 'bg-[#282828] text-[#F3F3F3]' : 'text-[#737373] hover:text-[#A1A1A1]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Split-View Gallery Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[640px]">
        {/* Left Column: List of Projects + Selected Project Metadata (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Scrollable Project Cards */}
          <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
            {filteredProjects.map(item => (
              <div
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`p-4 rounded-md cursor-pointer transition-all flex flex-col gap-2 ${
                  item.id === selectedProject?.id
                    ? 'bg-[#1F1F1F]'
                    : 'bg-[#141414] hover:bg-[#1A1A1A]'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-[#F3F3F3] tracking-tight line-clamp-1">
                    {item.title}
                  </span>
                  <span className="text-[10px] mono px-2 py-0.5 rounded-sm bg-[#0A0A0A] text-[#22C55E]">
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
            <div className="p-5 rounded-lg bg-[#141414] flex flex-col gap-4 flex-1">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('prompt')}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      activeTab === 'prompt' ? 'bg-[#282828] text-[#F3F3F3]' : 'text-[#737373] hover:text-[#A1A1A1]'
                    }`}
                  >
                    Prompt de Origen
                  </button>
                  <button
                    onClick={() => setActiveTab('audit')}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      activeTab === 'audit' ? 'bg-[#282828] text-[#F3F3F3]' : 'text-[#737373] hover:text-[#A1A1A1]'
                    }`}
                  >
                    Ficha NoveltyBench
                  </button>
                </div>

                <button
                  onClick={() => onSelectProjectForStudio(selectedProject)}
                  className="text-xs text-[#22C55E] hover:underline mono"
                >
                  Abrir en Studio →
                </button>
              </div>

              {activeTab === 'prompt' ? (
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] mono text-[#737373]">
                    Semilla SSoT: <span className="text-[#22C55E]">{selectedProject.ssotVector.seed}</span>
                  </span>
                  <textarea
                    readOnly
                    value={selectedProject.prompts.masterPrompt}
                    rows={8}
                    className="w-full p-3 rounded-md bg-[#0A0A0A] text-xs font-mono text-[#A1A1A1] resize-none focus:outline-none"
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-3 p-3 rounded-md bg-[#0A0A0A] text-xs">
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
                  <div className="pt-2 text-[11px] text-[#A1A1A1] border-t border-[#191919]">
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
                  className="h-8 px-4 rounded-sm bg-[#F3F3F3] text-[#0A0A0A] text-xs font-medium hover:opacity-90"
                >
                  Descargar .html
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Sandbox Preview of Selected Item (7 cols) */}
        <div className="lg:col-span-7 flex flex-col rounded-lg bg-[#141414] overflow-hidden">
          {/* Top Bar for Sandbox */}
          <div className="px-5 py-3.5 bg-[#191919] flex items-center justify-between">
            <span className="text-xs font-medium text-[#F3F3F3] line-clamp-1">
              {selectedProject?.title || 'Previsualización'}
            </span>

            <div className="flex items-center gap-1 bg-[#141414] p-1 rounded-full">
              <button
                onClick={() => setViewport('desktop')}
                className={`px-3 py-1 rounded-full text-[11px] mono transition-colors ${
                  viewport === 'desktop' ? 'bg-[#282828] text-[#F3F3F3]' : 'text-[#737373]'
                }`}
              >
                Desktop
              </button>
              <button
                onClick={() => setViewport('tablet')}
                className={`px-3 py-1 rounded-full text-[11px] mono transition-colors ${
                  viewport === 'tablet' ? 'bg-[#282828] text-[#F3F3F3]' : 'text-[#737373]'
                }`}
              >
                Tablet
              </button>
              <button
                onClick={() => setViewport('mobile')}
                className={`px-3 py-1 rounded-full text-[11px] mono transition-colors ${
                  viewport === 'mobile' ? 'bg-[#282828] text-[#F3F3F3]' : 'text-[#737373]'
                }`}
              >
                Mobile
              </button>
            </div>
          </div>

          {/* Iframe Viewport */}
          <div className="flex-1 bg-[#0A0A0A] p-4 flex items-center justify-center min-h-[500px]">
            {selectedProject ? (
              <div
                className={`${
                  viewport === 'mobile'
                    ? 'max-w-[375px]'
                    : viewport === 'tablet'
                    ? 'max-w-[768px]'
                    : 'w-full'
                } h-full min-h-[500px] rounded-md overflow-hidden bg-[#0D0D0D] shadow-2xl flex flex-col transition-all duration-300`}
              >
                <iframe
                  title="Saved Landing Preview"
                  srcDoc={selectedProject.htmlCode}
                  sandbox="allow-scripts allow-same-origin"
                  className="w-full flex-1 min-h-[500px] bg-[#0A0A0A]"
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

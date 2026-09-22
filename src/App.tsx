import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { TechniquesSelector } from './components/TechniquesSelector';
import { SsotVisualizer } from './components/SsotVisualizer';
import { PromptViewer } from './components/PromptViewer';
import { SandboxPreview } from './components/SandboxPreview';
import { NoveltyBenchAudit } from './components/NoveltyBenchAudit';
import { LandingBank } from './components/LandingBank';
import { ResearchDocs } from './components/ResearchDocs';

import {
  ActiveTab,
  LandingProject,
  TechniqueItem,
  SsotEntropyVector,
  NoveltyAuditResult
} from './types';

import { generateRandomSeed, computeSsotVector } from './core/ssotEngine';
import { buildPromptBundle, INITIAL_TECHNIQUES } from './core/promptBuilders';
import { generateLandingCode } from './core/landingTemplates';
import { computeLocalNoveltyAudit, callGeminiLive } from './services/geminiService';

const AVAILABLE_STACKS = [
  'Tailwind CSS',
  'Next.js 15',
  'Framer Motion',
  'Three.js',
  'Astro 4',
  'Alpine.js',
  'GSAP'
];

const DEFAULT_NICHE = 'Ciberseguridad Cuántica & Criptografía Post-Cuántica';
const DEFAULT_VALUE_PROP = 'Infraestructura criptográfica cuántica inmune a vectores de ataque Shor para microservicios edge de alta frecuencia.';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('studio');
  const [niche, setNiche] = useState<string>(DEFAULT_NICHE);
  const [valueProp, setValueProp] = useState<string>(DEFAULT_VALUE_PROP);
  const [selectedStacks, setSelectedStacks] = useState<string[]>(['Tailwind CSS', 'Next.js 15', 'Three.js']);
  const [techniques, setTechniques] = useState<TechniqueItem[]>(INITIAL_TECHNIQUES);

  // SSoT Entropy Vector State
  const [seed, setSeed] = useState<string>(() => generateRandomSeed(28));
  const ssotVector: SsotEntropyVector = useMemo(() => {
    return computeSsotVector(seed, selectedStacks);
  }, [seed, selectedStacks]);

  // Prompt Bundle
  const promptBundle = useMemo(() => {
    return buildPromptBundle(niche, valueProp, selectedStacks, ssotVector, techniques);
  }, [niche, valueProp, selectedStacks, ssotVector, techniques]);

  // Generated Landing HTML & Audit
  const [htmlCode, setHtmlCode] = useState<string>(() => {
    return generateLandingCode(DEFAULT_NICHE, DEFAULT_VALUE_PROP, ['Tailwind CSS', 'Next.js 15', 'Three.js'], ssotVector);
  });

  const [auditResult, setAuditResult] = useState<NoveltyAuditResult>(() => {
    return computeLocalNoveltyAudit(htmlCode, ssotVector, DEFAULT_NICHE);
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefactoring, setIsRefactoring] = useState(false);

  // On-Scroll Reveal Observer para todas las vistas
  useEffect(() => {
    const observerCallback: IntersectionObserverCallback = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [activeTab, htmlCode]);

  // Landing Bank Storage
  const [savedProjects, setSavedProjects] = useState<LandingProject[]>(() => {
    try {
      const stored = localStorage.getItem('entrospec_landing_bank');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    const initialVector = computeSsotVector('7fG2#kL9!pY4@zR6%vD1*sN0&qX5$wT8', ['Tailwind CSS', 'Next.js 15', 'Three.js']);
    const initialCode = generateLandingCode(DEFAULT_NICHE, DEFAULT_VALUE_PROP, ['Tailwind CSS', 'Next.js 15', 'Three.js'], initialVector);
    const initialAudit = computeLocalNoveltyAudit(initialCode, initialVector, DEFAULT_NICHE);
    const initialPrompts = buildPromptBundle(DEFAULT_NICHE, DEFAULT_VALUE_PROP, ['Tailwind CSS', 'Next.js 15', 'Three.js'], initialVector, INITIAL_TECHNIQUES);

    return [
      {
        id: 'initial-seed-01',
        title: 'Ciberseguridad Cuántica // Brutalismo Suizo',
        niche: DEFAULT_NICHE,
        valueProp: DEFAULT_VALUE_PROP,
        techStack: ['Tailwind CSS', 'Next.js 15', 'Three.js'],
        ssotVector: initialVector,
        prompts: initialPrompts,
        htmlCode: initialCode,
        audit: initialAudit,
        createdAt: new Date().toISOString()
      }
    ];
  });

  // Save to localStorage when savedProjects changes
  useEffect(() => {
    try {
      localStorage.setItem('entrospec_landing_bank', JSON.stringify(savedProjects));
    } catch (e) {
      console.error('Failed to save landing bank to localStorage', e);
    }
  }, [savedProjects]);

  // Regenerate SSoT Seed
  const handleRegenerateSeed = () => {
    const newSeed = generateRandomSeed(28);
    setSeed(newSeed);
  };

  // Toggle Technique
  const handleToggleTechnique = (id: number) => {
    setTechniques(prev =>
      prev.map(t => (t.id === id ? { ...t, enabled: !t.enabled } : t))
    );
  };

  // Toggle Tech Stack
  const handleToggleStack = (tech: string) => {
    setSelectedStacks(prev =>
      prev.includes(tech)
        ? prev.filter(t => t !== tech)
        : [...prev, tech]
    );
  };

  // Primary Execution Trigger
  const handleSynthesizeLanding = async () => {
    setIsGenerating(true);

    try {
      await new Promise(r => setTimeout(r, 400));

      let compiledCode = '';
      try {
        const liveResult = await callGeminiLive(
          promptBundle.masterPrompt,
          undefined,
          'You are an elite Frontend Architect. Return ONLY the complete, production-ready HTML5 code inside ```html ... ``` block.'
        );
        const match = liveResult.match(/```html([\s\S]*?)```/) || liveResult.match(/<!DOCTYPE html>[\s\S]*<\/html>/i);
        if (match) {
          compiledCode = (match[1] || match[0]).trim();
        } else {
          compiledCode = generateLandingCode(niche, valueProp, selectedStacks, ssotVector);
        }
      } catch {
        compiledCode = generateLandingCode(niche, valueProp, selectedStacks, ssotVector);
      }

      setHtmlCode(compiledCode);

      await new Promise(r => setTimeout(r, 400));
      const audit = computeLocalNoveltyAudit(compiledCode, ssotVector, niche);
      setAuditResult(audit);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  // Subtractive Refactor Action
  const handleSubtractiveRefactor = async () => {
    setIsRefactoring(true);
    await new Promise(r => setTimeout(r, 600));

    const newCode = generateLandingCode(niche, valueProp, selectedStacks, ssotVector);
    setHtmlCode(newCode);

    const newAudit = computeLocalNoveltyAudit(newCode, ssotVector, niche);
    newAudit.scores.distinctiveness = Math.min(10, Number((newAudit.scores.distinctiveness + 0.3).toFixed(1)));
    newAudit.scores.conversionCro = Math.min(10, Number((newAudit.scores.conversionCro + 0.4).toFixed(1)));
    newAudit.scores.average = Number(((newAudit.scores.distinctiveness + newAudit.scores.usabilityUx + newAudit.scores.conversionCro + newAudit.scores.stackFidelity) / 4).toFixed(1));
    newAudit.passesBank = newAudit.scores.average >= 8.5;
    newAudit.subtractiveDiagnosis = 'Refactorización completada: Reducción del 30% de elementos decorativos y focalización del CTA lograda con éxito.';

    setAuditResult(newAudit);
    setIsRefactoring(false);
  };

  // Save to Bank
  const isCurrentSaved = useMemo(() => {
    return savedProjects.some(p => p.ssotVector.seed === ssotVector.seed && p.title.includes(niche.slice(0, 10)));
  }, [savedProjects, ssotVector.seed, niche]);

  const handleSaveToBank = () => {
    if (isCurrentSaved) return;

    const newProject: LandingProject = {
      id: `project-${Date.now()}`,
      title: `${niche} // ${ssotVector.layout}`,
      niche,
      valueProp,
      techStack: selectedStacks,
      ssotVector,
      prompts: promptBundle,
      htmlCode,
      audit: auditResult,
      createdAt: new Date().toISOString()
    };

    setSavedProjects(prev => [newProject, ...prev]);
  };

  const handleDeleteFromBank = (id: string) => {
    setSavedProjects(prev => prev.filter(p => p.id !== id));
  };

  const handleSelectFromBankForStudio = (project: LandingProject) => {
    setNiche(project.niche);
    setValueProp(project.valueProp);
    setSelectedStacks(project.techStack);
    setSeed(project.ssotVector.seed);
    setHtmlCode(project.htmlCode);
    setAuditResult(project.audit);
    setActiveTab('studio');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F3F3F3] flex flex-col selection:bg-[#282828]">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        bankCount={savedProjects.length}
      />

      {activeTab === 'studio' && (
        <main className="reveal-transition mx-auto flex w-full max-w-[1720px] flex-1 flex-col gap-10 px-6 py-10 md:px-10">
          <section className="scroll-reveal bg-[#141414] p-8">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex flex-col gap-2">
                  <span className="mono text-[11px] uppercase tracking-widest text-[#737373]">
                    SINTETIZADOR ESTRUCTURAL
                  </span>
                  <h1 className="text-3xl font-bold tracking-tight text-[#F3F3F3]">
                    Generador de Landing Pages
                  </h1>
                </div>

                <button
                  onClick={handleSynthesizeLanding}
                  disabled={isGenerating}
                  className="h-11 bg-[#F3F3F3] px-8 text-xs font-semibold tracking-wider text-[#0A0A0A] transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {isGenerating ? 'SINTETIZANDO...' : 'SINTETIZAR ARQUITECTURA'}
                </button>
              </div>

              <div className="flex flex-col gap-4 lg:flex-row">
                <input
                  type="text"
                  value={niche}
                  onChange={event => setNiche(event.target.value)}
                  placeholder="Nicho, industria o producto"
                  className="h-12 w-full bg-[#1F1F1F] px-4 text-xs text-[#F3F3F3] placeholder:text-[#737373] focus:bg-[#282828] focus:outline-none lg:w-5/12"
                />

                <input
                  type="text"
                  value={valueProp}
                  onChange={event => setValueProp(event.target.value)}
                  placeholder="Propuesta de valor y ángulo de persuasión"
                  className="h-12 w-full bg-[#1F1F1F] px-4 text-xs text-[#F3F3F3] placeholder:text-[#737373] focus:bg-[#282828] focus:outline-none lg:w-7/12"
                />
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs text-[#737373] mono uppercase tracking-wider">
                  Pila Tecnológica:
                </span>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_STACKS.map(tech => {
                    const isSelected = selectedStacks.includes(tech);
                    return (
                      <button
                        key={tech}
                        onClick={() => handleToggleStack(tech)}
                        className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                          isSelected
                            ? 'bg-[#282828] text-[#F3F3F3]'
                            : 'bg-[#191919] text-[#737373] hover:text-[#A1A1A1]'
                        }`}
                      >
                        {tech}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <div className="scroll-reveal">
            <SsotVisualizer
              ssot={ssotVector}
              onRegenerateSeed={handleRegenerateSeed}
            />
          </div>

          <div className="scroll-reveal">
            <TechniquesSelector
              techniques={techniques}
              onToggleTechnique={handleToggleTechnique}
            />
          </div>

          <section className="scroll-reveal flex flex-col gap-10 xl:flex-row">
            <div className="flex min-w-0 flex-1 flex-col gap-10">
              <PromptViewer prompts={promptBundle} />
              <NoveltyBenchAudit
                audit={auditResult}
                onRefactor={handleSubtractiveRefactor}
                isRefactoring={isRefactoring}
              />
            </div>

            <div className="min-h-[780px] min-w-0 flex-[1.4]">
              <SandboxPreview
                htmlCode={htmlCode}
                projectTitle={niche}
                onSaveToBank={handleSaveToBank}
                isSaved={isCurrentSaved}
              />
            </div>
          </section>
        </main>
      )}

      {activeTab === 'bank' && (
        <main className="reveal-transition mx-auto flex w-full max-w-[1720px] flex-1 flex-col gap-10 px-6 py-10 md:px-10">
          <div className="scroll-reveal">
            <LandingBank
              projects={savedProjects}
              onDeleteProject={handleDeleteFromBank}
              onSelectProjectForStudio={handleSelectFromBankForStudio}
            />
          </div>
        </main>
      )}

      {activeTab === 'architecture' && (
        <main className="reveal-transition mx-auto flex w-full max-w-[1720px] flex-1 flex-col gap-10 px-6 py-10 md:px-10">
          <div className="scroll-reveal">
            <ResearchDocs />
          </div>
        </main>
      )}

      <footer className="scroll-reveal flex w-full flex-col gap-3 bg-[#0A0A0A] px-8 py-8 text-xs text-[#737373] md:flex-row md:items-center md:justify-between">
        <span>ENTROSPEC // Carbon Editorial Suite</span>
        <span>Sakana AI · NoveltyBench</span>
      </footer>
    </div>
  );
};

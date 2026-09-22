import React from 'react';
import type { GenerationStage } from '../generation/types';
const labels: Record<GenerationStage, string> = { idle: 'Listo', building_prompt: 'Construyendo prompt', generating_blueprint: 'Interpretando marca', validating_blueprint: 'Validando blueprint', generating_visual: 'Resolviendo visual', compiling: 'Compilando HTML5', auditing: 'Auditando técnicas', complete: 'Completado', failed: 'Requiere atención' };
export const GenerationProgress: React.FC<{ stage: GenerationStage; error?: string }> = ({ stage, error }) => <div aria-live="polite" className="bg-[#141414] px-5 py-4 text-xs"><span className="mono text-[#A1A1A1]">{labels[stage]}</span>{error && <p className="mt-2 text-[#E06D53]">{error}</p>}</div>;

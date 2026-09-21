export type GridStyle = 
  | 'Brutalismo Suizo' 
  | 'Asimetría Bauhaus' 
  | 'Proporción Áurea / Espiral Fibonacci' 
  | 'Editorial Años 70' 
  | 'Retícula Dinámica Rota';

export interface ColorPalette {
  name: string;
  background: string;
  surface: string;
  accent: string;
  textPrimary: string;
  textSecondary: string;
  description: string;
}

export interface ChunkMapping {
  chunkIndex: number;
  rawString: string;
  asciiSum: number;
  modResult: number;
  label: string;
  mappedValue: string;
  details: string;
}

export interface SsotEntropyVector {
  seed: string;
  length: number;
  chunks: ChunkMapping[];
  layout: GridStyle;
  palette: ColorPalette;
  stackBehavior: string;
  heroFocus: string;
  psychologyAngle: string;
}

export interface TechniqueItem {
  id: number;
  title: string;
  phase: 'Descubrir' | 'Definir' | 'Entregar';
  description: string;
  riskMitigated: string;
  enabled: boolean;
  directive: string;
}

export interface PromptMasterBundle {
  masterPrompt: string;
  imagePrompt: string;
  videoPrompt: string;
  negativeConstraints: string[];
  subtractiveChecklist: string[];
}

export interface NoveltyScores {
  distinctiveness: number;     // 1.0 - 10.0 (Originalidad visual)
  usabilityUx: number;         // 1.0 - 10.0 (Fricción / Escaneo <3s)
  conversionCro: number;       // 1.0 - 10.0 (Persuasión / Inoculación)
  stackFidelity: number;       // 1.0 - 10.0 (Limpieza y aprovechamiento)
  average: number;             // Promedio ponderado
}

export interface NoveltyAuditResult {
  passesBank: boolean;         // Average >= 8.5
  scores: NoveltyScores;
  subtractiveDiagnosis: string;
  strengths: string[];
  refactorSuggested: string;
  rawJson?: string;
}

export interface LandingProject {
  id: string;
  title: string;
  niche: string;
  valueProp: string;
  techStack: string[];
  ssotVector: SsotEntropyVector;
  prompts: PromptMasterBundle;
  htmlCode: string;
  audit: NoveltyAuditResult;
  createdAt: string;
}

export type ViewportMode = 'desktop' | 'tablet' | 'mobile';

export type ActiveTab = 'studio' | 'bank' | 'architecture';

import { SsotEntropyVector, PromptMasterBundle, TechniqueItem } from '../types';

export const INITIAL_TECHNIQUES: TechniqueItem[] = [
  {
    id: 1,
    title: 'Cadenas Semilla (SSoT / Seed Strings)',
    phase: 'Descubrir',
    description: 'Ancla la red neuronal a una semilla de alta entropía para evitar la convergencia en Bento grids y degradados morados.',
    riskMitigated: 'Convergencia visual genérica y promedio estadístico.',
    enabled: true,
    directive: 'Forzar descomposición SSoT con 4 chunks matemáticos (Sum-Mod) para retícula, paleta, stack y psicología.'
  },
  {
    id: 2,
    title: 'Prompts Ambiciosos y Persuasión Profunda',
    phase: 'Descubrir',
    description: 'Define la psicología del usuario, nivel de sofisticación del mercado y el marco de inoculación de objeciones.',
    riskMitigated: 'Superficialidad en la propuesta y copy anémico.',
    enabled: true,
    directive: 'Estructurar el copy bajo inoculación de objeciones previas y eliminación de ansiedad de conversión.'
  },
  {
    id: 3,
    title: 'Bucle Creator-Critic (Subagentes Evaluadores)',
    phase: 'Definir',
    description: 'Auditoría en 4 dimensiones NoveltyBench (Distinctiveness, UX, CRO, Stack) con corte de admisión >= 8.5.',
    riskMitigated: 'Errores de UX, alucinaciones y mala arquitectura de conversión.',
    enabled: true,
    directive: 'Auditar código y rechazar o refactorizar si el promedio no supera 8.5/10.'
  },
  {
    id: 4,
    title: 'Activos de Imagen Generativa (Macro & Texturas)',
    phase: 'Entregar',
    description: 'Genera prompts específicos para Midjourney/DALL-E 3 enfocados en texturas macro, iluminación de estudio y cero stock falso.',
    riskMitigated: 'Uso de fotografía de stock impersonal y rostros de plástico.',
    enabled: true,
    directive: 'Prompt de imagen macro 100mm, iluminación suave de estudio y paleta monocromática coherente.'
  },
  {
    id: 5,
    title: 'Activos de Vídeo & Motion Design',
    phase: 'Entregar',
    description: 'Prompts para generadores de vídeo (Runway/Luma) o canvas CSS que guíen la mirada hacia el botón principal.',
    riskMitigated: 'Rebote acelerado por falta de gratificación visual dinámica.',
    enabled: true,
    directive: 'Micro-movimiento perpétuo en canvas o video cinemático fluido sin distracción cognitiva.'
  },
  {
    id: 6,
    title: 'Diseño Sustractivo (-30% Ruido Decorativo)',
    phase: 'Definir',
    description: 'Audita y elimina el 30% de elementos decorativos innecesarios para alcanzar pureza funcional.',
    riskMitigated: 'Sobrecarga cognitiva del usuario y horror vacui de la IA.',
    enabled: true,
    directive: 'Eliminar tarjetas redundantes, bordes de 1px y elementos que no empujen al usuario hacia el CTA.'
  },
  {
    id: 7,
    title: 'Restricciones Negativas Severas (Anti-AI)',
    phase: 'Entregar',
    description: 'Prohíbe palabras cliché ("revolucionario", "unlock", "ecosistema", "delve") y artefactos visuales de IA.',
    riskMitigated: 'Percepción de contenido artificial y desconfianza del usuario.',
    enabled: true,
    directive: 'Prohibir emojis, badges de IA, bordes de división, degradados neón y vocabulario corporativo vacío.'
  },
  {
    id: 8,
    title: 'Arquitectura Limpia y Micro-copy Humano',
    phase: 'Entregar',
    description: 'Reescribe los botones y navegación con micro-copy de beneficio inmediato ("Prueba en 30 segundos").',
    riskMitigated: 'Tono robótico, pasivo y desconexión emocional.',
    enabled: true,
    directive: 'Micro-copy directo, humano y conversacional con foco en beneficio sobre característica.'
  }
];

export function buildPromptBundle(
  niche: string,
  valueProp: string,
  techStack: string[],
  ssot: SsotEntropyVector,
  techniques: TechniqueItem[]
): PromptMasterBundle {
  const enabledTechniques = techniques.filter(t => t.enabled).map(t => `- ${t.title}: ${t.directive}`).join('\n');

  const negativeRules = [
    '0px Borders: Prohibido usar border, border-*, outline o divide-* (la jerarquía es solo contraste tonal de superficies).',
    'Cero Bento Grids o tarjetas rectangulares idénticas de 3 columnas.',
    'Cero degradados púrpuras, violetas o cianes neón cliché de IA.',
    'Cero palabras artificiales en el copy: "revolucionario", "potenciar", "ecosistema", "unlock", "delve", "seamless".',
    'Cero emojis decorativos (✨, 🚀) o badges que digan "Powered by AI".',
    'Cero telemetría ornamental o círculos parpadeantes de estado falso.'
  ];

  const subtractiveChecklist = [
    'Eliminar el 30% de elementos decorativos redundantes.',
    'Foco monolítico en el Hero y el botón de acción principal.',
    'Espaciado negativo generoso (px-8 py-10) en lugar de cajas divisorias.',
    'Tipografía Hanken Grotesk con tracking cerrado en títulos y espaciado de lectura limpio.'
  ];

  const imagePrompt = `Fotografía macro conceptual para fondo/hero de landing page de ${niche}. Estilo: Iluminación de estudio difusa, textura mate con sutil refracción en cristal esmerilado y titanio anodizado, paleta ${ssot.palette.name} (${ssot.palette.accent} sobre ${ssot.palette.background}). Sin personas genéricas ni interfaces flotantes falsas. Lente 100mm macro, apertura f/2.8, profundidad de campo selectiva, 8k resolution.`;

  const videoPrompt = `Secuencia cinemática de 5 segundos en cámara lenta fluida para fondo dinámico de ${niche}. Elementos geométricos abstractos moviéndose en un vacío arquitectónico oscuro (${ssot.palette.background}), iluminación rasante sutil en tonos ${ssot.palette.accent}. Movimiento estabilizado, sin cortes bruscos ni textos. Propósito: Motion design hipnótico para guiar la atención hacia el CTA.`;

  const masterPrompt = `### PROMPT MAESTRO DE ARQUITECTURA FRONTEND — SUITE ENTROSPEC (SSoT + DAG)

**Rol:** Eres un Lead Frontend Engineer y Diseñador de Interacción de Élite. Tu objetivo es compilar una Landing Page completamente funcional, responsiva y visualmente única en un solo bloque estructurado de código.

---
### 1. Vector de Entropía SSoT (Sakana AI ICLR 2026 / DAG Sampling)
- **Semilla Generada:** \`${ssot.seed}\` (Longitud: ${ssot.length} caracteres)
- **Retícula & Composición (Chunk 1):** ${ssot.layout}
- **Paleta Cromática (Chunk 2):** ${ssot.palette.name} (Fondo: \`${ssot.palette.background}\`, Superficie: \`${ssot.palette.surface}\`, Acento: \`${ssot.palette.accent}\`, Texto Primario: \`${ssot.palette.textPrimary}\`, Secundario: \`${ssot.palette.textSecondary}\`)
- **Pila Tecnológica (Chunk 3):** ${ssot.stackBehavior}
- **Foco del Hero & Persuasión (Chunk 4):** ${ssot.heroFocus} // Ángulo psicológico: ${ssot.psychologyAngle}

---
### 2. Entradas del Proyecto
- **Nicho / Industria:** ${niche}
- **Propuesta de Valor:** ${valueProp}
- **Tecnologías Seleccionadas:** ${techStack.join(', ')}

---
### 3. Directivas de las 8 Técnicas Avanzadas Activas
${enabledTechniques}

---
### 4. Directiva de Diseño Sustractivo (Regla del -30%)
- Audita la estructura: elimina el 30% de elementos meramente decorativos.
- No agregues cajas ni tarjetas innecesarias. La jerarquía se expresa mediante tipografía monolítica y contraste tonal.
- Micro-copy de conversión: Reemplaza botones genéricos ("Enviar", "Saber más") por llamadas directas orientadas al alivio y beneficio inmediato (ej. "Empieza en 30 segundos", "Ver demostración en vivo").

---
### 5. Restricciones Negativas Severas (Anti-AI Slop)
${negativeRules.map(r => `- ${r}`).join('\n')}

---
### 6. Activos Visuales Requeridos
- **Prompt de Imagen Hero:** "${imagePrompt}"
- **Prompt de Vídeo / Motion:** "${videoPrompt}"

---
### 7. Formato de Entrega
Entrega únicamente el bloque final de código HTML5 semántico con Tailwind CSS CDN (v3.4) y scripts funcionales (interactividad de tabs, cálculo o canvas) dentro de un bloque \`\`\`html ... \`\`\`, completamente renderizable en el sandbox.`;

  return {
    masterPrompt,
    imagePrompt,
    videoPrompt,
    negativeConstraints: negativeRules,
    subtractiveChecklist
  };
}

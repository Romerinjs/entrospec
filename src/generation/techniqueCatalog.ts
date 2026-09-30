export interface TechniqueVariation {
  id: 1 | 2 | 3;
  type: 'direct' | 'persuasion' | 'editorial';
  label: string;
  angle: string;
  directiveAddition: string;
}

export interface TechniqueDefinition {
  id: number;
  title: string;
  directive: string;
  requiredEvidence: string;
  validatorKey: string;
  promptDirectives: string[];
  auditRules: string[];
  compatibleModes: Array<'ai_native_html' | 'procedural' | 'full' | 'seed_only' | 'combined_techniques'>;
  variations: [TechniqueVariation, TechniqueVariation, TechniqueVariation];
}

export const TECHNIQUE_CATALOG: readonly TechniqueDefinition[] = [
  {
    id: 1,
    title: 'SSoT',
    directive: 'Derivar composición, color, interacción y psicología desde cuatro chunks de la semilla.',
    requiredEvidence: 'Semilla, chunks y decisiones derivadas.',
    validatorKey: 'ssot',
    promptDirectives: ['Derivar composición, color, interacción y psicología desde cuatro chunks de la semilla.'], auditRules: ['Registrar semilla y decisiones derivadas.'], compatibleModes: ['procedural', 'full', 'seed_only', 'combined_techniques'],
    variations: [
      { id: 1, type: 'direct', label: 'SSoT Directo', angle: 'Mapeo estricto 1:1 sin ruido decorativo', directiveAddition: 'Mapear cada chunk con rigor exacto; evitar cualquier interpolación decorativa arbitraria.' },
      { id: 2, type: 'persuasion', label: 'SSoT Persuasivo', angle: 'Alineación de chunks con psicología de compra', directiveAddition: 'Utilizar el chunk 4 de psicología para enfocar el Hero en resolver la objeción clave del usuario.' },
      { id: 3, type: 'editorial', label: 'SSoT Editorial', angle: 'Retícula brutalista asimétrica con tensión', directiveAddition: 'Aplicar retícula asimétrica y ritmo de scroll derivado matemáticamente de Sum-Mod Theorem 4.2.' }
    ]
  },
  {
    id: 2,
    title: 'Persuasión profunda',
    directive: 'Explicar audiencia, sofisticación de mercado y objeciones antes del CTA.',
    requiredEvidence: 'Audiencia, objeción y respuesta visible.',
    validatorKey: 'persuasion',
    promptDirectives: ['Explicar audiencia, sofisticación de mercado y objeciones antes del CTA.'], auditRules: ['Verificar objeción y respuesta visibles.'], compatibleModes: ['ai_native_html', 'procedural', 'full', 'seed_only', 'combined_techniques'],
    variations: [
      { id: 1, type: 'direct', label: 'Persuasión Directa', angle: 'Refutación inmediata en el Hero', directiveAddition: 'Enunciar la objeción principal en una sola frase concisa y resolverla en el subtítulo del Hero.' },
      { id: 2, type: 'persuasion', label: 'Inoculación Analítica', angle: 'Desglose de 3 niveles de escepticismo', directiveAddition: 'Inocular metódicamente las 3 dudas más críticas de la audiencia antes de presentar el CTA.' },
      { id: 3, type: 'editorial', label: 'Contraste Editorial', angle: 'Oposición frente al status quo', directiveAddition: 'Construir contraste tonal entre las soluciones promedio del mercado y el rigor verificable de la propuesta.' }
    ]
  },
  {
    id: 3,
    title: 'Creator-Critic',
    directive: 'Exponer auditoría local con cuatro dimensiones y diagnóstico accionable.',
    requiredEvidence: 'Puntuación y checks reproducibles.',
    validatorKey: 'audit',
    promptDirectives: ['Mantener legibilidad, accesibilidad y fidelidad al stack nativo.'], auditRules: ['Ejecutar auditoría local sobre el documento renderizado.'], compatibleModes: ['ai_native_html', 'procedural', 'full', 'seed_only', 'combined_techniques'],
    variations: [
      { id: 1, type: 'direct', label: 'Auditoría CRO', angle: 'Fricción cero y escaneo en <3 segundos', directiveAddition: 'Optimizar la arquitectura para comprensión instantánea del valor en menos de 3 segundos.' },
      { id: 2, type: 'persuasion', label: 'Auditoría de Confianza', angle: 'Comprobación de garantías y señales de certeza', directiveAddition: 'Validar que cada sección aporte al menos una prueba tangible y elimine ansiedad.' },
      { id: 3, type: 'editorial', label: 'Internal Technique Score 4D', angle: 'Ruptura radical del promedio estadístico', directiveAddition: 'Exigir originalidad visual estricta y stack nativo limpio sin dependencias superfluas.' }
    ]
  },
  {
    id: 4,
    title: 'Imagen generativa',
    directive: 'Crear un hero visual coherente o declarar respaldo procedural.',
    requiredEvidence: 'Provenance del activo y prompt visual.',
    validatorKey: 'image',
    promptDirectives: ['Usar un activo visual de acuerdo con la selección del usuario.'], auditRules: ['Reportar provenance del activo.'], compatibleModes: ['ai_native_html', 'procedural', 'full', 'combined_techniques'],
    variations: [
      { id: 1, type: 'direct', label: 'Macro Textura Minimal', angle: 'Superficie táctil sobria sin distracciones', directiveAddition: 'Prompt visual enfocado en texturas arquitectónicas sobrias y materiales honestos.' },
      { id: 2, type: 'persuasion', label: 'Contexto de Precisión', angle: 'Ambiente de trabajo y rigor operativo', directiveAddition: 'Prompt visual que sitúe el concepto en un entorno de ingeniería y decisiones verificables.' },
      { id: 3, type: 'editorial', label: 'Claroscuro Monocromo', angle: 'Iluminación dramática sobre negro carbón', directiveAddition: 'Prompt visual con iluminación de estudio lateral sobre carbón profundo (#0A0A0A).' }
    ]
  },
  {
    id: 5,
    title: 'Motion',
    directive: 'Usar una interacción con propósito y respetar movimiento reducido.',
    requiredEvidence: 'Interacción y regla reduced-motion.',
    validatorKey: 'motion',
    promptDirectives: ['Usar interacción con propósito y respetar movimiento reducido.'], auditRules: ['Buscar interacción y prefers-reduced-motion.'], compatibleModes: ['ai_native_html', 'procedural', 'full', 'seed_only', 'combined_techniques'],
    variations: [
      { id: 1, type: 'direct', label: 'Foco en Acción', angle: 'Transición sutil guiada hacia el CTA', directiveAddition: 'Interacción discreta que conduce visualmente la vista del lector directamente al CTA principal.' },
      { id: 2, type: 'persuasion', label: 'Revelación Guiada', angle: 'Secuencia progresiva que sostiene lectura', directiveAddition: 'Revelación secuencial suave del contenido conforme el usuario hace scroll analítico.' },
      { id: 3, type: 'editorial', label: 'Cinemática Orgánica', angle: 'Flujo fluido continuo con respeto a accesibilidad', directiveAddition: 'Animación CSS nativa fluida de alta elegancia con desactivación completa bajo prefers-reduced-motion.' }
    ]
  },
  {
    id: 6,
    title: 'Diseño sustractivo',
    directive: 'Eliminar ruido decorativo y preservar foco en valor y CTA.',
    requiredEvidence: 'Diagnóstico de densidad y foco.',
    validatorKey: 'subtractive',
    promptDirectives: ['Eliminar ruido visual y preservar foco en valor y CTA.'], auditRules: ['Auditar elementos irrelevantes y densidad.'], compatibleModes: ['ai_native_html', 'procedural', 'full', 'seed_only', 'combined_techniques'],
    variations: [
      { id: 1, type: 'direct', label: 'Sustracción Radical (40%)', angle: 'Solo tipografía esencial sobre carbón', directiveAddition: 'Eliminar cualquier contenedor accesorio; dejar únicamente la promesa, prueba y acción.' },
      { id: 2, type: 'persuasion', label: 'Filtro de Relevancia', angle: 'Cero elementos que no respondan a dudas', directiveAddition: 'Purgar todo elemento gráfico que no aporte evidencia directa a la decisión del visitante.' },
      { id: 3, type: 'editorial', label: 'Respiro Asimétrico', angle: 'Espacio negativo generoso y balance tonal', directiveAddition: 'Permitir respiración generosa al layout con márgenes amplios y contraste de superficies.' }
    ]
  },
  {
    id: 7,
    title: 'Restricciones anti-slop',
    directive: 'Bloquear clichés visuales, vocabulario vacío y dependencias externas.',
    requiredEvidence: 'Escaneo negativo sin bloqueos.',
    validatorKey: 'antiSlop',
    promptDirectives: ['Evitar clichés visuales, vocabulario vacío y dependencias externas.'], auditRules: ['Buscar dependencias remotas y clichés declarados.'], compatibleModes: ['ai_native_html', 'procedural', 'full', 'seed_only', 'combined_techniques'],
    variations: [
      { id: 1, type: 'direct', label: 'Anti-Jerga Corporativa', angle: 'Prohibición estricta de palabras infladas', directiveAddition: 'Bloquear terminantemente adjetivos grandilocuentes; usar lenguaje sobrio y directo.' },
      { id: 2, type: 'persuasion', label: 'Prueba sobre Promesa', angle: 'Sustituir adjetivos por métricas reales', directiveAddition: 'Reemplazar cada promesa vaga por una afirmación verificable y cuantificada.' },
      { id: 3, type: 'editorial', label: 'Anti-Bento & Anti-Purple', angle: 'Cero cuadrículas predecibles y degradados clónicos', directiveAddition: 'Estructura editorial sin bento grids clónicos ni degradados cian/púrpura de IA genérica.' }
    ]
  },
  {
    id: 8,
    title: 'Microcopy humano',
    directive: 'Usar copy directo, legible y orientado a una acción concreta.',
    requiredEvidence: 'CTA con acción y beneficio.',
    validatorKey: 'humanCopy',
    promptDirectives: ['Usar copy directo, legible y orientado a una acción concreta.'], auditRules: ['Verificar CTA con acción concreta.'], compatibleModes: ['ai_native_html', 'procedural', 'full', 'seed_only', 'combined_techniques'],
    variations: [
      { id: 1, type: 'direct', label: 'Beneficio en 3 Segundos', angle: 'Acción inmediata sin fricción', directiveAddition: 'Redactar el CTA con acción y beneficio en 4 palabras exactas.' },
      { id: 2, type: 'persuasion', label: 'Alivio de Ansiedad', angle: 'Microcopy tranquilizador junto al botón', directiveAddition: 'Incluir micro-línea explicativa junto al CTA que disuelva cualquier riesgo o fricción de entrada.' },
      { id: 3, type: 'editorial', label: 'Tono Colega a Colega', angle: 'Trato profesional entre pares sin marketing barato', directiveAddition: 'Voz respetuosa de arquitecto senior hablando con pares de producto.' }
    ]
  }
];

export function getTechniqueDefinition(id: number): TechniqueDefinition | undefined {
  return TECHNIQUE_CATALOG.find(item => item.id === id);
}

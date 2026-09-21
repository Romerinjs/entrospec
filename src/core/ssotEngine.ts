import { SsotEntropyVector, GridStyle, ColorPalette, ChunkMapping } from '../types';

export const GRID_STYLES: GridStyle[] = [
  'Brutalismo Suizo',
  'Asimetría Bauhaus',
  'Proporción Áurea / Espiral Fibonacci',
  'Editorial Años 70',
  'Retícula Dinámica Rota'
];

export const PALETTES: ColorPalette[] = [
  {
    name: 'Monocromo & Verde Fósforo',
    background: '#0A0A0A',
    surface: '#141414',
    accent: '#22C55E',
    textPrimary: '#F3F3F3',
    textSecondary: '#A1A1A1',
    description: 'Alto contraste austero con acento fósforo bio/hacker.'
  },
  {
    name: 'Cobalto Profundo & Carbón',
    background: '#090B0E',
    surface: '#12161D',
    accent: '#3B82F6',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    description: 'Estructura analítica fría para fintech y sistemas de misión crítica.'
  },
  {
    name: 'Terracota Cálido & Óxido',
    background: '#0D0B0A',
    surface: '#191513',
    accent: '#E06D53',
    textPrimary: '#FAF7F5',
    textSecondary: '#A89F9A',
    description: 'Elegancia arquitectónica táctil inspirada en cerámica y ladrillo.'
  },
  {
    name: 'Grafito Mate & Amarillo Cromo',
    background: '#0D0D0D',
    surface: '#171717',
    accent: '#EAB308',
    textPrimary: '#FFFFFF',
    textSecondary: '#A3A3A3',
    description: 'Estética industrial de alta tensión y lectura técnica inmediata.'
  },
  {
    name: 'Arena Neutra & Obsidiana',
    background: '#0B0A08',
    surface: '#161411',
    accent: '#D4A373',
    textPrimary: '#F4EFEB',
    textSecondary: '#9C958D',
    description: 'Lujo silencioso editorial, tipografía serifada de autor y espacios amplios.'
  }
];

export const HERO_FOCUS_CONCEPTS = [
  'Punto focal asimétrico a la izquierda con masa tipográfica monumental e interacción de scroll por capas',
  'Estructura de columna central desfasada con visor interactivo de simulación en tiempo real',
  'Composición editorial dividida 60/40 con inoculación agresiva de objeciones en el primer pliegue',
  'Espiral de revelación progresiva con micro-animación de canvas reactivo al cursor',
  'Despliegue monolítico con CTA de fricción cero ("Sin tarjeta • 30 segundos") y prueba social sobria'
];

export const PSYCHOLOGY_ANGLES = [
  'Inoculación de objeciones técnicas: Desmonta el escepticismo de escalabilidad antes de presentar el precio',
  'Beneficio puro sobre característica: Enfocado en el ahorro de 20h/semana en lugar del algoritmo interno',
  'Autoridad y prueba social documental: Menciones de pares técnicos y auditorías verificables',
  'Aversión a la pérdida y coste de inacción: Métricas tangibles del riesgo de operar con métodos heredados',
  'Exclusividad y fricción deliberada: Filtro de admisión de alta gama con micro-conversiones progresivas'
];

export function generateRandomSeed(length = 28): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*?_';
  let result = '';
  const cryptoObj = window.crypto || (window as unknown as { msCrypto: Crypto }).msCrypto;
  
  if (cryptoObj && cryptoObj.getRandomValues) {
    const values = new Uint32Array(length);
    cryptoObj.getRandomValues(values);
    for (let i = 0; i < length; i++) {
      result += chars[values[i] % chars.length];
    }
  } else {
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  return result;
}

export function computeSumMod(str: string, mod: number): { sum: number; modResult: number } {
  let sum = 0;
  for (let i = 0; i < str.length; i++) {
    sum += str.charCodeAt(i);
  }
  return {
    sum,
    modResult: sum % mod
  };
}

export function computeRollingHash(str: string, mod: number, base = 31): { hash: number; modResult: number } {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * base + str.charCodeAt(i)) % 1000000007;
  }
  return {
    hash,
    modResult: hash % mod
  };
}

export function computeSsotVector(seed: string, selectedTechs: string[] = ['Tailwind CSS']): SsotEntropyVector {
  const len = seed.length;
  const chunkSize = Math.floor(len / 4);
  
  const c1Str = seed.slice(0, chunkSize);
  const c2Str = seed.slice(chunkSize, chunkSize * 2);
  const c3Str = seed.slice(chunkSize * 2, chunkSize * 3);
  const c4Str = seed.slice(chunkSize * 3);

  // Chunk 1: Retícula / Layout
  const c1Calc = computeSumMod(c1Str, GRID_STYLES.length);
  const layout = GRID_STYLES[c1Calc.modResult];

  // Chunk 2: Cromática / Paleta
  const c2Calc = computeSumMod(c2Str, PALETTES.length);
  const palette = PALETTES[c2Calc.modResult];

  // Chunk 3: Stack
  const c3Calc = computeRollingHash(c3Str, 100);
  const stackBehavior = selectedTechs.length > 0 
    ? `${selectedTechs.join(' + ')} con renderizado reactivo e interactividad en componentes aislados.`
    : 'HTML5 semántico con Tailwind CSS y Vanilla JS ultra-optimizado.';

  // Chunk 4: Hero & Psicología
  const c4Calc = computeSumMod(c4Str, HERO_FOCUS_CONCEPTS.length);
  const heroFocus = HERO_FOCUS_CONCEPTS[c4Calc.modResult];
  const psychologyAngle = PSYCHOLOGY_ANGLES[c4Calc.modResult % PSYCHOLOGY_ANGLES.length];

  const chunks: ChunkMapping[] = [
    {
      chunkIndex: 1,
      rawString: c1Str,
      asciiSum: c1Calc.sum,
      modResult: c1Calc.modResult,
      label: 'Retícula & Composición',
      mappedValue: layout,
      details: `Sum ASCII (${c1Calc.sum}) mod ${GRID_STYLES.length} = ${c1Calc.modResult}`
    },
    {
      chunkIndex: 2,
      rawString: c2Str,
      asciiSum: c2Calc.sum,
      modResult: c2Calc.modResult,
      label: 'Cromática & Iluminación',
      mappedValue: palette.name,
      details: `Sum ASCII (${c2Calc.sum}) mod ${PALETTES.length} = ${c2Calc.modResult} (${palette.description})`
    },
    {
      chunkIndex: 3,
      rawString: c3Str,
      asciiSum: c3Calc.hash,
      modResult: c3Calc.modResult,
      label: 'Comportamiento del Stack',
      mappedValue: selectedTechs.join(', ') || 'Tailwind CDN',
      details: `Polynomial Rolling Hash mod 100 = ${c3Calc.modResult}`
    },
    {
      chunkIndex: 4,
      rawString: c4Str,
      asciiSum: c4Calc.sum,
      modResult: c4Calc.modResult,
      label: 'Hero Section & Psicología',
      mappedValue: heroFocus,
      details: `Sum ASCII (${c4Calc.sum}) mod ${HERO_FOCUS_CONCEPTS.length} = ${c4Calc.modResult}`
    }
  ];

  return {
    seed,
    length: len,
    chunks,
    layout,
    palette,
    stackBehavior,
    heroFocus,
    psychologyAngle
  };
}

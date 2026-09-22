import { SsotEntropyVector } from '../types';

export function generateLandingCode(
  niche: string,
  valueProp: string,
  techStack: string[],
  ssot: SsotEntropyVector
): string {
  const bg = ssot.palette.background;
  const surface = ssot.palette.surface;
  const accent = ssot.palette.accent;
  const textPri = ssot.palette.textPrimary;
  const textSec = ssot.palette.textSecondary;

  // Render style specific layouts
  if (ssot.layout === 'Brutalismo Suizo') {
    return generateSwissBrutalistTemplate(niche, valueProp, techStack, bg, surface, accent, textPri, textSec, ssot);
  } else if (ssot.layout === 'Asimetría Bauhaus') {
    return generateBauhausAsymmetricTemplate(niche, valueProp, techStack, bg, surface, accent, textPri, textSec, ssot);
  } else if (ssot.layout === 'Proporción Áurea / Espiral Fibonacci') {
    return generateFibonacciTemplate(niche, valueProp, techStack, bg, surface, accent, textPri, textSec, ssot);
  } else if (ssot.layout === 'Editorial Años 70') {
    return generateEditorial70sTemplate(niche, valueProp, techStack, bg, surface, accent, textPri, textSec, ssot);
  } else {
    return generateBrokenGridTemplate(niche, valueProp, techStack, bg, surface, accent, textPri, textSec, ssot);
  }
}

function generateSwissBrutalistTemplate(
  niche: string,
  valueProp: string,
  techStack: string[],
  bg: string,
  surface: string,
  accent: string,
  textPri: string,
  textSec: string,
  ssot: SsotEntropyVector
): string {
  return `<!DOCTYPE html>
<html lang="es" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${niche} — Arquitectura de Vanguardia</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    :root {
      color-scheme: dark;
    }
    body {
      margin: 0;
      background-color: ${bg};
      color: ${textPri};
      font-family: 'Hanken Grotesk', sans-serif;
      scroll-behavior: smooth;
    }
    .mono {
      font-family: 'JetBrains Mono', monospace;
    }
    .scroll-reveal {
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .scroll-reveal.is-visible {
      opacity: 1;
      transform: translateY(0);
    }
  </style>
</head>
<body class="min-h-screen antialiased selection:bg-[${accent}] selection:text-[${bg}]">

  <!-- Header Monolítico -->
  <header class="w-full px-8 py-6 flex items-center justify-between" style="background-color: ${bg};">
    <div class="flex items-center gap-6">
      <span class="text-xl font-bold tracking-tighter uppercase text-[${textPri}]">${niche.split(' ')[0] || 'ENTROSPEC'}</span>
      <span class="mono text-xs px-2.5 py-1 text-[${textSec}]" style="background-color: ${surface};">SSoT://${ssot.seed.slice(0, 8)}</span>
    </div>
    <nav class="hidden md:flex items-center gap-8 text-xs font-medium text-[${textSec}]">
      <a href="#arquitectura" class="hover:text-[${textPri}] transition-colors">Arquitectura</a>
      <a href="#inoculacion" class="hover:text-[${textPri}] transition-colors">Inoculación</a>
      <a href="#benchmark" class="hover:text-[${textPri}] transition-colors">Rendimiento</a>
    </nav>
    <a href="#cta" class="px-5 py-2 text-xs font-semibold tracking-wide transition-opacity hover:opacity-90 text-[${bg}]" style="background-color: ${textPri};">
      Acceso Inmediato
    </a>
  </header>

  <!-- Hero Section: Brutalismo Suizo Asimétrico -->
  <main class="max-w-7xl mx-auto px-8 pt-12 pb-24 flex flex-col gap-16">
    
    <div class="scroll-reveal flex flex-col lg:flex-row gap-12 items-start">
      <!-- Columna Titular -->
      <div class="flex-1 flex flex-col gap-6">
        <div class="inline-flex items-center gap-2 self-start px-3 py-1 text-[11px] mono text-[${accent}]" style="background-color: ${surface};">
          <span>// RETÍCULA SUIZA V4.2</span>
          <span>•</span>
          <span>DIVERSIDAD DAG</span>
        </div>
        
        <h1 class="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tighter leading-[0.95] text-[${textPri}]">
          ${valueProp}
        </h1>
        
        <p class="text-base sm:text-lg text-[${textSec}] max-w-2xl leading-relaxed">
          Diseñado para erradicar la sobrecarga cognitiva. Una estructura construida sin ornamentos prescindibles, priorizando la ejecución técnica y la conversión verificable.
        </p>

        <!-- CTA & Micro-copy de Fricción Cero -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4">
          <a href="#cta" class="h-12 px-8 font-medium text-xs tracking-wider flex items-center justify-center transition-opacity hover:opacity-90 text-[${bg}]" style="background-color: ${accent};">
            DESPLEGAR EN 30 SEGUNDOS
          </a>
          <span class="text-xs text-[${textSec}] mono">
            Sin tarjeta • 100% Autónomo • Rendimiento Edge
          </span>
        </div>
      </div>

      <!-- Columna de Simulación & Métricas -->
      <div class="w-full lg:w-96 p-8 flex flex-col gap-6" style="background-color: ${surface};">
        <div class="flex justify-between items-center">
          <span class="text-xs uppercase tracking-widest text-[${textSec}] mono">Telemetría SSoT</span>
          <span class="text-xs font-semibold text-[${accent}]">99.98% Eficiencia</span>
        </div>

        <div class="flex flex-col gap-3">
          <div class="flex justify-between text-xs">
            <span class="text-[${textSec}]">Pila de Ejecución</span>
            <span class="text-[${textPri}] font-mono">${techStack.slice(0, 3).join(', ')}</span>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-[${textSec}]">Diseño Sustractivo</span>
            <span class="text-[${accent}] font-mono">-30% Ruido Decorativo</span>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-[${textSec}]">Latencia de Decisión</span>
            <span class="text-[${textPri}] font-mono">&lt; 14ms Global</span>
          </div>
        </div>

        <!-- Canvas Gráfico Interactivo de Malla -->
        <div class="w-full h-32 relative overflow-hidden" style="background-color: ${bg};">
          <canvas id="heroCanvas" class="w-full h-full"></canvas>
        </div>
      </div>
    </div>

    <!-- Sección de Inoculación de Objeciones -->
    <section id="inoculacion" class="scroll-reveal flex flex-col gap-8 pt-8">
      <div class="flex flex-col gap-2">
        <span class="text-xs uppercase tracking-widest mono text-[${accent}]">// INOCULACIÓN TÉCNICA</span>
        <h2 class="text-2xl sm:text-3xl font-medium tracking-tight text-[${textPri}]">
          Respuestas transparentes a dudas críticas de arquitectura.
        </h2>
      </div>

      <div class="flex flex-col md:flex-row gap-6">
        <div class="flex-1 p-8 flex flex-col gap-3" style="background-color: ${surface};">
          <span class="text-xs mono text-[${accent}]">01 / ESCALABILIDAD</span>
          <h3 class="text-base font-semibold text-[${textPri}]">¿Soporta picos de tráfico masivo?</h3>
          <p class="text-xs text-[${textSec}] leading-relaxed">
            Arquitectura desacoplada renderizada en el borde. Cero cuellos de botella de renderizado en servidor.
          </p>
        </div>

        <div class="flex-1 p-8 flex flex-col gap-3" style="background-color: ${surface};">
          <span class="text-xs mono text-[${accent}]">02 / INTEGRACIÓN</span>
          <h3 class="text-base font-semibold text-[${textPri}]">¿Requiere reescribir la base actual?</h3>
          <p class="text-xs text-[${textSec}] leading-relaxed">
            Compatible con tu stack actual. Inyección modular vía micro-frontends sin bloqueo de dependencias.
          </p>
        </div>

        <div class="flex-1 p-8 flex flex-col gap-3" style="background-color: ${surface};">
          <span class="text-xs mono text-[${accent}]">03 / CONVERSIÓN</span>
          <h3 class="text-base font-semibold text-[${textPri}]">¿Por qué este diseño convierte más?</h3>
          <p class="text-xs text-[${textSec}] leading-relaxed">
            Elimina el 30% de elementos decorativos que distraen al usuario, conduciendo la atención al objetivo final.
          </p>
        </div>
      </div>
    </section>

    <!-- Sección de Cierre / CTA Monolítico -->
    <section id="cta" class="scroll-reveal p-12 flex flex-col md:flex-row items-center justify-between gap-8" style="background-color: ${surface};">
      <div class="flex flex-col gap-2 max-w-xl">
        <h2 class="text-2xl font-bold tracking-tight text-[${textPri}]">Eleva la arquitectura de tu plataforma hoy.</h2>
        <p class="text-xs text-[${textSec}] leading-relaxed">Acceso inmediato al motor de despliegue sin configuraciones complejas.</p>
      </div>
      <button class="h-12 px-8 font-semibold text-xs tracking-wider transition-opacity hover:opacity-90 text-[${bg}]" style="background-color: ${textPri};">
        INICIAR DESPLIEGUE AHORA
      </button>
    </section>

  </main>

  <footer class="w-full px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[${textSec}] mono" style="background-color: ${bg};">
    <span>© 2026 ${niche} — Carbon Editorial Anti-Slop</span>
    <span>Semilla: ${ssot.seed}</span>
  </footer>

  <script>
    // Scroll Reveal Observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));

    // Hero Canvas
    const canvas = document.getElementById('heroCanvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      
      let step = 0;
      function draw() {
        ctx.fillStyle = '${bg}';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.strokeStyle = '${accent}';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += 16) {
          const y = Math.sin((x + step) * 0.05) * 18 + (canvas.height / 2);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        step += 0.8;
        requestAnimationFrame(draw);
      }
      draw();
    }
  </script>
</body>
</html>`;
}

function generateBauhausAsymmetricTemplate(
  niche: string,
  valueProp: string,
  techStack: string[],
  bg: string,
  surface: string,
  accent: string,
  textPri: string,
  textSec: string,
  ssot: SsotEntropyVector
): string {
  return `<!DOCTYPE html>
<html lang="es" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${niche} — Asimetría Bauhaus</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    :root {
      color-scheme: dark;
    }
    body {
      margin: 0;
      background-color: ${bg};
      color: ${textPri};
      font-family: 'Hanken Grotesk', sans-serif;
      scroll-behavior: smooth;
    }
    .mono {
      font-family: 'JetBrains Mono', monospace;
    }
    .scroll-reveal {
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .scroll-reveal.is-visible {
      opacity: 1;
      transform: translateY(0);
    }
  </style>
</head>
<body class="min-h-screen antialiased">
  
  <nav class="w-full px-8 py-8 flex justify-between items-center">
    <div class="text-2xl font-bold tracking-tighter text-[${textPri}] uppercase">${niche.slice(0, 12)}</div>
    <div class="px-4 py-1.5 text-xs mono text-[${textSec}]" style="background-color: ${surface};">
      Bauhaus // ${ssot.palette.name}
    </div>
  </nav>

  <div class="max-w-7xl mx-auto px-8 py-12 flex flex-col gap-20">
    
    <!-- Bloque Asimétrico 60/40 -->
    <div class="scroll-reveal flex flex-col lg:flex-row gap-12 items-start">
      <div class="flex-1 flex flex-col gap-6">
        <span class="mono text-xs uppercase tracking-widest text-[${accent}]">ESTRUCTURA ASIMÉTRICA MODERNA</span>
        <h1 class="text-5xl lg:text-7xl font-semibold tracking-tighter text-[${textPri}] leading-[1.02]">
          ${valueProp}
        </h1>
        <p class="text-sm lg:text-base text-[${textSec}] max-w-xl leading-relaxed">
          Rechazamos las plantillas genéricas. Cada componente responde a una lógica geométrica pura que guía la interacción de manera intuitiva y directa.
        </p>
        <div class="pt-4 flex items-center gap-4">
          <button class="h-12 px-8 text-xs font-semibold tracking-wider text-[${bg}] transition-opacity hover:opacity-90" style="background-color: ${accent};">
            ACCESO EN 30 SEGUNDOS
          </button>
        </div>
      </div>

      <!-- Cuadrante Visual Bauhaus -->
      <div class="w-full lg:w-96 p-8 flex flex-col justify-between gap-6" style="background-color: ${surface};">
        <span class="text-xs mono text-[${textSec}]">GEOMETRÍA // 01</span>
        <div class="flex flex-col gap-2">
          <span class="text-4xl font-bold text-[${textPri}] tracking-tight">0% Fricción</span>
          <span class="text-xs text-[${textSec}]">Eliminamos el 30% de elementos decorativos para máxima claridad funcional.</span>
        </div>
        <div class="pt-4 flex flex-wrap gap-2">
          ${techStack.map(t => `<span class="px-3 py-1 text-[11px] mono text-[${textPri}]" style="background-color: ${bg};">${t}</span>`).join('')}
        </div>
      </div>
    </div>

    <!-- 3 Pilares Funcionales -->
    <div class="scroll-reveal flex flex-col md:flex-row gap-8">
      <div class="flex-1 p-8 flex flex-col gap-3" style="background-color: ${surface};">
        <span class="mono text-xs text-[${accent}]">01 / RETÍCULA DINÁMICA</span>
        <h3 class="text-lg font-medium text-[${textPri}]">Equilibrio Asimétrico</h3>
        <p class="text-xs text-[${textSec}] leading-relaxed">Espaciado calibrado para dar peso a la oferta principal sin saturar la pantalla.</p>
      </div>

      <div class="flex-1 p-8 flex flex-col gap-3" style="background-color: ${surface};">
        <span class="mono text-xs text-[${accent}]">02 / PSICOLOGÍA CRO</span>
        <h3 class="text-lg font-medium text-[${textPri}]">Inoculación de Objeciones</h3>
        <p class="text-xs text-[${textSec}] leading-relaxed">Resolvemos las objeciones de costo y seguridad en el flujo inicial de lectura.</p>
      </div>

      <div class="flex-1 p-8 flex flex-col gap-3" style="background-color: ${surface};">
        <span class="mono text-xs text-[${accent}]">03 / PUREZA DE CÓDIGO</span>
        <h3 class="text-lg font-medium text-[${textPri}]">Arquitectura Monolítica</h3>
        <p class="text-xs text-[${textSec}] leading-relaxed">Código limpio sin bibliotecas pesadas. Carga instantánea en cualquier dispositivo.</p>
      </div>
    </div>

  </div>

  <script>
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
  </script>
</body>
</html>`;
}

function generateFibonacciTemplate(
  niche: string,
  valueProp: string,
  techStack: string[],
  bg: string,
  surface: string,
  accent: string,
  textPri: string,
  textSec: string,
  ssot: SsotEntropyVector
): string {
  return `<!DOCTYPE html>
<html lang="es" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${niche} — Proporción Áurea & Fibonacci</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    :root {
      color-scheme: dark;
    }
    body {
      margin: 0;
      background-color: ${bg};
      color: ${textPri};
      font-family: 'Hanken Grotesk', sans-serif;
      scroll-behavior: smooth;
    }
    .mono {
      font-family: 'JetBrains Mono', monospace;
    }
    .scroll-reveal {
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .scroll-reveal.is-visible {
      opacity: 1;
      transform: translateY(0);
    }
  </style>
</head>
<body class="min-h-screen antialiased">
  <header class="max-w-6xl mx-auto px-8 py-10 flex justify-between items-center">
    <span class="text-xl font-semibold tracking-tighter uppercase text-[${textPri}]">${niche}</span>
    <span class="mono text-xs text-[${accent}]">φ = 1.618033 // Fibonacci Flow</span>
  </header>

  <main class="max-w-6xl mx-auto px-8 py-12 flex flex-col gap-16">
    <div class="scroll-reveal flex flex-col gap-8 max-w-4xl">
      <span class="mono text-xs uppercase tracking-widest text-[${accent}]">// ESPIRAL PROPORCIONAL</span>
      <h1 class="text-5xl md:text-7xl font-semibold tracking-tighter text-[${textPri}] leading-[1.05]">
        ${valueProp}
      </h1>
      <p class="text-base md:text-lg text-[${textSec}] leading-relaxed max-w-2xl">
        Estructura armonizada bajo la proporción áurea. El ritmo de scroll y la densidad tipográfica conducen de forma natural hacia la conversión sin sobrecargar los sentidos.
      </p>

      <div class="pt-4 flex flex-wrap items-center gap-6">
        <button class="h-12 px-8 font-semibold text-xs tracking-wider text-[${bg}] transition-opacity hover:opacity-90" style="background-color: ${accent};">
          OBTENER ACCESO DIRECTO
        </button>
        <span class="mono text-xs text-[${textSec}]">Semilla: ${ssot.seed.slice(0, 12)}</span>
      </div>
    </div>

    <!-- Malla Proporcional 1:1.618 -->
    <div class="scroll-reveal flex flex-col lg:flex-row gap-8">
      <div class="flex-1 p-8 flex flex-col justify-between gap-8" style="background-color: ${surface};">
        <div class="flex flex-col gap-2">
          <span class="mono text-xs text-[${accent}]">SECCIÓN PRIMARIA (1.618)</span>
          <h2 class="text-2xl font-semibold text-[${textPri}]">Claridad instantánea en menos de 3 segundos.</h2>
          <p class="text-xs text-[${textSec}] leading-relaxed">
            Diseñado para que cualquier usuario técnico o de negocio comprenda el valor sin rodeos corporativos ni textos inflados.
          </p>
        </div>
        <div class="flex gap-4">
          ${techStack.map(t => `<span class="px-3 py-1 text-xs mono text-[${textPri}]" style="background-color: ${bg};">${t}</span>`).join('')}
        </div>
      </div>

      <div class="w-full lg:w-80 p-8 flex flex-col justify-center gap-4" style="background-color: ${surface};">
        <span class="mono text-xs text-[${accent}]">MÉTRICA (1.0)</span>
        <span class="text-4xl font-bold text-[${textPri}]">99.4%</span>
        <span class="text-xs text-[${textSec}]">Retención de atención lograda por eliminación de distractores.</span>
      </div>
    </div>
  </main>

  <script>
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
  </script>
</body>
</html>`;
}

function generateEditorial70sTemplate(
  niche: string,
  valueProp: string,
  techStack: string[],
  bg: string,
  surface: string,
  accent: string,
  textPri: string,
  textSec: string,
  ssot: SsotEntropyVector
): string {
  return `<!DOCTYPE html>
<html lang="es" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${niche} — Editorial Años 70</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    :root {
      color-scheme: dark;
    }
    body {
      margin: 0;
      background-color: ${bg};
      color: ${textPri};
      font-family: 'Hanken Grotesk', sans-serif;
      scroll-behavior: smooth;
    }
    .mono {
      font-family: 'JetBrains Mono', monospace;
    }
    .scroll-reveal {
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .scroll-reveal.is-visible {
      opacity: 1;
      transform: translateY(0);
    }
  </style>
</head>
<body class="min-h-screen antialiased">
  <div class="max-w-6xl mx-auto px-8 py-12 flex flex-col gap-16">
    <div class="flex justify-between items-center">
      <span class="text-lg font-bold tracking-tight uppercase text-[${textPri}]">${niche}</span>
      <span class="mono text-xs text-[${accent}]">EDICIÓN // ${ssot.palette.name}</span>
    </div>

    <div class="scroll-reveal flex flex-col gap-8 max-w-4xl">
      <h1 class="text-5xl md:text-7xl font-bold tracking-tight text-[${textPri}] leading-[0.98]">
        ${valueProp}
      </h1>
      <p class="text-lg text-[${textSec}] max-w-2xl leading-relaxed">
        Composición tipográfica de alto contraste con jerarquía limpia. Sin ruido decorativo: la palabra y el contraste como elementos primarios de convicción.
      </p>
      <div class="flex items-center gap-4">
        <button class="h-12 px-8 text-xs font-bold tracking-wider text-[${bg}] transition-opacity hover:opacity-90" style="background-color: ${accent};">
          COMENZAR EN 30 SEGUNDOS
        </button>
        <div class="flex gap-2">
          ${techStack.map(t => `<span class="px-3 py-1 text-xs mono text-[${textSec}]" style="background-color: ${surface};">${t}</span>`).join('')}
        </div>
      </div>
    </div>

    <div class="scroll-reveal flex flex-col md:flex-row gap-8 pt-8">
      <div class="flex-1 p-8 flex flex-col gap-4" style="background-color: ${surface};">
        <h3 class="text-xl font-bold text-[${textPri}]">Inoculación de Objeciones</h3>
        <p class="text-xs text-[${textSec}] leading-relaxed">
          Explicamos técnicamente el funcionamiento del sistema antes de solicitar cualquier compromiso. La claridad total genera confianza absoluta.
        </p>
      </div>
      <div class="flex-1 p-8 flex flex-col gap-4" style="background-color: ${surface};">
        <h3 class="text-xl font-bold text-[${textPri}]">Diseño Sustractivo</h3>
        <p class="text-xs text-[${textSec}] leading-relaxed">
          Cada píxel que no ayuda a comprender la propuesta de valor ha sido eliminado. Menos es más velocidad y más conversión.
        </p>
      </div>
    </div>
  </div>

  <script>
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
  </script>
</body>
</html>`;
}

function generateBrokenGridTemplate(
  niche: string,
  valueProp: string,
  techStack: string[],
  bg: string,
  surface: string,
  accent: string,
  textPri: string,
  textSec: string,
  ssot: SsotEntropyVector
): string {
  return `<!DOCTYPE html>
<html lang="es" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${niche} — Retícula Dinámica Rota</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    :root {
      color-scheme: dark;
    }
    body {
      margin: 0;
      background-color: ${bg};
      color: ${textPri};
      font-family: 'Hanken Grotesk', sans-serif;
      scroll-behavior: smooth;
    }
    .mono {
      font-family: 'JetBrains Mono', monospace;
    }
    .scroll-reveal {
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .scroll-reveal.is-visible {
      opacity: 1;
      transform: translateY(0);
    }
  </style>
</head>
<body class="min-h-screen antialiased">
  <header class="w-full px-8 py-6 flex justify-between items-center">
    <span class="text-xl font-bold tracking-tighter text-[${textPri}] uppercase">${niche}</span>
    <span class="mono text-xs px-3 py-1 text-[${accent}]" style="background-color: ${surface};">
      RETÍCULA DINÁMICA
    </span>
  </header>

  <main class="max-w-7xl mx-auto px-8 py-12 flex flex-col gap-16">
    <div class="scroll-reveal flex flex-col lg:flex-row gap-12 items-start">
      <div class="flex-1 flex flex-col gap-6">
        <h1 class="text-5xl lg:text-7xl font-bold tracking-tighter text-[${textPri}] leading-[1]">
          ${valueProp}
        </h1>
        <p class="text-base text-[${textSec}] max-w-2xl leading-relaxed">
          Rompemos la rigidez de las columnas estándar para generar una experiencia visual inolvidable que retiene la atención y maximiza la tasa de conversión.
        </p>
        <div class="pt-4 flex items-center gap-4">
          <button class="h-12 px-8 text-xs font-semibold tracking-wider text-[${bg}] hover:opacity-90" style="background-color: ${accent};">
            ACCESO EN 30 SEGUNDOS
          </button>
        </div>
      </div>

      <div class="w-full lg:w-80 p-8 flex flex-col gap-4" style="background-color: ${surface};">
        <span class="mono text-xs text-[${accent}]">// STACK DINÁMICO</span>
        <div class="flex flex-col gap-2">
          ${techStack.map(t => `<div class="p-3 text-xs mono flex justify-between" style="background-color: ${bg};"><span>${t}</span><span class="text-[${textSec}]">Activo</span></div>`).join('')}
        </div>
        <div class="pt-2 text-[10px] mono text-[${textSec}]">
          Semilla SSoT: ${ssot.seed.slice(0, 12)}
        </div>
      </div>
    </div>
  </main>

  <script>
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
  </script>
</body>
</html>`;
}

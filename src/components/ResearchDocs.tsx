import React from 'react';

export const ResearchDocs: React.FC = () => {
  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto py-4">
      {/* Header */}
      <div className="flex flex-col gap-2 p-6 rounded-lg bg-[#141414]">
        <span className="mono text-xs uppercase tracking-widest text-[#22C55E]">
          // FUNDAMENTO CIENTÍFICO ICLR 2026 & TRATADO DE DISEÑO
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-[#F3F3F3]">
          Arquitectura SSoT, Diseño Sustractivo y Mitigación de AI Slop
        </h1>
        <p className="text-sm text-[#A1A1A1] leading-relaxed">
          Base teórica y algorítmica implementada en Entrospec, integrando la investigación de Sakana AI y las 8 técnicas avanzadas de landing pages.
        </p>
      </div>

      {/* Section 1: Sakana AI Paper */}
      <div className="p-6 rounded-lg bg-[#141414] flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-[#F3F3F3]">
            1. String Seed of Thought (SSoT) — Sakana AI (ICLR 2026)
          </h2>
          <span className="text-xs mono px-2.5 py-1 rounded-sm bg-[#1F1F1F] text-[#3B82F6]">
            Kou Misaki & Takuya Akiba
          </span>
        </div>

        <p className="text-xs text-[#A1A1A1] leading-relaxed">
          Los modelos de lenguaje de frontera (LLMs) sufren de <strong>colapso de diversidad</strong> y convergencia estadística hacia respuestas promedio (degradados morados, bento grids, layouts de texto izquierda/gráfico derecha). Aumentar la temperatura solo añade ruido estocástico sobre probabilidades desbalanceadas.
        </p>

        <div className="p-4 rounded-md bg-[#0A0A0A] flex flex-col gap-3 font-mono text-xs text-[#F3F3F3]">
          <span className="text-[#22C55E]">// Teorema de Extracción de Entropía (Theorem 4.2 / Sum-Mod)</span>
          <p className="text-[#A1A1A1] leading-relaxed">
            Sea una cadena semilla generada x<sup>n</sup> = (x<sub>1</sub>, ... x<sub>n</sub>) sobre un alfabeto Z<sub>A</sub>. Al calcular la suma de códigos ASCII módulo M:
            <br />
            <span className="text-[#F3F3F3]">s<sub>n</sub> = Σ ord(x<sub>j</sub>) mod M</span>
            <br />
            La distancia de variación total d<sub>TV</sub> respecto a la distribución uniforme U<sub>Z_M</sub> converge exponencialmente a cero con la longitud n de la semilla.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-md bg-[#191919] flex flex-col gap-2">
            <span className="text-xs font-semibold text-[#F3F3F3]">Diversity-Aware Generation (DAG)</span>
            <p className="text-xs text-[#A1A1A1] leading-relaxed">
              En tareas creativas y abiertas, SSoT descompone la semilla en 4 Chunks ortogonales (Retícula, Cromática, Stack, Hero) y realiza <em>muestreo local</em> para que cada dimensión visual sea matemáticamente independiente.
            </p>
          </div>

          <div className="p-4 rounded-md bg-[#191919] flex flex-col gap-2">
            <span className="text-xs font-semibold text-[#F3F3F3]">NoveltyBench (Distinct & Utility)</span>
            <p className="text-xs text-[#A1A1A1] leading-relaxed">
              Evalúa que la originalidad visual (Distinctiveness) no degrade la usabilidad ni la conversión (Cumulative Utility), asegurando que la landing page no solo sea única sino altamente funcional.
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Las 8 Técnicas Avanzadas */}
      <div className="p-6 rounded-lg bg-[#141414] flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-[#F3F3F3]">
          2. Las 8 Técnicas Avanzadas de Diseño de Landing Pages con IA
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-md bg-[#191919] flex flex-col gap-1.5">
            <span className="text-xs font-bold text-[#22C55E]">01. Cadenas Semilla (SSoT)</span>
            <p className="text-xs text-[#A1A1A1]">Secuestra el sesgo estadístico hacia estilos históricos (Bauhaus, Brutalismo, Fibonacci).</p>
          </div>

          <div className="p-4 rounded-md bg-[#191919] flex flex-col gap-1.5">
            <span className="text-xs font-bold text-[#22C55E]">02. Prompts Ambiciosos</span>
            <p className="text-xs text-[#A1A1A1]">Inoculación de objeciones y psicología profunda de mercado en lugar de descripciones superficiales.</p>
          </div>

          <div className="p-4 rounded-md bg-[#191919] flex flex-col gap-1.5">
            <span className="text-xs font-bold text-[#22C55E]">03. Bucles Creator-Critic</span>
            <p className="text-xs text-[#A1A1A1]">Subagente auditor que evalúa y refactoriza la página hasta alcanzar nota ≥ 8.5/10.</p>
          </div>

          <div className="p-4 rounded-md bg-[#191919] flex flex-col gap-1.5">
            <span className="text-xs font-bold text-[#22C55E]">04. Generación de Imagen Macro</span>
            <p className="text-xs text-[#A1A1A1]">Prompts para texturas e iluminación de estudio de alta gama (cero stock genérico).</p>
          </div>

          <div className="p-4 rounded-md bg-[#191919] flex flex-col gap-1.5">
            <span className="text-xs font-bold text-[#22C55E]">05. Generación de Vídeo & Motion</span>
            <p className="text-xs text-[#A1A1A1]">Motion design en canvas o vídeo cinemático para guiar la vista hacia el botón principal.</p>
          </div>

          <div className="p-4 rounded-md bg-[#191919] flex flex-col gap-1.5">
            <span className="text-xs font-bold text-[#22C55E]">06. Diseño Sustractivo (-30%)</span>
            <p className="text-xs text-[#A1A1A1]">Elimina el horror vacui de la IA: erradica el 30% de cajas y tarjetas decorativas.</p>
          </div>

          <div className="p-4 rounded-md bg-[#191919] flex flex-col gap-1.5">
            <span className="text-xs font-bold text-[#22C55E]">07. Restricciones Negativas Severas</span>
            <p className="text-xs text-[#A1A1A1]">Prohibición explícita de palabras como &quot;revolucionario&quot;, &quot;unlock&quot;, &quot;delve&quot; y bordes 1px.</p>
          </div>

          <div className="p-4 rounded-md bg-[#191919] flex flex-col gap-1.5">
            <span className="text-xs font-bold text-[#22C55E]">08. Arquitectura y Redacción Humana</span>
            <p className="text-xs text-[#A1A1A1]">Micro-copy persuasivo de conversión (&quot;Empieza en 30 segundos&quot; vs &quot;Enviar&quot;).</p>
          </div>
        </div>
      </div>

      {/* Section 3: Carbon Editorial */}
      <div className="p-6 rounded-lg bg-[#141414] flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-[#F3F3F3]">
          3. Manifiesto Carbon Editorial (0px Borders)
        </h2>
        <p className="text-xs text-[#A1A1A1] leading-relaxed">
          En Entrospec, los bordes artificiales de 1px están prohibidos. La separación entre contenedores y elementos se realiza exclusivamente mediante la combinación de capas de luminancia de carbón (`#0A0A0A` a `#282828`) y espaciado negativo generoso.
        </p>
      </div>
    </div>
  );
};

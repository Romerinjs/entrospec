---
name: entrospec-design
description: Design system, UI/UX architecture, and implementation standards for Entrospec. Enforces Carbon Editorial (Anti-AI Slop), SSoT (String Seed of Thought / Sakana AI ICLR 2026), Subtractive Design (-30% decorative bloat), NoveltyBench Creator-Critic Audits, and 8 Advanced Landing Page Techniques.
---

# Entrospec Design System & Engineering Skill

## Overview
**Entrospec** is an elite generative web architecture suite designed to break AI statistical convergence ("AI Slop", generic purple gradients, bento grids) and construct high-converting, aesthetically distinct landing pages.

This skill instructs agents and developers on how to design and build components, workflows, and pages for Entrospec following **Carbon Editorial** aesthetics, mathematical **SSoT (String Seed of Thought)** entropy pipelines, and **NoveltyBench** audit loops.

---

## 1. El Manifiesto Negativo (Anti-AI Slop / Tolerancia Cero)

Cualquier componente o vista que viole estas reglas se considera defectuoso:

1. **CERO BORDES (0px BORDERS):**
   - Prohibido el uso de `border`, `border-*`, `outline`, o `divide-*` en contenedores, tarjetas, modales o inputs.
   - La separación se define **exclusivamente** mediante contraste tonal de superficies (`#0A0A0A`, `#141414`, `#1F1F1F`, `#282828`) y espaciado negativo generoso.
2. **CERO BADGES O CHIPS DECORATIVOS DE IA:**
   - Prohibido agregar badges o etiquetas como "AI", "Powered by AI", "Generado por IA", "Smart", "Magic" o emojis como destellos (✨, 🚀).
3. **CERO ICONOS REDUNDANTES:**
   - No acompañes con iconos a textos con significado autoevidente (ej. no pongas lupa junto a "Buscar", ni diskette junto a "Guardar", ni lápiz junto a "Editar").
4. **CERO TELEMETRÍA ORNAMENTAL / PUNTOS PULSANTES:**
   - Prohibido el uso de círculos verdes/rojos parpadeantes (`animate-ping`), etiquetas de "Live Status", "Sistema Activo" o efectos de pulso decorativo.
5. **CERO BENTO GRIDS CLICHÉ O DEGRADADOS PÚRPURAS:**
   - Prohibido recurrir a layouts tipo Bento Grid predecibles o gradientes violetas/cian. La estructura visual debe ser asimétrica, editorial y con alto contraste.
6. **CERO CLICHÉS EN COPYWRITING:**
   - Prohibido el uso de palabras cliché: *"revolucionario"*, *"potenciar"*, *"ecosistema"*, *"unlock"*, *"delve"*, *"seamless"*, *"next-gen"*. El tono debe ser directo, sobrio y humano.

---

## 2. Paleta Tonal y Elevación de Superficies (Carbon Editorial)

La interfaz vive en la oscuridad profunda (`#0A0A0A`). La elevación no se proyecta con luz blanca ni bordes, sino mediante capas de gris carbón.

| Nivel de Superficie | HEX | Clase Tailwind / Uso |
| :--- | :--- | :--- |
| **Canvas Base** | `#0A0A0A` | `bg-[#0A0A0A]` - Fondo de la ventana, void y canvas principal. |
| **Superficie Elevada** | `#141414` | `bg-[#141414]` - Paneles laterales, docks, tarjetas de contenido. |
| **Superficie Interactiva** | `#1F1F1F` | `bg-[#1F1F1F]` - Inputs, rieles de tabs, cards secundarias. |
| **Hover / Active State** | `#282828` | `hover:bg-[#282828]` - Estados activos y hover. |
| **Acento de Estructura** | `#333333` | `bg-[#333333]` - Indicadores de selección y barras de scroll. |

### Jerarquía Tipográfica de Luminancia
- **Texto Principal:** `#F3F3F3` (`text-[#F3F3F3]`) - Títulos, botones primarios y datos activos.
- **Texto Secundario:** `#A1A1A1` (`text-[#A1A1A1]`) - Descripciones, metadatos y valores de campos.
- **Texto Terciario / Muteado:** `#737373` (`text-[#737373]`) - Placeholders, timestamps y notas auxiliares.

---

## 3. Tipografía y Espaciado (Layout Breathing)

- **Fuente Principal:** `Hanken Grotesk` (Google Fonts), sans-serif neo-grotesca.
- **Fuente de Código/Semillas:** Monospace de alta precisión (`Geist Mono`, `JetBrains Mono` o `monospace`).
- **Tracking:** A mayor tamaño de fuente, tracking más cerrado (`tracking-tight` a `tracking-tighter`). En textos pequeños (`11px - 12px`), tracking abierto (`tracking-wider`).
- **Espaciado Negativo:** Márgenes amplios (`px-8 py-10`, `gap-6` a `gap-8`). Si una vista se siente densa, se eliminan contenedores decorativos en lugar de reducir la escala de texto.

---

## 4. Pipeline de las 8 Técnicas Avanzadas & SSoT (Sakana AI ICLR 2026)

Toda landing page y flujo de generación dentro de Entrospec debe implementar:

### 1. Motor SSoT (Cadenas Semilla & Descomposición por Chunks)
- Genera una cadena pseudoaleatoria de 24 a 32 caracteres alfanuméricos y símbolos (ejemplo: `7fG#kL9!pY4@zR6%vD1*sN0&qX5$wT8`).
- Divide la semilla en 4 Chunks y aplica **Sum-Mod** ($\sum \text{ord}(c_i) \pmod M$) o **Rolling Hash** ($(\sum B^i \cdot \text{ord}(c_i)) \pmod M$) para muestrear atributos:
  - **Chunk 1 (Retícula):** Brutalismo Suizo, Asimetría Bauhaus, Proporción Áurea/Fibonacci, Editorial 70s, Retícula Rota.
  - **Chunk 2 (Cromática):** Monocromo con verde fósforo, escala de grises con acento cobalto, terracota cálido y negro carbón, etc. (cero morados estándar).
  - **Chunk 3 (Stack & Interacción):** Tailwind CDN, GSAP/Motion, Three.js/Canvas, Micro-animaciones.
  - **Chunk 4 (Hero & Psicología):** Punto focal, ritmo de scroll e inoculación de objeciones.

### 2. Prompts Ambiciosos
- Define la psicología del usuario objetivo, nivel de sofisticación del mercado y técnica de inoculación de objeciones (desmontar dudas antes de que surjan).

### 3. Bucle Creator-Critic (NoveltyBench Audit)
- Subagente que evalúa en escala de 1 al 10:
  - **Originalidad Visual (Distinctiveness):** Ruptura del promedio estadístico.
  - **Usabilidad y Fricción (UX):** Comprensión del valor en < 3 segundos.
  - **Conversión (CRO):** Beneficio sobre característica y reducción de ansiedad.
  - **Fidelidad al Stack:** Código limpio y modular.
- **Criterio de Admisión al Banco de Landings:** Promedio $\ge 8.5 / 10$. Si es menor, ejecuta refactorización sustractiva inmediata.

### 4. Activos de Imagen Generativa
- Prompts específicos para DALL-E 3 / Midjourney: texturas macro, iluminación de estudio suave, sin personas genéricas.

### 5. Activos de Vídeo / Motion
- Prompts para Runway / Luma / CSS Motion: fondos cinemáticos lentos, transiciones fluidas guiando hacia el CTA.

### 6. Diseño Sustractivo
- Eliminar el 30% de elementos decorativos innecesarios (anti-horror vacui). Foco absoluto en el Hero y el botón de acción.

### 7. Restricciones Negativas Severas
- Prohibición explícita de palabras clichés, caras plásticas, sonrisas falsas y Bento grids estándar.

### 8. Redacción Humana y Micro-copy
- Micro-copy orientado al beneficio inmediato: *"Acceso inmediato"* en lugar de *"Regístrate hoy"*; *"Prueba en 30 segundos"* en lugar de *"Enviar"*.

---

## 5. Patrones de Componentes de Interfaz

### Botones (Sin bordes, alta reactividad)
```tsx
// Primario
<button className="h-10 px-6 rounded-sm bg-[#F3F3F3] text-[#0A0A0A] text-xs font-medium tracking-wide transition-all duration-150 hover:opacity-90 active:scale-[0.98]">
  Construir Landing
</button>

// Secundario Tonal
<button className="h-10 px-5 rounded-sm bg-[#1F1F1F] text-[#F3F3F3] text-xs font-normal transition-colors duration-150 hover:bg-[#282828] active:scale-[0.98]">
  Ver Prompt Origen
</button>
```

### Contenedores y Tarjetas
```tsx
<div className="p-6 rounded-lg bg-[#141414] shadow-[0_8px_24px_-4px_rgba(0,0,0,0.45)] flex flex-col gap-4">
  <h3 className="text-base font-medium text-[#F3F3F3] tracking-tight">
    Minimalismo Bauhaus Suizo
  </h3>
  <p className="text-sm text-[#A1A1A1] leading-relaxed">
    Estructura asimétrica funcional con tipografía de alto impacto.
  </p>
</div>
```

### Split-View (Workspace)
```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full min-h-[calc(100vh-8rem)]">
  {/* Panel Izquierdo: Motor SSoT / Prompts / Auditoría */}
  <div className="p-6 rounded-lg bg-[#141414] flex flex-col gap-6">
    ...
  </div>
  {/* Panel Derecho: Vista Previa Interactiva Sandbox */}
  <div className="rounded-lg bg-[#0E0E0E] overflow-hidden flex flex-col">
    ...
  </div>
</div>
```

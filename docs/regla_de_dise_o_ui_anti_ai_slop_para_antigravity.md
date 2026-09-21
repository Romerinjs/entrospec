---
description: Reglas estrictas de arquitectura visual, componentes e interfaz de usuario bajo la estética Carbon Editorial.
globs: ["**/*.tsx", "**/*.jsx", "**/*.html", "**/*.vue", "**/*.svelte", "**/*.css"]
---

# Directriz de Diseño UI: Carbon Editorial (Anti-AI Slop)

Esta regla instruye al agente a construir interfaces web de alta gama, arquitectónicas y limpias. Queda estrictamente prohibido generar interfaces que parezcan "producidas por IA" o que utilicen los patrones estadísticos genéricos de plataformas SaaS modernas.

---

## 1. El Manifiesto Negativo (Tolerancia Cero)

Cualquier componente generado que viole alguna de estas reglas se considerará defectuoso:

1. **PROHIBIDO EL USO DE BORDES Y OUTLINES (0px BORDERS):**
   - No uses `border`, `border-*`, `outline`, ni `divide-*`.
   - La jerarquía, la separación y los contenedores se definen **exclusivamente** mediante el contraste tonal de superficies (`#0A0A0A`, `#141414`, `#1F1F1F`, `#282828`) y espaciado negativo generoso.
2. **CERO BADGES O ETIQUETAS DE IA:**
   - Prohibido agregar chips, badges o textos que digan "AI", "Powered by AI", "Generado por IA", "Smart", "Magic" o emojis como destellos/estrellas (✨, 🚀).
3. **CERO ICONOS REDUNDANTES:**
   - No acompañes con iconos a los textos cuyo significado sea obvio (ej. no pongas un icono de lupa junto a "Buscar", ni un diskette junto a "Guardar", ni un lápiz junto a "Editar"). El texto solo es suficiente y más editorial.
4. **CERO PUNTOS DE ESTADO "LIVE" O PULSANTES:**
   - Prohibido el uso de círculos verdes/rojos parpadeantes (`animate-ping`), etiquetas de "Live Status", "Sistema Activo" o telemetría ornamental innecesaria.
5. **CERO ETIQUETAS FLOTANTES EN CAMPOS OBVIOS:**
   - Si la función del input es clara por su contexto, no uses labels encima del campo. Usa un placeholder descriptivo y sobrio integrado directamente en la superficie.
6. **PROHIBIDO EL LAYOUT TIPO BENTO GRID O DEGRADADOS PÚRPURAS:**
   - No recurras a cajas con esquinas de 1px brillante o fondos en degradé morado/cian. Usa layouts editoriales asimétricos, columnas limpias y superficies mate.

---

## 2. Paleta Tonal y Elevación de Superficies

La interfaz vive en la oscuridad absoluta (`#0A0A0A`). La elevación no se proyecta con luz blanca ni bordes, sino mediante capas de gris carbón.

| Nivel de Superficie | HEX | Clase Tailwind / Uso |
| :--- | :--- | :--- |
| **Canvas Base** | `#0A0A0A` | `bg-[#0A0A0A]` - Fondo de la ventana, void y canvas principal. |
| **Superficie Elevada** | `#141414` | `bg-[#141414]` - Paneles laterales, docks, tarjetas de contenido. |
| **Superficie Interactiva** | `#1F1F1F` | `bg-[#1F1F1F]` - Inputs, rieles de tabs, cards secundarias. |
| **Hover / Active State** | `#282828` | `hover:bg-[#282828]` - Estados activos y estados hover. |
| **Acento de Estructura** | `#333333` | `bg-[#333333]` - Indicadores de selección y barras de scroll. |

### Jerarquía Tipográfica de Luminancia
- **Texto Principal:** `#F3F3F3` (`text-[#F3F3F3]`) - Títulos, botones primarios y datos activos.
- **Texto Secundario:** `#A1A1A1` (`text-[#A1A1A1]`) - Descripciones, metadatos y valores de campos.
- **Texto Terciario / Muteado:** `#737373` (`text-[#737373]`) - Placeholders, timestamps y notas auxiliares.

---

## 3. Tipografía y Espaciado (Layout Breathing)

- **Fuente:** `Hanken Grotesk`, sans-serif neo-grotesca.
- **Tracking:** A mayor tamaño de fuente, tracking más cerrado (`tracking-tight` a `tracking-tighter`). En textos pequeños (`11px - 12px`), tracking abierto (`tracking-wider`).
- **Espacio Negativo:** Las vistas deben "respirar". Usa márgenes de contenedor de al menos `px-8 py-10` o `gap-8`. No amontones elementos. Si una vista se siente densa, elimina cajas decorativas en lugar de reducir el texto.

---

## 4. Patrones de Componentes en Tailwind CSS

El agente debe ceñirse a estos patrones exactos al generar código:

### A. Botones (Buttons)
```tsx
// Primario (Monolítico, alto contraste)
<button className="h-10 px-6 rounded-sm bg-[#F3F3F3] text-[#0A0A0A] text-xs font-medium tracking-wide transition-all duration-150 hover:opacity-90 active:scale-[0.98]">
  Ejecutar Prompt
</button>

// Secundario / Tonal (Superficie mate sin bordes)
<button className="h-10 px-5 rounded-sm bg-[#1F1F1F] text-[#F3F3F3] text-xs font-normal transition-colors duration-150 hover:bg-[#282828] active:scale-[0.98]">
  Ver Prompt Origen
</button>

// Fantasma (Editorial)
<button className="h-10 px-4 text-xs text-[#A1A1A1] hover:text-[#F3F3F3] transition-colors duration-150">
  Descartar
</button>
```

### B. Campos de Entrada (Inputs & Textareas)
Sin bordes, superficie integrada `#141414`, focus mediante elevación tonal suave:
```tsx
// Input de texto simple
<input 
  type="text" 
  placeholder="Nicho, producto o propuesta de valor..."
  className="w-full h-12 px-4 rounded-sm bg-[#141414] text-[#F3F3F3] placeholder-[#737373] text-sm focus:bg-[#1F1F1F] focus:outline-none transition-colors duration-150"
/>

// Textarea expansivo para prompts
<textarea 
  rows={5}
  placeholder="Describe las restricciones del diseño..."
  className="w-full p-4 rounded-sm bg-[#141414] text-[#F3F3F3] placeholder-[#737373] text-sm focus:bg-[#1F1F1F] focus:outline-none resize-none transition-colors duration-150 leading-relaxed font-mono"
/>
```

### C. Selector Segmentado / Píldoras de Tecnologías (Tags / Multi-select)
Riel en `#141414`, sin líneas divisorias:
```tsx
<div className="flex flex-wrap gap-2 p-1.5 rounded-full bg-[#141414] max-w-fit">
  {/* Estado No Seleccionado */}
  <button className="px-4 py-1.5 rounded-full text-xs text-[#737373] hover:text-[#A1A1A1] transition-colors duration-150">
    Tailwind
  </button>
  
  {/* Estado Seleccionado (elevación tonal suave, texto blanco) */}
  <button className="px-4 py-1.5 rounded-full bg-[#282828] text-xs text-[#F3F3F3] transition-all duration-150 shadow-sm">
    Next.js
  </button>
</div>
```

### D. Tarjeta de Contenedor (Cards & Surfaces)
Totalmente desprovistas de bordes de 1px. Distinción pura por superficie y sombras difusas profundas:
```tsx
<div className="p-6 rounded-lg bg-[#141414] shadow-[0_8px_24px_-4px_rgba(0,0,0,0.45)] flex flex-col gap-4">
  <h3 className="text-base font-medium text-[#F3F3F3] tracking-tight">
    Minimalismo Bauhaus Suizo
  </h3>
  <p className="text-sm text-[#A1A1A1] leading-relaxed">
    Estructura basada en asimetría funcional, tipografía de alto contraste y eliminación de cuadrículas tradicionales.
  </p>
</div>
```

### E. Split View de Trabajo (Prompt vs Renderizado)
Separación por canal de espacio negativo (`gap-6`), sin barras de división con líneas sólidas:
```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full min-h-[calc(100vh-8rem)]">
  {/* Columna Izquierda: Prompt y Parámetros */}
  <div className="p-6 rounded-lg bg-[#141414] flex flex-col justify-between">
    {/* Contenido */}
  </div>

  {/* Columna Derecha: Vista Previa Limpia */}
  <div className="rounded-lg bg-[#0E0E0E] overflow-hidden flex flex-col">
    {/* Canvas / Iframe */}
  </div>
</div>
```

---

## 5. Micro-copia y Redacción Humana

Al redactar textos dentro de botones, modales o mensajes del sistema:
- **Sé conciso y directo:** Escribe "Crear", no "Generar ahora con IA".
- **Sin verbos grandilocuentes:** Prohibido usar "Revolucionar", "Potenciar", "Desatar", "Empoderar".
- **Reduce la fricción:** "Acceso inmediato" en lugar de "Regístrate hoy para empezar".
# Guía para extender gramáticas visuales V2

La extensión V2 consiste en añadir reglas y combinaciones nuevas al espacio compositivo. No añadas una landing completa como template ni un preset que solo cambie tokens.

## 1. Modelo conceptual

- **Purpose** explica por qué existe un nodo de contenido (`prove`, `explain`, `convert`, etc.). No impone su forma.
- **Content block** almacena copy/dato semántico (`headline`, `quote`, `statistic`, `question`, `diagram`).
- **Morphology/composition** expresa su organización espacial local (`ticker`, `timeline`, `manifesto-close`, `annotated-diagram`).
- **Composition grammar** aporta relaciones globales: grid, ejes, simetría, lectura, balance y ritmo.
- **Surface language** controla material/superficie; **art direction** aporta cultura visual; **ornamentation** los motivos; **density** la carga; **motion language** el tiempo.
- **DesignGenome** es la salida estructurada usada por composer, renderer y auditorías, no metadato informativo.

La secuencia de ejecución es:

```text
BrandBrief + styleSeed + entropySeed
 → CreativeProposalV2 (Gemini: strategy/artDirection/contentArchitecture/visualStrategy)
 → StyleAdapter + DesignGenome (código y named substreams)
 → ContentArchitecturePlanner
 → CompositionGrammarEngine / SpatialComposer
 → MotionGrammar / ResponsivePlanner
 → BlueprintV2 validado
 → PrimitiveRenderer
 → StructureFingerprint / AuditEngineV2 / similarity repair
```

## 2. Añadir una gramática compositiva

1. Añade el identificador a `COMPOSITION_GRAMMARS` en `src/design/styleTaxonomy.ts`.
2. Añade un `StyleAdapterRules` en `STYLE_ADAPTERS`. Describe preferencias de ejes, grid, jerarquía, geometría, posición de media, whitespace, repetición, ornamento y motion. Deben ser preferencias/reglas combinables, no un render completo.
3. Si se trata de una gramática histórica, escribe una prueba con propiedades estructurales verificables (por ejemplo: `gridCharacter='broken'`, eje diagonal posible, overlap controlado), sin exigir screenshot pixel-perfect.
4. Comprueba con seeds distintas que el adapter conserva su invariantes y ofrece alternativas espaciales dentro de la familia.

Ejemplo resumido:

```ts
STYLE_ADAPTERS.constructivism = {
  preferredAxes: ['diagonal', 'horizontal'],
  gridCharacter: 'broken',
  hierarchy: ['direction', 'compressed-scale'],
  geometry: ['bars', 'circles', 'diagonal-planes'],
  imagePlacement: ['photomontage', 'overlap'],
  whitespace: ['compressed', 'directional'],
  repetition: ['rhythmic-bands'],
  ornament: ['poster-marks'],
  motion: ['directional', 'mechanical']
};
```

## 3. Añadir una morfología de región

1. Añade la morfología al array de su purpose en `REGION_MORPHOLOGIES`, en `src/composition/compositionGrammarEngine.ts`.
2. Si hay una regla local derivada del genome, inclúyela en `genomeHints` con purpose compatible. La selección pasa por el stream `region:<id>`; no uses `Math.random`.
3. Añade modificadores de presentación al CSS del `PrimitiveRenderer` usando `.morphology-<slug>`. Cambia composición interna, alineación, eje o tratamiento de contenido; no añadas una página/markup completa por nombre de estilo.
4. Conserva la semántica del DOM: heading, text, CTA, figure y lectura deben sobrevivir aunque se transforme la posición visual.
5. Define el comportamiento responsive correspondiente o deja que `ResponsivePlanner` aplique el fallback apilado con orden DOM lógico.

Ejemplo: `timeline` se añade al purpose `prove`; CSS conecta los items con reglas y secuencia, no los envuelve en tarjetas por defecto. `ticker` puede definir overflow horizontal intencional con `scroll-snap`, teclado y política mobile.

## 4. Añadir un primitive

1. Agrega el nombre al whitelist `PRIMITIVE_NAMES` y tag semántico en `src/render/primitives.ts`.
2. Asegura que atributos permitidos están en allowlist y que `href` solo acepta fragments/`mailto:`/`tel:`.
3. Enlaza un `ContentBlockV2.kind` a ese primitive desde el compositor o agrega un `children[]` node explícito.
4. Mantén los strings escapados antes de llegar al renderer; nunca aceptes un tag/HTML arbitrario del modelo.
5. Añade tests para markup, escaping, landmark/ARIA y reduced-motion/responsive si aplica.

## 5. Añadir otra capa de dirección artística

No mezcles las dimensiones:

- Si la nueva elección cambia espacio/retícula/jerarquía, extiende `compositionGrammar` y su adapter.
- Si cambia superficie/material, agrega `surfaceLanguage` y reglas CSS de material.
- Si aporta tono/cultura visual, agrega un término a `ART_DIRECTIONS`.
- Si aporta ornamento, agrega `ORNAMENTATION_LANGUAGES`.
- Si cambia cantidad/compresión, modifica density.
- Si cambia movimiento, añade motion language y reglas accesibles.

Glassmorphism, por ejemplo, puede combinarse con Swiss; el primero cambia material, el segundo retícula/orden. No asignes a Glassmorphism una estructura compositiva propia.

## 6. Seeds y reproducibilidad

Usa `createSeedStreams(entropySeed)` y un stream nombrado. Seeds de región deben usar `region:<id>`; variaciones locales `local:<element-id>`. No derives toda la composición con `%` de un único número ni consumas una secuencia compartida para decisiones no relacionadas. Cambios incompatibles del algoritmo incrementan `SEED_VERSION`; registra la semilla raíz y mapa de substreams en `GenerationRecord.seedDerivation`.

`styleSeed` es dirección semántica y no se mezcla en el hash de entropía. Cambiar estilo no debe destruir replays de una semilla estructural dada; si se busca variabilidad estructural se cambia `entropySeed`.

## 7. Responsive, motion y accesibilidad

- Responsive puede cambiar rail→snap, collage→capas o radial→secuencia, pero el orden semántico de DOM se conserva. No usar `order` para contradecir el orden de lectura.
- Overlap, sticky y clip quedan dentro de límites; `repairResponsiveComposition` ajusta spans/posiciones y no cambia familia artística.
- Motion deriva del eje/grammar, se desactiva o reduce con `prefers-reduced-motion`; no añadir reveal global idéntico por defecto.
- Verifica landmarks, `h1`, foco visible, contraste, alt text, keyboard/touch, scroll horizontal y viewport safety a 320/390/768/1280 px.

## 8. Similitud, diversidad y curated bank

Actualiza `StructureFingerprint` solo cuando incorpores una decisión estructural nueva. La métrica ignora color/tokens. Añade evidencia al detector si una familia aporta una degeneración genérica; no eleves score por rareza aislada. El `DiversityBenchmark` genera seeds reproducibles y thresholds editables; exige distribución suficiente de familias/morfologías y ratio cards controlado.

Si similarity supera el threshold, `repairCompositionForNovelty` vuelve a generar genome/SpatialComposition con un stream de reparación; conserva strategy, copy y visual asset. La auditoría y `evaluateCuratedBankEligibility()` deben seguir rechazando repetición genérica sin penalizar un layout familiar por parecerse a un SaaS genérico.

## 9. Checklist de validación de una extensión

```text
npm test -- --run src/design src/seed src/composition src/render src/diversity src/audit
npm run build
npm run test:e2e
```

Antes de aceptar una nueva gramática comprueba propiedades del wireframe en grayscale: si dos composiciones difieren solo en color/fuente, el fingerprint debe seguir detectando similitud. Si al quitar tokens de color desaparece la dirección artística, falta una regla compositiva.

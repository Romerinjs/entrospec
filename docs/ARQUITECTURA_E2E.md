# Entrospec: arquitectura técnica E2E (copia UP26-9)

Este documento describe el código presente en `D:\Usuarios\ACER\Documentos\UP26-9\SE-9\page\Entrospec`. La arquitectura de ejecución sigue siendo cliente único React/Vite con Gemini llamado desde el navegador e IndexedDB local. La ruta activa de generación nueva usa Blueprint V2 y gramática espacial; Blueprint V1 se conserva mediante un adaptador para registros y flujos legacy. No hay backend Fastify, jobs durables ni SQLite en esta copia.

## 1. Resumen

La aplicación recopila brief, `styleSeed` semántica, `entropySeed` estructural, novelty budget, riesgo creativo, técnicas y capacidades. `GenerationPipelineV2` solicita a Gemini una propuesta semántica (strategy, art direction y arquitectura de contenido), completa un DesignGenome determinista, compone regiones espaciales por purpose, planifica responsive/motion, renderiza primitivas y calcula auditoría/fingerprint. Imagen Gemini o SVG procedural se integra conforme a VisualStrategy. Los proyectos y activos cacheados permanecen en IndexedDB local.

```text
React/Vite (App)
  ├─ BrandBrief + styleSeed + entropySeed + novelty/risk
  ├─ Prompt synthesis opcional → Gemini desde el navegador
   └─ GenerationPipelineV2
        ├─ Gemini → CreativeProposalV2 / fallback procedural V2
        ├─ ArtDirectionEngine + SeedEngine → DesignGenome y named substreams
        ├─ ContentArchitecturePlanner + CompositionGrammarEngine
        ├─ SpatialComposer + ResponsivePlanner + MotionGrammar
        ├─ VisualStrategy → Gemini/WebP cacheado o SVG procedural
        ├─ PrimitiveRenderer → HTML/CSS/JS inline desde regiones V2
        ├─ StructureFingerprint + Similarity/Genericity + AuditEngineV2
        └─ GenerationRecord (Blueprint V1 compatible + BlueprintV2 opcional)
             ├─ guardar draft/curated → IndexedDB
             └─ preview sandbox / inspección / banco
```

## 2. Gestión de “proyectos” y persistencia

En esta revisión sí hay un `ProjectRepository` local que administra proyectos generados. No existe backend de generación en el árbol revisado.

- El registro de dominio es `GenerationRecord`: ID, request, blueprint, HTML, visual, auditoría, conteo de llamadas, fecha de creación y colección (`draft` o `curated`).
- `src/storage/projectRepository.ts` persiste estos registros en IndexedDB `entrospec`, object store `projects`, con índices por `collection` y `createdAt`.
- `saveDraft()` guarda como `draft`. `saveCurated()` guarda como `curated` solo si la auditoría aprueba y su promedio es al menos 8.5.
- `listDrafts()` y `listCurated()` alimentan respectivamente el trabajo guardado y el banco curado. `deleteProject()` quita un registro por ID.
- El store `visualAssets` guarda imágenes cacheadas por `cacheKey`; el store `meta` está creado para metadatos, pero en el código revisado no participa en el flujo principal.
- `migrateLegacyProjects()` importa el arreglo `entrospec_landing_bank` de localStorage a IndexedDB como drafts legacy y después elimina la clave antigua.
- La persistencia es local al navegador/origen; no hay sincronización con servidor ni recuperación del proyecto desde otro dispositivo.

El brief y el progreso de una generación activa se guardan en estado React. Al completar, la aplicación forma un `GenerationRecord`; la acción de guardar del usuario lo persiste como draft o curated. El registro completo incluye el HTML generado, por lo que abrir una entrada recupera su salida sin regenerarla.

## 3. Componentes y responsabilidades

### Interfaz y coordinación

- `src/App.tsx`: estado de Studio, brief, semilla, técnicas, capacidades, prompt, ejecución, vista previa y banco. Conecta el repositorio local, gateway y pipeline.
- `src/components/BrandBriefForm.tsx`: captura brief y referencia visual.
- `src/generation/promptComposer.ts`: construye prompt maestro y candidatos de prompt por técnica.
- `src/core/ssotEngine.ts`: produce semilla/vectores deterministas a partir de la semilla visible.
- `src/components/PromptViewer.tsx` y `PromptExecutionConsole.tsx`: edición/síntesis del prompt y ejecución.
- `src/components/SandboxPreview.tsx`: muestra el HTML en sandbox y acciones para guardarlo.
- `src/components/GenerationInspector.tsx`: expone blueprint, auditoría y datos de generación.
- `src/components/LandingBank.tsx`: permite recuperar proyectos curados desde IndexedDB.

### Generación

- `src/generation/generationPipeline.ts`: orquesta blueprint, visual, render, auditoría y `GenerationRecord`.
- `src/services/geminiGateway.ts`: llamadas `fetch` a Gemini, parsing/validación de blueprint, generación de imágenes, síntesis de prompt y test de conexión.
- `src/generation/blueprintSchema.ts`: sanea y valida estructura/schema version 1 de blueprint.
- `src/generation/proceduralBlueprint.ts`: alternativa determinista sin llamada de texto.
- `src/generation/visualAssets.ts`: visual SVG procedural, normalización y clave de caché.
- `src/generation/nativeRenderer.ts`: convierte blueprint y assets a documento de landing autónomo.
- `src/generation/documentValidator.ts`, `techniqueValidators.ts`, `auditEngine.ts`: validan estructura/documento y evidencia observable de técnicas; calculan auditoría.

## 4. Flujo de ejecución de punta a punta

1. **Entrada**: el usuario completa brief, selecciona técnicas/capacidades, fija o cambia semilla, configura modo visual y referencia opcional. El cliente compone prompt maestro; también puede pedir al gateway una síntesis de prompt distinta.
2. **Selección del modo**: `App` calcula `executionMode` a partir de técnicas activas: `image_only`, `full`, `seed_only` o `combined_techniques`. El pipeline también admite `procedural` y `multi_prompt` en los tipos; las variantes generadas por torneo ejecutan candidatos individualmente en modo `seed_only`.
3. **Blueprint**: `createGenerationPipeline.run()` aborta la ejecución previa de esa instancia, crea `AbortController` y emite etapas. Reutiliza blueprint existente en `image_only`; en `procedural` deriva uno local; en los demás modos pide a Gemini un JSON conforme al schema. La respuesta se sanea y valida.
4. **Fallback de blueprint**: si Gemini falla y `allowFallback` es verdadero, el pipeline crea un blueprint procedural. La UI principal envía `allowFallback: false`, así que una falla de blueprint normalmente termina en error visible y no cambia silenciosamente a blueprint procedural.
5. **Visual**: sin modo de generación de imagen se produce SVG a partir de semilla y tokens. Si requiere imagen, se calcula una cache key SHA-256 a partir de prompt, semilla y referencia; se reutiliza IndexedDB si existe o solicita imagen a Gemini, valida MIME, comprime en el navegador a WebP (máximo 1600×1200, calidad 0.78) y cachea el resultado.
6. **Fallback de imagen**: cuando se pidió imagen y la llamada/compresión falla, `allowFallback: true` permite una imagen procedural; con el valor que pasa la UI (`false`) el pipeline propaga el error.
7. **Render**: `renderLandingDocument()` escoge arquetipo de layout usando la pista de diseño y la semilla, determina header, crea hero y secciones, escapa contenido HTML y aplica capacidades: animación CSS/IntersectionObserver, navegación JS y canvas opcional. CSS y script se escriben inline; imagen se inserta como data URL. El renderer no hace una segunda llamada al modelo.
8. **Auditoría**: `auditLanding()` ejecuta `validateGeneratedDocument()` y `validateTechniques()`. Genera checks/evidencia por técnica, bloqueos, puntuaciones de distintividad, UX, CRO y fidelidad del stack; `passesBank` requiere promedio ≥ 8.5 y ningún bloqueo.
9. **Resultado**: se crea `GenerationRecord` con request, origen del blueprint, HTML, visual, auditoría y llamadas contabilizadas; se emite `complete` y la UI muestra preview/inspector. Errores emiten `failed`; cancelación aborta el controller activo.
10. **Persistencia curada**: el usuario puede guardar draft o guardar en banco. La escritura curated vuelve a comprobar gate de auditoría; el banco se consulta en IndexedDB.

## 5. Contratos principales

### GenerationRequest

En `src/generation/types.ts` contiene:

- `brief`: marca, industria, propuesta de valor, audiencia, personalidad, tono, CTA y preferencias opcionales.
- `executedPrompt`, `ssotSeed`, `activeTechniqueIds`, `imageMode`, `capabilities`.
- `visualReference`: data URL y MIME (opcional).
- `executionMode`, `existingBlueprint` y `allowFallback` (opcionales).

### LandingBlueprint (schemaVersion 1)

Es una especificación estructurada y validada, no HTML generado por Gemini. Incluye interpretación de marca, design tokens, layout, secciones tipadas (hero/proof/feature/faq/cta/footer), dirección visual, plan de interacciones, evidencia/plan de técnicas, restricciones y metadata/semilla.

### GenerationRecord

Es la unidad guardada localmente. Contiene el request que dio origen al resultado, blueprint, HTML final, imagen/visual, auditoría, consumo calculado de llamadas y colección. El valor `collection` se fija en la operación de repositorio como `draft` o `curated`.

## 6. Gemini y consumo de llamadas

El gateway usa endpoint Gemini configurable (por defecto `generativelanguage.googleapis.com/v1beta/models`) y clave/modelos de variables Vite. Tiene rutas separadas para blueprint JSON, imagen, síntesis de prompt y test de conexión. Para blueprint e imagen intenta lista de modelos principal/fallback; los fallos se mapean a códigos de generación y se propaga cancelación mediante `AbortSignal`.

El pipeline contabiliza en `callsUsed` llamadas de blueprint (`textCalls`) e imagen (`imageCalls`); la caché visual evita contar/realizar una nueva llamada de imagen. La síntesis de prompt y el test de conexión se ejecutan desde handlers separados en `App` y no forman parte de esas cifras del `GenerationRecord`.

## 7. Seguridad y confianza del cliente

En esta copia `src/App.tsx` lee `VITE_GEMINI_API_KEY` y pasa la clave al gateway que corre en el navegador. Toda variable prefijada `VITE_` que se use en el cliente puede incluirse en el bundle/ser visible para usuarios del sitio; por tanto, esta implementación no mantiene la credencial de Gemini como secreto de servidor. El `.env.example` confirma el nombre de variable esperado. El gateway construye URL con `?key=...` y llama directamente a Google.

Las respuestas de texto se validan contra el blueprint schema antes de renderizarse y el renderer escapa strings para HTML/atributos. Las referencias se envían como inlineData a Gemini. No hay capa API propia que oculte secretos, limite llamadas por usuario o persista ejecuciones centralmente en esta versión.

## 8. Pruebas y ejecución

Scripts definidos en `package.json`:

- `npm run dev`: servidor Vite de desarrollo.
- `npm run build`: `tsc` y build frontend Vite.
- `npm test`: Vitest unitario/componentes.
- `npm run test:e2e`: Playwright.
- `npm run test:real`: test live de Gemini habilitado con `VITE_GEMINI_REAL_TEST=1`.

Cobertura representativa:

- Unit tests para pipeline, gateway, schema, renderer, auditoría, validadores, cache visual, IndexedDB/repository, componentes y hook/estado UI.
- `tests/e2e/generation.spec.ts` intercepta la API Gemini con fixtures: verifica generación, preview, paso al banco y mensaje accionable ante 429.
- `src/services/geminiGateway.live.test.ts` prueba integración real solo cuando se habilita expresamente.

## 9. Recorrido resumido

```text
Brief + prompt + semilla
   → (opcional) síntesis de prompt con Gemini
   → pipeline: blueprint de Gemini o procedural
   → imagen de Gemini/caché o SVG procedural
   → compilación nativa HTML
   → validación y auditoría local
   → GenerationRecord en React
   → preview en sandbox
   → guardar en IndexedDB como draft o curated
   → reabrir desde banco local
```

## 10. Diferencias importantes frente a una arquitectura servidor

Esta revisión guarda projects y assets en IndexedDB del navegador, ejecuta generación en el mismo cliente, no tiene jobs durables/SSE/reintentos server-side ni store de artefactos compartido. La generación depende de la pestaña y del navegador; `AbortController` cancela la ejecución activa y no hay reanudación de trabajo tras cerrar/reiniciar la app. Esto es una descripción de la arquitectura presente en esta ruta, no de otras copias o commits posteriores del repositorio.

## 11. Arquitectura generativa V2 (activa para generaciones nuevas)

- `src/design/blueprintV2.ts` contiene estrategia, ArtDirection, DesignGenome, ContentArchitecture y regiones `purpose + composition + spatialRole + placement`; sus morfologías son extensibles, no un enum de hero/proof/features/FAQ.
- `src/design/styleTaxonomy.ts` separa gramática compositiva, surface language, art direction, ornamentación, densidad y motion; sus adapters describen reglas preferidas, no páginas plantilla.
- `src/seed/seedEngine.ts` deriva streams reproducibles nombrados (`composition`, `grid`, `hero`, `region:<id>`, etc.) de `entropySeed` y `seedVersion`; `styleSeed` expresa el universo visual, no variabilidad.
- `src/composition/compositionGrammarEngine.ts` asocia morfologías disponibles al propósito (prove puede ser ticker, giant number, quote, timeline o annotated chart). `SpatialComposer` calcula placements/overlap por seed local; `ResponsivePlanner` transforma la composición sin reordenar el DOM semántico; `MotionGrammar` conduce reveals en eje/morfología.
- `src/render/primitiveRenderer.ts` usa primitivas semánticas compartidas de `src/render/primitives.ts`. El genome gobierna retícula, ejes, espaciado, escala tipográfica, superficie, geometría, ornamentación, navegación, recorte visual, movimiento y responsive. El render conserva la composición elegida en vez de convertirla de nuevo en los layouts V1.
- `src/diversity/structureFingerprint.ts`, `similarityDetector.ts`, `compositionRepair.ts`, `genericityDetector.ts` y `diversityBenchmark.ts` calculan similitud sin tokens cromáticos, reparan solo composición ante duplicados y miden distribución de 30 seeds.
- `src/audit/auditEngineV2.ts` separa funcionalidad, accesibilidad, CRO, fidelidad artística, diversidad, genericidad, responsividad y repetición. `curatedBankGate.ts` agrega una admisión V2 que limita genericidad/cards y similitud además de respetar los requisitos funcionales.
- `src/design/blueprintV1Adapter.ts` y `blueprintV2Projection.ts` preservan lectura de registros V1; cada registro nuevo puede almacenar `blueprintV2`, `auditV2`, `structureFingerprint`, versiones de engine/grammar y mapa de seeds junto a campos V1 de compatibilidad.

Diseño, dependencias, migración incremental, riesgos y pruebas están en `docs/REFACTORIZACION_ARQUITECTONICA_V2.md`. La guía para extender adapters, morfologías y primitivas está en `docs/GRAMATICAS_VISUALES_V2.md`.

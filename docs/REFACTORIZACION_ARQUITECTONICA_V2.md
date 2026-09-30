# Refactorización arquitectónica Entrospec V2

## Alcance y línea base

La línea base de esta propuesta es la copia funcional del proyecto en `D:\Usuarios\ACER\Documentos\UP26-9\SE-9\page\Entrospec`. El flujo actual es frontend React/Vite → GeminiGateway en el navegador → `LandingBlueprint` v1 → `NativeRenderer` → audit local → `GenerationRecord` → IndexedDB. Esta propuesta no usa como baseline el prototipo de jobs Fastify/SQLite existente en otra ruta.

## A. Diagnóstico del sesgo estructural

El sesgo no nace únicamente del prompt; está impuesto en todas las fronteras del sistema:

1. `src/generation/types.ts`: `LandingSection.type` solo admite `hero | proof | feature | faq | cta | footer`. `LandingBlueprint` requiere `sections`, `layout` y un hero implícito, sin expresar propósito separado de contenido/presentación ni regiones espaciales libres.
2. `src/generation/blueprintSchema.ts`: el schema de Gemini limita `type` a ese enum; `validateBlueprint()` exige al menos tres secciones, hero con heading y CTA y dirección de imagen. `sanitizeBlueprint()` inserta metadata/visual/CTA y evidencia faltantes, creando además un seed aleatorio con `Math.random` cuando falta.
3. `src/generation/promptComposer.ts`: instruye explícitamente a escoger arquetipos en `layout.style` y a combinar hero, feature, proof, FAQ y CTA; los ejemplos codifican layouts reconocibles y el orden convencional.
4. `src/generation/generationPipeline.ts`: la pipeline acepta V1, pide el blueprint, selecciona visual por modo/técnica, llama al renderer V1 y audita. No existe representación espacial intermedia.
5. `src/generation/nativeRenderer.ts`: tiene autoridad creativa posterior al modelo: `resolveLayoutArchetype()` convierte texto a uno de pocos arquetipos; `renderHero()` selecciona un layout de hero; `renderSectionItems()` asigna features a grid, proof a métricas y FAQ a `<details>`; CTA se representa como banner. El CSS mantiene una estructura y orden comunes.
6. `src/generation/proceduralBlueprint.ts`: fallback vuelve a emitir el mismo vocabulario V1 y produce proof/features/CTA predeterminados; el hash global selecciona solo una opción de cinco estilos.
7. `src/generation/techniqueValidators.ts` y `auditEngine.ts`: la medición es evidencia técnica/V1, no distingue coherencia de gramática, diversidad estructural ni genericidad. El gate curated mide promedio y bloqueos, sin comparación con el banco.
8. `src/core/ssotEngine.ts`: cuatro chunks tienen decisiones fijas (retícula, paleta, stack, hero); las sumas/modulos colapsan valores distintos. No hay streams nombrados ni seed separado para intención estilística.
9. `GenerationRecord`, `GenerationInspector` y `LandingBank`: guardan/inspeccionan request, blueprint V1, HTML, visual y auditoría; no hay genome/fingerprint ni memoria estadística del banco.

**Conclusión:** incluso un prompt libre no puede atravesar el schema y renderer sin ser normalizado a una familia común. La sustitución de prompts aislada no resuelve el problema.

## B. Mapa actual de dependencias

```text
App
 ├─ promptComposer + ssotEngine
 ├─ GenerationPipeline
 │   ├─ GeminiGateway → blueprintSchema (sanitize + validate V1)
 │   ├─ visualAssets + ProjectRepository.visualAssets
 │   ├─ NativeRenderer (layout/sections decididos aquí)
 │   └─ AuditEngine → DocumentValidator + TechniqueValidators
 ├─ GenerationRecord → ProjectRepository.projects (IndexedDB)
 ├─ SandboxPreview / GenerationInspector
 └─ LandingBank
```

El contrato V1 circula entre gateway, pipeline, renderer, auditoría, componentes, fixtures E2E y registros IndexedDB. Por eso V2 debe añadirse como unión discriminada/adaptador, no sustituyendo el valor persistido de drafts existentes.

## C. Blueprint V2 propuesto

V2 es un contrato con `schemaVersion: 2` dividido en:

- `strategy`: objetivo, audiencia, promesa, funnel, claims y contenido obligatorio.
- `artDirection`: composición, superficie, arte, ornamentación, densidad y movimiento como ejes separados; referencias y regla de precedencia.
- `designGenome`: decisiones estructurales efectivas (grid, ejes, ritmo, densidad, overlap, morfologías, navegación, CTA y patrones prohibidos).
- `compositionGrammar`: reglas espaciales globales y locales derivadas, semilla/versiones y presupuesto novelty/risk.
- `contentArchitecture`: nodos con `purpose`, `content` tipado, prioridad/dependencias; no enum de secciones visuales.
- `regions`: `id`, `purpose`, `composition`, `spatialRole`, placement, recursos visuales/tipográficos y children genéricos.
- `visualStrategy`, `typographySystem`, `geometrySystem`, `surfaceSystem`, `motionGrammar`, `responsiveStrategy`, `interactionPlan`, `constraints`, `diversityMetadata`.

Una región no equivale a un componente visual: `purpose=prove` se puede expresar como tira editorial, quote, gráfico anotado, timeline, ticker o campo tipográfico. `content` conserva la semántica comercial mientras `composition` determina la representación.

## Decisiones explícitas de dominio

- **Style** es una selección semántica multidimensional; no es un layout ni una paleta.
- **CompositionGrammar** controla relaciones espaciales, retícula, ejes y jerarquía.
- **Morphology** es la forma local con que se presenta una intención (p.ej. proof como ticker).
- **ArtDirection** determina tono cultural/material y principios, no un template.
- **DesignGenome** es el conjunto normalizado y ejecutable de decisiones estructurales que recibe el renderer.
- Precedencia: `CompositionGrammar → espacio`; `SurfaceLanguage → materiales`; `ArtDirection → tono cultural`; `Ornamentation → motivos`; `Density → cantidad/compresión`; `MotionLanguage → comportamiento temporal`. El adapter explica mezclas y conflictos.

## D. Estrategia de migración

1. Añadir V2 y motores puros sin modificar el comportamiento por defecto de V1.
2. Crear `BlueprintV1Adapter` (V1 → representación normalizada V2) y una ruta renderer V2; mantener render V1 para proyectos guardados legacy.
3. Añadir almacenamiento de genome/fingerprint como campos opcionales a `GenerationRecord`; IndexedDB acepta records existentes sin migración destructiva.
4. Incorporar llamada/generación V2 detrás de `schemaVersion`/feature switch; validar y renderizar V2 sin reinterpretar su composición.
5. Añadir auditores y métricas a inspector/banco; primero advertencias y medición, luego gate configurable por diversidad.
6. Cuando golden, E2E y benchmark prueben paridad funcional y mayor diversidad, cambiar generación nueva a V2. V1 se mantiene para cargar/regenerar registros anteriores.

## E. Plan por fases

1. **Modelos y determinismo:** tipos V2, StyleTaxonomy, DesignGenome, SeedEngine con streams nombrados y tests de reproducibilidad.
2. **Blueprint/schema:** schema V2, normalización, límites y adapter V1→V2.
3. **Art Direction y gramática:** adapters basados en reglas, composición seedada, planner de contenido independiente y `SpatialComposition`.
4. **SpatialComposer y responsive/motion:** morfología por propósito; ritmos heterogéneos; transformaciones mobile con garantías.
5. **PrimitiveRenderer:** primitivas semánticas genéricas; ejecución de la composición sin seleccionar hero/cards/FAQ por detrás.
6. **Diversity:** StructureFingerprint, similitud, genericidad, métricas de tarjetas/ritmo y benchmark de seeds.
7. **Auditoría V2:** accesibilidad/función/CRO separados de dirección, diversidad, genericidad y fidelidad; reglas repair que no cambian familia/jerarquía.
8. **Integración UI/storage:** pipeline, record, inspector, banco y visualización comparativa; carga legacy sin pérdida.
9. **Verificación:** unit/golden, E2E en viewports, benchmark N seeds y controles de regresión offline/seguridad.

## F. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Cambiar archivos actualmente modificados por trabajo local | Añadir módulos pequeños nuevos; parches localizados; preservar cambios preexistentes. |
| Complejidad del schema/modelo supera calidad de JSON remoto | schema acotado pero extensible, validación por fases, límites de arrays/longitudes y motores deterministas que completan solo campos derivados. |
| Libertad espacial causa overflow, lectura rota o accesibilidad pobre | placement declarativo con rangos, DOM semántico, planner responsive, validators y repair local de spans/tamaño/orden visual. |
| Cambiar una composición ante fallo destruye dirección | repair conserva genome/art direction/familia; nunca fallback automático a template V1. |
| Aleatoriedad rompe repetibilidad | PRNG con hash estable, named streams versionados; no usar `Math.random` en decisiones estructurales. |
| Métrica premia rareza incoherente | puntuar distintividad separada de coherencia/UX; novelty configurable y límites de legibilidad. |
| Similitud local incompleta/escasa historia | comparar además variantes del benchmark/banco; explicar features y threshold; manejar historial vacío. |
| Aumento de bundle/render cost | APIs nativas, composición declarativa, evitar dependencias de runtime grandes. |
| Cambios rompen fixtures y registros V1 | discriminación por schemaVersion y adapter; conservar legacy renderer y tests existentes. |

## G. Pruebas requeridas

- SeedEngine: estabilidad, streams independientes, cambio de seed y versionado.
- Taxonomía/adapters: Swiss vs Constructivist, Glassmorphism no cambia gramática, conflictos con precedencia.
- Schema V2: valida purpose/content/composition libres controlados y rechaza payload inseguro/excesivo; V1 adapter conserva copy/CTA.
- Composition: misma entrada da mismo genome/composición; seeds distintos recorren gramáticas/morfologías sin asumir unicidad por cada par.
- Renderer: no reconstruye secciones por tipo V1; output autónomo, semántico, safe strings y reglas responsive.
- Diversity: mismo wireframe con color diferente puntúa similar; arquitecturas distintas con copy equivalente puntúan distintas; mide cardDependencyRatio/ritmo.
- A11y/layout: orden DOM, contraste, foco, reduced motion, overflow 320/390/768/1280, targets táctiles.
- Pipeline/IndexedDB/UI: ejecución v2, cancelación/error, persistencia/recarga, load legacy y admisión curated.
- E2E: wireframes visualmente estructurales por familias; no pixel-perfect; inspector muestra por qué se tomó composición.
- Benchmark configurable N seeds: distribución de familias/morfologías, similitud media y ratio cards; thresholds documentados y reproducibles.

## Criterio de responsabilidad modelo/código

Gemini propone interpretación, art direction semántica, arquitectura de contenidos, relaciones creativas y opciones de morfología. Código deriva streams, restringe schema, decide placement concreto reproducible, compone regiones, renderiza primitives, calcula fingerprints/similitud, aplica responsive safety y audita. El renderer puede clamping/sanear/reparar medidas; tiene prohibido convertir una composición elegida a un arquetipo convencional.

## Estado de implementación

La implementación actual está integrada en el Studio de esta copia. La generación nueva usa V2 por defecto; el pipeline V1 permanece disponible para compatibilidad y el adaptador conserva registros anteriores.

Implementado en este cambio:

- contratos BlueprintV2/DesignGenome, taxonomía multidimensional, adapters compositivos y SeedEngine con named substreams versionados;
- propuesta creativa V2 y prompt estructural, ContentArchitecturePlanner, gramática espacial, SpatialComposer, reglas de morfologías, responsive/motion planners y repair acotado;
- PrimitiveRenderer semántico que usa el spatial composition, visual strategy, Genome y CSS/JS autónomos;
- fingerprint, score de similitud, reparación compositiva sin regenerar contenido, detector de genericidad, auditoría V2 y banco diversity gate;
- `GenerationRecord` extendido de manera opcional, inspector Genome/Composition/Fingerprint, resumen del banco, debug view y scorer multidimensional para torneo;
- adapters de V1, pruebas de seed determinista, schema, composición, render, similitud, auditoría, gate y pipeline.

La arquitectura se mantiene incremental: los registros V1 no se reescriben; se adaptan para representar/renderizar cuando se abren o se procesan. La auditoría de navegador avanzada y la medición visual en browser siguen siendo una etapa posterior; `AuditEngineV2` actualmente combina validación documental estática con evidencia estructural y responsive declarativa.

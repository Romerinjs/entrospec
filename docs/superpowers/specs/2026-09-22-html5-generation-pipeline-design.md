# Entrospec: pipeline local de generación HTML5 verificable

**Fecha:** 2026-09-22  
**Estado:** Diseño aprobado, pendiente de plan de implementación  
**Alcance:** Studio, integración con Gemini, generación visual híbrida, auditoría de técnicas y Banco de Landing Pages

## 1. Objetivo

Entrospec debe construir una landing page completa dentro de la propia aplicación a partir de un brief o de un prompt editable. Cada resultado debe ser un único documento autocontenido compuesto exclusivamente por HTML5, CSS nativo y JavaScript vanilla.

La generación debe representar la marca, variar de forma significativa según la semilla y las técnicas elegidas, ofrecer un visual hero real o procedural, demostrar qué técnicas fueron aplicadas y conservar en el banco la relación exacta entre landing, prompt, marca, semilla y auditoría.

## 2. Criterios de éxito

La solución se considerará terminada cuando:

1. El usuario pueda introducir datos de marca, cargar un logo o referencia opcional, revisar el prompt resultante y ejecutarlo desde Entrospec.
2. La salida siempre sea un solo archivo HTML5 con CSS y JavaScript embebidos, sin frameworks, CDN, imports, módulos o solicitudes de red en tiempo de ejecución.
3. Una técnica activada produzca evidencia verificable; una técnica desactivada no sea obligatoria ni reciba crédito.
4. La técnica de imagen genere como máximo un activo por ejecución y utilice un visual SVG/Canvas procedural si la generación falla o está desactivada.
5. La aplicación muestre errores reales y no sustituya silenciosamente una generación fallida por una plantilla genérica.
6. Solo los resultados con promedio NoveltyBench igual o superior a 8.5 y sin fallos bloqueantes puedan entrar al banco curado.
7. El Banco muestre la landing junto al prompt exacto que la produjo y permita reabrirla de manera reproducible.
8. Existan pruebas automatizadas sin consumo de API y una guía de pruebas manuales y reales.

## 3. Restricciones acordadas

- La aplicación se ejecutará únicamente en local.
- La clave de Gemini podrá seguir configurándose en el cliente local, con una advertencia visible de que no es una arquitectura apta para despliegue público.
- El resultado generado no utilizará React, Next.js, Tailwind, Three.js, GSAP, Framer Motion ni otra dependencia.
- El resultado no dependerá de Google Fonts, imágenes remotas u otros recursos externos.
- La aplicación Entrospec puede seguir construida con React y Tailwind; la restricción aplica al documento generado.
- Se priorizará un consumo predecible: una llamada de texto por construcción y, únicamente cuando se solicite, una llamada adicional de imagen.
- No habrá ciclos automáticos de múltiples llamadas. Una refinación adicional siempre será iniciada por el usuario.

## 4. Enfoques considerados

### 4.1. HTML libre en una sola llamada

Mantener el flujo actual y mejorar el prompt sería sencillo, pero no permitiría garantizar estructura, técnicas, dependencias o completitud. También conservaría el problema de respuestas truncadas y auditorías débiles.

### 4.2. Blueprint estructurado y compilador determinista — seleccionado

Gemini devuelve contenido y dirección creativa mediante un JSON sujeto a esquema. Entrospec valida ese blueprint y lo compila con un renderer controlado. Este enfoque separa decisiones creativas de garantías técnicas, permite pruebas sin API y reduce el consumo a una llamada textual.

### 4.3. Creator–Critic completamente generativo

Varias llamadas generarían, criticarían y reescribirían el HTML. Aunque ofrecerían más libertad, aumentarían costo, latencia y variabilidad. Se descarta para el flujo normal.

## 5. Arquitectura propuesta

```text
Brief + prompt editable + referencias visuales
                    |
                    v
       Constructor de solicitud de generación
                    |
                    v
     Gemini texto -> Blueprint JSON estructurado
                    |
                    v
        Validador sintáctico y semántico
                 /     \
                v       v
     Gemini imagen    Visual procedural
      (opcional)       SVG/Canvas
                 \     /
                    v
       Compilador HTML5 determinista
                    |
                    v
       Validador de documento y técnicas
                    |
                    v
 Preview / Código / Auditoría / Borrador o Banco
```

### 5.1. Unidades principales

- **BrandBrief:** datos normalizados de marca y objetivo comercial.
- **PromptComposer:** crea el prompt visible a partir del brief, semilla y técnicas.
- **GenerationGateway:** única frontera con Gemini; devuelve resultados y errores tipados.
- **BlueprintValidator:** valida el esquema y la coherencia mínima antes de compilar.
- **VisualAssetPipeline:** genera, comprime, almacena y reutiliza el visual hero.
- **NativeLandingRenderer:** transforma el blueprint en HTML5, CSS y JavaScript vanilla.
- **TechniqueValidators:** ocho validadores independientes con evidencia concreta.
- **DocumentValidator:** comprueba autocontención, semántica, accesibilidad y ausencia de dependencias.
- **NoveltyAuditEngine:** calcula puntuaciones únicamente desde comprobaciones observables.
- **ProjectRepository:** persiste borradores, proyectos curados, referencias y activos en IndexedDB.

## 6. Modelo de entrada

`BrandBrief` contendrá:

- `brandName`
- `industry`
- `valueProposition`
- `targetAudience`
- `brandPersonality`
- `toneOfVoice`
- `primaryAction`
- `preferredColors` opcional
- `avoidColors` opcional
- `logoReference` opcional
- `visualReference` opcional

El formulario compondrá un prompt inicial, pero el prompt maestro será editable. El texto exacto ejecutado se congelará dentro del registro de generación y será el que aparezca en el banco.

Las referencias visuales se enviarán como partes multimodales de la misma solicitud textual cuando el modelo configurado las admita. El prompt nunca dependerá de que exista una referencia.

## 7. Blueprint de generación

Gemini deberá responder un objeto JSON con, como mínimo:

- `brandInterpretation`: atributos visuales y verbales derivados de la marca.
- `designTokens`: colores hexadecimales, familias tipográficas del sistema, escala, espaciado y radios permitidos.
- `layout`: dirección compositiva y estructura responsive.
- `sections`: contenido semántico, jerarquía, CTA y propósito de cada sección.
- `visualDirection`: sujeto, composición, materiales, iluminación y prompt del hero.
- `interactionPlan`: interacciones nativas, disparadores y comportamiento con movimiento reducido.
- `techniquePlan`: evidencia esperada para cada técnica activa.
- `negativeConstraints`: patrones que el resultado debe evitar.
- `metadata`: semilla, versión del esquema y título sugerido.

El esquema no contendrá HTML libre como fuente de verdad. El texto y las decisiones creativas vienen de Gemini; la estructura ejecutable la produce el renderer.

## 8. Contratos de las ocho técnicas

### Técnica 1 — SSoT

- Debe existir una semilla válida de 24 a 32 caracteres.
- Deben almacenarse sus cuatro chunks y el mapeo efectivo a composición, color, interacción y psicología.
- La auditoría comparará el blueprint y el resultado con ese vector.

### Técnica 2 — Prompt ambicioso y persuasión

- El blueprint debe identificar audiencia, sofisticación del mercado, objeciones y respuesta a cada objeción.
- Al menos una objeción debe aparecer resuelta en la landing sin convertirse en contenido técnico ornamental.

### Técnica 3 — Creator–Critic

- En el flujo de bajo consumo, el crítico será determinista y local.
- Evaluará originalidad, comprensión en menos de tres segundos, conversión y fidelidad técnica.
- Una refinación generativa posterior será manual y mostrará el consumo previsto.

### Técnica 4 — Imagen generativa

- Activa: se permite una llamada a un modelo de imagen configurable.
- El resultado se redimensionará y comprimirá a WebP antes de insertarse como `data:`.
- Se almacenará con una clave de caché derivada de prompt, semilla y referencia.
- Ante error se usará un SVG/Canvas procedural y se registrará la degradación.

### Técnica 5 — Motion

- Debe existir al menos una interacción o animación funcional con propósito explícito.
- Debe respetar `prefers-reduced-motion`.
- No se aceptarán animaciones dispersas puramente decorativas.

### Técnica 6 — Diseño sustractivo

- Se limitarán contenedores redundantes, densidad decorativa y repetición visual.
- El CTA y la propuesta de valor deben dominar la jerarquía.
- El diagnóstico indicará métricas observadas, no afirmará una reducción del 30 % sin evidencia.

### Técnica 7 — Restricciones anti-slop

- Se escanearán términos prohibidos, emojis decorativos, gradientes púrpura/cian genéricos, bento grids previsibles, badges de IA y telemetría ficticia.
- Las excepciones deberán estar justificadas por la identidad de marca, no por el modelo.

### Técnica 8 — Redacción humana

- El CTA describirá una acción y un beneficio concreto.
- El copy evitará clichés, voz pasiva innecesaria y afirmaciones técnicas inventadas.
- La longitud, contraste y legibilidad se validarán localmente.

## 9. Generación visual híbrida

El modo híbrido tendrá tres estados visibles:

- **Generado:** Gemini produjo un activo válido y este fue integrado.
- **Procedural:** la técnica de imagen estaba desactivada o el usuario eligió no consumir una llamada.
- **Respaldo procedural:** se solicitó imagen, pero la llamada falló o el activo no superó validaciones.

Se generará como máximo una imagen hero por construcción. El activo se comprimirá antes de persistirlo e incluirlo. El tamaño objetivo y calidad WebP serán configurables; el validador advertirá cuando el HTML supere el presupuesto establecido.

El fallback no intentará imitar una fotografía. Será una composición SVG o Canvas deliberada, basada en los tokens, la semilla y el concepto de marca.

## 10. Compilador HTML5 nativo

El renderer producirá:

- `<!DOCTYPE html>` y metadatos completos.
- HTML semántico con `header`, `nav`, `main`, `section` y `footer` cuando correspondan.
- Un bloque `<style>` con tokens y responsive design mobile-first.
- Un bloque `<script>` sin módulos, imports ni dependencias.
- Imagen integrada mediante data URI o visual procedural inline.
- Estados de foco visibles, navegación por teclado y contraste suficiente.
- Comportamiento para `prefers-reduced-motion`.
- Copia segura de datos del brief; los valores se escaparán antes de insertarse.

El resultado no contendrá:

- `<script src>` o `<link>` remoto.
- `fetch`, `XMLHttpRequest`, WebSocket o importaciones dinámicas.
- referencias `http://` o `https://` necesarias para renderizar.
- clases o inicializadores propios de frameworks.

## 11. Auditoría y admisión al banco

La auditoría conservará cuatro dimensiones de 1 a 10:

- **Distinctiveness:** variación de composición, tokens derivados y ausencia de patrones genéricos.
- **Usability UX:** claridad, semántica, navegación, responsive design y movimiento reducido.
- **Conversion CRO:** propuesta, CTA, objeciones, confianza y microcopy.
- **Stack fidelity:** documento autocontenido, JavaScript funcional y ausencia de dependencias.

Cada puntuación se calculará a partir de verificaciones con pesos declarados. No habrá puntajes base cercanos a aprobación. Cada resultado incluirá:

- estado por técnica: `applied`, `partial`, `failed` o `not_requested`;
- lista de evidencias con ubicación y descripción;
- penalizaciones;
- fallos bloqueantes;
- recomendaciones accionables.

La admisión al banco exige:

1. promedio mínimo de 8.5;
2. cero fallos bloqueantes;
3. documento autocontenido;
4. evidencia suficiente para todas las técnicas activas.

Los demás resultados podrán guardarse como borradores separados del banco curado.

## 12. Interfaz

### 12.1. Studio

- Panel de brief de marca y referencias.
- Contrato de salida permanente: “HTML5 + CSS + JavaScript nativo”.
- Capacidades seleccionables: Canvas, SVG, animación CSS e interacción JS.
- Selector de técnicas con descripción previa y evidencia posterior.
- Editor de prompt con acciones “Restaurar desde brief” y “Ejecutar prompt”.
- Estimación previa: una llamada de texto y cero o una llamada de imagen.
- Progreso real: interpretar, validar blueprint, generar visual, compilar y auditar.

### 12.2. Resultado

- Preview en desktop, tablet y móvil.
- Código HTML completo.
- Prompt ejecutado.
- Blueprint inspeccionable.
- Auditoría y evidencia por técnica.
- Estado del visual generado o procedural.
- Acciones para descargar, guardar borrador, enviar al banco o refinar manualmente.

### 12.3. Banco

- Lista de piezas curadas con puntuación y dirección visual.
- Split view con landing a un lado y prompt de origen al otro.
- Semilla, brief, técnicas, auditoría, activo y fecha disponibles.
- Acción para reabrir en Studio conservando el estado reproducible.

## 13. Persistencia y compatibilidad

IndexedDB será la fuente de verdad para proyectos y activos, porque las imágenes integradas pueden superar con facilidad la cuota de `localStorage`.

Al iniciar la nueva versión:

- se leerán los proyectos existentes de `entrospec_landing_bank`;
- se migrarán sin eliminarlos hasta confirmar la escritura en IndexedDB;
- se marcarán como registros heredados cuando carezcan de blueprint o evidencia;
- el usuario podrá seguir abriéndolos y exportándolos.

## 14. Estados y errores

`GenerationState` distinguirá:

- `idle`
- `building_prompt`
- `generating_blueprint`
- `validating_blueprint`
- `generating_visual`
- `compiling`
- `auditing`
- `complete`
- `failed`

Los errores tendrán códigos estables, al menos:

- `MISSING_API_KEY`
- `INVALID_API_KEY`
- `QUOTA_EXCEEDED`
- `NETWORK_ERROR`
- `TEXT_MODEL_ERROR`
- `INVALID_BLUEPRINT`
- `IMAGE_MODEL_ERROR`
- `IMAGE_COMPRESSION_ERROR`
- `DOCUMENT_VALIDATION_ERROR`
- `STORAGE_ERROR`

No se sobrescribirá la última landing válida ante un fallo. El usuario verá la etapa, el error, su efecto sobre el resultado y una acción segura. No habrá reintentos facturables automáticos.

## 15. Seguridad local

- La interfaz advertirá que la clave `VITE_` queda disponible en el navegador y que esta configuración solo es aceptable para uso local.
- El iframe del preview conservará el mínimo de permisos; se evitará combinar permisos innecesarios.
- El HTML se validará antes de renderizar y descargar.
- Los textos se escaparán y las URLs externas serán rechazadas.
- Logo y referencia permanecerán en el navegador local salvo cuando formen parte de una solicitud explícita a Gemini.

## 16. Estrategia de pruebas

### 16.1. Unitarias

- SSoT determinista y mapeo de chunks.
- Composición del prompt y presencia exclusiva de técnicas activas.
- Validación del esquema del blueprint.
- Escape de contenido y compilación del documento.
- Ocho validadores independientes.
- Cálculo de puntuaciones, bloqueos y admisión.
- Caché y migración de proyectos.

### 16.2. Integración sin consumo

- Gateway Gemini simulado para éxito, respuesta incompleta, cuota, red e imagen inválida.
- Flujo completo blueprint → visual → HTML → auditoría.
- Activación y desactivación individual de cada técnica.
- Todas las técnicas activas y conjunto mínimo.
- Respaldo procedural y reutilización de caché.

### 16.3. Navegador

- Viewports de 375, 768, 1280 y 1920 px.
- Preview, editor, ejecución, descarga, borradores y banco.
- Navegación por teclado, foco y movimiento reducido.
- Ausencia de errores de consola y solicitudes de red desde el iframe generado.

### 16.4. Prueba real opcional

Una prueba separada y explícita utilizará la API real. No se incluirá en el comando normal de pruebas y mostrará el consumo esperado antes de ejecutarse.

Se entregará `docs/GUIA_DE_PRUEBAS.md` con preparación, casos, resultados esperados, diagnóstico de fallos y explicación del funcionamiento.

## 17. Presupuesto de rendimiento y costo

- Una llamada textual por construcción normal.
- Cero o una llamada de imagen.
- Cero llamadas para auditoría local.
- Cero reintentos automáticos facturables.
- Caché de imagen por hash de prompt, semilla y referencia.
- Advertencia de tamaño antes de guardar o exportar.
- El HTML generado no realizará solicitudes de red después de abrirse.

## 18. Fuera de alcance

- Despliegue público o backend seguro para secretos.
- Generación de vídeo mediante API.
- Exportación a React, Next.js u otros frameworks.
- Editor visual libre tipo page builder.
- Colaboración multiusuario o almacenamiento en la nube.
- Verificación de analítica real de conversión.

## 19. Entregables de implementación

- Nuevos tipos y esquema del blueprint.
- Gateway de Gemini para texto e imagen con errores tipados.
- Pipeline de compresión y caché visual.
- Renderer HTML5 nativo.
- Validadores de documento y técnicas.
- Auditoría basada en evidencia.
- Flujo actualizado del Studio y Banco.
- Migración a IndexedDB.
- Suite de pruebas automatizadas.
- Guía de pruebas y funcionamiento.


# Guía de pruebas de Entrospec

## Qué hace el sistema

1. El brief reúne marca, sector, propuesta de valor, audiencia, tono, CTA y referencias visuales.
2. La semilla SSoT fija una dirección de composición y color.
3. El prompt visible combina brief, semilla, técnicas activas y el contrato nativo.
4. Gemini devuelve un blueprint JSON; nunca se usa su texto como HTML ejecutable.
5. Si la técnica de imagen está activa, se solicita como máximo un hero y se comprime; si falla, se usa SVG procedural.
6. El renderer compila un HTML5 con CSS y JavaScript vanilla embebidos.
7. La auditoría verifica documento, técnicas, accesibilidad, anti-slop y CTA.
8. El resultado puede guardarse como borrador o entrar al Banco solo si alcanza 8.5 sin bloqueos.

## Configuración local

Crear `.env.local` en la raíz:

```text
VITE_GEMINI_API_KEY=tu_clave_local
VITE_GEMINI_TEXT_MODEL=gemini-2.5-flash
VITE_GEMINI_IMAGE_MODEL=gemini-2.5-flash-image
```

La clave `VITE_` queda disponible en el navegador. Esta configuración es solo para uso local; no publiques el proyecto así.

## Pruebas automatizadas

```powershell
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Las pruebas unitarias y E2E interceptan Gemini. No consumen API ni generan imágenes reales.

La prueba real es opt-in:

```powershell
npm run test:real
```

Ese comando hace una llamada textual real. Úsalo únicamente con la clave cargada y teniendo en cuenta el consumo.

## Matriz manual

| Caso | Acción | Resultado esperado |
| --- | --- | --- |
| Brief mínimo | Completar marca, propuesta, público y CTA | El prompt se compone sin campos ambiguos |
| Prompt editable | Cambiar el prompt y pulsar Ejecutar prompt | El inspector conserva el texto exacto editado |
| Técnica 1 | Activar/desactivar SSoT | Cambia el contrato y aparece evidencia o `not_requested` |
| Técnica 4 generada | Activar imagen y construir | Una llamada de imagen; provenance `generated` |
| Técnica 4 procedural | Cambiar Visual a Procedural | Cero llamadas de imagen; provenance `procedural` |
| Fallo de imagen | Responder 429 en la ruta de imagen | La landing se conserva con `fallback-procedural` |
| Fallo de texto | Responder 429 en la ruta textual | Se muestra error y no se pierde la última landing válida |
| Anti-slop | Inspeccionar Código | No hay CDN, import, `fetch`, frameworks ni URLs runtime |
| Responsive | Revisar 375, 768, 1280 y 1920 px | No hay overflow ni clipping |
| Banco | Guardar y abrir Banco | Landing y prompt exacto aparecen lado a lado |
| Umbral | Usar una landing con promedio < 8.5 | Solo permite borrador, no curación |

## Consumo previsto

- Procedural: 1 llamada textual + 0 imágenes.
- Imagen nueva: 1 llamada textual + 1 imagen.
- Imagen cacheada: 1 llamada textual + 0 imágenes.
- Refinación manual: comienza una ejecución nueva y muestra el consumo antes de iniciar.
- Auditoría y fallback procedural: 0 llamadas.

## Códigos de error

`MISSING_API_KEY`, `INVALID_API_KEY`, `QUOTA_EXCEEDED`, `NETWORK_ERROR`, `TEXT_MODEL_ERROR`, `INVALID_BLUEPRINT`, `IMAGE_MODEL_ERROR`, `IMAGE_COMPRESSION_ERROR`, `DOCUMENT_VALIDATION_ERROR`, `STORAGE_ERROR` y `CANCELLED` indican la etapa concreta que necesita atención.

## Banco y migración

Los proyectos nuevos se guardan en IndexedDB como borrador o pieza curada. Al abrir una versión con datos antiguos, Entrospec copia `entrospec_landing_bank` a IndexedDB y solo borra la clave después de verificar la escritura. Si el almacenamiento falla, conserva la clave y muestra `STORAGE_ERROR`.

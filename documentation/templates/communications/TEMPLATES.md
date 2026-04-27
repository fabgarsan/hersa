# Templates de Comunicación — Hersa

Cada template define una **estructura bloqueada** que `communications-writer` debe respetar.
Los templates garantizan consistencia visual y estructural entre versiones del mismo tipo de documento.

---

## Templates disponibles

| Template | Archivo | Audiencia | Cuándo usar |
|----------|---------|-----------|-------------|
| Diagrama de proceso | `template-diagrama-proceso.md` | Gerentes · Stakeholders internos | Siempre que el proceso operativo cambie y se necesite actualizar el diagrama. La estructura de 4 diagramas es fija. |
| Validación gerencial | `template-validacion-gerentes.md` | Gerentes y directivos | Documentar un proceso para que los gerentes lo validen y confirmen reglas de negocio. Incluye tabla de reglas con casillas de aprobación. |

---

## Templates pendientes (crear con component-factory cuando se necesiten)

| Template | Audiencia objetivo | Formato |
|----------|--------------------|---------|
| Propuesta de servicios | Director de colegio (B2B) | `propuesta-servicios` |
| Memo ejecutivo | Junta interna · Inversionistas | `memo-ejecutivo` |
| Brief para padres y estudiantes | Familias (B2C) | `brief` |
| Reporte de temporada | Gerentes · Junta | `reporte` |

---

## Reglas de uso para communications-writer

1. **Siempre leer el template antes de generar.** Nunca generar documentos de estos tipos sin consultarlo.
2. **La estructura es inviolable.** No eliminar secciones, no reordenar diagramas, no cambiar colores definidos.
3. **Solo el contenido cambia.** Reemplazar marcadores `{{VARIABLE}}` con los valores actuales del proceso.
4. **Si el proceso tiene menos elementos** que el template, marcar como `[NO APLICA]` en lugar de eliminar.
5. **Versionar el output,** no el template. El template es el molde; los documentos generados llevan número de versión.

---

## Cómo actualizar un template

Solo `component-factory` o una decisión explícita del equipo pueden modificar templates.
Cambiar un template implica que **todos los documentos generados con versiones anteriores quedan desactualizados** — comunicar al equipo antes de modificar.

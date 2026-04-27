# {{TITULO_PROCESO}} — Diagrama

<!--
╔══════════════════════════════════════════════════════════════════╗
║  TEMPLATE BLOQUEADO — communications-writer                      ║
║  Estructura: 4 diagramas fijos. NO modificar secciones ni        ║
║  colores. Solo actualizar contenido dentro de cada diagrama.     ║
║  Reemplaza los marcadores {{VARIABLE}} con los valores actuales. ║
╚══════════════════════════════════════════════════════════════════╝

VARIABLES A REEMPLAZAR:
  {{TITULO_PROCESO}}     Nombre del proceso (ej. "Proceso Operativo Hersa")
  {{VERSION}}            Número de versión (ej. "1.0", "2.0")
  {{FECHA}}              Mes y año (ej. "Abril 2026")
  {{ESTADO}}             Estado de validación (ej. "Pendiente validación gerencial")
  {{ETAPAS_FLUJO}}       Contenido del diagrama 1 — Flujo Principal
  {{MAPA_ROLES}}         Contenido del diagrama 2 — Mapa de Roles
  {{TIMELINE}}           Contenido del diagrama 3 — Línea de Tiempo
  {{CICLO_FINANCIERO}}   Contenido del diagrama 4 — Ciclo Financiero

INSTRUCCIÓN PARA communications-writer:
  - Nunca cambies los títulos de las 4 secciones de diagrama.
  - Nunca cambies el esquema de colores por etapa (definido abajo).
  - Nunca elimines ninguno de los 4 diagramas.
  - Siempre mantén la instrucción de exportación al final.
  - Si el proceso tiene menos etapas de las que aparecen en el
    template, marca las etapas no aplicables como [NO APLICA] en
    lugar de eliminarlas.

ESQUEMA DE COLORES FIJO (no modificar):
  Etapa 0 — Agendamiento:      fill:#E3F2FD, stroke:#1565C0
  Etapa 1 — Vinculación:       fill:#E8F5E9, stroke:#2E7D32
  Etapa 1b — Opcional:         fill:#F3E5F5, stroke:#6A1B9A
  Etapa 2 — Reunión Est.:      fill:#FFF8E1, stroke:#F57F17
  Etapa 3 — Toma Fotográfica:  fill:#FBE9E7, stroke:#BF360C
  Etapa 4 — Prom:              fill:#E0F7FA, stroke:#00695C
  Etapa 5 — Varios (Opcional): fill:#F3E5F5, stroke:#6A1B9A
  Etapa 6 — Día de Grado:      fill:#FCE4EC, stroke:#880E4F
-->

> **Audiencia:** Gerentes y stakeholders internos
> **Versión:** {{VERSION}} — {{FECHA}}
> **Estado:** {{ESTADO}}

---

## Flujo Principal: De Prospecto a Graduación

<!-- DIAGRAMA 1 — ESTRUCTURA FIJA. Solo actualiza el contenido interno. -->
```mermaid
{{ETAPAS_FLUJO}}
```

---

## Mapa de Roles por Etapa

<!-- DIAGRAMA 2 — ESTRUCTURA FIJA. Actualiza roles si cambian, mantén los 3 subgraphs. -->
```mermaid
{{MAPA_ROLES}}
```

---

## Línea de Tiempo del Proceso

<!-- DIAGRAMA 3 — ESTRUCTURA FIJA. Actualiza las secciones si cambian las etapas. -->
```mermaid
{{TIMELINE}}
```

---

## Ciclo Financiero del Estudiante

<!-- DIAGRAMA 4 — ESTRUCTURA FIJA. Actualiza porcentajes y reglas si cambian. -->
```mermaid
{{CICLO_FINANCIERO}}
```

---

> **Cómo exportar a PDF:**
> Abrir en VS Code con la extensión *Markdown Preview Mermaid Support* → `Cmd+Shift+V` → imprimir a PDF.
> Alternativamente: copiar cada bloque Mermaid en [mermaid.live](https://mermaid.live) para exportar como imagen o SVG.

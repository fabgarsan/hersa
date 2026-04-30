---
description: "Sincroniza la configuración de Claude Code con las últimas actualizaciones de la plataforma: actualiza el knowledge base desde los docs oficiales, actualiza los linters (component-linter, claude-md-linter) que no pueden auto-actualizarse, y ofrece correr /validate-config."
model: sonnet
allowed-tools: WebFetch Read Write Edit Bash Glob
---

Eres el orquestador de sincronización de Claude Code. Ejecutas tres fases en secuencia. No pidas confirmación entre fases — ejecuta todo y reporta al final.

---

## Phase 1 — Actualizar knowledge base

Sigue el procedimiento completo definido en `.claude/skills/update-cc-knowledge/SKILL.md`.

Lee ese archivo ahora y ejecuta todos sus pasos. El resultado de esta fase es `.claude/shared/claude-code-knowledge.md` actualizado con las últimas features de la plataforma.

**Regla crítica:** nunca sobreescribir ni modificar la sección `## 9. Best Practices de Diseño`. Solo actualizar §1–8 y §10.

Cuando esta fase termine, toma nota de:
- Qué secciones del KB cambiaron (lista de cambios)
- Qué nuevos campos de frontmatter, eventos de hook, o settings se documentaron

---

## Phase 2 — Actualizar linters

Usando el KB actualizado como fuente de verdad, actualiza únicamente los linters que NO pueden auto-actualizarse.

> **NO tocar bajo ninguna circunstancia:**
> - `.claude/agents/component-factory.md` — tiene Step 0, se auto-actualiza al invocarse
> - `.claude/agents/claude-md-architect.md` — tiene Step 0, se auto-actualiza al invocarse
> - `.claude/agents/cc-config-auditor.md` — tiene Step 0, se auto-actualiza al invocarse
> - `.claude/commands/validate-config.md` — tiene Pre-flight, se auto-actualiza al invocarse
>
> Editarlos aquí generaría conflictos con su propio mecanismo de auto-actualización.

Para cada linter: lee el archivo completo, identifica drift contra el KB, aplica `Edit` quirúrgico. Actualiza `kb_version` en frontmatter solo cuando hayas aplicado al menos un cambio.

### 2a. `component-linter` (`.claude/skills/component-linter/SKILL.md`)

Los linters son read-only (`context: fork`, `agent: Explore`) — no se auto-actualizan. Sync-cc es el único orquestador que los mantiene al día. Lee el archivo completo y realiza estos checks:

**Check CL-1: Campos requeridos en agentes (KB §3.2, §3.3)**
Compara la lista de campos en "Universal checks" y "Agent-only checks" contra KB §3.3. Si KB §3.3 lista un campo como "Requerido" que no tiene check en la lista, agrégalo. Actualiza también los valores válidos para campos enum (memory, permissionMode, effort, color, isolation, background, maxTurns) si KB §3.2 los cambió.

**Check CL-2: Campos requeridos en skills (KB §2.2)**
Compara "Skill-only checks" y "Skill advanced-field checks" contra KB §2.2 completo. Si hay campos nuevos o valores enum cambiados, actualiza los checks correspondientes.

**Check CL-3: Thresholds de líneas (KB §9.8)**
Verifica que los valores hardcodeados en los checks (SKILL.md ≤500, system prompt ≤200) coincidan con los valores en KB §9.8. Si difieren, actualiza.

Después de cada cambio aplicado con `Edit`, también actualiza `kb_version` en el frontmatter del archivo.

### 2b. `claude-md-linter` (`.claude/skills/claude-md-linter/SKILL.md`)

Mismo principio que 2a. Lee el archivo completo y realiza estos checks:

**Check ML-1: Secciones requeridas de CLAUDE.md (KB §9.1)**
Compara "Section 1: Required content" contra KB §9.1. Si la lista de secciones requeridas cambió en el KB, actualiza los checks #1–8.

**Check ML-2: Thresholds (KB §9.8)**
Verifica que los valores de `max_lines` (300) y `max_tokens` (2000) en "Section 2" coincidan con KB §9.8. Actualiza si difieren.

**Check ML-3: Anti-patterns (KB §9.4)**
Compara "Section 5: Anti-patterns" contra KB §9.4. Si la lista de anti-patterns en el KB tiene entradas nuevas o modificadas que se pueden detectar estáticamente, agrega el check correspondiente.

Después de cada cambio, actualiza `kb_version` en frontmatter.

---

## Phase 3 — Reporte y oferta de validate-config

Genera el reporte en este formato exacto:

```
# Claude Code Sync — Resultado
Fecha y hora: [YYYY-MM-DDTHH:MM:SS — usar datetime local con segundos]

## Phase 1 — Knowledge Base
Secciones actualizadas: [lista o "sin cambios"]
Nuevos campos/features documentados: [lista o "ninguno"]
Sección §9 (Best Practices): preservada sin cambios ✅

## Phase 2 — Linters actualizados
  [NO se tocan: component-factory, claude-md-architect, cc-config-auditor, validate-config — se auto-actualizan]

### component-linter  [actualizado por sync-cc — no se auto-actualiza]
  CL-1 (agent fields):  [UPDATED: <checks agregados> / ALREADY CURRENT]
  CL-2 (skill fields):  [UPDATED: <checks agregados> / ALREADY CURRENT]
  CL-3 (thresholds):    [UPDATED: <valores corregidos> / ALREADY CURRENT]
  kb_version: [old → new / ALREADY CURRENT]

### claude-md-linter  [actualizado por sync-cc — no se auto-actualiza]
  ML-1 (required sections): [UPDATED: <checks agregados> / ALREADY CURRENT]
  ML-2 (thresholds):        [UPDATED: <valores corregidos> / ALREADY CURRENT]
  ML-3 (anti-patterns):     [UPDATED: <checks agregados> / ALREADY CURRENT]
  kb_version: [old → new / ALREADY CURRENT]

## Resumen
  Total edits aplicados: N
  Componentes sin cambios: [lista]
```

Después del reporte, pregunta al usuario:

> **¿Querés correr `/validate-config` para verificar que toda la configuración está completa y sin drift?** (s/n)

Si el usuario responde afirmativamente, ejecuta el comando `/validate-config` siguiendo su procedimiento en `.claude/commands/validate-config.md`.

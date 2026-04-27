# Análisis CLAUDE.md — claude-md-architect

**Fecha:** 2026-04-27
**Modo detectado:** AUDIT (CLAUDE.md existe y sigue el formato de la architecture guide)
**Agentes revisados:** 23 archivos en `.claude/agents/`
**Skills revisadas:** 13 entradas en `.claude/skills/`

---

## 1. Auditoría del CLAUDE.md actual

### Secciones en buen estado

| Sección | Evaluación |
|---|---|
| `## Business Context` | Bien escrita, precisa, cubre B2B y B2C, lista de servicios completa. No hay prosa innecesaria. |
| `## Structure` | Concisa, directa. El árbol de directorios es correcto y no-obvio (justifica su presencia). |
| `## AWS Infrastructure` | Tabla limpia, bullets que agregan contexto operativo relevante. El pendiente de CloudFront está señalizado. |
| `## Global Rules` | Bullets cortos, imperativos, sin redundancias. |
| `## Do Not Touch` | Correcto: cubre migraciones, `.env`, artefactos generados, `.ebextensions/`, `Pipfile.lock`. |
| `## Git Hooks` | Conciso. |
| `## Docker` | Tres comandos esenciales, sin sobreexplicación. |
| `## Knowledge Files` | Tabla bien estructurada. El trigger "Read when" es preciso en la mayoría de las filas. |
| `## Skill Registry` | 6 skills listadas — todas existen en filesystem. Sin entradas fantasma. |
| `## Conventions for Agents and Skills` | Bullets útiles. El `@documentation/claude-code-architecture-guide.md` como referencia evita duplicación. |

### Secciones con problemas

#### `## Agent Registry` — Tamaño excesivo y desalineación de `when_to_use`

El registry tiene 23 entradas. Esta densidad tiene dos consecuencias: (1) consume tokens en cada invocación aunque la mayoría de agentes sean irrelevantes para la tarea en curso, y (2) hace más difícil para un agente nuevo entender rápidamente qué flujo seguir.

Problemas específicos detectados:

- **`pm-discovery`**: el campo "When to use" dice "First step for any new feature idea". Correcto, pero el agente real tiene dos entradas posibles: la vía clásica (`pm-discovery` → `prd-writer`) y la vía de pipeline completo (`process-analyst` → `process-optimizer` → `systems-analyst` → `pm-writer` → `prd-writer`). El registry no menciona que `pm-discovery` solo aplica cuando el pipeline completo de proceso NO ha corrido. Esto genera confusión sobre cuándo es el punto de entrada correcto.

- **`prd-writer`**: el "When to use" dice "After discovery; before architect or tdd-writer". Esto es verdad solo para la vía corta. El agente real también acepta como input primario `hersa-especificaciones-funcionales.md` (vía pipeline completo). El registry omite este camino.

- **`architect`**: "After PRD; before tdd-writer" es correcto pero incompleto. El agente es opcional en el pipeline completo; el registry no señala eso.

- **`engineering-manager`**: el "Scope" dice "Engineering team diagnosis: roles, processes, gaps, hiring, and agent pipeline integration". El "When to use" es demasiado corto comparado con la complejidad real del agente (que incluye definir cómo el equipo real consume los artefactos de pipeline). No es un error grave, pero pierde información valiosa.

- **`senior-ceo-advisor`**: el "When to use" mezcla dos roles distintos — asesoría estratégica puntual y sanity-check del pipeline. Estos dos usos tienen naturaleza muy diferente y podrían orientarse por separado.

#### `## Workflows` — Solo 4 entradas, no cubre el pipeline completo ni sus puntos de entrada configurables

La sección `## Workflows` actual actúa como un directorio de atajos, pero el pipeline más importante del proyecto (proceso → sistema → PM → PRD → TDD → implementación) no está documentado aquí. El archivo `workflow.md` cubre la perspectiva de implementación (bug fix, lightweight, linear ticket, full feature pipeline), pero no documenta el pipeline de análisis de negocio que actualmente tiene más agentes que cualquier otro flujo.

Resultado: un usuario nuevo que lea solo `CLAUDE.md` no sabe que existe un pipeline de análisis de negocio de 8 pasos ni cómo iniciarlo.

#### Ausencia de sección `## Stack` explícita

El CLAUDE.md actual embebe la información del stack dentro del `## Business Context` como una línea suelta ("Monorepo: React 19 (TypeScript) frontend + Django (Python) backend. Deployed on AWS.") y dentro del `## Structure`. La architecture guide espera una sección `## Stack` dedicada con bullets. Los agentes como `architect`, `django-developer`, y `react-developer` repiten el stack en sus propios archivos porque no hay una fuente de verdad única en CLAUDE.md. Esto es duplicación tolerable hoy pero se volverá drift si el stack cambia.

#### `## Knowledge Files` — Una referencia podría ser obsoleta

La fila `| '.claude/skills/workflow.md' | Starting any non-trivial feature; orchestrating multiple agents |` es correcta. Sin embargo, con el pipeline completo de negocio creciendo, `workflow.md` ya no cubre la orquestación de los agentes de proceso (process-analyst, process-optimizer, systems-analyst, etc.). Este gap podría crear la expectativa de que `workflow.md` documenta todos los flujos cuando en realidad solo documenta los flujos de implementación.

---

## 2. Inconsistencias detectadas

### 2.1 Agent Registry vs archivos reales en `.claude/agents/`

Resultado de la verificación:

| Agente en Registry | Archivo en `.claude/agents/` | Estado |
|---|---|---|
| `pm-discovery` | `pm-discovery.md` | OK |
| `prd-writer` | `prd-writer.md` | OK |
| `architect` | `architect.md` | OK |
| `tdd-writer` | `tdd-writer.md` | OK |
| `adr-writer` | `adr-writer.md` | OK |
| `django-developer` | `django-developer.md` | OK |
| `react-developer` | `react-developer.md` | OK |
| `test-writer` | `test-writer.md` | OK |
| `code-reviewer` | `code-reviewer.md` | OK |
| `security-auditor` | `security-auditor.md` | OK |
| `docs-writer` | `docs-writer.md` | OK |
| `component-factory` | `component-factory.md` | OK |
| `claude-md-architect` | `claude-md-architect.md` | OK |
| `aws-devops` | `aws-devops.md` | OK |
| `ethical-hacker` | `ethical-hacker.md` | OK |
| `process-analyst` | `process-analyst.md` | OK |
| `process-optimizer` | `process-optimizer.md` | OK |
| `systems-analyst` | `systems-analyst.md` | OK |
| `pm-writer` | `pm-writer.md` | OK |
| `senior-ceo-advisor` | `senior-ceo-advisor.md` | OK |
| `engineering-manager` | `engineering-manager.md` | OK |
| `ux-designer` | `ux-designer.md` | OK |
| `ui-designer` | `ui-designer.md` | OK |

**Resultado: cero entradas fantasma. Cero agentes huérfanos (archivos sin entrada en el registry).** La sincronización registro/filesystem es perfecta.

### 2.2 Skill Registry vs archivos reales en `.claude/skills/`

| Skill en Registry | Path real | Estado |
|---|---|---|
| `agent-scaffold` | `.claude/skills/agent-scaffold/` | OK (directorio) |
| `skill-scaffold` | `.claude/skills/skill-scaffold/` | OK (directorio) |
| `reuse-checker` | `.claude/skills/reuse-checker/` | OK (directorio) |
| `component-linter` | `.claude/skills/component-linter/` | OK (directorio) |
| `claude-md-linter` | `.claude/skills/claude-md-linter/` | OK (directorio) |
| `pipeline-conventions` | `.claude/skills/pipeline-conventions/` | OK (directorio) |

Skills en filesystem NO listadas en el registry (skills "orphan"):

| Archivo/directorio | En registry | Observación |
|---|---|---|
| `api-contract.md` | No — está en Knowledge Files | Correcto: es un knowledge file, no una skill |
| `backend-conventions.md` | No — está en Knowledge Files | Correcto |
| `error-handling.md` | No — está en Knowledge Files | Correcto |
| `security-checklist.md` | No — está en Knowledge Files | Correcto |
| `mui-conventions.md` | No — está en Knowledge Files | Correcto |
| `react-conventions.md` | No — está en Knowledge Files | Correcto |
| `theme-tokens.md` | No — está en Knowledge Files | Correcto |
| `workflow.md` | No — está en Knowledge Files | Correcto |

**Resultado: consistente. Los `.md` sueltos en `.claude/skills/` son knowledge files (documentados en la tabla `## Knowledge Files`), no skills con estructura de directorio. Los directorios son las skills ejecutables. No hay inconsistencias.**

### 2.3 Inconsistencia de "When to use" entre registry y agentes reales

| Agente | Registry dice | Agente real dice |
|---|---|---|
| `prd-writer` | "After discovery; before architect or tdd-writer" | Acepta como input primario `hersa-especificaciones-funcionales.md` (vía pipeline). El registry omite esta ruta. |
| `pm-discovery` | "First step for any new feature idea" | El agente tiene `When Not to Use`: "When a discovery brief already exists". No aclara que es solo para la vía corta, no para quien viene del pipeline completo. |
| `process-analyst` | "When documenting how a process works today, before any improvement or redesign" | Correcto. |
| `pm-writer` | "After `systems-analyst` produces a clean technical spec; before `prd-writer`" | Correcto. |
| `ux-designer` | "After `systems-analyst` produces a clean spec; before any visual design or frontend implementation begins" | Correcto. |
| `ui-designer` | "After `ux-designer` produces a clean `ux-spec.md`; before `react-developer` begins" | Correcto. |

### 2.4 `workflow.md` vs sección `## Workflows` en CLAUDE.md

La sección `## Workflows` en CLAUDE.md cubre 4 casos de uso de la perspectiva `workflow.md` (bootstrap CLAUDE.md, migrate CLAUDE.md, crear componente, audit). **No tiene ningún workflow del pipeline de análisis de negocio** (process-analyst → ... → prd-writer). El archivo `workflow.md` en skills tampoco cubre ese pipeline — solo cubre Bug fix, Lightweight, Linear ticket, Full feature (todos desde la perspectiva de implementación de código, no de análisis de proceso).

Esto significa que el pipeline de análisis de negocio no está documentado en ningún workflow accesible desde CLAUDE.md. Es el gap más importante del CLAUDE.md actual.

---

## 3. Propuesta de estructura mejorada

### Secciones a eliminar

Ninguna sección completa debe eliminarse. El CLAUDE.md de Hersa está por debajo del límite de longitud problemático y cada sección tiene justificación.

### Secciones a simplificar

| Sección | Acción propuesta |
|---|---|
| `## Agent Registry` | Reducir verbosidad en "When to use" para agentes cuyo rol es obvio dado el nombre. Los agentes del pipeline de análisis deben tener "When to use" corregidos para reflejar ambas vías de entrada. |
| `## Conventions for Agents and Skills` | Sin cambios — es concisa y correcta. |

### Secciones a actualizar

| Sección | Qué cambiar |
|---|---|
| `## Agent Registry` | Corrección de "When to use" para `prd-writer` y `pm-discovery` (documentar ambas vías). Ver tabla propuesta en §4. |
| `## Workflows` | Agregar el pipeline de análisis de negocio y el punto de entrada configurable. Ver texto propuesto en §5. |
| `## Knowledge Files` | Agregar nota en la fila de `workflow.md` que aclare que ese archivo solo cubre flujos de implementación, no el pipeline de análisis de proceso. |

### Secciones a crear

| Sección nueva | Justificación |
|---|---|
| `## Stack` (explícita) | Actualmente el stack está embebido en Business Context y Structure. Una sección `## Stack` dedicada con bullets sería la fuente de verdad para todos los agentes y evitaría que cada agente repita esta información. **Prioridad: media.** No bloquea nada hoy; se vuelve urgente si el stack cambia. |

---

## 4. Agent Registry propuesto

Los cambios aplicados:
- `prd-writer`: se aclara que acepta dos rutas de entrada (pipeline completo o vía discovery).
- `pm-discovery`: se aclara que es la vía corta (cuando no viene del pipeline de proceso).
- `architect`: se señala que es opcional dentro del pipeline.
- `senior-ceo-advisor`: se separan los dos usos (asesoría estratégica y sanity-check de pipeline).
- Resto: sin cambios — son correctos y concisos.

```markdown
| Agent | Scope | When to use |
|---|---|---|
| `pm-discovery` | Discovery interview before writing any document | New feature idea with no prior process pipeline; skip if process pipeline already ran (use `prd-writer` directly) |
| `prd-writer` | PRD generation from feature description or functional spec | After `pm-discovery` (short path) OR after `pm-writer` approves the functional spec (full pipeline path); before `architect` or `tdd-writer` |
| `architect` | Architecture design for complex features | After PRD; before `tdd-writer`; optional if the approach is already clear |
| `tdd-writer` | TDD generation from approved PRD | After PRD is approved; before any code is written |
| `adr-writer` | Documents non-obvious architectural decisions as ADRs | After choosing between significant technical approaches |
| `django-developer` | All backend work: models, migrations, serializers, views, URLs | Any Python/Django task |
| `react-developer` | All frontend work: pages, components, hooks, API integration | Any React/TypeScript/MUI task |
| `test-writer` | Tests for existing code (pytest-django + RTL) | After implementing any feature |
| `code-reviewer` | Read-only post-implementation review | After completing a feature or before committing |
| `security-auditor` | Read-only security audit | Before deploying; after auth or sensitive-data work |
| `docs-writer` | Docstrings, CLAUDE.md updates, API endpoint docs | After completing a module or before a release |
| `component-factory` | Generate new agents and skills under `.claude/` | "scaffold/create/generate an agent or skill" |
| `claude-md-architect` | Interview-driven CLAUDE.md generation and migration | "set up CLAUDE.md", "bootstrap this repo", "migrate my CLAUDE.md" |
| `aws-devops` | AWS infrastructure: EB, RDS, S3, CloudFront, CI/CD, secrets | Any deployment, infra config, or AWS resource management task |
| `ethical-hacker` | Penetration testing, OWASP, API/network/cloud/OSINT security, CTF | Authorized pentests, CTF challenges, security research, red-team exercises |
| `process-analyst` | As-is documentation of existing business processes | When documenting how a process works today, before any improvement or redesign |
| `process-optimizer` | Lean-based to-be process optimization from a complete as-is document | After `process-analyst` produces a clean as-is (zero unresolved ambiguities); before implementation planning |
| `systems-analyst` | Translate a complete to-be process into functional specifications: epics, user stories, AC, data entities, API contracts | After `process-optimizer` produces a clean to-be (zero unresolved `[NECESITA CONTEXTO]` items); before any implementation begins |
| `pm-writer` | Translate a technical specification into a non-technical executive PM document with MoSCoW prioritization and BLOCKER guard | After `systems-analyst` produces a clean technical spec (zero unresolved `[BLOCKER]` items); before `prd-writer` is invoked |
| `senior-ceo-advisor` | Strategic advisory (commercial, operational, prioritization) and mid-pipeline business sanity-checks | Any strategic or commercial decision; or to validate business realism of process docs, epics, PRDs, or TDDs at any pipeline stage |
| `engineering-manager` | Engineering team diagnosis: roles, processes, gaps, hiring, and agent pipeline integration | When analyzing team structure or processes, making hiring decisions, or defining how pipeline agents integrate with the dev team |
| `ux-designer` | User flows, navigation, information hierarchy, screen structure, friction analysis, and text wireframes for any Hersa feature | After `systems-analyst` produces a clean spec (zero `[BLOCKER]` tags); before any visual design or frontend implementation begins |
| `ui-designer` | Visual design specification: design tokens, component inventory, per-screen layout, accessibility guide, and MUI implementation notes | After `ux-designer` produces a clean `ux-spec.md` (zero unresolved `[FRICCIÓN ALTA]` items); before `react-developer` begins implementation |
```

---

## 5. Flujos de trabajo en CLAUDE.md — Propuesta de sección expandida

La sección `## Workflows` actual tiene 4 entradas, todas orientadas a gestión del repositorio Claude Code. El pipeline de análisis de negocio (el flujo más largo y con más agentes del proyecto) no está documentado.

Propuesta completa para reemplazar la sección `## Workflows` actual:

---

```markdown
## Workflows

### Gestión de CLAUDE.md y componentes

**Bootstrap o migración de CLAUDE.md:**
> "Use claude-md-architect to set up CLAUDE.md for this project."

**Migrar un CLAUDE.md desordenado:**
> "Use claude-md-architect to migrate my CLAUDE.md to the architecture-guide format."

**Crear un agente o skill nuevo:**
> "Use component-factory to scaffold a [skill|agent] that [capability]."

**Auditar el CLAUDE.md (e.g., en CI):**
> Run `claude-md-linter` directly on the file.

---

### Pipeline de implementación de features

Referencia completa: `.claude/skills/workflow.md`

Usa la primera fila que aplique:

| Situación | Flujo |
|-----------|-------|
| Algo roto en producción, sin nueva migración ni endpoint | **Bug fix** → `django-developer` / `react-developer` → `test-writer` → `code-reviewer` |
| Cambio que toca una sola superficie y sin nuevos modelos | **Lightweight** → implementador → `code-reviewer` → (opcional) `test-writer` |
| Ticket Linear con criterios de aceptación claros | **Linear ticket** → (tdd-writer si no hay TDD) → implementadores → `test-writer` → `code-reviewer` |
| Feature nueva con ambas superficies o nuevo modelo de dominio | **Full pipeline** → ver secuencia completa en `workflow.md` |

---

### Pipeline de análisis de negocio (proceso → especificación)

Punto de entrada: cuando se quiere analizar, mejorar, o especificar un proceso de negocio antes de implementar.

```
1. process-analyst     → documenta el proceso as-is
                         → guarda documentation/process/as-is/hersa-proceso-operativo-as-is.md
                         → [USUARIO CONFIRMA antes del siguiente paso]

2. process-optimizer   → aplica Lean, produce el to-be
                         → guarda documentation/process/to-be/hersa-proceso-operativo-to-be.md
                         → [RESOLVER cualquier [NECESITA CONTEXTO] antes de continuar]

3. systems-analyst     → traduce el to-be a epics, user stories, entidades, API contracts
                         → guarda documentation/requirements/specs/hersa-especificaciones-funcionales.md
                         → [RESOLVER cualquier [BLOCKER] antes de continuar]

4. pm-writer           → traduce la especificación técnica en documento ejecutivo para PM
                         → guarda documentation/requirements/pm/documento-pm.md
                         → [PM APRUEBA — hard stop]

5. ux-designer         → flujos de usuario, jerarquía de información, wireframes de texto
                         → guarda documentation/requirements/specs/ux-spec.md
                         → [RESOLVER cualquier [FRICCIÓN ALTA] antes de continuar]

6. ui-designer         → tokens de diseño, inventario de componentes, especificación visual por pantalla
                         → guarda documentation/requirements/specs/ui-spec.md

7. prd-writer          → lee hersa-especificaciones-funcionales.md como input primario
                         → guarda documentation/requirements/prd/PRD-00N.md
                         → [USUARIO REVISA Y APRUEBA — hard stop]

8. tdd-writer + implementación → seguir desde el paso 4 del full feature pipeline en workflow.md
```

**Puntos de entrada configurables:**

| Punto de entrada | Cuándo usarlo |
|---|---|
| `process-analyst` (paso 1) | El proceso no está documentado; se empieza desde cero |
| `systems-analyst` (paso 3) | El proceso to-be ya existe y está limpio; se necesita la especificación funcional |
| `prd-writer` (paso 7) | La especificación funcional está aprobada; se necesita el PRD formal |
| `tdd-writer` directamente | El PRD ya existe aprobado; se salta directamente a diseño técnico |

**Hard stops (no saltar):**
- Nunca correr `process-optimizer` si el as-is tiene `[AMBIGUO]` o `[FALTA INFO]` sin resolver.
- Nunca correr `systems-analyst` si el to-be tiene `[NECESITA CONTEXTO]` sin resolver.
- Nunca correr `prd-writer` si la especificación tiene `[BLOCKER]` sin resolver.
- Nunca correr `ux-designer` si la especificación tiene `[BLOCKER]` sin resolver.
- Nunca correr `ui-designer` si el ux-spec tiene `[FRICCIÓN ALTA]` sin resolver.

---

### Sanity-checks disponibles en cualquier punto del pipeline

- `senior-ceo-advisor` → valida realismo de negocio sobre cualquier documento del pipeline
- `engineering-manager` → evalúa si el equipo actual puede consumir e implementar los artefactos producidos
- `security-auditor` → revisión de seguridad antes de cualquier deploy o módulo sensible
```

---

## Resumen ejecutivo

| Dimensión | Estado | Severidad |
|---|---|---|
| Registry vs filesystem | Sin divergencias (23/23 agentes, 6/6 skills) | OK |
| Knowledge Files | Sin referencias muertas | OK |
| Sección Workflows | Pipeline de análisis de negocio no documentado | **Alta** |
| "When to use" de `prd-writer` | Omite la vía del pipeline completo | **Media** |
| "When to use" de `pm-discovery` | No aclara que es solo la vía corta | **Media** |
| Sección Stack | Embebida, no tiene sección propia | **Baja** |
| Longitud general | 154 líneas — dentro del rango saludable | OK |

**Acciones recomendadas ordenadas por impacto:**

1. Expandir `## Workflows` con el pipeline de análisis de negocio y puntos de entrada configurables (texto propuesto en §5).
2. Corregir "When to use" de `prd-writer` y `pm-discovery` en el Agent Registry (tabla propuesta en §4).
3. Añadir nota aclaratoria en la fila `workflow.md` de la tabla `## Knowledge Files`.
4. Considerar (no urgente) separar `## Stack` como sección explícita.

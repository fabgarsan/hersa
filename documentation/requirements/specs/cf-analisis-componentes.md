# Análisis de Componentes — Hersa Claude Code Ecosystem

**Fecha:** 2026-04-27
**Autor:** `component-factory`
**Alcance:** Auditoría arquitectónica del ecosistema actual de agentes y skills de Hersa
**Inputs leídos:** `CLAUDE.md`, los 23 agentes en `.claude/agents/`, los 14 skills en `.claude/skills/`, `documentation/claude-code-architecture-guide.md` (§1–§4)
**Inputs NO leídos en profundidad:** cuerpo completo de cada agente (solo frontmatter + secciones críticas según protocolo grep-first)

> **Notas de método:** auditoría por frontmatter primero; lectura profunda solo cuando se sospechó solapamiento (architect, pm-discovery, senior-ceo-advisor, engineering-manager, process-optimizer, component-factory). Las recomendaciones siguen `documentation/claude-code-architecture-guide.md` §2.5 (split vs merge), §3.2 (skill reuse), §3.4 (reuse vs new), y §1.1 (CLAUDE.md must include).

---

## 1. Auditoría de componentes existentes

### 1.1 Agentes

| Agente | Scope bien delimitado | Solapamiento | Modelo apropiado | Frontmatter correcto |
|---|---|---|---|---|
| `pm-discovery` | SÍ | Marginal con `prd-writer` (open items) | sonnet — apropiado (entrevista con juicio) | SÍ |
| `prd-writer` | PARCIAL — admite tres rutas de input ambiguas | Con `pm-writer` (ver §2) | sonnet — apropiado | SÍ |
| `architect` | NO — solapa con `tdd-writer` y `systems-analyst` (ver §2) | Sí, severo | sonnet — apropiado SI sobrevive | SÍ |
| `tdd-writer` | SÍ | Marginal con `architect` cuando `architect` no se ejecuta | **opus — sobreasignado** para la mayoría de casos; sonnet bastaría salvo TDDs muy complejos | SÍ |
| `adr-writer` | SÍ | Ninguno | haiku — apropiado | SÍ |
| `django-developer` | SÍ | Ninguno | sonnet — apropiado | SÍ (6 tools, todos justificados) |
| `react-developer` | SÍ | Ninguno | sonnet — apropiado | SÍ (6 tools, todos justificados) |
| `test-writer` | SÍ | Ninguno | sonnet — **probablemente sobreasignado**; haiku bastaría para tests deterministas | SÍ (6 tools) |
| `code-reviewer` | SÍ | Marginal con `security-auditor` | haiku — apropiado | SÍ |
| `security-auditor` | SÍ | Marginal con `code-reviewer` y `ethical-hacker` | sonnet — apropiado | SÍ |
| `docs-writer` | SÍ | Marginal con `claude-md-architect` | haiku — apropiado | SÍ |
| `component-factory` | SÍ | Ninguno | **sin `model:` declarado** — usa default | PARCIAL (falta `model`) |
| `claude-md-architect` | SÍ | Marginal con `docs-writer` (CLAUDE.md scope) | **sin `model:` declarado** — usa default | PARCIAL (falta `model`) |
| `aws-devops` | SÍ | Ninguno | **sin `model:` declarado** — usa default | PARCIAL (falta `model`) |
| `ethical-hacker` | SÍ | Marginal con `security-auditor` | **sin `model:` declarado** — usa default | PARCIAL (falta `model`) |
| `process-analyst` | SÍ | Ninguno | **sin `model:` declarado** | PARCIAL (falta `model`) |
| `process-optimizer` | SÍ | Ninguno | **sin `model:` declarado** | PARCIAL (falta `model`) |
| `systems-analyst` | PARCIAL — solapa con `architect` en API contract / data entities | Sí (ver §2) | **sin `model:` declarado** | PARCIAL (falta `model`) |
| `pm-writer` | SÍ | Con `prd-writer` (ver §2) | **sin `model:` declarado** | PARCIAL (falta `model`) |
| `senior-ceo-advisor` | SÍ — único con persona ejecutiva | Ninguno | **sin `model:` declarado** — debería ser opus (juicio estratégico) | PARCIAL (falta `model`) |
| `engineering-manager` | SÍ | Ninguno | **sin `model:` declarado** — debería ser opus | PARCIAL (falta `model`) |
| `ux-designer` | SÍ | Ninguno | **sin `model:` declarado** — debería ser sonnet u opus | PARCIAL (falta `model`) |
| `ui-designer` | SÍ | Ninguno | **sin `model:` declarado** — sonnet apropiado | PARCIAL (falta `model`) |

**Hallazgo agregado del frontmatter:** los 8 primeros agentes (`adr-writer`, `architect`, `aws-devops`, `claude-md-architect`, `code-reviewer`, `component-factory`, `django-developer`, `docs-writer`) son los únicos que tienen `model:` explícito o convención homogénea. **15 de 23 agentes carecen del campo `model:` en frontmatter.** Esto es un gap arquitectónico transversal — sin `model:` declarado el sistema usa el default global, lo que hace el costo y la calidad impredecibles.

**Hallazgo de versión:** versionado inconsistente — algunos están en `0.1.0`, otros en `1.0.0`, otros en `1.2.0`. No hay convención clara de cuándo subir mayor/menor. No es bloqueante pero conviene definirlo.

### 1.2 Skills

| Skill | Scope bien delimitado | Solapamiento | Tipo | Frontmatter correcto |
|---|---|---|---|---|
| `agent-scaffold` | SÍ | Ninguno | Directorio (`SKILL.md`) | SÍ |
| `skill-scaffold` | SÍ | Ninguno | Directorio (`SKILL.md`) | SÍ |
| `reuse-checker` | SÍ | Ninguno | Directorio (`SKILL.md`) | SÍ |
| `component-linter` | SÍ | Ninguno | Directorio (`SKILL.md`) | SÍ |
| `claude-md-linter` | SÍ | Ninguno | Directorio (`SKILL.md`) | SÍ |
| `pipeline-conventions` | SÍ — único skill compartido entre agentes | Ninguno | Directorio (`SKILL.md`) | SÍ |
| `workflow.md` | PARCIAL — referencia agentes pero no se carga automáticamente; nombre sin sufijo `.md` rompe convención de directorio | Ninguno | **Archivo plano (no directorio)** — no cumple §3.1 del guide | NO — sin frontmatter YAML |
| `api-contract.md` | SÍ | Ninguno | **Archivo plano** — no cumple §3.1 | NO — sin frontmatter YAML |
| `backend-conventions.md` | SÍ | Ninguno | **Archivo plano** — no cumple §3.1 | NO — sin frontmatter YAML |
| `error-handling.md` | SÍ | Ninguno | **Archivo plano** | NO — sin frontmatter YAML |
| `security-checklist.md` | SÍ | Marginal con `security-auditor` (referencia el skill) | **Archivo plano** | NO — sin frontmatter YAML |
| `theme-tokens.md` | SÍ | Ninguno | **Archivo plano** | NO — sin frontmatter YAML |
| `mui-conventions.md` | SÍ | Marginal con `theme-tokens.md` (estilo) | **Archivo plano** | NO — sin frontmatter YAML |
| `react-conventions.md` | SÍ | Marginal con `mui-conventions.md` | **Archivo plano** | NO — sin frontmatter YAML |

**Hallazgo crítico de skills:** existen **dos formatos coexistentes** — directorios con `SKILL.md` y frontmatter (los 6 más recientes: `agent-scaffold`, `skill-scaffold`, `reuse-checker`, `component-linter`, `claude-md-linter`, `pipeline-conventions`) versus archivos planos `.md` sin frontmatter (los 8 originales). El guide §3.1 exige el formato directorio + frontmatter. Los 8 archivos planos son skills funcionales pero **no validables por `component-linter`** (no tienen `name`, `description`, `version`, `when_to_use`).

---

## 2. Solapamientos detectados

### 2.1 `architect` ↔ `systems-analyst` ↔ `tdd-writer`  (ALTA SEVERIDAD)

**Qué se cruza:**
- `architect` (description): "Designs the technical architecture… defines the API contract between backend and frontend… produces a plan that tdd-writer will formalize."
- `systems-analyst` (description): "epics, user stories, acceptance criteria, **data entities, and API contracts**"
- `tdd-writer` (description): "translates PRD requirements into a concrete technical design"

`architect` y `systems-analyst` ambos producen **API contracts** y **data entities** pero desde puntos del pipeline distintos. `tdd-writer` también define interfaces. Los tres pisan la misma capa.

**Quién debería ganar:**
- `systems-analyst` debe quedarse con epics, user stories, AC, **data entities lógicas** y **firmas funcionales de endpoints** (qué endpoint, qué entidad, qué AC) — orientado al PRD/PM.
- `tdd-writer` debe quedarse con la **arquitectura técnica concreta** (paths, modelos Django, serializadores, estructura React) — único responsable del plan implementable.
- `architect` queda redundante en el pipeline post-systems-analyst.

**Acción propuesta:** ELIMINAR `architect` o REDEFINIRLO a "decisiones arquitectónicas no-obvias previas a TDD" (alcance mínimo, casi siempre fusionable con `tdd-writer`). Ver §4.

### 2.2 `prd-writer` ↔ `pm-writer`  (MEDIA SEVERIDAD)

**Qué se cruza:**
- `prd-writer` description: "Generates a PRD from a technical specification, PM document, or **discovery brief**"
- `pm-writer` description: "Translates a systems-analyst technical specification into a non-technical executive PM document with MoSCoW-prioritized epics"

`prd-writer` admite tres rutas de input distintas (technical-spec, pm-doc, discovery-brief) lo cual erosiona su contrato. `pm-writer` se interpone entre `systems-analyst` y `prd-writer` con un documento ejecutivo. Esto puede ser intencional (aprobación de PM antes de PRD), pero en la práctica genera dos documentos que el PM real (humano) probablemente trate como uno.

**Quién debería ganar:**
- Mantener `pm-writer` SOLO si el flujo del usuario real exige aprobación de un PM no técnico antes del PRD. Si no, fusionarlo con `prd-writer`.
- `prd-writer` debe restringir su input a UNO solo: el output de `pm-writer` (cuando exista) o el discovery-brief (modo lightweight).

**Acción propuesta:** Validar con `engineering-manager` si hay un PM real en el equipo. Si NO → fusionar `pm-writer` en `prd-writer` (modo executive-summary opcional). Si SÍ → reducir las tres rutas de input de `prd-writer` a una sola.

### 2.3 `code-reviewer` ↔ `security-auditor`  (BAJA SEVERIDAD)

**Qué se cruza:** ambos hacen revisión read-only post-implementación. `code-reviewer` cubre "convention deviations, quality issues, **and security gaps**"; `security-auditor` se enfoca en vulnerabilidades. La frase "and security gaps" en `code-reviewer` invade el dominio de `security-auditor`.

**Quién debería ganar:** `security-auditor` para todo lo de seguridad. `code-reviewer` debe limpiar su description quitando "security gaps" y delegar explícitamente a `security-auditor`.

**Acción propuesta:** MODIFICAR `code-reviewer` description.

### 2.4 `security-auditor` ↔ `ethical-hacker`  (BAJA SEVERIDAD)

**Qué se cruza:** `security-auditor` audita código estático por vulnerabilidades. `ethical-hacker` ejecuta pentest autorizado contra el sistema corriendo. Distintos pero adyacentes; el frontmatter de cada uno los separa bien.

**Quién debería ganar:** ambos sobreviven. La línea es clara: estático vs. activo.

**Acción propuesta:** ninguna; el solapamiento es nominal.

### 2.5 `claude-md-architect` ↔ `docs-writer`  (BAJA SEVERIDAD)

**Qué se cruza:** `docs-writer` description menciona "CLAUDE.md updates"; `claude-md-architect` es el dueño exclusivo de CLAUDE.md.

**Quién debería ganar:** `claude-md-architect` para todo lo de CLAUDE.md. `docs-writer` debe restringirse a docstrings y READMEs/endpoint-docs.

**Acción propuesta:** MODIFICAR `docs-writer` description y `when_not_to_use`.

### 2.6 `senior-ceo-advisor` ↔ `engineering-manager`  (BAJA SEVERIDAD — saludable)

**Qué se cruza:** ambos opinan sobre prioridades y trade-offs. Pero `senior-ceo-advisor` es lente comercial y `engineering-manager` es lente técnico/de equipo. La división es defendible y útil.

**Quién debería ganar:** ambos coexisten. Pero conviene que cada uno mencione explícitamente al otro en su `when_not_to_use`.

**Acción propuesta:** MODIFICAR `senior-ceo-advisor` y `engineering-manager` para reforzar referencia cruzada. Ya existe parcialmente.

### 2.7 `mui-conventions.md` ↔ `theme-tokens.md` ↔ `react-conventions.md`  (NULA si se respeta el linker)

Estos tres archivos planos están bien separados temáticamente (MUI APIs vs colores/tipografía vs axios/state). El solapamiento es sintáctico (todos cargan para `react-developer`). No hay duplicación de contenido.

**Acción propuesta:** ninguna funcional, pero TODOS deben migrarse a formato directorio+frontmatter (ver §4 cambios estructurales).

---

## 3. Gaps de cobertura

### 3.1 Falta — `linear-sync` (skill o agente ligero)

**Capacidad faltante:** ningún componente formaliza la creación/lectura de tickets de Linear. El workflow.md menciona `/create-task` y `/start-task` pero no hay skill ni agente que documente el contrato. La memoria del usuario incluye "Default Linear settings (Hersa)" pero no hay componente que lo aplique.

**Severidad:** MEDIA — afecta el handoff TDD → implementación.

### 3.2 Falta — `dependency-auditor` (agente)

**Capacidad faltante:** `security-checklist.md` exige `pip-audit` y `npm audit` pre-deploy, pero ningún agente está nominado para ejecutarlos. `aws-devops` no es responsable; `security-auditor` es read-only y no corre comandos. Hoy es trabajo manual.

**Severidad:** BAJA-MEDIA — pre-deploy gate sin owner.

### 3.3 Falta — `migration-reviewer` (skill, no agente)

**Capacidad faltante:** las migraciones son `Do Not Touch` pero nadie revisa proactivamente las nuevas migraciones por irreversibilidad, locks largos, default-values mal puestos. `code-reviewer` en teoría puede, pero no tiene checklist específico.

**Severidad:** BAJA — pero alta una vez en producción si falla.

### 3.4 Falta — un skill compartido para implementadores (`developer-conventions` o similar)

**Capacidad faltante:** `django-developer` y `react-developer` cargan cada uno entre 2-4 archivos planos (`api-contract`, `backend-conventions`, `error-handling`, `security-checklist`, `theme-tokens`, `mui-conventions`, `react-conventions`). No hay un punto de entrada unificado equivalente a `pipeline-conventions`. Esto es exactamente lo que el usuario pregunta en §5.

**Severidad:** MEDIA — afecta la consistencia entre los dos developers.

### 3.5 Falta — un skill compartido para revisores (`review-conventions`)

**Capacidad faltante:** `code-reviewer` y `security-auditor` comparten patrón (read-only, severity grading, no-modify, output report). No hay reglas operativas compartidas. Cada uno declara su propio formato de severidad.

**Severidad:** BAJA — pero arquitectónicamente inconsistente con el patrón `pipeline-conventions`.

### 3.6 Falta — convención de versionado y campo `model:` declarado en TODOS los agentes

**Capacidad faltante:** ya identificado en §1.1 — 15 de 23 agentes no declaran `model:`, lo que rompe la previsibilidad de costo y calidad. Esto NO es un nuevo agente sino una norma transversal.

**Severidad:** ALTA — afecta a todo el ecosistema.

### 3.7 Falta — un skill `frontmatter-conventions`

**Capacidad faltante:** no hay un único punto que defina exactamente qué campos deben tener los frontmatter de agentes y skills, qué valores son válidos para `model`, cómo se versionan. Hoy esto vive disperso en `agent-scaffold`, `skill-scaffold`, `component-linter` y el architecture guide. Conviene centralizarlo.

**Severidad:** BAJA-MEDIA.

---

## 4. Propuesta de cambios arquitectónicos

> Cada cambio se ejecuta con `component-factory`. Antes de aplicarlos, el usuario debe aprobar el plan completo.

### 4.1 ELIMINAR — `architect`

- **Tipo:** ELIMINAR
- **Componente:** `.claude/agents/architect.md`
- **Razón:** redundante post-`systems-analyst` y pre-`tdd-writer`. En el pipeline actual `systems-analyst` ya produce data entities y API contracts, y `tdd-writer` ya produce el plan implementable. `architect` se queda sin scope propio. Su persona puede absorberse parcialmente en `tdd-writer` para los casos de "decisión arquitectónica no obvia" → derivar a `adr-writer`.
- **Impacto en CLAUDE.md:** eliminar la fila `architect` del Agent Registry. Actualizar `workflow.md` step 3 (eliminar el "(optional) architect").
- **Dependencias afectadas:** `tdd-writer` (asume input directo de PRD), `workflow.md` (step 3 desaparece), `adr-writer` (sigue siendo trigger desde TDD §8).
- **Riesgo:** si en proyectos pequeños el usuario quiere saltar PRD/systems-analyst, pierde el agente que pensaba alto nivel sin formalismo. Mitigación: documentar en `workflow.md` que para "lightweight" se va directo a developer sin architect.

### 4.2 MODIFICAR — `tdd-writer` (degradar modelo, no funcionalidad)

- **Tipo:** MODIFICAR
- **Componente:** `.claude/agents/tdd-writer.md`
- **Razón:** está asignado a `claude-opus-4-7`. Para el 80% de los TDDs (CRUD, módulos estándar) sonnet es suficiente y diez veces más barato. Reservar opus solo para TDDs marcados como "complex" (criterio explícito en `architect`-cum-`tdd-writer` o cuando hay decisión hard-to-reverse). Práctica: dejar `model: claude-sonnet-4-6` y documentar en CLAUDE.md cómo escalar a opus manualmente cuando se necesita.
- **Impacto en CLAUDE.md:** ninguno directo en registry; opcionalmente añadir nota en convenciones.
- **Dependencias:** ninguna funcional.

### 4.3 MODIFICAR — `prd-writer` (un solo input)

- **Tipo:** MODIFICAR
- **Componente:** `.claude/agents/prd-writer.md`
- **Razón:** description actual admite tres rutas de input. Reducir a dos: (a) `pm-writer` output cuando existe, (b) discovery brief para flujo lightweight. Eliminar la tercera ruta "user explicitly confirms they want to skip discovery and provides requirements directly" — redundante con (b).
- **Impacto en CLAUDE.md:** ninguno en registry.
- **Dependencias:** `pm-writer` (depende del output), `pm-discovery` (sigue siendo válido como input alternativo).

### 4.4 DECIDIR — `pm-writer` (mantener o fusionar)

- **Tipo:** PENDIENTE de input de `engineering-manager`
- **Componente:** `.claude/agents/pm-writer.md`
- **Razón:** justificable solo si hay un PM humano que aprueba antes del PRD. Si no, fusionar en `prd-writer` (sección "Executive Summary" opcional dentro del PRD).
- **Impacto en CLAUDE.md:** si se fusiona — eliminar fila `pm-writer` del Agent Registry; modificar fila `prd-writer`.
- **Dependencias:** `systems-analyst` output, `prd-writer`.
- **Recomendación de `component-factory`:** esperar diagnóstico de `engineering-manager` antes de actuar.

### 4.5 MODIFICAR — `code-reviewer` (quitar "security gaps")

- **Tipo:** MODIFICAR
- **Componente:** `.claude/agents/code-reviewer.md`
- **Razón:** elimina solapamiento con `security-auditor`. Description debe pasar de "convention deviations, quality issues, and security gaps" → "convention deviations, code quality issues, and architectural drift; flags potential security concerns to security-auditor".
- **Impacto en CLAUDE.md:** actualizar la fila `code-reviewer` en Agent Registry (description corta).
- **Dependencias:** `security-auditor` (recibe handoff explícito).

### 4.6 MODIFICAR — `docs-writer` (CLAUDE.md fuera de scope)

- **Tipo:** MODIFICAR
- **Componente:** `.claude/agents/docs-writer.md`
- **Razón:** `claude-md-architect` es el único dueño de CLAUDE.md. `docs-writer` debe limitarse a docstrings, READMEs, endpoint docs y changelogs.
- **Impacto en CLAUDE.md:** actualizar la fila `docs-writer`.
- **Dependencias:** `claude-md-architect`.

### 4.7 CREAR — skill compartida `developer-conventions`

- **Tipo:** CREAR (skill, formato directorio)
- **Componente:** `.claude/skills/developer-conventions/SKILL.md`
- **Razón:** análogo a `pipeline-conventions` pero para `django-developer` + `react-developer` + `tdd-writer` + `test-writer`. Define reglas operativas comunes (grep-first, surgical edits, paths-only I/O, conventional commits format, branch naming HRS-N) y referencias a los conventions específicos. NO duplica contenido — los archivos planos `api-contract`, `backend-conventions`, `react-conventions`, `mui-conventions`, `theme-tokens`, `error-handling`, `security-checklist` siguen siendo cargados según trigger; este skill los **enlaza** y declara cuándo cargar cada uno.
- **Impacto en CLAUDE.md:** añadir fila al Skill Registry.
- **Dependencias:** ninguna nueva; wraps existing.

### 4.8 CREAR — skill compartida `review-conventions`

- **Tipo:** CREAR (skill, formato directorio)
- **Componente:** `.claude/skills/review-conventions/SKILL.md`
- **Razón:** análogo a `pipeline-conventions` para `code-reviewer` + `security-auditor`. Define formato común de severidad (CRITICAL / HIGH / MEDIUM / LOW), output como tabla de hallazgos, regla read-only, regla "no fix — solo report", protocolo de handoff a developer.
- **Impacto en CLAUDE.md:** añadir fila al Skill Registry.
- **Dependencias:** ninguna nueva.

### 4.9 MIGRAR — los 8 skills planos a formato directorio

- **Tipo:** MODIFICAR estructural
- **Componentes:** `workflow.md`, `api-contract.md`, `backend-conventions.md`, `error-handling.md`, `security-checklist.md`, `theme-tokens.md`, `mui-conventions.md`, `react-conventions.md`
- **Razón:** §3.1 del architecture guide exige formato `<skill>/SKILL.md` con frontmatter YAML (`name`, `description`, `version`, `when_to_use`). Los 8 archivos actuales no son validables por `component-linter`. Migración: cada `<n>.md` → `<n>/SKILL.md` + añadir frontmatter.
- **Impacto en CLAUDE.md:** las rutas en la sección "Knowledge Files" cambian de `.claude/skills/<n>.md` a `.claude/skills/<n>/SKILL.md`. La tabla del Skill Registry debe distinguirse de la tabla "Knowledge Files" (hoy las dos tablas mezclan conceptos — los Knowledge Files son skills cargables manualmente; deberían unificarse bajo el Skill Registry).
- **Dependencias:** todos los agentes que cargan estos skills (verificar referencias `@.claude/skills/...`).
- **Riesgo de migración:** si algún agente carga la ruta vieja, romperá. Migración debe ser atómica + grep para localizar todas las referencias.

### 4.10 NORMA TRANSVERSAL — declarar `model:` en todos los agentes

- **Tipo:** MODIFICAR (norma + 15 archivos)
- **Componentes:** los 15 agentes sin `model:` declarado (ver §1.1)
- **Razón:** previsibilidad de costo y calidad. Sin `model:` declarado, el agente usa el default global, que puede cambiar. La asignación recomendada está en §6.
- **Impacto en CLAUDE.md:** opcional — añadir convención en sección "Conventions for Agents and Skills" exigiendo `model:` en todo agente nuevo. Actualizar `agent-scaffold` para hacerlo obligatorio. Actualizar `component-linter` check 11 para validarlo.
- **Dependencias:** `agent-scaffold`, `component-linter`.

### 4.11 NORMA TRANSVERSAL — convención de versionado

- **Tipo:** AÑADIR a CLAUDE.md (no nuevo componente)
- **Razón:** semver mínimo (`major.minor.patch`); reglas: `major` cuando cambia el contrato I/O, `minor` cuando se añade capacidad sin romper, `patch` para fixes de prompt/typo.
- **Impacto en CLAUDE.md:** añadir 3-4 líneas en "Conventions for Agents and Skills".

---

## 5. Skills compartidas que faltan o deben actualizarse

El usuario hizo la pregunta explícita: el patrón `pipeline-conventions` ¿es replicable?

**Sí, en al menos dos grupos:**

### 5.1 `developer-conventions` — CREAR (ver §4.7)

**Cargado por:** `django-developer`, `react-developer`, `tdd-writer`, `test-writer`
**Contiene:**
- Operating rules (grep-first, surgical edits, paths-only I/O)
- Conventional Commits format y branch naming `HRS-<n>/...`
- Cómo y cuándo invocar los conventions específicos (`api-contract`, `backend-conventions`, `error-handling`, `mui-conventions`, etc.)
- Protocolo de handoff developer → `test-writer` y developer → `code-reviewer`

### 5.2 `review-conventions` — CREAR (ver §4.8)

**Cargado por:** `code-reviewer`, `security-auditor`
**Contiene:**
- Formato común de severidad (tabla CRITICAL/HIGH/MEDIUM/LOW con definiciones)
- Output contract común (tabla de hallazgos: archivo, línea, severidad, descripción, recomendación)
- Regla `read-only` y `no-fix-only-report`
- Handoff a developer (qué información mínima debe contener un finding para que el developer pueda accionar)

### 5.3 `pipeline-conventions` — MANTENER (sin cambios funcionales)

Ya está sólido. Solo añadir `[BLOCKER PM]` o tag específico si `pm-writer` sobrevive y necesita su propio bloqueo.

### 5.4 `frontmatter-conventions` — OPCIONAL (ver §3.7)

Skill estático tipo "single source of truth" para qué campos lleva un frontmatter de agente vs skill, qué valores válidos para `model`, cómo versionar. Reduciría duplicación entre `agent-scaffold` template y `component-linter` checks. **Prioridad baja**, pero útil cuando el ecosistema crezca.

---

## 6. Recomendación sobre modelos

Asignación propuesta basada en complejidad cognitiva real de cada tarea (no en su importancia subjetiva).

### 6.1 Haiku — tareas mecánicas, deterministas, alto volumen

| Agente | Por qué haiku |
|---|---|
| `adr-writer` | Ya está. Plantilla fija con 4 secciones. |
| `code-reviewer` | Ya está. Pattern matching contra checklist. |
| `docs-writer` | Ya está. Generación de docstrings y prosa estructurada. |
| `test-writer` | **CAMBIAR de sonnet a haiku.** Tests deterministas (factory_boy + pytest patterns) bien documentados en `backend-conventions`. Salvo casos de edge-case complejos. |

### 6.2 Sonnet — implementación, traducción documento-a-documento, juicio acotado

| Agente | Por qué sonnet |
|---|---|
| `pm-discovery` | Entrevista con juicio para detectar gaps. Ya está. |
| `prd-writer` | Traducción discovery/spec → PRD; juicio acotado. Ya está. |
| `tdd-writer` | **CAMBIAR de opus a sonnet.** Para el 80% de TDDs basta. Documentar cómo escalar a opus manualmente para casos raros. |
| `django-developer` | Implementación con juicio sobre conventions. Ya está. |
| `react-developer` | Idem. Ya está. |
| `security-auditor` | Pattern matching + razonamiento de impacto. Ya está. |
| `process-analyst` | Estructuración de input ambiguo en formato canónico. **Asignar sonnet.** |
| `process-optimizer` | Aplicación de Lean con juicio acotado. **Asignar sonnet.** |
| `systems-analyst` | Traducción to-be → spec funcional. **Asignar sonnet.** |
| `pm-writer` | Si sobrevive: traducción técnica → ejecutiva. **Asignar sonnet.** |
| `claude-md-architect` | Entrevista + plantilla. **Asignar sonnet.** |
| `component-factory` | Orquestación con juicio acotado. **Asignar sonnet.** |
| `aws-devops` | Operaciones de infra con juicio sobre seguridad. **Asignar sonnet.** |
| `ux-designer` | Diseño de flujos con juicio sobre fricción. **Asignar sonnet.** |
| `ui-designer` | Traducción ux-spec → ui-spec. **Asignar sonnet.** |
| `ethical-hacker` | Pentest con juicio técnico complejo. **Asignar sonnet.** Subir a opus solo para CTFs avanzados o red-team. |

### 6.3 Opus — análisis estratégico, multi-stakeholder, juicio profundo

| Agente | Por qué opus |
|---|---|
| `senior-ceo-advisor` | **Asignar opus.** Razonamiento estratégico multi-dimensional, persona de 25+ años de experiencia, decisiones hard-to-reverse. Único agente puramente estratégico. |
| `engineering-manager` | **Asignar opus.** Diagnóstico de equipo con 8 secciones obligatorias, integración pipeline ↔ realidad, recomendaciones de hire. Es el "consultor senior" del ecosistema. |
| `tdd-writer` | **Solo en modo "complex"** — invocación explícita por el usuario cuando el TDD tiene decisiones hard-to-reverse. Documentar el override en CLAUDE.md. |

### 6.4 Resumen comparativo (cambios netos)

| Cambio | Agente | De | A |
|---|---|---|---|
| Degradar | `tdd-writer` | opus | sonnet (default) |
| Degradar | `test-writer` | sonnet | haiku |
| Asignar (era ausente) | `process-analyst` | — | sonnet |
| Asignar | `process-optimizer` | — | sonnet |
| Asignar | `systems-analyst` | — | sonnet |
| Asignar | `pm-writer` (si sobrevive) | — | sonnet |
| Asignar | `claude-md-architect` | — | sonnet |
| Asignar | `component-factory` | — | sonnet |
| Asignar | `aws-devops` | — | sonnet |
| Asignar | `ux-designer` | — | sonnet |
| Asignar | `ui-designer` | — | sonnet |
| Asignar | `ethical-hacker` | — | sonnet |
| Asignar | `senior-ceo-advisor` | — | **opus** |
| Asignar | `engineering-manager` | — | **opus** |

**Impacto esperado:** ahorro significativo en `tdd-writer` (uso frecuente, hoy opus). Calidad incrementada en `senior-ceo-advisor` y `engineering-manager` (uso poco frecuente, hoy default — probablemente sonnet pero impredecible). Coste neto: probablemente neutro o negativo (ahorro).

---

## 7. Resumen ejecutivo de cambios — orden de ejecución sugerido

| Orden | Cambio | Tipo | Bloquea otros |
|---|---|---|---|
| 1 | Migrar 8 skills planos a formato directorio (§4.9) | ESTRUCTURAL | Sí — bloquea linting completo |
| 2 | Declarar `model:` en los 15 agentes que no lo tienen (§4.10) | NORMA TRANSVERSAL | No |
| 3 | Aplicar asignación de modelos recomendada (§6.4) | NORMA TRANSVERSAL | No |
| 4 | Crear skill `developer-conventions` (§4.7) | CREAR | No |
| 5 | Crear skill `review-conventions` (§4.8) | CREAR | No |
| 6 | Modificar `code-reviewer` description (§4.5) | MODIFICAR | Depende de 5 |
| 7 | Modificar `docs-writer` description (§4.6) | MODIFICAR | No |
| 8 | Eliminar `architect` (§4.1) | ELIMINAR | Requiere actualizar `workflow.md` |
| 9 | Reducir inputs de `prd-writer` (§4.3) | MODIFICAR | No |
| 10 | Decidir destino de `pm-writer` (§4.4) | PENDIENTE | Espera input de `engineering-manager` |
| 11 | Añadir convención de versionado en CLAUDE.md (§4.11) | NORMA | No |

**Ninguno de estos cambios toca código de aplicación.** Todos son `.claude/*` + `CLAUDE.md`.

---

## 8. Lo que `component-factory` NO ha hecho aquí (límites)

- No ha modificado ningún archivo bajo `.claude/`.
- No ha modificado `CLAUDE.md`.
- No ha tomado decisión final sobre `pm-writer` — espera input de `engineering-manager`.
- No ha leído cuerpos completos de los agentes que parecían bien delimitados por frontmatter (grep-first).
- No ha auditado los `.claude/shared/*` documents — están fuera del scope de "componentes" (son contexto compartido, no agentes ni skills).

## 9. Pregunta abierta para el usuario

Antes de aprobar el plan completo, conviene confirmar con `engineering-manager`:

1. **¿Hay un PM humano en el equipo que aprueba documentos antes de implementación?**
   - Si SÍ → mantener `pm-writer`, reducir inputs de `prd-writer`.
   - Si NO → fusionar `pm-writer` en `prd-writer`.

2. **¿Hay un arquitecto técnico humano que toma decisiones pre-TDD?**
   - Si SÍ → mantener `architect` (revisar scope para que no solape).
   - Si NO → eliminar `architect` como en §4.1.

Esas dos respuestas determinan los cambios §4.1 y §4.4.

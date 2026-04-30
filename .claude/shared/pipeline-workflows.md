# Pipeline Workflows

Operational reference for orchestrating agents in the Hersa project. Load when starting any non-trivial feature, bug fix, or business analysis.

## Gestión de CLAUDE.md y componentes

**Bootstrap o migración de CLAUDE.md:**
> "Use claude-md-architect to set up CLAUDE.md for this project."

**Crear un agente o skill nuevo:**
> "Use component-factory to scaffold a [skill|agent] that [capability]."

**Auditar el CLAUDE.md (e.g., en CI):**
> Run `claude-md-linter` directly on the file.

---

## Selección de flujo

Usa el **primer** flujo cuya condición aplique:

| Flujo | Cuándo |
|---|---|
| **Flow D — Bug fix** | Algo roto, sin nueva migración ni endpoint |
| **Flow E — Lightweight** | Cambio en una sola superficie, sin nuevos modelos ni endpoints |
| **Flow C — Linear ticket** | Ticket Linear con AC claros |
| **Flow J — Short discovery** | Spec global ya existe; feature necesita discovery → PRD → TDD |
| **Flow A — Strategic** | Nueva iniciativa con impacto comercial significativo |
| **Flow B — From technical definition** | Proceso claro; formalizar ingeniería |

Para ejecutar un flujo configurado:
> "Use pipeline-runner to plan Flow [letter] for [description]."

---

## Flow D — Bug fix

**Entry guard:** confirmar que el fix NO requiere nueva migración ni nuevo endpoint. Si sí → escalar a Flow C o B.

```
1. django-developer o react-developer  → fix puntual, blast radius mínimo
2. test-writer                         → test de regresión (obligatorio)
3. code-reviewer
4. /pr-create
```

**Exit guard:** el test de regresión debe cubrir exactamente el escenario fallido.

---

## Flow E — Lightweight

**Entry guard:** verificar que TODO lo siguiente es verdad antes de proceder sin TDD:
- [ ] Sin nuevo modelo Django ni migración
- [ ] Sin nuevo endpoint del que dependa la otra superficie
- [ ] Un solo desarrollador puede completarlo sin coordinar con la otra superficie
- [ ] Sin lógica de auth, pagos ni PII

Si algún item es falso → escalar a **Flow C o B**.

```
django-developer o react-developer → code-reviewer → (test-writer si el comportamiento es no trivial)
```

---

## Flow C — Linear ticket → implementación

**Entry guard:** antes de escribir una sola línea de código:
1. Leer el ticket completo — acceptance criteria, no solo el título
2. Verificar `/documentation/requirements/tdd/` para un TDD existente
3. Si no hay TDD y el ticket es no trivial → correr `tdd-writer` primero
4. Si el scope ha crecido más allá del estimado original → avisar al usuario antes de continuar

```
/start-task → (tdd-writer si no existe TDD) → django-developer / react-developer → test-writer → code-reviewer → /pr-create
```

Branch y commit format:
- Branch: `HRS-<n>/<short-description>`
- Commits: `feat(events): add confirmation endpoint (HRS-42)`

---

## Flow J — Short discovery (feature desde spec global)

**Cuándo:** `hersa-especificaciones-funcionales.md` ya existe. Se necesita un PRD formal para un subset de épicos/user stories, sin correr el proceso completo de análisis.

```
1. pm-discovery     → entrevista enfocada en el subset de épicos relevantes
                      → saves /documentation/requirements/discovery/DISC-00N.md
                      → [USER CONFIRMS antes del siguiente paso]

2. prd-writer       → lee DISC-00N + épicos relevantes de la spec global
                      → saves /documentation/requirements/prd/PRD-00N.md
                      → [USER REVIEWS AND APPROVES — hard stop]

3. tdd-writer       → lee PRD aprobado + codebase + convenciones
                      → saves /documentation/requirements/tdd/TDD-00N.md
                      → [USER REVIEWS AND APPROVES — hard stop]

3b. adr-writer      → (condicional: si TDD §8 marca una decisión difícil de revertir)
                      → saves /documentation/requirements/adr/ADR-00N-title.md

4. /create-task + /start-task
5. django-developer / react-developer
6. test-writer → code-reviewer → release-manager
```

---

## Flow A — Strategic full pipeline

**Cuándo:** nueva iniciativa con impacto comercial significativo (nuevo módulo, nueva línea de servicio). Ver `.claude/skills/pipeline-flows/SKILL.md` para la secuencia completa.

Agentes adicionales obligatorios en Flow A:
- `qa-engineer` → después de `test-writer`, antes de `release-manager`
- `legal-compliance-advisor` → gate condicional antes de `release-manager` cuando la feature toca PII, menores, o imágenes

---

## Flow B — From technical definition

**Cuándo:** proceso/spec ya claro; formalizar ingeniería antes de implementar. Ver `.claude/skills/pipeline-flows/SKILL.md` para la secuencia completa.

---

## Pipeline de análisis de negocio (proceso → especificación)

Punto de entrada cuando se quiere analizar, mejorar, o especificar un proceso antes de implementar.

```
0. brand-designer          → brand strategy + visual system + tone of voice
                             [HSTOP: validar brand strategy antes de continuar]

1. process-analyst         → as-is document
                             [HSTOP: usuario confirma antes del siguiente paso]

2. process-optimizer       → to-be document
                             [HSTOP: resolver [NECESITA CONTEXTO] antes de continuar]

3. systems-analyst         → functional spec (hersa-especificaciones-funcionales.md)
                             [HSTOP: resolver [BLOCKER] antes de continuar]

3b. legal-compliance-advisor → legal-risk assessment   [CONDICIONAL: solo si la spec
                             toca PII, menores, imágenes, o flujos de consentimiento]

4. pm-writer               → executive PM document   [HSTOP: aprobación — hard stop]

5. ux-designer             → ux-spec
                             [HSTOP: resolver [FRICCIÓN ALTA] antes de continuar]

6. ui-designer             → ui-spec

7. prd-writer              → PRD                     [HSTOP: usuario aprueba — hard stop]

8. → continuar con Flow A o B para ingeniería
```

**Puntos de entrada configurables:**

| Punto de entrada | Cuándo usarlo |
|---|---|
| `process-analyst` (paso 1) | Proceso no documentado; se empieza desde cero |
| `systems-analyst` (paso 3) | to-be limpio ya existe; se necesita spec funcional |
| `prd-writer` (paso 7) | Spec funcional aprobada; se necesita PRD formal |
| `tdd-writer` directamente | PRD aprobado; saltar directo a diseño técnico |

---

## Agent handoff rules

- **pm-discovery → prd-writer**: prd-writer lee el discovery brief como input primario. Sin brief, se detiene y pide.
- **prd-writer → tdd-writer**: tdd-writer lee el PRD aprobado completo. Nunca correr sobre un draft.
- **tdd-writer → /create-task**: los tickets se crean desde TDD §7 y §10. Sin TDD, los tickets serán vagos.
- **tdd-writer → adr-writer**: cuando TDD §8 marca una decisión con `→ run adr-writer`, pasar el path del TDD y la decisión específica como contexto. adr-writer lee el TDD y escribe el ADR antes de que empiece la implementación.
- **developer → test-writer**: el developer reporta qué archivos creó o modificó. test-writer los lee antes de escribir un solo test.
- **developer → code-reviewer**: el reviewer lee el diff. El código debe hablar por sí solo.
- **any → docs-writer**: solo después de que la implementación es estable y los tests pasan.

## Parallel vs sequential

**Pueden correr en paralelo:**
- `django-developer` y `react-developer` una vez acordado el API contract en el TDD
- `test-writer` para backend y frontend simultáneamente

**Deben ser secuenciales:**
- `pm-discovery` → `prd-writer` → `tdd-writer` → implementación (cada paso requiere aprobación previa)
- `security-auditor` corre después de la implementación, no durante
- `docs-writer` corre al final — después de que los tests pasan y el código está revisado

---

## Pre-deploy checklist

Correr antes de cualquier merge a main:

```
1. security-auditor → full scan (requerido si auth, PII, o pagos están involucrados)
2. code-reviewer    → revisar cualquier código no revisado en esta branch
3. test-writer      → asegurar coverage en critical paths
4. docs-writer      → actualizar CLAUDE.md y changelog si las convenciones cambiaron
```

---

## Hard stops compartidos (nunca saltear)

- NEVER empezar implementación sin mínimo un ticket con AC (Flow C) o un TDD aprobado (Flows A/B)
- NEVER mergear a main sin `release-manager` PASS para cambios no triviales
- NEVER deployar un release con auth, PII, o pagos sin `security-auditor` + `release-manager`
- NEVER correr un agente downstream si su tag upstream (`[AMBIGUO]`, `[FALTA INFO]`, `[NECESITA CONTEXTO]`, `[BLOCKER]`, `[FRICCIÓN ALTA]`, `[LEGAL-BLOCKER]`, `[QA-BLOCK]`) no está resuelto

---

## Gates disponibles en cualquier punto del pipeline

- `senior-ceo-advisor` → valida realismo de negocio (pre-discovery, post-spec, pre-deploy)
- `engineering-manager` → sanity-check técnico y de equipo antes de implementación
- `qa-engineer` → validación E2E y regresión antes de `release-manager`; obligatorio en Flows A y B; también pre-temporada de graduaciones
- `legal-compliance-advisor` → gate condicional cuando la feature toca PII, menores, imágenes, o flujos de consentimiento; antes de aprobar PRDs y antes de deploys con nuevas superficies de recolección de datos
- `data-analyst` → análisis pre-comercial y demanda pre-temporada (8–12 semanas de anticipación)
- `release-manager` → gate pre-merge obligatorio para PRs a `main`
- `security-auditor` → revisión de seguridad antes de cualquier deploy con auth/PII/pagos
- `adr-writer` → documenta decisiones arquitectónicas no obvias o difíciles de revertir; invocar cuando `tdd-writer` identifica una decisión con múltiples alternativas serias

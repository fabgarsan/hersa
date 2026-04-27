# Diagnóstico Engineering Manager — Equipo de Agentes Claude Code Hersa

**Fecha:** 2026-04-27
**Autor:** Engineering Manager (Hersa)
**Alcance:** Diagnóstico del equipo de agentes Claude Code (`.claude/agents/`, `.claude/skills/`) y propuesta de simplificación operativa.
**Estado:** Diagnóstico técnico — no implementa cambios. Propone modificaciones para `component-factory` y `claude-md-architect`.
**Stage de Hersa:** startup/growth, equipo de agentes pre-producción.

> Documento directo. No suaviza problemas críticos. Cualquier punto rojo se nombra como rojo.

---

## 1. Snapshot del equipo de agentes actual

### 1.1 Inventario completo (24 agentes)

| Agente | Modelo | Tools (núm) | Scope declarado | Familia |
|---|---|---|---|---|
| `pm-discovery` | sonnet-4-6 | 3 (R/W/Glob) | Entrevista de descubrimiento; produce DISC-00N | Discovery |
| `prd-writer` | sonnet-4-6 | 3 (R/W/Glob) | PRD desde DISC, spec o input directo | Producto |
| `pm-writer` | (default) | 3 (R/W/Glob) | Documento ejecutivo MoSCoW para PM, desde spec | Producto |
| `architect` | sonnet-4-6 | 3 (R/Grep/Glob) | Plan técnico previo al TDD | Arquitectura |
| `tdd-writer` | opus-4-7 | 4 (R/W/Glob/Grep) | TDD desde PRD aprobado | Arquitectura |
| `adr-writer` | haiku-4-5 | 2 (W/Glob) | Documenta ADR cuando TDD lo flagea | Arquitectura |
| `process-analyst` | (default) | 3 (R/W/Glob) | As-is process | Proceso |
| `process-optimizer` | (default) | 3 (R/W/Glob) | To-be Lean | Proceso |
| `systems-analyst` | (default) | 3 (R/W/Glob) | Spec funcional (epics/US/AC/API) | Proceso |
| `ux-designer` | (default) | 3 (R/W/Glob) | UX spec (flujos, jerarquía) | Diseño |
| `ui-designer` | (default) | 3 (R/W/Glob) | UI spec (tokens, layouts) | Diseño |
| `django-developer` | sonnet-4-6 | 6 (R/W/E/B/Gr/Gl) | Backend Django/DRF | Implementación |
| `react-developer` | sonnet-4-6 | 6 (R/W/E/B/Gr/Gl) | Frontend React 19/MUI | Implementación |
| `test-writer` | sonnet-4-6 | 6 (R/W/E/B/Gr/Gl) | pytest-django + RTL | QA |
| `code-reviewer` | haiku-4-5 | 3 (R/Gr/Gl) | Revisión post-implementación | QA |
| `security-auditor` | sonnet-4-6 | 3 (R/Gr/Gl) | Auditoría estática de seguridad | Seguridad |
| `ethical-hacker` | (default) | 5 (R/B/W/Gr/WF) | Pentest activo, OWASP, OSINT, CTF | Seguridad |
| `aws-devops` | (default) | 6 (R/W/E/B/Gr/Gl) | AWS EB/RDS/S3/CloudFront/CI | DevOps |
| `docs-writer` | haiku-4-5 | 5 (R/W/E/Gl/Gr) | Docstrings, CLAUDE.md, API docs | Docs |
| `senior-ceo-advisor` | (default) | 2 (R/Gl) | Consejo estratégico ejecutivo | Negocio |
| `engineering-manager` | (default) | 3 (R/W/Gl) | Diagnóstico de equipo + integración pipeline | Meta |
| `claude-md-architect` | (default) | 4 (R/W/Gl/B) | Bootstrap/migrar CLAUDE.md | Meta |
| `component-factory` | (default) | 5 (R/W/B/Gl/Gr) | Crear/extender agents y skills | Meta |

**Total:** 24 agentes activos. Para una startup de 1 humano + agentes, esto es **mucho**. Para comparar: la mayoría de equipos tech de growth-stage operan con 6-10 agentes especializados.

### 1.2 Distribución por familia

- **Pipeline producto/proceso (largo):** 6 agentes (pm-discovery, prd-writer, pm-writer, process-analyst, process-optimizer, systems-analyst)
- **Arquitectura/diseño técnico:** 3 (architect, tdd-writer, adr-writer)
- **Diseño UX/UI:** 2 (ux-designer, ui-designer)
- **Implementación:** 3 (django-developer, react-developer, test-writer)
- **QA/Seguridad:** 3 (code-reviewer, security-auditor, ethical-hacker)
- **DevOps/Docs:** 2 (aws-devops, docs-writer)
- **Negocio/Meta:** 4 (senior-ceo-advisor, engineering-manager, claude-md-architect, component-factory)

### 1.3 Solapamientos detectados

| Solapamiento | Agentes implicados | Tipo |
|---|---|---|
| Documentación de requisitos | `pm-discovery` ↔ `process-analyst` ↔ `pm-writer` ↔ `prd-writer` | **Alto** — los cuatro escriben "documentos de requisitos" en distintos niveles |
| Diseño técnico | `architect` ↔ `tdd-writer` | **Medio** — architect produce "plan técnico"; tdd-writer produce "diseño técnico". La frontera no está clara cuando el caso es simple |
| Revisión de seguridad | `security-auditor` ↔ `ethical-hacker` | **Bajo si bien delimitado** — uno es estático, otro activo. Pero `ethical-hacker` es ajeno al pipeline normal de Hersa (CTF/red-team está fuera del flujo de producto) |
| Documentación post-implementación | `docs-writer` ↔ `code-reviewer` (tangencial) | **Bajo** |
| Generación de meta-componentes | `component-factory` ↔ `claude-md-architect` | **Bajo y bien resuelto** — uno toca `.claude/agents` y `.claude/skills`, otro toca `CLAUDE.md` |

### 1.4 Huecos de cobertura

- **No hay agente para diagnóstico de incidentes en producción.** Si algo se rompe en EB o RDS, no existe un `incident-responder` que correlacione logs, identifique blast radius y proponga rollback.
- **No hay agente de performance/profiling.** N+1 queries y re-renders los detecta `code-reviewer` por inspección, pero no hay un perfilador real con datos de producción.
- **No hay un orquestador de pipeline configurable.** El usuario debe acordarse de la secuencia. Los flujos están documentados en `workflow.md`, pero no hay un agente que lea "quiero ejecutar desde X hasta Y" y llame a los demás.
- **No hay un linter de pipeline cross-document.** `claude-md-linter` y `component-linter` validan estructura. No existe nada que verifique "el to-be referencia procesos que no están en hersa-process.md" o "el spec funcional incluye una entidad que el TDD no menciona".
- **Falta un agente "release manager"** que orqueste `security-auditor` + `code-reviewer` + `docs-writer` antes de un merge a main. Hoy esto es manual.

### 1.5 Modelos asignados — lectura rápida

- 7 agentes declaran `model:` explícito. **17 agentes no lo declaran**, lo que significa que heredan el modelo por defecto de la sesión. En una startup con presupuesto, esto puede ser caro o barato según la sesión, pero es **impredecible** y dificulta cost forecasting. Recomendación: asignar modelo explícito a todos.

---

## 2. Análisis del flujo de trabajo actual

### 2.1 Cómo viaja una idea hoy (full pipeline declarado)

```
[Idea de negocio]
   ↓
senior-ceo-advisor (opcional, cualquier punto)
   ↓
process-analyst → as-is
   ↓
process-optimizer → to-be (bloquea si hay [AMBIGUO]/[FALTA INFO])
   ↓
systems-analyst → spec funcional (bloquea si hay [NECESITA CONTEXTO])
   ↓
pm-writer → documento ejecutivo MoSCoW (bloquea si hay [BLOCKER])
   ↓
[USUARIO/PM aprueba scope]
   ↓
prd-writer → PRD (también puede partir de DISC)
   ↓
ux-designer → ux-spec.md (bloquea si hay [BLOCKER] en spec)
   ↓
ui-designer → ui-spec.md (bloquea si hay [FRICCIÓN ALTA])
   ↓
architect (opcional) → plan técnico
   ↓
tdd-writer → TDD (bloquea sin PRD aprobado)
   ↓
adr-writer (condicional, si TDD §8 flagea)
   ↓
/create-task → Linear
   ↓
/start-task → branch
   ↓
django-developer / react-developer (paralelos cuando contrato API listo)
   ↓
test-writer
   ↓
code-reviewer
   ↓
security-auditor (obligatorio en auth/PII/pagos)
   ↓
docs-writer
   ↓
/pr-create
   ↓
aws-devops (deploy)
```

**Fricción real:** entre la idea y el primer commit pueden pasar **9 agentes secuenciales** con bloqueos en cada uno. Para una feature simple esto es brutal.

### 2.2 Lo que funciona bien

- **`pipeline-conventions` skill** centraliza la pre-flight validation. Buena decisión: cada agente downstream sabe exactamente qué tags bloquean su entrada y dónde escribir su output.
- **Vocabulario de tags bloqueantes** (`[AMBIGUO]`, `[FALTA INFO]`, `[NECESITA CONTEXTO]`, `[BLOCKER]`, `[FRICCIÓN ALTA]`, `[RIESGO LEGAL]`) es disciplinado. Si se respeta, evita "implementación con suposiciones".
- **`workflow.md`** ofrece 4 flujos según naturaleza del trabajo (Bug fix, Lightweight, Linear ticket, Full pipeline). Esto ya es una primera versión de "puntos de entrada configurables", pero no está formalizada.
- **Separación frontend/backend con contratos API explícitos** permite paralelismo real entre `django-developer` y `react-developer` una vez que el TDD existe.
- **Scope boundaries explícitos** en cada agente. Esto reduce el riesgo de un agente tocando archivos fuera de su competencia.

### 2.3 Lo que crea fricción

1. **Cuello de botella en la fase de documentación.** Para llegar al primer commit, el camino "limpio" exige `process-analyst → process-optimizer → systems-analyst → pm-writer → prd-writer`. Son 5 documentos antes de cualquier código. **Para una startup, esto es un anti-patrón salvo en módulos críticos.**
2. **Doble documento ejecutivo:** `pm-writer` (MoSCoW para PM) + `prd-writer` (PRD para implementación). En Hersa, donde el PM y el Engineering Manager son la misma persona (Fabio), esto es **redundancia pura**. Un solo documento bastaría.
3. **`pm-discovery` vs `process-analyst`:** ambos entrevistan/estructuran información. La frontera es "feature nueva" vs "proceso existente", pero en la práctica un usuario no sabe cuándo invocar uno u otro y `workflow.md` no lo aclara.
4. **`architect` vs `tdd-writer`:** `workflow.md` dice "architect (optional)". En la práctica, `tdd-writer` ya produce todo lo que `architect` produciría. **`architect` es redundante el 90% del tiempo.**
5. **`adr-writer` se invoca solo cuando `tdd-writer` flagea.** Esto funciona en teoría; en la práctica nadie verifica si los flags se respetaron. Sin enforcement, los ADR no se escriben.
6. **No hay "punto de entrada configurable".** El usuario debe leer `workflow.md`, escoger un flujo, y manualmente invocar cada agente. Falta un orquestador.
7. **`code-reviewer` y `security-auditor` corren después de la implementación.** Si encuentran problemas críticos, todo el ciclo de feedback es manual y costoso. No están integrados con git hooks.
8. **No hay handoff automático.** Cada agente "returns control to the caller" — la cadena la maneja el humano. Para pipelines largos esto es ruido cognitivo.

### 2.4 Cuellos de botella concretos

- **Estado documental sobrepoblado:** una feature pasa por `as-is.md → to-be.md → especificaciones-funcionales.md → documento-pm.md → PRD-NNN.md → TDD-NNN.md → ux-spec.md → ui-spec.md → ADR-NNN-*.md`. Son **9 artefactos textuales** antes del código. Para Hersa stage actual, esto es **sobre-ingeniería de proceso**.
- **Tags bloqueantes sin escape hatch:** si `process-optimizer` deja un `[NECESITA CONTEXTO]` y el humano no lo resuelve, todo el pipeline downstream se queda parado. No hay un agente "tag-resolver" que ayude a desbloquear.
- **`engineering-manager` no integra con el pipeline operativo.** Es un agente de reflexión (se invoca para diagnósticos), no de control. No puede activar/desactivar agentes ni ajustar pesos.

---

## 3. Riesgos críticos

### 3.1 Single-point-of-failure

| Agente SPOF | Riesgo | Severidad |
|---|---|---|
| `tdd-writer` | Es el único que traduce PRD → plan ejecutable. Si su output es ambiguo, devs se atascan. **Modelo `opus-4-7` (caro)** = uso costoso por feature. | Alta |
| `systems-analyst` | Es el único puente entre proceso y especificación. Sin él, el pipeline no llega a PM/PRD desde un to-be. | Alta |
| `claude-md-architect` | Único agente que toca `CLAUDE.md`. Si su lógica falla, no hay redundancia. | Media |
| `component-factory` | Único que crea/extiende agentes. Si falla, el equipo no escala. | Media |
| `pipeline-conventions` skill | Toda la disciplina de tags depende de esta única skill. Si se modifica mal, **todos** los agentes pipeline pueden romperse silenciosamente. | **Crítica** |
| `hersa-process.md` | 9 agentes la cargan via `@.claude/shared/hersa-process.md`. Si se corrompe, contamina ~40% del equipo. | **Crítica** |

### 3.2 Flujos ambiguos

1. **"Cuándo correr architect."** `workflow.md` dice "(optional)". Sin criterio cuantitativo, cada usuario decide distinto. Resultado: a veces se omite y se pagan errores; a veces se ejecuta por nada y se quema tiempo.
2. **"Cuándo invocar pm-writer."** Existe un protocolo (después de `systems-analyst`, antes de `prd-writer`), pero ningún agente lo enforce. Es trivial saltárselo.
3. **"Cuándo el flujo es Lightweight vs Full."** `workflow.md` da una checklist, pero no hay un agente que haga el sorting automático. El usuario debe leerla y decidir.
4. **"Cuándo `senior-ceo-advisor` debe intervenir."** Su scope dice "any point in the pipeline". Esto es **demasiado ancho** — termina siendo un agente que nunca se invoca, o que se invoca para cosas que no necesita.

### 3.3 Pasos que pueden fallar silenciosamente

- **`adr-writer` solo se invoca por flag manual del TDD.** Si el `tdd-writer` no marca correctamente `→ run adr-writer`, no se documenta la decisión. **No hay verificación automática.**
- **Tags `[RIESGO LEGAL]`** son meramente informacionales — ningún agente bloquea por ellos. Un riesgo legal puede llegar a producción si nadie lo lee a mano.
- **`security-auditor`** es opcional en `workflow.md` salvo en auth/PII/pagos. La determinación de "esta feature toca PII" es subjetiva. **Riesgo real:** features que tocan datos de estudiantes (nombres, documento, teléfono) podrían pasar sin auditoría.
- **`docs-writer`** es siempre el último paso. En la práctica, cuando hay presión por entregar, se omite. **Resultado: deuda documental acumulada.**
- **`test-writer` no bloquea PR.** Si los devs no lo invocan, no hay cobertura. Solo los hooks (ruff, mypy, ESLint) protegen.

### 3.4 Riesgos de modelo y coste

- **`tdd-writer` usa `opus-4-7`** por feature. Esto es justificable para features complejas, pero es excesivo para CRUDs simples. No hay escalado por complejidad.
- **17 agentes sin modelo declarado.** Al heredar el modelo de sesión, no hay forma de presupuestar coste por feature. Para una startup, **esto debe corregirse antes del primer mes de uso intensivo.**

---

## 4. Lo que sobra

Lista directa, sin diplomacia.

### 4.1 `architect` — **redundante el 90% del tiempo**
- Su output es "plan técnico" antes del TDD. `tdd-writer` ya produce un plan técnico equivalente o superior.
- En `workflow.md` está marcado como "(optional)". Eso es una señal de que no es esencial.
- **Recomendación:** ELIMINAR como agente independiente. Fusionar su capacidad como "Phase 0" interna del `tdd-writer` cuando la complejidad lo amerite.

### 4.2 `pm-writer` — **redundante en startup de un solo PM**
- Hersa hoy tiene un solo decisor que es a la vez CEO/PM/EM (Fabio). Generar un "documento ejecutivo separado" para que él se lo apruebe a sí mismo es overhead puro.
- En empresas grandes con PM separado del Eng tendría sentido. **No es el caso de Hersa.**
- **Recomendación:** ELIMINAR. Mover la sección MoSCoW al `prd-writer` como una sub-sección obligatoria.

### 4.3 `pm-discovery` — **scope solapado con `process-analyst`**
- Ambos hacen entrevistas estructuradas. La diferencia es semántica: "discovery de feature" vs "as-is de proceso".
- En la práctica del equipo de Hersa, todas las features nuevas son extensiones de procesos existentes (graduación, fotografía, togas). Casi nunca hay un greenfield "puro" sin proceso operativo previo.
- **Recomendación:** EVALUAR FUSIÓN con `process-analyst` en un solo agente `discovery-analyst` que decida en runtime si es feature greenfield o extensión de proceso. Si la fusión es muy invasiva, mantener ambos pero clarificar el árbol de decisión en `workflow.md`.

### 4.4 `ethical-hacker` — **fuera de pipeline operativo**
- CTF, OSINT, social engineering — no son actividades del flujo de producto de Hersa.
- Solo tiene sentido si Hersa hace red-team interno o paga pentests externos.
- **Recomendación:** MANTENER pero **mover a una categoría "extra-pipeline"** en CLAUDE.md. Documentar que **no participa del flujo de features**. Considerar moverlo a un repositorio personal/separado si no se usa.

### 4.5 Sobre `senior-ceo-advisor`
- Útil pero **mal posicionado**. Su scope "any point in the pipeline" lo hace invisible. En la práctica un usuario olvida que existe.
- **Recomendación:** MANTENER pero **integrar como gate explícito** en flujos estratégicos (ver Sección 7).

### 4.6 Múltiples skills con baja densidad de uso
- `theme-tokens.md`, `mui-conventions.md`, `react-conventions.md` podrían fusionarse en una sola `frontend-conventions.md` o quedar como sub-secciones de `frontend/CLAUDE.md`.
- `backend-conventions.md`, `api-contract.md`, `error-handling.md`, `security-checklist.md` están razonablemente separadas. **No tocar por ahora.**

---

## 5. Lo que falta

### 5.1 Orquestador de pipeline (`pipeline-runner` o equivalente)
- **Capacidad faltante:** "ejecutá el pipeline desde X hasta Y para esta feature". Hoy el humano hace de orquestador.
- **Por qué es crítico:** sin esto, el usuario no puede aprovechar los puntos de entrada configurables (Sección 7).

### 5.2 Agente de respuesta a incidentes (`incident-responder`)
- **Capacidad faltante:** correlacionar logs de EB + RDS, identificar blast radius, proponer rollback o hotfix.
- **Por qué es crítico:** Hersa opera en temporada de graduaciones (noviembre-diciembre) con picos donde un fallo en producción es **catastrófico** comercialmente.

### 5.3 Agente de release / pre-merge gate (`release-manager`)
- **Capacidad faltante:** orquesta `security-auditor` + `code-reviewer` + `docs-writer` antes de merge a `main`.
- **Por qué es crítico:** hoy el merge a main es totalmente manual. Sin un gate, los hooks de Husky son la única red.

### 5.4 Agente de QA exploratorio (`qa-explorer`)
- **Capacidad faltante:** ejercitar flujos end-to-end de producto contra staging y reportar bugs antes de release.
- **Por qué es importante:** `test-writer` produce tests unitarios e integración por archivo. Nadie hace E2E manual sistemático.

### 5.5 Linter cross-document de pipeline (`pipeline-trace-linter`)
- **Capacidad faltante:** validar que cada `US-NNN` del spec funcional aparece en el TDD; que cada entidad del spec aparece en el TDD §3; que cada endpoint del TDD §4 se referencia en al menos un US.
- **Por qué importa:** previene "implementación que olvidó una historia" y "TDD que metió endpoints fantasmas".

### 5.6 Skill para flujos parametrizados
- **Capacidad faltante:** una skill `pipeline-flows` que defina cada flujo configurable (A, B, C…) con su entrypoint, agentes en orden y exitpoint.
- **Por qué importa:** sin esto, el "punto de entrada configurable" es solo una idea, no un comportamiento del sistema.

---

## 6. Propuesta de simplificación

Cambios concretos, ordenados por impacto.

### 6.1 ELIMINAR — `architect`

- **Justificación:** redundante con `tdd-writer`.
- **Migración:** mover una sección "Architectural reasoning" como `Phase 0` opcional dentro del system prompt de `tdd-writer`. Si la feature es trivial, salta directo al diseño; si es compleja, hace el razonamiento arquitectural antes.
- **Impacto en CLAUDE.md:** quitar fila del Agent Registry. Quitar referencia en `workflow.md` (paso 3 de Full pipeline).

### 6.2 ELIMINAR — `pm-writer`

- **Justificación:** redundante en una organización donde PM y EM son la misma persona.
- **Migración:** agregar una sub-sección obligatoria `## 0. MoSCoW priorities` al inicio del PRD producido por `prd-writer`.
- **Impacto en CLAUDE.md:** quitar fila del Agent Registry. Actualizar `pipeline-conventions` skill para quitar la fila `pm-writer → documentation/requirements/pm/`.

### 6.3 FUSIONAR — `pm-discovery` + `process-analyst` → `discovery-analyst` (opcional, fase 2)

- **Justificación:** ambos hacen entrevistas estructuradas; la frontera es semántica.
- **Estrategia:** en una primera fase mantener ambos pero clarificar árbol de decisión:
  - Si el usuario describe **feature greenfield sin proceso operativo previo** → `pm-discovery`
  - Si el usuario describe **proceso existente que quiere documentar y mejorar** → `process-analyst`
  - En cualquier otro caso → `process-analyst` (Hersa rara vez hace greenfield puro)
- En una segunda fase, evaluar fusión total.

### 6.4 MOVER `ethical-hacker` a sección "Extra-pipeline"

- **Justificación:** no es parte del flujo de producto.
- **Acción:** crear sección "## Extra-pipeline agents" en CLAUDE.md con `ethical-hacker` y dejar claro que no se invoca durante features normales.

### 6.5 MODIFICAR `senior-ceo-advisor`

- **Justificación:** scope demasiado ancho lo vuelve invisible.
- **Acción:** redefinir `when_to_use` para incluir 3 momentos canónicos:
  - Antes de `pm-discovery` (¿esta idea tiene sentido de negocio?)
  - Después de `systems-analyst` (¿el spec resultante es viable comercialmente?)
  - Antes del deploy a producción de un módulo nuevo (¿operacionalmente listos?)

### 6.6 MODIFICAR `engineering-manager`

- **Justificación:** hoy es solo diagnóstico. Necesita capacidad de "validar pipeline antes de implementación".
- **Acción:** ampliar `when_to_use` para incluir "pipeline sanity-check antes de pasar a `tdd-writer`". En vez de un orquestador, queda como "gatekeeper técnico".

### 6.7 CREAR — `pipeline-runner` (skill, no agente)

- **Justificación:** hace falta un mecanismo declarativo para "ejecutá flujo X desde paso Y hasta paso Z".
- **Tipo:** skill (no agente). Procedural, determinista, no orquesta con juicio.
- **Output:** lista ordenada de invocaciones de agente.
- Ver Sección 7 para los flujos definidos.

### 6.8 CREAR — `release-manager` (agente)

- **Justificación:** falta un gate de pre-merge real.
- **Scope:** orquesta `code-reviewer` + `security-auditor` (condicional) + `docs-writer` antes de un PR a main.
- **Tools:** Read, Grep, Glob, Bash (para correr tests/linters).
- **Modelo:** sonnet-4-6.

### 6.9 CREAR — `incident-responder` (agente)

- **Justificación:** Hersa opera con temporadas pico (graduación). Sin este agente, los incidentes son crisis manuales.
- **Scope:** lectura de logs EB/RDS, identificación de blast radius, recomendación de rollback o hotfix.
- **Tools:** Read, Bash, Grep, Glob.
- **Modelo:** sonnet-4-6.
- **Prioridad:** **alta**, antes de la próxima temporada de graduaciones.

### 6.10 CREAR — `pipeline-trace-linter` (skill)

- **Justificación:** validación cross-document para evitar drift entre spec, PRD y TDD.
- **Tipo:** skill, similar a `claude-md-linter` y `component-linter`.
- **Output:** reporte PASS/WARN/FAIL por documento.

### 6.11 MODIFICAR — todos los agentes sin `model:` explícito

- **Justificación:** previsibilidad de coste.
- **Acción:** asignar modelo explícito a cada agente. Recomendación inicial:
  - `haiku-4-5`: agentes de soporte (`docs-writer`, `code-reviewer`, `adr-writer` ya lo tienen)
  - `sonnet-4-6`: implementadores y la mayoría del pipeline
  - `opus-4-7`: solo `tdd-writer` (justificado por complejidad de razonamiento arquitectural) y eventualmente `incident-responder`

### 6.12 Resumen del equipo optimizado (estado deseado)

| Agente | Acción | Modelo | Justificación |
|---|---|---|---|
| `pm-discovery` | Mantener | sonnet-4-6 | Discovery puro |
| `process-analyst` | Mantener | sonnet-4-6 | As-is process |
| `process-optimizer` | Mantener | sonnet-4-6 | To-be Lean |
| `systems-analyst` | Mantener | sonnet-4-6 | Spec funcional |
| `prd-writer` | Modificar (incluir MoSCoW) | sonnet-4-6 | PRD único |
| `tdd-writer` | Modificar (incluir Phase 0 architect) | opus-4-7 | TDD único |
| `adr-writer` | Mantener | haiku-4-5 | ADR ad-hoc |
| `ux-designer` | Mantener | sonnet-4-6 | UX |
| `ui-designer` | Mantener | sonnet-4-6 | UI |
| `django-developer` | Mantener | sonnet-4-6 | Backend |
| `react-developer` | Mantener | sonnet-4-6 | Frontend |
| `test-writer` | Mantener | sonnet-4-6 | QA |
| `code-reviewer` | Mantener | haiku-4-5 | Review |
| `security-auditor` | Mantener | sonnet-4-6 | Sec estática |
| `aws-devops` | Mantener | sonnet-4-6 | Infra |
| `docs-writer` | Mantener | haiku-4-5 | Docs |
| `senior-ceo-advisor` | Modificar (3 gates) | sonnet-4-6 | Negocio |
| `engineering-manager` | Modificar (pipeline gate) | sonnet-4-6 | Meta |
| `claude-md-architect` | Mantener | sonnet-4-6 | CLAUDE.md |
| `component-factory` | Mantener | sonnet-4-6 | Crear componentes |
| `release-manager` | **Crear** | sonnet-4-6 | Pre-merge gate |
| `incident-responder` | **Crear** | sonnet-4-6 | Producción |
| `architect` | **Eliminar** | — | Redundante con tdd-writer |
| `pm-writer` | **Eliminar** | — | Redundante con prd-writer |
| `ethical-hacker` | Mover a extra-pipeline | (default) | No producto |

**Total resultante:** 22 agentes activos en pipeline + 1 extra-pipeline + 3 nuevas skills (`pipeline-runner`, `pipeline-trace-linter`, `pipeline-flows`).

Reducción neta: **-2 agentes** del pipeline activo + clarificación del que sobra (`ethical-hacker`). Aunque suena modesto, **el efecto en cognitive load del usuario es alto**: pasa de 6 documentos pre-código a 4.

---

## 7. Puntos de entrada configurables del pipeline

El usuario quiere "ejecutá el pipeline desde X hasta Y según el tipo de trabajo". Aquí los flujos canónicos.

### 7.1 Convenciones

- **Entry point:** primer agente que se invoca.
- **Exit point:** último agente que produce output antes de devolver control al humano.
- **Salidas humanas (HSTOP):** puntos donde el flujo se pausa para aprobación humana — no son "agentes que se saltan", son gates obligatorios.

### 7.2 Flujo A — Estratégico full pipeline

> Para iniciativas nuevas con impacto comercial significativo (módulo nuevo, expansión a un servicio).

**Entry:** `senior-ceo-advisor` (sanity-check de negocio)
**Salida humana 1:** ¿la idea pasa el filtro de negocio?
**Encadena:** `process-analyst` → `process-optimizer` → `systems-analyst` → `senior-ceo-advisor` (segundo gate: ¿spec viable?) → `prd-writer` → `engineering-manager` (gate técnico) → `tdd-writer` → `adr-writer` (condicional) → `ux-designer` → `ui-designer`
**Salida humana 2:** ¿aprobamos para implementación?
**Continúa:** `django-developer` || `react-developer` → `test-writer` → `release-manager` → `aws-devops`
**Exit:** `aws-devops` (deploy)

**Cuándo usarlo:** "expansión al mercado de Bogotá", "nuevo servicio de fotografía corporativa", "módulo de inventario de togas v1".

### 7.3 Flujo B — Solo EM (desde definición técnica)

> Cuando ya hay claridad de proceso pero el equipo necesita formalizar la ingeniería.

**Entry:** `engineering-manager` (validación + sanity-check)
**Encadena:** `prd-writer` (si no hay PRD) → `tdd-writer` → `ux-designer` → `ui-designer`
**Salida humana:** ¿implementamos?
**Continúa:** `django-developer` || `react-developer` → `test-writer` → `release-manager`
**Exit:** `release-manager`

**Cuándo usarlo:** "ya sabemos qué queremos hacer, queremos arrancar la ingeniería bien". Caso típico cuando el spec funcional ya existe y solo falta diseño técnico.

### 7.4 Flujo C — Ticket existente (solo implementación)

> Hay un ticket con AC claros en Linear y un TDD ya escrito.

**Entry:** `/start-task` (skill existente)
**Encadena:** `django-developer` o `react-developer` (según ticket) → `test-writer` → `code-reviewer`
**Exit:** `/pr-create`

**Cuándo usarlo:** ticket de mantenimiento, mejora pequeña, refactor con AC claras.

### 7.5 Flujo D — Bug fix (rápido)

> Fallo en producción o regresión.

**Entry:** `incident-responder` (si producción) o directo a desarrollador (si dev/staging)
**Encadena:** `django-developer` o `react-developer` → `test-writer` (regresión obligatoria) → `code-reviewer`
**Exit:** `/pr-create`

**Cuándo usarlo:** bug confirmado, scope pequeño, sin diseño nuevo.

### 7.6 Flujo E — Lightweight (sin TDD)

> Cambio cosmético, label, validación adicional, sin nueva entidad ni endpoint.

**Entry:** desarrollador directamente (`react-developer` o `django-developer`)
**Encadena:** desarrollador → `code-reviewer` → opcional `test-writer`
**Exit:** `/pr-create`

**Cuándo usarlo:** texto, color, ajuste de validación, micro-mejora.

### 7.7 Flujo F — Auditoría / pre-deploy

> Antes de un deploy crítico o post-feature de seguridad.

**Entry:** `security-auditor`
**Encadena (paralelo o secuencial):** `code-reviewer` → `release-manager`
**Exit:** `aws-devops` (deploy con verde)

**Cuándo usarlo:** antes de release a producción que toca PII, pagos o auth.

### 7.8 Flujo G — Solo proceso (descubrir y rediseñar sin implementar)

> Cuando el objetivo es solo entender y mejorar un proceso operativo, no construir software inmediatamente.

**Entry:** `process-analyst`
**Encadena:** `process-optimizer` → `senior-ceo-advisor` (validación de viabilidad operativa)
**Exit:** `senior-ceo-advisor`

**Cuándo usarlo:** "quiero rediseñar cómo manejamos el cierre de caja en grado, sin construir software todavía".

### 7.9 Flujo H — Solo definición funcional (BA puro)

> Quiero el spec funcional sin avanzar a producto.

**Entry:** `systems-analyst` (asume to-be ya existe)
**Exit:** `systems-analyst` (entrega `hersa-especificaciones-funcionales.md`)

### 7.10 Flujo I — Solo diseño (UX + UI)

> Spec funcional ya aprobado; solo falta diseño antes de pasar a ingeniería.

**Entry:** `ux-designer`
**Encadena:** `ui-designer`
**Exit:** `ui-designer`

### 7.11 Resumen tabla de flujos

| Flujo | Entry | Exit | Tamaño típico |
|---|---|---|---|
| A — Estratégico full | `senior-ceo-advisor` | `aws-devops` | Iniciativa grande |
| B — Solo EM | `engineering-manager` | `release-manager` | Módulo medio |
| C — Ticket existente | `/start-task` | `/pr-create` | Ticket Linear |
| D — Bug fix | `incident-responder` o developer | `/pr-create` | Hotfix |
| E — Lightweight | developer | `/pr-create` | Cosmético |
| F — Pre-deploy | `security-auditor` | `aws-devops` | Release |
| G — Solo proceso | `process-analyst` | `senior-ceo-advisor` | Rediseño operativo |
| H — Solo BA | `systems-analyst` | `systems-analyst` | Definición funcional |
| I — Solo diseño | `ux-designer` | `ui-designer` | Diseño puro |

Estos 9 flujos cubren el 95% de los casos reales de Hersa. Deben formalizarse en una skill `pipeline-flows` que `pipeline-runner` consume.

---

## 8. Propuestas concretas para `component-factory` y `claude-md-architect`

### 8.1 Cambios en agentes existentes (delegar a `component-factory`)

| Agente | Acción | Cambio específico |
|---|---|---|
| `architect` | **Eliminar** | Borrar archivo `.claude/agents/architect.md` después de migrar capacidad a `tdd-writer` Phase 0 |
| `pm-writer` | **Eliminar** | Borrar archivo `.claude/agents/pm-writer.md` después de migrar MoSCoW a `prd-writer` |
| `tdd-writer` | **Modificar** | Añadir "Phase 0 — Architectural reasoning (skip if trivial)" al system prompt; mantener modelo `opus-4-7` |
| `prd-writer` | **Modificar** | Añadir sección obligatoria `## 0. MoSCoW priorities` al template del PRD; quitar precondición de "puede partir de pm-writer" |
| `senior-ceo-advisor` | **Modificar** | Reescribir `when_to_use` con 3 gates concretos (pre-discovery, post-spec, pre-deploy) |
| `engineering-manager` | **Modificar** | Añadir capacidad "pipeline sanity-check" en `when_to_use`; mantener output a `documentation/requirements/specs/em-diagnostico*.md` pero hacer el nombre dinámico |
| `ethical-hacker` | **Modificar metadata** | Añadir tag `extra-pipeline: true` en frontmatter para que `claude-md-architect` lo coloque en sección separada |
| Todos sin `model:` explícito | **Modificar** | Añadir `model: <claude-haiku-4-5-20251001 \| claude-sonnet-4-6 \| claude-opus-4-7-20251001>` según tabla 6.12 |

### 8.2 Skills a crear (delegar a `component-factory`)

| Skill | Tipo | Propósito |
|---|---|---|
| `pipeline-flows` | reference | Catálogo de los 9 flujos definidos en Sección 7. Sin lógica; documenta entry/exit/secuencia por flujo. |
| `pipeline-runner` | procedural | Lee un flujo de `pipeline-flows` + parámetros (start, end) y genera la secuencia de invocaciones a ejecutar. No invoca; emite plan declarativo. |
| `pipeline-trace-linter` | validator | Validador cross-document: spec → PRD → TDD coherentes. Reporte PASS/WARN/FAIL. |

### 8.3 Skills a actualizar

| Skill | Cambio |
|---|---|
| `pipeline-conventions/SKILL.md` | Quitar fila `pm-writer` de la tabla de "Output path"; agregar nota sobre que MoSCoW vive ahora en PRD §0 |
| `workflow.md` | Reescribir sección "0. Pick your flow first" para apuntar a los 9 flujos canónicos de `pipeline-flows`. Eliminar "Full pipeline" como flujo único; reemplazar por matriz Flujo A/B/C/D/E |
| `reuse-checker/SKILL.md` | Añadir reglas para los nuevos agentes (`release-manager`, `incident-responder`) y para skills de pipeline |

### 8.4 Nuevos agentes a crear (delegar a `component-factory`)

| Agente | Modelo | Tools | Justificación rápida |
|---|---|---|---|
| `release-manager` | sonnet-4-6 | Read, Grep, Glob, Bash | Pre-merge gate orquestando review + sec + docs |
| `incident-responder` | sonnet-4-6 | Read, Bash, Grep, Glob | Diagnóstico de incidentes en EB/RDS con propuesta de mitigación |

### 8.5 Cambios en CLAUDE.md (delegar a `claude-md-architect`)

#### Agent Registry
- **Quitar filas:** `architect`, `pm-writer`
- **Añadir filas:** `release-manager`, `incident-responder`
- **Modificar descripción:** `senior-ceo-advisor`, `engineering-manager`, `tdd-writer`, `prd-writer`
- **Reorganizar:** crear sub-tabla "Extra-pipeline agents" con `ethical-hacker`

#### Skill Registry
- **Añadir filas:** `pipeline-flows`, `pipeline-runner`, `pipeline-trace-linter`
- **Modificar descripción:** `workflow` (apuntar a `pipeline-flows`), `pipeline-conventions` (quitar pm-writer)

#### Knowledge Files
- **Añadir entrada:** `.claude/skills/pipeline-flows/SKILL.md` — "Read when starting any non-trivial work to pick the correct flow"

#### Workflows
- **Reemplazar bloque "Workflows" actual** por:

```
## Workflows

**To execute a configurable pipeline flow:**
> "Use pipeline-runner to execute Flow [A-I] from [start-agent] to [end-agent] for this feature."

**Available flows (see `.claude/skills/pipeline-flows/SKILL.md` for details):**
- A: Strategic full pipeline (idea → deploy)
- B: From technical definition (EM gate → release)
- C: Existing Linear ticket (start-task → PR)
- D: Bug fix (incident or dev → PR)
- E: Lightweight (dev → PR)
- F: Pre-deploy audit (security → deploy)
- G: Process redesign only (analyst → CEO advisor)
- H: Functional definition only (systems-analyst)
- I: Design only (UX → UI)

**To bootstrap a new project's CLAUDE.md:**
> "Use claude-md-architect to set up CLAUDE.md for this project."

**To create a new agent or skill:**
> "Use component-factory to scaffold a [skill|agent] that [capability]."

**To validate the pipeline trace from spec to TDD:**
> Run `pipeline-trace-linter` directly on the feature folder.
```

#### Conventions for Agents and Skills
- **Añadir punto:** "All agents MUST declare an explicit `model:` in frontmatter."
- **Añadir punto:** "Pipeline flows are documented in `pipeline-flows` skill; do not duplicate flow definitions in agent prompts."

### 8.6 Orden recomendado de ejecución

1. `claude-md-architect` (modo AUDIT) → identificar exactamente qué secciones tocar.
2. `component-factory` → crear skills `pipeline-flows`, `pipeline-runner`, `pipeline-trace-linter`.
3. `component-factory` → crear agentes `release-manager`, `incident-responder`.
4. `component-factory` → modificar `tdd-writer` (Phase 0), `prd-writer` (sección MoSCoW), `senior-ceo-advisor`, `engineering-manager`, `ethical-hacker` (tag), todos los agentes sin `model:`.
5. `component-factory` → eliminar `architect.md` y `pm-writer.md`.
6. `claude-md-architect` (modo MIGRATE) → aplicar todas las modificaciones a CLAUDE.md.
7. `claude-md-linter` → validar.
8. `component-linter` → validar cada componente nuevo y modificado.
9. Commit en una rama dedicada (`hrs-NN/pipeline-simplification`).

### 8.7 Riesgos del cambio

| Riesgo | Mitigación |
|---|---|
| Romper `workflow.md` mientras se actualiza | Hacer cambios en feature branch; correr `claude-md-linter` antes de merge |
| Eliminar `architect` antes de migrar capacidad | Validar primero que `tdd-writer` produce plan equivalente; si no, hacer rollback antes de borrar |
| Eliminar `pm-writer` cuando hay documentos generados existentes | Mantener `documentation/requirements/pm/` con docs históricos pero detener producción nueva |
| Nuevos agentes (`release-manager`, `incident-responder`) sin probar | Generar y testear con feature de bajo impacto antes de usarlos en temporada de graduación |

---

## Cierre — lectura del EM

**El equipo actual no es malo, está sobre-poblado.** Para una startup en growth-stage con un solo decisor humano, **24 agentes es ruido**. La estructura es sólida (pipeline-conventions, scope boundaries, blocking tags), pero el catálogo es excesivo para el volumen real de trabajo.

**Tres movimientos críticos, en este orden:**

1. **Eliminar `architect` y `pm-writer`.** Reducción inmediata de complejidad sin pérdida de capacidad.
2. **Crear `pipeline-flows` + `pipeline-runner`.** Esto convierte los flujos documentados en `workflow.md` en un sistema operable.
3. **Crear `incident-responder` antes de noviembre.** La temporada de graduación es la prueba de fuego anual. Sin este agente, una caída es 100% manual y costosa.

**Lo que NO toca cambiar ahora:**
- `pipeline-conventions` skill (es excelente)
- Disciplina de blocking tags (es lo que sostiene la calidad downstream)
- Separación `django-developer` / `react-developer` (paralelismo real funciona)
- `ux-designer` / `ui-designer` (división correcta y trazabilidad clara hasta `react-developer`)

**Métrica de éxito a 30 días:**
- Número de agentes activos del pipeline: 22 (-2)
- Tiempo desde idea a primer commit (feature media): debería bajar al menos 30% por reducción de documentos intermedios
- Cobertura de flujos canónicos: 9 flujos definidos y al menos 3 ejecutados al menos una vez

**Métrica de éxito a 90 días:**
- `incident-responder` validado en al menos un incidente real (idealmente staging)
- `release-manager` integrado en al menos 5 PR a main
- 0 features llegando a producción sin `pipeline-trace-linter` PASS
- Modelo declarado explícito en 100% de agentes

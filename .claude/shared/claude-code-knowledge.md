# Claude Code Knowledge Base

> Fuente: code.claude.com/docs (sección "Build with Claude Code")
> Última actualización: 2026-04-29T00:00:00
> Para actualizar features de plataforma (§1–8): invoca `/update-cc-knowledge`
> §9 (Best Practices de Diseño) es estable — no se sobreescribe al actualizar

---

## 1. CLAUDE.md y Memory

### 1.1 Dos sistemas complementarios

| Sistema | Quién escribe | Qué contiene | Cargado en |
|---|---|---|---|
| **CLAUDE.md** | Tú | Instrucciones y reglas | Cada sesión (completo) |
| **Auto memory** | Claude | Aprendizajes y patrones | Cada sesión (primeras 200 líneas / 25KB de MEMORY.md) |

### 1.2 Ubicaciones de CLAUDE.md (de mayor a menor prioridad)

| Scope | Ubicación | Compartido |
|---|---|---|
| **Managed policy** | macOS: `/Library/Application Support/ClaudeCode/CLAUDE.md` | Todos los usuarios del org |
| **Project** | `./CLAUDE.md` o `./.claude/CLAUDE.md` | Equipo (git) |
| **User** | `~/.claude/CLAUDE.md` | Solo tú (todos los proyectos) |
| **Local** | `./CLAUDE.local.md` (gitignored) | Solo tú (proyecto actual) |

Todos los archivos encontrados en el árbol de directorios se **concatenan** (no se sobreescriben).  
Los archivos en subdirectorios se cargan **bajo demanda** cuando Claude lee archivos en ese subdirectorio.

### 1.3 Reglas con `.claude/rules/`

Para proyectos grandes: archivos `.md` individuales por tema en `.claude/rules/`.

**Reglas globales** (sin `paths:`) — se cargan en cada sesión igual que `.claude/CLAUDE.md`.

**Reglas con path-scope** — solo se cargan cuando Claude trabaja con archivos que coinciden con el patrón:

```markdown
---
paths:
  - "src/api/**/*.ts"
---

# API Rules
- All endpoints must include input validation
- Use the standard error response format
```

Patrones soportados: `**/*.ts`, `src/**/*`, `*.md`, `src/components/*.tsx`

```markdown
---
paths:
  - "src/**/*.{ts,tsx}"
  - "lib/**/*.ts"
---
```

**Reglas del usuario** (`~/.claude/rules/`) — aplican a todos los proyectos del equipo.

### 1.4 Importar archivos adicionales

```markdown
See @README for project overview and @package.json for available npm commands.

# Additional Instructions
- git workflow @docs/git-instructions.md
```

- Rutas relativas al archivo que contiene el import.
- Máximo 5 niveles de profundidad.
- **IMPORTANTE:** los archivos importados se cargan en contexto en el inicio de la sesión — no ahorran tokens.

### 1.5 Auto memory

- Activado por defecto (Claude Code v2.1.59+).
- Almacenado en `~/.claude/projects/<project>/memory/`.
- `MEMORY.md` = índice (primeras 200 líneas / 25KB).
- Los topic files (`debugging.md`, `api-conventions.md`) se leen bajo demanda.
- Desactivar: `"autoMemoryEnabled": false` en settings.json o `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1`.
- Directorio personalizable: `"autoMemoryDirectory": "~/my-dir"`.

### 1.6 Behaviors notables

- `claudeMdExcludes` — excluir archivos CLAUDE.md específicos en monorepos:
  ```json
  { "claudeMdExcludes": ["**/other-team/CLAUDE.md"] }
  ```
- HTML block comments (`<!-- notes -->`) se **eliminan** del contexto (invisibles para Claude). Úsalos para notas de mantenedores humanos.
- AGENTS.md: Claude Code lee `CLAUDE.md`, no `AGENTS.md`. Si tienes ambos, importa desde `CLAUDE.md`:
  ```markdown
  @AGENTS.md
  ## Claude Code
  Use plan mode for changes under `src/billing/`.
  ```
- `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1` — carga CLAUDE.md de directorios añadidos con `--add-dir`.

### 1.7 Buenas prácticas

- Target: < 200 líneas por archivo CLAUDE.md.
- Instrucciones específicas y concretas: "Run `npm test`" > "Test your changes".
- Usar path-scoped rules en `.claude/rules/` para instrucciones que solo aplican a ciertas partes del proyecto.

---

## 2. Skills (Custom Slash Commands)

### 2.1 Estructura

```
.claude/skills/<skill-name>/
├── SKILL.md           # Entrypoint (requerido)
├── template.md        # Opcional: plantilla
├── examples/
│   └── sample.md
└── scripts/
    └── validate.sh
```

- `.claude/commands/<name>.md` también funciona (mecanismo idéntico; skills añaden características extra).
- `~/.claude/skills/` para skills personales (todos los proyectos).
- `~/.claude/commands/` para comandos personales single-file.

### 2.2 Frontmatter completo de SKILL.md

```yaml
---
name: my-skill                    # Display name (lowercase, hyphens, max 64 chars)
description: What it does         # Claude usa esto para auto-invocar. Máx 1536 chars
when_to_use: Additional context   # Cuándo invocar (se suma al description)
argument-hint: "[issue] [format]" # Hint en autocompletado
arguments: [issue, branch]        # Nombres para $N substitution
disable-model-invocation: true    # Solo invocación manual (false por defecto)
user-invocable: false             # Ocultar del menú / (true por defecto)
allowed-tools: Read Grep Bash(git *) # Herramientas pre-aprobadas mientras el skill está activo
model: sonnet                     # Override del modelo solo para este skill
effort: high                      # low/medium/high/xhigh/max
context: fork                     # Ejecutar en subagent aislado
agent: Explore                    # Tipo de subagent cuando context: fork
paths:                            # Glob patterns: solo carga cuando trabaja con estos archivos
  - "src/api/**/*.ts"
hooks:                            # Hooks scoped al lifecycle del skill
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/check.sh"
shell: bash                       # bash (default) o powershell
---

Instrucciones del skill aquí...
```

### 2.3 Substituciones disponibles

| Variable | Descripción |
|---|---|
| `$ARGUMENTS` | Todos los argumentos pasados al invocar |
| `$ARGUMENTS[N]` | Argumento por índice (base 0) |
| `$N` | Shorthand: `$0` = primer arg, `$1` = segundo |
| `$name` | Named arg declarado en `arguments:` frontmatter |
| `${CLAUDE_SESSION_ID}` | ID de la sesión actual |
| `${CLAUDE_EFFORT}` | Nivel de effort: low/medium/high/xhigh/max |
| `${CLAUDE_SKILL_DIR}` | Directorio del SKILL.md (útil para scripts bundled) |

### 2.4 Dynamic context injection (shell injection)

```yaml
---
name: pr-summary
allowed-tools: Bash(gh *)
---

## Pull request context
- PR diff: !`gh pr diff`
- PR comments: !`gh pr view --comments`

## Your task
Summarize this PR...
```

Bloque multi-línea:
````markdown
## Environment
```!
node --version
npm --version
git status --short
```
````

Esto es **preprocesado**: los comandos se ejecutan ANTES de que Claude vea el prompt. Claude solo ve el resultado.

### 2.5 Control de invocación

| Frontmatter | Tú puedes invocar | Claude puede invocar | En contexto |
|---|---|---|---|
| (default) | Sí | Sí | Descripción siempre; body cuando se invoca |
| `disable-model-invocation: true` | Sí | No | Descripción NO en contexto |
| `user-invocable: false` | No | Sí | Descripción siempre |

### 2.6 Ejecutar skill en subagent (`context: fork`)

```yaml
---
name: deep-research
context: fork
agent: Explore
---
Research $ARGUMENTS:
1. Find relevant files using Glob and Grep
2. Summarize findings with specific file references
```

### 2.7 Ubicaciones y alcance

| Ubicación | Alcance |
|---|---|
| `.claude/skills/<name>/` (proyecto) | Solo este proyecto; committeable |
| `~/.claude/skills/<name>/` (usuario) | Todos tus proyectos |
| Dentro de un plugin | Donde el plugin esté habilitado |
| Managed settings | Toda la organización |

---

## 3. Agents (Subagents)

### 3.1 Estructura del archivo

```
.claude/agents/<name>.md        # Proyecto (committeable)
~/.claude/agents/<name>.md      # Usuario (todos los proyectos)
```

### 3.2 Frontmatter completo

```yaml
---
name: code-reviewer              # REQUERIDO: lowercase + hyphens
description: Reviews code...     # REQUERIDO: cuándo delegar
tools: Read, Grep, Glob, Bash    # Allowlist de herramientas (hereda todo si se omite)
disallowedTools: Write, Edit     # Denylist (aplicado sobre la lista heredada)
model: sonnet                    # sonnet/opus/haiku/full-model-id/inherit
permissionMode: default          # default/acceptEdits/auto/dontAsk/bypassPermissions/plan
maxTurns: 10                     # Máximo de turnos agentic
skills:                          # Skills a precargar en el contexto del subagent (full content, no solo disponible)
  - api-conventions
  - error-handling-patterns
mcpServers:                      # MCP servers scoped a este subagent
  - playwright:                  # Inline definition
      type: stdio
      command: npx
      args: ["-y", "@playwright/mcp@latest"]
  - github                       # Reference a server ya configurado
hooks:                           # Hooks scoped al lifecycle de este subagent
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate.sh"
memory: project                  # user/project/local — persistent memory entre sesiones
background: false                # Siempre ejecutar en background (false por defecto)
effort: medium                   # low/medium/high/xhigh/max
isolation: worktree              # Copiar repo a git worktree temporal (aislado)
color: blue                      # red/blue/green/yellow/purple/orange/pink/cyan
initialPrompt: "Review recent changes"  # Auto-submit como primer turno cuando agent es session principal
---

You are a code reviewer. When invoked, analyze the code...
```

### 3.3 Frontmatter: campos requeridos vs opcionales

- **Requeridos:** `name`, `description`
- **Recomendado:** `model`, `tools`
- **Nuevo en 2025:** `skills`, `memory`, `isolation`, `background`, `color`, `initialPrompt`, `mcpServers` en agents

### 3.4 Built-in subagents

| Nombre | Uso |
|---|---|
| `Explore` | Read-only codebase exploration |
| `Plan` | Planning y análisis sin modificar |
| `general-purpose` | Default para tareas genéricas |

### 3.5 Precargar skills en subagents (campo `skills`)

```yaml
skills:
  - api-conventions
  - error-handling-patterns
```

- El contenido **completo** del skill se inyecta en el contexto del subagent al inicio.
- Los subagents NO heredan skills del parent — se deben listar explícitamente.
- No se pueden precargar skills con `disable-model-invocation: true`.

### 3.6 Persistent memory (`memory` field)

```yaml
memory: project  # project recomendado
```

| Scope | Ubicación | Cuándo usar |
|---|---|---|
| `user` | `~/.claude/agent-memory/<name>/` | Conocimiento cross-project |
| `project` | `.claude/agent-memory/<name>/` | Conocimiento del proyecto (committeable) |
| `local` | `.claude/agent-memory-local/<name>/` | Conocimiento del proyecto (no committeable) |

### 3.7 Isolation: git worktree

```yaml
isolation: worktree
```

El subagent trabaja en una copia aislada del repositorio. El worktree se limpia si no hay cambios.

### 3.8 Invocar subagents

```bash
# Natural language
"Use the code-reviewer subagent to review auth changes"

# @-mention garantizado
@"code-reviewer (agent)" look at the auth changes

# Session completa como subagent
claude --agent code-reviewer
```

### 3.9 Foregroud vs Background

- **Foreground**: bloquea, permission prompts se pasan al usuario.
- **Background**: concurrente, permissions se pre-aprueban antes de lanzar.
- `Ctrl+B` para poner en background un task en curso.

### 3.10 Restricción de subagents (`tools` field con `Agent()`)

```yaml
tools: Agent(worker, researcher), Read, Bash
```

Solo `worker` y `researcher` pueden ser spawned. Si se omite `Agent`, no puede spawn ninguno.

### 3.11 Deshabilitar subagents específicos

```json
{
  "permissions": {
    "deny": ["Agent(Explore)", "Agent(my-custom-agent)"]
  }
}
```

---

## 4. Agent Teams (experimental)

> Requiere: `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` en settings.json + Claude Code v2.1.32+

### 4.1 Cuándo usar Agent Teams vs Subagents

| Característica | Subagents | Agent Teams |
|---|---|---|
| Comunicación | Solo reportan al main agent | Teammates se comunican entre sí |
| Coordinación | Main agent gestiona todo | Task list compartida + auto-coordinación |
| Mejor para | Tareas enfocadas, resultados resumidos | Trabajo complejo que requiere debate y colaboración |
| Costo token | Menor | Mayor (contexto independiente por teammate) |

### 4.2 Habilitar

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

### 4.3 Arquitectura

- **Team lead**: sesión principal que crea el equipo y coordina
- **Teammates**: instancias Claude Code independientes
- **Task list**: lista compartida de trabajo
- **Mailbox**: mensajería entre agentes

Almacenamiento: `~/.claude/teams/{team-name}/config.json` y `~/.claude/tasks/{team-name}/`

### 4.4 Modos de display

- `in-process` (default): todos los teammates en la terminal principal; `Shift+Down` para ciclar
- `tmux`: cada teammate en su propio pane (requiere tmux o iTerm2)

```json
{ "teammateMode": "in-process" }
```

### 4.5 Hooks específicos de Agent Teams

| Hook | Matcher | Cuándo |
|---|---|---|
| `TeammateIdle` | — | Antes de que un teammate quede idle (exit 2 = sigue trabajando) |
| `TaskCreated` | — | Al crear una task (exit 2 = rollback) |
| `TaskCompleted` | — | Al completar una task (exit 2 = bloquea completion) |

### 4.6 Usar definiciones de subagents como teammates

```text
Spawn a teammate using the security-reviewer agent type to audit the auth module.
```

Los campos `skills` y `mcpServers` del subagent NO aplican cuando corre como teammate.

---

## 5. Hooks

### 5.1 Los 24+ eventos disponibles

**Session-level:**
- `SessionStart` — sesión empieza o se reanuda
- `Setup` — inicialización one-time (`--init-only`)
- `SessionEnd` — sesión termina

**Per-turn:**
- `UserPromptSubmit` — antes de que Claude procese el prompt
- `UserPromptExpansion` — cuando un slash command expande
- `Stop` — Claude termina de responder
- `StopFailure` — turno termina por error de API

**Agentic loop (por tool call):**
- `PreToolUse` — antes de ejecutar herramienta (puede bloquear)
- `PostToolUse` — después de éxito
- `PostToolUseFailure` — después de fallo
- `PostToolBatch` — después de lote de tool calls paralelas
- `PermissionRequest` — cuando aparece dialog de permiso
- `PermissionDenied` — cuando el clasificador auto-mode deniega

**Agent/Task:**
- `SubagentStart` / `SubagentStop`
- `TaskCreated` / `TaskCompleted`
- `TeammateIdle`

**File/Config:**
- `FileChanged` — archivo observado cambia en disco
- `CwdChanged` — directorio de trabajo cambia
- `ConfigChange` — archivo de configuración cambia
- `InstructionsLoaded` — CLAUDE.md o rules/*.md se cargan

**Context/Cleanup:**
- `PreCompact` / `PostCompact`
- `Notification` — cuando se envía notificación
- `Elicitation` / `ElicitationResult` — MCP server solicita input del usuario

**Worktree:**
- `WorktreeCreate` / `WorktreeRemove`

### 5.2 Tipos de handlers

```json
{
  "type": "command",   // Shell command con stdin/stdout JSON
  "type": "http",      // HTTP POST a URL
  "type": "mcp_tool",  // Llamar tool en servidor MCP conectado
  "type": "prompt",    // Prompt a Claude model (yes/no decision)
  "type": "agent"      // Spawn subagent para evaluar condición
}
```

### 5.3 Formato de configuración en settings.json

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/validate.sh",
            "if": "Bash(rm *)",
            "timeout": 600,
            "statusMessage": "Validating...",
            "async": false,
            "once": false
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "./.claude/hooks/lint.sh"
          }
        ]
      }
    ]
  }
}
```

### 5.4 Exit codes (command hooks)

| Exit code | Comportamiento |
|---|---|
| **0** | Éxito. Para `UserPromptSubmit`, `SessionStart`: stdout → contexto de Claude |
| **2** | **Error bloqueante**: ignora stdout, envía stderr a Claude, **bloquea la acción** |
| **Otro** | Error no bloqueante: primera línea de stderr → transcript; ejecución continúa |

> ⚠️ Exit 1 = error NO bloqueante (distinto de convención Unix). Usa exit **2** para enforcement.

### 5.5 Eventos que se pueden bloquear (exit 2)

`PreToolUse`, `PermissionRequest`, `UserPromptSubmit`, `UserPromptExpansion`, `Stop`, `SubagentStop`, `TeammateIdle`, `TaskCreated`, `TaskCompleted`, `ConfigChange`, `PreCompact`, `PostToolBatch`, `Elicitation`, `ElicitationResult`, `WorktreeCreate`

### 5.6 JSON output desde hooks

```json
{
  "continue": true,
  "stopReason": "Message to user",
  "suppressOutput": false,
  "systemMessage": "Warning to user",
  "decision": "block",
  "reason": "Why blocked",
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "additionalContext": "...",
    "permissionDecision": "allow|deny|ask|defer",
    "permissionDecisionReason": "...",
    "updatedInput": { }
  }
}
```

### 5.7 Variables de entorno en hooks

```bash
$CLAUDE_PROJECT_DIR              # Raíz del proyecto (usar comillas)
${CLAUDE_PLUGIN_ROOT}            # Directorio de instalación del plugin
${CLAUDE_PLUGIN_DATA}            # Datos persistentes del plugin
$CLAUDE_ENV_FILE                 # Para SessionStart/Setup/CwdChanged/FileChanged
```

**Persistir variables de entorno (SessionStart):**
```bash
#!/bin/bash
if [ -n "$CLAUDE_ENV_FILE" ]; then
  echo 'export NODE_ENV=production' >> "$CLAUDE_ENV_FILE"
fi
```

### 5.8 Hooks en skills y agents (frontmatter)

```yaml
---
name: my-agent
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate.sh"
  Stop:
    - hooks:
        - type: command
          command: "./scripts/cleanup.sh"
---
```

`Stop` hooks en frontmatter se convierten automáticamente en `SubagentStop` cuando el agente corre como subagent.

### 5.9 Matcher patterns

| Matcher | Evalúa contra |
|---|---|
| `"*"`, `""`, omitido | Match all |
| `"Bash\|Edit"` | Exact o `\|`-separated list |
| Otros caracteres | JavaScript regex |

Eventos especiales por matcher:
- `PreToolUse`, `PostToolUse`: tool name (`Bash`, `mcp__memory__.*`)
- `SessionStart`: source (`startup`, `resume`, `clear`, `compact`)
- `FileChanged`: literal filenames
- `SubagentStart/Stop`: agent type name

---

## 6. Settings y Permissions

### 6.1 Jerarquía de archivos (mayor a menor prioridad)

| Scope | Ubicación | Compartido |
|---|---|---|
| Managed | Sistema, plist/registry, o managed-settings.json | Org (IT) |
| CLI args | Flags de línea de comandos | — |
| Local project | `.claude/settings.local.json` | No |
| Project | `.claude/settings.json` | Sí (git) |
| User | `~/.claude/settings.json` | No |

Arrays se **mezclan** (merge + dedup) entre scopes.

### 6.2 Settings clave

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "model": "claude-sonnet-4-6",
  "permissions": {
    "allow": [
      "Bash(npm run lint)",
      "Bash(npm run test *)",
      "Read(~/.zshrc)"
    ],
    "deny": [
      "Bash(curl *)",
      "Read(./.env)",
      "Read(./.env.*)"
    ],
    "defaultMode": "default"
  },
  "env": {
    "NODE_ENV": "development"
  },
  "hooks": { },
  "autoMemoryEnabled": true,
  "agent": "code-reviewer"
}
```

### 6.3 Modos de permiso

| Modo | Descripción |
|---|---|
| `default` | Pide permiso en el primer uso de cada herramienta |
| `acceptEdits` | Auto-acepta file edits y comandos comunes de filesystem |
| `plan` | Solo lectura — Claude crea un plan que el usuario revisa |
| `auto` | Auto-aprueba con verificación de seguridad en background |
| `dontAsk` | Auto-deniega tools a menos que estén pre-aprobados |
| `bypassPermissions` | Saltea todos los prompts (solo para entornos aislados) |

### 6.4 Sintaxis de permission rules

```
Tool                    → match all uses
Tool(*)                 → equivalent to Tool
Bash(npm run build)     → exact command
Bash(npm run test *)    → prefix + wildcard
Bash(git * main)        → git <anything> main
Bash(* --version)       → any command + --version
Read(./.env)            → specific file
Read(/src/**/*.ts)      → relative to project root
Read(~/.zshrc)          → from home dir
Read(//absolute/path)   → absolute path
WebFetch(domain:example.com)
mcp__puppeteer          → all tools from puppeteer server
Agent(my-agent)         → subagent permission
Skill(commit)           → skill permission
```

> ⚠️ Una `deny` rule en cualquier nivel no puede ser overridden por ningún otro nivel.

---

## 7. Directorio `.claude/`

### 7.1 Estructura completa del proyecto

```
your-project/
├── CLAUDE.md                    # Instrucciones del proyecto (committeable)
├── CLAUDE.local.md              # Prefs personales (gitignored)
├── .mcp.json                    # MCP servers del equipo (committeable)
└── .claude/
    ├── CLAUDE.md                # Alt. ubicación para instrucciones del proyecto
    ├── rules/                   # Reglas por tema (committeable)
    │   ├── testing.md
    │   ├── api-design.md
    │   └── backend/
    │       └── django.md
    ├── settings.json            # Configuración del proyecto (committeable)
    ├── settings.local.json      # Config personal (gitignored)
    ├── agents/                  # Definiciones de subagents (committeable)
    │   └── my-agent.md
    ├── agent-memory/            # Memoria persistente de subagents (committeable)
    │   └── code-reviewer/
    │       └── MEMORY.md
    ├── agent-memory-local/      # Memoria local de subagents (gitignored)
    ├── skills/                  # Skills del proyecto (committeable)
    │   └── my-skill/
    │       └── SKILL.md
    ├── commands/                # Single-file commands (committeable)
    │   └── deploy.md
    └── output-styles/           # Estilos de output personalizados
        └── teaching.md
```

### 7.2 Estructura global (`~/.claude/`)

```
~/.claude/
├── CLAUDE.md                    # Preferencias personales (todos los proyectos)
├── settings.json                # Settings personales
├── .claude.json                 # App state, OAuth, toggles (NO editar directamente)
├── keybindings.json             # Keyboard shortcuts personalizados
├── rules/                       # Reglas personales (todos los proyectos)
├── skills/                      # Skills personales
├── commands/                    # Commands personales
├── agents/                      # Subagents personales
├── agent-memory/                # Memoria de subagents (user scope)
├── output-styles/               # Estilos de output
├── themes/                      # Temas de color
└── projects/                    # Auto-memory y transcripts
    └── <project>/
        ├── memory/
        │   ├── MEMORY.md
        │   └── debugging.md
        └── <session>.jsonl
```

### 7.3 Qué hacer vs qué archivo editar

| Quiero... | Editar |
|---|---|
| Dar contexto al proyecto | `CLAUDE.md` |
| Permitir/bloquear tool calls | `settings.json` `permissions` |
| Ejecutar script pre/post tool | `settings.json` `hooks` |
| Variables de entorno | `settings.json` `env` |
| Prefs personales sin comittear | `settings.local.json` |
| Prompt invocable con `/name` | `skills/<name>/SKILL.md` |
| Subagent especializado | `agents/*.md` |
| Conectar herramientas externas | `.mcp.json` |

---

## 8. MCP (Model Context Protocol)

### 8.1 Scopes de instalación

| Scope | Carga en | Compartido | Almacenado en |
|---|---|---|---|
| Local (default) | Proyecto actual | No | `~/.claude.json` |
| Project | Proyecto actual | Sí (git) | `.mcp.json` |
| User | Todos tus proyectos | No | `~/.claude.json` |

### 8.2 Formato `.mcp.json` (project scope)

```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": {
        "Authorization": "Bearer ${GITHUB_TOKEN}"
      }
    },
    "local-tool": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {
        "API_KEY": "${MY_API_KEY}"
      }
    }
  }
}
```

Soporta expansión de variables: `${VAR}` y `${VAR:-default}`.

### 8.3 Tipos de transporte

- `stdio` — proceso local
- `http` — servidor remoto HTTP
- `sse` — Server-Sent Events
- `ws` — WebSockets

### 8.4 Comandos CLI

```bash
claude mcp add --transport http stripe https://mcp.stripe.com
claude mcp add --transport http github --scope project https://api.githubcopilot.com/mcp/
claude mcp add --transport stdio db -- npx -y @bytebase/dbhub --dsn "postgresql://..."
claude mcp list
claude mcp get github
```

### 8.5 Tool Search (deferral)

Por defecto, las herramientas MCP se **difieren** (no cargan en contexto hasta necesitarse). Esto permite tener muchos servidores MCP sin impactar el contexto window.

Para cargar siempre (sin deferral):
```json
{
  "mcpServers": {
    "core-tools": {
      "type": "http",
      "url": "https://mcp.example.com/mcp",
      "alwaysLoad": true
    }
  }
}
```

### 8.6 MCP en subagents

```yaml
---
name: browser-tester
mcpServers:
  - playwright:         # Inline: scoped solo a este subagent
      type: stdio
      command: npx
      args: ["-y", "@playwright/mcp@latest"]
  - github              # Reference: reusa server ya configurado
---
```

Los inline servers se conectan cuando el subagent empieza y se desconectan cuando termina.

---

## 9. Best Practices de Diseño

> Esta sección contiene principios universales de diseño — no son features de la plataforma sino reglas derivadas de la experiencia. Son estables: no se sobreescriben al actualizar este archivo con nuevas features de Claude Code.

### 9.1 CLAUDE.md — Principios de diseño

- **Política, no procedimientos.** CLAUDE.md define reglas; los skills contienen pasos. Nunca embedir procedimientos completos.
- **Target ≤200 líneas** por archivo; si supera ~300, dividir en `.claude/rules/` con `paths:`.
- **Link, no inline.** Referenciar `@path/to/file` en vez de pegar el contenido.
- **Voz imperativa.** "Run `npm test`" no "You should run npm test".
- **Solo H2 headers** en CLAUDE.md; anidar con bullets, no con headers más profundos.
- **MUST / NEVER** para reglas duras; **PREFER** para preferencias.
- **Orden fijo de secciones:** Project → Stack → Commands → Conventions → Structure → Agent Registry → Skill Registry → Pitfalls.
- **Auditar trimestral** — eliminar entradas obsoletas agresivamente.
- Los HTML comments `<!-- ... -->` son invisibles para Claude. Úsalos solo para notas de mantenedores humanos.

### 9.2 Principios de diseño de agentes

- **Un agente, una responsabilidad.** Si la descripción necesita "and", dividir.
- **Declarar `when_to_use` Y `when_not_to_use`** — ambos son obligatorios.
- **Least privilege** — declarar el mínimo `tools` necesario; justificar cada tool inline si son >5.
- **`model:` es obligatorio** — declarar siempre explícitamente; nunca depender del default de sesión.
- **Grep-first** — los prompts del agente deben instruir `grep`/`glob` para descubrir antes de leer archivos completos.
- **Ediciones quirúrgicas** — preferir `Edit` sobre `Write` para modificaciones.
- **Pasar rutas de artefactos entre agentes**, nunca contenido inline >50 líneas.
- **Stateless por defecto** — persistir trabajo intermedio a archivos, no a memoria de conversación.
- **Persona de senior engineer** — encuadrar el agente como experto de dominio produce output más conciso y correcto.

### 9.3 Principios de diseño de skills

- **Stateless e idempotente** — mismas entradas producen mismas salidas.
- **Propósito único** — una transformación o workflow por skill.
- **SKILL.md ≤500 líneas** — mover ejemplos a `examples/`; docs profundas a `references/`.
- **Inputs aceptan rutas o IDs**, no contenidos de archivo; outputs retornan rutas + resumen breve.
- **`paths:` field** — limitar la carga del skill a los tipos de archivo relevantes (ej: skills de UI solo con `.tsx`).
- **`context: fork`** — usar para skills de exploración/review que no deben contaminar el contexto principal.
- **`allowed-tools:`** — declarar explícitamente para reducir permission prompts.
- Sin llamadas skill-a-skill — el agente orquestador compone.

### 9.4 Anti-patterns

| Anti-pattern | Problema |
|---|---|
| Kitchen-sink CLAUDE.md | Volcado de documentación en vez de política — gasta tokens en cada sesión |
| God agent | Un agente que "hace todo" — no testeable, no enfocable |
| Skill sprawl | Muchos skills solapados con triggers vagos — confunde la auto-invocación |
| Triggers implícitos | Componentes sin `when_to_use`/`when_not_to_use` — activación impredecible |
| Context smuggling | Pasar blobs grandes entre agentes en vez de rutas de artefactos |
| Tool over-grant | Dar herramientas a agentes "por si acaso" — viola least privilege |
| Abstracción prematura | Crear agents/skills antes de validar el workflow manualmente ≥3 veces |
| Prompt-in-prompt | Embebir contenido completo de un skill dentro de CLAUDE.md |
| Skill-as-shell-alias | Envolver un solo comando CLI en un skill sin lógica adicional |
| Full model IDs | `claude-sonnet-4-6` en vez de `sonnet` — se vuelve obsoleto en cada actualización de modelo |

### 9.5 Convenciones de naming

- **Agents:** `kebab-case` verbo-sustantivo → `review-pr`, `migrate-schema`, `triage-bug`
- **Skills:** `kebab-case` sustantivo → `api-contract`, `release-notes`, `security-checklist`
- Los nombres deben ser inequívocos por sí solos; evitar abreviaciones.
- Domain-prefix cuando hay colisiones posibles: `frontend-lint`, `backend-lint`.

### 9.6 Promotion ladder

```
Inline prompt
     │  (mismo patrón usado ≥3 veces)
     ▼
Skill
     │  (orquestación recurrente sobre múltiples skills)
     ▼
Agent
     │  (múltiples agentes necesitan coordinación compartida)
     ▼
Orchestrator Agent + sub-specialists
```

Cada promoción debe justificarse por **necesidad repetida demostrada**, nunca por especulación.

### 9.7 Decisiones create vs reuse / split vs merge

**Create-vs-reuse:**

| Situación | Acción |
|---|---|
| Skill/agente existente cubre ≥80% de la necesidad | **Extender** |
| Trigger distinto, output distinto, o dominio distinto | **Crear nuevo** |
| Tarea de una sola vez | **Inline prompt — no crear componente** |
| Mismo patrón usado ≥3 veces | **Promover a skill o agente** |
| Envuelve un solo CLI call sin lógica adicional | **No crear — usar CLI directamente** |

**Split vs merge de agentes:**

- **Split cuando:** context >30% de la ventana, toolsets distintos, criterios de fallo separados.
- **Merge cuando:** siempre se invocan juntos, comparten >70% de context, overhead del handoff supera el trabajo.
- **Nunca** dividir por archivo o módulo — dividir por *capacidad*, no por *ubicación*.

### 9.8 Token budgets

| Componente | WARN | FAIL |
|---|---|---|
| `CLAUDE.md` raíz | >200 líneas | >300 líneas |
| `CLAUDE.md` subdirectorio | >150 líneas | >200 líneas |
| `SKILL.md` | >400 líneas | >500 líneas |
| Body del system prompt de un agente | >150 líneas | >200 líneas |
| Campo `description:` (agent/skill) | >1024 chars | — |

---

## 10. Referencia de URLs

| Tema | URL |
|---|---|
| CLAUDE.md & Memory | https://code.claude.com/docs/en/memory.md |
| Skills | https://code.claude.com/docs/en/skills.md |
| Subagents | https://code.claude.com/docs/en/sub-agents.md |
| Agent Teams | https://code.claude.com/docs/en/agent-teams.md |
| Hooks Guide | https://code.claude.com/docs/en/hooks-guide.md |
| Hooks Reference | https://code.claude.com/docs/en/hooks.md |
| Settings | https://code.claude.com/docs/en/settings.md |
| Permissions | https://code.claude.com/docs/en/permissions.md |
| .claude Directory | https://code.claude.com/docs/en/claude-directory.md |
| MCP | https://code.claude.com/docs/en/mcp.md |
| Plugins | https://code.claude.com/docs/en/plugins.md |
| Agent SDK Overview | https://code.claude.com/docs/en/agent-sdk/overview.md |
| Commands Reference | https://code.claude.com/docs/en/commands.md |
| Índice completo | https://code.claude.com/docs/llms.txt |

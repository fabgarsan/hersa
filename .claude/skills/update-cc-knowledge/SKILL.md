---
name: update-cc-knowledge
description: Actualiza la base de conocimiento de Claude Code (.claude/shared/claude-code-knowledge.md) leyendo la documentación oficial actualizada en code.claude.com/docs. Invocar cuando se sospecha que hay nuevas features o cambios en la API de Claude Code.
when_to_use: Cuando Anthropic lanza nuevas features de Claude Code, cuando se detectan gaps entre el knowledge base y la documentación oficial, o cuando se quiere verificar que la configuración del proyecto usa las últimas capacidades disponibles.
when_not_to_use: Para actualizar best practices de diseño (§9) — esa sección es estable y se mantiene manualmente. Para cambios en agentes o skills específicos del proyecto (usar component-factory).
model: sonnet
version: 1.0.0
disable-model-invocation: true
allowed-tools: WebFetch Read Write Edit
---

# Update Claude Code Knowledge Base

Actualiza `.claude/shared/claude-code-knowledge.md` con la información más reciente de la documentación oficial.

## Estructura del archivo

El knowledge base tiene dos tipos de contenido con reglas de actualización distintas:

- **§1–8** (Features de plataforma): Actualizar con cada ejecución — vienen de docs.claude.com
- **§9** (Best Practices de Diseño): **NUNCA sobreescribir** — son principios estables, no vienen de los docs de Anthropic
- **§10** (URLs de referencia): Actualizar si cambian las URLs

## Tarea

1. **Lee el índice** completo de páginas disponibles:
   - Fetch: `https://code.claude.com/docs/llms.txt`

2. **Lee estas páginas en paralelo** (las más críticas para component-factory y claude-md-architect):
   - `https://code.claude.com/docs/en/memory.md` — CLAUDE.md y auto-memory
   - `https://code.claude.com/docs/en/skills.md` — Skills / custom commands
   - `https://code.claude.com/docs/en/sub-agents.md` — Subagents
   - `https://code.claude.com/docs/en/agent-teams.md` — Agent Teams
   - `https://code.claude.com/docs/en/hooks.md` — Hooks reference completo
   - `https://code.claude.com/docs/en/settings.md` — Settings
   - `https://code.claude.com/docs/en/permissions.md` — Permissions
   - `https://code.claude.com/docs/en/claude-directory.md` — Directorio .claude/
   - `https://code.claude.com/docs/en/best-practices.md` — Best practices oficiales de Anthropic (comparar con nuestra sección §9)

3. **Revisa si hay otras páginas críticas** no listadas arriba (busca en el índice temas como MCP, plugins, agent SDK, output styles) y agrégalas a la lectura si tienen contenido relevante.

4. **Lee el archivo actual:**
   - `.claude/shared/claude-code-knowledge.md`

5. **Identifica cambios** entre la documentación actual y las secciones §1–8 del archivo:
   - Nuevos campos de frontmatter en agents o skills
   - Nuevos hook events o cambios en exit codes
   - Nuevos settings keys o modos de permiso
   - Cambios en behavior de features existentes
   - Features completamente nuevas no cubiertas

6. **Actualiza el archivo** `.claude/shared/claude-code-knowledge.md`:
   - Actualiza solo las secciones §1–8 afectadas usando `Edit` (no reescrituras completas a menos que sean necesarias)
   - **NO modificar §9** (Best Practices de Diseño) bajo ninguna circunstancia
   - Actualiza la fecha y hora en el header: `> Última actualización: YYYY-MM-DDTHH:MM:SS` (usar datetime local con segundos en formato ISO 8601)
   - Añade nuevas secciones numeradas antes de §9 si hay temas importantes no cubiertos (renumerar §9 y §10 en consecuencia)

7. **Reporta los cambios:**
   ```
   ACTUALIZADO: .claude/shared/claude-code-knowledge.md

   Cambios encontrados:
   - [sección]: [descripción del cambio]
   - ...

   Sin cambios: [secciones sin cambios relevantes]

   Fecha y hora: YYYY-MM-DDTHH:MM:SS
   ```

## Criterios para "cambio relevante"

- Nuevos campos de frontmatter en agents/skills
- Cambios en behavior de hooks o exit codes
- Nuevos tipos de hook events
- Cambios en la jerarquía de settings
- Nuevas capacidades de agent teams o subagents
- Cambios en sintaxis de permission rules
- Nuevas variables de substitución en skills
- Nuevos model aliases o cambios en el sistema de modelos
- Nuevas features de Claude Code no incluidas en el knowledge base

## Notas

- Solo actualiza secciones con cambios reales — no reformatees sin motivo
- Si una feature es experimental y puede cambiar, márcala con `> **Experimental:**`
- Mantén los ejemplos de código concretos y copiables
- Los model aliases (`sonnet`, `haiku`, `opus`) son siempre preferibles a IDs completos — actualizar §9.4 si esto cambia

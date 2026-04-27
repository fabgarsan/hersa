# {{TITULO_PROCESO}} — Guía para Validación Gerencial

<!--
╔══════════════════════════════════════════════════════════════════╗
║  TEMPLATE BLOQUEADO — communications-writer                      ║
║  Estructura: secciones fijas. NO eliminar ni reordenar secciones.║
║  Solo actualizar contenido dentro de cada sección.               ║
╚══════════════════════════════════════════════════════════════════╝

VARIABLES A REEMPLAZAR:
  {{TITULO_PROCESO}}       Nombre del proceso
  {{VERSION}}              Número de versión
  {{FECHA}}                Mes y año
  {{PROPOSITO}}            Propósito específico de este documento
  {{UNIDAD_CENTRAL}}       Entidad central del proceso (ej. "Promoción")
  {{DEFINICION_UNIDAD}}    Definición y ejemplo de la unidad central
  {{RAZON_IMPORTANCIA}}    Por qué la unidad central importa operativamente
  {{ETAPAS}}               Bloque de etapas (usar sub-template de etapa abajo)
  {{REGLAS_NEGOCIO}}       Filas de la tabla de reglas (usar sub-template abajo)
  {{ROLES_TABLA}}          Filas de la tabla de roles
  {{PREGUNTAS_ABIERTAS}}   Lista numerada de preguntas para la reunión
  {{PROXIMOS_PASOS}}       Filas de la tabla de próximos pasos

SUB-TEMPLATE DE ETAPA (repetir por cada etapa):
  ### Etapa N — Nombre
  **¿Qué ocurre?** [descripción]
  **¿Quién participa?** [roles separados por · ]
  **Resultado esperado:** [bullet list]
  **Reglas críticas a validar:** (solo si aplica)
  - [regla]

SUB-TEMPLATE DE FILA EN TABLA DE REGLAS:
  | N | [enunciado de la regla] | ☐ Confirmada ☐ Ajustar |
  (Nunca cambiar la última columna — siempre mantener las dos casillas)

INSTRUCCIÓN PARA communications-writer:
  - Siempre incluir la tabla de reglas con casillas ☐.
  - Siempre incluir la sección de Preguntas Abiertas.
  - Siempre incluir la tabla de Próximos Pasos con [DATO PENDIENTE] en fechas.
  - Nunca eliminar la nota de pie de página final.
  - Mantener el tono: profesional, directo, sin tecnicismos de sistema.
-->

> **Audiencia:** Gerentes y directivos de {{TITULO_PROCESO}}
> **Propósito:** {{PROPOSITO}}
> **Versión:** {{VERSION}} — {{FECHA}}
> **Estado:** 🔴 Pendiente aprobación gerencial

---

## ¿Por qué existe este documento?

{{PROPOSITO_EXTENDIDO}}

Los gerentes pueden usar este documento para:

1. Validar que el proceso descrito refleja la realidad operativa actual.
2. Identificar pasos que generan fricción o riesgo.
3. Confirmar las reglas de negocio críticas antes de su implementación en el sistema.

---

## La unidad central de operación: {{UNIDAD_CENTRAL}}

{{DEFINICION_UNIDAD}}

**¿Por qué importa esto?** {{RAZON_IMPORTANCIA}}

---

## Las etapas del proceso

{{ETAPAS}}

---

## Reglas de negocio que requieren validación explícita

La siguiente tabla resume las reglas con mayor impacto operativo. Por favor confirmar que cada una refleja la política actual:

| # | Regla | Estado |
|---|-------|--------|
{{REGLAS_NEGOCIO}}

---

## Roles y responsabilidades — resumen

| Rol | Interno / Externo | Responsabilidad principal |
|-----|-------------------|--------------------------|
{{ROLES_TABLA}}

---

## Preguntas abiertas para la reunión de validación

{{PREGUNTAS_ABIERTAS}}

---

## Próximos pasos sugeridos

| Paso | Responsable | Fecha sugerida |
|------|-------------|----------------|
{{PROXIMOS_PASOS}}

---

*Documento generado por el equipo de Hersa a partir del proceso operativo documentado internamente. Para preguntas sobre el contenido, contactar al equipo de operaciones.*

# Hersa — Proceso Operativo: Guía para Validación Gerencial

> **Audiencia:** Gerentes y directivos de Hersa  
> **Propósito:** Describir el proceso operativo actual para su revisión y validación  
> **Versión:** 1.0 — Abril 2026  
> **Estado:** 🔴 Pendiente aprobación gerencial

---

## ¿Por qué existe este documento?

Hersa opera un proceso complejo que involucra más de 15 roles, múltiples eventos por Promoción, y cientos de estudiantes por temporada. Este documento describe cómo funciona ese proceso **tal como opera hoy**, para que los gerentes puedan:

1. Validar que el proceso descrito refleja la realidad operativa
2. Identificar pasos que generan fricción o riesgo
3. Confirmar las reglas de negocio críticas antes de que el equipo técnico las implemente en el sistema

---

## La unidad central de operación: la Promoción

Todo en Hersa gira alrededor de la **Promoción** — no del colegio. Una Promoción es la combinación de:

> **Institución + Grado + Jornada + Año**  
> *Ejemplo: "Colegio La Presentación · Grado 11 · Jornada Diurna · 2026"*

Un mismo colegio puede tener varias Promociones activas al mismo tiempo (distintos grados o jornadas), cada una con su propio paquete negociado, sus propias fechas, y sus propios precios.

**¿Por qué importa esto?** Porque todos los cobros, asignaciones de personal, entregas de paquetes y registros de eventos están atados a la Promoción, no al colegio en general. Operar a nivel de colegio generaría confusión entre grupos distintos.

---

## Las 7 etapas del proceso

### Etapa 0 — Agendamiento

**¿Qué ocurre?** El comercial identifica un colegio prospecto y establece el primer contacto — por teléfono o visita presencial — para proponer una reunión con el rector o director.

**¿Quién participa?** Comercial · Rector / Director del colegio.

**Resultado esperado:** Fecha de reunión agendada. El sistema registra la visita.

---

### Etapa 1 — Vinculación de la Promoción

**¿Qué ocurre?** El comercial se reúne con representantes de padres y delegados estudiantiles en el colegio. Se negocia el paquete completo: ítems incluidos, precio por estudiante, cantidad de invitaciones por graduando, y fechas tentativas de los eventos.

**¿Quién participa?** Comercial · Representante de padres · Delegado estudiantil.

**Resultado esperado:**
- Contrato firmado entre padres/acudientes y Hersa *(la institución no firma, los padres sí)*
- Paquete negociado "congelado" en el sistema como un snapshot exclusivo de esta Promoción
- Fechas registradas en el sistema (el sistema auto-notifica cambios de fecha a todos los contactos — el comercial ya no gestiona WhatsApp manualmente)
- Grupo de WhatsApp creado con padres y delegados estudiantiles

**Etapa 1b — Cena de Profesores (opcional):** Si el paquete lo incluye, Hersa organiza una cena de docentes en la Casa Campestre. No tiene costo adicional para la institución. Se requiere asignar meseros y catering externo al menos 48 horas antes.

---

### Etapa 2 — Reunión con Estudiantes

**¿Qué ocurre?** El comercial visita el colegio y se reúne con la totalidad de los graduandos. Se registra el número de estudiantes por grupo (ej. 11A = 35 estudiantes). El comercial entrega a los delegados un enlace o código QR de auto-registro para que los estudiantes completen sus datos de forma autónoma.

**¿Quién participa?** Comercial · Estudiantes · Delegados estudiantiles.

**Resultado esperado:** Conteo de estudiantes por grupo registrado. Enlace de auto-registro distribuido. Estudiantes se unen al grupo de WhatsApp.

---

### Etapa 3 — Toma Fotográfica

**¿Qué ocurre?** La sesión fotográfica se organiza por grupo. En el mismo día, el cajero abre la sesión de cobro y procesa los pagos de los estudiantes en tiempo real. El sistema autoriza el acceso a la foto una vez el estudiante cumple el mínimo de pago.

**¿Quién participa?** Cajero · Fotógrafo · Vestidor · Estudiantes.

**Reglas críticas a validar:**
- Pago mínimo: **50% del valor del paquete en efectivo**. Si el cajero recibe menos del 50%, debe registrar una justificación escrita obligatoria.
- El fotógrafo consulta el estado del estudiante directamente en el sistema — no se requiere recibo impreso.
- El vestidor mide y registra la talla de toga en el sistema. Esa talla queda vinculada al estudiante y se verifica el día del grado *(no se permiten cambios de talla sin proceso*)
- El retoque fotográfico puede comenzar en paralelo durante el día — no hay que esperar al cierre.
- Al cerrar la sesión, el sistema genera automáticamente el reporte de cierre (total recaudado, pagos por estudiante, saldos pendientes, excepciones con justificación).
- El sistema envía recibo automático por email / SMS al estudiante y al padre.

**Estudiantes ausentes:** Se aplica un descuento de $10.000 COP. El sistema los marca para agendar en la Toma Varios.

---

### Etapa 4 — Actividad Prom

**¿Qué ocurre?** Día de ensayo de graduación. Los estudiantes pagan el saldo pendiente y reciben sus tarjetas de invitación (códigos QR individuales de un solo uso). Se celebra la actividad Prom con comida y bebidas provistas por un contratista de catering.

**¿Quién participa?** Cajero · Coordinador de Grado · Catering externo · Meseros · Estudiantes.

**Reglas críticas a validar:**
- Cada estudiante recibe exactamente el número de invitaciones negociado en el contrato.
- Los meseros y el proveedor de catering deben asignarse en el sistema **al menos 48 horas antes**.
- Si un estudiante ausente necesita que un compañero recoja sus tarjetas: se requiere carta de autorización + copia del documento.
- El sistema genera reporte de cierre automático al cerrar la sesión de cobro.

---

### Etapa 5 — Toma Fotografía Varios *(cuando aplica)*

**¿Qué ocurre?** Sesión fotográfica complementaria, cross-institucional (varios colegios al mismo tiempo). Se publica la fecha con anticipación a todas las instituciones activas.

**Tres casos de uso:**
1. El estudiante quiere fotos adicionales sobre las originales.
2. Retoma por inconformidad (casos especiales autorizados).
3. Estudiante ausente en la Etapa 3 y en la Etapa 4 — última oportunidad antes del grado.

---

### Etapa 6 — Día de Grado

**¿Qué ocurre?** La ceremonia de graduación. Hersa coordina la recepción, verificación de pagos, entrega de paquetes, y el acceso de las familias.

**¿Quién participa?** Coordinador de Grado · Cajero · Personal de Bodega · Jefe de Logística · Familia · Maestro de Ceremonias · Grupo Musical (si aplica).

**Secuencia del día:**
1. **≥24 horas antes:** El sistema auto-notifica a estudiantes y padres con saldos pendientes, indicando el monto y el plazo.
2. **Bodega:** Prepara materiales (togas por talla, birretes, estolas, menaje del salón) para cada evento del día.
3. **Recepción:** El equipo Hersa recibe a los graduandos. Se verifica la talla de toga (vinculada desde la Etapa 3).
4. **Cobro:** El cajero valida el saldo en tiempo real. Si hay saldo > 0, se cobra antes de entregar el paquete. *Sin excepciones.*
5. **Entrega:** El coordinador entrega el paquete. El sistema registra la entrega con timestamp inmutable.
6. **Ingreso de familias:** Cada familiar ingresa con su QR de invitación (único, de un solo uso). Sin QR, no hay ingreso. Menores de 5 años no ingresan; menores de 5 años en adelante requieren su propio QR.
7. **Ceremonia:** Inicia puntualmente a la hora impresa en las invitaciones.

**Caso especial — estudiante que no se gradúa:**
- Todos sus QR de invitación son cancelados e invalidados de inmediato.
- Se genera un reembolso del **50% del valor del paquete**.
- El estudiante (o representante con carta de autorización + documentos) puede recoger el paquete y recibir el reintegro ese mismo día.

**Escalaciones:** El Gerente puede registrar incidentes con timestamp y motivo. Esos registros quedan en el historial de la institución y se usan en futuras negociaciones de contrato.

---

## Reglas de negocio que requieren validación explícita

La siguiente tabla resume las reglas con mayor impacto operativo. Por favor confirmar que cada una refleja la política actual de Hersa:

| # | Regla | Estado |
|---|-------|--------|
| 1 | El pago mínimo en toma fotográfica es **50% en efectivo**. El cajero puede aceptar menos con justificación escrita. | ☐ Confirmada ☐ Ajustar |
| 2 | Solo el **Gerente** puede autorizar descuentos. El cajero no puede crear ni modificar descuentos. | ☐ Confirmada ☐ Ajustar |
| 3 | La entrega del paquete el día de grado requiere **saldo = 0**. Sin excepciones. | ☐ Confirmada ☐ Ajustar |
| 4 | Si el estudiante no se gradúa: **reembolso del 50%** e invalidación inmediata de todos sus QR. | ☐ Confirmada ☐ Ajustar |
| 5 | La talla de toga asignada en la toma fotográfica queda **vinculada permanentemente** al estudiante. | ☐ Confirmada ☐ Ajustar |
| 6 | El personal de eventos debe estar asignado en el sistema **≥48 horas antes** del evento. | ☐ Confirmada ☐ Ajustar |
| 7 | El Gerente tiene **48 horas hábiles** para cerrar una queja (inconformidad). A las 36h el sistema alerta. | ☐ Confirmada ☐ Ajustar |
| 8 | El sistema auto-envía notificaciones de cambio de fecha a todos los contactos de la Promoción. El comercial no gestiona WhatsApp manualmente. | ☐ Confirmada ☐ Ajustar |
| 9 | Cada QR de invitación es de **un solo uso**. Una vez escaneado, queda invalidado. | ☐ Confirmada ☐ Ajustar |
| 10 | La Prom es exclusiva para graduandos. Las familias **no asisten a la Prom**. | ☐ Confirmada ☐ Ajustar |

---

## Roles y responsabilidades — resumen

| Rol | Interno / Externo | Responsabilidad principal |
|-----|-------------------|--------------------------|
| Gerente | Interno permanente (1) | Aprueba descuentos · Cierra quejas · Autoriza excepciones |
| Administrador | Interno permanente (2) | Configuración del sistema · Gestión de usuarios y catálogos |
| Comercial | Interno permanente (3) | Prospección · Vinculación · Negociación de paquetes |
| Cajero / Planillador | Interno variable | Abre y cierra sesiones · Registra pagos · Emite recibos |
| Fotógrafo | Interno o externo | Sesión fotográfica · Retoque |
| Vestidor | Interno o externo temporal | Medición y asignación de talla de toga |
| Coordinador de Grado | Interno variable | Operación del día de grado: recepción · cobro · entrega |
| Jefe de Logística | Interno permanente (1) | Asignación de personal a eventos · Coordinación logística |
| Personal de Bodega | Interno variable | Preparación de materiales para cada evento |
| Conductor | Externo por contrato | Transporte de graduandos (toma fotográfica · Prom) |
| Maestro de Ceremonias | Externo por evento | Protocolo y conducción de la ceremonia |
| Catering | Externo por evento | Alimentación en Cena de Profesores y Prom |
| Meseros | Externo temporal por evento | Servicio de mesa en eventos |

---

## Preguntas abiertas para la reunión de validación

1. ¿El reembolso del 50% para estudiantes que no se gradúan aplica sin excepciones, o hay condiciones adicionales?
2. ¿La Toma Varios siempre se realiza, o solo cuando hay estudiantes ausentes?
3. ¿Existe un límite de tiempo para reclamar el paquete si el estudiante no asiste al día de grado?
4. ¿Las escalaciones del día de grado afectan automáticamente el contrato de la próxima negociación con ese colegio, o es un proceso manual?
5. ¿Hay algún proceso de seguimiento postventa (satisfacción del colegio, renovación para el próximo año)?

---

## Próximos pasos sugeridos

| Paso | Responsable | Fecha sugerida |
|------|-------------|----------------|
| Revisión y validación de este documento | Gerentes de Hersa | [DATO PENDIENTE] |
| Confirmación de reglas de negocio (tabla anterior) | Gerente General | [DATO PENDIENTE] |
| Sesión de preguntas abiertas | Gerentes + Equipo técnico | [DATO PENDIENTE] |
| Inicio de implementación en sistema | Equipo de desarrollo | Post-validación |

---

*Documento generado por el equipo de Hersa a partir del proceso operativo documentado internamente. Para preguntas sobre el contenido, contactar al equipo de operaciones.*

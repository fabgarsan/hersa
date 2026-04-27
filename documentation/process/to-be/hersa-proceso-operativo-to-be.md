# Hersa — Proceso Operativo To-Be (Lean-Optimizado)

**Version:** 2.0
**Fecha de elaboracion:** 2026-04-27
**Basado en:** `documentation/process/as-is/hersa-proceso-operativo-as-is.md` v1.3
**Marco de mejora:** Lean — Eliminacion de Muda, reduccion de cuellos de botella, paralelizacion segura, reduccion de friccion
**Estado:** To-be — propuesta de proceso optimizado. No contiene recomendaciones de tecnologia especifica.

**Cambios respecto a v1.0:**
- Unidad operativa actualizada de "Institucion" a "Promocion" en todo el documento.
- Actores ampliados: Conductor, Maestro de Ceremonia, Grupo Musical, Alimentos, Bodega, Secretaria, Vestidor, Jefe de Logistica.
- Nuevo sub-proceso: Gestion de Personal Externo Temporal.
- Nuevo sub-proceso: Catalogo de Items y Paquetes.
- Nuevo sub-proceso transversal: Asignacion Bulk de Personal.
- Nuevo sub-proceso transversal: Notificacion de Cambios a Colaboradores.
- Nuevo sub-proceso transversal: Calendario de Eventos para Colaboradores.
- Nueva Etapa 1b: Cena de Profesores.
- Pago minimo flexible: puede ser menor al 50% con justificacion escrita obligatoria del cajero.
- Actividad Prom ahora incluye servicio de alimentos y bebidas (proveedor externo "Alimentos").
- Puntos de decision y reglas de negocio actualizados para cubrir nuevo alcance.

---

## 1. Diagnostico — 5 Problemas Criticos (Ordenados por Impacto Estimado)

### P1 — Cuello de botella estructural en el Gerente (impacto: alto, transversal)

El gerente es el unico actor autorizado para: autorizar descuentos, resolver discrepancias de pago, cerrar inconformidades y decidir la dotacion de personal. Estos cuatro flujos son independientes entre si, pero todos convergen en una sola persona. En periodos de alta carga (semana de grados, toma fotografica concurrente de multiples Promociones), cualquier indisponibilidad del gerente bloquea simultaneamente todos estos sub-procesos.

### P2 — Cierre de caja manual (impacto: alto, diario)

Al final de cada dia de cobro (Etapas 3, 4, 5 y 6), el cajero realiza el cierre de caja manualmente. El sistema ya registra cada transaccion en tiempo real. Recalcular y reportar manualmente lo que el sistema ya conoce es trabajo sin valor agregado (Muda de tipo reproceso) y una fuente de discrepancias.

### P3 — Notificacion de cambios de fecha por WhatsApp manual a clientes (impacto: alto, frecuente)

Los cambios de fecha de toma fotografica, Prom, Varios y grado se notifican hoy por WhatsApp de forma manual (RN-31). Esto genera retraso variable segun disponibilidad del comercial, ausencia de trazabilidad, y riesgo de omision cuando se gestionan multiples Promociones en paralelo.

### P4 — Comprobante impreso como unico mecanismo de autorizacion del fotografo (impacto: medio, operativo)

El flujo actual requiere que el estudiante entregue el comprobante impreso al fotografo como autorizacion para proceder con la toma. Si el impreso se pierde, se genera una interrupcion del flujo que requiere intervencion manual. El sistema ya tiene confirmacion de pago; esa informacion puede servir directamente como habilitador.

### P5 — Contacto manual del gerente al afectado al cerrar inconformidades (impacto: medio, calidad de servicio)

El gerente contacta al afectado exclusivamente por WhatsApp o llamada telefonica; el sistema no notifica al afectado en ningun momento del ciclo de vida de la inconformidad. Esto deja al cliente sin confirmacion formal de recepcion ni de cierre, y sin trazabilidad en el sistema.

---

## 2. Actores

### Actores internos (Hersa)

| Actor | Tipo | Rol en el proceso to-be |
|---|---|---|
| Gerente | Interno — Hersa (1 persona) | Autoriza descuentos; resuelve discrepancias de pago escaladas; cierra inconformidades; delega dotacion de personal a coordinadores de grado con anticipacion minima de 48 horas. |
| Administrador del sistema | Interno — Hersa (2 personas) | Configuracion del sistema, gestion de usuarios y roles, gestion del catalogo de items y paquetes base, gestion de tablas maestras geograficas, reportes globales, historial de incidentes por Promocion. Gestiona las notificaciones a colaboradores de forma manual desde el sistema. |
| Comercial | Interno — Hersa (3 personas) | Prospeccion, vinculacion de Promociones, reunion con estudiantes, seguimiento y confirmacion de fechas, negociacion de paquetes. Ya no gestiona notificaciones de cambio de fecha a clientes de forma manual: las genera el sistema al actualizar una fecha. |
| Planillador / Cajero | Interno — Hersa (variable) | Apertura de sesion de cobro; registro y cobro a estudiantes; emision de comprobantes (digital y, opcionalmente, impreso); cierre de sesion. El reporte de cierre de caja lo genera el sistema automaticamente al cerrar la sesion. Puede registrar pagos menores al 50% con justificacion escrita obligatoria en el sistema. |
| Fotografo | Interno o externo (variable) | Toma fotografica, retoque (puede iniciar en paralelo con tomas del mismo dia), empaquetado del pedido fisico. Verifica autorizacion del estudiante en el sistema, sin depender del comprobante impreso como unico mecanismo. Tiene turnos de toma asignados. |
| Vestidor | Interno (puede sumarse externo temporal) (variable) | Mide y ajusta togas el dia de las tomas fotograficas. |
| Jefe de Logistica | Interno — Hersa (1 permanente) | Dirige la logistica de los grados. Puede realizar asignaciones individuales y bulk de personal a eventos. |
| Coordinador de grado | Interno — Hersa (variable) | Ejecucion en sitio el dia de grado: recepcion, verificacion de toga, cobro de saldo, entrega de paquetes, escaneo de QR. Recibe la asignacion de dotacion con anticipacion minima de 48 horas. |
| Maestro de Ceremonia | Externo (variable) | Dirige el protocolo en las ceremonias de grado. |
| Personal de Bodega | Interno — Hersa (variable) | Separa y prepara lo requerido para cada evento: togas por talla, borlas, birretes, estolas, manteleria, sillas, mesas, menaje de evento. |
| Secretaria | Interno — Hersa (variable) | Gestion general; tiene acceso a informacion del sistema segun su perfil de permisos. |
| Meseros | Externo temporal (contratado por dia/evento) | Servicio de mesa en Cenas de Profesores y Actividades Prom. |
| Vestidores adicionales | Externo temporal (contratado por dia/evento) | Apoyo de medicion y ajuste de togas cuando el volumen lo requiere. |
| Usuario interno generico | Interno — Hersa | Cualquier usuario con acceso al sistema puede registrar una inconformidad. |

### Actores externos (clientes e instituciones)

| Actor | Tipo | Rol en el proceso to-be |
|---|---|---|
| Director / Rector de la institucion | Externo — Institucion | Punto de contacto inicial; autoriza el acceso de Hersa a estudiantes e instalaciones. |
| Representante de padres | Externo — Institucion | Participa en la reunion de vinculacion; integra el grupo de WhatsApp; titular del contrato con Hersa. |
| Delegado estudiantil | Externo — Institucion | Participa en la reunion de vinculacion; integra el grupo de WhatsApp; facilita la difusion del enlace o QR de auto-registro. |
| Estudiante graduando | Externo — Cliente B2C | Se auto-registra o es registrado presencialmente; realiza pagos; recibe notificaciones automaticas por email y SMS. |
| Padre / Acudiente | Externo — Cliente B2C | Titular del contrato con Hersa; recibe notificaciones automaticas; asiste al dia de grado con ticket QR. |

### Actores proveedores externos

| Actor | Rol en el proceso to-be |
|---|---|
| Conductor | Empresa o individuo que transporta estudiantes. Tiene programaciones de recorridos con horarios, lugares de partida y puntos de recogida (rutas con paradas). Puede recibir asignacion bulk de rutas a eventos. |
| Grupo Musical | Canta en intermedios de grados y eventualmente en Actividades Prom. |
| Alimentos | Empresa externa que provee servicio de alimentos y bebidas para Cenas de Profesores y Actividades Prom. |

### Sistema

| Actor | Rol |
|---|---|
| Sistema (plataforma Hersa) | Registro de datos, notificaciones automaticas a clientes (email/SMS), notificaciones manuales a colaboradores (email/SMS a solicitud del administrador), control de sesiones de cobro, gestion de QR, cruce de ausentes, reporte de cierre de caja automatico, historial de incidentes, alertas de escalacion, calendario de eventos autenticado, registro de notificaciones enviadas con control de duplicados. |

**Nota sobre roles multiples:** Un colaborador puede tener multiples roles de forma simultanea.

---

## 3. Perfil de Colaborador

Todo colaborador —interno y externo— debe tener registrado en el sistema:

| Campo | Tipo | Obligatoriedad |
|---|---|---|
| Nombre completo | Texto | Obligatorio |
| Telefono | Texto | Obligatorio |
| Numero de documento | Texto | Obligatorio |
| Pais | Seleccion desde tabla maestra | Obligatorio |
| Departamento | Seleccion desde tabla maestra (dependiente de Pais) | Obligatorio |
| Ciudad | Seleccion desde tabla maestra (dependiente de Departamento) | Obligatorio |

Las tablas maestras de Pais, Departamento y Ciudad son entidades independientes con CRUD gestionado via administracion del sistema. No se permiten entradas de texto libre para campos geograficos.

---

## 4. Catalogo de Items y Paquetes de Grado (To-Be)

### Catalogo global de items

El administrador gestiona un catalogo global de items (productos y servicios). Cada item tiene:
- Categoria
- Precio unitario (puede ser $0 para items incluidos en el paquete base, o un valor positivo para items adicionales)

**Sin cambio respecto al as-is.** No presenta desperdicio optimizable; la estructura es la correcta.

### Paquetes base

Se arman paquetes base como combinaciones de items del catalogo. El administrador crea y gestiona los paquetes base. Los paquetes base pueden duplicarse para crear variantes sin alterar el original.

**Sin cambio respecto al as-is.** La opcion de duplicar reduce la Muda de retrabajar configuraciones similares desde cero.

### Negociacion por Promocion

El comercial trabaja sobre un paquete base durante la negociacion con una Promocion especifica:
- Puede agregar o quitar items del paquete base para esa negociacion.
- Cuando se modifica un paquete para una Promocion, el sistema crea automaticamente un snapshot del paquete. Las modificaciones al snapshot no afectan al paquete base original ni a otras Promociones.
- El precio del paquete resultante queda definido para la Promocion especifica.

**Sin cambio respecto al as-is.** El snapshot automatico es el comportamiento correcto; no requiere accion manual adicional del comercial y elimina el riesgo de contaminacion entre Promociones.

---

## 5. Sub-proceso: Gestion de Personal Externo Temporal (To-Be)

En temporada de grados, Hersa contrata personas de forma temporal para cubrir roles externos (meseros, vestidores adicionales, y otros).

**Proceso to-be:**

1. El administrador mantiene en el sistema un pool de candidatos interesados (incluye estudiantes recien graduados y personas externas postuladas previamente).
2. En temporada, el administrador contacta de forma masiva a los candidatos disponibles mediante el envio de un mensaje por email y/o SMS con el enlace de postulacion. El contacto masivo es preferible al individual para reducir la Muda de movimiento del administrador al gestionar listas grandes.

   > **[CAMBIO TO-BE — Paralelizacion]** El contacto a multiples candidatos puede realizarse de forma simultanea (envio masivo) en lugar de candidato por candidato. El sistema agrupa el envio por rol requerido o disponibilidad del periodo.

3. Antes de confirmar la asignacion, el candidato debe completar el formulario de actualizacion de datos (actualizacion del perfil de colaborador con los campos obligatorios del perfil).
4. El sistema registra al candidato como disponible para asignacion una vez que su perfil esta completo y validado.
5. El Jefe de Logistica o el administrador asigna al colaborador a los eventos segun disponibilidad y rol.

**Sin cambios en:** la exigencia de datos completos antes de la asignacion (RN-37), los campos obligatorios del perfil, la logica de disponibilidad.

---

## 6. Flujo por Etapas — Proceso To-Be

### Etapa 0 — Agendamiento

**Actor principal:** Comercial

1. El comercial contacta al director o rector de la institucion educativa por telefono o en persona.
2. Se define una fecha de reunion con la institucion.
3. El comercial registra en el sistema: fecha de visita a la institucion, numero de contacto del director o rector, e institucion educativa a visitar.

**Sin cambios respecto al as-is.** Esta etapa es un micro-paso de agenda; no presenta desperdicio optimizable.

---

### Etapa 1 — Vinculacion de la Promocion

**Actor principal:** Comercial

1. El comercial se reune con representantes de padres y delegados estudiantiles en la institucion.
2. El comercial presenta los servicios de Hersa.
3. **Punto de decision D1 — Seleccion de Hersa:**
   - Si no es seleccionada: el proceso termina para esa Promocion.
   - Si es seleccionada: continua en el paso 4.
4. El comercial define y registra los atributos de la Promocion: institucion, grado academico, jornada y ano.
5. El comercial recopila los contactos: representante de padres y delegado estudiantil. Los delegados se agregan al grupo de WhatsApp.
6. El comercial define y registra en el sistema los parametros de la Promocion:
   - Fechas tentativas de toma fotografica
   - Fecha del Prom
   - Sede del grado
   - Paquete de grado negociado (seleccion del paquete base + ajustes; el sistema crea el snapshot automaticamente)
   - Precio del paquete por estudiante (resultante de la negociacion)
   - Cantidad de tarjetas de invitacion por estudiante
   - Fecha del grado (puede registrarse posteriormente, siempre antes del Prom; el sistema permite filtrar Promociones sin fecha de grado para seguimiento)
7. Se firma el acta de contrato de servicio entre el padre/acudiente y Hersa.
8. El comercial crea el grupo de WhatsApp con representantes de padres.

> **[CAMBIO TO-BE]** Al registrar cualquier fecha en el sistema (paso 6), el sistema envia automaticamente una notificacion por email y SMS a los contactos registrados con la fecha confirmada. Esto elimina la gestion manual de notificaciones de primer registro de fecha.

> **[CAMBIO TO-BE]** Si posteriormente una fecha registrada es actualizada por cualquier usuario con permisos, el sistema genera y envia automaticamente una notificacion de cambio de fecha a todos los contactos vinculados a esa Promocion (padres, delegados, estudiantes con auto-registro completado). El comercial ya no gestiona esta comunicacion por WhatsApp.

**Sin cambios en:** la reunion presencial, la firma del contrato, los datos recopilados, la estructura del snapshot de paquete.

---

### Etapa 1b — Cena de Profesores

**Actores principales:** Jefe de Logistica, Meseros (temporal externo), Proveedor de Alimentos (externo)

La Cena de Profesores es un tipo de evento adicional que puede ocurrir en cualquier momento posterior a la vinculacion de la Promocion. No sigue una secuencia fija dentro del flujo principal.

- Se realiza en Hersa Casa Campestre.
- Incluye: meseros, servicio de alimentos y bebidas provisto por el rol externo "Alimentos".
- Esta incluida en el paquete negociado; no genera cobro adicional al estudiante ni a la institucion.
- El maximo es 1 cena por ciclo de Promocion; el sistema puede registrar cenas adicionales si existe necesidad justificada (D11).
- El evento requiere asignacion de personal (meseros, proveedor de alimentos) antes de su realizacion.

> **[CAMBIO TO-BE — Asignacion anticipada]** La asignacion de meseros y del proveedor de alimentos debe registrarse en el sistema con anticipacion minima de 48 horas, siguiendo el mismo patron de anticipacion definido para otros eventos (Etapa 6).

> **Justificacion:** La asignacion en el momento del evento aplica la misma Muda de espera identificada en la dotacion de personal del dia de grado. La anticipacion de 48 horas permite coordinar con personal temporal y proveedor externo sin urgencia.

**Sin cambios en:** la regla de inclusion en el paquete, el techo de 1 cena por ciclo con posibilidad de extension justificada, la sede.

---

### Etapa 2 — Reunion con Estudiantes en la Institucion Educativa

**Actor principal:** Comercial

1. El comercial se reune con el total de graduandos de la Promocion en la institucion.
2. Se registra la cantidad de estudiantes por grupo.
3. Los estudiantes son incorporados al grupo de WhatsApp de padres ya existente.
4. El comercial comunica las fechas de toma fotografica confirmadas.
5. El comercial comparte el enlace o codigo QR de auto-registro con los delegados estudiantiles.
6. El auto-registro puede comenzar a partir de este momento.

**Sin cambios respecto al as-is.** Las preferencias de grupo (colores, estolas) se siguen recolectando en Etapa 3.

---

### Etapa 3 — Toma Fotografica

**Actores principales:** Planillador / Cajero, Fotografo, Vestidor

La organizacion del dia, las reglas de turnos de buses y las reglas de asignacion de grupos al dia no cambian.

#### Sub-proceso: Registro y cobro en toma fotografica

1. El cajero abre sesion de cobro en el sistema (multi-cajero habilitado; cada cajero opera con sus propias credenciales).
2. El estudiante se acerca al cajero y proporciona su nombre o numero de documento.
3. El cajero busca al estudiante en el sistema por Promocion + nombre o numero de documento.
4. El cajero verifica el precio del paquete (ya definido desde Etapa 1; el monto maximo esta visible en el sistema).
5. El estudiante paga. El pago minimo por defecto es el 50% del valor total del paquete, en efectivo. Si el cajero cobra menos del 50%, debe registrar una justificacion escrita en el campo de comentarios del registro de pago antes de confirmar la transaccion. El campo de comentarios tambien puede usarse para otras anotaciones del cajero.

   > **Sin cambio funcional** respecto al as-is v1.3 en este paso. La flexibilidad del pago minimo y la justificacion escrita obligatoria son controles adecuados que no presentan Muda: la justificacion protege a Hersa de excepciones no documentadas y da trazabilidad al gerente.

6. El sistema registra el pago y actualiza el saldo del estudiante en tiempo real.
7. El sistema envia notificacion al estudiante y al padre/acudiente por email y SMS con el valor pagado y el saldo pendiente.
8. El sistema habilita al estudiante en el registro de cobro como "pagado — autorizado para toma".
9. **[CAMBIO TO-BE]** El fotografo consulta en el sistema el estado del estudiante antes de proceder con la toma. Si el sistema confirma "autorizado para toma", el fotografo procede. El comprobante impreso es opcional y queda disponible como respaldo para el estudiante, pero deja de ser el mecanismo de control de autorizacion.

   > **Justificacion:** Eliminar la dependencia del comprobante fisico como unico habilitador reduce el riesgo de interrupcion por extravio del papel y agiliza el flujo en situaciones de alta rotacion de estudiantes.

10. El vestidor mide y ajusta la toga del estudiante.
11. El fotografo realiza la toma fotografica al estudiante.
12. Se recolectan las preferencias del grupo: colores de bordes, estolas y detalles de la ceremonia.
13. **[CAMBIO TO-BE — Paralelizacion]** El proceso de retoque puede iniciar con las fotos ya tomadas del dia mientras continuan las tomas del mismo dia con otros estudiantes. No es necesario esperar al cierre total del dia para iniciar el retoque.

    > **Justificacion:** El retoque no depende de las tomas que aun no se han realizado; iniciar en paralelo reduce el tiempo total de produccion fotografica.

14. **[CAMBIO TO-BE]** Al cierre de la sesion de cobro del cajero, el sistema genera automaticamente el reporte de cierre de caja (total cobrado, detalle por estudiante, saldos pendientes, add-ons, pagos con justificacion de excepcion) y lo pone disponible para el gerente y el administrador. El cajero no realiza un proceso manual de cierre de caja.

    > **Justificacion:** El sistema ya registra cada transaccion en tiempo real; recalcular y reportar manualmente es reproceso sin valor (Muda). La automatizacion del reporte elimina discrepancias por error humano, libera tiempo del cajero, y consolida en el reporte los pagos menores al 50% con sus justificaciones para revision del gerente.

**Add-ons disponibles:** Sin cambio (foto familiar $20.000, foto grupal con acompanante, poster 50x70 $50.000 COP).

**Descuentos autorizados:** Sin cambio en la regla (requieren autorizacion del gerente u otro usuario con permisos equivalentes). El gerente registra el descuento en el sistema con anticipacion o en el momento; el cajero lo encuentra ya aplicado.

> **[DECISION CERRADA: Delegacion de descuentos]** Solo usuarios con permisos explícitos en el sistema pueden autorizar descuentos. No hay delegacion a cajero ni comercial. El flujo de autorizacion del gerente permanece sin cambio.

#### Sub-proceso: Control de ausentes

Sin cambio estructural. El cierre activo del grupo por el cajero/coordinador sigue siendo el prerequisito para el cruce de ausentes por el sistema. El descuento de $10.000 COP a ausentes se aplica automaticamente tras el cruce.

#### Sub-proceso: Retoque y empaquetado

El fotografo inicia el retoque en paralelo con las tomas del dia (ver paso 13 arriba). El empaquetado del pedido fisico por estudiante sigue igual.

---

### Etapa 4 — Actividad Prom

**Actores principales:** Comercial, Planillador / Cajero, Coordinador de grado, Meseros (temporal externo), Proveedor de Alimentos (externo)

Realizada en Casa Campestre Hersa.

1. Se realiza el ensayo de grado en este dia.
2. El cajero cobra el saldo pendiente a los estudiantes que aun adeudan.
3. El comercial o coordinador distribuye las tarjetas de invitacion (codigos QR de un solo uso) a cada graduando.
4. Los estudiantes que no asistieron a la toma fotografica original (Etapa 3) pueden tomarse las fotos en este dia.
5. Se provee servicio de alimentos y bebidas a cargo del proveedor externo "Alimentos".

> **[CAMBIO TO-BE]** El cierre de caja al final del Prom sigue el mismo patron automatizado definido en Etapa 3: el sistema genera el reporte de cierre al cerrar la sesion de cobro del cajero.

> **[CAMBIO TO-BE — Asignacion anticipada]** La asignacion de meseros y del proveedor de alimentos para la Actividad Prom debe registrarse en el sistema con anticipacion minima de 48 horas, siguiendo el patron unificado de anticipacion de personal.

> **Justificacion:** Unifica el patron de anticipacion de 48 horas para todos los eventos que requieren personal temporal o proveedores externos, eliminando la Muda de coordinacion urgente en el dia del evento.

**Sin cambios en:** las reglas de ausentes, alcohol, tarjetas sobrantes y transporte.

---

### Etapa 5 — Toma Fotografica Varios

**Actores principales:** Fotografo, Planillador / Cajero

Sin cambios estructurales. Los tres casos (adicional, retoma, recuperacion de ausentes) se mantienen. El sub-proceso de cobro sigue el mismo flujo optimizado definido en Etapa 3: autorizacion por sistema, reporte de cierre automatico.

---

### Etapa 6 — Dia de Grado

**Actores principales:** Coordinador de grado, Planillador / Cajero, Maestro de Ceremonia, Personal de Bodega, Jefe de Logistica, Gerente (ante problemas mayores)

#### Logistica general de recepcion

1. El Personal de Bodega prepara y dispone los materiales necesarios: togas por talla, borlas, birretes, estolas, manteleria, sillas, mesas, menaje de evento.
2. El personal de Hersa recibe a los graduandos en la entrada.
3. El coordinador de grado verifica y ajusta la toga del estudiante (la talla debe coincidir con la asignada en la toma fotografica; el sistema fuerza este vinculo).
4. El personal de ceremonia gestiona el ingreso de familiares mediante tickets QR de un solo uso, invalidados al escanear en la entrada.
5. El Maestro de Ceremonia dirige el protocolo de la ceremonia de grado.
6. La ceremonia inicia puntualmente a la hora impresa en las tarjetas.

Sin cambios en las reglas de acceso, tickets QR, horario de ceremonia o verificacion de toga.

> **[CAMBIO TO-BE — Dotacion de personal]** La asignacion de personal (coordinadores, cajeros, ceremonial) se confirma y registra en el sistema con un minimo de 48 horas antes del evento, no en el momento del evento. El coordinador de grado principal recibe la asignacion y puede ajustarla, con notificacion al gerente si hay variaciones mayores.

> **Justificacion:** Decidir la dotacion "en el momento" (RN-25 as-is) impide planificacion anticipada del personal y es un riesgo operativo cuando Hersa gestiona multiples eventos simultaneos. La confirmacion anticipada reduce la carga del gerente el dia del evento.

> **[RIESGO LEGAL: Dotacion minima de personal]** Si existe algun acuerdo contractual o compromiso con la institucion educativa respecto a un numero minimo de personal de Hersa en el evento, la delegacion al coordinador debe respetar ese minimo. Verificar contratos antes de implementar.

#### Sub-proceso: Pre-validacion de saldo (nuevo)

> **[CAMBIO TO-BE]** El sistema genera, con anticipacion minima de 24 horas antes del dia de grado, una lista de estudiantes con saldo pendiente, disponible para el coordinador de grado y el cajero asignados al evento. Esto permite anticipar la carga de cobro en sala y alertar proactivamente a los estudiantes con saldo por pagar.

> **Justificacion:** Reducir sorpresas en sala el dia de mayor presion operativa y emocional para el cliente disminuye la friccion y la posibilidad de confrontaciones.

> **[DECISION CERRADA: Notificacion anticipada de saldo al cliente — APROBADA]** El sistema notifica automaticamente por email y SMS a los estudiantes con saldo pendiente entre 48 y 24 horas antes del dia de grado.

#### Sub-proceso: Cobro de saldo y entrega de paquetes

1. El cajero valida el saldo del estudiante en el sistema (pre-cargado desde la lista de pendientes).
2. **Punto de decision D6 — Saldo pendiente en dia de grado:**
   - Sin saldo: el coordinador procede a la entrega del paquete fotografico directamente.
   - Con saldo: el cajero cobra el saldo completo; solo entonces el coordinador entrega el paquete.
3. La regla de condicionamiento de entrega al pago completo se mantiene sin excepcion.
4. Al cierre de la sesion de cobro del dia de grado, el sistema genera automaticamente el reporte de cierre de caja.

**Escalacion ante problemas mayores:** El gerente contacta directamente al estudiante o al padre. El sistema registra la escalacion con marca de tiempo, actor y motivo, para trazabilidad.

> **Justificacion:** Registrar la escalacion en el sistema (aunque el contacto siga siendo manual) agrega trazabilidad al historial de incidentes de la Promocion y al expediente del estudiante.

#### Regla — Cancelacion de tickets por no graduacion

Sin cambio. La cancelacion masiva e inmediata de QR al confirmar no-graduacion se mantiene.

#### Regla — Reembolso y entrega por reprobacion

Sin cambio. El flujo de subida de comprobante, reembolso del 50% y entrega del paquete se mantiene igual.

---

## 7. Sub-proceso Transversal — Asignacion de Personal a Eventos (To-Be)

### Asignacion individual

El Jefe de Logistica o el administrador asigna colaboradores a cada evento especificando el rol que ejerceran en ese evento. Sin cambio respecto al as-is.

### Asignacion masiva (bulk)

> **[PRESERVADO CON MEJORA]** El sub-proceso de asignacion bulk del as-is es el comportamiento correcto (elimina Muda de movimiento al asignar uno a uno). Se mantiene tal como esta, con la aclaracion de que la asignacion bulk puede sobreescribirse con asignaciones individuales posteriores.

- **Por auditorios:** Todos los eventos que se realizan en ciertos auditorios reciben la misma asignacion de personal de forma automatica.
- **Por rango de fechas:** Todos los eventos dentro de un rango de fechas definido reciben la misma asignacion.
- **Para conductores:** La asignacion bulk tambien aplica para la asignacion de rutas de conductores a eventos.

> **[CAMBIO TO-BE — Trazabilidad de asignaciones bulk]** Cuando una asignacion bulk se aplica a un conjunto de eventos, el sistema registra que esa asignacion proviene de una regla bulk (auditorio o rango de fechas), no de una asignacion individual. Esto permite identificar rapidamente que eventos fueron afectados si la regla bulk necesita modificarse.

> **Justificacion:** Sin trazabilidad del origen de la asignacion, modificar una regla bulk requiere revisar evento por evento para saber cuales fueron afectados. El registro del origen elimina esa busqueda manual (Muda de movimiento).

---

## 8. Sub-proceso Transversal — Notificacion de Cambios a Colaboradores (To-Be)

Cuando algo cambia en un evento (fecha, lugar, hora), el administrador puede notificar a los colaboradores asignados a ese evento.

**Proceso to-be:**

1. El administrador inicia la notificacion manualmente desde el sistema. El proceso NO es automatico.
2. El sistema muestra al administrador la lista de colaboradores asignados al evento, marcando a quienes ya recibieron la notificacion de ese evento (control de duplicados agrupado por evento).
3. El administrador selecciona el canal: SMS, email, o ambos.
4. El sistema envia la notificacion a los colaboradores seleccionados y registra el envio con marca de tiempo.
5. El sistema impide el reenvio a colaboradores que ya recibieron la notificacion del mismo evento, salvo que el administrador lo fuerce explicitamente.

**Sin cambios en:** la naturaleza manual del proceso (decision de negocio), el control de duplicados, la agrupacion por evento, los canales disponibles.

> **[CAMBIO TO-BE — Resumen previo al envio]** Antes de confirmar el envio, el sistema muestra al administrador un resumen de: cuantos colaboradores recibiran la notificacion, cuantos ya la recibieron (excluidos por defecto), y el contenido del mensaje. El administrador confirma antes de enviar.

> **Justificacion:** El resumen previo es un paso de confirmacion que elimina el riesgo de envios erroneos masivos (Muda de defecto), especialmente relevante cuando el evento tiene muchos colaboradores asignados.

---

## 9. Sub-proceso Transversal — Calendario de Eventos para Colaboradores (To-Be)

El sistema provee una vista de calendario de eventos:

- Solo accesible para usuarios autenticados.
- Los eventos se muestran categorizados por tipo.
- Un colaborador autenticado puede ver:
  - **Vista principal:** Los eventos a los que esta asignado.
  - **Vista general:** Todos los eventos de la empresa (para informacion general).

**Sin cambios en:** la estructura del calendario, los requisitos de autenticacion, la logica de vistas.

> **[CAMBIO TO-BE — Indicador de cambio reciente]** Los eventos del calendario que hayan recibido una notificacion de cambio en las ultimas 48 horas se marcan visualmente como "modificado recientemente" en la vista del colaborador.

> **Justificacion:** Un colaborador que entra al calendario despues de recibir una notificacion de cambio puede no recordar cual evento cambio. El indicador visual reduce el tiempo de identificacion del cambio (Muda de busqueda) y refuerza la conciencia situacional del colaborador.

---

## 10. Sub-proceso Transversal — Gestion de Inconformidades (To-Be)

Aplica en cualquier etapa del proceso operativo.

### Registro

Sin cambio. Cualquier usuario interno con acceso puede registrar. El formulario con categorias predefinidas (foto / cobro / entrega / protocolo) y campo libre se mantiene. El registro queda asociado a la Promocion y al estudiante. Al momento del registro, el sistema notifica automaticamente al gerente.

> **[CAMBIO TO-BE]** Al registrar la inconformidad, el sistema envia adicionalmente una notificacion automatica al afectado (estudiante o padre) confirmando la recepcion de su caso, con un numero o referencia de seguimiento.

> **Justificacion:** El cliente queda hoy sin confirmacion formal de que su reclamo fue recibido. La notificacion de acuse de recibo reduce la ansiedad del cliente y las consultas repetidas al personal de Hersa.

### Gestion y cierre

1. El gerente recibe la notificacion automatica del sistema.
2. El gerente investiga y gestiona la inconformidad.
3. El gerente contacta al afectado (WhatsApp o llamada) para resolver. El contacto directo se mantiene.
4. El gerente cierra la inconformidad en el sistema.
5. **[CAMBIO TO-BE]** Al cierre de la inconformidad, el sistema envia automaticamente una notificacion al afectado informando que el caso fue resuelto, con el resumen de la resolucion registrado por el gerente.

> **Justificacion:** Hoy el cliente no recibe ninguna notificacion automatica en ningun punto del ciclo. Esto obliga al gerente a ser el unico canal de comunicacion en ambos extremos. La notificacion automatica de cierre estandariza la experiencia y reduce la carga manual del gerente.

### Reglas

- SLA de resolucion: 48 horas habiles desde el registro. Sin cambio.
- Alerta de escalacion interna: a las 36 horas habiles si no ha sido cerrada. Sin cambio.
- El cierre sigue siendo exclusivo del gerente. Sin cambio.
- **[CAMBIO TO-BE]** El sistema registra el historial completo de notificaciones al afectado (acuse de recibo, cierre) con marcas de tiempo, para trazabilidad y auditoria.

---

## 11. Puntos de Decision

| ID | Etapa | Condicion | Actor decisor | Rama afirmativa | Rama negativa |
|---|---|---|---|---|---|
| D1 | Etapa 1 | La institucion selecciona a Hersa para la Promocion | Director / representantes institucionales | Continua la vinculacion de la Promocion | El proceso termina para esa Promocion |
| D2 | Etapa 3 | El estudiante asistio a la toma fotografica | Sistema (cruce tras cierre activo de grupo) | Se registra pago y se realiza la toma | Descuento $10.000 COP; se agenda para Varios o Prom |
| D3 | Etapa 3 | Se solicita descuento de paquete | Gerente (o usuario con permisos equivalentes) | Descuento aplicado con registro de autorizacion | Sin descuento |
| D4 | Etapa 3 | Discrepancia entre comprobantes de pago | Gerente | Gerente resuelve; se registra la resolucion en el sistema | Sin accion adicional |
| D5 | Etapa 4 | El estudiante esta ausente en el Prom | Condicion de hecho | Companero retira materiales con carta de autorizacion | El estudiante retira sus materiales directamente |
| D6 | Etapa 6 | El estudiante tiene saldo pendiente en el dia de grado | Sistema (validacion automatica, pre-cargada) | Cajero cobra el saldo antes de la entrega | Coordinador entrega el paquete directamente |
| D7 | Etapa 6 | El estudiante se gradua | Hecho academico de la institucion | Proceso normal de entrega y acceso de familiares | Cancelacion masiva de QR; tramite de reembolso del 50% |
| D8 | Cualquier etapa | Se registra una inconformidad | Usuario interno con acceso | Sistema notifica al gerente y al afectado; gerente gestiona y cierra en 48 h habiles | Sin accion |
| D9 | Etapas 3, 5, 6 | El cajero tiene permisos especiales en el sistema | Administrador del sistema (configuracion previa) | Puede abrir sesion de cobro en cualquier momento | Solo puede operar en etapas habilitadas para esa Promocion |
| D10 | Etapa 6 | Estudiante con saldo pendiente 24-48 h antes del grado | Sistema | Notificacion automatica al estudiante/padre con saldo y fecha limite | Sin accion adicional si saldo = 0 |
| D11 | Etapa 1b | Se necesita una segunda Cena de Profesores en el mismo ciclo de Promocion | Administrador | El sistema permite registrar la cena adicional con justificacion | Solo se registra la cena unica del ciclo |
| D12 | Etapa 3 | El cajero cobra menos del 50% del paquete | Cajero | Se registra el pago con justificacion escrita obligatoria en campo de comentarios antes de confirmar | Se registra el pago normalmente sin comentario adicional |

---

## 12. Tabla de Cambios

| Cambio | Justificacion | Impacto Esperado |
|---|---|---|
| Notificaciones automaticas de registro y cambio de fecha a clientes (Etapa 1 y transversal) | Elimina trabajo manual del comercial por WhatsApp; asegura cobertura total de contactos registrados; agrega trazabilidad | Reduccion de tiempo de comunicacion; eliminacion de omisiones; registro automatico de notificaciones enviadas |
| Autorizacion del fotografo por sistema, no por comprobante impreso (Etapa 3) | El comprobante fisico es un punto de falla (se puede extraviar); el sistema ya tiene la informacion de pago en tiempo real | Eliminacion de interrupciones del flujo fotografico por extravio de comprobante; el impreso queda disponible como respaldo opcional |
| Reporte de cierre de caja automatico (Etapas 3, 4, 5, 6) | El cajero recalcula manualmente lo que el sistema ya sabe; es Muda de reproceso y fuente de discrepancias | Eliminacion del proceso de cierre manual; reduccion de errores; disponibilidad inmediata del reporte para gerente y administrador |
| Reporte de cierre incluye pagos con justificacion de excepcion (Etapa 3) | El gerente necesita visibilidad sobre los pagos menores al 50% para auditar las excepciones del cajero | Trazabilidad de excepciones de pago minimo; insumo para auditoria financiera |
| Inicio de retoque en paralelo con tomas del dia (Etapa 3) | El retoque no depende de tomas no realizadas aun; no hay razon operativa para esperar al cierre del dia | Reduccion del tiempo total de produccion fotografica |
| Confirmacion de dotacion de personal con 48 h de anticipacion (Etapa 6 y Etapas 1b, 4) | Decidir "en el momento" impide planificacion y genera riesgo cuando hay eventos simultaneos | Reduccion de riesgo operativo en dias de alta concurrencia; descongestiona al gerente el dia del evento |
| Pre-validacion de saldo 24 h antes del grado (Etapa 6 — nuevo sub-proceso) | Reduce sorpresas en sala el dia de mayor presion emocional y operativa | Reduccion de fricciones en sala; posibilidad de que el cliente resuelva saldos antes del dia del grado |
| Notificacion automatica de acuse de recibo al afectado al registrar inconformidad | El cliente queda hoy sin confirmacion formal; genera ansiedad y consultas repetidas | Mejora de percepcion de servicio; reduccion de consultas al personal sobre estado del reclamo |
| Notificacion automatica de cierre de inconformidad al afectado | El gerente es hoy el unico canal en ambos extremos del ciclo | Estandarizacion de la experiencia de cierre; reduccion de carga del gerente como unico emisor |
| Registro de escalaciones en el sistema (Etapa 6) | Las escalaciones por WhatsApp/llamada no dejan trazabilidad en el sistema | Enriquecimiento del historial de incidentes por Promocion; insumo para futuras negociaciones contractuales |
| Contacto masivo a candidatos de personal externo (Sub-proceso 5) | El contacto candidato por candidato es Muda de movimiento cuando el pool es grande | Reduccion del tiempo de convocatoria de personal en temporada de alta demanda |
| Trazabilidad del origen de asignaciones bulk (Sub-proceso transversal 7) | Sin registro del origen, modificar una regla bulk requiere revision evento por evento | Eliminacion de busqueda manual de eventos afectados por una regla bulk |
| Resumen previo al envio de notificaciones a colaboradores (Sub-proceso transversal 8) | El envio masivo sin confirmacion previa es un riesgo de defecto (envios erroneos) | Reduccion de errores en notificaciones masivas a colaboradores |
| Indicador visual de cambio reciente en calendario de colaboradores (Sub-proceso transversal 9) | Sin indicador, el colaborador debe recordar que evento cambio al recibir la notificacion | Reduccion del tiempo de identificacion del cambio; mejora de conciencia situacional del colaborador |
| Unidad operativa actualizada de "Institucion" a "Promocion" en todo el proceso | El as-is v1.3 establece que la unidad operativa central es la Promocion, no la institucion plana | Alineacion del to-be con el modelo de dominio correcto; eliminacion de ambiguedad en procesos que involucran multiples Promociones de una misma institucion |

---

## 13. Pasos Eliminados

| Paso As-Is | Etapa | Principio Lean Aplicado |
|---|---|---|
| El cajero realiza el cierre de caja manualmente al final del dia (Etapas 3, 4, 5, 6) | Transversal | Muda de reproceso: el sistema ya registra cada transaccion; recalcular manualmente no agrega valor |
| El comercial notifica cambios de fecha a clientes por WhatsApp de forma manual (RN-31) | Transversal | Muda de movimiento y espera: el sistema tiene los contactos y puede emitir la notificacion directamente |
| El estudiante entrega comprobante impreso al fotografo como unico mecanismo de autorizacion (Etapa 3) | Etapa 3 | Muda de defecto potencial: el papel como unico habilitador genera interrupciones cuando se extravía; el sistema es la fuente de verdad |
| La dotacion de personal se decide "en el momento" del evento sin registro previo (RN-25) | Etapa 6, 1b, 4 | Muda de espera y riesgo operativo: la decision tardia bloquea la planificacion cuando hay eventos simultaneos |
| El gerente es el unico canal de comunicacion con el afectado en todo el ciclo de inconformidades | Sub-proceso transversal | Muda de movimiento: el gerente ejecuta trabajo de transmision que el sistema puede hacer; el gerente debe agregar valor en la resolucion, no en la transmision |
| El administrador contacta candidatos de personal externo uno por uno (Sub-proceso 4 as-is) | Sub-proceso 4 | Muda de movimiento: el contacto individual a un pool grande es innecesariamente secuencial |

---

## 14. Clasificacion: Pasos Automatizables vs. Manuales

| Paso | Clasificacion | Comportamiento Deseado (sin nombrar tecnologia) |
|---|---|---|
| Notificacion de registro y cambio de fecha a contactos de la Promocion | Automatizable | Al registrar o actualizar una fecha en el sistema, el sistema envia sin intervencion humana un mensaje informativo a todos los contactos vinculados a esa Promocion |
| Reporte de cierre de caja al cerrar sesion de cobro | Automatizable | Al cerrar la sesion de cobro, el sistema consolida todas las transacciones y genera un reporte estructurado (total cobrado, detalle por estudiante, saldos pendientes, add-ons, pagos con justificacion de excepcion), disponible para gerente y administrador |
| Autorizacion de fotografo por estado de pago en sistema | Automatizable | El sistema expone en tiempo real el estado de cada estudiante (autorizado / pendiente) para que el fotografo consulte sin requerir un artefacto fisico externo |
| Cruce de ausentes tras cierre activo del grupo | Automatizable | Sin cambio respecto al as-is; ya automatizado |
| Notificacion de descuento $10.000 a ausente | Automatizable | El sistema notifica automaticamente al estudiante identificado como ausente tras el cruce |
| Notificacion de acuse de recibo al afectado al registrar inconformidad | Automatizable | Al guardar el registro de una inconformidad, el sistema envia sin intervencion humana un mensaje al afectado con numero de referencia y plazo de resolucion |
| Notificacion de cierre de inconformidad al afectado | Automatizable | Al cerrar la inconformidad el gerente, el sistema envia sin intervencion humana un mensaje al afectado con el resumen de la resolucion |
| Alerta de escalacion interna a las 36 horas habiles | Automatizable | Sin cambio respecto al as-is; ya automatizado |
| Pre-lista de estudiantes con saldo pendiente (24 h antes del grado) | Automatizable | El sistema genera y entrega automaticamente la lista a los coordinadores y cajeros asignados al evento |
| Notificacion anticipada de saldo a estudiante/padre (24-48 h antes del grado) | Automatizable | El sistema identifica a los estudiantes con saldo pendiente y les envia un recordatorio con el monto y la fecha limite de pago |
| Registro de pagos y actualizacion de saldo por estudiante | Automatizable | Sin cambio respecto al as-is; ya automatizado |
| Invalidacion de QR al escanear y cancelacion masiva por no-graduacion | Automatizable | Sin cambio respecto al as-is; ya automatizado |
| Reembolso del 50% al subir comprobante de no-graduacion | Automatizable | Sin cambio respecto al as-is; ya automatizado |
| Creacion de snapshot de paquete al modificar para una Promocion | Automatizable | Al guardar cambios sobre un paquete en el contexto de una Promocion, el sistema crea la copia interna sin intervencion adicional del comercial |
| Envio masivo a candidatos de personal externo | Automatizable | El administrador selecciona el rol y el periodo; el sistema envia el mensaje con el enlace de postulacion a todos los candidatos del pool de forma simultanea |
| Envio de notificaciones a colaboradores | Automatizable (a solicitud manual del administrador) | El sistema ejecuta el envio al confirmar el administrador; el sistema impide duplicados por defecto y muestra resumen previo al envio |
| Registro de trazabilidad del origen de asignaciones bulk | Automatizable | El sistema registra automaticamente si una asignacion proviene de una regla bulk o de una asignacion individual, sin accion adicional del usuario |
| Contacto del gerente con el afectado para resolver inconformidades | Manual (por naturaleza) | Requiere juicio y negociacion; no es automatizable. El gerente sigue siendo el unico actor que cierra inconformidades |
| Autorizacion de descuentos por el gerente | Manual (por naturaleza) | Requiere juicio comercial; el registro en el sistema es obligatorio |
| Inicio de retoque fotografico | Manual (paralelizable) | El fotografo puede iniciar el retoque con las fotos ya tomadas sin esperar al cierre del dia; no es automatizable pero si reorganizable |
| Reunion de vinculacion, presentacion de servicios, firma de contrato | Manual (por naturaleza) | Requiere presencia y confianza; no es automatizable |
| Verificacion y ajuste de toga en el dia de grado | Manual (por naturaleza) | Requiere intervencion fisica del coordinador |
| Decision del gerente sobre escalacion en dia de grado | Manual (por naturaleza) | Requiere juicio situacional; el registro de la escalacion en el sistema es el unico cambio |
| Confirmacion de dotacion de personal con 48 h de anticipacion | Manual (anticipado) | El gerente o coordinador principal confirma la asignacion en el sistema con anticipacion; sigue siendo una decision humana pero con ventana temporal definida |
| Cierre activo del grupo por el cajero/coordinador | Manual (prerequisito del sistema) | Sin cambio; sigue siendo una accion deliberada del cajero |
| Justificacion escrita del cajero cuando el pago es menor al 50% | Manual (prerequisito del sistema) | El cajero escribe la justificacion en el campo de comentarios antes de confirmar el pago; el sistema no puede inferir la justificacion |
| Notificacion de cambios a colaboradores (inicio del proceso) | Manual por decision de negocio | El administrador inicia el proceso manualmente; el sistema ejecuta el envio tras confirmacion |
| Verificacion de perfil completo antes de confirmar asignacion de personal externo | Manual (prerequisito del sistema) | El sistema valida que el perfil este completo; la decision de confirmar la asignacion la toma el Jefe de Logistica o el administrador |

---

## 15. Impacto Estimado

| Dimension | As-Is | To-Be | Reduccion / Mejora |
|---|---|---|---|
| Pasos manuales de comunicacion por WhatsApp a clientes (cambios de fecha) | Variable; sin limite definido | 0 para el comercial (gestionado por sistema) | Eliminacion completa del trabajo manual de notificacion de fechas |
| Pasos de cierre de caja manual | 1 por sesion de cobro (Etapas 3, 4, 5, 6) | 0 (reporte automatico al cerrar sesion) | Eliminacion de 3-4 cierres manuales por ciclo de Promocion |
| Pasos de comunicacion al afectado en ciclo de inconformidades | 0 automaticos; 100% dependiente del gerente | 2 automaticos (acuse de recibo + cierre); el gerente mantiene el contacto de resolucion | El gerente deja de ser el unico canal en 2 de 3 puntos de comunicacion del ciclo |
| Riesgo de interrupcion por extravio de comprobante impreso | Presente (unico mecanismo de autorizacion al fotografo) | Eliminado (sistema como fuente de verdad; impreso como respaldo opcional) | Reduccion de interrupciones del flujo fotografico |
| Tiempo de produccion fotografica (retoque) | Inicia al final del dia de toma | Puede iniciar con las primeras fotos del dia | Adelanto potencial de horas en el inicio del retoque |
| Riesgo operativo en dotacion de personal | Alto (decision en el momento para grado, Prom y Cena de Profesores) | Reducido (confirmacion minima 48 h antes para todos los eventos) | Planificacion anticipada habilita asignacion coordinada en eventos simultaneos |
| Trazabilidad de escalaciones del gerente | Ninguna en el sistema (solo WhatsApp/llamada) | Registro con marca de tiempo y actor en el sistema | Enriquecimiento del historial de incidentes por Promocion |
| Friccion en sala el dia de grado por saldos pendientes | Alta (se descubre en el momento del cobro) | Reducida (pre-lista + notificacion anticipada al cliente) | Reduccion de confrontaciones en sala |
| Tiempo de convocatoria de personal externo temporal | Variable; contacto individual a cada candidato | Reducido; contacto masivo simultaneo a todo el pool | Reduccion significativa del tiempo de convocatoria en temporada alta |
| Riesgo de contaminacion entre paquetes de distintas Promociones | Presente si el snapshot no se crea de forma sistematica | Eliminado; el snapshot es automatico al modificar un paquete para una Promocion | Integridad de datos garantizada entre Promociones de una misma o distintas instituciones |
| Riesgo de envios erroneos en notificaciones masivas a colaboradores | Presente sin confirmacion previa | Reducido; resumen previo al envio con confirmacion obligatoria del administrador | Reduccion de errores en comunicacion con personal |
| Visibilidad de cambios recientes en el calendario del colaborador | Ninguna; el colaborador debe cruzar la notificacion recibida con el calendario manualmente | Alta; indicador visual de "modificado recientemente" en el evento del calendario | Reduccion del tiempo de identificacion del evento modificado |

---

## 16. Lo Que No Cambia y Por Que

| Elemento preservado | Razon de preservacion |
|---|---|
| Pago minimo del 50% en efectivo como regla por defecto (RN-03) | Regla de negocio central; es el mecanismo de compromiso financiero del cliente. La flexibilidad de pago menor al 50% con justificacion escrita obligatoria ya fue incorporada en el as-is v1.3 y se preserva en el to-be. |
| Condicionamiento de entrega de paquete al pago completo el dia de grado (RN-04) | Regla de negocio sin excepcion; es la salvaguarda financiera de Hersa en el momento de mayor friccion. |
| Cierre activo del grupo por el cajero como prerequisito del cruce de ausentes (RN-20) | El cierre activo es una accion deliberada que marca el fin de un periodo de cobro para un grupo especifico; automatizarlo sin ese acto deliberado puede generar cruces prematuros. |
| Autorizacion de descuentos exclusiva del gerente o usuario con permisos equivalentes (RN-06) | Control financiero activo. El flujo de autorizacion permanece sin cambio. |
| Cierre de inconformidades exclusivo del gerente (RN-23) | Control de calidad y responsabilidad; el gerente es el representante de autoridad ante el cliente. |
| SLA de 48 horas habiles y alerta a las 36 horas (RN-23) | Los SLA son compromisos de servicio ya definidos; cambiarlos requiere decision estrategica. |
| Contrato entre padre/acudiente y Hersa (RN-01) | Obligacion legal; la firma del acta en Etapa 1 es inamovible. [RIESGO LEGAL: cualquier cambio en el momento, formato o partes del contrato debe revisarse con asesor legal.] |
| Cancelacion masiva de QR por no-graduacion (RN-10) | Regla de acceso y control de aforo; es automatica en el sistema y no presenta desperdicio. |
| Reembolso del 50% por no-graduacion mediante subida de comprobante (RN-10) | Flujo ya definido con logica sistematica; no presenta desperdicio adicional. |
| Buses salen en horario exacto sin excepciones (RN-11) | Restriccion operativa de coordinacion con terceros (transporte); no modificable desde el rediseno del proceso. |
| Ninos menores de 5 anos no admitidos; ninos de 5 o mas requieren ticket (RN-13) | Regla de seguridad y aforo con posible base en normativa de eventos. [RIESGO LEGAL: verificar si existe regulacion local aplicable a aforos de menores en eventos cerrados.] |
| Alcohol y sustancias prohibidos en todas las actividades de Hersa (RN-12) | Regla de orden publico y responsabilidad civil de Hersa como organizador. |
| Acceso externo sin registro de cuenta (RN-27) | Decision de experiencia de usuario ya tomada; reducir la friccion de acceso para padres y estudiantes es un objetivo declarado del negocio. |
| Auto-registro asincrono de estudiantes (via enlace o QR) | Mecanismo de reduccion de carga presencial ya implementado en la operacion; no presenta desperdicio. |
| Historial de incidentes por Promocion accesible solo a gerente y administrador (RN-29) | Control de acceso a informacion sensible para negociacion comercial. |
| Reuniones presenciales en Etapas 1 y 2 | Requieren presencia para generacion de confianza, firma de contrato y entrega de materiales de auto-registro. No son optimizables sin afectar la naturaleza comercial del servicio. |
| Mecanismo de autenticacion externa pendiente de definicion tecnica (Restriccion 7 del as-is) | Es una decision tecnica pendiente, no una decision de proceso; queda fuera del alcance de este documento. |
| Notificacion de cambios a colaboradores iniciada manualmente por el administrador (RN-38) | Decision de negocio confirmada en el as-is v1.3: el proceso NO es automatico. El administrador retiene el control de cuando y a quien se notifica. |
| Techo de 1 Cena de Profesores por ciclo de Promocion con extension justificada (RN-39) | Regla de negocio que define el alcance del servicio incluido en el paquete; cambiarla requiere decision contractual. |
| Perfil completo obligatorio (6 campos) antes de asignar personal externo (RN-37) | Control de calidad del dato que protege la operacion; sin datos completos no es posible contactar ni identificar al colaborador. |
| Validacion de talla de toga entre toma fotografica y dia de grado (RN-07) | Restriccion operativa; el sistema fuerza el vinculo para garantizar la experiencia del cliente el dia del grado. |
| Justificacion escrita obligatoria del cajero al cobrar menos del 50% (RN-03) | Control financiero y de auditoria; la excepcion debe documentarse en el momento del cobro para trazabilidad. |

---

## 17. Items de Riesgo Legal

1. **Dotacion minima de personal en el evento (Etapa 6):** Si los contratos con instituciones educativas establecen compromisos de dotacion minima de personal de Hersa, la delegacion al coordinador de grado debe respetar esos minimos. Verificar contratos antes de implementar.

2. **Contrato entre padre/acudiente y Hersa (Etapa 1):** Cualquier cambio en el momento, formato, firmantes o mecanismo de firma del acta debe revisarse con asesor legal antes de implementarse.

3. **Admision de menores en el evento (Etapa 6):** Verificar si existe regulacion local (Cali, Colombia) aplicable a aforos de menores en eventos privados cerrados que fundamente o complemente la regla actual (RN-13).

---

*Documento generado por `process-optimizer`. Version 2.0. Todos los items [NECESITA CONTEXTO] estan resueltos. Este documento esta listo para ser usado como insumo por `systems-analyst`.*

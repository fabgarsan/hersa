# Hersa — Proceso Operativo To-Be (Lean-Optimizado)

**Version:** 2.1
**Fecha de elaboracion:** 2026-04-28
**Basado en:** `documentation/process/as-is/hersa-proceso-operativo-as-is.md` v1.4
**Marco de mejora:** Lean — Eliminacion de Muda, reduccion de cuellos de botella, paralelizacion segura, reduccion de friccion
**Estado:** To-be — propuesta de proceso optimizado. No contiene recomendaciones de tecnologia especifica.

**Cambios respecto a v2.0:**
- Etapa 1: nuevo panel bulk para creacion de multiples Promociones en un solo paso con paquete compartido y precios individuales por configuracion.
- Etapa 3: correccion del flujo de toga (medicion ANTES del pago; cajero registra la talla; fotografo usa sistema como fuente de autorizacion).
- Etapa 4: nuevo flujo de obsequio de boletas adicionales con estados, trazabilidad, y alerta de aforo.
- Etapa 6: reintegro por reprobacion convertido en entidad asincrona propia (`SolicitudReembolso`) con ciclo de vida y estados explícitos.
- Sub-proceso transversal de Inconformidades: SLA actualizado a 3 dias calendario; alerta de escalacion configurable; nueva entidad `ConfiguracionSistema`.
- Sub-proceso EP-09 (Personal Externo): expansion sustancial con calendario de postulaciones bidireccional (`SlotEvento`), estados de postulacion, actualizacion periodica de perfil, y regla de conflicto horario.
- Nuevo sub-proceso: Cotizador de Paquetes (pre-Etapa 1), con estados de cotizacion, snapshot de precios, y accion de conversion a Promocion.

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
| Gerente | Interno — Hersa (1 persona) | Autoriza descuentos; resuelve discrepancias de pago escaladas; cierra inconformidades; aprueba solicitudes de reembolso; autoriza obsequio de boletas adicionales; delega dotacion de personal a coordinadores de grado con anticipacion minima de 48 horas. |
| Administrador del sistema | Interno — Hersa (2 personas) | Configuracion del sistema, gestion de usuarios y roles, gestion del catalogo de items y paquetes base, gestion de tablas maestras geograficas, reportes globales, historial de incidentes por Promocion. Gestiona las notificaciones a colaboradores de forma manual desde el sistema. Configura parametros globales del sistema (ConfiguracionSistema). |
| Comercial | Interno — Hersa (3 personas) | Prospeccion, elaboracion de cotizaciones, vinculacion de Promociones, reunion con estudiantes, seguimiento y confirmacion de fechas, negociacion de paquetes. Ya no gestiona notificaciones de cambio de fecha a clientes de forma manual: las genera el sistema al actualizar una fecha. |
| Planillador / Cajero | Interno — Hersa (variable) | Apertura de sesion de cobro; registro y cobro a estudiantes, incluyendo la talla de toga; emision de comprobantes (digital y, opcionalmente, impreso); cierre de sesion. El reporte de cierre de caja lo genera el sistema automaticamente al cerrar la sesion. Puede registrar pagos menores al 50% con justificacion escrita obligatoria en el sistema. |
| Fotografo | Interno o externo (variable) | Toma fotografica, retoque (puede iniciar en paralelo con tomas del mismo dia), empaquetado del pedido fisico. Verifica autorizacion del estudiante en el sistema, sin depender del comprobante impreso como unico mecanismo. Tiene turnos de toma asignados. |
| Vestidor | Interno (puede sumarse externo temporal) (variable) | Mide y ajusta togas el dia de las tomas fotograficas. No registra datos en el sistema; comunica la talla al estudiante para que el cajero la registre. |
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
| Candidato externo | Externo — Pool de personal temporal | Persona interesada en trabajar con Hersa de forma temporal; puede postularse a slots de eventos via calendario de postulaciones o via convocatoria masiva. |

### Actores proveedores externos

| Actor | Rol en el proceso to-be |
|---|---|
| Conductor | Empresa o individuo que transporta estudiantes. Tiene programaciones de recorridos con horarios, lugares de partida y puntos de recogida (rutas con paradas). Puede recibir asignacion bulk de rutas a eventos. |
| Grupo Musical | Canta en intermedios de grados y eventualmente en Actividades Prom. |
| Alimentos | Empresa externa que provee servicio de alimentos y bebidas para Cenas de Profesores y Actividades Prom. |

### Sistema

| Actor | Rol |
|---|---|
| Sistema (plataforma Hersa) | Registro de datos, notificaciones automaticas a clientes (email/SMS), notificaciones manuales a colaboradores (email/SMS a solicitud del administrador), control de sesiones de cobro, gestion de QR, cruce de ausentes, reporte de cierre de caja automatico, historial de incidentes, alertas de escalacion, calendario de eventos autenticado, calendario de postulaciones para candidatos externos, registro de notificaciones enviadas con control de duplicados, gestion de solicitudes de reembolso, gestion de configuracion global (ConfiguracionSistema). |

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
- Cuando se modifica un paquete para una Promocion, el sistema crea automaticamente un snapshot (`PaquetePromocion`) del paquete. Las modificaciones al snapshot no afectan al paquete base original ni a otras Promociones.
- El precio del paquete resultante queda definido para la Promocion especifica.

**Sin cambio respecto al as-is.** El snapshot automatico es el comportamiento correcto; no requiere accion manual adicional del comercial y elimina el riesgo de contaminacion entre Promociones.

---

## 5. Sub-proceso: Gestion de Personal Externo Temporal (To-Be)

En temporada de grados, Hersa contrata personas de forma temporal para cubrir roles externos (meseros, vestidores adicionales, y otros).

### 5.1 Convocatoria masiva (flujo existente — mejorado)

**Proceso to-be:**

1. El administrador mantiene en el sistema un pool de candidatos interesados (incluye estudiantes recien graduados y personas externas postuladas previamente).
2. En temporada, el administrador contacta de forma masiva a los candidatos disponibles mediante el envio de un mensaje por email y/o SMS con el enlace de postulacion. El contacto masivo es preferible al individual para reducir la Muda de movimiento del administrador al gestionar listas grandes.

   > **[CAMBIO TO-BE — Paralelizacion]** El contacto a multiples candidatos puede realizarse de forma simultanea (envio masivo) en lugar de candidato por candidato. El sistema agrupa el envio por rol requerido o disponibilidad del periodo.

3. Antes de confirmar la asignacion, el candidato debe completar el formulario de actualizacion de datos (actualizacion del perfil de colaborador con los campos obligatorios del perfil).
4. El sistema registra al candidato como disponible para asignacion una vez que su perfil esta completo y validado.
5. El Jefe de Logistica o el administrador asigna al colaborador a los eventos segun disponibilidad y rol.

### 5.2 Calendario de postulaciones — SlotEvento [CAMBIO TO-BE v2.1]

> **[CAMBIO TO-BE v2.1 — Nueva funcionalidad: Calendario de Postulaciones Bidireccional]** El modulo de personal externo se expande con un calendario de postulaciones que permite al administrador publicar slots de eventos y a los candidatos autenticados postularse directamente. Ambos flujos (convocatoria masiva y calendario) coexisten y no son excluyentes.

#### Funcionalidad del administrador

1. El administrador publica `SlotEvento` en el calendario. Cada slot define:
   - Rol requerido
   - Capacidad (numero de personas necesarias para ese rol en el slot)
   - Hora de llegada y hora de salida
   - Descripcion del slot
   - Tipo de cobertura: evento especifico o dia completo en una localidad
   - Fecha o evento especifico al que aplica
2. El administrador puede **duplicar** un SlotEvento existente, copiando todos sus datos a una nueva fecha o evento, para evitar repeticion de configuracion.
3. El administrador revisa las postulaciones recibidas por slot y acepta o rechaza cada una individualmente.
4. Al aceptar una postulacion, el sistema crea automaticamente la `AsignacionPersonalEvento` correspondiente, con origen `postulacion_slot`.
5. Antes de aceptar, si el candidato tiene cruce de horario con otra AsignacionPersonalEvento registrada, el sistema alerta al administrador (sin bloquear la accion).

#### Estados del SlotEvento

| Estado | Descripcion |
|---|---|
| `Disponible` | Hay plazas libres; el slot acepta nuevas postulaciones. |
| `Completo` | Se alcanzo la capacidad maxima; puede haber postulaciones pendientes de revision. |
| `Cerrado` | El administrador cerro el slot a nuevas postulaciones. |
| `Cancelado` | El evento fue cancelado. |

#### Funcionalidad del candidato

1. El candidato autenticado accede al calendario de slots disponibles.
2. Puede postularse a un slot especifico directamente desde el calendario.
3. El sistema muestra al candidato el estado de su postulacion: `postulado`, `aceptado`, `rechazado`, `cancelado_por_candidato`.
4. Al aceptar o rechazar su postulacion, el candidato recibe notificacion por email/SMS.

#### Actualizacion periodica del perfil del candidato

- El sistema invita a los candidatos a actualizar su perfil **una vez al ano** mediante campana automatica.
- El candidato puede actualizar su perfil en cualquier momento si lo requiere.
- El sistema registra `fecha_ultima_actualizacion_perfil` por candidato.
- El administrador puede filtrar candidatos con perfil desactualizado (mas de 12 meses sin actualizar).
- Los mismos 6 campos obligatorios del perfil aplican para la actualizacion.

**Sin cambios en:** la exigencia de datos completos antes de la asignacion (RN-37), los campos obligatorios del perfil, la logica de disponibilidad.

---

## 6. Sub-proceso: Cotizador de Paquetes (To-Be) [CAMBIO TO-BE v2.1]

> **[CAMBIO TO-BE v2.1 — Nuevo sub-proceso: Cotizador de Paquetes]** Se incorpora un modulo de cotizacion formal como herramienta del comercial durante la fase de prospeccion y negociacion (Etapas 0–1). Es opcional: la creacion de una Promocion sin cotizacion previa sigue siendo valida y el flujo actual no se rompe.

### Flujo de cotizacion

1. El comercial selecciona la institucion educativa destinataria de la cotizacion. Puede ser una institucion ya registrada en el sistema o un prospecto aun no formalizado.
2. El comercial selecciona un paquete base como punto de partida (opcional). Si no selecciona ninguno, parte de una lista de items en blanco.
3. El comercial agrega o quita items del catalogo para personalizar la cotizacion.
4. El comercial define el precio por estudiante y el numero estimado de estudiantes.
5. El sistema calcula el total estimado de la cotizacion.
6. El comercial genera un PDF de cotizacion desde el sistema.
7. La cotizacion sigue un ciclo de vida con los siguientes estados:

| Estado | Descripcion |
|---|---|
| `borrador` | Cotizacion en elaboracion; no enviada al cliente. |
| `enviada` | Cotizacion enviada al cliente; no modificable. |
| `aceptada` | El cliente acepto la cotizacion. |
| `rechazada` | El cliente rechazo la cotizacion. |
| `vencida` | La cotizacion expiro sin respuesta. |
| `convertida_a_promocion` | La cotizacion fue convertida en Promocion formal. |

8. Cuando la negociacion se cierra positivamente, el comercial ejecuta la accion **"Convertir en Promocion"**. El sistema crea la Promocion y el `PaquetePromocion` (snapshot) usando los items y precios de la cotizacion, y establece el vinculo bidireccional entre la cotizacion y la nueva Promocion.

### Reglas del cotizador

- Los precios de items en la cotizacion son un snapshot al momento de cotizar. Cambios posteriores en el catalogo no afectan cotizaciones vigentes.
- Una cotizacion no es modificable una vez enviada al cliente; debe duplicarse como nueva cotizacion.
- Una institucion puede tener multiples cotizaciones activas simultaneas (distintas negociaciones o grados).
- La creacion de Promocion sin cotizacion previa sigue siendo valida; el flujo actual no se rompe.
- El Gerente tiene visibilidad de todas las cotizaciones activas desde su dashboard.
- El formato exacto del PDF de cotizacion se define durante la implementacion tecnica y queda fuera del alcance de este documento de proceso.

> **Justificacion:** La ausencia de un cotizador formal impide al gerente tener visibilidad de las negociaciones en curso, los margenes aplicados y la consistencia de precios entre comerciales. El cotizador elimina la Muda de procesamiento (cotizaciones manuales en Word/Excel) y agrega trazabilidad al pipeline comercial.

---

## 7. Flujo por Etapas — Proceso To-Be

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

   > **[CAMBIO TO-BE v2.1 — Panel bulk para vinculacion de Promociones]** Cuando una institucion tiene multiples configuraciones de grado (ej. Bachillerato Diurno + Bachillerato Nocturno) con el mismo paquete de items y solo variacion de precio, el comercial puede crear todas las Promociones en un solo paso mediante el panel bulk:
   >
   > - El comercial selecciona el paquete base y lo aplica a multiples configuraciones (grado + jornada) simultaneamente.
   > - El precio puede ser el mismo para todas las configuraciones o diferente por configuracion (campo editable individualmente en la interfaz).
   > - El sistema crea un snapshot independiente (`PaquetePromocion`) por cada Promocion creada en el bulk, nunca compartido entre Promociones aunque los items sean identicos.
   > - La creacion es atomica: si alguna Promocion falla la validacion (precio invalido, combinacion duplicada, etc.), el sistema muestra el error y no crea ninguna hasta que se corrijan los datos.
   > - Antes de confirmar, el sistema muestra al comercial un resumen de las N Promociones que se van a crear con sus precios individuales.
   >
   > **Justificacion:** Elimina Muda de movimiento al crear varias Promociones con los mismos items; hoy el comercial repite el mismo formulario N veces para una misma institucion con multiples grados.

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

> **[CAMBIO TO-BE v2.1 — Correccion del flujo de toga]** El orden correcto del flujo es: medicion fisica ANTES del pago. El vestidor NO registra nada en el sistema. El cajero es el unico actor que registra la talla, en el mismo momento en que registra el pago. El comprobante impreso deja de ser el mecanismo de autorizacion al fotografo.

1. El cajero abre sesion de cobro en el sistema (multi-cajero habilitado; cada cajero opera con sus propias credenciales).
2. **El estudiante se acerca PRIMERO al vestidor (antes de ir al cajero).**
3. El vestidor mide y ajusta fisicamente la toga del estudiante. El vestidor NO registra ninguna talla en el sistema. Comunica la talla al estudiante (verbalmente o en papel que el estudiante lleva al cajero).
4. El estudiante se acerca al cajero y proporciona su nombre o numero de documento.
5. El cajero busca al estudiante en el sistema por Promocion + nombre o numero de documento.
6. El cajero verifica el precio del paquete (ya definido desde Etapa 1; el monto maximo esta visible en el sistema).
7. El estudiante paga. El pago minimo por defecto es el 50% del valor total del paquete, en efectivo. Si el cajero cobra menos del 50%, debe registrar una justificacion escrita en el campo de comentarios del registro de pago antes de confirmar la transaccion. El campo de comentarios tambien puede usarse para otras anotaciones del cajero.

   > **Sin cambio funcional** respecto al as-is en este paso. La flexibilidad del pago minimo y la justificacion escrita obligatoria son controles adecuados que no presentan Muda: la justificacion protege a Hersa de excepciones no documentadas y da trazabilidad al gerente.

8. **El cajero registra la talla de toga del estudiante en el sistema en el mismo acto en que registra el pago.** El cajero es el unico actor que hace este registro; el vestidor no registra nada.
9. El sistema registra el pago, la talla y actualiza el saldo del estudiante en tiempo real.
10. El sistema envia notificacion al estudiante y al padre/acudiente por email y SMS con el valor pagado y el saldo pendiente.
11. El sistema habilita al estudiante en el registro de cobro como "pagado — autorizado para toma".
12. **[CAMBIO TO-BE]** El fotografo consulta en el sistema el estado del estudiante antes de proceder con la toma. Si el sistema confirma "autorizado para toma", el fotografo procede. El comprobante impreso es opcional y queda disponible como respaldo para el estudiante, pero deja de ser el mecanismo de control de autorizacion.

    > **Justificacion:** Eliminar la dependencia del comprobante fisico como unico habilitador reduce el riesgo de interrupcion por extravio del papel y agiliza el flujo en situaciones de alta rotacion de estudiantes.

13. El fotografo realiza la toma fotografica al estudiante.
14. Se recolectan las preferencias del grupo: colores de bordes, estolas y detalles de la ceremonia.
15. **[CAMBIO TO-BE — Paralelizacion]** El proceso de retoque puede iniciar con las fotos ya tomadas del dia mientras continuan las tomas del mismo dia con otros estudiantes. No es necesario esperar al cierre total del dia para iniciar el retoque.

    > **Justificacion:** El retoque no depende de las tomas que aun no se han realizado; iniciar en paralelo reduce el tiempo total de produccion fotografica.

16. **[CAMBIO TO-BE]** Al cierre de la sesion de cobro del cajero, el sistema genera automaticamente el reporte de cierre de caja (total cobrado, detalle por estudiante, saldos pendientes, add-ons, pagos con justificacion de excepcion) y lo pone disponible para el gerente y el administrador. El cajero no realiza un proceso manual de cierre de caja.

    > **Justificacion:** El sistema ya registra cada transaccion en tiempo real; recalcular y reportar manualmente es reproceso sin valor (Muda). La automatizacion del reporte elimina discrepancias por error humano, libera tiempo del cajero, y consolida en el reporte los pagos menores al 50% con sus justificaciones para revision del gerente.

**Regla — Estudiante ausente ese dia:** Si el estudiante no paga en la sesion de toma fotografica (ausente), la talla no queda registrada. Se registra en la siguiente sesion donde el estudiante pague (Prom o Varios), momento en que el cajero registra la talla junto con el pago.

**Add-ons disponibles:** Sin cambio (foto familiar $20.000, foto grupal con acompanante, poster 50x70 $50.000 COP).

**Descuentos autorizados:** Sin cambio en la regla (requieren autorizacion del gerente u otro usuario con permisos equivalentes). El gerente registra el descuento en el sistema con anticipacion o en el momento; el cajero lo encuentra ya aplicado.

> **[DECISION CERRADA: Delegacion de descuentos]** Solo usuarios con permisos explícitos en el sistema pueden autorizar descuentos. No hay delegacion a cajero ni comercial. El flujo de autorizacion del gerente permanece sin cambio.

#### Sub-proceso: Control de ausentes

Sin cambio estructural. El cierre activo del grupo por el cajero/coordinador sigue siendo el prerequisito para el cruce de ausentes por el sistema. El descuento de $10.000 COP a ausentes se aplica automaticamente tras el cruce.

#### Sub-proceso: Retoque y empaquetado

El fotografo inicia el retoque en paralelo con las tomas del dia (ver paso 15 arriba). El empaquetado del pedido fisico por estudiante sigue igual.

---

### Etapa 4 — Actividad Prom

**Actores principales:** Comercial, Planillador / Cajero, Coordinador de grado, Meseros (temporal externo), Proveedor de Alimentos (externo)

Realizada en Casa Campestre Hersa.

1. Se realiza el ensayo de grado en este dia.
2. El cajero cobra el saldo pendiente a los estudiantes que aun adeudan.
3. El comercial o coordinador distribuye las tarjetas de invitacion (codigos QR de un solo uso) a cada graduando.
4. Los estudiantes que no asistieron a la toma fotografica original (Etapa 3) pueden tomarse las fotos en este dia. El cajero registra la talla de toga de estos estudiantes al momento del pago (si aun no esta registrada).
5. Se provee servicio de alimentos y bebidas a cargo del proveedor externo "Alimentos".

> **[CAMBIO TO-BE]** El cierre de caja al final del Prom sigue el mismo patron automatizado definido en Etapa 3: el sistema genera el reporte de cierre al cerrar la sesion de cobro del cajero.

> **[CAMBIO TO-BE — Asignacion anticipada]** La asignacion de meseros y del proveedor de alimentos para la Actividad Prom debe registrarse en el sistema con anticipacion minima de 48 horas, siguiendo el patron unificado de anticipacion de personal.

> **Justificacion:** Unifica el patron de anticipacion de 48 horas para todos los eventos que requieren personal temporal o proveedores externos, eliminando la Muda de coordinacion urgente en el dia del evento.

#### Sub-proceso: Obsequio de boletas adicionales [CAMBIO TO-BE v2.1]

> **[CAMBIO TO-BE v2.1 — Obsequio de boletas adicionales con trazabilidad]** Cuando quedan tarjetas de invitacion sobrantes al final del dia del Prom, el Gerente (o usuario con permisos equivalentes) puede autorizar el obsequio de boletas adicionales mediante el siguiente flujo:

1. El Gerente selecciona en el sistema el tipo de obsequio:
   - **Individual:** lista especifica de estudiantes que recibiran boletas adicionales.
   - **General:** todos los estudiantes de la Promocion presentes ese dia.
2. El sistema genera los nuevos tokens QR con origen `obsequio_prom` (distinto de `negociacion_inicial`).
3. El sistema registra por estudiante: las boletas adicionales recibidas, el autorizador, y la fecha y hora de emision.
4. La validacion de cupo negociado (cantidad de tarjetas pactada en Etapa 1) NO se aplica a las boletas de obsequio; son adicionales por sobre el cupo.
5. **Alerta de aforo:** Si la sede tiene aforo registrado en el sistema, el sistema alerta (sin bloquear) cuando la suma de boletas activas (negociacion_inicial + obsequio_prom) supere el aforo de la sede.

**Reglas:**
- La autorizacion del obsequio es exclusiva del Gerente o usuario con permisos equivalentes.
- Las tarjetas de obsequio siguen siendo de un solo uso; se invalidan al escanear en la entrada del grado.
- Las tarjetas sobrantes (no obsequiadas) nunca se venden.

> **Justificacion:** El obsequio informal actual no deja registro de quien recibio boletas adicionales ni de quien autorizo. La formalizacion agrega trazabilidad y control de aforo sin eliminar la flexibilidad del gerente.

**Sin cambios en:** las reglas de ausentes, alcohol, transporte.

---

### Etapa 5 — Toma Fotografica Varios

**Actores principales:** Fotografo, Planillador / Cajero

Sin cambios estructurales. Los tres casos (adicional, retoma, recuperacion de ausentes) se mantienen. El sub-proceso de cobro sigue el mismo flujo optimizado definido en Etapa 3: autorizacion por sistema, registro de talla al momento del pago para estudiantes que aun no la tienen registrada, reporte de cierre automatico.

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

Sin cambio. La cancelacion masiva e inmediata de todos los QR del estudiante al confirmar no-graduacion se ejecuta ese mismo dia. Este es el unico acto que ocurre el dia del grado en relacion a la no-graduacion.

#### Regla — Reintegro por reprobacion (proceso asincrono) [CAMBIO TO-BE v2.1]

> **[CAMBIO TO-BE v2.1 — Reintegro como entidad asincrona: SolicitudReembolso]** El reintegro (reembolso + entrega de paquete) NO ocurre el dia del grado. La cancelacion masiva de QR si ocurre ese dia. El proceso de reintegro es posterior y se gestiona como una entidad propia con ciclo de vida.

**Estados de SolicitudReembolso:** `solicitado` → `en_revision` → `aprobado` → `procesado` | `rechazado`

**Flujo:**

1. El estudiante o representante (con carta de autorizacion y copias de documentos) inicia la solicitud en el sistema en cualquier momento posterior al dia del grado.
2. El estudiante o representante sube el comprobante de no-graduacion en el sistema (acepta PDF o imagen).
3. La solicitud entra en estado `solicitado` y el Gerente recibe notificacion automatica del sistema.
4. El Gerente revisa la documentacion y aprueba o rechaza la solicitud en el sistema.
5. Al aprobar: el sistema calcula el monto de reembolso (50% del total pagado) y registra la `SolicitudReembolso` en estado `aprobado`.
6. Al procesar el pago efectivo del reembolso: el Gerente o administrador marca la solicitud como `procesado`, registrando la referencia del comprobante de transferencia o pago realizado.
7. El paquete fotografico y el album se entregan al estudiante o representante. La entrega se registra en el sistema con timestamp (inmutable).

**Reglas:**
- Solo el Gerente puede aprobar solicitudes de reembolso.
- Sin SLA definido aun; pendiente de definicion por parte del negocio.
- El representante debe presentar carta de autorizacion y copias de documentos del estudiante para iniciar el proceso.

> **Justificacion:** El proceso actual de reintegro es informal y sin trazabilidad. La entidad `SolicitudReembolso` con estados explícitos permite al Gerente gestionar multiples solicitudes de forma ordenada y auditada, y garantiza que la entrega del paquete quede registrada con timestamp.

---

## 8. Sub-proceso Transversal — Asignacion de Personal a Eventos (To-Be)

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

## 9. Sub-proceso Transversal — Notificacion de Cambios a Colaboradores (To-Be)

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

## 10. Sub-proceso Transversal — Calendario de Eventos para Colaboradores (To-Be)

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

## 11. Sub-proceso Transversal — Gestion de Inconformidades (To-Be)

Aplica en cualquier etapa del proceso operativo.

### Registro

Sin cambio en el actor y el formulario. Cualquier usuario interno con acceso puede registrar. El formulario con categorias predefinidas (foto / cobro / entrega / protocolo) y campo libre se mantiene. El registro queda asociado a la Promocion y al estudiante. Al momento del registro, el sistema notifica automaticamente al gerente.

> **[CAMBIO TO-BE]** Al registrar la inconformidad, el sistema envia adicionalmente una notificacion automatica al afectado (estudiante o padre) confirmando la recepcion de su caso, con un numero o referencia de seguimiento.

> **Justificacion:** El cliente queda hoy sin confirmacion formal de que su reclamo fue recibido. La notificacion de acuse de recibo reduce la ansiedad del cliente y las consultas repetidas al personal de Hersa.

### Gestion y cierre

1. El gerente recibe la notificacion automatica del sistema.
2. El gerente investiga y gestiona la inconformidad.
3. El gerente contacta al afectado (WhatsApp o llamada) para resolver. El contacto directo se mantiene.
4. El gerente cierra la inconformidad en el sistema.
5. **[CAMBIO TO-BE]** Al cierre de la inconformidad, el sistema envia automaticamente una notificacion al afectado informando que el caso fue resuelto, con el resumen de la resolucion registrado por el gerente.

> **Justificacion:** Hoy el cliente no recibe ninguna notificacion automatica en ningun punto del ciclo. Esto obliga al gerente a ser el unico canal de comunicacion en ambos extremos. La notificacion automatica de cierre estandariza la experiencia y reduce la carga manual del gerente.

### Reglas [CAMBIO TO-BE v2.1 — SLA configurable]

> **[CAMBIO TO-BE v2.1 — SLA de Inconformidades configurable]** El SLA y la alerta de escalacion dejan de ser valores fijos y pasan a ser parametros gestionados desde la `ConfiguracionSistema`.

- **SLA de resolucion:** 3 dias calendario desde el registro (antes: 48 horas habiles). Configurable desde `ConfiguracionSistema` con clave `inconformidad.sla_dias`.
- **Alerta de escalacion interna:** configurable desde `ConfiguracionSistema` con clave `inconformidad.alerta_horas_antes_vencimiento`. Expresa cuantas horas antes del vencimiento del SLA se dispara la alerta interna. El administrador puede ajustar este valor sin intervencion tecnica.
- **Snapshot del SLA:** Cada `Inconformidad` registra al momento de su creacion el valor de SLA vigente (`sla_aplicado`), para que cambios futuros en la configuracion no alteren metricas historicas.
- El cierre sigue siendo exclusivo del gerente. Sin cambio.
- **[CAMBIO TO-BE]** El sistema registra el historial completo de notificaciones al afectado (acuse de recibo, cierre) con marcas de tiempo, para trazabilidad y auditoria.

> **Justificacion:** Un SLA de 3 dias calendario es mas legible y predecible para el cliente que 48 horas habiles. La configurabilidad permite ajustar el compromiso de servicio sin necesidad de despliegue tecnico.

### ConfiguracionSistema [CAMBIO TO-BE v2.1]

El sistema implementa una tabla `ConfiguracionSistema` (key-value tipada) que almacena parametros globales ajustables por el administrador sin intervencion tecnica. Incluye al menos:

| Clave | Tipo | Default | Descripcion |
|---|---|---|---|
| `inconformidad.sla_dias` | Entero | 3 | Dias calendario para la resolucion de inconformidades. |
| `inconformidad.alerta_horas_antes_vencimiento` | Entero | Configurable | Horas antes del vencimiento del SLA en que se dispara la alerta interna de escalacion. |

---

## 12. Puntos de Decision

| ID | Etapa | Condicion | Actor decisor | Rama afirmativa | Rama negativa |
|---|---|---|---|---|---|
| D1 | Etapa 1 | La institucion selecciona a Hersa para la Promocion | Director / representantes institucionales | Continua la vinculacion de la Promocion | El proceso termina para esa Promocion |
| D2 | Etapa 3 | El estudiante asistio a la toma fotografica | Sistema (cruce tras cierre activo de grupo) | Se registra pago, talla y se realiza la toma | Descuento $10.000 COP; se agenda para Varios o Prom; talla se registra en la sesion donde el estudiante pague |
| D3 | Etapa 3 | Se solicita descuento de paquete | Gerente (o usuario con permisos equivalentes) | Descuento aplicado con registro de autorizacion | Sin descuento |
| D4 | Etapa 3 | Discrepancia entre comprobantes de pago | Gerente | Gerente resuelve; se registra la resolucion en el sistema | Sin accion adicional |
| D5 | Etapa 4 | El estudiante esta ausente en el Prom | Condicion de hecho | Companero retira materiales con carta de autorizacion | El estudiante retira sus materiales directamente |
| D6 | Etapa 6 | El estudiante tiene saldo pendiente en el dia de grado | Sistema (validacion automatica, pre-cargada) | Cajero cobra el saldo antes de la entrega | Coordinador entrega el paquete directamente |
| D7 | Etapa 6 | El estudiante se gradua | Hecho academico de la institucion | Proceso normal de entrega y acceso de familiares | Cancelacion masiva de QR ese dia; tramite de reembolso se inicia como SolicitudReembolso asincrona posterior |
| D8 | Cualquier etapa | Se registra una inconformidad | Usuario interno con acceso | Sistema notifica al gerente y al afectado; gerente gestiona y cierra dentro del SLA configurado | Sin accion |
| D9 | Etapas 3, 5, 6 | El cajero tiene permisos especiales en el sistema | Administrador del sistema (configuracion previa) | Puede abrir sesion de cobro en cualquier momento | Solo puede operar en etapas habilitadas para esa Promocion |
| D10 | Etapa 6 | Estudiante con saldo pendiente 24-48 h antes del grado | Sistema | Notificacion automatica al estudiante/padre con saldo y fecha limite | Sin accion adicional si saldo = 0 |
| D11 | Etapa 1b | Se necesita una segunda Cena de Profesores en el mismo ciclo de Promocion | Administrador | El sistema permite registrar la cena adicional con justificacion | Solo se registra la cena unica del ciclo |
| D12 | Etapa 3 | El cajero cobra menos del 50% del paquete | Cajero | Se registra el pago con justificacion escrita obligatoria en campo de comentarios antes de confirmar | Se registra el pago normalmente sin comentario adicional |
| D13 | Etapa 4 | Quedan tarjetas de invitacion sobrantes al final del Prom | Gerente (decision discrecional) | Autoriza obsequio individual o general; el sistema genera QR con origen obsequio_prom y alerta si supera aforo | No se obsequian; las tarjetas sobrantes no se venden |
| D14 | Etapa 6 | El estudiante o representante inicia solicitud de reembolso por no-graduacion | Gerente (revision) | Aprueba la SolicitudReembolso; el sistema calcula el 50% y queda en estado aprobado | Rechaza la solicitud con registro en el sistema |
| D15 | Etapa 1 | La institucion tiene multiples configuraciones de grado con el mismo paquete | Comercial | Usa el panel bulk para crear N Promociones en un paso atomico | Crea las Promociones de forma individual (flujo existente) |
| D16 | Etapas 0–1 | El comercial decide cotizar antes de formalizar la Promocion | Comercial | Crea cotizacion en el sistema; puede convertirla en Promocion al cerrar la negociacion | Crea la Promocion directamente sin cotizacion previa (flujo valido) |
| D17 | EP-09 | El administrador publica un SlotEvento | Candidato externo (postulacion) | El candidato se postula; el administrador revisa y acepta o rechaza | El slot queda sin postulantes o se cierra manualmente |
| D18 | EP-09 | Al aceptar una postulacion, el candidato tiene cruce de horario | Administrador (decision final) | Acepta con conocimiento del conflicto (alerta informativa) | Rechaza la postulacion para ese slot |

---

## 13. Tabla de Cambios

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
| Contacto masivo a candidatos de personal externo (Sub-proceso EP-09) | El contacto candidato por candidato es Muda de movimiento cuando el pool es grande | Reduccion del tiempo de convocatoria de personal en temporada de alta demanda |
| Trazabilidad del origen de asignaciones bulk (Sub-proceso transversal 8) | Sin registro del origen, modificar una regla bulk requiere revision evento por evento | Eliminacion de busqueda manual de eventos afectados por una regla bulk |
| Resumen previo al envio de notificaciones a colaboradores (Sub-proceso transversal 9) | El envio masivo sin confirmacion previa es un riesgo de defecto (envios erroneos) | Reduccion de errores en notificaciones masivas a colaboradores |
| Indicador visual de cambio reciente en calendario de colaboradores (Sub-proceso transversal 10) | Sin indicador, el colaborador debe recordar que evento cambio al recibir la notificacion | Reduccion del tiempo de identificacion del cambio; mejora de conciencia situacional del colaborador |
| Unidad operativa actualizada de "Institucion" a "Promocion" en todo el proceso | El as-is v1.4 establece que la unidad operativa central es la Promocion, no la institucion plana | Alineacion del to-be con el modelo de dominio correcto |
| **[v2.1]** Panel bulk para creacion de multiples Promociones en un paso (Etapa 1) | Elimina Muda de movimiento al crear varias Promociones con los mismos items; hoy el comercial repite el mismo formulario N veces | Reduccion del tiempo de vinculacion cuando una institucion tiene multiples configuraciones de grado; creacion atomica elimina estados intermedios inconsistentes |
| **[v2.1]** Correccion del flujo de toga: medicion ANTES del pago; cajero registra la talla (Etapa 3) | El as-is v1.4 documenta el orden correcto: vestidor mide primero, cajero registra talla y pago en el mismo acto; el to-be v2.0 tenia el orden incorrecto | Flujo operativo correcto que evita que el cajero deba registrar una talla sin haberla recibido |
| **[v2.1]** Obsequio de boletas adicionales con estados y trazabilidad (Etapa 4) | El obsequio informal actual no deja registro de autorizacion, destinatarios ni alerta de aforo | Trazabilidad completa del obsequio; control de aforo sin bloquear la decision del gerente |
| **[v2.1]** Reintegro como entidad asincrona SolicitudReembolso con ciclo de vida (Etapa 6) | El proceso informal actual de reintegro no tiene estados ni trazabilidad; riesgo de perdida de solicitudes | Gestion ordenada y auditable de reintegros; el Gerente puede gestionar multiples solicitudes simultaneas con visibilidad de estado |
| **[v2.1]** SLA de inconformidades configurable via ConfiguracionSistema (Sub-proceso 11) | SLA fijo hardcodeado no permite ajuste sin intervencion tecnica; 3 dias calendario es mas predecible para el cliente | Flexibilidad para ajustar el SLA sin despliegue tecnico; snapshot de sla_aplicado protege metricas historicas |
| **[v2.1]** Calendario de postulaciones SlotEvento para personal externo (Sub-proceso EP-09) | Sin calendario, los candidatos no pueden ver eventos disponibles ni postularse sin ser contactados primero | Reduccion de carga del administrador en convocatoria; los candidatos se auto-gestionan; trazabilidad de postulaciones y asignaciones |
| **[v2.1]** Nuevo sub-proceso Cotizador de Paquetes (pre-Etapa 1) | La ausencia de cotizacion formal impide visibilidad del gerente sobre negociaciones en curso y consistencia de precios | Trazabilidad del pipeline comercial; eliminacion de Muda de procesamiento (Word/Excel); conversion directa a Promocion con snapshot de precios |

---

## 14. Pasos Eliminados

| Paso As-Is | Etapa | Principio Lean Aplicado |
|---|---|---|
| El cajero realiza el cierre de caja manualmente al final del dia (Etapas 3, 4, 5, 6) | Transversal | Muda de reproceso: el sistema ya registra cada transaccion; recalcular manualmente no agrega valor |
| El comercial notifica cambios de fecha a clientes por WhatsApp de forma manual (RN-31) | Transversal | Muda de movimiento y espera: el sistema tiene los contactos y puede emitir la notificacion directamente |
| El estudiante entrega comprobante impreso al fotografo como unico mecanismo de autorizacion (Etapa 3) | Etapa 3 | Muda de defecto potencial: el papel como unico habilitador genera interrupciones cuando se extravía; el sistema es la fuente de verdad |
| La dotacion de personal se decide "en el momento" del evento sin registro previo (RN-25) | Etapa 6, 1b, 4 | Muda de espera y riesgo operativo: la decision tardia bloquea la planificacion cuando hay eventos simultaneos |
| El gerente es el unico canal de comunicacion con el afectado en todo el ciclo de inconformidades | Sub-proceso transversal | Muda de movimiento: el gerente ejecuta trabajo de transmision que el sistema puede hacer; el gerente debe agregar valor en la resolucion, no en la transmision |
| El administrador contacta candidatos de personal externo uno por uno (Sub-proceso as-is) | Sub-proceso EP-09 | Muda de movimiento: el contacto individual a un pool grande es innecesariamente secuencial |
| **[v2.1]** El comercial crea N Promociones con el mismo paquete repitiendo el formulario N veces | Etapa 1 | Muda de movimiento: repeticion del mismo formulario para variaciones de grado con items identicos; el panel bulk colapsa este trabajo en un solo paso atomico |
| **[v2.1]** El proceso de reintegro informal sin estados ni trazabilidad (Etapa 6 as-is) | Etapa 6 | Muda de procesamiento: la gestion manual sin estados genera riesgo de perdida de solicitudes y ausencia de auditoria |
| **[v2.1]** El administrador contacta candidatos individualmente para convocatoria de slots especificos | Sub-proceso EP-09 | Muda de movimiento: el candidato puede ver y postularse a slots sin necesidad de ser contactado primero |
| **[v2.1]** Cotizacion en Word/Excel sin trazabilidad en el sistema (Seccion 13 as-is) | Pre-Etapa 1 | Muda de procesamiento y defecto: la cotizacion manual es inconsistente entre comerciales y no deja trazabilidad para el gerente |

---

## 15. Clasificacion: Pasos Automatizables vs. Manuales

| Paso | Clasificacion | Comportamiento Deseado (sin nombrar tecnologia) |
|---|---|---|
| Notificacion de registro y cambio de fecha a contactos de la Promocion | Automatizable | Al registrar o actualizar una fecha en el sistema, el sistema envia sin intervencion humana un mensaje informativo a todos los contactos vinculados a esa Promocion |
| Reporte de cierre de caja al cerrar sesion de cobro | Automatizable | Al cerrar la sesion de cobro, el sistema consolida todas las transacciones y genera un reporte estructurado (total cobrado, detalle por estudiante, saldos pendientes, add-ons, pagos con justificacion de excepcion), disponible para gerente y administrador |
| Autorizacion de fotografo por estado de pago en sistema | Automatizable | El sistema expone en tiempo real el estado de cada estudiante (autorizado / pendiente) para que el fotografo consulte sin requerir un artefacto fisico externo |
| Cruce de ausentes tras cierre activo del grupo | Automatizable | Sin cambio respecto al as-is; ya automatizado |
| Notificacion de descuento $10.000 a ausente | Automatizable | El sistema notifica automaticamente al estudiante identificado como ausente tras el cruce |
| Notificacion de acuse de recibo al afectado al registrar inconformidad | Automatizable | Al guardar el registro de una inconformidad, el sistema envia sin intervencion humana un mensaje al afectado con numero de referencia y plazo de resolucion |
| Notificacion de cierre de inconformidad al afectado | Automatizable | Al cerrar la inconformidad el gerente, el sistema envia sin intervencion humana un mensaje al afectado con el resumen de la resolucion |
| Alerta de escalacion interna segun ConfiguracionSistema | Automatizable | El sistema evalua la fecha de creacion de cada inconformidad abierta contra el SLA vigente configurado y dispara la alerta interna el numero de horas configurado antes del vencimiento |
| Pre-lista de estudiantes con saldo pendiente (24 h antes del grado) | Automatizable | El sistema genera y entrega automaticamente la lista a los coordinadores y cajeros asignados al evento |
| Notificacion anticipada de saldo a estudiante/padre (24-48 h antes del grado) | Automatizable | El sistema identifica a los estudiantes con saldo pendiente y les envia un recordatorio con el monto y la fecha limite de pago |
| Registro de pagos y actualizacion de saldo por estudiante | Automatizable | Sin cambio respecto al as-is; ya automatizado |
| Invalidacion de QR al escanear y cancelacion masiva por no-graduacion | Automatizable | Sin cambio respecto al as-is; ya automatizado |
| Creacion de snapshot de paquete al modificar para una Promocion | Automatizable | Al guardar cambios sobre un paquete en el contexto de una Promocion, el sistema crea la copia interna sin intervencion adicional del comercial |
| Envio masivo a candidatos de personal externo | Automatizable | El administrador selecciona el rol y el periodo; el sistema envia el mensaje con el enlace de postulacion a todos los candidatos del pool de forma simultanea |
| Envio de notificaciones a colaboradores | Automatizable (a solicitud manual del administrador) | El sistema ejecuta el envio al confirmar el administrador; el sistema impide duplicados por defecto y muestra resumen previo al envio |
| Registro de trazabilidad del origen de asignaciones bulk | Automatizable | El sistema registra automaticamente si una asignacion proviene de una regla bulk o de una asignacion individual, sin accion adicional del usuario |
| **[v2.1]** Creacion atomica de N Promociones via panel bulk | Automatizable (a solicitud del comercial) | Al confirmar el panel bulk, el sistema crea todas las Promociones y sus snapshots en una sola transaccion atomica; si alguna falla, no crea ninguna |
| **[v2.1]** Generacion de QR con origen obsequio_prom al autorizar obsequio | Automatizable | Al autorizar el obsequio, el sistema genera los tokens QR correspondientes y los registra con el autorizador, la fecha y el origen |
| **[v2.1]** Alerta de aforo al superar capacidad con boletas activas | Automatizable | El sistema evalua la suma de boletas activas (negociacion_inicial + obsequio_prom) contra el aforo de la sede y emite alerta informativa sin bloquear |
| **[v2.1]** Notificacion al Gerente al crear SolicitudReembolso | Automatizable | Al crear la solicitud, el sistema notifica al Gerente sin intervencion humana adicional |
| **[v2.1]** Calculo del monto de reembolso (50% del total pagado) | Automatizable | Al aprobar la SolicitudReembolso, el sistema calcula automaticamente el monto basandose en el total pagado por el estudiante |
| **[v2.1]** Campana anual de actualizacion de perfil de candidato | Automatizable | El sistema identifica candidatos cuya fecha_ultima_actualizacion_perfil supera los 12 meses y les envia la invitacion a actualizar su perfil |
| **[v2.1]** Actualizacion de estado del SlotEvento segun postulaciones | Automatizable | El sistema cambia el estado del slot a Completo cuando se alcanza la capacidad, sin intervencion del administrador |
| **[v2.1]** Calculo del total estimado en la cotizacion | Automatizable | Al definir precio por estudiante y numero estimado, el sistema calcula el total sin intervencion adicional |
| **[v2.1]** Creacion de Promocion y snapshot al convertir cotizacion | Automatizable | Al ejecutar "Convertir en Promocion", el sistema crea la Promocion, el PaquetePromocion con snapshot de precios y el vinculo bidireccional sin pasos adicionales del comercial |
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
| **[v2.1]** Medicion fisica de toga por el vestidor | Manual (por naturaleza) | Requiere intervencion fisica; el vestidor no registra datos; comunica la talla al estudiante |
| **[v2.1]** Autorizacion del obsequio de boletas adicionales | Manual (por naturaleza) | Requiere juicio discrecional del Gerente; la ejecucion tecnica (generacion de QR) es automatizada |
| **[v2.1]** Aprobacion y rechazo de SolicitudReembolso | Manual (por naturaleza) | Requiere revision de documentacion por el Gerente; el calculo del monto es automatico |
| **[v2.1]** Revision y aceptacion/rechazo de postulaciones a SlotEvento | Manual (por naturaleza) | El administrador revisa cada postulacion; la creacion de la AsignacionPersonalEvento al aceptar es automatica |
| **[v2.1]** Elaboracion de cotizacion (seleccion de items, precios) | Manual (herramienta) | El comercial define la composicion y el precio; el sistema calcula el total y genera el PDF |

---

## 16. Impacto Estimado

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
| Riesgo de contaminacion entre paquetes de distintas Promociones | Presente si el snapshot no se crea de forma sistematica | Eliminado; el snapshot es automatico al modificar un paquete para una Promocion | Integridad de datos garantizada entre Promociones |
| Riesgo de envios erroneos en notificaciones masivas a colaboradores | Presente sin confirmacion previa | Reducido; resumen previo al envio con confirmacion obligatoria del administrador | Reduccion de errores en comunicacion con personal |
| Visibilidad de cambios recientes en el calendario del colaborador | Ninguna; el colaborador debe cruzar la notificacion recibida con el calendario manualmente | Alta; indicador visual de "modificado recientemente" en el evento del calendario | Reduccion del tiempo de identificacion del evento modificado |
| **[v2.1]** Pasos para crear N Promociones con el mismo paquete | N repeticiones del mismo formulario (1 por Promocion) | 1 paso atomico via panel bulk | Reduccion de N-1 repeticiones de formulario; eliminacion del riesgo de inconsistencias entre Promociones creadas por separado |
| **[v2.1]** Trazabilidad del obsequio de boletas adicionales | Ninguna (proceso completamente informal) | Total: autorizador, destinatarios, fecha de emision, origen del QR, alerta de aforo | Eliminacion del riesgo de obsequios no autorizados o no registrados |
| **[v2.1]** Trazabilidad del proceso de reintegro por reprobacion | Ninguna (proceso completamente manual e informal) | Completa: estados explícitos, documentacion subida, calculo automatico del monto, timestamp de entrega | Eliminacion del riesgo de solicitudes perdidas; auditoria completa del proceso |
| **[v2.1]** Rigidez del SLA de inconformidades | Fijo en el codigo; requiere despliegue tecnico para cambiar | Configurable por el administrador sin intervencion tecnica; snapshot protege historico | Flexibilidad operativa; posibilidad de ajustar el compromiso de servicio segun temporada |
| **[v2.1]** Carga del administrador en convocatoria de personal por slots | Alta: contacto individual + negociacion por WhatsApp/llamada | Reducida: candidatos se auto-postulan; administrador solo revisa y acepta/rechaza | Reduccion estimada significativa del tiempo del administrador en convocatoria de personal en temporada alta |
| **[v2.1]** Visibilidad del Gerente sobre negociaciones comerciales en curso | Ninguna (cotizaciones en Word/Excel fuera del sistema) | Total: dashboard de cotizaciones activas con estados, montos y comercial responsable | Mejora de control gerencial sobre el pipeline comercial; posibilidad de detectar inconsistencias de precios entre comerciales |
| **[v2.1]** Tiempo para crear una cotizacion y convertirla en Promocion | Discontinuo: cotizacion manual + creacion de Promocion separada sin vinculo | Continuo: cotizacion en sistema → accion "Convertir en Promocion" → Promocion y snapshot creados automaticamente | Eliminacion de la brecha entre cotizacion y formalizacion; trazabilidad del origen de cada Promocion |

---

## 17. Lo Que No Cambia y Por Que

| Elemento preservado | Razon de preservacion |
|---|---|
| Pago minimo del 50% en efectivo como regla por defecto (RN-03) | Regla de negocio central; es el mecanismo de compromiso financiero del cliente. La flexibilidad de pago menor al 50% con justificacion escrita obligatoria ya fue incorporada en el as-is v1.3 y se preserva en el to-be. |
| Condicionamiento de entrega de paquete al pago completo el dia de grado (RN-04) | Regla de negocio sin excepcion; es la salvaguarda financiera de Hersa en el momento de mayor friccion. |
| Cierre activo del grupo por el cajero como prerequisito del cruce de ausentes (RN-20) | El cierre activo es una accion deliberada que marca el fin de un periodo de cobro para un grupo especifico; automatizarlo sin ese acto deliberado puede generar cruces prematuros. |
| Autorizacion de descuentos exclusiva del gerente o usuario con permisos equivalentes (RN-06) | Control financiero activo. El flujo de autorizacion permanece sin cambio. |
| Cierre de inconformidades exclusivo del gerente (RN-23) | Control de calidad y responsabilidad; el gerente es el representante de autoridad ante el cliente. |
| Contrato entre padre/acudiente y Hersa (RN-01) | Obligacion legal; la firma del acta en Etapa 1 es inamovible. [RIESGO LEGAL: cualquier cambio en el momento, formato o partes del contrato debe revisarse con asesor legal.] |
| Cancelacion masiva de QR por no-graduacion el dia del grado (RN-10) | Regla de acceso y control de aforo; es automatica en el sistema y no presenta desperdicio. El dia del grado es el momento correcto para esta accion. |
| Reembolso del 50% por no-graduacion (monto y condicion) (RN-10) | Regla de negocio establecida. Lo que cambia en v2.1 es el mecanismo de gestion (entidad asincrona), no el monto ni la condicion. |
| Buses salen en horario exacto sin excepciones (RN-11) | Restriccion operativa de coordinacion con terceros (transporte); no modificable desde el rediseno del proceso. |
| Ninos menores de 5 anos no admitidos; ninos de 5 o mas requieren ticket (RN-13) | Regla de seguridad y aforo con posible base en normativa de eventos. [RIESGO LEGAL: verificar si existe regulacion local aplicable a aforos de menores en eventos cerrados.] |
| Alcohol y sustancias prohibidos en todas las actividades de Hersa (RN-12) | Regla de orden publico y responsabilidad civil de Hersa como organizador. |
| Acceso externo sin registro de cuenta (RN-27) | Decision de experiencia de usuario ya tomada; reducir la friccion de acceso para padres y estudiantes es un objetivo declarado del negocio. |
| Auto-registro asincrono de estudiantes (via enlace o QR) | Mecanismo de reduccion de carga presencial ya implementado en la operacion; no presenta desperdicio. |
| Historial de incidentes por Promocion accesible solo a gerente y administrador (RN-29) | Control de acceso a informacion sensible para negociacion comercial. |
| Reuniones presenciales en Etapas 1 y 2 | Requieren presencia para generacion de confianza, firma de contrato y entrega de materiales de auto-registro. No son optimizables sin afectar la naturaleza comercial del servicio. |
| Mecanismo de autenticacion externa pendiente de definicion tecnica (Restriccion 7 del as-is) | Es una decision tecnica pendiente, no una decision de proceso; queda fuera del alcance de este documento. |
| Notificacion de cambios a colaboradores iniciada manualmente por el administrador (RN-38) | Decision de negocio confirmada: el proceso NO es automatico. El administrador retiene el control de cuando y a quien se notifica. |
| Techo de 1 Cena de Profesores por ciclo de Promocion con extension justificada (RN-39) | Regla de negocio que define el alcance del servicio incluido en el paquete; cambiarla requiere decision contractual. |
| Perfil completo obligatorio (6 campos) antes de asignar personal externo (RN-37) | Control de calidad del dato que protege la operacion; sin datos completos no es posible contactar ni identificar al colaborador. |
| Validacion de talla de toga entre toma fotografica y dia de grado (RN-07) | Restriccion operativa; el sistema fuerza el vinculo para garantizar la experiencia del cliente el dia del grado. |
| Justificacion escrita obligatoria del cajero al cobrar menos del 50% (RN-03) | Control financiero y de auditoria; la excepcion debe documentarse en el momento del cobro para trazabilidad. |
| El vestidor mide fisicamente pero no registra en el sistema (Etapa 3) | Division de responsabilidades correcta: el vestidor es un rol fisico sin acceso al sistema en el flujo de toma; la responsabilidad del registro de datos recae en el cajero, que es el actor del sistema. |
| Creacion de Promocion sin cotizacion previa (flujo directo) sigue siendo valida | El cotizador es una herramienta opcional de prospeccion; no se introduce friccion para las negociaciones que van directamente a vinculacion sin fase de cotizacion formal. |
| Solo el Gerente puede aprobar solicitudes de reembolso (SolicitudReembolso) | Control financiero activo; la aprobacion de reembolsos es una decision de negocio con impacto economico que requiere autoridad del Gerente. |

---

## 18. Items de Riesgo Legal

1. **Dotacion minima de personal en el evento (Etapa 6):** Si los contratos con instituciones educativas establecen compromisos de dotacion minima de personal de Hersa, la delegacion al coordinador de grado debe respetar esos minimos. Verificar contratos antes de implementar.

2. **Contrato entre padre/acudiente y Hersa (Etapa 1):** Cualquier cambio en el momento, formato, firmantes o mecanismo de firma del acta debe revisarse con asesor legal antes de implementarse.

3. **Admision de menores en el evento (Etapa 6):** Verificar si existe regulacion local (Cali, Colombia) aplicable a aforos de menores en eventos privados cerrados que fundamente o complemente la regla actual (RN-13).

---

*Documento generado por `process-optimizer`. Version 2.1. Todos los items [NECESITA CONTEXTO] estan resueltos. Este documento esta listo para ser usado como insumo por `systems-analyst`.*

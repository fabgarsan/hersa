# Hersa — Proceso Operativo As-Is

**Version:** 1.4
**Fecha de documentacion:** 2026-04-28
**Estado:** As-is — documenta exclusivamente la operacion actual. No contiene propuestas de mejora ni diseno de estado futuro.

**Fuentes:**
- Referencia canonica de dominio: `.claude/shared/hersa-context.md`
- Sesion de advisory ejecutivo (decisiones de negocio cerradas, integradas al cuerpo del proceso, no como anexo)
- Sesion de validacion con dueno del negocio (nueva informacion confirmada, integrada en v1.3)
- Sesion de correccion y expansion con dueno del negocio (v1.4): correcciones de flujo Etapa 3 (toga y comprobante), Etapa 6 (reintegro), Etapa 4 (boletas obsequio); expansion de EP-09 y nuevo alcance de cotizador informal

---

## Alcance

Este documento describe el proceso operativo completo de Hersa tal como funciona hoy, desde el primer contacto comercial con una institucion educativa hasta la entrega de productos en el dia de grado. Incluye los sub-procesos de cobro, gestion de inconformidades, control de ausentes, gestion de personal externo temporal, notificacion de cambios a colaboradores, y tipos de evento adicionales (Cena de Profesores).

**Unidad de negocio principal:** La unidad operativa central es la **Promocion**, no la institucion como entidad plana. Todo el proceso operativo aplica por Promocion. Una institucion puede tener multiples Promociones activas de forma simultanea.

---

## Modelo de Promocion

Una Promocion se define por la combinacion de cuatro atributos:

| Atributo | Descripcion | Valores posibles |
|---|---|---|
| Institucion educativa | Entidad contratante | (registro del sistema) |
| Grado academico | Nivel de la promocion | Preescolar, Primaria, Secundaria, Bachillerato, General |
| Jornada | Turno de la promocion | Diurna, Nocturna, Sabatina |
| Ano de la promocion | Ano de la cohorte | Ej. 2025, 2026 |

**Notas sobre el modelo:**
- "General" es un valor placeholder para grados que no encajan en los cuatro niveles nominados.
- Una misma institucion puede tener multiples Promociones activas simultaneamente (ej. Bachillerato Nocturno 2025 y Primaria Diurna 2025 son Promociones independientes de la misma institucion).
- Cada Promocion puede tener precios y condiciones de negociacion diferentes.
- La clave de precio se define por (institucion + grado + jornada + ano); cuando no hay diferenciacion por jornada, la clave es (institucion + grado + ano).
- Todo lo que en versiones anteriores se documentaba "por institucion" aplica en realidad **por Promocion**.

---

## 1. Actores

### Actores internos (Hersa)

| Actor | Cantidad | Rol en el proceso |
|---|---|---|
| Gerente | 1 | Autoriza descuentos; resuelve discrepancias de pago; cierra inconformidades; decide dotacion de personal en el dia de grado; contacta directamente a estudiantes o padres por WhatsApp o llamada ante problemas mayores |
| Administrador del sistema | 2 | Configuracion del sistema, gestion de usuarios y roles, gestion del catalogo de items y paquetes base, gestion de tablas maestras geograficas (via Django Admin), reportes globales, historial de incidentes por Promocion |
| Comercial (Sales rep) | 3 | Prospeccion, vinculacion de instituciones y Promociones, reunion con estudiantes, seguimiento y confirmacion de fechas, negociacion de paquetes |
| Planillador / Cajero | Variable | Apertura de sesion de cobro; registro y cobro a estudiantes; emision de comprobantes impresos; cierre de caja al final del dia; cierre activo del grupo que habilita el cruce de ausentes |
| Fotografo | Variable (interno o externo) | Toma fotografica, retoque, empaquetado del pedido fisico por estudiante. Tiene turnos de toma asignados |
| Vestidor | Variable (interno; puede sumarse externo temporal) | Mide y ajusta togas el dia de las tomas fotograficas |
| Jefe de Logistica | 1 (interno permanente) | Dirige la logistica de los grados |
| Coordinador de grado | Variable | Ejecucion en sitio el dia de grado: recepcion, verificacion de toga, cobro de saldo, entrega de paquetes, escaneo de QR |
| Maestro de Ceremonia | Variable (externo) | Dirige el protocolo en las ceremonias de grado |
| Personal de Bodega | Variable (interno) | Separa y prepara lo requerido para cada evento: togas por talla, borlas, birretes, estolas, manteleria, sillas, mesas, menaje de evento |
| Secretaria | Variable (interno) | Gestion general; requiere acceso a informacion del sistema |
| Meseros | Variable (temporal externo, contratado por dia/evento) | Servicio de mesa en cenas de profesores y actividades Prom |
| Vestidores adicionales | Variable (temporal externo, contratado por dia/evento) | Apoyo de medicion y ajuste de togas cuando el volumen lo requiere |
| Usuario interno generico | — | Cualquier usuario con acceso al sistema puede registrar una inconformidad |

### Actores externos (clientes e instituciones)

| Actor | Tipo | Rol en el proceso |
|---|---|---|
| Director / Rector de la institucion | Externo — Institucion | Punto de contacto inicial; autoriza el acceso de Hersa a estudiantes e instalaciones |
| Representante de padres | Externo — Institucion | Participa en la reunion de vinculacion; integra el grupo de WhatsApp; titular del contrato con Hersa |
| Delegado estudiantil | Externo — Institucion | Participa en la reunion de vinculacion; integra el grupo de WhatsApp; facilita la difusion del enlace o QR de auto-registro |
| Estudiante graduando | Externo — Cliente B2C | Se auto-registra o es registrado presencialmente; realiza pagos; asiste a toma fotografica, Prom y dia de grado |
| Padre / Acudiente | Externo — Cliente B2C | Titular del contrato con Hersa; recibe notificaciones; asiste al dia de grado con ticket QR |

### Actores proveedores externos

| Actor | Rol en el proceso |
|---|---|
| Conductor | Empresa o individuo que transporta estudiantes. Tiene programaciones de recorridos con horarios, lugares de partida y puntos de recogida (rutas con paradas) |
| Grupo Musical | Canta en intermedios de grados y eventualmente en actividades Prom |
| Alimentos | Empresa externa que provee servicio de alimentos y bebidas para cenas de profesores y actividades Prom |

### Sistema

| Actor | Rol |
|---|---|
| Sistema (plataforma Hersa) | Registro de datos, notificaciones (email/SMS a disposicion del administrador), control de sesiones de cobro, gestion de QR, cruce de ausentes, historial de incidentes, alertas de escalacion, calendario de eventos, registro de notificaciones enviadas |

**Nota sobre roles multiples:** Un colaborador puede tener multiples roles de forma simultanea (ej. un fotografo puede tambien actuar como vestidor en ciertos eventos).

---

## 2. Perfil de Colaborador

Todo colaborador —interno y externo— debe tener registrado en el sistema:

| Campo | Tipo | Obligatoriedad |
|---|---|---|
| Nombre completo | Texto | Obligatorio |
| Telefono | Texto | Obligatorio |
| Numero de documento | Texto | Obligatorio |
| Pais | Seleccion desde tabla maestra | Obligatorio |
| Departamento | Seleccion desde tabla maestra (dependiente de Pais) | Obligatorio |
| Ciudad | Seleccion desde tabla maestra (dependiente de Departamento) | Obligatorio |

Las tablas maestras de Pais, Departamento y Ciudad son entidades independientes con CRUD gestionado via Django Admin. Se usan en perfiles de colaboradores y en cualquier otro lugar del sistema donde se requiera informacion geografica.

---

## 3. Catalogo de Items y Paquetes de Grado

### Catalogo global de items

El administrador gestiona un catalogo global de items (productos y servicios). Cada item tiene:
- Categoria
- Precio unitario (puede ser $0 para items incluidos en el paquete base, o un valor positivo para items adicionales)

### Paquetes base

Se arman **paquetes base** como combinaciones de items del catalogo. El administrador crea y gestiona los paquetes base. Los paquetes base pueden duplicarse.

### Negociacion por Promocion

El comercial trabaja sobre un paquete base durante la negociacion con una Promocion especifica:
- Puede agregar o quitar items del paquete base para esa negociacion.
- Cuando se modifica un paquete para una Promocion, el sistema crea una copia interna del paquete (snapshot) para que las modificaciones no afecten a otras Promociones ni al paquete base original.
- El precio del paquete resultante queda definido para la Promocion especifica.

---

## 4. Proceso de Gestion de Personal Externo Temporal

En temporada de grados, Hersa contrata personas de forma temporal para cubrir roles externos (meseros, vestidores adicionales, y otros). El proceso actual es:

1. Se mantiene un listado en el sistema de personas interesadas en trabajar con la empresa. Incluye estudiantes recien graduados que se postulan y personas externas.
2. En temporada, se contacta a las personas interesadas por correo electronico y/o SMS con un enlace de postulacion. El contacto se hace candidato por candidato.
3. Antes de confirmar la asignacion, la persona debe llenar un formulario de actualizacion de datos (actualizacion del perfil de colaborador). La actualizacion se hace cuando la persona lo requiere o cuando el proceso de convocatoria lo exige; no hay un ciclo formal anual de actualizacion.
4. La persona queda disponible para ser asignada a eventos segun disponibilidad y rol.

**Limitaciones actuales del proceso de personal externo:**
- No existe un calendario visible para los candidatos donde puedan ver los eventos disponibles y postularse a uno especifico o a un dia especifico.
- El administrador contacta a los candidatos de forma individual (no masiva); en temporada alta esto genera Muda de movimiento considerable.
- No hay estados formales de postulacion por evento (Disponible, Aceptado, No aceptado, Cancelado). La confirmacion se gestiona por WhatsApp o llamada.
- No existe la opcion de duplicar un evento o dia publicado para evitar repetir la informacion de configuracion.
- El administrador no puede publicar cuantas personas necesita por rol en cada evento de forma estructurada en el sistema.

---

## 5. Flujo por Etapas

### Etapa 0 — Agendamiento

**Actor principal:** Comercial

1. El comercial contacta al director o rector de la institucion educativa por telefono o en persona.
2. Se define una fecha de reunion con la institucion.
3. El comercial registra en el sistema los siguientes datos: fecha de visita a la institucion (para la Etapa 1), numero de contacto del director o rector, e institucion educativa a visitar.

---

### Etapa 1 — Vinculacion de la Promocion

**Actor principal:** Comercial

1. El comercial se reune con representantes de padres y delegados estudiantiles en la institucion.
2. El comercial presenta los servicios de Hersa.
3. **Punto de decision D1 — Seleccion de Hersa:** La institucion decide si selecciona a Hersa como proveedor para la Promocion.
   - Si no es seleccionada: el proceso termina para esa Promocion.
   - Si es seleccionada: continua en el paso 4.
4. El comercial define y registra los atributos de la Promocion: institucion, grado academico, jornada y ano. Este registro se hace de forma individual para cada Promocion; no existe un panel que permita crear varias Promociones a la vez con el mismo paquete y precio, aunque sea comun que una misma institucion tenga multiples configuraciones de grado con los mismos items y solo variacion de precio.
5. El comercial recopila los contactos: representante de padres y delegado estudiantil. Los delegados se agregan al grupo de WhatsApp.
6. El comercial define y registra los siguientes parametros de la Promocion:
   - Fechas tentativas de toma fotografica
   - Fecha del Prom
   - Sede del grado
   - Paquete de grado negociado (seleccion del paquete base + ajustes; se crea snapshot por Promocion)
   - Precio del paquete por estudiante (resultante de la negociacion)
   - Cantidad de tarjetas de invitacion por estudiante (se define en esta primera visita y se almacena por estudiante)
   - Fecha del grado: puede no definirse en esta visita; el comercial la registra en el sistema una vez confirmada con la sede, siempre antes de la Actividad Prom (Etapa 4). El sistema permite filtrar Promociones sin fecha de grado registrada para facilitar el seguimiento.
7. Se firma un acta de contrato de servicio entre el padre/acudiente y Hersa. El comercial gestiona este documento en esta misma etapa, inmediatamente despues de la reunion de vinculacion.
8. El comercial crea un grupo de WhatsApp con los representantes de padres para comunicacion continua.

**Restriccion:** Sin la aprobacion de la institucion, el proceso completo no puede iniciar para esa Promocion.

---

### Etapa 1b — Cena de Profesores (tipo de evento adicional)

**Actores principales:** Jefe de Logistica, Meseros (temporal externo), Proveedor de Alimentos (externo)

La Cena de Profesores es un tipo de evento adicional que puede ocurrir en cualquier momento posterior a la vinculacion de la Promocion. No sigue una secuencia fija dentro del flujo principal.

- Se realiza en Hersa Casa Campestre.
- Incluye: meseros, servicio de alimentos y bebidas provisto por el rol externo "Alimentos".
- Esta incluida en el paquete negociado; no genera cobro adicional al estudiante ni a la institucion.
- El maximo es 1 cena por ciclo de Promocion, aunque el sistema permite registrar mas en caso de necesidad justificada.
- El evento requiere asignacion de personal (meseros, proveedor de alimentos) antes de su realizacion.

---

### Etapa 2 — Reunion con Estudiantes en la Institucion Educativa

**Actor principal:** Comercial

1. El comercial se reune con el total de graduandos de la Promocion en la institucion.
2. Se registra la cantidad de estudiantes por grupo. Un grado puede tener multiples grupos (ej. 11A, 11B, 11C); el registro es por grupo, no por grado.
3. Los estudiantes son incorporados al grupo de WhatsApp de padres ya existente.
4. El comercial comunica las fechas de toma fotografica confirmadas.
5. El comercial comparte un enlace o codigo QR con los delegados estudiantiles para que los graduandos completen su auto-registro de forma asincrona: nombre completo, numero de documento, telefono, talla de toga, etc.
6. El auto-registro puede comenzar a partir de este momento.

**Restriccion:** Las preferencias de grupo (colores de bordes, estolas, detalles de ceremonia) no se recolectan en esta etapa. Se recogen durante la toma fotografica (Etapa 3).

---

### Etapa 3 — Toma Fotografica

**Actores principales:** Planillador / Cajero, Fotografo, Vestidor

La toma se realiza en Casa Campestre Hersa (Carrera 127 #20-22, Pance). Se organiza por grupo, no por grado.

**Reglas de organizacion del dia:**
- Una Promocion puede ocupar un dia completo con sus multiples grupos.
- Hasta dos Promociones pequenas pueden compartir un mismo dia; cada Promocion puede tener multiples grupos dentro de ese dia compartido.
- Excepcionalmente, multiples grupos del mismo grado de la misma Promocion pueden fotografiarse en el mismo horario.
- Los buses salen en el horario exacto pactado, sin excepciones.

#### Sub-proceso: Registro y cobro en toma fotografica

1. El cajero abre sesion de cobro en el sistema. La sesion solo esta disponible durante las etapas del proceso donde aplica cobro para esa Promocion especifica.
2. **Antes de acercarse al cajero**, el vestidor mide y ajusta fisicamente la toga del estudiante. El vestidor NO registra ninguna talla en el sistema; solo realiza la medicion y el ajuste fisico. El vestidor comunica la talla al estudiante (o la anota en un papel que el estudiante lleva al cajero).
3. El estudiante se acerca al cajero y proporciona su nombre o numero de documento.
4. El cajero busca al estudiante en el sistema por Promocion + nombre o numero de documento.
5. El cajero verifica el precio del paquete (ya definido desde la Etapa 1; el cajero conoce el monto maximo a cobrar).
6. El estudiante paga al menos un porcentaje del valor total del paquete en efectivo. El minimo por defecto es el 50%, pero puede ser menor. Si el cajero cobra menos del 50%, debe registrar una justificacion escrita en el campo de comentarios del registro de pago. El campo de comentarios tambien puede usarse para otras anotaciones del cajero.
7. El cajero registra la talla de toga del estudiante en el sistema al momento de registrar el pago. El cajero es el actor que hace este registro, no el vestidor.
8. El sistema envia notificacion al estudiante por email y SMS con el valor pagado y el saldo pendiente.
9. El cajero entrega al estudiante un comprobante impreso. Este comprobante impreso es actualmente el mecanismo de autorizacion del fotografo: el estudiante debe entregarselo al fotografo para que proceda con la toma.
10. El estudiante entrega el comprobante impreso al fotografo como autorizacion para proceder con la toma. Si el comprobante se pierde, se genera una interrupcion del flujo que requiere intervencion manual.
11. El fotografo realiza la toma fotografica al estudiante.
12. Se recolectan las preferencias del grupo: colores de bordes, estolas y detalles de la ceremonia.
13. Al final del dia, el cajero realiza el cierre de caja de forma manual.

**Add-ons disponibles:**
- Foto familiar: $20.000 COP
- Foto grupal con acompanante (precio definido)
- Poster adicional 50x70 cm: $50.000 COP cada uno
- El poster 50x70 puede tomarse en toga o en ropa personal (el estudiante lleva su propio atuendo)

**Descuentos autorizados:** Hersa puede conceder descuentos parciales en el paquete. Requieren autorizacion del gerente (u otro usuario con permisos equivalentes). El gerente busca al estudiante en el sistema y registra el descuento directamente; el cajero lo encuentra ya aplicado al momento del cobro. Pueden definirse con antelacion o en el momento de la toma.

**Control preventivo de discrepancias de pago:** Los tres comprobantes (email, SMS, papel impreso) actuan como control preventivo. Si ocurre una discrepancia entre ellos, la resuelve el gerente.

#### Sub-proceso: Control de ausentes

1. Al cierre del dia o del grupo, el cajero o coordinador realiza el cierre activo del grupo en el sistema.
2. El cierre activo del grupo es la senal que habilita el cruce de ausentes.
3. El sistema cruza los estudiantes pre-registrados contra quienes no tienen pago registrado.
4. El resultado es la lista de ausentes del grupo.
5. A los estudiantes ausentes se les aplica un descuento de $10.000 COP en su paquete.
6. Los estudiantes ausentes pueden asistir a la sesion "Varios" (Etapa 5) o el dia del Prom (Etapa 4).

#### Sub-proceso: Retoque y empaquetado

1. El fotografo envia las fotos al proceso de retoque.
2. El fotografo empaqueta el pedido fisico por estudiante para entrega el dia de grado.

**Sistema multi-cajero:**
- Cualquier usuario con permisos puede abrir una sesion de cobro.
- La sesion de cobro solo esta habilitada durante las etapas del proceso donde aplica cobro para esa Promocion especifica.
- Usuarios con permisos especiales pueden operar sesiones de cobro en cualquier momento, sin restriccion de etapa.

---

### Etapa 4 — Actividad Prom

**Actores principales:** Comercial, Planillador / Cajero, Coordinador de grado, Meseros (temporal externo), Proveedor de Alimentos (externo)

Realizada en Casa Campestre Hersa.

1. Se realiza el ensayo de grado en este dia.
2. El cajero cobra el saldo pendiente a los estudiantes que aun adeudan.
3. El comercial o coordinador distribuye las tarjetas de invitacion (codigos QR de un solo uso) a cada graduando.
4. Los estudiantes que no asistieron a la toma fotografica original (Etapa 3) pueden tomarse las fotos en este dia.
5. Se provee servicio de alimentos y bebidas a cargo del proveedor externo "Alimentos".

**Regla — Estudiante ausente en el Prom:** Puede enviar a un companero con carta de autorizacion y el saldo pendiente. El representante puede retirar tanto las tarjetas de invitacion como el paquete fotografico completo.

**Obsequio de boletas sobrantes:** Cuando quedan tarjetas de invitacion sobrantes al final del dia del Prom, el Gerente puede autorizar el obsequio de boletas adicionales a ciertos estudiantes o a todos. Esta decision es discrecional del Gerente (o usuario con permisos equivalentes). Actualmente no existe un registro formal en el sistema de este obsequio ni de a quienes se les otorgaron boletas adicionales.

**Restricciones:**
- No hay transporte de regreso el dia del grado; el transporte de regreso aplica unicamente el dia del Prom.
- Alcohol y sustancias estan estrictamente prohibidos en todas las actividades de Hersa; Hersa puede negar el servicio ante infracciones.
- Las tarjetas de invitacion sobrantes se entregan en su totalidad el dia del Prom; nunca se venden.

---

### Etapa 5 — Toma Fotografica Varios

**Actores principales:** Fotografo, Planillador / Cajero

Sesion extra abierta a todas las Promociones, celebrada antes del dia de grado.

**Casos cubiertos:**
1. **Adicional:** Estudiantes satisfechos con sus fotos originales que desean tomas adicionales (posters extra, add-ons).
2. **Retoma:** Estudiantes inconformes con sus fotos originales que solicitan una nueva toma. Solo en casos especiales; no es una regla general.
3. **Recuperacion de ausentes:** Estudiantes que no asistieron ni a la Etapa 3 ni a la Etapa 4. Es su ultima oportunidad antes del grado.

**Reglas:**
- La fecha se define con suficiente anticipacion y se comunica a todas las Promociones.
- El sistema registra el tipo de caso de cada estudiante que asiste: adicional, retoma o ausente de recuperacion.
- El sub-proceso de cobro sigue el mismo flujo que la Etapa 3: cajero con sesion habilitada, comprobante impreso como autorizacion al fotografo, notificacion por email y SMS, y cierre de caja al finalizar el dia.

---

### Etapa 6 — Dia de Grado

**Actores principales:** Coordinador de grado, Planillador / Cajero, Maestro de Ceremonia, Personal de Bodega, Jefe de Logistica, Gerente (ante problemas mayores)

**Dotacion de personal:** El gerente decide la cantidad de personal asignado al evento segun el volumen del mismo, en el momento del evento.

#### Logistica general de recepcion

1. El personal de Bodega prepara y dispone los materiales necesarios: togas por talla, borlas, birretes, estolas, manteleria, sillas, mesas, menaje de evento.
2. El personal de Hersa recibe a los graduandos en la entrada.
3. El coordinador de grado verifica y ajusta la toga del estudiante (la talla debe coincidir con la asignada en la toma fotografica; el sistema fuerza este vinculo).
4. El personal de ceremonia gestiona el ingreso de familiares mediante tickets QR de un solo uso, invalidados al escanear en la entrada.
5. El Maestro de Ceremonia dirige el protocolo de la ceremonia de grado.
6. La ceremonia inicia puntualmente a la hora impresa en las tarjetas.

**Reglas de acceso para familiares:**
- Acceden con ticket QR de un solo uso; el codigo se invalida al escanear.
- Ninos menores de 5 anos: no admitidos.
- Ninos de 5 anos o mas: requieren ticket.
- Si un estudiante no se gradua, todos sus tickets quedan cancelados e invalidos antes del ingreso.

#### Sub-proceso: Cobro de saldo y entrega de paquetes

1. El cajero valida el saldo del estudiante en el sistema antes de proceder.
2. **Punto de decision D6 — Saldo pendiente en dia de grado:**
   - Sin saldo: el coordinador procede a la entrega del paquete fotografico directamente.
   - Con saldo: el cajero cobra el saldo completo; solo entonces el coordinador entrega el paquete.
3. La entrega del paquete fotografico esta condicionada al pago completo. No hay excepciones en sala. Si el estudiante no puede cubrir el saldo, no se entrega ningun material y el estudiante no puede participar en la ceremonia.
4. Al final del evento, el cajero realiza el cierre de caja.

**Escalacion ante problemas mayores:** El gerente contacta directamente al estudiante o al padre por WhatsApp o llamada telefonica. El sistema no gestiona este contacto automaticamente.

#### Regla — Cancelacion de tickets por no graduacion

Si un estudiante no se gradua, todos sus codigos QR de invitacion son cancelados de forma masiva e inmediata y quedan invalidos en la entrada.

#### Regla — Reembolso y entrega por reprobacion

El reembolso NO ocurre el dia del grado. El estudiante o representante debe completar un proceso de reintegro posterior al evento. El proceso actual es:

1. El estudiante (o representante con carta de autorizacion y copias de documentos) inicia el proceso de reintegro despues del dia del grado, en el momento que corresponda segun el procedimiento de Hersa.
2. Se sube el comprobante de no-graduacion (puede ser un documento, foto o PDF).
3. Se procesa el reembolso del 50% del monto pagado.
4. El paquete fotografico y el album se entregan igualmente al estudiante.

**Limitacion actual:** No existe un flujo formalizado ni un modulo en el sistema para gestionar este proceso de reintegro con estados y trazabilidad. Se maneja de forma manual.

---

## 6. Sub-proceso Transversal — Asignacion de Personal a Eventos

### Asignacion individual

El Jefe de Logistica o el administrador asigna colaboradores a cada evento especificando el rol que ejerceran en ese evento.

### Asignacion masiva (bulk)

Para evitar la asignacion uno a uno cuando el mismo personal va siempre a ciertos eventos, existe un proceso de asignacion masiva:

- **Por auditorios:** Todos los eventos que se realizan en ciertos auditorios reciben la misma asignacion de personal de forma automatica.
- **Por rango de fechas:** Todos los eventos dentro de un rango de fechas definido reciben la misma asignacion.
- **Para conductores:** La asignacion bulk tambien aplica para la asignacion de rutas de conductores a eventos.

La asignacion bulk puede sobreescribirse con asignaciones individuales posteriores.

---

## 7. Sub-proceso Transversal — Notificacion de Cambios a Colaboradores

Cuando algo cambia en un evento (fecha, lugar, hora), el administrador puede notificar a los colaboradores asignados a ese evento.

**Caracteristicas del proceso:**
1. El administrador inicia la notificacion manualmente; el proceso NO es automatico.
2. El canal de notificacion puede ser SMS, email, o ambos (a criterio del administrador).
3. Las notificaciones se agrupan por evento, no por cambio individual.
4. El sistema registra a quienes ya se les envio la notificacion para evitar duplicados.

---

## 8. Sub-proceso Transversal — Calendario de Eventos para Colaboradores

El sistema provee una vista de calendario de eventos:

- Solo accesible para usuarios autenticados.
- Los eventos se muestran categorizados por tipo.
- Un colaborador autenticado puede ver:
  - **Vista principal:** Los eventos a los que esta asignado.
  - **Vista general:** Todos los eventos de la empresa (para informacion general).

---

## 9. Sub-proceso Transversal — Gestion de Inconformidades

Aplica en cualquier etapa del proceso operativo.

### Registro

1. Cualquier usuario interno con acceso al sistema puede registrar una inconformidad.
2. El formulario incluye categorias predefinidas: foto / cobro / entrega / protocolo, mas un campo libre opcional.
3. El registro queda asociado explicitamente a la Promocion y al estudiante involucrado.
4. Al momento del registro, el sistema notifica automaticamente al gerente.

### Gestion y cierre

1. El cierre de la inconformidad es exclusivo del gerente.
2. El gerente contacta manualmente al afectado por WhatsApp o llamada telefonica. El sistema no envia notificacion automatica al afectado.
3. El gerente cierra la inconformidad en el sistema.

### Reglas

- SLA de resolucion: 48 horas habiles desde el registro.
- Alerta de escalacion interna: se genera automaticamente a las 36 horas habiles si la inconformidad no ha sido cerrada.
- El sistema no envia notificacion automatica al estudiante o padre al cierre; el contacto siempre es manual.

---

## 10. Puntos de Decision

| ID | Etapa | Condicion | Actor decisor | Rama afirmativa | Rama negativa |
|---|---|---|---|---|---|
| D1 | Etapa 1 | La institucion selecciona a Hersa para la Promocion | Director / representantes institucionales | Continua la vinculacion de la Promocion (paso 4) | El proceso termina para esa Promocion |
| D2 | Etapa 3 | El estudiante asistio a la toma fotografica | Sistema / Cajero (cruce de ausentes tras cierre de grupo) | Se registra pago y se realiza la toma | Se aplica descuento de $10.000 COP; se agenda para Varios o Prom |
| D3 | Etapa 3 | Se solicita un descuento de paquete | Gerente | Descuento aplicado con registro de autorizacion | Sin descuento |
| D4 | Etapa 3 | Ocurre una discrepancia entre los comprobantes de pago | Gerente | Gerente resuelve la discrepancia | Sin accion adicional |
| D5 | Etapa 4 | El estudiante esta ausente en el Prom | Condicion de hecho | Un companero retira materiales con carta de autorizacion | El estudiante retira sus materiales directamente |
| D6 | Etapa 6 | El estudiante tiene saldo pendiente en el dia de grado | Sistema (validacion automatica) | El cajero cobra el saldo antes de la entrega | El coordinador entrega el paquete directamente |
| D7 | Etapa 6 | El estudiante se gradua | Hecho academico de la institucion | Proceso normal de entrega y acceso de familiares | Cancelacion masiva de QR el dia del grado; tramite de reembolso del 50% y entrega del paquete se inician en el proceso de reintegro posterior, no ese mismo dia |
| D8 | Cualquier etapa | Se registra una inconformidad | Usuario interno con acceso | Sistema notifica al gerente; gerente gestiona y cierra en 48 h habiles | Sin accion |
| D9 | Etapa 3 y 6 | El cajero tiene permisos especiales en el sistema | Administrador del sistema (configuracion previa) | Puede abrir sesion de cobro en cualquier momento | Solo puede operar en etapas habilitadas para esa Promocion |
| D10 | Etapa 3 | El pago es menor al 50% del paquete | Cajero | Se registra el pago con justificacion escrita obligatoria en campo de comentarios | Se registra el pago normalmente sin comentario adicional |
| D11 | Etapa 1b | Se necesita una segunda cena de profesores en el mismo ciclo de Promocion | Administrador | El sistema permite registrar la cena adicional | Solo se registra la cena unica del ciclo |

---

## 11. Reglas de Negocio

| # | Regla |
|---|---|
| RN-01 | El contrato es entre el padre/acudiente y Hersa. La institucion no firma contrato, pero su aprobacion es condicion de inicio de todo el proceso por Promocion. |
| RN-02 | Hersa gestiona la ceremonia; la institucion otorga el diploma. Asistir a la toma fotografica no garantiza la graduacion academica. |
| RN-03 | El pago minimo en la toma fotografica es del 50% del valor del paquete por defecto, en efectivo, el dia de la toma. Puede ser menor si el cajero registra una justificacion escrita en el campo de comentarios del registro de pago. |
| RN-04 | La entrega de paquetes el dia de grado esta condicionada al pago completo. Sin excepciones en sala. |
| RN-05 | El precio del paquete por estudiante se define en la Etapa 1 como resultado de la negociacion por Promocion. El cajero conoce el maximo a cobrar. |
| RN-06 | Los descuentos de paquete requieren autorizacion del gerente (u otro usuario con permisos equivalentes). El gerente los registra directamente en el sistema buscando al estudiante; el cajero los encuentra ya aplicados al momento del cobro. |
| RN-07 | La talla de toga se mide fisicamente en la toma fotografica (por el vestidor) y es registrada en el sistema por el cajero al momento del cobro. Debe coincidir el dia de grado. El sistema fuerza este vinculo. |
| RN-08 | Las tarjetas de invitacion son codigos QR de un solo uso; se invalidan al escanear. La cantidad por estudiante se define en la Etapa 1. |
| RN-09 | Las tarjetas sobrantes se entregan en su totalidad el dia del Prom; nunca se venden. |
| RN-10 | Si un estudiante no se gradua: se cancela el 100% de sus QR de forma masiva e inmediata el dia del grado. El reembolso del 50% del monto pagado y la entrega del paquete fotografico y album NO ocurren el dia del grado; el estudiante o representante inicia el proceso de reintegro posteriormente, siguiendo el procedimiento de Hersa, con comprobante de no-graduacion. |
| RN-11 | Los buses salen en el horario exacto pactado, sin excepciones. |
| RN-12 | Alcohol y sustancias prohibidos en todas las actividades de Hersa; Hersa puede negar el servicio. |
| RN-13 | Ninos menores de 5 anos no son admitidos a la ceremonia. Ninos de 5 anos o mas requieren ticket. |
| RN-14 | La ceremonia inicia exactamente a la hora impresa en las tarjetas. |
| RN-15 | Prom y toma fotografica son exclusivos para graduandos; no se admiten familiares. |
| RN-16 | Las fechas de toma, Prom, Varios y grado pueden cambiar despues de definirse. El sistema soporta actualizaciones sin perdida de datos. |
| RN-17 | Hersa puede gestionar multiples graduaciones el mismo dia en distintas sedes. Cada evento se asocia a una Promocion + fecha especificos. |
| RN-18 | Los turnos (jornadas) de una Promocion son: Diurna, Nocturna, Sabatina. Una institucion puede tener multiples Promociones activas con distintas jornadas. |
| RN-19 | El control de sesiones de cobro es por etapa y Promocion. Solo permisos especiales permiten operar fuera de la etapa habilitada. |
| RN-20 | El cierre activo del grupo por el cajero/coordinador es el prerequisito para que el sistema ejecute el cruce de ausentes. |
| RN-21 | Los tres comprobantes de pago (email, SMS, papel impreso) son el control preventivo de discrepancias. Las discrepancias las resuelve el gerente. |
| RN-22 | El historial de incidentes por Promocion e institucion se mantiene como insumo para futuras negociaciones contractuales. |
| RN-23 | El SLA de inconformidades es de 48 horas habiles. La alerta interna de escalacion se genera a las 36 horas si la inconformidad no ha sido cerrada. El cierre es exclusivo del gerente. |
| RN-24 | El transporte de regreso aplica unicamente el dia del Prom; no aplica el dia del grado. |
| RN-25 | La dotacion de personal para el dia de grado la decide el gerente segun el volumen del evento, en el momento. |
| RN-26 | El ausente en toma fotografica recibe un descuento de $10.000 COP. Puede recuperar la sesion en Varios (Etapa 5) o en el Prom (Etapa 4). |
| RN-27 | El acceso externo de padres, estudiantes y delegados institucionales no requiere registro de cuenta en el sistema. |
| RN-28 | El paquete fotografico fisico se identifica con el nombre del estudiante y la Promocion. No hay codigo de barras ni etiqueta adicional en el estado actual. |
| RN-29 | El acceso al historial de incidentes por Promocion e institucion esta restringido al administrador y al gerente. |
| RN-30 | El personal (coordinadores, cajeros, ceremonial) se asigna de forma fija por Promocion y sede antes del dia de grado, habitualmente dias antes del evento. La asignacion puede ser individual o masiva (bulk por auditorio o por rango de fechas). |
| RN-31 | La notificacion de cambios de fecha a estudiantes y familias se realiza actualmente por WhatsApp de forma manual. La intencion es automatizarla via email o SMS. |
| RN-32 | El cierre de caja al final del dia es actualmente un proceso manual. La intencion es que el sistema produzca el reporte de cierre automaticamente. |
| RN-33 | El acta de contrato de servicio entre el padre/acudiente y Hersa se firma en la Etapa 1, gestionada por el comercial inmediatamente despues de la reunion de vinculacion. |
| RN-34 | La unidad de negocio principal es la Promocion, definida por (institucion + grado + jornada + ano). Una misma institucion puede tener multiples Promociones activas con precios y condiciones distintas. |
| RN-35 | La clave de precio de un paquete se define por (institucion + grado + jornada + ano), o por (institucion + grado + ano) cuando no hay diferenciacion por jornada. |
| RN-36 | Cuando el comercial modifica un paquete base para una Promocion, el sistema crea un snapshot del paquete. Las modificaciones al snapshot no afectan al paquete base ni a otras Promociones. |
| RN-37 | Todo colaborador (interno y externo) debe tener registrado nombre completo, telefono, numero de documento, pais, departamento y ciudad. Pais, Departamento y Ciudad se seleccionan desde tablas maestras gestionadas via Django Admin. |
| RN-38 | La notificacion de cambios a colaboradores asignados a un evento es un proceso manual a disposicion del administrador, no automatico. El sistema registra a quienes ya recibieron la notificacion para evitar duplicados. Las notificaciones se agrupan por evento. |
| RN-39 | La Cena de Profesores esta incluida en el paquete negociado; no genera cobro adicional. El maximo es 1 cena por ciclo de Promocion; el sistema puede registrar mas si existe necesidad justificada. |
| RN-40 | La Actividad Prom incluye servicio de alimentos y bebidas provisto por el rol externo "Alimentos". |
| RN-41 | El calendario de eventos es visible solo para usuarios autenticados. Cada colaborador ve por defecto sus eventos asignados; tambien puede ver todos los eventos de la empresa. |
| RN-42 | Un colaborador puede desempenar multiples roles de forma simultanea. |
| RN-43 | La asignacion masiva de personal (bulk) puede realizarse por auditorio o por rango de fechas. La asignacion bulk tambien aplica para rutas de conductores. |

---

## 12. Restricciones Operativas

1. El auto-registro de estudiantes (via enlace o QR compartido) es asincrono y debe coexistir con el registro presencial realizado por Hersa.
2. El sistema debe soportar multi-cajero: mas de un cajero operando simultaneamente en el mismo evento.
3. El cierre activo de un grupo por el cajero/coordinador es prerequisito para el cruce de ausentes; sin ese cierre el cruce no se ejecuta.
4. Los codigos QR de invitacion son de un solo uso; el sistema los invalida al escanear. La cancelacion por no-graduacion es masiva e inmediata.
5. El reembolso por reprobacion se activa al subir el comprobante de no-graduacion al sistema; no es un proceso manual arbitrario.
6. Las fechas de eventos son mutables; el sistema gestiona cambios sin perdida de datos.
7. El mecanismo de autenticacion para acceso externo (padres, estudiantes, delegados) esta pendiente de definicion tecnica. Candidatos: token unico por enlace, documento + PIN, telefono + OTP.
8. Hersa puede ejecutar multiples graduaciones el mismo dia; cada modelo de datos debe estar acotado por Promocion + fecha.
9. Todo dato de geolocalizacion de colaboradores (pais, departamento, ciudad) debe resolverse contra las tablas maestras gestionadas via Django Admin; no se permiten entradas de texto libre para estos campos.
10. Las notificaciones de cambio a colaboradores se envian a solicitud del administrador (no automaticas). El sistema impide el reenvio a quien ya recibio la notificacion del mismo evento.

---

## 13. Proceso de Cotizacion (As-Is)

Actualmente Hersa no cuenta con un modulo formal de cotizacion en el sistema. El proceso de cotizacion es informal:

1. El comercial elabora una cotizacion de forma manual (Word, Excel, papel u otro medio) basandose en el catalogo de items y el paquete base que aplique.
2. La cotizacion puede incluir items del paquete base mas adiciones o sustracciones segun la negociacion con la institucion.
3. El precio por estudiante queda a criterio del comercial en este proceso informal.
4. No existe generacion automatica de PDF de cotizacion ni trazabilidad en el sistema de las cotizaciones enviadas.
5. No existe un estado de "cotizacion aceptada → convertida en Promocion" en el sistema; el comercial crea la Promocion directamente cuando la negociacion se cierra, sin vinculo con el documento de cotizacion previo.

**Limitacion:** La ausencia de un cotizador formal impide al gerente tener visibilidad de las negociaciones en curso, los margenes aplicados y la consistencia de precios entre comerciales.

---

## 14. Estado del Documento

Todas las preguntas de aclaracion han sido respondidas e integradas al cuerpo del documento. El documento no tiene items `[FALTA INFO]` ni `[AMBIGUO]` abiertos.

**Cambios en v1.4 respecto a v1.3:**
- Etapa 1: documentada la limitacion de creacion uno a uno de Promociones (sin panel bulk).
- Etapa 3: corregido el orden del flujo (medicion de toga ANTES del pago); corregido el actor que registra la talla (cajero, no vestidor); clarificado que el comprobante impreso es actualmente el unico mecanismo de autorizacion al fotografo.
- Etapa 4: documentado el obsequio de boletas sobrantes como practica informal actual.
- Etapa 6: corregida la regla de reintegro (no ocurre el dia del grado; es un proceso posterior).
- RN-07 y RN-10: actualizadas para reflejar las correcciones anteriores.
- D7: actualizado para reflejar la separacion entre cancelacion de QR (dia del grado) y reintegro (proceso posterior).
- Seccion 4 (Personal Externo Temporal): documentadas las limitaciones actuales del proceso de postulacion.
- Seccion 13 (nueva): documentado el proceso informal de cotizacion.

Este documento esta listo para ser usado como insumo por el agente `process-optimizer`.

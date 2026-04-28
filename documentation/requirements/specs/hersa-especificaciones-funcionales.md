# Hersa — Especificaciones Funcionales del Sistema

**Version:** 2.2
**Fecha:** 2026-04-28
**Basado en:** `documentation/process/to-be/hersa-proceso-operativo-to-be.md` v2.1
**Contexto de dominio:** `.claude/shared/hersa-context.md`
**Estado:** Listo para planificacion de implementacion

---

## Indice

1. [Epicos Identificados](#1-epicos-identificados)
2. [User Stories por Epico](#2-user-stories-por-epico)
3. [Criterios de Aceptacion por Historia](#3-criterios-de-aceptacion-por-historia)
4. [Entidades de Datos](#4-entidades-de-datos)
5. [Endpoints de API Sugeridos](#5-endpoints-de-api-sugeridos)
6. [Reglas de Negocio Criticas](#6-reglas-de-negocio-criticas)
7. [Dependencias entre Historias](#7-dependencias-entre-historias)
8. [Historias Fuera de Alcance](#8-historias-fuera-de-alcance)

---

## 1. Epicos Identificados

| Epic ID | Nombre | Descripcion | Historias |
|---------|--------|-------------|-----------|
| EP-01 | Agendamiento y Vinculacion de Promocion | Registro de visitas, creacion de Promocion (institucion + grado + jornada + ano), parametros del contrato, paquete negociado con snapshot automatico, fechas tentativas y contactos, creacion bulk de Promociones. | 8 |
| EP-02 | Auto-registro y Registro Presencial de Estudiantes | Flujo de incorporacion del estudiante al sistema: auto-registro asincrono via QR/enlace y registro presencial por cajero. Vinculado a Promocion. | 3 |
| EP-03 | Notificaciones Automaticas del Sistema | Envio automatico de notificaciones por email/SMS ante eventos del sistema: registro de fechas, cambios de fecha, recordatorios de saldo, ausencias. | 5 |
| EP-04 | Sesion de Cobro y Cierre Automatico de Caja | Apertura multi-cajero, registro de pagos con justificacion flexible, add-ons, descuentos, autorizacion fotografica por sistema y generacion automatica del reporte de cierre con excepciones. | 6 |
| EP-05 | Gestion Fotografica | Autorizacion del fotografo por estado del sistema, paralelizacion del retoque, control de ausentes, gestion de sesion Varios. | 4 |
| EP-06 | Dia de Grado — Logistica y Entrega | Pre-validacion de saldos, cobro en sala, entrega de paquetes, dotacion de personal anticipada, escalaciones con trazabilidad, cancelacion masiva de QR, obsequio de boletas, proceso de reintegro asincrono. | 11 |
| EP-07 | Gestion de Inconformidades | Registro, notificacion automatica al afectado, gestion por el gerente y cierre con notificacion. SLA configurable con snapshot por inconformidad. | 5 |
| EP-08 | Administracion del Sistema | Gestion de usuarios/colaboradores con roles multiples, perfil de colaborador con datos geograficos, catalogo de items, paquetes base, historial de incidentes, reportes globales, tablas maestras geograficas, parametros globales configurables con historial de cambios. | 9 |
| EP-09 | Pool de Personal Externo y Postulacion | Gestion del pool de candidatos externos, envio masivo de invitaciones de postulacion, formulario publico de actualizacion de perfil, seguimiento del estado de postulacion, calendario bidireccional de slots de eventos para postulacion directa de candidatos. | 9 |
| EP-10 | Asignacion Bulk de Personal y Rutas de Conductores | Creacion y aplicacion de reglas de asignacion masiva por auditorio o rango de fechas, asignacion de rutas de conductores, trazabilidad del origen (bulk vs. individual). | 4 |
| EP-11 | Notificacion de Cambios a Colaboradores | Proceso manual del administrador para notificar a colaboradores asignados a un evento, con resumen previo al envio, control de duplicados y registro de envios. | 3 |
| EP-12 | Calendario de Eventos para Colaboradores | Vista autenticada de eventos por colaborador: eventos propios y todos los eventos de la empresa, categorizados por tipo, con indicador de cambios recientes. | 2 |
| EP-13 | Cotizador de Paquetes | Herramienta pre-venta para armar cotizaciones formales con ítems del catálogo, generar PDF y convertirlas en Promociones al cerrar la negociación. Opcional — no es prerrequisito de una Promoción. | 7 |

**Total epicos:** 13
**Total user stories:** 76

---

## 2. User Stories por Epico

### EP-01 — Agendamiento y Vinculacion de Promocion

| ID | Titulo | Como / Quiero / Para | Prioridad |
|----|--------|----------------------|-----------|
| US-001 | Registrar visita de prospecto | Como comercial, quiero registrar la fecha de visita, el nombre de la institucion y el numero de contacto del director o rector antes de la reunion, para tener trazabilidad de la agenda de prospeccion. | Must |
| US-002 | Crear Promocion y registrar sus parametros | Como comercial, quiero crear una Promocion (institucion + grado academico + jornada + ano) y registrar sus parametros de contrato: fechas tentativas de toma, fecha del Prom, sede del grado, paquete negociado, precio del paquete por estudiante y cantidad de tarjetas de invitacion por estudiante, para que todos los actores trabajen con los mismos datos desde el inicio. | Must |
| US-003 | Registrar fecha de grado posteriormente | Como comercial, quiero poder registrar la fecha del grado en un momento posterior a la vinculacion inicial (siempre antes del Prom), para acomodar la confirmacion tardia de disponibilidad de sede. | Must |
| US-004 | Registrar contactos vinculados a la Promocion | Como comercial, quiero registrar los contactos del representante de padres y del delegado estudiantil asociados a la Promocion, para que el sistema pueda enviarles notificaciones automaticas. | Must |
| US-005 | Actualizar fecha de evento de la Promocion | Como comercial, quiero poder actualizar cualquier fecha registrada (toma fotografica, Prom, Varios, grado) sin perder los datos existentes, para reflejar cambios operativos sin afectar el historial. | Must |
| US-006 | Seleccionar paquete base y crear snapshot para la Promocion | Como comercial, quiero seleccionar un paquete base del catalogo, agregar o quitar items para la negociacion con la Promocion especifica, y que el sistema cree automaticamente un snapshot del paquete resultante, para que las modificaciones no afecten al paquete base ni a otras Promociones. | Must |
| US-055 | Creacion bulk de Promociones | Como comercial, quiero crear multiples Promociones de una institucion en un solo paso, para evitar repetir el formulario cuando una institucion tiene varios grados con el mismo paquete. | Must |
| US-056 | Vista previa y validacion del lote bulk | Como comercial, quiero ver un resumen de validacion antes de confirmar la creacion bulk, para corregir errores sin perder la configuracion ya ingresada. | Must |

---

### EP-02 — Auto-registro y Registro Presencial de Estudiantes

| ID | Titulo | Como / Quiero / Para | Prioridad |
|----|--------|----------------------|-----------|
| US-007 | Auto-registrarse como estudiante via enlace o QR | Como estudiante graduando, quiero completar mi propio registro (nombre completo, numero de documento, telefono, email, talla de toga) mediante un enlace o QR compartido por el delegado, con validacion de formato, para quedar vinculado a mi Promocion sin requerir cuenta de usuario. | Must |
| US-008 | Registrar estudiante presencialmente | Como cajero, quiero buscar a un estudiante por Promocion + nombre o numero de documento y completar su registro si aun no existe, para atender a quienes no se auto-registraron antes de la toma fotografica. | Must |
| US-009 | Registrar cantidad de estudiantes por grupo | Como comercial, quiero registrar la cantidad de estudiantes por grupo (ej. 11A, 11B) dentro de una Promocion, para que la logistica de turnos y buses este organizada por grupo. | Must |

---

### EP-03 — Notificaciones Automaticas del Sistema

| ID | Titulo | Como / Quiero / Para | Prioridad |
|----|--------|----------------------|-----------|
| US-010 | Notificar registro de fecha a contactos | Como sistema, quiero enviar automaticamente una notificacion por email y SMS a todos los contactos registrados de la Promocion cuando se registra por primera vez cualquier fecha de evento, para que los interesados queden informados sin intervencion manual del comercial. | Must |
| US-011 | Notificar cambio de fecha a contactos | Como sistema, quiero enviar automaticamente una notificacion por email y SMS a todos los contactos vinculados a la Promocion cuando cualquier fecha registrada es actualizada, para garantizar cobertura total sin depender de gestiones manuales por WhatsApp. | Must |
| US-012 | Notificar pago registrado al estudiante y padre | Como sistema, quiero enviar automaticamente una notificacion por email y SMS al estudiante y al padre/acudiente con el valor pagado y el saldo pendiente en el momento en que el cajero registra el pago, para mantener al cliente informado en tiempo real. | Must |
| US-013 | Notificar descuento por ausencia al estudiante | Como sistema, quiero enviar automaticamente una notificacion al estudiante identificado como ausente tras el cruce de ausentes, informando el descuento de $10.000 COP aplicado y las opciones disponibles (sesion Varios o Prom), para reducir la carga de comunicacion del coordinador. | Should |
| US-014 | Notificar saldo pendiente 48-24 h antes del grado | Como sistema, quiero identificar automaticamente a los estudiantes con saldo pendiente y enviarles una notificacion por email y SMS entre 48 y 24 horas antes del dia de grado, con el monto adeudado y la fecha limite de pago, para reducir confrontaciones en sala el dia del evento. | Must |

---

### EP-04 — Sesion de Cobro y Cierre Automatico de Caja

| ID | Titulo | Como / Quiero / Para | Prioridad |
|----|--------|----------------------|-----------|
| US-015 | Abrir sesion de cobro | Como cajero, quiero abrir una sesion de cobro en el sistema con mis propias credenciales seleccionando la Promocion, el grupo y el evento correspondiente, para que todas las transacciones queden asociadas a mi usuario y el sistema genere el reporte de cierre correctamente. | Must |
| US-016 | Registrar pago de estudiante con pago minimo flexible | Como cajero, quiero registrar el pago de un estudiante indicando el monto, y si el monto es menor al 50% del paquete, ingresar una justificacion escrita obligatoria antes de confirmar la transaccion, para que el sistema habilite el estado "autorizado para toma" y el reporte de cierre incluya las excepciones con su justificacion para revision del gerente. | Must |
| US-017 | Registrar add-ons al pago | Como cajero, quiero agregar add-ons (foto familiar $20.000 COP, foto grupal, poster 50x70 $50.000 COP) al registro de pago del estudiante, para que el total cobrado y el desglose queden registrados en el sistema. | Must |
| US-018 | Aplicar descuento autorizado por el gerente | Como cajero, quiero ver en el perfil del estudiante cualquier descuento previamente autorizado y registrado por el gerente, para aplicarlo correctamente sin comunicacion fuera del sistema en el momento del cobro. | Must |
| US-019 | Cerrar sesion de cobro y recibir reporte automatico | Como cajero, quiero cerrar mi sesion de cobro con una accion explicita, y que el sistema genere automaticamente un reporte consolidado (total cobrado, detalle por estudiante, saldos pendientes, add-ons, pagos con justificacion de excepcion) disponible para el gerente y el administrador, para eliminar el proceso manual de cierre de caja. | Must |
| US-020 | Autorizar descuento como gerente | Como gerente, quiero registrar en el sistema la autorizacion de un descuento para un estudiante especifico (con motivo y monto), antes o durante la sesion de cobro, para que el cajero lo encuentre aplicado sin requerir contacto adicional en el momento. | Must |

---

### EP-05 — Gestion Fotografica

| ID | Titulo | Como / Quiero / Para | Prioridad |
|----|--------|----------------------|-----------|
| US-021 | Verificar autorizacion del estudiante para toma | Como fotografo, quiero consultar en el sistema el estado del estudiante por nombre o numero de documento y confirmar si esta "autorizado para toma", para proceder sin depender del comprobante impreso. | Must |
| US-022 | Iniciar retoque fotografico en paralelo con las tomas | Como fotografo, quiero poder iniciar el retoque de las fotos ya tomadas durante el mismo dia de toma sin esperar al cierre total del dia, para adelantar el tiempo de produccion. | Should |
| US-023 | Cruzar ausentes tras cierre del grupo | Como cajero o coordinador, quiero cerrar activamente el grupo en el sistema al finalizar la sesion del dia, para que el sistema ejecute el cruce de ausentes y aplique automaticamente el descuento de $10.000 COP. | Must |
| US-024 | Registrar atencion en sesion Varios | Como cajero, quiero registrar la asistencia y el motivo de un estudiante en la sesion Varios (adicional, retoma o recuperacion de ausente), para mantener la trazabilidad de que sesion fotografica corresponde a cada estudiante. | Must |

---

### EP-06 — Dia de Grado — Logistica y Entrega

| ID | Titulo | Como / Quiero / Para | Prioridad |
|----|--------|----------------------|-----------|
| US-025 | Confirmar dotacion de personal con 48 h de anticipacion | Como coordinador de grado principal, quiero registrar y confirmar la asignacion de personal para el evento con un minimo de 48 horas de anticipacion, para que la planificacion no dependa de decisiones de ultima hora. | Must |
| US-026 | Consultar pre-lista de estudiantes con saldo pendiente | Como coordinador de grado o cajero, quiero consultar la lista de estudiantes con saldo pendiente generada automaticamente con minimo 24 horas de anticipacion al dia de grado, para anticipar la carga de cobro en sala. | Must |
| US-027 | Validar saldo del estudiante en sala y cobrar si aplica | Como cajero en el dia de grado, quiero validar el saldo del estudiante al momento de la entrega y, si tiene saldo pendiente, cobrar el total antes de que el coordinador entregue el paquete, para garantizar que ningun paquete se entregue sin pago completo. | Must |
| US-028 | Entregar paquete fotografico con pago completo | Como coordinador de grado, quiero confirmar en el sistema la entrega del paquete fotografico al estudiante una vez el cajero ha verificado que el saldo es cero, para tener trazabilidad de las entregas realizadas. | Must |
| US-029 | Registrar escalacion del gerente en sala | Como gerente, quiero registrar en el sistema cualquier escalacion que deba resolver en el dia de grado (con marca de tiempo, motivo y actor involucrado), para que quede en el historial de incidentes de la Promocion aunque el contacto con el afectado sea manual. | Should |
| US-030 | Cancelar masivamente tickets QR por no-graduacion | Como sistema, quiero cancelar e invalidar automaticamente todos los tickets QR de un estudiante tan pronto se confirme su no-graduacion (via subida de comprobante), para evitar accesos no autorizados al evento. El reembolso del 50% y la entrega del paquete fotografico se gestionan mediante el proceso de reintegro asincrono (SolicitudReembolso). | Must |
| US-057 | Autorizar obsequio de boletas adicionales | Como Gerente (o usuario con permiso `autorizar_obsequio_boletas`), quiero poder obsequiar boletas de invitacion sobrantes a estudiantes de una Promocion, para aprovechar las invitaciones no distribuidas sin que queden sin uso. | Should |
| US-058 | Visualizar tokens por tipo en reportes de invitaciones | Como Gerente o Administrador, quiero ver los tokens de invitacion de un estudiante diferenciados por tipo, para distinguir los tokens negociados de los tokens de obsequio. | Should |
| US-059 | Iniciar solicitud de reintegro por reprobacion | Como estudiante no graduado (o su representante), quiero poder iniciar una solicitud de reintegro despues del dia del grado, para recibir el reembolso del 50% y el paquete fotografico. | Must |
| US-060 | Gestionar ciclo de vida de solicitud de reintegro | Como Gerente, quiero revisar, aprobar o rechazar solicitudes de reintegro, para controlar el proceso de devolucion y entrega de materiales. | Must |
| US-061 | Registrar procesamiento del reembolso y entrega del paquete | Como Gerente o Administrador, quiero registrar el pago del reembolso y la entrega del paquete fotografico, para cerrar el ciclo de la solicitud de reintegro con trazabilidad completa. | Must |

---

### EP-07 — Gestion de Inconformidades

| ID | Titulo | Como / Quiero / Para | Prioridad |
|----|--------|----------------------|-----------|
| US-031 | Registrar inconformidad | Como cualquier usuario interno, quiero registrar una inconformidad con categoria predefinida, campo libre de descripcion, Promocion y estudiante asociados, para que el gerente reciba una notificacion automatica y el afectado reciba un acuse de recibo con numero de referencia. | Must |
| US-032 | Recibir acuse de recibo como afectado | Como estudiante o padre afectado, quiero recibir automaticamente una notificacion por email o SMS al momento de registrarse la inconformidad, con un numero de referencia y el plazo de resolucion (el SLA configurado en el sistema, por defecto: 3 dias calendario), para saber que mi caso fue recibido. | Must |
| US-033 | Gestionar y cerrar inconformidad | Como gerente, quiero investigar la inconformidad, contactar al afectado directamente (fuera del sistema) y cerrar la inconformidad en el sistema con el resumen de la resolucion, para que el sistema notifique automaticamente al afectado con el cierre. | Must |
| US-034 | Recibir notificacion de cierre de inconformidad | Como estudiante o padre afectado, quiero recibir automaticamente una notificacion por email o SMS cuando el gerente cierre la inconformidad, con el resumen de la resolucion, para tener confirmacion formal del cierre. | Must |
| US-062 | Registrar SLA vigente al crear una inconformidad | Como sistema, quiero guardar el valor de SLA activo al momento de registrar una inconformidad, para que cambios futuros en la configuracion no alteren las metricas historicas ni los SLAs ya comprometidos. | Must |

---

### EP-08 — Administracion del Sistema

| ID | Titulo | Como / Quiero / Para | Prioridad |
|----|--------|----------------------|-----------|
| US-035 | Gestionar usuarios y colaboradores con roles multiples | Como administrador, quiero crear, modificar y desactivar cuentas de colaboradores internos, asignarles uno o multiples roles simultaneos, y registrar sus datos de perfil obligatorios (nombre completo, telefono, numero de documento, pais, departamento, ciudad), para controlar los permisos de acceso al sistema y tener el perfil completo del colaborador. | Must |
| US-036 | Gestionar catalogo de items | Como administrador, quiero crear, editar, activar y desactivar items del catalogo global (nombre, descripcion, categoria, precio en COP — puede ser 0), para mantener actualizado el inventario de productos y servicios disponibles para armar paquetes. | Must |
| US-037 | Gestionar paquetes base | Como administrador, quiero crear paquetes base combinando items del catalogo con sus cantidades, duplicar un paquete base existente para crear variantes, y activar o desactivar paquetes, para ofrecer al comercial opciones de negociacion sin requerir construccion desde cero. | Must |
| US-038 | Consultar historial de incidentes por Promocion e institucion | Como gerente o administrador, quiero consultar el historial completo de inconformidades y escalaciones registradas para una Promocion especifica o para todos los registros de una institucion, para contar con informacion objetiva en futuras negociaciones contractuales. | Must |
| US-039 | Consultar reportes globales de cobro | Como gerente o administrador, quiero consultar los reportes de cierre de caja de cualquier sesion de cobro, incluyendo los pagos con excepcion (menores al 50%) y sus justificaciones, filtrando por fecha, cajero, Promocion o evento, para supervisar la operacion financiera y auditar excepciones. | Must |
| US-040 | Gestionar tablas maestras geograficas | Como administrador, quiero gestionar via la interfaz de administracion del sistema las entidades Pais, Departamento y Ciudad (CRUD), para mantener actualizadas las opciones de seleccion geografica en los perfiles de colaboradores. | Must |
| US-041 | Registrar evento Cena de Profesores | Como administrador o jefe de logistica, quiero registrar una Cena de Profesores asociada a una Promocion, con fecha, hora y sede (Hersa Casa Campestre), sabiendo que el sistema advertira si se intenta registrar una segunda cena en el mismo ciclo de Promocion, para gestionar este tipo de evento dentro del flujo normal. | Must |
| US-063 | Gestionar parametros globales del sistema | Como administrador, quiero poder ver y editar los parametros de configuracion global del sistema desde un panel dedicado, para ajustar comportamientos del sistema sin requerir cambios en el codigo. | Must |
| US-064 | Ver historial de cambios de configuracion | Como administrador, quiero ver el historial de cambios de cada parametro de configuracion, para auditar cuando y por quien se modificaron los valores del sistema. | Must |

---

### EP-09 — Pool de Personal Externo y Postulacion

| ID | Titulo | Como / Quiero / Para | Prioridad |
|----|--------|----------------------|-----------|
| US-042 | Gestionar pool de candidatos externos | Como administrador, quiero registrar candidatos en el pool de personal externo (nombre, email, telefono, roles disponibles, estado, fuente) y consultar el pool filtrando por rol o estado, para tener disponible el listado de personas interesadas en trabajar con Hersa en temporada de grados. | Must |
| US-043 | Enviar invitacion de postulacion masiva | Como administrador, quiero seleccionar un subconjunto de candidatos del pool (por rol o disponibilidad), generar un enlace unico de formulario por candidato y enviar simultaneamente el mensaje de postulacion por email y/o SMS, para reducir el tiempo de convocatoria frente al contacto individual. | Must |
| US-044 | Completar formulario de actualizacion de datos (candidato externo) | Como candidato externo, quiero acceder al formulario de actualizacion de datos mediante el enlace unico recibido (sin necesidad de login), completar mis datos de perfil obligatorios (nombre completo, telefono, numero de documento, pais, departamento, ciudad) y enviar el formulario, para quedar disponible para asignacion a eventos. | Must |
| US-045 | Consultar estado de postulaciones enviadas | Como administrador, quiero ver para cada envio de postulacion el estado del formulario (pendiente, completado) y la fecha de completado, para saber que candidatos estan listos para asignacion sin tener que contactarlos individualmente. | Should |
| US-065 | Publicar un slot de evento para postulacion | Como administrador, quiero publicar slots de eventos en el calendario de postulaciones, para que los candidatos externos puedan ver los eventos disponibles y postularse. | Must |
| US-066 | Gestionar estado y postulaciones de un slot | Como administrador, quiero revisar y gestionar las postulaciones recibidas en un slot, para confirmar la asignacion de personal externo a los eventos. | Must |
| US-067 | Duplicar un slot de evento | Como administrador, quiero duplicar un slot existente para crear uno nuevo con los mismos datos, para evitar ingresar la misma configuracion repetidamente cuando el mismo tipo de cobertura se repite en fechas distintas. | Should |
| US-068 | Ver calendario de slots disponibles y postularse | Como candidato externo (autenticado), quiero ver el calendario de eventos disponibles y postularme a los que me convengan, para participar en los eventos de Hersa sin esperar una convocatoria directa. | Must |
| US-069 | Actualizar perfil de candidato externo | Como candidato externo, quiero poder actualizar mi perfil en cualquier momento, para mantener mis datos actualizados y seguir siendo elegible para asignaciones. | Must |

---

### EP-10 — Asignacion Bulk de Personal y Rutas de Conductores

| ID | Titulo | Como / Quiero / Para | Prioridad |
|----|--------|----------------------|-----------|
| US-046 | Crear regla de asignacion bulk | Como jefe de logistica o administrador, quiero crear una regla de asignacion masiva definiendo el criterio (por auditorio o por rango de fechas), la lista de colaboradores con sus roles, y activarla o desactivarla, para asignar personal a multiples eventos con una sola accion. | Must |
| US-047 | Aplicar regla de asignacion bulk a eventos | Como jefe de logistica o administrador, quiero aplicar una regla bulk activa para que el sistema identifique todos los eventos que cumplen el criterio y cree las asignaciones individuales registrando que provienen de esa regla, para eliminar la asignacion evento por evento cuando el personal es recurrente. | Must |
| US-048 | Gestionar rutas de conductores | Como jefe de logistica o administrador, quiero crear y asignar rutas de conductor a eventos (con fecha, hora de salida, conductor asignado y paradas con orden, descripcion, hora estimada y tipo), para tener trazabilidad completa del transporte de estudiantes. | Must |
| US-049 | Sobreescribir asignacion bulk con asignacion individual | Como jefe de logistica o administrador, quiero poder asignar individualmente un colaborador a un evento especifico aunque ese evento ya tenga una asignacion bulk aplicada, para manejar excepciones sin alterar la regla general. | Should |

---

### EP-11 — Notificacion de Cambios a Colaboradores

| ID | Titulo | Como / Quiero / Para | Prioridad |
|----|--------|----------------------|-----------|
| US-050 | Iniciar notificacion de cambios a colaboradores del evento | Como administrador, quiero ver los colaboradores asignados a un evento, ver quienes ya recibieron una notificacion previa de ese evento, revisar un resumen de destinatarios y contenido del mensaje antes de enviar, y confirmar el envio por canal (email, SMS o ambos), para comunicar cambios de forma controlada sin reenviar a quien ya fue notificado. | Must |
| US-051 | Registrar envio de notificacion a colaborador | Como sistema, quiero registrar cada notificacion enviada a cada colaborador (evento, mensaje, canal, estado de envio, marca de tiempo) y marcar a los colaboradores ya notificados, para impedir duplicados por defecto y dar trazabilidad al administrador. | Must |
| US-052 | Forzar reenvio de notificacion a colaborador ya notificado | Como administrador, quiero poder forzar el reenvio de una notificacion a un colaborador especifico que ya la recibio (con confirmacion adicional del sistema), para casos excepcionales donde el colaborador requiere recordatorio. | Could |

---

### EP-12 — Calendario de Eventos para Colaboradores

| ID | Titulo | Como / Quiero / Para | Prioridad |
|----|--------|----------------------|-----------|
| US-053 | Ver calendario de eventos propios | Como colaborador autenticado, quiero ver en un calendario los eventos a los que estoy asignado, categorizados por tipo de evento (toma fotografica, prom, grado, varios, cena profesores), con el estado de cada evento y un indicador visual cuando el evento fue modificado en las ultimas 48 horas, para planificar mi trabajo y detectar rapidamente cambios recientes. | Must |
| US-054 | Ver calendario de todos los eventos de la empresa | Como colaborador autenticado, quiero acceder a una vista secundaria que muestre todos los eventos de la empresa (no solo mis asignados), para tener contexto del calendario operativo completo de Hersa. | Should |

---

### EP-13 — Cotizador de Paquetes

| ID | Titulo | Como / Quiero / Para | Prioridad |
|----|--------|----------------------|-----------|
| US-070 | Crear cotizacion | Como comercial, quiero crear una cotizacion seleccionando institucion y opcionalmente un paquete base, para iniciar una negociacion formal pre-venta. | Must |
| US-071 | Agregar/quitar items a la cotizacion | Como comercial, quiero personalizar los items del catalogo en la cotizacion, para ajustar la propuesta a las necesidades de la institucion. | Must |
| US-072 | Generar PDF de cotizacion | Como comercial, quiero generar un PDF con los detalles de la cotizacion para presentar al cliente, para formalizar la propuesta de forma profesional. | Must |
| US-073 | Convertir cotizacion en Promocion | Como comercial, quiero convertir la cotizacion aceptada en la Promocion formal con un solo paso, para evitar duplicar la carga de datos al cerrar la negociacion. | Must |
| US-074 | Gestionar estados de cotizacion | Como comercial, quiero cambiar el estado de la cotizacion (enviada, aceptada, rechazada), para tener trazabilidad del avance de cada negociacion. | Must |
| US-075 | Ver dashboard de cotizaciones | Como Gerente, quiero tener visibilidad de todas las cotizaciones activas y su estado, para supervisar el pipeline comercial. | Should |
| US-076 | Duplicar cotizacion | Como comercial, quiero duplicar una cotizacion enviada para crear una version modificada, para renegociar sin perder la propuesta original. | Should |

---

## 3. Criterios de Aceptacion por Historia

### US-001 — Registrar visita de prospecto

**Given** que el comercial necesita agendar una visita a una institucion educativa,
**When** el comercial ingresa la fecha de visita, el nombre de la institucion y el numero de contacto del director o rector y guarda el registro,
**Then** el sistema crea un registro de prospecto con estado "visita agendada", mostrando los datos ingresados y la fecha de creacion; y el registro queda disponible en la lista de prospectos del comercial.

---

### US-002 — Crear Promocion y registrar sus parametros

**Given** que la institucion educativa ha seleccionado a Hersa y el comercial dispone de los datos acordados,
**When** el comercial registra los atributos de la Promocion (institucion, grado academico [Preescolar, Primaria, Secundaria, Bachillerato, General], jornada [Diurna, Nocturna, Sabatina], ano) junto con los parametros de contrato (fechas tentativas de toma, fecha del Prom, sede del grado, precio del paquete por estudiante, tarjetas de invitacion por estudiante),
**Then** el sistema crea la Promocion con estado "vinculada", la asocia a la institucion educativa como FK, y dispara las notificaciones automaticas de primer registro de fecha (US-010) para cada fecha registrada.

**Invariante:** La combinacion (institucion + grado + jornada + ano) debe ser unica en el sistema. Si ya existe una Promocion con esa combinacion, el sistema muestra un error de validacion y no crea el duplicado.

---

### US-003 — Registrar fecha de grado posteriormente

**Given** que la Promocion fue creada sin fecha de grado definida,
**When** el comercial accede al perfil de la Promocion y registra la fecha de grado antes de la fecha del Prom,
**Then** el sistema guarda la fecha, actualiza el estado de completitud del perfil de la Promocion y dispara la notificacion automatica de registro de fecha (US-010) a los contactos vinculados.

**Negative path:** Si el comercial intenta registrar una fecha de grado anterior a la fecha del Prom ya registrada, el sistema muestra un error de validacion y no guarda el dato.

---

### US-004 — Registrar contactos vinculados a la Promocion

**Given** que la Promocion ya esta registrada en el sistema,
**When** el comercial agrega el email y/o telefono del representante de padres y del delegado estudiantil como contactos de la Promocion,
**Then** el sistema los vincula a la Promocion y quedan disponibles como destinatarios de todas las notificaciones automaticas futuras.

**Regla:** Al menos uno de email o telefono debe estar presente por contacto.

---

### US-005 — Actualizar fecha de evento de la Promocion

**Given** que una fecha de evento (toma fotografica, Prom, Varios o grado) ya esta registrada para una Promocion,
**When** un usuario con permisos actualiza esa fecha con un nuevo valor,
**Then** el sistema actualiza el campo conservando el valor anterior en el historial de cambios, y dispara automaticamente la notificacion de cambio de fecha (US-011) a todos los contactos vinculados a esa Promocion.

**Invariante:** Los datos previos del evento (pagos, registros de estudiantes) no se eliminan al cambiar la fecha.

---

### US-006 — Seleccionar paquete base y crear snapshot para la Promocion

**Given** que la Promocion esta en proceso de vinculacion y el comercial ha seleccionado un paquete base del catalogo,
**When** el comercial agrega o quita items del paquete base para la negociacion especifica de esa Promocion y guarda los cambios,
**Then** el sistema crea automaticamente un PaquetePromocion (snapshot) asociado a esa Promocion, con los items resultantes; el paquete base original y los snapshots de otras Promociones no son afectados. El precio del paquete resultante queda definido en la Promocion.

---

### US-007 — Auto-registrarse como estudiante via enlace o QR

**Given** que el delegado estudiantil ha compartido el enlace o QR de auto-registro con el grupo,
**When** el estudiante accede al enlace o QR y completa el formulario con nombre completo, numero de documento, telefono, email, talla de toga y lo envia,
**Then** el sistema valida los campos obligatorios (numero de documento: solo digitos, 6-12 caracteres; telefono: solo digitos, 7-15 caracteres; email: formato valido), crea el perfil del estudiante vinculado a la Promocion y grupo correspondiente con estado "registrado - pendiente de pago", sin requerir creacion de cuenta de usuario.

**Regla de cierre:** Una vez el estudiante tiene pago completo registrado (saldo = 0), el enlace o QR queda invalidado. Si intenta acceder, el sistema muestra un mensaje de registro cerrado.

---

### US-008 — Registrar estudiante presencialmente

**Given** que el cajero tiene una sesion de cobro abierta y el estudiante se acerca sin registro previo,
**When** el cajero busca al estudiante por Promocion + nombre o numero de documento y no lo encuentra, y completa el formulario de registro,
**Then** el sistema crea el perfil del estudiante con estado "registrado - pendiente de pago" y el cajero puede proceder al registro del pago sin pasos adicionales.

---

### US-009 — Registrar cantidad de estudiantes por grupo

**Given** que la Promocion tiene uno o mas grupos definidos,
**When** el comercial registra la cantidad de estudiantes para un grupo especifico (ej. grado 11A, 35 estudiantes),
**Then** el sistema asocia ese conteo al grupo dentro de la Promocion correcta, disponible para logistica de turnos y buses.

---

### US-010 — Notificar registro de fecha a contactos

**Given** que un usuario con permisos registra por primera vez una fecha de evento para una Promocion con al menos un contacto registrado,
**When** el sistema guarda exitosamente la fecha,
**Then** el sistema envia automaticamente un mensaje por email y/o SMS a todos los contactos registrados de esa Promocion con la fecha confirmada y el tipo de evento; el envio queda registrado con marca de tiempo y destinatarios.

**Edge case:** Si la Promocion no tiene contactos registrados al momento del registro de la fecha, el sistema omite el envio y registra la advertencia en el log.

---

### US-011 — Notificar cambio de fecha a contactos

**Given** que una fecha de evento ya registrada es actualizada por un usuario con permisos,
**When** el sistema guarda exitosamente la nueva fecha,
**Then** el sistema envia automaticamente un mensaje por email y/o SMS a todos los contactos vinculados a esa Promocion informando el cambio con los valores anterior y nuevo de la fecha; el envio queda registrado.

---

### US-012 — Notificar pago registrado al estudiante y padre

**Given** que el cajero ha registrado exitosamente un pago para un estudiante que tiene email y/o telefono registrados,
**When** el sistema confirma el registro del pago,
**Then** el sistema envia automaticamente un mensaje al estudiante y al padre/acudiente (si esta registrado) con el monto pagado, el saldo pendiente y la referencia de la transaccion; el envio queda registrado con marca de tiempo.

---

### US-013 — Notificar descuento por ausencia al estudiante

**Given** que el cajero ha cerrado activamente el grupo y el sistema ha ejecutado el cruce de ausentes,
**When** el sistema identifica a un estudiante como ausente y le aplica el descuento de $10.000 COP,
**Then** el sistema envia automaticamente una notificacion al estudiante informando el descuento aplicado y las opciones disponibles (sesion Varios o Prom); el envio queda registrado.

---

### US-014 — Notificar saldo pendiente 48-24 h antes del grado

**Given** que faltan entre 48 y 24 horas para el dia de grado de una Promocion,
**When** el sistema ejecuta la verificacion programada de saldos pendientes,
**Then** el sistema envia automaticamente una notificacion por email y/o SMS a cada estudiante con saldo pendiente y a su padre/acudiente registrado, indicando el monto adeudado y la fecha limite; el envio queda registrado.

**Edge case:** Estudiantes con saldo = 0 no reciben notificacion.

---

### US-015 — Abrir sesion de cobro

**Given** que el cajero tiene credenciales activas en el sistema,
**When** el cajero inicia sesion y abre una sesion de cobro seleccionando la Promocion, el grupo y el evento correspondiente,
**Then** el sistema crea una sesion de cobro activa asociada al cajero, Promocion, grupo y evento; la sesion queda en estado "abierta".

**Regla:** Multiples cajeros pueden operar sesiones simultaneas para el mismo evento con credenciales distintas (multi-cajero). Cada sesion queda asociada a un cajero especifico.

---

### US-016 — Registrar pago de estudiante con pago minimo flexible

**Nota de flujo:** El vestidor mide fisicamente la talla de toga del estudiante ANTES de que este pase al cajero. El vestidor no registra nada en el sistema; es el cajero el unico actor que registra la talla en el formulario de pago.

**Given** que el cajero tiene una sesion de cobro abierta y ha localizado al estudiante en el sistema,
**When** el cajero registra el monto pagado en efectivo:
- Si el monto es >= 50% del paquete: el sistema registra el pago sin requerir justificacion.
- Si el monto es < 50% del paquete: el sistema requiere que el cajero ingrese una justificacion escrita en el campo `comentario` antes de permitir guardar el pago. Sin justificacion, el sistema no permite guardar.
**Then** el sistema registra la transaccion con marca de tiempo, actor (cajero), monto y comentario (si aplica); actualiza el saldo del estudiante en tiempo real; cambia el estado del estudiante a "autorizado para toma"; y dispara la notificacion de pago (US-012).

**Negative path:** Si el monto ingresado es menor al 50% del paquete y el campo de justificacion esta vacio, el sistema muestra un error especifico y bloquea el guardado.

**Criterios de aceptacion — talla de toga:**
- [ ] El formulario de registro de pago incluye un campo "talla de toga" requerido
- [ ] Si el estudiante ya tiene talla registrada de una sesion anterior, el campo aparece pre-cargado y es editable
- [ ] Si el estudiante no tiene talla registrada y el cajero no ingresa una, el sistema bloquea el guardado del pago con mensaje de error claro: "Debes ingresar la talla de toga para continuar"
- [ ] El rol `vestidor` NO tiene permiso de escritura sobre el campo `talla_toga`; solo el cajero (y roles superiores) pueden escribir este campo
- [ ] Si el estudiante estuvo ausente en la toma original y paga en el Prom o en la sesion Varios, el campo talla_toga es requerido de la misma forma en esa sesion

---

### US-017 — Registrar add-ons al pago

**Given** que el cajero esta registrando o ya registro el pago base del estudiante,
**When** el cajero selecciona uno o mas add-ons disponibles (foto familiar $20.000 COP, foto grupal, poster 50x70 $50.000 COP) y los agrega al registro,
**Then** el sistema suma los add-ons al total de la sesion del estudiante, los desglosa en el registro de pago y los incluye en el reporte de cierre de caja de esa sesion.

---

### US-018 — Aplicar descuento autorizado por el gerente

**Given** que el gerente ha registrado previamente un descuento autorizado para un estudiante especifico,
**When** el cajero accede al perfil del estudiante durante la sesion de cobro,
**Then** el sistema muestra el descuento aprobado (monto, motivo y autorizador) aplicado automaticamente sobre el total, y el cajero solo cobra el monto neto resultante.

**Regla:** El cajero no puede ingresar ni modificar descuentos; solo visualiza los ya autorizados por el gerente.

---

### US-019 — Cerrar sesion de cobro y recibir reporte automatico

**Given** que el cajero decide cerrar su sesion de cobro activa,
**When** el cajero ejecuta la accion de cierre de sesion,
**Then** el sistema consolida todas las transacciones de esa sesion y genera automaticamente un reporte estructurado con: total cobrado, detalle por estudiante (monto, saldo pendiente, add-ons), resumen de descuentos aplicados, y listado de pagos con excepcion (menores al 50%) con su justificacion; el reporte queda disponible en tiempo real para el gerente y el administrador; el cajero recibe confirmacion de cierre exitoso.

---

### US-020 — Autorizar descuento como gerente

**Given** que un estudiante o situacion requiere un descuento sobre el precio del paquete,
**When** el gerente accede al perfil del estudiante y registra la autorizacion de descuento con monto, motivo y su usuario como autorizador,
**Then** el sistema guarda el descuento vinculado al estudiante con el registro completo (actor, monto, motivo, marca de tiempo) y lo expone al cajero en el momento del cobro.

---

### US-021 — Verificar autorizacion del estudiante para toma

**Given** que el fotografo necesita iniciar la toma fotografica de un estudiante,
**When** el fotografo busca al estudiante por nombre o numero de documento en el sistema,
**Then** el sistema muestra el estado actual del estudiante: "autorizado para toma" (pago minimo registrado) o "pendiente de pago" (sin pago o pago insuficiente); si el estado es "autorizado", el fotografo procede; si es "pendiente", el fotografo dirige al estudiante al cajero.

**Regla:** El comprobante impreso es un respaldo opcional para el estudiante, no el mecanismo de autorizacion del sistema.

---

### US-022 — Iniciar retoque fotografico en paralelo con las tomas

**Given** que el fotografo ya tiene fotos tomadas de los primeros estudiantes del dia,
**When** el fotografo inicia el proceso de retoque sobre esas fotos mientras el dia de toma continua con otros estudiantes,
**Then** el sistema permite que ambas actividades (toma y retoque) coexistan para el mismo evento del dia, sin requerir que el grupo este completamente cerrado para comenzar el retoque.

**Regla:** El retoque solo puede iniciarse sobre fotos que ya tienen estado "tomada" en el sistema.

---

### US-023 — Cruzar ausentes tras cierre del grupo

**Given** que la sesion del dia de toma fotografica para un grupo ha finalizado,
**When** el cajero o coordinador ejecuta el cierre activo del grupo en el sistema,
**Then** el sistema identifica automaticamente a todos los estudiantes del grupo que no tienen pago registrado (ausentes), les aplica el descuento de $10.000 COP y los marca como "ausente - pendiente de sesion alternativa"; la lista de ausentes queda disponible para el coordinador.

**Regla:** El cierre activo del grupo es un prerequisito deliberado; el sistema no ejecuta el cruce de ausentes sin esa accion.

---

### US-024 — Registrar atencion en sesion Varios

**Given** que un estudiante asiste a la sesion Varios,
**When** el cajero registra la atencion del estudiante con el motivo correspondiente (adicional, retoma, o recuperacion de ausente),
**Then** el sistema crea un registro de asistencia a Varios vinculado al estudiante con el motivo, la fecha de la sesion y el cajero que registro; el flujo de cobro optimizado (US-016) aplica igualmente si hay saldo o add-ons.

---

### US-025 — Confirmar dotacion de personal con 48 h de anticipacion

**Given** que falta mas de 48 horas para un evento,
**When** el coordinador de grado principal registra en el sistema la asignacion de personal (colaborador + rol asignado) para el evento,
**Then** el sistema guarda la asignacion con marca de tiempo; si la asignacion se hace con menos de 48 horas de anticipacion, el sistema muestra una advertencia pero permite guardar; el sistema notifica al gerente cuando falta cubrir al menos un rol critico (cajero o coordinador de grado).

---

### US-026 — Consultar pre-lista de estudiantes con saldo pendiente

**Given** que faltan 24 horas o menos para el dia de grado de un evento,
**When** el coordinador de grado o el cajero asignado consultan la lista de pendientes en el sistema,
**Then** el sistema muestra la lista de estudiantes con saldo pendiente para ese evento con nombre, monto adeudado y telefono de contacto; la lista fue generada automaticamente con al menos 24 horas de anticipacion.

---

### US-027 — Validar saldo del estudiante en sala y cobrar si aplica

**Given** que el cajero esta en sala el dia de grado y atiende a un estudiante,
**When** el cajero consulta el saldo del estudiante en el sistema,
**Then** si el saldo es cero, el sistema confirma "paquete habilitado para entrega"; si hay saldo pendiente, el sistema indica el monto a cobrar y solo habilita la entrega tras registrar el pago completo.

**Regla:** Ningun paquete se entrega con saldo pendiente sin excepcion.

---

### US-028 — Entregar paquete fotografico con pago completo

**Given** que el cajero ha confirmado saldo en cero para el estudiante,
**When** el coordinador de grado registra la entrega del paquete fotografico al estudiante,
**Then** el sistema cambia el estado del estudiante a "paquete entregado" con marca de tiempo y usuario que registro la entrega; el registro es inmutable.

---

### US-029 — Registrar escalacion del gerente en sala

**Given** que el gerente necesita intervenir para resolver un problema mayor en el dia de grado,
**When** el gerente registra la escalacion en el sistema con el motivo, el estudiante o padre involucrado y el resultado de la gestion,
**Then** el sistema guarda el registro de escalacion con marca de tiempo y actor en el historial de incidentes de la Promocion, aunque el contacto con el afectado se haya realizado fuera del sistema.

---

### US-030 — Cancelar masivamente tickets QR por no-graduacion

**Given** que se ha confirmado la no-graduacion de un estudiante (via subida del comprobante),
**When** el sistema procesa la confirmacion,
**Then** el sistema cancela e invalida automaticamente todos los tickets QR de invitacion de ese estudiante; cualquier intento de escaneo posterior de esos tickets es rechazado.

**Nota de flujo:** La cancelacion masiva de QR ocurre de forma inmediata el dia del grado. El reembolso del 50% del monto pagado y la entrega del paquete fotografico NO ocurren el dia del grado; se gestionan mediante el proceso de reintegro asincrono posterior (SolicitudReembolso — ver US-059, US-060, US-061). El endpoint `POST /api/estudiantes/{id}/no-graduacion/` confirma la no-graduacion y cancela los QR; la SolicitudReembolso se crea en un paso separado e independiente.

---

### US-031 — Registrar inconformidad

**Given** que un usuario interno ha identificado una inconformidad,
**When** el usuario completa el formulario de inconformidad (categoria predefinida, descripcion libre, Promocion, estudiante o padre afectado) y lo guarda,
**Then** el sistema asigna un numero de referencia unico, notifica automaticamente al gerente, notifica automaticamente al afectado con el numero de referencia y el plazo de resolucion (el SLA configurado en el sistema, por defecto: 3 dias calendario), y registra la fecha, hora y usuario que registro.

---

### US-032 — Recibir acuse de recibo como afectado

**Given** que se ha registrado una inconformidad que involucra a un estudiante o padre con contacto registrado,
**When** el sistema procesa exitosamente el registro,
**Then** el sistema envia automaticamente por email y/o SMS al afectado un mensaje con: numero de referencia, descripcion breve del caso, plazo de resolucion (el SLA configurado en el sistema, por defecto: 3 dias calendario) e informacion de contacto de Hersa para consultas urgentes; el envio queda registrado con marca de tiempo.

---

### US-033 — Gestionar y cerrar inconformidad

**Given** que el gerente ha recibido la notificacion de una inconformidad abierta,
**When** el gerente, tras investigar y contactar al afectado, cierra la inconformidad en el sistema registrando el resumen de la resolucion,
**Then** el sistema cambia el estado a "cerrada", registra la marca de tiempo de cierre y el resumen de resolucion, y dispara automaticamente la notificacion de cierre al afectado (US-034).

**Regla:** Solo el gerente puede cerrar una inconformidad.

---

### US-034 — Recibir notificacion de cierre de inconformidad

**Given** que el gerente ha cerrado una inconformidad con resumen de resolucion registrado,
**When** el sistema procesa el cierre,
**Then** el sistema envia automaticamente por email y/o SMS al afectado un mensaje con: numero de referencia, estado "resuelta", resumen de la resolucion y marca de tiempo del cierre; el envio queda registrado con marca de tiempo en el historial de notificaciones de esa inconformidad.

---

### US-062 — Registrar SLA vigente al crear una inconformidad

- **Como** sistema
- **Quiero** guardar el valor de SLA activo al momento de registrar una inconformidad
- **Para** que cambios futuros en la configuracion no alteren las metricas historicas ni los SLAs ya comprometidos

**Criterios de aceptacion:**
- [ ] Al crear una `Inconformidad`, el sistema registra en el campo `sla_aplicado` el valor actual de `ConfiguracionSistema.inconformidad.sla_dias`
- [ ] Los calculos de vencimiento y alerta de esa inconformidad usan `sla_aplicado`, no el valor actual de configuracion
- [ ] El campo `sla_aplicado` es inmutable una vez registrado
- [ ] El reporte de inconformidades muestra el SLA con el que fue registrada cada una

---

### US-035 — Gestionar usuarios y colaboradores con roles multiples

**Given** que el administrador necesita crear o modificar el acceso de un colaborador,
**When** el administrador crea o edita el perfil del colaborador con nombre completo, email, telefono, numero de documento, pais, departamento, ciudad, uno o multiples roles y estado (activo/inactivo),
**Then** el sistema guarda el perfil con los permisos correspondientes a todos los roles asignados; si es usuario nuevo, envia credenciales de acceso; si se desactiva, todas sus sesiones activas se invalidan.

---

### US-036 — Gestionar catalogo de items

**Given** que el administrador accede a la gestion del catalogo,
**When** el administrador crea un nuevo item con nombre, descripcion, categoria, precio en COP (puede ser 0) y estado activo,
**Then** el sistema guarda el item y lo hace disponible para la composicion de paquetes base; los items con precio 0 se identifican como "incluidos" y los de precio > 0 como "adicionales".

---

### US-037 — Gestionar paquetes base

**Given** que el administrador necesita crear o modificar un paquete base,
**When** el administrador crea un paquete base con nombre, descripcion, lista de items del catalogo con cantidades, y estado activo, o duplica un paquete base existente,
**Then** el sistema guarda el paquete base (o la copia con nombre diferenciado) disponible para negociacion; la duplicacion no afecta al paquete original.

---

### US-038 — Consultar historial de incidentes por Promocion e institucion

**Given** que el gerente o administrador necesita revisar el historial de una Promocion o institucion,
**When** accede al perfil de la Promocion o institucion y selecciona la seccion de historial de incidentes,
**Then** el sistema muestra la lista cronologica de inconformidades y escalaciones registradas con: fecha, tipo, actor que registro, resolucion y tiempo de cierre; el historial es de acceso exclusivo para gerente y administrador.

---

### US-039 — Consultar reportes globales de cobro

**Given** que el gerente o administrador necesita supervisar la operacion financiera,
**When** accede a los reportes globales y aplica filtros (fecha, cajero, Promocion, tipo de evento),
**Then** el sistema muestra el reporte consolidado con: total cobrado, desglose por cajero, saldos pendientes agregados, add-ons vendidos, y listado de pagos con excepcion (menores al 50%) con su justificacion para auditoria; los datos son en tiempo real.

---

### US-040 — Gestionar tablas maestras geograficas

**Given** que el administrador necesita mantener actualizadas las opciones geograficas del sistema,
**When** el administrador accede a la seccion de tablas maestras en la interfaz de administracion y crea, edita o desactiva un Pais, Departamento o Ciudad,
**Then** el sistema guarda los cambios; las opciones actualizadas quedan disponibles de inmediato en los formularios de perfil de colaborador; no se permiten entradas de texto libre para campos geograficos en ningun formulario del sistema.

---

### US-041 — Registrar evento Cena de Profesores

**Given** que una Promocion ya esta vinculada en el sistema,
**When** el administrador o jefe de logistica registra una Cena de Profesores asociada a esa Promocion con fecha, hora y sede (Hersa Casa Campestre),
**Then** el sistema crea el evento de tipo "cena_profesores" vinculado a la Promocion; si ya existe una Cena de Profesores en ese ciclo de Promocion, el sistema muestra una advertencia (pero permite guardar si el usuario confirma); el evento queda disponible para asignacion de personal (meseros, proveedor de alimentos) con minimo 48 horas de anticipacion.

---

### US-063 — Gestionar parametros globales del sistema

- **Como** Administrador
- **Quiero** poder ver y editar los parametros de configuracion global del sistema desde un panel dedicado
- **Para** ajustar comportamientos del sistema sin requerir cambios en el codigo

**Criterios de aceptacion:**
- [ ] Solo el rol `administrador` tiene acceso al panel de configuracion
- [ ] El panel muestra todos los parametros disponibles con su valor actual, tipo, descripcion y valor por defecto
- [ ] El administrador puede editar el valor de un parametro y guardarlo
- [ ] El sistema valida el valor antes de guardar: no nulo, tipo correcto (entero positivo para dias/horas), dentro de rangos razonables
- [ ] Al guardar, el cambio aplica unicamente a registros creados DESPUES de la modificacion; los registros existentes conservan su valor de SLA capturado en `sla_aplicado`
- [ ] Cada cambio queda registrado en un historial de configuracion: parametro, valor anterior, valor nuevo, usuario, timestamp

**Parametros iniciales obligatorios:**
| Clave | Tipo | Default | Descripcion |
|---|---|---|---|
| `inconformidad.sla_dias` | Entero positivo | 3 | Dias calendario para resolver una inconformidad |
| `inconformidad.alerta_horas_antes_vencimiento` | Entero positivo | 24 | Horas antes del vencimiento para disparar la alerta interna |

---

### US-064 — Ver historial de cambios de configuracion

- **Como** Administrador
- **Quiero** ver el historial de cambios de cada parametro de configuracion
- **Para** auditar cuando y por quien se modificaron los valores del sistema

**Criterios de aceptacion:**
- [ ] El historial muestra: parametro, valor anterior, valor nuevo, usuario que hizo el cambio, fecha y hora
- [ ] El historial es de solo lectura; no se puede editar ni borrar
- [ ] Se puede filtrar por parametro y por rango de fechas

---

### US-042 — Gestionar pool de candidatos externos

**Given** que el administrador accede al pool de personal externo,
**When** el administrador registra un nuevo candidato (nombre completo, email, telefono, roles disponibles [M2M], estado, fuente) o edita un candidato existente,
**Then** el sistema guarda el candidato con los datos indicados y lo hace visible en la lista del pool filtrable por rol o estado; los candidatos con perfil completo y estado "activo" quedan disponibles para asignacion a eventos.

---

### US-043 — Enviar invitacion de postulacion masiva

**Given** que el administrador ha seleccionado un subconjunto de candidatos del pool,
**When** el administrador configura el mensaje de postulacion, selecciona el canal (email, SMS o ambos) y confirma el envio,
**Then** el sistema genera un token de formulario unico para cada candidato seleccionado, envia simultaneamente el mensaje con el enlace de postulacion (embebido el token) a todos los seleccionados, registra cada PostulacionEnviada con estado "pendiente" y marca de tiempo; el envio no requiere accion individual por candidato.

---

### US-044 — Completar formulario de actualizacion de datos (candidato externo)

**Given** que un candidato externo ha recibido el enlace de postulacion con su token unico,
**When** el candidato accede al formulario (sin login), completa sus datos de perfil obligatorios (nombre completo, telefono, numero de documento, pais, departamento, ciudad desde tablas maestras) y envia el formulario,
**Then** el sistema valida los campos obligatorios, actualiza el perfil del CandidatoExterno con los datos ingresados, cambia el estado de la PostulacionEnviada a "completado", y cambia el estado del CandidatoExterno a "activo" (disponible para asignacion).

**Regla:** El token de formulario es de un solo uso; una vez completado el formulario, el enlace queda invalido para reenvios automaticos.

---

### US-045 — Consultar estado de postulaciones enviadas

**Given** que el administrador necesita saber que candidatos completaron el formulario,
**When** el administrador accede a la lista de postulaciones enviadas filtrada por fecha de envio o estado (pendiente, completado),
**Then** el sistema muestra para cada postulacion: nombre del candidato, canal utilizado, fecha de envio, estado del formulario y fecha de completado (si aplica); los candidatos con estado "completado" aparecen marcados como disponibles para asignacion.

---

### US-065 — Publicar un slot de evento para postulacion

- **Como** Administrador
- **Quiero** publicar slots de eventos en el calendario de postulaciones
- **Para** que los candidatos externos puedan ver los eventos disponibles y postularse

**Criterios de aceptacion:**
- [ ] El administrador puede crear un `SlotEvento` con: rol requerido, capacidad (numero de personas), hora de llegada, hora de salida estimada, descripcion, tipo de cobertura (evento especifico | dia completo en localidad), y fecha o evento asociado (opcional)
- [ ] El slot se crea en estado `disponible`
- [ ] Un slot puede estar vinculado a un `FechaEvento` especifico o a una localidad y fecha sin evento especifico asociado
- [ ] Solo usuarios con rol `administrador` o `jefe_logistica` pueden publicar slots

---

### US-066 — Gestionar estado y postulaciones de un slot

- **Como** Administrador
- **Quiero** revisar y gestionar las postulaciones recibidas en un slot
- **Para** confirmar la asignacion de personal externo a los eventos

**Criterios de aceptacion:**
- [ ] El administrador puede ver la lista de candidatos postulados a cada slot con su estado actual: `postulado`, `aceptado`, `rechazado`, `cancelado_por_candidato`
- [ ] Puede aceptar o rechazar postulaciones individualmente
- [ ] Al aceptar una postulacion, el sistema crea automaticamente la `AsignacionPersonalEvento` correspondiente con `origen = postulacion_slot`
- [ ] Antes de crear la asignacion, el sistema verifica si el candidato ya tiene una `AsignacionPersonalEvento` en el mismo horario; si hay conflicto, muestra una alerta (sin bloquear) y el administrador confirma explicitamente
- [ ] El administrador puede cambiar el estado del slot: `disponible` → `completo` → `cerrado` → `cancelado`
- [ ] Al cancelar un slot, todos los candidatos con postulacion en estado `postulado` reciben notificacion por email/SMS

---

### US-067 — Duplicar un slot de evento

- **Como** Administrador
- **Quiero** duplicar un slot existente para crear uno nuevo con los mismos datos
- **Para** evitar ingresar la misma configuracion repetidamente cuando el mismo tipo de cobertura se repite en fechas distintas

**Criterios de aceptacion:**
- [ ] La accion "Duplicar" copia todos los campos del slot (rol, capacidad, horario, descripcion, tipo) a un nuevo slot en estado `borrador`
- [ ] El administrador puede editar el slot duplicado antes de publicarlo
- [ ] El slot duplicado no hereda las postulaciones del original

---

### US-068 — Ver calendario de slots disponibles y postularse

- **Como** candidato externo (autenticado)
- **Quiero** ver el calendario de eventos disponibles y postularme a los que me convengan
- **Para** participar en los eventos de Hersa sin esperar una convocatoria directa

**Criterios de aceptacion:**
- [ ] El candidato autenticado puede ver el calendario de slots publicados con estado `disponible`
- [ ] Puede ver: rol requerido, fecha, hora de llegada y salida, descripcion, plazas disponibles (capacidad - aceptados)
- [ ] Puede postularse a un slot con un clic; su postulacion queda en estado `postulado`
- [ ] No puede postularse dos veces al mismo slot
- [ ] No puede postularse a slots con estado `cerrado` o `cancelado`
- [ ] Puede cancelar su propia postulacion si el slot aun esta `disponible`
- [ ] Recibe notificacion por email/SMS cuando su postulacion cambia a `aceptado` o `rechazado`
- [ ] Puede ver el estado de todas sus postulaciones activas en su perfil

---

### US-069 — Actualizar perfil de candidato externo

- **Como** candidato externo
- **Quiero** poder actualizar mi perfil en cualquier momento
- **Para** mantener mis datos actualizados y seguir siendo elegible para asignaciones

**Criterios de aceptacion:**
- [ ] El candidato puede editar los 6 campos obligatorios de su perfil: nombre, telefono, documento, pais, departamento, ciudad
- [ ] Al guardar, el sistema registra `fecha_ultima_actualizacion_perfil` con timestamp actual
- [ ] El sistema envia una notificacion/invitacion anual al candidato recordandole actualizar su perfil (campana automatica)
- [ ] El administrador puede filtrar candidatos cuyo perfil no ha sido actualizado en mas de N meses (parametro configurable)

**Estados de SlotEvento:** `disponible`, `completo`, `cerrado`, `cancelado`
**Estados de PostulacionSlot:** `postulado`, `aceptado`, `rechazado`, `cancelado_por_candidato`

---

### US-070 — Crear cotizacion

- **Como** comercial
- **Quiero** crear una cotizacion seleccionando institucion y opcionalmente un paquete base
- **Para** iniciar una negociacion formal pre-venta

**Criterios de aceptacion:**
- [ ] El comercial puede crear una `Cotizacion` seleccionando una institucion (registrada o prospecto aun sin Promocion formal)
- [ ] Puede seleccionar opcionalmente un paquete base como punto de partida; si no selecciona ninguno, empieza con items vacios
- [ ] Define: precio por estudiante, numero estimado de estudiantes; el sistema calcula el total estimado
- [ ] La cotizacion se crea en estado `borrador`
- [ ] Puede guardar y retomar la cotizacion en borrador sin perder los datos

---

### US-071 — Agregar/quitar items a la cotizacion

- **Como** comercial
- **Quiero** personalizar los items del catalogo en la cotizacion
- **Para** ajustar la propuesta a las necesidades de la institucion

**Criterios de aceptacion:**
- [ ] El comercial puede anadir items del catalogo global a la cotizacion o quitarlos
- [ ] Puede ajustar la cantidad y el precio unitario de cada item
- [ ] Los precios de items en la cotizacion son un snapshot al momento de guardar: cambios posteriores en el catalogo NO afectan cotizaciones ya guardadas
- [ ] El subtotal de la cotizacion se recalcula en tiempo real al modificar items

---

### US-072 — Generar PDF de cotizacion

- **Como** comercial
- **Quiero** generar un PDF con los detalles de la cotizacion para presentar al cliente
- **Para** formalizar la propuesta de forma profesional

**Criterios de aceptacion:**
- [ ] El comercial puede generar un PDF de la cotizacion en cualquier estado (borrador o posterior)
- [ ] El PDF incluye: logo de Hersa, nombre de la institucion, listado de items con precios, precio por estudiante, total estimado, y datos del comercial
- [ ] El formato visual del PDF se define durante la implementacion (referencia: brand-manual.md)
- [ ] El PDF se puede descargar o enviar por email directamente desde el sistema

---

### US-073 — Convertir cotizacion en Promocion

- **Como** comercial
- **Quiero** convertir la cotizacion aceptada en la Promocion formal con un solo paso
- **Para** evitar duplicar la carga de datos al cerrar la negociacion

**Criterios de aceptacion:**
- [ ] La accion "Convertir en Promocion" solo esta disponible cuando la cotizacion esta en estado `aceptada`
- [ ] Al ejecutar la conversion, el sistema:
  - a. Crea la `Promocion` con los atributos definidos en la cotizacion (institucion, grado, jornada, ano)
  - b. Crea el `PaquetePromocion` (snapshot) usando los items y precios de la cotizacion
  - c. Establece vinculo bidireccional: `Cotizacion.promocion_resultante` → FK a la nueva Promocion
  - d. Cambia el estado de la cotizacion a `convertida_a_promocion`
- [ ] La conversion falla con mensaje de error claro si ya existe una Promocion con la misma combinacion (institucion + grado + jornada + ano)
- [ ] La creacion directa de una Promocion sin cotizacion previa sigue siendo valida (el cotizador es herramienta auxiliar, no prerrequisito)

---

### US-074 — Gestionar estados de cotizacion

- **Como** comercial
- **Quiero** cambiar el estado de la cotizacion (enviada, aceptada, rechazada)
- **Para** tener trazabilidad del avance de cada negociacion

**Criterios de aceptacion:**
- [ ] El comercial puede marcar la cotizacion como `enviada` (indica que fue presentada al cliente)
- [ ] Puede marcar como `aceptada` o `rechazada` segun la respuesta del cliente
- [ ] Una cotizacion enviada NO es editable: para modificarla debe duplicarse (US-076)
- [ ] Una cotizacion puede tener fecha de vencimiento; al superarla, el sistema la marca automaticamente como `vencida`
- [ ] Una institucion puede tener multiples cotizaciones activas simultaneamente (distintas negociaciones o distintos grados)

---

### US-075 — Ver dashboard de cotizaciones

- **Como** Gerente
- **Quiero** tener visibilidad de todas las cotizaciones activas y su estado
- **Para** supervisar el pipeline comercial

**Criterios de aceptacion:**
- [ ] El Gerente puede ver todas las cotizaciones agrupadas por estado con: institucion, comercial asignado, total estimado, fecha de creacion y fecha de vencimiento
- [ ] Puede filtrar por estado, comercial, institucion y rango de fechas
- [ ] Puede ver el detalle de cualquier cotizacion

---

### US-076 — Duplicar cotizacion

- **Como** comercial
- **Quiero** duplicar una cotizacion enviada para crear una version modificada
- **Para** renegociar sin perder la propuesta original

**Criterios de aceptacion:**
- [ ] El comercial puede duplicar cualquier cotizacion (en cualquier estado) para crear una nueva en estado `borrador`
- [ ] La cotizacion duplicada copia todos los campos (institucion, items, precios snapshot, precio por estudiante) pero no copia el estado ni el vinculo con Promocion
- [ ] Los precios del duplicado son un nuevo snapshot al momento de la duplicacion (no del original)

**Estados de Cotizacion:** `borrador` → `enviada` → `aceptada` → `convertida_a_promocion` | `rechazada` | `vencida`

---

### US-046 — Crear regla de asignacion bulk

**Given** que el jefe de logistica o administrador necesita asignar el mismo personal a multiples eventos recurrentes,
**When** el usuario crea una ReglaAsignacionBulk definiendo el tipo (por_auditorio o por_rango_fechas), los parametros del criterio (nombre de auditorio o fechas inicio/fin), la lista de colaboradores con sus roles, y activa la regla,
**Then** el sistema guarda la regla con estado "activo"; la regla queda disponible para aplicacion manual a eventos que cumplan el criterio.

---

### US-047 — Aplicar regla de asignacion bulk a eventos

**Given** que existe una ReglaAsignacionBulk activa,
**When** el jefe de logistica o administrador aplica la regla,
**Then** el sistema identifica todos los FechaEvento que cumplen el criterio de la regla (auditorio o rango de fechas), crea AsignacionPersonalEvento para cada combinacion evento-colaborador-rol, y registra en cada asignacion el origen como "bulk" con referencia a la ReglaAsignacionBulk que la genero; el sistema muestra un resumen de cuantos eventos y asignaciones fueron creados.

---

### US-048 — Gestionar rutas de conductores

**Given** que el jefe de logistica necesita registrar el transporte de estudiantes para un evento,
**When** el usuario crea una Ruta asociada a un FechaEvento con conductor asignado, fecha y hora de salida, y agrega ParadasRuta con orden, descripcion del lugar, hora estimada y tipo (partida, recogida, destino),
**Then** el sistema guarda la ruta completa con sus paradas ordenadas, vinculada al evento y al conductor; la ruta puede ser creada via asignacion bulk o de forma individual.

---

### US-049 — Sobreescribir asignacion bulk con asignacion individual

**Given** que un evento tiene asignaciones provenientes de una regla bulk,
**When** el jefe de logistica o administrador registra una asignacion individual para ese mismo evento (mismo colaborador o colaborador diferente para el mismo rol),
**Then** el sistema guarda la asignacion individual con origen "individual", sobrescribiendo la asignacion bulk para ese colaborador y rol especifico en ese evento; la regla bulk no es modificada.

---

### US-050 — Iniciar notificacion de cambios a colaboradores del evento

**Given** que algo ha cambiado en un evento (fecha, lugar, hora) y el administrador necesita notificar a los colaboradores asignados,
**When** el administrador accede al evento, ve la lista de colaboradores asignados con indicacion de quienes ya recibieron una notificacion previa, redacta el mensaje, selecciona el canal (email, SMS o ambos) y revisa el resumen (cuantos recibiran la notificacion, cuantos ya la recibieron y seran excluidos por defecto, contenido del mensaje), y confirma el envio,
**Then** el sistema envia la notificacion a los colaboradores seleccionados (excluyendo por defecto a quienes ya la recibieron), registra cada NotificacionColaborador y sus DestinatarioNotificacion con estado y marca de tiempo, y el administrador ve la confirmacion del envio exitoso.

---

### US-051 — Registrar envio de notificacion a colaborador

**Given** que el administrador ha confirmado el envio de una notificacion a colaboradores de un evento,
**When** el sistema procesa el envio,
**Then** el sistema crea un registro de NotificacionColaborador por evento con el mensaje y canal, y un DestinatarioNotificacion por cada colaborador destinatario con estado (pendiente, enviado, fallido) y marca de tiempo; los colaboradores con estado "enviado" quedan marcados como ya notificados para ese evento.

---

### US-052 — Forzar reenvio de notificacion a colaborador ya notificado

**Given** que un colaborador ya fue notificado de un evento pero requiere un recordatorio,
**When** el administrador selecciona ese colaborador en la lista y solicita el reenvio, confirmando la accion en el dialogo de confirmacion adicional que muestra el sistema,
**Then** el sistema envia la notificacion al colaborador y registra el reenvio como un nuevo DestinatarioNotificacion adicional con marca de tiempo y origen "reenvio_forzado".

---

### US-053 — Ver calendario de eventos propios

**Given** que un colaborador autenticado accede a la seccion de calendario,
**When** el colaborador abre la vista principal del calendario,
**Then** el sistema muestra unicamente los eventos a los que el colaborador esta asignado, categorizados por tipo (toma_fotografica, prom, grado, varios, cena_profesores), con el estado de cada evento visible; los eventos que recibieron una NotificacionColaborador en las ultimas 48 horas muestran un indicador visual de "modificado recientemente".

---

### US-054 — Ver calendario de todos los eventos de la empresa

**Given** que un colaborador autenticado accede al calendario,
**When** el colaborador activa la vista general (todos los eventos de la empresa),
**Then** el sistema muestra todos los FechaEvento activos de Hersa, categorizados por tipo, independientemente de si el colaborador esta asignado o no; el indicador de "modificado recientemente" aplica igualmente.

---

### US-055 — Creacion bulk de Promociones

- **Como** comercial
- **Quiero** crear multiples Promociones de una institucion en un solo paso
- **Para** evitar repetir el formulario cuando una institucion tiene varios grados con el mismo paquete

**Criterios de aceptacion:**
- [ ] El formulario bulk permite seleccionar una institucion y un paquete base
- [ ] El comercial puede marcar multiples combinaciones (grado + jornada) para crear en el mismo lote
- [ ] Cada combinacion tiene un campo de precio editable individualmente
- [ ] Antes de confirmar, el sistema muestra un resumen de las N Promociones a crear: nombre, precio individual y estado de validacion (valido / duplicado / error)
- [ ] La creacion es atomica: si cualquier combinacion ya existe (duplicado) o tiene datos invalidos, no se crea ninguna y el sistema indica cual fallo y por que
- [ ] Cada Promocion creada tiene su propio snapshot de paquete independiente (`PaquetePromocion`), nunca compartido con otras del mismo lote
- [ ] El resultado muestra confirmacion de cuantas Promociones se crearon exitosamente

---

### US-056 — Vista previa y validacion del lote bulk

- **Como** comercial
- **Quiero** ver un resumen de validacion antes de confirmar la creacion bulk
- **Para** corregir errores sin perder la configuracion ya ingresada

**Criterios de aceptacion:**
- [ ] El resumen muestra: nombre de la Promocion, precio ingresado, y estado (valido / duplicado / error con descripcion)
- [ ] Una combinacion marcada como duplicada o invalida puede corregirse en el mismo formulario sin reiniciar el lote
- [ ] El boton de confirmacion solo esta habilitado cuando todos los registros del lote estan en estado valido

---

### US-057 — Autorizar obsequio de boletas adicionales

- **Como** Gerente (o usuario con permiso `autorizar_obsequio_boletas`)
- **Quiero** poder obsequiar boletas de invitacion sobrantes a estudiantes de una Promocion
- **Para** aprovechar las invitaciones no distribuidas sin que queden sin uso

**Criterios de aceptacion:**
- [ ] La accion de obsequio de boletas solo esta disponible para usuarios con permiso `autorizar_obsequio_boletas`
- [ ] El usuario puede elegir entre dos modalidades: individual (selecciona estudiantes especificos de la lista de la Promocion) o general (todos los estudiantes de la Promocion)
- [ ] El usuario define cuantas boletas adicionales recibira cada estudiante seleccionado
- [ ] El sistema genera los nuevos tokens QR con campo `origen = obsequio_prom`
- [ ] Cada token de obsequio queda registrado con: estudiante, autorizador (usuario), fecha y hora de emision
- [ ] Si la sede tiene aforo registrado y la suma de tokens activos (negociacion_inicial + obsequio_prom) supera ese aforo, el sistema muestra una alerta visible pero NO bloquea la operacion
- [ ] Los tokens de obsequio son de un solo uso e invalidables mediante los mismos mecanismos que los tokens normales

---

### US-058 — Visualizar tokens por tipo en reportes de invitaciones

- **Como** Gerente o Administrador
- **Quiero** ver los tokens de invitacion de un estudiante diferenciados por tipo
- **Para** distinguir los tokens negociados de los tokens de obsequio

**Criterios de aceptacion:**
- [ ] El reporte de tokens por estudiante muestra dos secciones: "Negociados" y "Obsequio"
- [ ] Cada token de obsequio muestra: cantidad, autorizador, fecha de emision
- [ ] El total de tokens activos (ambos tipos) se muestra en el resumen de la Promocion

---

### US-059 — Iniciar solicitud de reintegro por reprobacion

- **Como** estudiante no graduado (o su representante)
- **Quiero** poder iniciar una solicitud de reintegro despues del dia del grado
- **Para** recibir el reembolso del 50% y el paquete fotografico

**Criterios de aceptacion:**
- [ ] La solicitud de reintegro (`SolicitudReembolso`) se puede crear despues del dia del grado para el estudiante correspondiente
- [ ] El solicitante debe adjuntar el comprobante de no-graduacion (formatos aceptados: PDF, JPG, PNG)
- [ ] El comprobante es obligatorio para crear la solicitud; sin el el sistema bloquea el guardado
- [ ] Al crear la solicitud, el estado es `solicitado` y el Gerente recibe una notificacion automatica
- [ ] La solicitud queda vinculada al estudiante y a la Promocion

---

### US-060 — Gestionar ciclo de vida de solicitud de reintegro

- **Como** Gerente
- **Quiero** revisar, aprobar o rechazar solicitudes de reintegro
- **Para** controlar el proceso de devolucion y entrega de materiales

**Criterios de aceptacion:**
- [ ] El Gerente puede ver todas las solicitudes de reintegro pendientes con: nombre del estudiante, Promocion, fecha de solicitud, comprobante adjunto
- [ ] Solo el Gerente puede cambiar el estado de `solicitado` a `en_revision`, `aprobado` o `rechazado`
- [ ] Al aprobar, el sistema calcula automaticamente el monto del reembolso (50% del total pagado por el estudiante); este monto no es editable manualmente
- [ ] Al rechazar, el Gerente debe ingresar un comentario explicando el motivo
- [ ] El estudiante o representante recibe notificacion (email/SMS) al cambiar el estado de su solicitud

---

### US-061 — Registrar procesamiento del reembolso y entrega del paquete

- **Como** Gerente o Administrador
- **Quiero** registrar el pago del reembolso y la entrega del paquete fotografico
- **Para** cerrar el ciclo de la solicitud de reintegro con trazabilidad completa

**Criterios de aceptacion:**
- [ ] Al confirmar el pago fisico del reembolso, el usuario registra la referencia de la transferencia o pago y el estado cambia a `procesado`
- [ ] La entrega del paquete fotografico y album se registra con timestamp inmutable en el sistema
- [ ] La entrega se puede registrar independientemente del estado del reembolso monetario (puede entregarse el paquete aunque el reembolso aun este en proceso)
- [ ] El historial completo de cambios de estado queda registrado con usuario y timestamp en cada transicion

**Estados validos de SolicitudReembolso:** `solicitado` → `en_revision` → `aprobado` → `procesado` | `rechazado`

---

## 4. Entidades de Datos

### InstitucionEducativa

| Campo | Tipo | Restriccion |
|-------|------|-------------|
| id | UUID | PK, auto-generado |
| nombre | String | Not null |
| ciudad | String | Not null, default "Cali" |
| estado | Enum [prospecto, activa, inactiva] | Not null, default prospecto |
| creado_por | FK → Usuario | Not null |
| creado_en | DateTime | Auto, not null |
| actualizado_en | DateTime | Auto |

**Relaciones:** Una InstitucionEducativa tiene muchas Promociones, muchos Incidentes (agregados desde Promociones).

**Nota de migracion:** La entidad antes llamada "Institucion" con campos jornada, precio_paquete_cop y tarjetas_invitacion_por_estudiante migra esos campos a la entidad Promocion. La InstitucionEducativa es ahora solo el registro del colegio/entidad educativa.

---

### Promocion

| Campo | Tipo | Restriccion |
|-------|------|-------------|
| id | UUID | PK, auto-generado |
| institucion | FK → InstitucionEducativa | Not null |
| grado | Enum [Preescolar, Primaria, Secundaria, Bachillerato, General] | Not null |
| jornada | Enum [Diurna, Nocturna, Sabatina] | Not null |
| ano | Integer | Not null (ej. 2025, 2026) |
| precio_paquete_cop | Integer | Not null, > 0 |
| tarjetas_invitacion_por_estudiante | Integer | Not null, >= 0 |
| sede_grado | String | Nullable |
| estado | Enum [prospecto, vinculada, activa, finalizada] | Not null, default prospecto |
| creado_por | FK → Usuario | Not null |
| creado_en | DateTime | Auto |
| actualizado_en | DateTime | Auto |

**Restriccion de unicidad:** (institucion + grado + jornada + ano) debe ser unica.

**Relaciones:** Una Promocion pertenece a una InstitucionEducativa; tiene muchos Grupos, muchas FechasEvento, muchos Contactos, muchos Estudiantes, un PaquetePromocion activo, muchas Inconformidades, muchas Escalaciones.

---

### FechaEvento

| Campo | Tipo | Restriccion |
|-------|------|-------------|
| id | UUID | PK |
| promocion | FK → Promocion | Not null |
| tipo | Enum [toma_fotografica, prom, varios, grado, cena_profesores] | Not null |
| fecha | Date | Not null |
| hora | Time | Nullable |
| sede | String | Nullable |
| fecha_anterior | Date | Nullable (historial de cambios) |
| actualizado_por | FK → Usuario | Not null |
| actualizado_en | DateTime | Auto |

**Regla de validacion:** fecha tipo "grado" debe ser >= fecha tipo "prom" cuando ambas esten definidas para la misma Promocion.

**Regla Cena de Profesores:** El sistema advierte (pero no bloquea) si se intenta crear un segundo evento de tipo "cena_profesores" para la misma Promocion en el mismo ano.

**Relaciones:** Una FechaEvento pertenece a una Promocion; tiene muchas AsignacionPersonalEvento, muchas NotificacionesColaborador, muchas Rutas.

---

### ContactoPromocion

| Campo | Tipo | Restriccion |
|-------|------|-------------|
| id | UUID | PK |
| promocion | FK → Promocion | Not null |
| tipo | Enum [representante_padres, delegado_estudiantil] | Not null |
| nombre | String | Not null |
| email | String | Nullable, formato email |
| telefono | String | Nullable, formato local Colombia |
| activo | Boolean | Default true |

**Regla:** Al menos uno de email o telefono debe estar presente.

---

### Grupo

| Campo | Tipo | Restriccion |
|-------|------|-------------|
| id | UUID | PK |
| promocion | FK → Promocion | Not null |
| grado | String | Not null (ej. "11") |
| nombre | String | Not null (ej. "A", "B") |
| cantidad_estudiantes | Integer | Not null, > 0 |
| estado_toma | Enum [pendiente, en_progreso, cerrada] | Not null, default pendiente |

**Relaciones:** Un Grupo tiene muchos Estudiantes; pertenece a una Promocion.

---

### Estudiante

| Campo | Tipo | Restriccion |
|-------|------|-------------|
| id | UUID | PK |
| promocion | FK → Promocion | Not null |
| grupo | FK → Grupo | Not null |
| nombre_completo | String | Not null |
| numero_documento | String | Not null, unique por promocion |
| telefono | String | Nullable |
| email | String | Nullable |
| talla_toga | Enum [XS, S, M, L, XL, XXL] | Not null |
| estado_pago | Enum [pendiente, parcial, completo] | Not null, default pendiente |
| estado_toma | Enum [pendiente, autorizado, tomada, ausente] | Not null, default pendiente |
| estado_paquete | Enum [pendiente, listo, entregado] | Not null, default pendiente |
| saldo_pendiente_cop | Integer | Not null, >= 0 |
| total_paquete_cop | Integer | Not null, > 0 |
| descuento_aplicado_cop | Integer | Not null, default 0 |
| auto_registro | Boolean | Not null, default false |
| token_auto_registro | String | Nullable, unique |
| creado_en | DateTime | Auto |

**Relaciones:** Un Estudiante tiene muchos Pagos, muchos TicketsQR, puede tener una EntregaPaquete, puede tener Inconformidades.

---

### Pago

| Campo | Tipo | Restriccion |
|-------|------|-------------|
| id | UUID | PK |
| estudiante | FK → Estudiante | Not null |
| sesion_cobro | FK → SesionCobro | Not null |
| monto_cop | Integer | Not null, > 0 |
| metodo | Enum [efectivo] | Not null |
| tipo | Enum [paquete, add_on, saldo] | Not null |
| add_on_tipo | Enum [foto_familiar, foto_grupal, poster_50x70] | Nullable, solo si tipo = add_on |
| comentario | Text | Nullable; requerido si monto_cop < 50% del precio_paquete_cop del estudiante |
| registrado_por | FK → Usuario | Not null |
| registrado_en | DateTime | Auto |

**Regla:** Si monto_cop < 50% de Estudiante.total_paquete_cop, el campo comentario es obligatorio. El sistema bloquea el guardado si esta condicion no se cumple.

---

### DescuentoAutorizado

| Campo | Tipo | Restriccion |
|-------|------|-------------|
| id | UUID | PK |
| estudiante | FK → Estudiante | Not null |
| monto_cop | Integer | Not null, > 0 |
| motivo | String | Not null |
| autorizado_por | FK → Usuario (gerente) | Not null |
| autorizado_en | DateTime | Auto |
| aplicado | Boolean | Not null, default false |
| aplicado_en | DateTime | Nullable |

---

### SesionCobro

| Campo | Tipo | Restriccion |
|-------|------|-------------|
| id | UUID | PK |
| cajero | FK → Usuario | Not null |
| promocion | FK → Promocion | Not null |
| grupo | FK → Grupo | Nullable |
| evento_tipo | Enum [toma_fotografica, prom, varios, grado] | Not null |
| fecha_apertura | DateTime | Auto |
| fecha_cierre | DateTime | Nullable |
| estado | Enum [abierta, cerrada] | Not null, default abierta |
| total_cobrado_cop | Integer | Calculado al cierre |
| reporte_generado | Boolean | Not null, default false |

**Relaciones:** Una SesionCobro tiene muchos Pagos.

---

### ReporteCierreCaja

| Campo | Tipo | Restriccion |
|-------|------|-------------|
| id | UUID | PK |
| sesion_cobro | FK → SesionCobro | Not null, unique |
| total_cobrado_cop | Integer | Not null |
| total_add_ons_cop | Integer | Not null |
| total_descuentos_cop | Integer | Not null |
| cantidad_estudiantes_atendidos | Integer | Not null |
| saldos_pendientes_totales_cop | Integer | Not null |
| pagos_con_excepcion_count | Integer | Not null, default 0 |
| generado_en | DateTime | Auto |
| generado_por | Enum [sistema] | Auto |

---

### TicketQR

| Campo | Tipo | Restriccion |
|-------|------|-------------|
| id | UUID | PK |
| estudiante | FK → Estudiante | Not null |
| codigo_qr | String | Not null, unique |
| numero_tarjeta | Integer | Not null |
| estado | Enum [activo, usado, cancelado] | Not null, default activo |
| usado_en | DateTime | Nullable |
| cancelado_en | DateTime | Nullable |
| motivo_cancelacion | Enum [no_graduacion, otro] | Nullable |

---

### AsignacionPersonalEvento

| Campo | Tipo | Restriccion |
|-------|------|-------------|
| id | UUID | PK |
| evento_fecha | FK → FechaEvento | Not null |
| usuario | FK → Usuario | Not null |
| rol_asignado | Enum [coordinador, cajero, vestidor, jefe_logistica, bodega, secretaria, maestro_ceremonias, fotografo, conductor, grupo_musical, alimentos, mesero, vestidor_adicional] | Not null |
| origen | Enum [individual, bulk, postulacion_slot] | Not null, default individual |
| regla_bulk | FK → ReglaAsignacionBulk | Nullable, requerido si origen = bulk |
| postulacion_slot | FK → PostulacionSlot | Nullable, requerido si origen = postulacion_slot |
| confirmado_en | DateTime | Auto |
| confirmado_por | FK → Usuario | Not null |
| horas_anticipacion | Integer | Calculado al guardar |

---

### Inconformidad

| Campo | Tipo | Restriccion |
|-------|------|-------------|
| id | UUID | PK |
| numero_referencia | String | Not null, unique, auto-generado |
| promocion | FK → Promocion | Not null |
| estudiante | FK → Estudiante | Nullable |
| afectado_email | String | Nullable |
| afectado_telefono | String | Nullable |
| categoria | Enum [pago, fotografia, logistica, atencion, otro] | Not null |
| descripcion | Text | Not null |
| registrado_por | FK → Usuario | Not null |
| registrado_en | DateTime | Auto |
| estado | Enum [abierta, en_gestion, cerrada] | Not null, default abierta |
| resolucion | Text | Nullable, requerido al cerrar |
| cerrado_por | FK → Usuario | Nullable |
| cerrado_en | DateTime | Nullable |
| sla_aplicado | Integer | Not null, inmutable; valor de `ConfiguracionSistema.inconformidad.sla_dias` al momento del registro |
| sla_limite | DateTime | Auto, = registrado_en + sla_aplicado dias calendario |
| alerta_enviada | Boolean | Not null, default false |

---

### ConfiguracionSistema

| Campo | Tipo | Restriccion |
|-------|------|-------------|
| id | UUID | PK |
| clave | String | Not null, unique (ej. `inconformidad.sla_dias`) |
| valor | String | Not null |
| tipo | Enum [entero_positivo] | Not null |
| descripcion | Text | Not null |
| valor_defecto | String | Not null |
| actualizado_por | FK → Usuario | Nullable |
| actualizado_en | DateTime | Auto |

**Regla:** Solo el rol `administrador` puede escribir este modelo. La lectura puede ser realizada por el sistema internamente sin restriccion de rol.

---

### HistorialConfiguracion

| Campo | Tipo | Restriccion |
|-------|------|-------------|
| id | UUID | PK |
| configuracion | FK → ConfiguracionSistema | Not null |
| valor_anterior | String | Not null |
| valor_nuevo | String | Not null |
| cambiado_por | FK → Usuario | Not null |
| cambiado_en | DateTime | Auto |

**Regla:** Inmutable; ningun actor puede editar ni borrar registros de este modelo.

---

### SlotEvento

| Campo | Tipo | Restriccion |
|-------|------|-------------|
| id | UUID | PK |
| rol_requerido | String | Not null |
| capacidad | Integer | Not null, > 0 |
| hora_llegada | Time | Not null |
| hora_salida_estimada | Time | Not null |
| descripcion | Text | Nullable |
| tipo_cobertura | Enum [evento_especifico, dia_completo_localidad] | Not null |
| fecha_evento | FK → FechaEvento | Nullable |
| fecha | Date | Nullable (requerido si fecha_evento es null) |
| localidad | String | Nullable |
| estado | Enum [borrador, disponible, completo, cerrado, cancelado] | Not null, default disponible |
| creado_por | FK → Usuario | Not null |
| creado_en | DateTime | Auto |

**Relaciones:** Un SlotEvento tiene muchas PostulacionSlot.

---

### PostulacionSlot

| Campo | Tipo | Restriccion |
|-------|------|-------------|
| id | UUID | PK |
| slot | FK → SlotEvento | Not null |
| candidato | FK → CandidatoExterno | Not null |
| estado | Enum [postulado, aceptado, rechazado, cancelado_por_candidato] | Not null, default postulado |
| postulado_en | DateTime | Auto |
| actualizado_en | DateTime | Auto |

**Restriccion:** (slot + candidato) debe ser unico; un candidato no puede postularse dos veces al mismo slot.

---

### NotificacionEnviada

| Campo | Tipo | Restriccion |
|-------|------|-------------|
| id | UUID | PK |
| tipo | Enum [registro_fecha, cambio_fecha, pago_registrado, descuento_ausente, saldo_pendiente_grado, inconformidad_acuse, inconformidad_cierre, otro] | Not null |
| destinatario_email | String | Nullable |
| destinatario_telefono | String | Nullable |
| contenido_resumen | Text | Not null |
| enviado_en | DateTime | Auto |
| estado_envio | Enum [enviado, fallido, pendiente] | Not null |
| entidad_origen_tipo | String | Not null |
| entidad_origen_id | UUID | Not null |

---

### Escalacion

| Campo | Tipo | Restriccion |
|-------|------|-------------|
| id | UUID | PK |
| promocion | FK → Promocion | Not null |
| estudiante | FK → Estudiante | Nullable |
| motivo | Text | Not null |
| resultado | Text | Not null |
| registrado_por | FK → Usuario (gerente) | Not null |
| registrado_en | DateTime | Auto |
| evento_fecha | FK → FechaEvento | Nullable |

---

### Usuario (colaborador interno Hersa)

| Campo | Tipo | Restriccion |
|-------|------|-------------|
| id | UUID | PK |
| nombre_completo | String | Not null |
| email | String | Not null, unique |
| telefono | String | Not null |
| numero_documento | String | Not null |
| pais | FK → Pais | Not null |
| departamento | FK → Departamento | Not null |
| ciudad | FK → Ciudad | Not null |
| activo | Boolean | Not null, default true |
| creado_en | DateTime | Auto |

**Relacion M2M:** Un Usuario tiene muchos Roles a traves de la tabla UsuarioRol (usuario, rol, asignado_en, asignado_por).

**Roles disponibles (internos):** administrador, comercial, cajero, fotografo, coordinador_grado, gerente, vestidor, jefe_logistica, personal_bodega, secretaria.

**Roles disponibles (externos, pueden estar en Usuario o en CandidatoExterno segun el estado de la relacion):** conductor, maestro_ceremonia, grupo_musical, alimentos, mesero, vestidor_adicional.

---

### ItemCatalogo

| Campo | Tipo | Restriccion |
|-------|------|-------------|
| id | UUID | PK |
| nombre | String | Not null |
| descripcion | Text | Nullable |
| categoria | String | Not null |
| precio_cop | Integer | Not null, >= 0 |
| activo | Boolean | Not null, default true |

**Regla:** precio_cop = 0 → item "incluido"; precio_cop > 0 → item "adicional".

---

### PaqueteBase

| Campo | Tipo | Restriccion |
|-------|------|-------------|
| id | UUID | PK |
| nombre | String | Not null |
| descripcion | Text | Nullable |
| activo | Boolean | Not null, default true |
| creado_por | FK → Usuario | Not null |
| creado_en | DateTime | Auto |

**Relacion M2M:** PaqueteBase tiene muchos ItemCatalogo a traves de PaqueteBaseItem (paquete_base, item_catalogo, cantidad).

---

### PaquetePromocion

| Campo | Tipo | Restriccion |
|-------|------|-------------|
| id | UUID | PK |
| paquete_base_origen | FK → PaqueteBase | Not null (referencia al paquete original) |
| promocion | FK → Promocion | Not null, unique (una Promocion tiene un solo snapshot activo) |
| creado_en | DateTime | Auto |
| creado_por | FK → Usuario | Not null |

**Relacion M2M:** PaquetePromocion tiene muchos ItemCatalogo a traves de PaquetePromocionItem (paquete_promocion, item_catalogo, cantidad). Este es el snapshot; sus items son independientes del paquete base.

---

### Ruta

| Campo | Tipo | Restriccion |
|-------|------|-------------|
| id | UUID | PK |
| evento_fecha | FK → FechaEvento | Not null |
| conductor | FK → Usuario (rol conductor) | Not null |
| fecha | Date | Not null |
| hora_salida | Time | Not null |

**Relaciones:** Una Ruta tiene muchas ParadasRuta.

---

### ParadaRuta

| Campo | Tipo | Restriccion |
|-------|------|-------------|
| id | UUID | PK |
| ruta | FK → Ruta | Not null |
| orden | Integer | Not null |
| descripcion_lugar | String | Not null |
| hora_estimada | Time | Nullable |
| tipo | Enum [partida, recogida, destino] | Not null |

---

### CandidatoExterno

| Campo | Tipo | Restriccion |
|-------|------|-------------|
| id | UUID | PK |
| nombre_completo | String | Not null |
| email | String | Nullable |
| telefono | String | Nullable |
| numero_documento | String | Nullable |
| pais | FK → Pais | Nullable |
| departamento | FK → Departamento | Nullable |
| ciudad | FK → Ciudad | Nullable |
| estado | Enum [interesado, contactado, activo, inactivo] | Not null, default interesado |
| fuente | Enum [graduado_hersa, referido, externo] | Not null |
| creado_en | DateTime | Auto |
| fecha_ultima_actualizacion_perfil | DateTime | Nullable; se actualiza al guardar cambios en los 6 campos obligatorios |

**Relacion M2M:** CandidatoExterno tiene muchos Roles disponibles a traves de CandidatoExternoRol.

**Regla:** Para que el candidato pase a estado "activo" (disponible para asignacion), los campos nombre_completo, telefono, numero_documento, pais, departamento y ciudad deben estar completos.

---

### PostulacionEnviada

| Campo | Tipo | Restriccion |
|-------|------|-------------|
| id | UUID | PK |
| candidato | FK → CandidatoExterno | Not null |
| fecha_envio | DateTime | Auto |
| canal | Enum [email, sms, ambos] | Not null |
| token_formulario | String | Not null, unique |
| estado_formulario | Enum [pendiente, completado] | Not null, default pendiente |
| completado_en | DateTime | Nullable |

---

### ReglaAsignacionBulk

| Campo | Tipo | Restriccion |
|-------|------|-------------|
| id | UUID | PK |
| tipo | Enum [por_auditorio, por_rango_fechas] | Not null |
| auditorio | String | Nullable, requerido si tipo = por_auditorio |
| fecha_inicio | Date | Nullable, requerido si tipo = por_rango_fechas |
| fecha_fin | Date | Nullable, requerido si tipo = por_rango_fechas |
| activo | Boolean | Not null, default true |
| creado_por | FK → Usuario | Not null |
| creado_en | DateTime | Auto |

**Relacion:** ReglaAsignacionBulk tiene una lista de asignaciones a traves de ReglaAsignacionBulkDetalle (regla, usuario, rol).

---

### NotificacionColaborador

| Campo | Tipo | Restriccion |
|-------|------|-------------|
| id | UUID | PK |
| evento_fecha | FK → FechaEvento | Not null |
| mensaje | Text | Not null |
| canal | Enum [email, sms, ambos] | Not null |
| enviado_por | FK → Usuario | Not null |
| enviado_en | DateTime | Auto |

**Relaciones:** Una NotificacionColaborador tiene muchos DestinatarioNotificacion.

---

### DestinatarioNotificacion

| Campo | Tipo | Restriccion |
|-------|------|-------------|
| id | UUID | PK |
| notificacion | FK → NotificacionColaborador | Not null |
| colaborador | FK → Usuario | Not null |
| estado | Enum [pendiente, enviado, fallido] | Not null, default pendiente |
| enviado_en | DateTime | Nullable |
| origen | Enum [normal, reenvio_forzado] | Not null, default normal |

---

### Pais

| Campo | Tipo | Restriccion |
|-------|------|-------------|
| id | UUID | PK |
| nombre | String | Not null, unique |

---

### Departamento

| Campo | Tipo | Restriccion |
|-------|------|-------------|
| id | UUID | PK |
| nombre | String | Not null |
| pais | FK → Pais | Not null |

**Restriccion:** (nombre + pais) debe ser unico.

---

### Ciudad

| Campo | Tipo | Restriccion |
|-------|------|-------------|
| id | UUID | PK |
| nombre | String | Not null |
| departamento | FK → Departamento | Not null |

**Restriccion:** (nombre + departamento) debe ser unico.

---

### Cotizacion

| Campo | Tipo | Restriccion |
|-------|------|-------------|
| id | UUID | PK |
| institucion | FK → InstitucionEducativa | Not null |
| paquete_base_origen | FK → PaqueteBase | Nullable (solo referencia, no vinculacion viva) |
| grado_estimado | Enum [Preescolar, Primaria, Secundaria, Bachillerato, General] | Nullable |
| jornada_estimada | Enum [Diurna, Nocturna, Sabatina] | Nullable |
| ano_estimado | Integer | Nullable |
| estudiantes_estimados | Integer | Not null, > 0 |
| precio_por_estudiante | Decimal | Not null, >= 0 |
| total_estimado | Decimal | Calculado: precio_por_estudiante × estudiantes_estimados |
| estado | Enum [borrador, enviada, aceptada, rechazada, vencida, convertida_a_promocion] | Not null, default borrador |
| fecha_vencimiento | Date | Nullable |
| promocion_resultante | FK → Promocion | Nullable (se setea al convertir) |
| creada_por | FK → Usuario | Not null |
| creada_en | DateTime | Auto |
| actualizada_en | DateTime | Auto |

**Relaciones:** Una Cotizacion pertenece a una InstitucionEducativa; tiene muchos CotizacionItem; puede estar vinculada a una Promocion resultante.

---

### CotizacionItem

| Campo | Tipo | Restriccion |
|-------|------|-------------|
| id | UUID | PK |
| cotizacion | FK → Cotizacion | Not null |
| item_catalogo | FK → ItemCatalogo | Not null |
| nombre_snapshot | String | Not null (copia del nombre al momento de cotizar) |
| precio_unitario_snapshot | Decimal | Not null (copia del precio al momento de cotizar) |
| cantidad | Integer | Not null, > 0 |
| subtotal | Decimal | Calculado: precio_unitario_snapshot × cantidad |

**Regla:** Los campos `nombre_snapshot` y `precio_unitario_snapshot` son inmutables una vez guardados; cambios posteriores en el catalogo no los afectan.

---

## 5. Endpoints de API Sugeridos

### EP-01 — Instituciones y Promociones

| Metodo | Path | Descripcion | Request (campos clave) | Response (campos + status) |
|--------|------|-------------|------------------------|----------------------------|
| POST | /api/instituciones/ | Registrar nueva institucion educativa | nombre, ciudad | {id, nombre, estado} 201 |
| GET | /api/instituciones/ | Listar instituciones | ?q= | [{id, nombre, estado}] 200 |
| POST | /api/instituciones/{id}/promociones/ | Crear Promocion vinculada a la institucion | grado, jornada, ano, precio_paquete_cop, tarjetas_invitacion_por_estudiante, sede_grado | {id, grado, jornada, ano, estado} 201 |
| GET | /api/instituciones/{id}/promociones/ | Listar Promociones de la institucion | — | [{id, grado, jornada, ano, estado}] 200 |
| PATCH | /api/promociones/{id}/ | Actualizar parametros de la Promocion | precio_paquete_cop, tarjetas_invitacion_por_estudiante, sede_grado, estado | {id, estado} 200 |
| POST | /api/promociones/{id}/contactos/ | Agregar contacto a la Promocion | tipo, nombre, email, telefono | {id, tipo} 201 |
| POST | /api/promociones/{id}/fechas/ | Registrar o actualizar fecha de evento | tipo, fecha, hora, sede | {id, tipo, fecha, fecha_anterior} 201/200 — dispara notificacion automatica |
| GET | /api/promociones/{id}/fechas/ | Listar fechas de evento registradas | — | [{tipo, fecha, actualizado_en}] 200 |
| POST | /api/promociones/{id}/grupos/ | Registrar grupo de la Promocion | grado, nombre, cantidad_estudiantes | {id, grado, nombre} 201 |
| GET | /api/promociones/{id}/grupos/ | Listar grupos de la Promocion | — | [{id, grado, nombre, cantidad_estudiantes, estado_toma}] 200 |
| GET | /api/promociones/?sin_fecha_grado=true | Filtrar Promociones sin fecha de grado registrada | — | [{id, grado, jornada, ano, institucion}] 200 |

---

### EP-01 / EP-06 — Paquetes

| Metodo | Path | Descripcion | Request (campos clave) | Response (campos + status) |
|--------|------|-------------|------------------------|----------------------------|
| GET | /api/paquetes-base/ | Listar paquetes base activos | — | [{id, nombre, items_count}] 200 |
| POST | /api/paquetes-base/ | Crear paquete base | nombre, descripcion, items [{item_id, cantidad}] | {id, nombre} 201 |
| POST | /api/paquetes-base/{id}/duplicar/ | Duplicar paquete base | nuevo_nombre | {id, nombre} 201 |
| POST | /api/promociones/{id}/paquete/ | Crear snapshot del paquete para la Promocion (basado en un paquete base con modificaciones) | paquete_base_id, items_agregar [{item_id, cantidad}], items_quitar [item_id] | {id, paquete_base_origen_id, items[]} 201 |
| GET | /api/promociones/{id}/paquete/ | Consultar snapshot del paquete de la Promocion | — | {id, items[], precio_total_cop} 200 |

---

### EP-02 — Estudiantes

| Metodo | Path | Descripcion | Request (campos clave) | Response (campos + status) |
|--------|------|-------------|------------------------|----------------------------|
| POST | /api/estudiantes/auto-registro/ | Auto-registro publico del estudiante (sin autenticacion) | token_auto_registro, nombre_completo, numero_documento, telefono, email, talla_toga, grupo_id | {id, estado_pago} 201 |
| POST | /api/estudiantes/ | Registro presencial del estudiante por cajero | nombre_completo, numero_documento, promocion_id, grupo_id, talla_toga, telefono, email | {id, estado_pago} 201 |
| GET | /api/estudiantes/ | Buscar estudiante por Promocion + nombre o documento | ?promocion_id=&q= | [{id, nombre_completo, estado_pago, saldo_pendiente_cop}] 200 |

---

### EP-04 — Sesiones de Cobro y Pagos

| Metodo | Path | Descripcion | Request (campos clave) | Response (campos + status) |
|--------|------|-------------|------------------------|----------------------------|
| POST | /api/sesiones-cobro/ | Abrir sesion de cobro | promocion_id, evento_tipo, grupo_id (opcional) | {id, estado, fecha_apertura} 201 |
| POST | /api/sesiones-cobro/{id}/cerrar/ | Cerrar sesion y generar reporte automatico | — | {id, estado: "cerrada", reporte_id} 200 |
| GET | /api/sesiones-cobro/{id}/reporte/ | Consultar reporte de cierre de caja | — | {total_cobrado_cop, add_ons_cop, descuentos_cop, pagos_con_excepcion[], detalle_por_estudiante[]} 200 |
| POST | /api/pagos/ | Registrar pago de estudiante | estudiante_id, sesion_cobro_id, monto_cop, metodo, tipo, add_on_tipo (si aplica), comentario (si monto < 50%) | {id, saldo_pendiente_cop, estado_toma_actualizado} 201 |
| POST | /api/descuentos/ | Autorizar descuento (solo gerente) | estudiante_id, monto_cop, motivo | {id, monto_cop, autorizado_por} 201 |
| GET | /api/estudiantes/{id}/descuentos/ | Consultar descuentos autorizados del estudiante | — | [{id, monto_cop, motivo, autorizado_por, aplicado}] 200 |

---

### EP-05 — Gestion Fotografica

| Metodo | Path | Descripcion | Request (campos clave) | Response (campos + status) |
|--------|------|-------------|------------------------|----------------------------|
| GET | /api/estudiantes/{id}/estado-toma/ | Verificar autorizacion del estudiante para toma | — | {estado_toma, nombre_completo, estado_pago, saldo_pendiente_cop} 200 |
| POST | /api/grupos/{id}/cerrar-toma/ | Cierre activo del grupo por cajero/coordinador | — | {cruce_ejecutado: true, ausentes_count, descuento_aplicado_cop} 200 |
| POST | /api/sesiones-varios/ | Registrar atencion de estudiante en sesion Varios | estudiante_id, motivo, sesion_cobro_id | {id, motivo, registrado_en} 201 |
| PATCH | /api/estudiantes/{id}/estado-toma/ | Actualizar estado de toma del fotografo | estado_toma (tomada, en_retoque) | {id, estado_toma} 200 |

---

### EP-06 — Dia de Grado

| Metodo | Path | Descripcion | Request (campos clave) | Response (campos + status) |
|--------|------|-------------|------------------------|----------------------------|
| GET | /api/eventos/{fecha_evento_id}/saldos-pendientes/ | Pre-lista de estudiantes con saldo pendiente | — | [{estudiante_id, nombre_completo, saldo_pendiente_cop, telefono}] 200 |
| POST | /api/eventos/{fecha_evento_id}/asignacion-personal/ | Confirmar dotacion de personal para el evento | [{usuario_id, rol_asignado}] | {asignaciones_count, horas_anticipacion} 201 |
| POST | /api/entregas/ | Registrar entrega de paquete fotografico | estudiante_id, fecha_evento_id | {id, estado_paquete: "entregado", entregado_en} 201 — requiere saldo_pendiente = 0 |
| POST | /api/escalaciones/ | Registrar escalacion del gerente en sala | promocion_id, estudiante_id, motivo, resultado, fecha_evento_id | {id, registrado_en} 201 |
| POST | /api/estudiantes/{id}/no-graduacion/ | Confirmar no-graduacion y disparar cancelacion QR + reembolso | comprobante (archivo) | {tickets_cancelados_count, reembolso_iniciado: true} 200 |

---

### EP-07 — Inconformidades

| Metodo | Path | Descripcion | Request (campos clave) | Response (campos + status) |
|--------|------|-------------|------------------------|----------------------------|
| POST | /api/inconformidades/ | Registrar inconformidad | promocion_id, estudiante_id (opcional), categoria, descripcion, afectado_email, afectado_telefono | {id, numero_referencia, sla_limite} 201 — dispara notificaciones al gerente y afectado |
| GET | /api/inconformidades/ | Listar inconformidades con filtros | ?estado=&promocion_id=&desde= | [{id, numero_referencia, categoria, estado, registrado_en}] 200 |
| GET | /api/inconformidades/{id}/ | Detalle de inconformidad | — | {id, numero_referencia, categoria, descripcion, estado, historial_notificaciones[]} 200 |
| POST | /api/inconformidades/{id}/cerrar/ | Cerrar inconformidad con resolucion (solo gerente) | resolucion | {id, estado: "cerrada", cerrado_en} 200 — dispara notificacion al afectado |

---

### EP-08 — Administracion

| Metodo | Path | Descripcion | Request (campos clave) | Response (campos + status) |
|--------|------|-------------|------------------------|----------------------------|
| POST | /api/usuarios/ | Crear colaborador interno | nombre_completo, email, telefono, numero_documento, pais_id, departamento_id, ciudad_id, roles[] | {id, email, roles[]} 201 |
| PATCH | /api/usuarios/{id}/ | Modificar colaborador (roles, activo) | roles[], activo, telefono, pais_id, departamento_id, ciudad_id | {id, roles[], activo} 200 |
| GET | /api/promociones/{id}/incidentes/ | Historial de incidentes de la Promocion (gerente/admin) | — | [{tipo, fecha, descripcion, resolucion}] 200 |
| GET | /api/reportes/cobro/ | Reportes globales de cobro con filtros | ?desde=&hasta=&cajero_id=&promocion_id= | {total_cop, sesiones_count, pagos_excepcion[], detalle_sesiones[]} 200 |
| POST | /api/items-catalogo/ | Crear item del catalogo | nombre, descripcion, categoria, precio_cop, activo | {id, nombre, precio_cop} 201 |
| PATCH | /api/items-catalogo/{id}/ | Editar o desactivar item del catalogo | nombre, descripcion, precio_cop, activo | {id, activo} 200 |
| GET | /api/items-catalogo/ | Listar items activos del catalogo | ?categoria= | [{id, nombre, precio_cop, activo}] 200 |
| GET | /api/configuracion/ | Listar todos los parametros de configuracion del sistema (solo admin) | — | [{clave, valor, tipo, descripcion, valor_defecto, actualizado_en}] 200 |
| PATCH | /api/configuracion/{clave}/ | Editar valor de un parametro de configuracion (solo admin) | valor | {clave, valor_anterior, valor_nuevo} 200 |
| GET | /api/configuracion/{clave}/historial/ | Ver historial de cambios de un parametro (solo admin) | — | [{valor_anterior, valor_nuevo, cambiado_por, cambiado_en}] 200 |

---

### EP-09 — Pool de Personal Externo

| Metodo | Path | Descripcion | Request (campos clave) | Response (campos + status) |
|--------|------|-------------|------------------------|----------------------------|
| POST | /api/candidatos-externos/ | Registrar candidato en el pool | nombre_completo, email, telefono, roles_disponibles[], estado, fuente | {id, nombre_completo, estado} 201 |
| GET | /api/candidatos-externos/ | Listar candidatos del pool con filtros | ?rol=&estado= | [{id, nombre_completo, estado, roles[]}] 200 |
| PATCH | /api/candidatos-externos/{id}/ | Actualizar datos del candidato (autenticado) | nombre_completo, telefono, numero_documento, pais_id, departamento_id, ciudad_id | {id, estado, fecha_ultima_actualizacion_perfil} 200 |
| POST | /api/postulaciones/enviar-masivo/ | Enviar invitacion de postulacion masiva | candidatos_ids[], canal, mensaje | {enviadas_count, tokens_generados: true} 201 |
| GET | /api/postulaciones/ | Consultar estado de postulaciones enviadas | ?estado=&desde= | [{id, candidato_nombre, canal, estado_formulario, completado_en}] 200 |
| GET | /api/postulaciones/formulario/{token}/ | Acceso publico al formulario de actualizacion (sin auth) | — | {candidato_nombre, campos_requeridos[]} 200 |
| POST | /api/postulaciones/formulario/{token}/ | Envio del formulario de actualizacion de datos (sin auth) | nombre_completo, telefono, numero_documento, pais_id, departamento_id, ciudad_id | {estado: "completado"} 200 |
| POST | /api/slots/ | Publicar un slot de evento (admin/jefe_logistica) | rol_requerido, capacidad, hora_llegada, hora_salida_estimada, descripcion, tipo_cobertura, fecha_evento_id (opcional), fecha (opcional), localidad (opcional) | {id, estado} 201 |
| GET | /api/slots/ | Listar slots (admin ve todos; candidato ve solo disponibles) | ?estado=&rol=&desde= | [{id, rol_requerido, fecha, hora_llegada, hora_salida_estimada, plazas_disponibles, estado}] 200 |
| PATCH | /api/slots/{id}/ | Actualizar estado de un slot (admin/jefe_logistica) | estado | {id, estado} 200 |
| POST | /api/slots/{id}/duplicar/ | Duplicar un slot en estado borrador (admin/jefe_logistica) | — | {id, estado: "borrador"} 201 |
| GET | /api/slots/{id}/postulaciones/ | Listar postulaciones de un slot (admin/jefe_logistica) | — | [{candidato_id, nombre, estado, postulado_en}] 200 |
| PATCH | /api/slots/{id}/postulaciones/{postulacion_id}/ | Aceptar o rechazar una postulacion (admin/jefe_logistica) | estado (aceptado, rechazado) | {id, estado, asignacion_creada (si aceptado)} 200 |
| POST | /api/slots/{id}/postular/ | Candidato se postula a un slot (candidato autenticado) | — | {id, estado: "postulado"} 201 |
| DELETE | /api/slots/{id}/postular/ | Candidato cancela su propia postulacion | — | {estado: "cancelado_por_candidato"} 200 |

---

### EP-10 — Asignacion Bulk y Rutas

| Metodo | Path | Descripcion | Request (campos clave) | Response (campos + status) |
|--------|------|-------------|------------------------|----------------------------|
| POST | /api/reglas-bulk/ | Crear regla de asignacion bulk | tipo, auditorio (si aplica), fecha_inicio, fecha_fin (si aplica), asignaciones [{usuario_id, rol}], activo | {id, tipo, activo} 201 |
| GET | /api/reglas-bulk/ | Listar reglas bulk | ?tipo=&activo= | [{id, tipo, criterio, activo}] 200 |
| POST | /api/reglas-bulk/{id}/aplicar/ | Aplicar regla bulk a todos los eventos que cumplan el criterio | — | {eventos_afectados_count, asignaciones_creadas_count} 200 |
| PATCH | /api/reglas-bulk/{id}/ | Activar o desactivar regla bulk | activo | {id, activo} 200 |
| POST | /api/rutas/ | Crear ruta de conductor para un evento | evento_fecha_id, conductor_id, fecha, hora_salida, paradas [{orden, descripcion_lugar, hora_estimada, tipo}] | {id, conductor, paradas_count} 201 |
| GET | /api/eventos/{fecha_evento_id}/rutas/ | Listar rutas del evento | — | [{id, conductor, hora_salida, paradas[]}] 200 |
| POST | /api/eventos/{fecha_evento_id}/asignacion-personal/{asignacion_id}/sobreescribir/ | Sobreescribir asignacion bulk con asignacion individual | usuario_id, rol_asignado | {id, origen: "individual"} 200 |

---

### EP-11 — Notificacion a Colaboradores

| Metodo | Path | Descripcion | Request (campos clave) | Response (campos + status) |
|--------|------|-------------|------------------------|----------------------------|
| GET | /api/eventos/{fecha_evento_id}/colaboradores-asignados/ | Listar colaboradores asignados con estado de notificacion previa | — | [{usuario_id, nombre, rol, ya_notificado, notificado_en}] 200 |
| POST | /api/eventos/{fecha_evento_id}/notificar-colaboradores/ | Enviar notificacion a colaboradores del evento (con resumen previo opcional) | mensaje, canal, destinatarios_ids[], forzar_reenvio (default false) | {enviados_count, excluidos_por_duplicado_count, notificacion_id} 201 |
| GET | /api/eventos/{fecha_evento_id}/notificaciones-colaboradores/ | Historial de notificaciones enviadas a colaboradores del evento | — | [{notificacion_id, enviado_en, mensaje, destinatarios[]}] 200 |

---

### EP-12 — Calendario de Colaboradores

| Metodo | Path | Descripcion | Request (campos clave) | Response (campos + status) |
|--------|------|-------------|------------------------|----------------------------|
| GET | /api/calendario/mis-eventos/ | Eventos del colaborador autenticado | ?desde=&hasta= | [{id, tipo, fecha, promocion, estado, modificado_recientemente}] 200 |
| GET | /api/calendario/todos-los-eventos/ | Todos los eventos de la empresa | ?desde=&hasta=&tipo= | [{id, tipo, fecha, promocion, estado, modificado_recientemente}] 200 |

---

### EP-13 — Cotizador de Paquetes

| Metodo | Path | Descripcion | Request (campos clave) | Response (campos + status) |
|--------|------|-------------|------------------------|----------------------------|
| POST | /api/cotizaciones/ | Crear cotizacion | institucion_id, paquete_base_origen_id (opcional), grado_estimado, jornada_estimada, ano_estimado, estudiantes_estimados, precio_por_estudiante, fecha_vencimiento (opcional) | {id, estado: "borrador", total_estimado} 201 |
| GET | /api/cotizaciones/ | Listar cotizaciones con filtros | ?estado=&comercial_id=&institucion_id=&desde=&hasta= | [{id, institucion, estado, total_estimado, creada_por, fecha_vencimiento}] 200 |
| GET | /api/cotizaciones/{id}/ | Detalle de cotizacion | — | {id, institucion, estado, items[], total_estimado, creada_por, promocion_resultante} 200 |
| PATCH | /api/cotizaciones/{id}/ | Editar cotizacion en borrador | estudiantes_estimados, precio_por_estudiante, fecha_vencimiento | {id, total_estimado} 200 |
| POST | /api/cotizaciones/{id}/enviar/ | Marcar cotizacion como enviada | — | {id, estado: "enviada"} 200 |
| POST | /api/cotizaciones/{id}/aceptar/ | Marcar cotizacion como aceptada | — | {id, estado: "aceptada"} 200 |
| POST | /api/cotizaciones/{id}/rechazar/ | Marcar cotizacion como rechazada | — | {id, estado: "rechazada"} 200 |
| POST | /api/cotizaciones/{id}/convertir-promocion/ | Convertir cotizacion aceptada en Promocion | grado, jornada, ano (confirmar o sobreescribir estimados) | {id, estado: "convertida_a_promocion", promocion_id} 200 |
| POST | /api/cotizaciones/{id}/duplicar/ | Duplicar cotizacion como nueva en borrador | — | {id, estado: "borrador"} 201 |
| GET | /api/cotizaciones/{id}/pdf/ | Generar y descargar PDF de la cotizacion | — | archivo PDF 200 |
| POST | /api/cotizaciones/{id}/items/ | Anadir item a la cotizacion | item_catalogo_id, cantidad, precio_unitario_snapshot | {id, nombre_snapshot, subtotal} 201 |
| PATCH | /api/cotizaciones/{id}/items/{item_id}/ | Editar item de la cotizacion | cantidad, precio_unitario_snapshot | {id, subtotal} 200 |
| DELETE | /api/cotizaciones/{id}/items/{item_id}/ | Quitar item de la cotizacion | — | 204 |

---

### Tablas Maestras Geograficas (Django Admin)

Gestionadas exclusivamente via Django Admin. No se exponen endpoints publicos de mutacion. Solo lectura para formularios.

| Metodo | Path | Descripcion | Response |
|--------|------|-------------|---------|
| GET | /api/geografia/paises/ | Listar paises activos | [{id, nombre}] 200 |
| GET | /api/geografia/departamentos/?pais_id= | Listar departamentos por pais | [{id, nombre}] 200 |
| GET | /api/geografia/ciudades/?departamento_id= | Listar ciudades por departamento | [{id, nombre}] 200 |

---

## 6. Reglas de Negocio Criticas

**RN-01** — El contrato de servicio se firma entre el padre/acudiente y Hersa. La institucion educativa no firma el contrato, pero su aprobacion es prerequisito para iniciar el proceso. *(US-002, Entidad InstitucionEducativa)*

**RN-02** — La unidad operativa central del sistema es la Promocion, definida por (institucion + grado + jornada + ano). Una misma institucion puede tener multiples Promociones activas simultaneamente con precios y condiciones distintas. *(US-002, Entidad Promocion)*

**RN-03** — La combinacion (institucion + grado + jornada + ano) debe ser unica en el sistema. El sistema rechaza la creacion de una Promocion duplicada con un mensaje de validacion. *(US-002, Entidad Promocion)*

**RN-04** — La fecha de grado de una Promocion solo puede ser igual o posterior a la fecha del Prom de esa misma Promocion. Si se intenta registrar una fecha de grado anterior al Prom, el sistema rechaza el registro. *(US-003, Entidad FechaEvento)*

**RN-05** — El pago minimo en la toma fotografica es el 50% del valor total del paquete en efectivo por defecto. Si el cajero cobra menos del 50%, el campo `comentario` del registro de Pago es obligatorio. El sistema no permite guardar el pago con monto menor al 50% si el campo comentario esta vacio. *(US-016, Entidad Pago)*

**RN-06** — El reporte de cierre de caja generado al cerrar la sesion de cobro incluye de forma visible y separada todos los pagos con excepcion (monto menor al 50%) junto con su justificacion, para revision del gerente. *(US-019, Entidad ReporteCierreCaja)*

**RN-07** — Ningun paquete fotografico se entrega en el dia de grado si el estudiante tiene saldo pendiente. El sistema bloquea la accion de entrega hasta que el cajero registre el pago completo. Sin excepcion. *(US-027, US-028)*

**RN-08** — El estado "autorizado para toma" se asigna automaticamente por el sistema cuando el pago registrado cumple el minimo (50% o monto con justificacion aceptada). El fotografo no puede modificar este estado; solo puede consultarlo. *(US-016, US-021)*

**RN-09** — Solo el gerente (o usuario con rol gerente) puede autorizar descuentos sobre el precio del paquete. Los cajeros y comerciales no pueden ingresar ni modificar descuentos. *(US-018, US-020, Entidad DescuentoAutorizado)*

**RN-10** — El comprobante impreso de pago es un respaldo opcional para el estudiante, no el mecanismo de autorizacion del fotografo. El sistema es la unica fuente de verdad para la autorizacion de toma. *(US-021)*

**RN-11** — El cierre activo del grupo por el cajero o coordinador es el prerequisito obligatorio y deliberado para que el sistema ejecute el cruce de ausentes. El sistema no puede ejecutar el cruce sin ese acto de cierre. *(US-023)*

**RN-12** — El cruce de ausentes aplica automaticamente un descuento de $10.000 COP al saldo total del estudiante ausente y cambia su estado a "ausente - pendiente de sesion alternativa". *(US-023, US-013)*

**RN-13** — Ante la confirmacion de no-graduacion de un estudiante (comprobante subido), el sistema cancela e invalida masiva e inmediatamente todos sus tickets QR. El reembolso es del 50% del monto pagado. *(US-030)*

**RN-14** — Las invitaciones son tickets QR de un solo uso, invalidados en el escaneo de entrada. Los tickets sobrantes del Prom se entregan gratuitamente; nunca se venden. *(Entidad TicketQR)*

**RN-15** — Las notificaciones automaticas de registro y cambio de fecha se envian a todos los contactos registrados de la Promocion en el momento del evento (guardar en el sistema). El comercial no interviene en este envio. *(US-010, US-011)*

**RN-16** — El reporte de cierre de caja es generado exclusivamente por el sistema al cerrar la sesion de cobro. No existe un proceso manual de cierre de caja. *(US-019, Entidad ReporteCierreCaja)*

**RN-17** — Multiples cajeros pueden operar sesiones de cobro simultaneas para el mismo evento, cada uno con sus propias credenciales. *(US-015, Entidad SesionCobro)*

**RN-18** — La asignacion de personal para cualquier evento (grado, Prom, Cena de Profesores) debe registrarse con un minimo de 48 horas de anticipacion. El sistema permite registros con menos anticipacion mostrando una advertencia y notificando al gerente. *(US-025)*

**RN-19** — El sistema genera automaticamente la pre-lista de estudiantes con saldo pendiente entre 48 y 24 horas antes del dia de grado. El sistema notifica automaticamente a los estudiantes y padres con saldo pendiente en ese mismo ventana. *(US-026, US-014)*

**RN-20** — El SLA de resolucion de inconformidades es configurable en el sistema (por defecto: 3 dias calendario desde el registro). Cada `Inconformidad` almacena el valor de SLA vigente al momento de su creacion en el campo `sla_aplicado`; cambios posteriores en la configuracion no afectan inconformidades ya abiertas. El tiempo de alerta de escalacion interna tambien es configurable (`inconformidad.alerta_horas_antes_vencimiento`, por defecto: 24 horas antes del vencimiento). *(US-031, US-062, US-063, Entidad Inconformidad)*

**RN-21** — Solo el gerente puede cerrar una inconformidad. Ningun otro rol tiene permisos para cambiar el estado a "cerrada". *(US-033)*

**RN-22** — Al registrar una inconformidad, el sistema envia automaticamente dos notificaciones: (a) al gerente para accion, (b) al afectado como acuse de recibo con numero de referencia y plazo. *(US-031, US-032)*

**RN-23** — Al cerrar una inconformidad, el sistema envia automaticamente una notificacion al afectado con el resumen de la resolucion. *(US-033, US-034)*

**RN-24** — El historial de incidentes por Promocion e institucion es accesible exclusivamente para el gerente y el administrador. *(US-038)*

**RN-25** — Cada modelo de datos que involucre eventos debe estar escopado a una Promocion + fecha especificos, para soportar multiples ceremonias simultaneas. *(Entidades FechaEvento, SesionCobro, AsignacionPersonalEvento)*

**RN-26** — El acceso externo de padres y estudiantes no requiere creacion de cuenta de usuario. El mecanismo de acceso (token unico, documento + PIN, u OTP) es una decision tecnica pendiente. *(US-007)*

**RN-27** — Las fechas de eventos pueden actualizarse en cualquier momento. Los datos existentes (pagos, registros de estudiantes) no se pierden al cambiar una fecha. *(US-005, Entidad FechaEvento)*

**RN-28** — El enlace o QR de auto-registro de un estudiante se invalida automaticamente cuando el saldo del estudiante llega a cero. *(US-007)*

**RN-29** — El formulario de auto-registro valida: numero de documento (solo digitos, 6-12 caracteres), telefono (solo digitos, 7-15 caracteres), email (formato valido). El envio se bloquea si cualquier campo obligatorio falla la validacion. *(US-007)*

**RN-30** — La notificacion al gerente por dotacion de personal incompleta se dispara unicamente ante la ausencia de al menos un rol critico (cajero o coordinador de grado). *(US-025)*

**RN-31** — Cuando el comercial modifica un paquete base para una Promocion, el sistema crea automaticamente un PaquetePromocion (snapshot). Las modificaciones al snapshot no afectan al paquete base original ni a otras Promociones. *(US-006, Entidades PaqueteBase, PaquetePromocion)*

**RN-32** — Los items del catalogo con precio_cop = 0 son "incluidos" en el paquete. Los items con precio_cop > 0 son "adicionales". *(Entidad ItemCatalogo)*

**RN-33** — La Cena de Profesores esta incluida en el paquete negociado; no genera cobro adicional al estudiante ni a la institucion. El maximo por defecto es 1 por ciclo de Promocion; el sistema muestra una advertencia (pero permite guardar con confirmacion) si se intenta registrar una segunda cena para la misma Promocion. *(US-041, Entidad FechaEvento)*

**RN-34** — Todo colaborador (interno y externo) debe tener registrado nombre completo, telefono, numero de documento, pais, departamento y ciudad antes de poder ser asignado a un evento. Pais, Departamento y Ciudad se seleccionan desde tablas maestras; no se permiten entradas de texto libre para campos geograficos. *(US-035, Entidades Usuario, Pais, Departamento, Ciudad)*

**RN-35** — Un colaborador puede desempenar multiples roles de forma simultanea (relacion M2M entre Usuario y Rol). *(US-035, Entidad Usuario)*

**RN-36** — Para que un CandidatoExterno pase a estado "activo" (disponible para asignacion), su perfil debe tener completos los campos: nombre_completo, telefono, numero_documento, pais, departamento y ciudad. *(US-044, Entidad CandidatoExterno)*

**RN-37** — El token de formulario de postulacion es unico por candidato y por envio. Una vez el candidato completa el formulario, el token queda invalido para reenvios automaticos. *(US-044, Entidad PostulacionEnviada)*

**RN-38** — La asignacion bulk registra en cada AsignacionPersonalEvento generada el origen como "bulk" y la FK a la ReglaAsignacionBulk que la origino. Una asignacion individual posterior puede sobreescribir una bulk para ese evento especifico sin alterar la regla. *(US-047, US-049, Entidad AsignacionPersonalEvento)*

**RN-39** — La asignacion bulk aplica tambien para rutas de conductores a eventos. *(US-047, US-048)*

**RN-40** — La notificacion de cambios a colaboradores es un proceso manual iniciado por el administrador, no automatico. El sistema impide el reenvio a colaboradores que ya recibieron la notificacion del mismo evento, salvo que el administrador lo fuerce explicitamente con confirmacion adicional. *(US-050, US-051, US-052)*

**RN-41** — Antes de confirmar el envio de una notificacion a colaboradores, el sistema muestra al administrador un resumen de: cuantos colaboradores recibiran la notificacion, cuantos ya la recibieron (excluidos por defecto) y el contenido del mensaje. El administrador confirma antes de enviar. *(US-050)*

**RN-42** — El calendario de eventos es accesible unicamente para usuarios autenticados. Los eventos del calendario que hayan recibido una NotificacionColaborador en las ultimas 48 horas muestran un indicador visual de "modificado recientemente". *(US-053, US-054)*

**RN-43** — La Actividad Prom incluye servicio de alimentos y bebidas provisto por el rol externo "Alimentos". La asignacion del proveedor de alimentos debe registrarse con un minimo de 48 horas de anticipacion al evento. *(US-025, RN-18)*

---

## 7. Dependencias entre Historias

| Historia | Depende de | Razon |
|----------|------------|-------|
| US-002 | US-001 | La Promocion requiere que el prospecto (institucion) exista |
| US-003 | US-002 | La fecha de grado se agrega a una Promocion ya vinculada |
| US-004 | US-002 | Los contactos se vinculan a una Promocion ya registrada |
| US-005 | US-002 | Solo se puede actualizar una fecha previamente registrada |
| US-006 | US-002, US-037 | El snapshot de paquete requiere que la Promocion exista y que haya paquetes base disponibles |
| US-007 | US-002, US-009 | El auto-registro requiere que la Promocion y el grupo existan |
| US-008 | US-002, US-009 | El registro presencial requiere que la Promocion y el grupo existan |
| US-009 | US-002 | Los grupos se crean dentro de una Promocion existente |
| US-010 | US-004 | Las notificaciones de fecha requieren contactos registrados en la Promocion |
| US-011 | US-010 | El cambio de fecha supone que hubo un primer registro |
| US-012 | US-015, US-016 | La notificacion de pago requiere una sesion activa y un pago registrado |
| US-013 | US-023 | La notificacion de ausencia se dispara tras el cruce de ausentes |
| US-014 | US-002, US-003, US-016 | Requiere fecha de grado definida y pagos parciales registrados |
| US-015 | US-002 | La sesion de cobro debe estar asociada a una Promocion vinculada |
| US-016 | US-015, US-008 (o US-007) | El pago requiere sesion activa y estudiante registrado |
| US-017 | US-016 | Los add-ons se agregan al mismo registro de pago |
| US-018 | US-020, US-016 | El descuento debe estar autorizado antes del cobro |
| US-019 | US-015 | El cierre de sesion requiere que la sesion este abierta |
| US-020 | US-008 (o US-007) | El descuento se autoriza sobre un estudiante ya registrado |
| US-021 | US-016 | La verificacion de autorizacion depende del estado actualizado por un pago |
| US-022 | US-021 | El retoque solo puede iniciarse sobre fotos con estado "tomada" |
| US-023 | US-015 | El cierre de grupo requiere una sesion de cobro activa vinculada al grupo |
| US-024 | US-015, US-008 (o US-007) | El registro en Varios requiere sesion activa y estudiante registrado |
| US-025 | US-003 | La dotacion de personal se asigna a un evento de grado con fecha definida |
| US-026 | US-003, US-016 | La pre-lista requiere fecha de grado definida y pagos parciales registrados |
| US-027 | US-026 | La validacion en sala es el punto de uso de la pre-lista |
| US-028 | US-027 | La entrega solo se habilita con saldo en cero |
| US-029 | US-025 | El registro de escalacion se hace en el contexto del evento con personal asignado |
| US-030 | US-007 (o US-008), US-002 | Los tickets QR se vinculan a estudiantes y a la configuracion de tarjetas de la Promocion |
| US-031 | US-035 | El registro de inconformidades requiere usuarios internos con acceso |
| US-032 | US-031 | El acuse de recibo se genera al registrar la inconformidad |
| US-033 | US-031 | El cierre opera sobre una inconformidad abierta |
| US-034 | US-033 | La notificacion de cierre se dispara al cerrar la inconformidad |
| US-036 | US-035 | El catalogo es gestionado por el administrador; requiere rol administrador creado |
| US-037 | US-036 | Los paquetes base se arman con items del catalogo existentes |
| US-038 | US-031, US-029 | El historial agrega inconformidades y escalaciones |
| US-039 | US-019 | Los reportes globales consolidan reportes de sesiones cerradas |
| US-040 | US-035 | Las tablas maestras son gestionadas por el administrador |
| US-041 | US-002 | La Cena de Profesores requiere que la Promocion exista |
| US-042 | US-035, US-040 | El pool de candidatos requiere que los roles y las tablas maestras geograficas esten disponibles |
| US-043 | US-042 | El envio masivo requiere candidatos en el pool |
| US-044 | US-043 | El formulario publico solo existe si se envio la postulacion con token |
| US-045 | US-043 | El estado de postulaciones se consulta sobre envios realizados |
| US-046 | US-035 | Las reglas bulk asignan usuarios que deben existir como colaboradores |
| US-047 | US-046, US-002 | La aplicacion de la regla requiere que la regla exista y que haya FechasEvento |
| US-048 | US-035, US-002 | Las rutas requieren un conductor registrado y un FechaEvento existente |
| US-049 | US-047 | Solo se puede sobreescribir una asignacion bulk que haya sido aplicada |
| US-050 | US-025 (o US-047) | La notificacion requiere que haya colaboradores asignados al evento |
| US-051 | US-050 | El registro de envio es consecuencia del proceso de notificacion |
| US-052 | US-051 | El reenvio forzado requiere que exista un envio previo registrado |
| US-053 | US-035 | El calendario requiere un usuario autenticado con sesion activa |
| US-054 | US-053 | La vista general es una extension de la vista de calendario |
| US-062 | US-031 | El snapshot de SLA se captura en el momento de crear la inconformidad |
| US-063 | US-035 | El panel de configuracion requiere rol administrador activo |
| US-064 | US-063 | El historial se genera como efecto de los cambios registrados en US-063 |
| US-065 | US-035 | Los slots requieren rol administrador o jefe_logistica activo |
| US-066 | US-065, US-042 | La gestion de postulaciones opera sobre slots publicados y candidatos existentes |
| US-067 | US-065 | Solo se puede duplicar un slot existente |
| US-068 | US-042, US-065 | El candidato debe estar autenticado y existir slots en estado disponible |
| US-069 | US-042 | El perfil a actualizar debe pertenecer a un CandidatoExterno existente |

---

## 8. Historias Fuera de Alcance

Las siguientes funcionalidades son mencionadas en el to-be o en el contexto de dominio pero quedan excluidas de esta iteracion de especificaciones:

- **Mecanismo especifico de autenticacion externa para padres y estudiantes** — Es una decision tecnica pendiente (token, OTP, documento+PIN) que debe ser resuelta por el arquitecto antes de implementar US-007. El sistema debe disenar el auto-registro de forma agnostica a ese mecanismo. *(RN-26)*

- **Integracion con proveedor de email y SMS** — Esta especificacion define el comportamiento funcional de las notificaciones (que se envia, a quien, cuando) pero no el proveedor ni el protocolo tecnico de envio. Esa decision es de arquitectura.

- **Delegacion de autorizacion de descuentos a otros roles** — El to-be cierra explicitamente esta decision: solo el gerente autoriza descuentos. Cualquier cambio futuro requiere decision estrategica del negocio y nueva iteracion de especificaciones.

- **Gestion de reembolsos (procesamiento financiero del 50%)** — US-030 cubre el disparo del flujo; la implementacion del reembolso real (canal de pago, proceso financiero) queda fuera de alcance hasta que el negocio especifique el mecanismo.

- **Firma digital del contrato** — El to-be preserva la firma presencial del acta. La digitalizacion requiere decision legal y estrategica previa.

- **Gestion de buses y transporte** — Las reglas de buses (salida exacta, compartidos entre grupos) son restricciones operativas con terceros. US-048 cubre el registro de rutas de conductores como dato; la gestion logistica del transporte con proveedores externos queda fuera del sistema.

- **Venta o renta de togas y accesorios** — El contexto de dominio menciona estos servicios adicionales. No aparecen en el flujo to-be operativo; quedan fuera del alcance de esta iteracion.

- **Gestion de disponibilidad de auditorios y sedes** — El sistema almacena la sede del grado como dato de la Promocion pero no gestiona disponibilidad, reserva ni logistica interna del auditorium.

- **Verificacion de regulacion local sobre menores en eventos** — La regla RN-14 (ninos menores de 5 no admitidos) se implementa tal como esta definida. Cualquier ajuste por normativa local queda fuera del alcance tecnico de esta especificacion.

- **Modulo de ventas de productos de grado (birrete, estola, medallas)** — El contexto de dominio menciona la venta de productos individuales de grado. No esta modelado en el flujo to-be como proceso separado; queda fuera de alcance hasta nueva iteracion.

- **Portal de seguimiento para padres y estudiantes** — El to-be menciona acceso externo para padres, estudiantes y delegados institucionales para consultar estado de pago y progreso. Esta funcionalidad de portal externo no fue especificada en el to-be v2.0 con suficiente detalle; queda como item de alcance futuro una vez resuelto el mecanismo de autenticacion externa.

---

*Especificaciones funcionales generadas por `systems-analyst`. Version 2.1 (revisada 2.2 por lotes quirúrgicos). Todos los [BLOCKER] han sido resueltos. Este documento esta listo para implementacion. Para continuar con el plan de proyecto ejecutivo, invocar `pm-writer`. Para iniciar implementacion tecnica, invocar `tdd-writer`, `django-developer` o `react-developer` en una sesion nueva.*

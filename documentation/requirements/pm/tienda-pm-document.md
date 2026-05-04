# Documento Ejecutivo PM — Módulo Tienda

**Versión:** 1.1
**Fecha:** 2026-05-04
**Estado:** Pendiente de aprobación del propietario del negocio — 3 preguntas resueltas, 3 preguntas abiertas
**Módulo:** Tienda (gestión de inventario y punto de venta de productos comestibles)
**Preparado para:** Propietario del negocio (aprobación de alcance)
**Fuente principal:** `documentation/requirements/tienda-especificaciones-funcionales.md` v1.1
**Fuente de contexto:** `documentation/requirements/tienda-proceso-operativo-to-be.md` v1.1

---

## Tabla de contenido

1. [Resumen ejecutivo](#1-resumen-ejecutivo)
2. [Problema que se resuelve](#2-problema-que-se-resuelve)
3. [Solución propuesta](#3-solución-propuesta)
4. [Alcance](#4-alcance)
5. [Epics e historias de usuario priorizadas](#5-epics-e-historias-de-usuario-priorizadas)
6. [Riesgos identificados](#6-riesgos-identificados)
7. [Preguntas abiertas para el propietario del negocio](#7-preguntas-abiertas-para-el-propietario-del-negocio)

---

## 1. Resumen ejecutivo

El módulo Tienda es un sistema digital de inventario y punto de venta para el negocio de productos comestibles que opera bajo la plataforma Hersa. Hoy, los movimientos de mercancía entre el almacén central y el puesto de venta se gestionan manualmente y fuera del sistema, lo que genera pérdida de trazabilidad, errores de stock y un cierre de jornada propenso a errores sin posibilidad de revisión previa. La solución propuesta digitaliza el ciclo completo: desde la compra de mercancía a proveedores hasta el cierre diario del punto de venta, con un reporte automático de resultados al finalizar cada jornada. Dos roles participan en el sistema: el administrador, que gestiona catálogo, compras y correcciones de inventario, y el vendedor, que opera el punto de venta día a día. Se necesita la aprobación del propietario del negocio para confirmar el alcance antes de iniciar el desarrollo.

---

## 2. Problema que se resuelve

El negocio enfrenta cinco problemas operativos concretos que hoy generan pérdidas de tiempo, errores de inventario y decisiones sin datos confiables:

**Traslados de mercancía sin registro.** Cuando el vendedor necesita más producto durante el día, el acuerdo con el administrador ocurre de forma verbal, fuera de cualquier sistema. No hay registro de cuántas unidades salieron del almacén central, quién las autorizó ni cuándo. El resultado es un inventario central que no refleja la realidad.

**Cierre de jornada sin revisión previa.** Al finalizar el día, el vendedor ingresa el conteo físico de productos y el sistema ejecuta los movimientos de inventario de forma inmediata, sin mostrar una pantalla de confirmación. Si el vendedor cometió un error en el conteo (por ejemplo, confundió un producto), los datos quedan registrados incorrectamente y son difíciles de corregir después.

**Apertura del puesto de venta lenta y propensa a omisiones.** El vendedor debe registrar el traslado de cada producto de forma individual al inicio del día. Con diez o más productos distintos, el proceso se vuelve lento y aumenta el riesgo de olvidar algún artículo.

**Pedidos a proveedores duplicados y sin alerta de discrepancias.** Cuando se hace un pedido con varios productos al mismo proveedor, hoy se crea una orden de compra separada por cada producto. Además, cuando llega menos mercancía de la pedida, el sistema no alerta ni exige ninguna justificación antes de dar el pedido por cerrado.

**Sin visión consolidada de qué reponer.** El administrador no tiene una lista organizada de los productos que están por agotarse en el almacén central. Debe recordar o buscar esta información por separado cada vez que va a negociar con un proveedor.

---

## 3. Solución propuesta

El sistema propuesto digitaliza y centraliza la operación diaria de la tienda en ocho capacidades principales, expresadas en lenguaje de negocio:

**Catálogo de productos y proveedores.** El administrador gestiona los productos que se venden (nombre, precio, unidad de medida, nivel de reorden) y los proveedores con sus datos de contacto. Cada producto puede estar asociado a uno o más proveedores.

**Órdenes de compra con múltiples productos.** Un solo pedido a un proveedor puede incluir todos los productos necesarios en una sola pantalla. Al recepcionar la mercancía, el sistema registra cuánto llegó, a qué costo y si hubo unidades dañadas. El costo promedio de cada producto se recalcula automáticamente con cada recepción. Si la cantidad recibida difiere significativamente de la pedida, el sistema exige una justificación antes de cerrar el pedido.

**Apertura de jornada en un solo paso.** El vendedor ve la lista de todos los productos del catálogo con un campo de cantidad. Ingresa cuánto lleva al puesto de venta, confirma en una sola acción y el sistema registra el traslado completo en el almacén central y en el punto de venta simultáneamente.

**Reposición durante el día con trazabilidad.** Cuando un producto se agota en el puesto de venta, el administrador o el vendedor registra el traslado directamente en el sistema. Queda registrado quién lo hizo y cuándo.

**Cierre de jornada con pantalla de revisión.** Antes de confirmar el cierre, el vendedor ve un resumen por producto: cuánto llevó al inicio, cuánto quedó al final, cuánto vendió y cuánto dinero debería haber recaudado. Solo después de revisar y confirmar, el sistema persiste los datos y devuelve el inventario restante al almacén central. También registra el dinero que entrega el vendedor al administrador, y el administrador ve si hay faltante o sobrante de caja.

**Reporte automático al cierre.** Al confirmar el cierre, el sistema genera automáticamente un reporte con los resultados del día por producto: unidades vendidas, ingresos, costo de lo vendido y utilidad bruta. Incluye también la lista de productos que están por debajo del nivel de reorden, con la cantidad sugerida de pedido, lista para usar como referencia al negociar con proveedores.

**Consulta de inventario en tiempo real.** Cualquier usuario puede consultar el stock actual de cualquier producto en el almacén central o en el punto de venta en cualquier momento.

**Ajustes de inventario controlados.** Cuando se detecta una diferencia de stock que no corresponde a una compra, venta o traslado, el administrador puede corregirla con una nota obligatoria que explique el motivo. Esta capacidad está reservada exclusivamente al administrador.

---

## 4. Alcance

### 4a. Qué incluye esta versión (v1)

- Gestión del catálogo de productos y proveedores, incluyendo la asociación entre ellos.
- Creación y seguimiento de órdenes de compra con múltiples productos por proveedor, recepción de mercancía línea a línea, y alerta de discrepancia con justificación obligatoria al cerrar pedidos.
- Flujo completo de apertura de jornada: creación de la jornada del día para el punto de venta y traslado masivo de mercancía desde el almacén central en una sola operación.
- Reposición de mercancía durante la jornada desde el almacén central al punto de venta, con trazabilidad del actor que la ejecutó.
- Cierre de jornada con pantalla de revisión previa, registro del dinero entregado por el vendedor, alerta de cuadre de caja para el administrador, y retorno automático del inventario sobrante al almacén central.
- Reporte automático de fin de día al cierre de cada jornada: ingresos, costo de lo vendido, utilidad bruta por producto, y lista de productos que requieren reabastecimiento.
- Consulta de stock en tiempo real por producto y por ubicación (almacén central o punto de venta).
- Ajustes manuales de inventario exclusivos del administrador, con nota obligatoria en cada caso.
- Un solo punto de venta físico activo en v1.
- Dos roles de usuario: administrador (`tienda_admin`) y vendedor (`tienda_vendedor`), integrados en el sistema de usuarios existente de Hersa.

### 4b. Qué queda fuera de esta versión (excluido explícitamente)

- **Exportación de reportes a Excel o PDF.** Los reportes se consultan únicamente en pantalla.
- **Estadísticas históricas y comparativas.** No se incluyen vistas de tendencias de ventas entre jornadas ni análisis de rentabilidad acumulada. El reporte de fin de día es el único artefacto analítico de v1.
- **Escaneo de códigos de barras.** El conteo físico al cierre se hace manualmente.
- **Generación automática de órdenes de compra desde la alerta de reabastecimiento.** La lista de reabastecimiento en el reporte es informativa; el administrador crea el pedido de forma manual.
- **Flujo de solicitud y aprobación de traslados de reposición.** Los traslados se registran directamente sin paso de aprobación previo.
- **Operación simultánea de múltiples puntos de venta activos.** La infraestructura técnica lo soporta, pero la interfaz de v1 está diseñada para un solo punto de venta.
- **Notificaciones automáticas** (push o correo) al vendedor por niveles de stock críticos o jornadas sin cerrar.
- **Integración con el módulo de cobros de Hersa.** El módulo Tienda opera de forma independiente del sistema de pagos del módulo principal de Hersa.
- **Panel gerencial de visibilidad de órdenes de compra** equivalente al que existe en el módulo principal de Hersa.

---

## 5. Epics e historias de usuario priorizadas

La prioridad de cada elemento sigue el método MoSCoW:
- **Must** — imprescindible; sin esto el sistema no funciona en v1.
- **Should** — importante; se incluye si el tiempo lo permite, con alto valor de negocio.
- **Could** — deseable; puede diferirse sin impacto crítico.
- **Won't** — fuera del alcance de v1; documentado para evitar confusiones.

---

### EP-01 — Catálogo de productos y proveedores

El administrador mantiene el catálogo de productos que se venden y los proveedores a quienes se compra. Cada producto puede estar asociado a uno o más proveedores.

| ID | Descripción para el negocio | Prioridad |
|----|-----------------------------|-----------|
| US-001 | El administrador crea un producto con nombre, precio de venta, unidad (por ejemplo, "bolsa" o "caja"), nivel de reorden y cantidad sugerida de pedido. | Must |
| US-002 | El administrador edita cualquier dato de un producto existente. El costo promedio lo calcula el sistema automáticamente y no puede editarse manualmente. | Must |
| US-003 | El administrador crea un proveedor con nombre y datos de contacto. | Must |
| US-004 | El administrador edita el nombre o los datos de contacto de un proveedor existente. | Should |
| US-005 | El administrador asocia un producto a uno o más proveedores, de modo que al crear un pedido pueda filtrar los productos disponibles del proveedor seleccionado. | Must |

---

### EP-02 — Órdenes de compra y recepción de mercancía

El administrador gestiona los pedidos a proveedores. Un solo pedido puede incluir múltiples productos del mismo proveedor. Al llegar la mercancía, el administrador o el vendedor registra lo recibido línea por línea.

| ID | Descripción para el negocio | Prioridad |
|----|-----------------------------|-----------|
| US-032 | El administrador genera un borrador de orden de compra directamente desde la lista de productos que necesitan reabastecimiento, para completar los detalles del pedido en un paso posterior. | Must |
| US-006 | El administrador crea una orden de compra completa con proveedor, fecha del pedido y los productos con cantidades y precios acordados. | Must |
| US-007 | El administrador o el vendedor registra la mercancía recibida de un pedido, producto por producto: cuánto llegó en buen estado, cuánto llegó dañado, el costo real y a qué almacén se destina. | Must |
| US-008 | Las unidades dañadas al momento de la recepción quedan registradas como avería y no se suman al inventario disponible. | Must |
| US-009 | El sistema actualiza automáticamente el estado del pedido (pendiente, parcialmente recibido) según lo que se vaya recepcionando, sin que el administrador tenga que hacerlo manualmente. | Must |
| US-010 | Al cerrar un pedido, si la cantidad recibida difiere significativamente de la pedida, el sistema muestra una alerta y exige una justificación escrita antes de confirmar el cierre. | Must |
| US-029 | El sistema garantiza que el stock disponible en cada ubicación siempre sea consistente con los movimientos registrados. Si una operación falla, el inventario queda exactamente como estaba antes. | Must |
| US-011 | El administrador y el vendedor pueden ver la lista de órdenes de compra filtrada por estado (borrador, pendiente, parcialmente recibida, cerrada). | Should |
| US-012 | El administrador y el vendedor pueden ver el detalle completo de un pedido: todos los productos, cuánto se ha recibido de cada uno y el historial de recepciones. | Should |

---

### EP-03 — Apertura de jornada de venta

El vendedor abre una jornada al inicio del día y registra en un solo paso todos los productos que lleva al punto de venta desde el almacén central.

| ID | Descripción para el negocio | Prioridad |
|----|-----------------------------|-----------|
| US-013 | El vendedor abre la jornada del día para el punto de venta. El sistema impide abrir una segunda jornada si ya hay una activa para ese puesto. | Must |
| US-014 | El vendedor ve la lista de todos los productos y anota cuánto lleva de cada uno. Con una sola confirmación, el sistema registra todos los traslados del almacén central al punto de venta. | Must |
| US-015 | El sistema registra automáticamente el costo de cada producto en el momento exacto del traslado. Este costo no cambia aunque llegue mercancía nueva ese mismo día. | Must |

---

### EP-04 — Reposición durante el día

Cuando un producto se agota en el punto de venta durante la jornada, el administrador o el vendedor puede trasladar más unidades desde el almacén central con registro inmediato en el sistema.

| ID | Descripción para el negocio | Prioridad |
|----|-----------------------------|-----------|
| US-016 | El administrador o el vendedor registra un traslado de reposición desde el almacén central al punto de venta durante la jornada. El sistema anota quién lo realizó y en qué momento. | Must |
| US-017 | El administrador puede recepcionar mercancía de un pedido directamente en el punto de venta (en lugar del almacén central) cuando la necesidad es urgente. | Should |

---

### EP-05 — Cierre de jornada

Al final del día, el vendedor cuenta el inventario que quedó en el puesto de venta y confirma el cierre. El sistema muestra un resumen previo para detectar errores antes de que queden registrados.

| ID | Descripción para el negocio | Prioridad |
|----|-----------------------------|-----------|
| US-018 | El vendedor o el administrador ingresa el conteo físico de cada producto al final de la jornada. | Must |
| US-019 | Antes de confirmar el cierre, el sistema muestra un resumen por producto: cuánto se llevó, cuánto quedó, cuánto se vendió y cuánto debería haberse recaudado. El actor puede corregir cualquier conteo antes de confirmar. | Must |
| US-030 | Al cerrar la jornada, el vendedor registra el dinero que entrega al administrador y cualquier gasto en efectivo del día con su descripción. | Must |
| US-031 | El administrador ve una alerta de caja al revisar el cierre de la jornada: si el dinero entregado es menor al esperado (faltante, mostrado en rojo) o mayor (sobrante, en amarillo). | Must |
| US-020 | El vendedor o el administrador confirma el cierre de forma explícita. El sistema registra quién lo cerró y persiste todos los movimientos. | Must |
| US-021 | Tras confirmar el cierre, el sistema devuelve automáticamente el inventario sobrante del punto de venta al almacén central, usando el costo con el que fue trasladado al inicio. | Must |

---

### EP-06 — Reporte de fin de día

Al cerrar la jornada, el sistema genera automáticamente un reporte con los resultados del día y la lista de productos que necesitan reabastecimiento.

| ID | Descripción para el negocio | Prioridad |
|----|-----------------------------|-----------|
| US-022 | El sistema genera el reporte de fin de día en el momento del cierre, sin que el administrador tenga que solicitarlo. El reporte muestra por producto: unidades vendidas, ingresos, costo de lo vendido y utilidad bruta. | Must |
| US-023 | El reporte incluye una sección "Lista de reabastecimiento" con todos los productos cuyo stock en el almacén central está por debajo del nivel de reorden, mostrando el stock actual y la cantidad sugerida de pedido. | Must |

---

### EP-07 — Consulta de inventario en tiempo real

El administrador y el vendedor pueden consultar en cualquier momento cuánto hay de cada producto, tanto en el almacén central como en el punto de venta.

| ID | Descripción para el negocio | Prioridad |
|----|-----------------------------|-----------|
| US-024 | Cualquier usuario consulta el stock de un producto en una ubicación específica (almacén central o punto de venta) y obtiene el dato actualizado al instante. | Must |
| US-025 | El administrador consulta el stock total de un producto sumando todas las ubicaciones, con el desglose por ubicación. | Should |

---

### EP-08 — Ajuste de inventario (solo administrador)

Cuando se detecta una diferencia de stock que no corresponde a ninguna operación normal (compra, traslado, venta), el administrador puede corregirlo con un movimiento de ajuste documentado.

| ID | Descripción para el negocio | Prioridad |
|----|-----------------------------|-----------|
| US-026 | El administrador registra un ajuste de entrada (agregar unidades al stock) con una nota obligatoria que explica el motivo. El sistema recalcula el costo promedio del producto. | Must |
| US-027 | El administrador registra un ajuste de salida (retirar unidades del stock) con una nota obligatoria. El costo promedio no se modifica en este caso. | Must |
| US-028 | El administrador consulta el historial de ajustes de un producto: tipo, cantidad, fecha y quién lo realizó. | Should |

---

## 6. Riesgos identificados

| # | Descripción del riesgo | Probabilidad | Impacto |
|---|------------------------|:------------:|:-------:|
| R-01 | **Error en el conteo físico de cierre.** El conteo físico al final del día es manual e intransferible. Un error en el conteo produce datos incorrectos de inventario, costo promedio e ingresos que se propagan a jornadas futuras. La pantalla de revisión previa al cierre (US-019) reduce este riesgo, pero no lo elimina. | Media | Alto |
| R-02 | **Adopción por parte del vendedor.** El vendedor debe adaptar su rutina diaria para abrir y cerrar la jornada en el sistema, y registrar cada reposición en tiempo real. Si no adopta el hábito de registrar en el momento, la trazabilidad se pierde. La simplicidad del flujo de apertura masiva (US-014) ayuda, pero el cambio cultural es el factor más incierto. | Media | Alto |
| R-03 | **Umbral de discrepancia de pedidos mal calibrado.** El sistema alerta cuando la diferencia entre lo pedido y lo recibido supera un umbral configurable (por ejemplo, 5 unidades o el 10% de la línea). Si ese umbral se define demasiado alto, discrepancias reales pasan sin alerta; si se define demasiado bajo, el administrador recibe alertas innecesarias con cada pedido. El valor inicial del umbral debe definirse antes del lanzamiento. | Alta | Medio |
| R-04 | **Costo promedio incorrecto por datos iniciales.** El costo promedio de cada producto empieza en cero y se construye a partir de las primeras recepciones. Si el negocio ya tiene inventario físico antes de arrancar el sistema, ese inventario previo no tiene costo registrado. Usar el sistema sin un ajuste de inventario inicial podría generar costos y utilidades distorsionadas desde el primer día. | Alta | Medio |
| R-05 | **Complejidad del flujo de cierre para el vendedor.** El cierre de jornada involucra varios pasos: conteo físico, pantalla de resumen, registro del dinero, alerta de cuadre de caja y confirmación final. Si el vendedor percibe el proceso como complejo, puede tender a saltarse pasos o pedir al administrador que cierre siempre. Esto concentra responsabilidad y crea un cuello de botella operativo. | Baja | Medio |

---

## 7. Preguntas abiertas para el aprobador del negocio

Las siguientes preguntas deben ser respondidas por el propietario del negocio antes de que el equipo de desarrollo inicie el diseño detallado. No se ofrecen respuestas aquí — estas decisiones son del negocio.

**P-01 — Umbral de discrepancia en órdenes de compra.** ~~ABIERTA~~ **RESUELTA.**
Valor inicial configurado en **5%**. Si la cantidad recibida difiere en más del 5% de la cantidad pedida por línea, el sistema exige justificación antes de cerrar la orden.

**P-02 — Carga de inventario inicial.** ~~ABIERTA~~ **RESUELTA.**
El inventario inicial se registra como entradas de compra normales, sin proceso especial de carga masiva.

**P-03 — Quién puede cerrar la jornada.**
El sistema permite que tanto el administrador como el vendedor puedan cerrar la jornada. ¿Es esto correcto para la operación actual? ¿O se quiere que el cierre lo haga siempre el administrador para que sea quien también revise el cuadre de caja en el mismo momento?

**P-04 — Visibilidad financiera del vendedor.** ~~ABIERTA~~ **RESUELTA.**
El vendedor solo ve cantidades en todos los contextos del sistema (inventario, reporte de jornada, cierre). Los precios de venta, revenue, COGS (costo de mercancía vendida) y utilidad son visibles únicamente para el administrador.

**P-05 — Criterio para desactivar un producto del catálogo.**
El sistema tiene un campo de "activo / inactivo" por producto. Un producto inactivo no aparece en los formularios del punto de venta. ¿Cuándo debe desactivarse un producto — cuando se deja de vender, cuando el stock llega a cero, o solo por decisión explícita del administrador? Definir este criterio evitará confusiones operativas.

**P-06 — Nombre del punto de venta en el sistema.**
El sistema soporta múltiples ubicaciones con nombre libre (por ejemplo, "POS_1", "Puesto Centro", "Tienda Principal"). ¿Con qué nombre quiere que aparezca el punto de venta en todas las pantallas y reportes?

---

*Documento elaborado con base en `tienda-especificaciones-funcionales.md` v1.1 y `tienda-proceso-operativo-to-be.md` v1.1. Versión 1.1 — 2026-05-04. Sin bloqueantes activos. Preguntas resueltas: P-01, P-02, P-04. Preguntas abiertas: P-03, P-05, P-06.*

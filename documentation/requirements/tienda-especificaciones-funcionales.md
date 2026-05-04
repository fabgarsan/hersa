# Tienda — Especificaciones Funcionales

**Versión:** 1.3
**Fecha:** 2026-05-04
**Estado:** Borrador — pendiente de revisión de implementación
**Módulo:** Tienda (gestión de inventario y punto de venta de productos comestibles)
**Fuente principal:** `documentation/requirements/tienda-proceso-operativo-to-be.md` v1.1
**Fuente de contexto:** `documentation/requirements/tienda-proceso-operativo-as-is.md` v1.2
**Generado por:** `systems-analyst`

---

## Tabla de contenido

1. [Epics identificados](#1-epics-identificados)
2. [User stories por epic](#2-user-stories-por-epic)
3. [Criterios de aceptación por historia](#3-criterios-de-aceptación-por-historia)
4. [Entidades de datos](#4-entidades-de-datos)
5. [Endpoints de API sugeridos](#5-endpoints-de-api-sugeridos)
6. [Reglas de negocio críticas](#6-reglas-de-negocio-críticas)
7. [Dependencias entre historias](#7-dependencias-entre-historias)
8. [Historias fuera de alcance v1](#8-historias-fuera-de-alcance-v1)

---

## 1. Epics identificados

| Epic ID | Nombre | Descripción | Historias |
|---------|--------|-------------|-----------|
| EP-01 | Gestión de catálogo | CRUD de productos y proveedores; asociación producto–proveedor | 5 |
| EP-02 | Órdenes de compra y recepción | Creación multi-producto de órdenes (incluye estado `iniciada`), recepción línea a línea, cierre con alerta de discrepancia | 8 |
| EP-03 | Apertura de jornada | Creación de JornadaVenta con validación de unicidad; traslado masivo de apertura | 3 |
| EP-04 | Reposición durante el día | Traslado de reposición individual desde CENTRAL a la Tienda; trazabilidad de actor | 2 |
| EP-05 | Cierre de jornada | Conteo físico, registro de dinero, pantalla de resumen previo, confirmación, retorno automático al CENTRAL | 6 |
| EP-06 | Reporte de fin de día | Reporte automático al cierre: indicadores por producto + lista de reabastecimiento mejorada | 2 |
| EP-07 | Consulta de stock | Vista de stock en tiempo real por producto y ubicación (desde `StockUbicacion`); stock total del sistema | 2 |
| EP-08 | Ajuste de inventario | Movimiento AJUSTE exclusivo del admin con nota obligatoria; recálculo de avg_cost si ENTRADA | 3 |
| **Total** | | | **31** |

---

## 2. User stories por epic

---

### EP-01 — Gestión de catálogo

| ID | Título | Historia | Prioridad |
|----|--------|----------|-----------|
| US-001 | Crear producto | Como `tienda_admin`, quiero crear un producto con nombre, descripción, unidad, precio de venta, punto de reorden y cantidad sugerida de pedido, de modo que el catálogo de mercancía esté disponible para el resto de los flujos operativos. | Must |
| US-002 | Editar producto | Como `tienda_admin`, quiero editar cualquier campo de un producto existente excepto `avg_cost`, de modo que pueda corregir datos maestros sin alterar el costo promedio calculado por el sistema. | Must |
| US-003 | Crear proveedor | Como `tienda_admin`, quiero crear un proveedor registrando nombre y datos de contacto, de modo que pueda asociarlo a productos y utilizarlo en órdenes de compra. | Must |
| US-004 | Editar proveedor | Como `tienda_admin`, quiero editar el nombre y los datos de contacto de un proveedor existente, de modo que la información de contacto esté siempre actualizada. | Should |
| US-005 | Asociar productos a proveedores | Como `tienda_admin`, quiero asociar uno o más proveedores a un producto (relación muchos a muchos), de modo que al crear una orden de compra pueda filtrar los productos disponibles del proveedor seleccionado. | Must |

---

### EP-02 — Órdenes de compra y recepción

| ID | Título | Historia | Prioridad |
|----|--------|----------|-----------|
| US-029 | Actualización atómica de StockUbicacion por movimiento | Como sistema, al registrar cualquier movimiento de inventario, actualizo `StockUbicacion` atómicamente para que el stock disponible sea siempre consistente con el historial. | Must |
| US-032 | Generar orden de compra en estado `iniciada` | Como `tienda_admin`, al revisar la lista de reabastecimiento selecciono uno o más productos y genero una orden de compra en estado `iniciada` para completar los detalles de proveedor, cantidades y costos después. | Must |
| US-006 | Crear orden de compra multi-producto | Como `tienda_admin`, quiero crear una `OrdenDeCompra` seleccionando un proveedor, fecha del pedido y una nota opcional, y luego agregar una o más `LineaOrden` con producto, cantidad pedida y costo unitario esperado, de modo que un único pedido multiproducto al mismo proveedor quede registrado como una sola entidad trazable. | Must |
| US-007 | Recepcionar mercancía contra una línea de orden | Como `tienda_admin` o `tienda_vendedor`, quiero seleccionar una `OrdenDeCompra` en estado `pendiente` o `parcialmente_recibida`, elegir una `LineaOrden`, ingresar la cantidad recibida en buen estado, la cantidad averiada y el costo unitario real, y seleccionar el destino de las unidades (CENTRAL, POS o ambos), de modo que el inventario se actualice correctamente y el `avg_cost` se recalcule. | Must |
| US-008 | Registrar unidades averiadas en recepción | Como `tienda_admin` o `tienda_vendedor`, quiero que al ingresar una cantidad averiada durante la recepción, el sistema genere automáticamente un `MovimientoInventario` de tipo `SALIDA` con concepto `AVERIA`, de modo que las unidades dañadas queden trazadas sin sumarse al stock disponible. | Must |
| US-009 | Actualización automática de estado de OrdenDeCompra | Como `tienda_admin`, quiero que el sistema cambie automáticamente el estado de la `OrdenDeCompra` (y de cada `LineaOrden`) según las recepciones acumuladas, de modo que el estado refleje siempre la situación real del pedido sin acción manual. | Must |
| US-010 | Cerrar orden de compra con alerta de discrepancia | Como `tienda_admin`, quiero poder cerrar una `OrdenDeCompra` manualmente y, si alguna línea tiene una diferencia entre cantidad pedida y recibida mayor al umbral configurable (`umbral_discrepancia_orden`), ver una alerta y registrar una justificación obligatoria antes de confirmar el cierre, de modo que toda discrepancia significativa quede documentada. | Must |
| US-011 | Listar órdenes de compra | Como `tienda_admin` o `tienda_vendedor`, quiero ver la lista de órdenes de compra filtradas por estado (`pendiente`, `parcialmente_recibida`, `cerrada`), de modo que pueda identificar rápidamente las órdenes que requieren acción. | Should |
| US-012 | Ver detalle de orden de compra | Como `tienda_admin` o `tienda_vendedor`, quiero ver el detalle de una `OrdenDeCompra` con todas sus `LineaOrden`, el estado de recepción de cada línea y el historial de `MovimientoInventario` asociados, de modo que tenga visibilidad completa del estado de cada pedido. | Should |

---

### EP-03 — Apertura de jornada de venta

| ID | Título | Historia | Prioridad |
|----|--------|----------|-----------|
| US-013 | Crear JornadaVenta con validación de unicidad | Como `tienda_vendedor`, quiero crear una `JornadaVenta` para la Tienda y una fecha específica, y que el sistema me impida crearla si ya existe una jornada abierta para esa Tienda, de modo que no puedan existir dos jornadas simultáneas en la misma Tienda. | Must |
| US-014 | Traslado masivo de apertura | Como `tienda_vendedor`, quiero registrar el traslado de apertura de la jornada en un único formulario de lista con todos los productos del catálogo activo y sus cantidades, de modo que con una sola confirmación se generen todos los pares de `MovimientoInventario` (SALIDA CENTRAL + ENTRADA Tienda) para cada producto con cantidad mayor a cero. | Must |
| US-015 | Snapshot de avg_cost en el traslado | Como `tienda_vendedor`, quiero que el sistema capture automáticamente el `avg_cost` vigente de cada producto en el momento exacto del traslado de apertura, de modo que el COGS del día refleje el costo real al momento de la decisión operativa, independientemente de recepciones posteriores. | Must |

---

### EP-04 — Reposición durante el día

| ID | Título | Historia | Prioridad |
|----|--------|----------|-----------|
| US-016 | Registrar traslado de reposición | Como `tienda_admin` o `tienda_vendedor`, quiero registrar un traslado de reposición seleccionando producto y cantidad desde CENTRAL a la Tienda, de modo que el stock de la Tienda se actualice inmediatamente y el traslado quede trazado con mi identidad en `registrado_por`. | Must |
| US-017 | Recepción urgente directa a la Tienda | Como `tienda_admin`, quiero recepcionar mercancía contra una `OrdenDeCompra` seleccionando la Tienda como destino de las unidades (en lugar del CENTRAL), de modo que la mercancía urgente pueda ingresar directamente a la Tienda sin pasar por el inventario central. | Should |

---

### EP-05 — Cierre de jornada

| ID | Título | Historia | Prioridad |
|----|--------|----------|-----------|
| US-030 | Registrar dinero de entrega y salidas de efectivo al cierre | Como `tienda_vendedor`, al cerrar la jornada de la Tienda registro el dinero que entrego (`dinero_entrega`) y cualquier salida de efectivo del día (`dinero_salida_monto` + `dinero_salida_descripcion`) sin ver el revenue calculado ni ninguna cifra esperada; el sistema acepta lo que reporto. | Must |
| US-031 | Ver alerta de cuadre de caja en el cierre de jornada | Como `tienda_admin`, al revisar el cierre de una jornada de la Tienda veo `alerta_caja` (rojo si falta dinero respecto al revenue calculado, amarillo si sobra) junto con los valores de revenue vs. dinero reportado por el vendedor; el vendedor no tiene acceso a esta información. | Must |
| US-018 | Ingresar conteo físico de cierre | Como `tienda_vendedor` o `tienda_admin`, quiero ingresar la cantidad física contada para cada producto presente en la Tienda al final de la jornada, de modo que el sistema pueda calcular las unidades vendidas y preparar el retorno al CENTRAL. | Must |
| US-019 | Pantalla de resumen previo al cierre | Como `tienda_vendedor` o `tienda_admin`, quiero ver una pantalla de resumen antes de confirmar el cierre que muestre por producto: cantidad trasladada, conteo ingresado, unidades vendidas calculadas, movimiento de retorno propuesto al CENTRAL, y los totales de la jornada (revenue, COGS y utilidad bruta estimados), de modo que pueda corregir errores antes de que los movimientos se persistan. | Must |
| US-020 | Confirmar cierre de jornada | Como `tienda_vendedor` o `tienda_admin`, quiero confirmar el cierre de la jornada de forma explícita tras revisar el resumen, de modo que los movimientos de retorno al CENTRAL se persistan únicamente tras mi confirmación y mi identidad quede registrada en `cerrado_por`. | Must |
| US-021 | Retorno automático de inventario al CENTRAL al cierre | Como sistema, quiero generar automáticamente el par de `MovimientoInventario` (SALIDA POS + ENTRADA CENTRAL) para cada producto según el conteo final confirmado, usando el mismo snapshot de costo con el que las unidades salieron del CENTRAL, de modo que el inventario central se restaure con exactitud de costo. | Must |

---

### EP-06 — Reporte de fin de día

| ID | Título | Historia | Prioridad |
|----|--------|----------|-----------|
| US-022 | Generar reporte automático al cierre de jornada | Como sistema, quiero generar automáticamente el reporte de fin de día al confirmar el cierre de la `JornadaVenta`, mostrando por producto: unidades vendidas, revenue, COGS, utilidad bruta y stock restante en CENTRAL, de modo que el reporte esté disponible sin acción adicional del actor. | Must |
| US-023 | Sección "Lista de reabastecimiento" en el reporte | Como `tienda_admin`, quiero que el reporte de fin de día incluya una sección que liste todos los productos cuyo stock en CENTRAL sea menor o igual al `punto_reorden`, mostrando el stock actual y la `cantidad_sugerida_pedido`, de modo que tenga una referencia consolidada al negociar con proveedores. | Must |

---

### EP-07 — Consulta de stock

| ID | Título | Historia | Prioridad |
|----|--------|----------|-----------|
| US-024 | Consultar stock por producto y ubicación | Como `tienda_admin` o `tienda_vendedor`, quiero consultar el stock de un producto en una ubicación específica (CENTRAL o POS), leyendo directamente de `StockUbicacion`, de modo que siempre vea el inventario actual de forma inmediata. | Must |
| US-025 | Consultar stock total del sistema | Como `tienda_admin`, quiero ver el stock total del sistema para un producto, sumando el stock de todas las ubicaciones (CENTRAL + todos los POS), de modo que tenga visibilidad del inventario consolidado. | Should |

---

### EP-08 — Ajuste de inventario

| ID | Título | Historia | Prioridad |
|----|--------|----------|-----------|
| US-026 | Registrar ajuste de inventario (ENTRADA) | Como `tienda_admin`, quiero crear un `MovimientoInventario` de tipo `ENTRADA` con concepto `AJUSTE`, seleccionando producto, ubicación, cantidad, costo unitario y una nota obligatoria, de modo que el stock de la ubicación aumente y el `avg_cost` se recalcule con la fórmula de costo promedio ponderado. | Must |
| US-027 | Registrar ajuste de inventario (SALIDA) | Como `tienda_admin`, quiero crear un `MovimientoInventario` de tipo `SALIDA` con concepto `AJUSTE`, seleccionando producto, ubicación, cantidad, costo unitario y una nota obligatoria, de modo que el stock de la ubicación disminuya sin modificar el `avg_cost`. | Must |
| US-028 | Ver historial de ajustes de inventario | Como `tienda_admin`, quiero ver el historial de movimientos con concepto `AJUSTE` para un producto, incluyendo nota, cantidad, fecha y el admin que los registró (`registrado_por`), de modo que los ajustes queden auditables. | Should |

---

## 3. Criterios de aceptación por historia

---

### EP-01 — Gestión de catálogo

#### US-001 — Crear producto

**Dado que** el usuario autenticado tiene rol `tienda_admin`
**Cuando** envía una solicitud de creación de producto con todos los campos obligatorios (nombre, unidad, precio_venta, punto_reorden, cantidad_sugerida_pedido)
**Entonces** el sistema persiste el producto con `avg_cost = 0.00` (no editable por el actor), devuelve HTTP 201 con el objeto creado y el producto queda disponible en el catálogo.

**Dado que** el campo `avg_cost` no es parte de los campos editables
**Cuando** el payload de creación incluye un valor para `avg_cost`
**Entonces** el sistema ignora el valor enviado y mantiene `avg_cost = 0.00`.

**Dado que** el usuario tiene rol `tienda_vendedor`
**Cuando** intenta crear un producto
**Entonces** el sistema devuelve HTTP 403 Forbidden.

---

#### US-002 — Editar producto

**Dado que** el usuario es `tienda_admin` y el producto existe
**Cuando** envía una solicitud PATCH con uno o más campos editables (nombre, descripción, unidad, precio_venta, punto_reorden, cantidad_sugerida_pedido)
**Entonces** el sistema actualiza únicamente los campos recibidos y devuelve HTTP 200 con el objeto actualizado.

**Dado que** el payload incluye el campo `avg_cost`
**Cuando** el sistema procesa la solicitud PATCH
**Entonces** el campo `avg_cost` es ignorado y el valor existente se preserva sin cambios.

---

#### US-003 — Crear proveedor

**Dado que** el usuario es `tienda_admin`
**Cuando** envía una solicitud de creación de proveedor con nombre y contacto
**Entonces** el sistema persiste el proveedor y devuelve HTTP 201 con el objeto creado.

**Dado que** el usuario es `tienda_vendedor`
**Cuando** intenta crear un proveedor
**Entonces** el sistema devuelve HTTP 403 Forbidden.

---

#### US-004 — Editar proveedor

**Dado que** el usuario es `tienda_admin` y el proveedor existe
**Cuando** envía una solicitud PATCH con nombre o contacto
**Entonces** el sistema actualiza los campos recibidos y devuelve HTTP 200.

---

#### US-005 — Asociar productos a proveedores

**Dado que** el usuario es `tienda_admin`
**Cuando** envía una solicitud para agregar un proveedor a un producto (o viceversa)
**Entonces** el sistema crea la asociación muchos a muchos y devuelve HTTP 200.

**Dado que** ya existe la asociación entre ese producto y ese proveedor
**Cuando** el admin intenta crearla de nuevo
**Entonces** el sistema devuelve HTTP 400 con mensaje de duplicado.

**Dado que** el admin quiere eliminar la asociación
**Cuando** envía la solicitud de desasociación
**Entonces** el sistema elimina el vínculo sin afectar el producto ni el proveedor.

---

### EP-02 — Órdenes de compra y recepción

#### US-029 — Actualización atómica de StockUbicacion por movimiento

**Dado que** se persiste cualquier `MovimientoInventario` (ENTRADA o SALIDA, cualquier concepto)
**Cuando** el sistema ejecuta la operación de persistencia
**Entonces** actualiza el registro correspondiente en `StockUbicacion` (producto + ubicación) dentro de la misma transacción de base de datos, de modo que si la transacción falla, tanto el `MovimientoInventario` como el cambio de `StockUbicacion` se revierten juntos.

**Dado que** un `MovimientoInventario` de tipo `ENTRADA` se persiste exitosamente
**Cuando** el sistema actualiza `StockUbicacion`
**Entonces** incrementa `cantidad_actual` en la cantidad del movimiento; el valor resultante nunca queda negativo.

**Dado que** un `MovimientoInventario` de tipo `SALIDA` se persiste exitosamente
**Cuando** el sistema actualiza `StockUbicacion`
**Entonces** decrementa `cantidad_actual` en la cantidad del movimiento; si el decremento llevaría `cantidad_actual` por debajo de 0, la transacción completa falla con error y ningún registro se persiste.

---

#### US-032 — Generar orden de compra en estado `iniciada`

**Dado que** el usuario es `tienda_admin`
**Y** ha seleccionado uno o más productos desde la lista de reabastecimiento
**Cuando** solicita generar una orden de compra con esos productos
**Entonces** el sistema crea una `OrdenDeCompra` en estado `iniciada` con líneas (`LineaOrden`) que tienen el producto definido pero sin `cantidad_pedida`, `costo_unitario_esperado` ni proveedor asignado, y devuelve HTTP 201 con la orden y sus líneas en blanco.

**Dado que** la `OrdenDeCompra` está en estado `iniciada`
**Cuando** cualquier actor intenta registrar recepción de mercancía contra esa orden
**Entonces** el sistema devuelve HTTP 400 con mensaje "La orden debe estar en estado pendiente o parcialmente_recibida para recepcionar mercancía."

**Dado que** el admin ha completado el proveedor y todas las líneas con `cantidad_pedida` y `costo_unitario_esperado`
**Cuando** solicita pasar la orden al estado `pendiente`
**Entonces** el sistema valida que todos los campos requeridos estén completos, cambia el estado a `pendiente` y devuelve HTTP 200.

**Dado que** alguna línea tiene `cantidad_pedida` o `costo_unitario_esperado` ausente
**Cuando** el admin intenta pasar la orden de `iniciada` a `pendiente`
**Entonces** el sistema devuelve HTTP 400 indicando las líneas incompletas; el estado permanece en `iniciada`.

---

#### US-006 — Crear orden de compra multi-producto

**Dado que** el usuario es `tienda_admin`
**Cuando** envía la creación de una `OrdenDeCompra` con proveedor, fecha_pedido y al menos una `LineaOrden` con producto, `cantidad_pedida > 0` y `costo_unitario_esperado > 0`
**Entonces** el sistema persiste la orden con estado `pendiente`, registra `creado_por` con el usuario autenticado, y devuelve HTTP 201 con la orden y sus líneas.

**Dado que** el payload no incluye ninguna `LineaOrden`
**Cuando** el sistema procesa la solicitud
**Entonces** devuelve HTTP 400 indicando que la orden debe tener al menos una línea.

**Dado que** el usuario es `tienda_vendedor`
**Cuando** intenta crear una `OrdenDeCompra`
**Entonces** el sistema devuelve HTTP 403 Forbidden.

---

#### US-007 — Recepcionar mercancía contra una línea de orden

**Dado que** la `OrdenDeCompra` está en estado `pendiente` o `parcialmente_recibida`
**Y** el usuario es `tienda_admin` o `tienda_vendedor`
**Cuando** envía la recepción de una `LineaOrden` con cantidad_recibida_buen_estado, costo_unitario_real y un destino (CENTRAL y/o POS con sus respectivas cantidades)
**Entonces** el sistema genera uno o dos `MovimientoInventario` de tipo `ENTRADA` con concepto `COMPRA` (uno por destino), registra `registrado_por`, actualiza el acumulado recibido de la línea, recalcula `avg_cost` del producto y devuelve HTTP 200.

**Dado que** la `OrdenDeCompra` está en estado `cerrada`
**Cuando** cualquier actor intenta registrar recepción en alguna de sus líneas
**Entonces** el sistema devuelve HTTP 400 con mensaje "La orden está cerrada; no se puede registrar más mercancía."

**Dado que** la suma `cantidad_recibida_buen_estado + cantidad_averiada` es mayor a cero
**Y** el costo_unitario_real no está presente en el payload
**Cuando** el sistema procesa la solicitud
**Entonces** devuelve HTTP 400 indicando que el costo unitario real es obligatorio.

---

#### US-008 — Registrar unidades averiadas en recepción

**Dado que** el payload de recepción incluye `cantidad_averiada > 0`
**Cuando** el sistema procesa la recepción
**Entonces** genera un `MovimientoInventario` de tipo `SALIDA`, concepto `AVERIA`, desde la ubicación destino declarada, con la cantidad averiada y el costo unitario real, sin incluir esas unidades en el stock ni en el recálculo de `avg_cost`.

**Dado que** `cantidad_averiada = 0`
**Cuando** el sistema procesa la recepción
**Entonces** no genera ningún `MovimientoInventario` de concepto `AVERIA`.

---

#### US-009 — Actualización automática de estado de OrdenDeCompra

**Dado que** se registra la primera recepción en cualquier línea de una orden `pendiente`
**Cuando** el acumulado recibido de esa línea es mayor a 0 pero menor a `cantidad_pedida`
**Entonces** el sistema cambia el estado de la `LineaOrden` a `parcialmente_recibida` y el estado de la `OrdenDeCompra` a `parcialmente_recibida` de forma automática.

**Dado que** el acumulado recibido en todas las líneas iguala sus respectivas `cantidad_pedida`
**Cuando** el sistema evalúa el estado tras la recepción
**Entonces** el sistema cambia el estado de todas las líneas a `completa` pero el estado de la `OrdenDeCompra` permanece en `parcialmente_recibida` — el cierre siempre es manual por el admin (BR-006).

---

#### US-010 — Cerrar orden de compra con alerta de discrepancia

**Dado que** el usuario es `tienda_admin` y la `OrdenDeCompra` no está en estado `cerrada`
**Cuando** solicita el cierre de la orden
**Y** al menos una `LineaOrden` tiene `(cantidad_pedida - acumulado_recibido) > umbral_discrepancia_orden`
**Entonces** el sistema devuelve una respuesta que indica discrepancia con las líneas afectadas y solicita una justificación obligatoria antes de confirmar el cierre.

**Dado que** el admin confirma el cierre con justificación (no vacía) tras la alerta de discrepancia
**Cuando** el sistema procesa la confirmación
**Entonces** persiste la justificación en la `OrdenDeCompra`, cambia el estado a `cerrada` y devuelve HTTP 200.

**Dado que** ninguna línea supera el umbral de discrepancia
**Cuando** el admin solicita el cierre
**Entonces** el sistema cierra la orden directamente sin solicitar justificación (HTTP 200, estado `cerrada`).

**Dado que** la orden ya está en estado `cerrada`
**Cuando** el admin intenta volver a cerrarla
**Entonces** el sistema devuelve HTTP 400 con mensaje de error.

---

#### US-011 — Listar órdenes de compra

**Dado que** el usuario es `tienda_admin` o `tienda_vendedor`
**Cuando** solicita la lista de órdenes de compra con filtro de estado (opcional, incluye `iniciada`)
**Entonces** el sistema devuelve la lista paginada de órdenes con sus atributos principales (proveedor, fecha_pedido, estado) y HTTP 200.

---

#### US-012 — Ver detalle de orden de compra

**Dado que** el usuario es `tienda_admin` o `tienda_vendedor`
**Cuando** solicita el detalle de una `OrdenDeCompra`
**Entonces** el sistema devuelve la orden con todas sus `LineaOrden`, el acumulado recibido de cada línea, el estado de cada línea, y el historial de `MovimientoInventario` asociado a la orden.

---

### EP-03 — Apertura de jornada de venta

#### US-013 — Crear JornadaVenta con validación de unicidad

**Dado que** el usuario es `tienda_vendedor`
**Cuando** solicita crear una `JornadaVenta` para la Tienda (ubicación de tipo `pos`) en una fecha específica
**Y** no existe ninguna `JornadaVenta` en estado `abierta` para esa Tienda
**Entonces** el sistema crea la jornada con estado `abierta`, registra `vendedor` con el usuario autenticado y devuelve HTTP 201.

**Dado que** ya existe una `JornadaVenta` en estado `abierta` para la misma Tienda
**Cuando** cualquier actor intenta crear una nueva jornada para esa Tienda
**Entonces** el sistema devuelve HTTP 409 Conflict con mensaje explicativo, sin crear la nueva jornada.

**Dado que** la ubicación seleccionada tiene tipo `central` (no es una Tienda)
**Cuando** el actor intenta crear la jornada
**Entonces** el sistema devuelve HTTP 400 indicando que la ubicación debe ser de tipo `pos`.

---

#### US-014 — Traslado masivo de apertura

**Dado que** el usuario es `tienda_vendedor`
**Y** existe una `JornadaVenta` en estado `abierta` para la Tienda
**Cuando** envía la lista de productos con sus cantidades de traslado (solo productos con cantidad > 0 generan movimiento)
**Entonces** el sistema genera, de forma atómica, un par de `MovimientoInventario` (SALIDA CENTRAL + ENTRADA Tienda) con concepto `TRASLADO` por cada producto con cantidad > 0, todos enlazados a la `JornadaVenta` y cada par enlazado por `movimiento_par`, y devuelve HTTP 201 con la lista de movimientos generados.

**Dado que** algún producto tiene stock en CENTRAL menor a la cantidad solicitada
**Cuando** el sistema intenta generar los movimientos
**Entonces** devuelve HTTP 400 indicando el producto y el stock disponible; no genera ningún movimiento (operación atómica total).

**Dado que** todos los productos en la lista tienen cantidad = 0 o están vacíos
**Cuando** el sistema procesa la solicitud
**Entonces** devuelve HTTP 400 indicando que al menos un producto debe tener cantidad mayor a cero.

---

#### US-015 — Snapshot de avg_cost en el traslado

**Dado que** se genera un traslado (apertura o reposición)
**Cuando** el sistema crea los `MovimientoInventario`
**Entonces** registra en el campo `costo_unitario` el valor de `avg_cost` del producto en ese instante exacto, y ese valor no se modifica aunque cambie el `avg_cost` del producto posteriormente en la misma jornada.

---

### EP-04 — Reposición durante el día

#### US-016 — Registrar traslado de reposición

**Dado que** el usuario es `tienda_admin` o `tienda_vendedor`
**Y** existe stock suficiente en CENTRAL
**Cuando** envía la solicitud de traslado indicando producto, cantidad y la Tienda como destino
**Entonces** el sistema genera el par de `MovimientoInventario` (SALIDA CENTRAL + ENTRADA Tienda) con concepto `TRASLADO`, registra `registrado_por` con el usuario autenticado, captura el snapshot de `avg_cost` en ese instante, y devuelve HTTP 201.

**Dado que** el stock en CENTRAL es menor a la cantidad solicitada
**Cuando** el sistema procesa la solicitud
**Entonces** devuelve HTTP 400 indicando stock insuficiente en CENTRAL.

---

#### US-017 — Recepción urgente directa a la Tienda

**Dado que** el usuario es `tienda_admin`
**Y** existe una `OrdenDeCompra` en estado `pendiente` o `parcialmente_recibida`
**Cuando** registra la recepción de una `LineaOrden` seleccionando la Tienda como destino
**Entonces** el sistema aplica exactamente el mismo flujo que US-007 con la ubicación destino igual a la Tienda seleccionada; el `avg_cost` se recalcula con las unidades recibidas en buen estado, independientemente del destino.

---

### EP-05 — Cierre de jornada

#### US-030 — Registrar dinero de entrega y salidas de efectivo al cierre

**Dado que** el usuario es `tienda_vendedor` o `tienda_admin`
**Y** la `JornadaVenta` está en estado `abierta`
**Cuando** envía el conteo físico junto con `dinero_entrega` (monto en efectivo que entrega al admin) y opcionalmente `dinero_salida_monto` con `dinero_salida_descripcion`
**Entonces** el sistema almacena los tres campos en `JornadaVenta`; el vendedor no recibe ni ve ninguna cifra de revenue esperado ni comparación alguna — el sistema acepta lo que reporta sin retroalimentación de cuadre.

**Dado que** el vendedor no incluye `dinero_salida_monto` ni `dinero_salida_descripcion` en el payload
**Cuando** el sistema procesa la solicitud
**Entonces** ambos campos quedan como `null` y el cierre procede normalmente.

**Dado que** el campo `dinero_salida_monto` tiene un valor positivo
**Y** el campo `dinero_salida_descripcion` está vacío o ausente
**Cuando** el sistema valida el payload
**Entonces** devuelve HTTP 400 indicando que la descripción es obligatoria cuando hay salida de efectivo.

**Dado que** el usuario es `tienda_vendedor`
**Cuando** recibe la respuesta del endpoint de cierre o de resumen de cierre
**Entonces** la respuesta no incluye `dinero_entrega`, `dinero_salida_monto`, `dinero_salida_descripcion`, `revenue` ni `alerta_caja`; el vendedor no puede inferir el revenue calculado ni el resultado del cuadre de ningún campo de la respuesta.

---

#### US-031 — Ver alerta de cuadre de caja en el cierre de jornada

**Dado que** el usuario es `tienda_admin`
**Y** la `JornadaVenta` ha sido cerrada con `dinero_entrega` registrado
**Cuando** consulta el detalle o el reporte de cierre de la jornada
**Entonces** el sistema muestra `alerta_caja` calculada (`faltante` / `sobrante` / `ok`), el `revenue` total calculado, `dinero_entrega` y `dinero_salida_monto` reportados por el vendedor, permitiendo al admin comparar ambos valores.

**Dado que** el usuario es `tienda_vendedor`
**Cuando** consulta el detalle de la jornada tras el cierre
**Entonces** el sistema omite completamente los campos `alerta_caja`, `revenue`, `dinero_entrega`, `dinero_salida_monto` y `dinero_salida_descripcion` de la respuesta; el vendedor no ve el resultado de la comparación ni ninguna cifra esperada.

**Dado que** el `dinero_entrega` registrado es menor al `revenue` calculado (según BR-024)
**Cuando** el admin consulta el resumen de cierre
**Entonces** `alerta_caja = faltante` y el admin puede ver tanto el revenue calculado como el monto reportado por el vendedor para identificar la diferencia; la alerta se presenta con indicador visual rojo.

**Dado que** el `dinero_entrega` registrado supera el `revenue` calculado (según BR-024)
**Cuando** el admin consulta el resumen de cierre
**Entonces** `alerta_caja = sobrante` y el admin puede ver tanto el revenue calculado como el monto reportado; la alerta se presenta con indicador visual amarillo.

---

#### US-018 — Ingresar conteo físico de cierre

**Dado que** el usuario es `tienda_vendedor` o `tienda_admin`
**Y** la `JornadaVenta` está en estado `abierta`
**Cuando** envía el conteo físico por producto (cantidad contada para cada producto presente en la Tienda)
**Entonces** el sistema almacena temporalmente los conteos y los expone en la pantalla de resumen (US-019); no persiste ningún movimiento aún.

---

#### US-019 — Pantalla de resumen previo al cierre

**Dado que** el actor ha ingresado el conteo físico de todos los productos
**Cuando** solicita ver el resumen previo al cierre
**Entonces** el sistema devuelve, por cada producto:
- `total_trasladado_al_pos`: suma de todas las cantidades de traslados (apertura + reposiciones) con concepto `TRASLADO` y tipo `ENTRADA` al POS en la jornada.
- `conteo_final`: cantidad ingresada por el actor.
- `unidades_vendidas`: `total_trasladado_al_pos - conteo_final`.
- `revenue_estimado`: `unidades_vendidas × precio_venta`.
- `cogs_estimado`: `unidades_vendidas × promedio_ponderado_traslados_del_dia`.
- `retorno_propuesto_central`: `conteo_final` unidades.
- Totales de jornada: revenue, COGS y utilidad bruta.

El actor puede corregir conteos directamente en esta pantalla antes de confirmar. Ningún `MovimientoInventario` ha sido persistido todavía.

---

#### US-020 — Confirmar cierre de jornada

**Dado que** el actor ha revisado el resumen y confirma el cierre
**Cuando** envía la confirmación de cierre
**Entonces** el sistema registra `cerrado_por` con el usuario autenticado, cambia el estado de la `JornadaVenta` a `cerrada`, y dispara la generación de los movimientos de retorno (US-021); devuelve HTTP 200 con el resumen final.

**Dado que** la `JornadaVenta` ya está en estado `cerrada`
**Cuando** cualquier actor intenta confirmar el cierre
**Entonces** el sistema devuelve HTTP 400 con mensaje "La jornada ya está cerrada; no puede reabrirse."

---

#### US-021 — Retorno automático de inventario al CENTRAL al cierre

**Dado que** el cierre ha sido confirmado (US-020)
**Cuando** el sistema procesa el cierre
**Entonces** para cada producto con `conteo_final > 0`, genera de forma atómica el par de `MovimientoInventario`:
- `MovimientoInventario 1`: tipo `SALIDA`, ubicación Tienda, concepto `TRASLADO`, cantidad = `conteo_final`, `costo_unitario` = snapshot de costo promedio ponderado de los traslados de la jornada para ese producto, `jornada_venta` = la jornada que se cierra.
- `MovimientoInventario 2`: tipo `ENTRADA`, ubicación CENTRAL, concepto `TRASLADO`, mismos datos de costo, enlazado al movimiento 1 por `movimiento_par`.
- El sistema recalcula el `avg_cost` del producto con las unidades que regresan al CENTRAL, usando el mismo costo snapshot.

**Dado que** el `conteo_final` de un producto es 0
**Cuando** el sistema procesa el cierre
**Entonces** no genera par de movimientos de retorno para ese producto.

---

### EP-06 — Reporte de fin de día

#### US-022 — Generar reporte automático al cierre de jornada

**Dado que** la confirmación de cierre ha sido procesada (US-020)
**Cuando** el sistema finaliza los movimientos de retorno
**Entonces** genera automáticamente el reporte de fin de día vinculado a la `JornadaVenta`, con los siguientes datos por producto:
- `unidades_vendidas`
- `revenue` = `unidades_vendidas × precio_venta`
- `cogs` = `unidades_vendidas × promedio_ponderado_traslados_del_dia`
- `utilidad_bruta` = `revenue - cogs`
- `stock_central_al_cierre` (stock en CENTRAL tras el retorno)

El reporte queda almacenado históricamente con referencia a la `JornadaVenta` y el `vendedor`.

**Dado que** el reporte ya fue generado para una jornada
**Cuando** cualquier actor consulta el reporte de esa jornada
**Entonces** el sistema devuelve el reporte almacenado sin recalcular (lectura del snapshot persistido).

---

#### US-023 — Sección "Lista de reabastecimiento" en el reporte

**Dado que** se genera el reporte de fin de día
**Cuando** el sistema evalúa el stock en CENTRAL por producto tras el cierre
**Entonces** incluye en el reporte una sección "Lista de reabastecimiento" con todos los productos cuyo `stock_central_al_cierre <= punto_reorden`, mostrando: nombre del producto, `stock_central_al_cierre` y `cantidad_sugerida_pedido`.

**Dado que** ningún producto está por debajo del punto de reorden
**Cuando** el sistema genera el reporte
**Entonces** la sección "Lista de reabastecimiento" aparece vacía (sin ítems).

**Dado que** el usuario es `tienda_admin` o `tienda_vendedor`
**Cuando** consulta el reporte de fin de día de una jornada cerrada
**Entonces** el sistema devuelve el reporte completo incluyendo la sección de reabastecimiento; no hay acción directa de crear orden desde esta sección.

**Dado que** un producto tiene 5 unidades en `StockUbicacion` (CENTRAL), `punto_reorden = 10`, `cantidad_sugerida_pedido = 50`, y 30 unidades en `LineaOrden` de una orden en estado `pendiente`
**Cuando** el admin consulta la lista de reabastecimiento
**Entonces** el sistema devuelve para ese producto: `stock_actual = 5`, `unidades_en_ordenes_activas = 30`, `cantidad_neta_a_pedir = 20` y `unidades_en_recepcion = 30`.

---

### EP-07 — Consulta de stock

#### US-024 — Consultar stock por producto y ubicación

**Dado que** el usuario es `tienda_admin` o `tienda_vendedor`
**Cuando** solicita el stock de un producto en una ubicación específica
**Entonces** el sistema devuelve `StockUbicacion.cantidad_actual` para ese producto y ubicación con HTTP 200; no realiza ningún cálculo sobre `MovimientoInventario` en tiempo de consulta.

**Dado que** el producto no tiene registro en `StockUbicacion` para esa ubicación
**Cuando** el sistema procesa la consulta
**Entonces** devuelve `cantidad_actual = 0`.

---

#### US-025 — Consultar stock total del sistema

**Dado que** el usuario es `tienda_admin`
**Cuando** solicita el stock total del sistema para un producto
**Entonces** el sistema suma `StockUbicacion.cantidad_actual` de todas las ubicaciones (CENTRAL + todos los POS) y devuelve el total con HTTP 200, desglosado por ubicación.

---

### EP-08 — Ajuste de inventario

#### US-026 — Registrar ajuste de inventario (ENTRADA)

**Dado que** el usuario es `tienda_admin`
**Cuando** envía la creación de un `MovimientoInventario` con tipo `ENTRADA`, concepto `AJUSTE`, producto, ubicación, cantidad > 0, costo_unitario > 0 y nota (no vacía)
**Entonces** el sistema persiste el movimiento, recalcula el `avg_cost` del producto usando la fórmula de costo promedio ponderado, registra `registrado_por` y devuelve HTTP 201.

**Dado que** el campo `nota` está vacío o ausente
**Cuando** el sistema procesa la solicitud de ajuste (ENTRADA o SALIDA)
**Entonces** devuelve HTTP 400 con mensaje "La nota es obligatoria para movimientos de tipo AJUSTE."

**Dado que** el usuario es `tienda_vendedor`
**Cuando** intenta crear cualquier movimiento con concepto `AJUSTE`
**Entonces** el sistema devuelve HTTP 403 Forbidden.

---

#### US-027 — Registrar ajuste de inventario (SALIDA)

**Dado que** el usuario es `tienda_admin`
**Cuando** envía la creación de un `MovimientoInventario` con tipo `SALIDA`, concepto `AJUSTE`, producto, ubicación, cantidad > 0, costo_unitario > 0 y nota (no vacía)
**Entonces** el sistema persiste el movimiento, disminuye el stock de la ubicación, NO modifica el `avg_cost`, registra `registrado_por` y devuelve HTTP 201.

---

#### US-028 — Ver historial de ajustes de inventario

**Dado que** el usuario es `tienda_admin`
**Cuando** solicita el historial de movimientos con concepto `AJUSTE` para un producto
**Entonces** el sistema devuelve la lista de movimientos filtrada por concepto `AJUSTE`, incluyendo tipo, cantidad, costo_unitario, nota, fecha y `registrado_por`, ordenados por fecha descendente.

---

## 4. Entidades de datos

---

### Producto

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| `id` | UUID / AutoInt | PK |
| `nombre` | CharField(200) | NOT NULL |
| `descripcion` | TextField | nullable |
| `unidad` | CharField(50) | NOT NULL — label libre (ej. "unidad", "bolsa", "caja") |
| `precio_venta` | DecimalField(10,2) | NOT NULL, >= 0 |
| `avg_cost` | DecimalField(10,2) | NOT NULL, default=0.00 — calculado por el sistema, no editable por actores |
| `punto_reorden` | PositiveIntegerField | NOT NULL |
| `cantidad_sugerida_pedido` | PositiveIntegerField | NOT NULL |
| `activo` | BooleanField | NOT NULL, default=True |

**Relaciones:**
- Muchos a muchos con `Proveedor` (tabla intermedia `ProductoProveedor`)
- Uno a muchos con `MovimientoInventario` (FK desde `MovimientoInventario.producto`)
- Uno a muchos con `LineaOrden` (FK desde `LineaOrden.producto`)

---

### Proveedor

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| `id` | UUID / AutoInt | PK |
| `nombre` | CharField(200) | NOT NULL |
| `contacto` | TextField | nullable — número, correo, notas de contacto |

**Relaciones:**
- Muchos a muchos con `Producto` (tabla intermedia `ProductoProveedor`)
- Uno a muchos con `OrdenDeCompra` (FK desde `OrdenDeCompra.proveedor`)

---

### Ubicacion

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| `id` | UUID / AutoInt | PK |
| `nombre` | CharField(100) | NOT NULL, UNIQUE — ej. "CENTRAL", "POS_1" |
| `tipo` | CharField(10) | NOT NULL, choices: `central` / `pos` |

**Relaciones:**
- Uno a muchos con `MovimientoInventario` (FK desde `MovimientoInventario.ubicacion`)
- Uno a muchos con `JornadaVenta` (FK desde `JornadaVenta.ubicacion`, solo tipo `pos`)

---

### OrdenDeCompra

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| `id` | UUID / AutoInt | PK |
| `proveedor` | FK(Proveedor) | NOT NULL |
| `fecha_pedido` | DateField | NOT NULL — fecha en que se hizo el pedido al proveedor |
| `estado` | CharField(30) | NOT NULL, choices: `iniciada` / `pendiente` / `parcialmente_recibida` / `cerrada`, default: `pendiente` |
| `notas` | TextField | nullable |
| `justificacion_cierre` | TextField | nullable — obligatorio si se cierra con discrepancia |
| `creado_por` | FK(Usuario) | NOT NULL — solo rol `tienda_admin` |
| `created_at` | DateTimeField | auto |

**Relaciones:**
- Uno a muchos con `LineaOrden` (FK desde `LineaOrden.orden_compra`)
- Uno a muchos con `MovimientoInventario` (FK opcional desde `MovimientoInventario.orden_compra`)

---

### LineaOrden

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| `id` | UUID / AutoInt | PK |
| `orden_compra` | FK(OrdenDeCompra) | NOT NULL |
| `producto` | FK(Producto) | NOT NULL |
| `cantidad_pedida` | PositiveIntegerField | nullable — obligatorio antes de pasar al estado `pendiente`; ausente en órdenes `iniciada` |
| `cantidad_recibida_acumulada` | PositiveIntegerField | NOT NULL, default=0 — calculado por el sistema |
| `costo_unitario_esperado` | DecimalField(10,2) | nullable — obligatorio antes de pasar al estado `pendiente`; ausente en órdenes `iniciada` |
| `estado` | CharField(30) | NOT NULL, choices: `pendiente` / `parcialmente_recibida` / `completa`, default: `pendiente` |

**Relaciones:**
- Pertenece a `OrdenDeCompra` (FK)
- Referencia a `Producto` (FK)

---

### MovimientoInventario

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| `id` | UUID / AutoInt | PK |
| `producto` | FK(Producto) | NOT NULL |
| `ubicacion` | FK(Ubicacion) | NOT NULL |
| `tipo` | CharField(10) | NOT NULL, choices: `ENTRADA` / `SALIDA` |
| `cantidad` | PositiveIntegerField | NOT NULL, > 0 |
| `costo_unitario` | DecimalField(10,2) | NOT NULL — snapshot en el momento del movimiento |
| `concepto` | CharField(20) | NOT NULL, choices: `COMPRA` / `TRASLADO` / `VENTA` / `AVERIA` / `AJUSTE` |
| `nota` | TextField | nullable — OBLIGATORIO si concepto = `AJUSTE` |
| `orden_compra` | FK(OrdenDeCompra) | nullable |
| `linea_orden` | FK(LineaOrden) | nullable — referencia a la línea específica en recepciones |
| `jornada_venta` | FK(JornadaVenta) | nullable |
| `movimiento_par` | FK(self) | nullable — enlaza SALIDA y ENTRADA del mismo traslado |
| `registrado_por` | FK(Usuario) | NOT NULL |
| `fecha` | DateTimeField | auto — timestamp del sistema |

**Relaciones:**
- Referencia a `Producto`, `Ubicacion`, `JornadaVenta`, `OrdenDeCompra`, `LineaOrden`, `Usuario`
- Auto-referencial mediante `movimiento_par` para traslados en par

**Regla de integridad:** Todo movimiento con concepto `TRASLADO` debe tener exactamente un movimiento par enlazado. El `nota` es obligatorio cuando `concepto = AJUSTE`.

---

### StockUbicacion

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| `id` | UUID / AutoInt | PK |
| `producto` | FK(Producto) | NOT NULL |
| `ubicacion` | FK(Ubicacion) | NOT NULL |
| `cantidad_actual` | DecimalField(12,4) | NOT NULL, >= 0 |

**Restricción de unicidad:** `UNIQUE` sobre (`producto`, `ubicacion`) — un solo registro de balance por combinación.

**Relaciones:**
- Referencia a `Producto` (FK)
- Referencia a `Ubicacion` (FK)

**Nota de implementación:** Este registro es mantenido exclusivamente por el sistema en la misma transacción que persiste cada `MovimientoInventario`. No existe endpoint de escritura directa sobre `StockUbicacion`. Las consultas de stock leen siempre de esta entidad; nunca se calcula sobre el historial de movimientos en lectura. `MovimientoInventario` es el libro de auditoría; `StockUbicacion` es el balance operativo.

**Nota — Inventario inicial:** El inventario inicial del sistema se registra mediante entradas de compra normales: `MovimientoInventario` con `tipo = ENTRADA` y `concepto = COMPRA`, utilizando los flujos estándar de recepción de mercancía (EP-02). No existe proceso especial de carga masiva de inventario inicial; cada producto se inicializa a través de una o varias recepciones contra una `OrdenDeCompra`, igual que cualquier compra operativa posterior.

---

### JornadaVenta

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| `id` | UUID / AutoInt | PK |
| `fecha` | DateField | NOT NULL |
| `ubicacion` | FK(Ubicacion) | NOT NULL — debe ser tipo `pos` |
| `vendedor` | FK(Usuario) | NOT NULL — rol `tienda_vendedor` |
| `estado` | CharField(10) | NOT NULL, choices: `abierta` / `cerrada`, default: `abierta` |
| `cerrado_por` | FK(Usuario) | nullable — se llena al cerrar; puede ser `tienda_admin` o `tienda_vendedor` |
| `dinero_entrega` | DecimalField(10,2) | nullable — monto en efectivo entregado por el vendedor al admin al cierre |
| `dinero_salida_monto` | DecimalField(10,2) | nullable — monto de dinero que salió durante el día |
| `dinero_salida_descripcion` | TextField | nullable — descripción libre de por qué salió ese dinero; obligatorio si `dinero_salida_monto` tiene valor |
| `alerta_caja` | CharField(10) | nullable, choices: `ok` / `faltante` / `sobrante` — calculado al cierre; visible solo para `tienda_admin` |
| `created_at` | DateTimeField | auto |

**Restricción de unicidad:** `UNIQUE` sobre (`ubicacion`, `estado='abierta'`) — solo puede existir una jornada abierta por POS en cualquier momento. Implementar a nivel de base de datos como partial unique index o constraint condicional.

**Visibilidad por rol:** `dinero_entrega`, `dinero_salida_monto`, `dinero_salida_descripcion` y `alerta_caja` solo se incluyen en la respuesta de API cuando el usuario autenticado tiene rol `tienda_admin`. El vendedor registra estos campos durante el cierre pero no los recibe de vuelta en la respuesta ni puede consultarlos; el sistema acepta lo que reporta sin mostrarle el revenue calculado ni el resultado del cuadre (BR-024).

**Relaciones:**
- Uno a muchos con `MovimientoInventario` (FK desde `MovimientoInventario.jornada_venta`)
- Uno a muchos con `DetalleCierreJornada` (FK desde `DetalleCierreJornada.jornada_venta`)

---

### DetalleCierreJornada

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| `id` | UUID / AutoInt | PK |
| `jornada_venta` | FK(JornadaVenta) | NOT NULL |
| `producto` | FK(Producto) | NOT NULL |
| `unidades_trasladadas` | PositiveIntegerField | NOT NULL — total enviado al POS durante la jornada |
| `conteo_final` | PositiveIntegerField | NOT NULL — conteo físico ingresado por el vendedor |
| `unidades_vendidas` | PositiveIntegerField | NOT NULL — calculado: `unidades_trasladadas − conteo_final` |
| `revenue` | DecimalField(10,2) | NOT NULL — `unidades_vendidas × precio_venta` al momento del cierre |
| `cogs` | DecimalField(10,2) | NOT NULL — `unidades_vendidas × promedio ponderado de snapshots de traslados` |
| `utilidad_bruta` | DecimalField(10,2) | NOT NULL — `revenue − cogs` |

**Restricción de unicidad:** `UNIQUE` sobre (`jornada_venta`, `producto`) — un solo registro de cierre por producto por jornada.

**Relaciones:**
- Pertenece a `JornadaVenta` (FK)
- Referencia a `Producto` (FK)

**Nota de implementación:** Estos valores se calculan y persisten una sola vez al ejecutar el cierre de jornada (US-020/US-021). Los reportes históricos leen de esta entidad directamente; no recalculan desde `MovimientoInventario`.

**Visibilidad por rol:** `revenue`, `cogs` y `utilidad_bruta` solo se incluyen en la respuesta de API cuando el usuario autenticado tiene rol `tienda_admin`. El `tienda_vendedor` puede ver `unidades_trasladadas`, `unidades_vendidas` y `conteo_final`.

---

### Usuario (extensión del sistema Hersa)

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| `id` | PK heredada del sistema Hersa | — |
| `rol_tienda` | CharField(30) | nullable, choices: `tienda_admin` / `tienda_vendedor` |

**Nota de implementación:** El campo `rol_tienda` extiende el modelo de usuario de Hersa (tabla `auth_user` o modelo customizado existente) sin duplicar la tabla de usuarios. Puede implementarse como un campo adicional en el perfil de usuario o como un grupo de permisos de Django.

---

## 5. Endpoints de API sugeridos

> Prefijo base: `/api/tienda/v1/`
> Autenticación: JWT Bearer token (SimpleJWT, igual que el resto del sistema Hersa).
> Todos los endpoints requieren autenticación. Las restricciones de rol se detallan en la columna de descripción.

---

### EP-01 — Catálogo

| Método | Path | Descripción | Request (campos clave) | Response (campos clave + status) |
|--------|------|-------------|------------------------|----------------------------------|
| `GET` | `/productos/` | Lista productos. `tienda_vendedor`: devuelve solo productos con `activo = True` (filtro fijo, sin parámetro); excluye `precio_venta`, `avg_cost` y campos monetarios (BR-027). `tienda_admin`: devuelve todos los productos (activos e inactivos) por defecto; acepta filtro opcional `?activo=true/false`; incluye `precio_venta`, `avg_cost` y `activo`. | `?activo=true/false` (solo `tienda_admin`) | `tienda_admin`: `[{id, nombre, unidad, precio_venta, avg_cost, punto_reorden, cantidad_sugerida_pedido, activo}]` · 200. `tienda_vendedor`: `[{id, nombre, unidad, punto_reorden, cantidad_sugerida_pedido, activo}]` · 200 (solo activos) |
| `POST` | `/productos/` | Crea un producto. Acceso: solo `tienda_admin`. | `nombre`, `unidad`, `precio_venta`, `punto_reorden`, `cantidad_sugerida_pedido`; opcionales: `descripcion` | `{id, nombre, avg_cost: 0.00, ...}` · 201 / 400 / 403 |
| `GET` | `/productos/{id}/` | Detalle de un producto. Acceso: ambos roles. `tienda_admin`: respuesta completa incluyendo `activo`. `tienda_vendedor`: excluye `precio_venta`, `avg_cost` y campos monetarios (BR-027); si el producto tiene `activo = False`, devuelve HTTP 404. | — | `tienda_admin`: `{id, nombre, avg_cost, precio_venta, activo, ...}` · 200 / 404. `tienda_vendedor`: `{id, nombre, unidad, descripcion, punto_reorden, cantidad_sugerida_pedido, activo}` · 200 / 404 |
| `PATCH` | `/productos/{id}/` | Edita campos del producto incluido `activo`. `avg_cost` ignorado si se envía. Acceso: solo `tienda_admin`. | cualquier campo editable, incluido `activo` (boolean) | `{id, nombre, avg_cost (sin cambio), activo, ...}` · 200 / 400 / 403 / 404 |
| `GET` | `/proveedores/` | Lista proveedores. Acceso: ambos roles. | — | `[{id, nombre, contacto}]` · 200 |
| `POST` | `/proveedores/` | Crea un proveedor. Acceso: solo `tienda_admin`. | `nombre`; opcional: `contacto` | `{id, nombre, contacto}` · 201 / 400 / 403 |
| `PATCH` | `/proveedores/{id}/` | Edita un proveedor. Acceso: solo `tienda_admin`. | `nombre`, `contacto` | `{id, nombre, contacto}` · 200 / 403 / 404 |
| `POST` | `/productos/{id}/proveedores/` | Asocia un proveedor a un producto. Acceso: solo `tienda_admin`. | `proveedor_id` | `{producto_id, proveedor_id}` · 200 / 400 (duplicado) / 403 |
| `DELETE` | `/productos/{id}/proveedores/{proveedor_id}/` | Elimina la asociación producto–proveedor. Acceso: solo `tienda_admin`. | — | 204 / 403 / 404 |

---

### EP-02 — Órdenes de compra

| Método | Path | Descripción | Request (campos clave) | Response (campos clave + status) |
|--------|------|-------------|------------------------|----------------------------------|
| `GET` | `/ordenes-compra/` | Lista órdenes. Filtro opcional por `estado` (incluye `iniciada`). Acceso: ambos roles. | `?estado=iniciada` | `[{id, proveedor, fecha_pedido, estado}]` · 200 |
| `POST` | `/ordenes-compra/` | Crea una orden completa con proveedor y líneas. Estado inicial `pendiente`. Acceso: solo `tienda_admin`. | `proveedor_id`, `fecha_pedido`, `lineas: [{producto_id, cantidad_pedida, costo_unitario_esperado}]`; opcional: `notas` | `{id, estado: "pendiente", creado_por, lineas: [...]}` · 201 / 400 / 403 |
| `POST` | `/ordenes-compra/desde-reabastecimiento/` | Crea una orden en estado `iniciada` desde la lista de reabastecimiento. Acceso: solo `tienda_admin`. | `productos: [{producto_id}]` | `{id, estado: "iniciada", lineas: [{producto_id, cantidad_pedida: null, costo_unitario_esperado: null}]}` · 201 / 400 / 403 |
| `PATCH` | `/ordenes-compra/{id}/` | Edita proveedor, notas o líneas de una orden en estado `iniciada`. Acceso: solo `tienda_admin`. | `proveedor_id`, `notas`, `lineas: [{linea_id, cantidad_pedida, costo_unitario_esperado}]` | `{id, estado, lineas: [...]}` · 200 / 400 / 403 |
| `POST` | `/ordenes-compra/{id}/confirmar/` | Pasa una orden de estado `iniciada` a `pendiente`. Valida que proveedor y todas las líneas estén completos. Acceso: solo `tienda_admin`. | — | `{id, estado: "pendiente"}` · 200 / 400 / 403 |
| `GET` | `/ordenes-compra/{id}/` | Detalle con líneas y movimientos asociados. Acceso: ambos roles. | — | `{id, proveedor, estado, lineas, movimientos}` · 200 / 404 |
| `POST` | `/ordenes-compra/{id}/recepcionar/` | Registra recepción de una línea. Solo válido si estado es `pendiente` o `parcialmente_recibida`. Acceso: ambos roles. | `linea_orden_id`, `cantidad_recibida_buen_estado`, `cantidad_averiada`, `costo_unitario_real`, `destinos: [{ubicacion_id, cantidad}]` | `{movimientos_generados, avg_cost_nuevo}` · 200 / 400 / 403 |
| `POST` | `/ordenes-compra/{id}/cerrar/` | Cierra la orden. Si hay discrepancia, requiere `justificacion`. Acceso: solo `tienda_admin`. | opcional: `justificacion` | `{estado: "cerrada", discrepancias_detectadas, justificacion}` · 200 / 400 / 403 |

---

### EP-03 — Apertura de jornada

| Método | Path | Descripción | Request (campos clave) | Response (campos clave + status) |
|--------|------|-------------|------------------------|----------------------------------|
| `GET` | `/jornadas/` | Lista jornadas con filtros opcionales (`estado`, `ubicacion_id`, `fecha`). Acceso: ambos roles. | — | `[{id, fecha, ubicacion, vendedor, estado}]` · 200 |
| `POST` | `/jornadas/` | Crea una jornada. Valida unicidad (no abierta para esa Tienda). Acceso: `tienda_vendedor` o `tienda_admin`. | `fecha`, `ubicacion_id` | `{id, estado: "abierta", vendedor}` · 201 / 400 / 403 / 409 |
| `POST` | `/jornadas/{id}/traslado-apertura/` | Traslado masivo de apertura. Atómico. Acceso: `tienda_vendedor` o `tienda_admin`. | `productos: [{producto_id, cantidad}]` | `{movimientos_generados: N, detalle: [...]}` · 201 / 400 / 403 |

---

### EP-04 — Reposición

| Método | Path | Descripción | Request (campos clave) | Response (campos clave + status) |
|--------|------|-------------|------------------------|----------------------------------|
| `POST` | `/jornadas/{id}/reposicion/` | Traslado de reposición individual durante el día desde CENTRAL a la Tienda. Acceso: ambos roles. | `producto_id`, `cantidad`, `pos_id` | `{movimiento_salida, movimiento_entrada, costo_unitario_snapshot}` · 201 / 400 |

---

### EP-05 — Cierre de jornada

| Método | Path | Descripción | Request (campos clave) | Response (campos clave + status) |
|--------|------|-------------|------------------------|----------------------------------|
| `POST` | `/jornadas/{id}/resumen-cierre/` | Calcula y devuelve el resumen previo al cierre. No persiste movimientos. Acceso: ambos roles. | `conteos: [{producto_id, cantidad_contada}]`, `dinero_entrega`, `dinero_salida_monto` (opcional), `dinero_salida_descripcion` (obligatorio si salida_monto > 0) | `{por_producto: [{unidades_vendidas, revenue_estimado, cogs_estimado, retorno_propuesto}], totales: {revenue, cogs, utilidad_bruta}}` · 200 / 400 |
| `POST` | `/jornadas/{id}/cerrar/` | Confirma el cierre de la jornada, persiste movimientos de retorno, `DetalleCierreJornada` y genera el reporte. Acceso: ambos roles. | `conteos: [{producto_id, cantidad_contada}]`, `dinero_entrega`, `dinero_salida_monto` (opcional), `dinero_salida_descripcion` (obligatorio si salida_monto > 0) | `{estado: "cerrada", cerrado_por, reporte_id, alerta_caja (solo tienda_admin)}` · 200 / 400 / 409 |
| `GET` | `/jornadas/{id}/` | Detalle de una jornada con sus movimientos. Acceso: ambos roles. | — | `{id, fecha, ubicacion, estado, vendedor, cerrado_por, movimientos}` · 200 / 404 |

---

### EP-06 — Reporte de fin de día

| Método | Path | Descripción | Request (campos clave) | Response (campos clave + status) |
|--------|------|-------------|------------------------|----------------------------------|
| `GET` | `/jornadas/{id}/reporte/` | Devuelve el reporte de fin de día de una jornada cerrada. Acceso: ambos roles. | — | `{jornada_id, vendedor, por_producto: [{nombre, unidades_vendidas, revenue, cogs, utilidad_bruta, stock_central_al_cierre}], lista_reabastecimiento: [{producto_id, nombre, stock_central, cantidad_sugerida_pedido}]}` · 200 / 404 |

---

### EP-07 — Consulta de stock

| Método | Path | Descripción | Request (campos clave) | Response (campos clave + status) |
|--------|------|-------------|------------------------|----------------------------------|
| `GET` | `/stock/` | Stock de un producto en una o todas las ubicaciones, leído desde `StockUbicacion`. Acceso: ambos roles. | `?producto_id=X&ubicacion_id=Y` (ubicacion_id opcional) | `[{ubicacion_id, nombre_ubicacion, cantidad_actual}]` · 200 / 400 |
| `GET` | `/stock/total/` | Stock total del sistema por producto (suma de `cantidad_actual` de `StockUbicacion` en todas las ubicaciones). Acceso: solo `tienda_admin`. | `?producto_id=X` | `{producto_id, nombre, stock_total, desglose: [{ubicacion, cantidad_actual}]}` · 200 / 400 / 403 |
| `GET` | `/stock/reabastecimiento/` | Lista de productos cuyo `StockUbicacion` en CENTRAL ≤ `punto_reorden`. Incluye `unidades_en_ordenes_activas` y `cantidad_neta_a_pedir`. Acceso: solo `tienda_admin`. | — | `[{producto_id, nombre, stock_actual, punto_reorden, cantidad_sugerida_pedido, unidades_en_ordenes_activas, cantidad_neta_a_pedir, unidades_en_recepcion}]` · 200 / 403 |

---

### EP-08 — Ajuste de inventario

| Método | Path | Descripción | Request (campos clave) | Response (campos clave + status) |
|--------|------|-------------|------------------------|----------------------------------|
| `POST` | `/ajustes/` | Crea un movimiento de ajuste (ENTRADA o SALIDA). Nota obligatoria. Acceso: solo `tienda_admin`. | `producto_id`, `ubicacion_id`, `tipo` (ENTRADA/SALIDA), `cantidad`, `costo_unitario`, `nota` | `{id, concepto: "AJUSTE", tipo, avg_cost_nuevo (si ENTRADA)}` · 201 / 400 / 403 |
| `GET` | `/ajustes/` | Lista ajustes filtrados por producto. Acceso: solo `tienda_admin`. | `?producto_id=X` | `[{id, tipo, cantidad, costo_unitario, nota, fecha, registrado_por}]` · 200 / 403 |

---

## 6. Reglas de negocio críticas

---

**BR-001 — Costo promedio ponderado (avg_cost) automático — solo ENTRADA**
El sistema recalcula `avg_cost` del producto en cada evento que agrega unidades al inventario: recepción de compra (US-007) y ajuste de entrada (US-026). La fórmula es:

```
new_avg_cost = (stock_total_sistema × avg_cost_actual + qty_nueva × costo_unitario_real)
               / (stock_total_sistema + qty_nueva)
```

donde `stock_total_sistema` es la suma de entradas menos salidas de `MovimientoInventario` de TODAS las ubicaciones antes de procesar la nueva ENTRADA. Las unidades averiadas NO participan en este cálculo.

Historias que aplican: US-007, US-026.

---

**BR-002 — avg_cost NO se recalcula en SALIDAS**
Cuando se registra cualquier movimiento de tipo `SALIDA` (traslado, venta, avería, ajuste de salida), el `avg_cost` del producto permanece igual. Solo las entradas de unidades al sistema alteran el promedio.

Historias que aplican: US-007 (averías), US-020, US-021, US-027.

---

**BR-003 — Snapshot de costo unitario fijado en el momento del traslado**
Al generar cualquier par de `MovimientoInventario` con concepto `TRASLADO`, el campo `costo_unitario` de ambos movimientos (SALIDA origen y ENTRADA destino) se fija con el `avg_cost` vigente del producto en ese instante exacto. Este snapshot no se modifica aunque el `avg_cost` del producto cambie posteriormente durante la misma jornada por recepciones de mercancía.

Historias que aplican: US-015, US-016.

---

**BR-004 — COGS calculado por promedio ponderado de traslados del día**
Las unidades vendidas en la jornada se valoran mediante el promedio ponderado de todos los traslados al POS registrados durante esa jornada (apertura + reposiciones):

```
COGS = unidades_vendidas × (SUM(qty_traslado × snapshot_costo_traslado) / SUM(qty_traslado))
```

No se aplica FIFO. El promedio incluye todos los traslados del día independientemente de su orden.

Historias que aplican: US-019, US-022.

---

**BR-005 — Traslados siempre en par atómico**
Todo traslado genera exactamente dos `MovimientoInventario` enlazados por `movimiento_par` (SALIDA origen + ENTRADA destino), en una operación atómica. No puede existir un movimiento de traslado sin su contraparte. Si la operación atómica falla, ninguno de los dos movimientos se persiste.

Historias que aplican: US-014, US-016, US-021.

---

**BR-006 — Cierre manual de OrdenDeCompra por el admin**
El admin cierra la `OrdenDeCompra` manualmente en cualquier momento, independientemente del porcentaje recibido en cada línea. No existe cierre automático por recepción completa de todas las líneas. Una orden cerrada no puede seguir recibiendo mercancía.

Historias que aplican: US-010.

---

**BR-007 — Alerta de discrepancia en cierre de OrdenDeCompra**
Al solicitar el cierre de una `OrdenDeCompra`, el sistema evalúa por cada `LineaOrden`:

```
discrepancia = cantidad_pedida - cantidad_recibida_acumulada
```

Si `discrepancia > umbral_discrepancia_orden` (parámetro configurable del sistema) en al menos una línea, el sistema solicita una justificación obligatoria (no vacía) antes de permitir el cierre. La justificación se persiste en `OrdenDeCompra.justificacion_cierre`. El cierre no se bloquea, pero no puede confirmarse sin justificación cuando se supera el umbral.

Historias que aplican: US-010.

---

**BR-008 — Unicidad de JornadaVenta abierta por Tienda**
Solo puede existir una `JornadaVenta` con estado `abierta` por ubicación de tipo `pos` (Tienda) en cualquier momento. El sistema rechaza la creación de una nueva jornada si ya existe una abierta para la misma Tienda. Esta restricción debe implementarse a nivel de base de datos (partial unique index o constraint condicional) además de la validación en la capa de aplicación.

Historias que aplican: US-013.

---

**BR-009 — JornadaVenta: solo ubicaciones tipo `pos`**
No se puede crear una `JornadaVenta` con una ubicación de tipo `central`. El campo `ubicacion` de `JornadaVenta` debe referenciar exclusivamente ubicaciones con `tipo = 'pos'`. El sistema valida esto en el momento de creación y devuelve HTTP 400 si la ubicación es de tipo incorrecto.

Historias que aplican: US-013.

---

**BR-010 — JornadaVenta cerrada es inmutable**
Una `JornadaVenta` en estado `cerrada` no puede volver a cerrarse ni reabrirse bajo ninguna circunstancia. Cualquier intento de modificar el estado de una jornada cerrada es bloqueado por el sistema. El campo `cerrado_por` registra la identidad del actor (admin o vendedor) que ejecutó el cierre.

Historias que aplican: US-020.

---

**BR-011 — Pantalla de resumen es requisito previo al cierre**
Los `MovimientoInventario` de retorno al CENTRAL solo se persisten tras la confirmación explícita del actor. El sistema no ejecuta movimientos de retorno de forma automática sin confirmación. El endpoint `POST /jornadas/{id}/resumen-cierre/` es un paso previo de solo lectura; `POST /jornadas/{id}/cerrar/` es el único punto que persiste movimientos.

Historias que aplican: US-018, US-019, US-020, US-021.

---

**BR-012 — Retorno al CENTRAL usa el mismo costo snapshot del traslado de origen**
Al generar los movimientos de retorno al cierre de jornada, el `costo_unitario` del par de movimientos de retorno (SALIDA POS + ENTRADA CENTRAL) es el promedio ponderado de los costos snapshot de los traslados de la jornada hacia ese POS, no el `avg_cost` vigente al momento del cierre.

Historias que aplican: US-021.

---

**BR-013 — Unidades averiadas: sin efecto en stock ni en avg_cost**
Las unidades declaradas como averiadas durante la recepción de mercancía generan un `MovimientoInventario` de tipo `SALIDA` con concepto `AVERIA` desde la ubicación destino. No incrementan el stock disponible de ninguna ubicación. No participan en el recálculo de `avg_cost`. Quedan trazadas en el historial de movimientos.

Historias que aplican: US-007, US-008.

---

**BR-014 — Stock leído desde StockUbicacion; MovimientoInventario es libro de auditoría**
El stock disponible de cualquier producto en cualquier ubicación se lee siempre de `StockUbicacion.cantidad_actual`. Este campo es mantenido exclusivamente por el sistema en la misma transacción que persiste cada `MovimientoInventario` (BR-021). No existe un endpoint de escritura directa sobre `StockUbicacion`. `MovimientoInventario` es el libro de auditoría completo e inmutable; las consultas de stock no calculan sobre él en tiempo de ejecución.

Historias que aplican: US-024, US-025, US-029.

---

**BR-015 — Ajuste de inventario: exclusivo del admin y nota obligatoria**
Ningún actor con rol `tienda_vendedor` puede crear `MovimientoInventario` con concepto `AJUSTE`. El sistema devuelve HTTP 403 ante cualquier intento. Todo ajuste del admin requiere el campo `nota` (no vacío); sin nota, el sistema devuelve HTTP 400.

Historias que aplican: US-026, US-027.

---

**BR-016 — Traslado masivo de apertura: operación atómica total**
El traslado masivo de apertura (US-014) es una operación atómica: si algún producto no tiene stock suficiente en CENTRAL, ninguno de los movimientos de la operación se persiste. El sistema devuelve HTTP 400 indicando el o los productos con stock insuficiente, y el estado del inventario permanece inalterado.

Historias que aplican: US-014.

---

**BR-017 — Parámetro `umbral_discrepancia_orden` configurable**
El umbral de discrepancia para el cierre de órdenes de compra (BR-007) es un parámetro de configuración del sistema, no un valor hardcodeado. Debe poder actualizarse por el administrador sin necesidad de redeploy. El valor inicial es **5 %**: si la cantidad recibida acumulada por línea difiere en más del 5 % de la `cantidad_pedida`, el sistema exige una justificación obligatoria (no vacía) antes de permitir confirmar el cierre de la orden. Este valor se almacena como parámetro nombrado (`umbral_discrepancia_orden = 0.05`) en la configuración del sistema y debe documentarse en los archivos de configuración del proyecto.

Historias que aplican: US-010.

---

**BR-018 — Traslado de reposición: trazabilidad por `registrado_por`**
Cualquier traslado de reposición (US-016) queda registrado con la identidad del actor autenticado en el campo `registrado_por` del `MovimientoInventario`. No existe flujo de aprobación previo. El control de acceso se ejerce por rol: ambos roles (`tienda_admin` y `tienda_vendedor`) pueden ejecutar traslados de reposición.

Historias que aplican: US-016.

---

**BR-019 — Recepciones de compra: referencia a línea de orden**
Cada `MovimientoInventario` generado durante la recepción de mercancía (US-007) debe referenciar tanto la `OrdenDeCompra` (campo `orden_compra`) como la `LineaOrden` específica que se está recepcionando (campo `linea_orden`). Esto permite reconstruir el historial completo de recepciones por línea.

Historias que aplican: US-007, US-008, US-012.

---

**BR-020 — Producto activo es condición para aparecer en flujos operativos de la Tienda**
Solo los productos con campo `activo = True` aparecen en los endpoints consumidos por el vendedor durante la operación de la Tienda: traslado masivo de apertura (US-014), traslado de reposición (US-016) y recepción de mercancía (US-007). Los productos con `activo = False` no son devueltos ni seleccionables en ninguno de esos flujos. Los endpoints de gestión de catálogo del admin (`GET /productos/`, `GET /productos/{id}/`, `PATCH /productos/{id}/`) sí incluyen productos inactivos y permiten modificar el campo `activo`.

Historias que aplican: US-001, US-002, US-014, US-016, US-007.

---

**BR-021 — StockUbicacion se actualiza atómicamente con cada MovimientoInventario**
Cada `MovimientoInventario` que se persiste debe actualizar el registro de `StockUbicacion` correspondiente (producto + ubicación) en la misma transacción de base de datos. Si la transacción falla por cualquier motivo, ambos registros se revierten juntos. Las consultas de stock disponible leen siempre de `StockUbicacion.cantidad_actual`; nunca calculan sobre el historial de movimientos en tiempo de consulta. `MovimientoInventario` es exclusivamente el libro de auditoría; `StockUbicacion` es el balance operativo vigente.

Historias que aplican: US-029, US-024, US-025.

---

**BR-022 — StockUbicacion.cantidad_actual nunca puede ser negativo**
Si una operación de `SALIDA` llevaría `StockUbicacion.cantidad_actual` por debajo de 0, la transacción completa falla. El sistema devuelve error indicando stock insuficiente. Esta restricción se aplica en la capa de aplicación antes de intentar la transacción, y opcionalmente como constraint de base de datos (`CHECK cantidad_actual >= 0`).

Historias que aplican: US-029, US-014, US-016.

---

**BR-023 — DetalleCierreJornada se calcula y persiste una sola vez al cierre**
Al confirmar el cierre de una `JornadaVenta`, el sistema calcula y persiste un registro de `DetalleCierreJornada` por cada producto que tuvo movimiento en la jornada. Este cálculo ocurre en la misma transacción que los movimientos de retorno al CENTRAL. Los reportes históricos leen de `DetalleCierreJornada` directamente; nunca recalculan desde movimientos. Si la transacción de cierre falla, ningún registro de `DetalleCierreJornada` se persiste.

Historias que aplican: US-020, US-021, US-022.

---

**BR-024 — alerta_caja calculada al cierre; el vendedor no ve revenue ni cifras esperadas**
Al confirmar el cierre, el sistema calcula `alerta_caja` en `JornadaVenta` con la siguiente lógica:
- `alerta_caja = faltante` si `(dinero_entrega + COALESCE(dinero_salida_monto, 0)) < revenue` → indicador visual rojo para el admin.
- `alerta_caja = sobrante` si `(dinero_entrega + COALESCE(dinero_salida_monto, 0)) > revenue` → indicador visual amarillo para el admin.
- `alerta_caja = ok` si ambos valores son iguales.

donde `revenue` es la suma de `DetalleCierreJornada.revenue` de todos los productos de la jornada.

El vendedor ingresa `dinero_entrega`, `dinero_salida_monto` y `dinero_salida_descripcion` sin ver el revenue calculado ni ninguna cifra esperada de cuadre. El sistema acepta lo que reporta el vendedor sin revelarle la comparación. Solo el usuario con rol `tienda_admin` recibe en las respuestas de API los campos `alerta_caja`, `revenue`, `dinero_entrega`, `dinero_salida_monto` y `dinero_salida_descripcion`.

Historias que aplican: US-030, US-031.

---

**BR-025 — OrdenDeCompra estado `iniciada`: transición y restricciones**
Una `OrdenDeCompra` en estado `iniciada` tiene las siguientes restricciones:
- No puede recibir mercancía (recepciones bloqueadas con HTTP 400).
- Para pasar a estado `pendiente`, debe tener: proveedor asignado y todas las `LineaOrden` con `cantidad_pedida > 0` y `costo_unitario_esperado > 0`.
- El cambio de estado de `iniciada` a `pendiente` se realiza mediante el endpoint `POST /ordenes-compra/{id}/confirmar/`.
- Una orden en estado `iniciada` es editable (proveedor, notas, líneas) mediante PATCH.

La secuencia de estados completa es: `iniciada` → `pendiente` → `parcialmente_recibida` → `cerrada`.

Historias que aplican: US-032, US-006, US-007.

---

**BR-026 — Lista de reabastecimiento incluye unidades en órdenes activas**
La lista de reabastecimiento muestra, por cada producto con `StockUbicacion` (CENTRAL) ≤ `punto_reorden`:
- `unidades_en_ordenes_activas`: suma de `LineaOrden.cantidad_pedida` de líneas en órdenes con estado `iniciada` o `pendiente` para ese producto.
- `cantidad_neta_a_pedir`: `max(0, cantidad_sugerida_pedido − unidades_en_ordenes_activas)`.
- `unidades_en_recepcion`: suma de `cantidad_pedida` de líneas en órdenes con estado `pendiente` o `parcialmente_recibida`.

Esto evita duplicar pedidos cuando ya existe una orden activa para el mismo producto.

Historias que aplican: US-023, US-032.

---

**BR-027 — Visibilidad transversal de campos monetarios para `tienda_vendedor`**
El rol `tienda_vendedor` tiene acceso de solo cantidad en todos los contextos del sistema. Esta restricción es transversal y aplica a todos los endpoints del módulo Tienda:

- **Listado y detalle de productos** (`GET /productos/` y `GET /productos/{id}/`): la respuesta excluye `precio_venta`, `avg_cost` y cualquier campo monetario cuando el usuario autenticado tiene rol `tienda_vendedor`. El vendedor recibe únicamente los campos no monetarios: `id`, `nombre`, `descripcion`, `unidad`, `punto_reorden`, `cantidad_sugerida_pedido`, `activo`. Adicionalmente, el listado para `tienda_vendedor` solo incluye productos con `activo = True` (BR-028).
- **Detalle de `JornadaVenta`** (`GET /jornadas/{id}/`): se excluyen `dinero_entrega`, `dinero_salida_monto`, `dinero_salida_descripcion` y `alerta_caja` (ya cubierto por BR-024).
- **Detalle de `DetalleCierreJornada`** y reporte de fin de día: se excluyen `revenue`, `cogs` y `utilidad_bruta` (ya cubierto por la nota de visibilidad en la entidad).
- **Resumen previo al cierre** (`POST /jornadas/{id}/resumen-cierre/`): la respuesta para `tienda_vendedor` omite `revenue_estimado`, `cogs_estimado` y `utilidad_bruta`; el vendedor recibe únicamente `total_trasladado_al_pos`, `conteo_final`, `unidades_vendidas` y `retorno_propuesto_central`.
- **Ningún otro endpoint del módulo** devuelve campos monetarios al `tienda_vendedor`, independientemente de que el campo exista en el modelo subyacente.

La capa de serialización (DRF serializers) es el punto de aplicación obligatorio de esta regla. No es suficiente filtrar a nivel de permisos de endpoint; la restricción de campos debe implementarse con serializers diferenciados por rol o con lógica de exclusión condicional dentro del serializer.

Historias que aplican: US-001, US-002, US-019, US-022, US-023, US-024, US-030, US-031.

---

**BR-028 — Campo `activo` en Producto: controlado por el admin; invisible para flujos del vendedor**
El campo `activo` (boolean, default `True`) en la entidad `Producto` puede ser modificado libremente por el `tienda_admin` a su discreción mediante PATCH sobre el producto. No existe un flujo de aprobación ni restricción de negocio adicional para activar o desactivar un producto.

Los productos con `activo = False` son excluidos automáticamente de los endpoints consumidos por el vendedor durante la operación de la Tienda:
- `GET /jornadas/{id}/traslado-apertura/` — la lista de productos del formulario de apertura excluye los inactivos.
- `POST /jornadas/{id}/reposicion/` — si el producto enviado está inactivo, el sistema devuelve HTTP 400.
- `POST /ordenes-compra/{id}/recepcionar/` — si el producto de la línea está inactivo, el sistema devuelve HTTP 400.

Los endpoints de gestión de catálogo del admin (`GET /productos/`, `GET /productos/{id}/`, `PATCH /productos/{id}/`) incluyen productos con `activo = False` y devuelven el campo `activo` en la respuesta. El admin puede filtrar la lista por `activo` como parámetro query opcional.

Historias que aplican: US-001, US-002, US-014, US-016, US-007.

---

## 7. Dependencias entre historias

| Historia ID | Depende de | Razón |
|-------------|------------|-------|
| US-002 | US-001 | Solo se puede editar un producto que exista; EP-01 debe inicializarse con al menos un producto. |
| US-004 | US-003 | Solo se puede editar un proveedor existente. |
| US-005 | US-001, US-003 | La asociación producto–proveedor requiere que ambas entidades existan. |
| US-006 | US-003, US-001, US-005 | La orden de compra requiere un proveedor existente y productos asociados a ese proveedor. |
| US-007 | US-006 | La recepción de mercancía opera sobre una `OrdenDeCompra` en estado `pendiente` o `parcialmente_recibida`. |
| US-008 | US-007 | Las averías se registran como parte del flujo de recepción (US-007); son parte del mismo request. |
| US-009 | US-007 | El estado automático de la orden y sus líneas se evalúa tras cada recepción (US-007). |
| US-010 | US-006, US-007 | El cierre opera sobre una `OrdenDeCompra` existente; tiene sentido ejecutarlo tras al menos una recepción. |
| US-011 | US-006 | La lista de órdenes requiere que existan órdenes creadas. |
| US-012 | US-006 | El detalle requiere una `OrdenDeCompra` existente; incluye líneas y movimientos. |
| US-013 | US-001 | La `JornadaVenta` debe poder asociarse a movimientos de inventario de productos del catálogo. La `Ubicacion` (POS) debe existir en el sistema. |
| US-014 | US-013, US-001 | El traslado masivo requiere una `JornadaVenta` abierta (US-013) y productos activos en catálogo (US-001). |
| US-015 | US-014 | El snapshot de `avg_cost` se captura durante la generación de los movimientos del traslado (US-014); no es un paso separado. |
| US-016 | US-013, US-001 | La reposición requiere una jornada abierta para el POS destino y un producto en catálogo. |
| US-017 | US-006, US-013 | La recepción urgente al POS es una variante de US-007; requiere una `OrdenDeCompra` activa y un POS operativo. |
| US-018 | US-013 | El conteo físico se registra sobre una `JornadaVenta` en estado `abierta`. |
| US-019 | US-018, US-014 | La pantalla de resumen requiere los conteos ingresados (US-018) y los traslados de la jornada (US-014) para calcular unidades vendidas y COGS. |
| US-020 | US-019 | La confirmación de cierre solo procede tras revisar el resumen (US-019). |
| US-021 | US-020 | Los movimientos de retorno al CENTRAL solo se generan tras la confirmación explícita del cierre (US-020). |
| US-022 | US-020, US-021 | El reporte de fin de día se genera al finalizar el proceso de cierre (US-020) y los movimientos de retorno (US-021). |
| US-023 | US-022 | La "Lista de reabastecimiento" es una sección del reporte de fin de día (US-022). |
| US-024 | US-001 | La consulta de stock requiere que existan productos en catálogo y movimientos registrados. |
| US-025 | US-024 | El stock total es la agregación de los stocks por ubicación (US-024). |
| US-026 | US-001 | El ajuste requiere un producto existente y una ubicación. |
| US-027 | US-001 | Igual que US-026. |
| US-028 | US-026, US-027 | El historial de ajustes requiere que existan movimientos de tipo `AJUSTE` registrados. |
| US-029 | US-007, US-014, US-016, US-026, US-027 | La actualización de `StockUbicacion` es consecuencia directa de cualquier `MovimientoInventario`; requiere que los flujos que generan movimientos estén implementados. |
| US-030 | US-018 | El registro de dinero se hace como parte del proceso de cierre; requiere que el conteo físico esté definido (US-018). |
| US-031 | US-030, US-022 | La alerta de caja requiere el dinero registrado (US-030) y el revenue calculado al cierre (US-022). |
| US-032 | US-001, US-023 | La generación de orden `iniciada` desde reabastecimiento requiere productos en catálogo (US-001) y la lista de reabastecimiento (US-023). |

---

## 8. Historias fuera de alcance v1

Los siguientes elementos están mencionados en el proceso to-be o el as-is pero excluidos explícitamente del alcance de esta especificación. Cada ítem incluye la razón de exclusión.

- **Múltiples POS simultáneos en operación activa.** El modelo de datos soporta múltiples ubicaciones de tipo `pos`, pero la UI de v1 no contempla la operación paralela de varios POS activos. Excluido por decisión de alcance; la infraestructura de datos ya lo habilita para v2.

- **Exportación de reportes a Excel o PDF.** Los reportes de fin de día y el historial de jornadas son consultables únicamente en pantalla en v1. Excluido explícitamente en el to-be (Proceso 7, "Qué no se cambió y por qué").

- **Generación automática completa de órdenes de compra desde la alerta de reabastecimiento.** La lista de reabastecimiento permite crear una `OrdenDeCompra` en estado `iniciada` (US-032), pero el llenado completo de proveedor, cantidades y costos es responsabilidad del admin en un paso posterior. No existe autocompletado de proveedor ni de cantidades pedidas: esa negociación es manual.

- **Escaneo de códigos de barras en el conteo físico de cierre.** El conteo físico al cierre de jornada es manual en v1. El escaneo de códigos de barras fue explícitamente excluido del alcance v1 en el as-is y to-be.

- **Estadísticas históricas agregadas.** Vistas de tendencias de ventas, comparativas entre jornadas, o análisis histórico de COGS están fuera del alcance v1. El reporte de fin de día es el único artefacto analítico incluido en esta versión.

- **Flujo de solicitud/aprobación de traslados de reposición.** La entidad `SolicitudTraslado` fue propuesta (C1) y rechazada por el negocio. Los traslados se ejecutan directamente sin paso de aprobación; el control se ejerce por permisos de rol.

- **Dashboard de órdenes de compra para el Gerente.** El proceso to-be no define un panel de visibilidad gerencial para el módulo Tienda equivalente al que existe para el módulo Hersa principal. Queda fuera del alcance v1.

- **Notificaciones automáticas al vendedor.** No se define en el to-be ningún mecanismo de alerta push o email para el vendedor sobre niveles de stock críticos o jornadas sin cerrar. Fuera de alcance v1.

- **Integración con el módulo de pagos de Hersa.** El módulo Tienda opera de forma independiente del módulo de cobros del sistema Hersa principal (SesionCobro, Pago, etc.). No se define integración entre ambos módulos en v1.

---

*Especificación actualizada v1.3 — 2026-05-04. Cambios aplicados sobre v1.2: (1) Cuadre de caja — US-030, US-031 y BR-024 actualizados: el vendedor no ve revenue calculado ni cifras esperadas durante el cierre; el sistema acepta lo que reporta; solo el admin ve `alerta_caja` (rojo/amarillo) y los valores de revenue vs. reportado. (2) Campo `activo` en Producto — ya existía en la entidad; BR-020 ampliada para cubrir traslado de apertura, reposición y recepción; endpoint `GET /productos/` actualizado (filtro fijo por `activo` para el vendedor, filtro opcional para el admin); `GET /productos/{id}/` devuelve 404 al vendedor si el producto es inactivo; `PATCH /productos/{id}/` permite editar `activo`; añadida BR-028 con las reglas completas de activación/desactivación. (3) Nombre del POS — todas las referencias narrativas a "POS" o "punto de venta" en descripciones de user stories y criterios de aceptación reemplazadas por "Tienda"; los nombres de campos técnicos (`tipo = pos`, `ubicacion`, `pos_id`) permanecen inalterados. Total: 8 epics, 32 user stories, 32 bloques Given/When/Then, 9 entidades, 30 endpoints sugeridos, 28 reglas de negocio, 30 dependencias entre historias, 9 ítems fuera de alcance. Sin [BLOCKER] activos.*

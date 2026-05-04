# Tienda — Reporte de Proceso Operativo To-Be

**Versión:** 1.1
**Fecha:** 2026-05-04
**Estado:** Decisiones de usuario aplicadas
**Módulo:** Tienda (gestión de inventario y punto de venta de productos comestibles)
**Basado en as-is:** `documentation/requirements/tienda-proceso-operativo-as-is.md` v1.1
**Metodología:** Lean (Muda, detección de cuellos de botella, automatización de comportamiento, reducción de fricción)

---

## Tabla de contenido

1. [Diagnóstico](#1-diagnóstico)
2. [Proceso To-Be](#2-proceso-to-be)
   - [Proceso 1 — Gestión de productos y proveedores](#proceso-1--gestión-de-productos-y-proveedores)
   - [Proceso 2 — Orden de compra y recepción de mercancía](#proceso-2--orden-de-compra-y-recepción-de-mercancía)
   - [Proceso 3 — Apertura de jornada de venta](#proceso-3--apertura-de-jornada-de-venta)
   - [Proceso 4 — Reposición durante el día](#proceso-4--reposición-durante-el-día)
   - [Proceso 5 — Cierre de jornada](#proceso-5--cierre-de-jornada)
   - [Proceso 6 — Reporte de fin de día](#proceso-6--reporte-de-fin-de-día)
   - [Proceso 7 — Consulta de stock](#proceso-7--consulta-de-stock)
   - [Proceso 8 — Ajuste de inventario](#proceso-8--ajuste-de-inventario)
3. [Tabla de cambios](#3-tabla-de-cambios)
4. [Pasos eliminados](#4-pasos-eliminados)
5. [Pasos automatizables vs. manuales](#5-pasos-automatizables-vs-manuales)
6. [Impacto estimado](#6-impacto-estimado)
7. [Qué no se cambió y por qué](#7-qué-no-se-cambió-y-por-qué)

---

## 1. Diagnóstico

Los cinco problemas críticos del proceso as-is, ordenados por impacto estimado (mayor primero):

### D1 — Traslados de reposición sin registro en el sistema (impacto: alto)

El flujo de traslados adicionales durante el día (Proceso 4) ocurre completamente fuera del sistema mediante comunicación directa entre el vendedor y el administrador. No existe trazabilidad de cuándo se realizan, quién los ejecuta ni con qué frecuencia ocurre el desabastecimiento por producto. El sistema no puede emitir métricas sobre este evento. **Decisión adoptada:** los traslados los ejecuta directamente quien tenga acceso (admin o vendedor autorizado), sin paso intermedio de aprobación, pero registrados en el sistema con trazabilidad de quién ejecutó cada uno.

### D2 — Retorno automático de inventario no confirmable (impacto: alto)

Al cierre de la jornada (Proceso 5), el sistema ejecuta inmediatamente los movimientos de retorno al CENTRAL sin mostrar al vendedor una pantalla de confirmación previa. Si el conteo ingresado tiene un error (dígito equivocado, producto confundido), los movimientos quedan registrados sin posibilidad de revisión. Un error de conteo propaga incorrecciones en el `avg_cost` y en el stock de CENTRAL, con efecto acumulativo en jornadas futuras.

### D3 — Apertura y reposición producto por producto (impacto: medio-alto)

El vendedor debe registrar un traslado individual por cada producto en la apertura (Proceso 3) y en cada reposición (Proceso 4). No existe operación de traslado masivo ni plantilla reutilizable. En operaciones con 10 o más productos distintos, el tiempo operativo de apertura es proporcional al número de SKUs, aumentando el riesgo de omisión y retrasando el inicio de la jornada.

### D4 — Órdenes de compra de un solo producto y cierre sin validación de discrepancia (impacto: medio)

La entidad `OrdenDeCompra` está diseñada para un único producto. Cuando llega un pedido multiproducto, el admin debe crear N órdenes independientes, multiplicando el esfuerzo. Además, el cierre manual de la orden (Proceso 2, paso 10) no emite alerta cuando la diferencia entre lo pedido y lo recibido es significativa, lo que permite cerrar órdenes con discrepancias no justificadas sin registro.

### D5 — Sin visión consolidada de reabastecimiento en el reporte de fin de día (impacto: medio)

El sistema identifica productos bajo el punto de reorden pero no los agrupa de forma operativa para que el admin pueda actuar. El admin debe recordar qué productos están en alerta al momento de hacer pedidos al proveedor — proceso que implica búsqueda y negociación manual, no una acción directa desde el sistema. **Decisión adoptada:** el reporte de fin de día incluye una sección "Lista de reabastecimiento" que consolida todos los productos bajo el punto de reorden con su cantidad sugerida de pedido, para que el admin la use como referencia al negociar con proveedores. No hay creación de orden directa desde la alerta.

---

## 3. Tabla de cambios

> La numeración de cambios (C1–C6) referencia los cambios propuestos en el análisis Lean original. La columna "Decisión" refleja lo acordado con el usuario.

| # | Cambio propuesto | Decisión | Cambio adoptado | Impacto esperado |
|---|-----------------|----------|-----------------|-----------------|
| C1 | Flujo de solicitud/aprobación de traslados de reposición mediante entidad `SolicitudTraslado` | **RECHAZADO** | Los traslados de reposición los ejecuta directamente quien tenga acceso (admin o vendedor autorizado), sin paso intermedio de aprobación. El sistema registra quién ejecutó cada traslado para trazabilidad. | Trazabilidad de traslados por actor sin fricción de aprobación |
| C2 | Pantalla de resumen previa al cierre de jornada con conteos y movimientos de retorno propuestos | **ACEPTADO** | Se mantiene: el vendedor revisa el resumen antes de confirmar; los movimientos solo se persisten tras confirmación explícita | Reducción de errores de inventario; menor costo de corrección post-cierre |
| C3 | Traslado masivo de apertura: registro de todos los productos en un único formulario de lista con confirmación única | **ACEPTADO** | Se mantiene: el sistema presenta lista de productos con campo de cantidad por producto; una sola confirmación genera todos los pares de movimientos | Reducción de tiempo de apertura; menor fricción para el vendedor |
| C4 | Alerta con justificación obligatoria al cerrar una orden con discrepancia significativa entre cantidad pedida y recibida | **ACEPTADO** | Se mantiene: umbral configurable (`umbral_discrepancia_orden`); el cierre no se bloquea pero queda registrado con justificación. La justificación es obligatoria si se supera el umbral | Trazabilidad de discrepancias; reducción de pérdidas no documentadas |
| C5 | Botón "Crear orden de compra" directamente desde la alerta de reabastecimiento en el reporte de fin de día | **RECHAZADO — reemplazado** | El reporte de fin de día incluye una sección "Lista de reabastecimiento" que lista todos los productos por debajo del punto de reorden con su cantidad sugerida de pedido. El admin la usa como referencia al negociar con proveedores. No hay acción directa de crear orden desde ahí | Consolidación visual de necesidades de reabastecimiento; el admin tiene la lista lista sin búsqueda manual |
| C6 | `OrdenDeCompra` multi-producto: múltiples líneas por proveedor | **ACEPTADO con ajuste de concepto** | Una orden agrupa múltiples productos del mismo proveedor y se conceptualiza como "pedido ya hecho al proveedor" (no una orden prospectiva). Entidad: `OrdenDeCompra` (proveedor, fecha_pedido, estado, notas) + `LineaOrden` (producto, cantidad_pedida, costo_unitario_esperado por línea) | Reducción de N órdenes a 1 por pedido multiproducto; alineación con práctica real de pedidos |
| D+ | JornadaVenta: máximo una abierta por POS en cualquier momento | **NUEVO — ACEPTADO** | El sistema impide abrir una segunda JornadaVenta si ya hay una en estado `abierta` para el mismo POS | Prevención de datos duplicados y ambigüedad de stock en jornadas solapadas |
| D+ | Cierre de jornada: puede cerrarlo el vendedor o el admin; registro de quién cerró | **NUEVO — ACEPTADO** | El campo `cerrado_por` registra al actor que ejecutó el cierre. Una jornada cerrada no puede reabrirse | Trazabilidad de responsabilidad operativa al cierre |
| D+ | Ajuste de inventario (tipo AJUSTE): solo el admin, con nota obligatoria | **NUEVO — ACEPTADO** | Se añade proceso explícito. El admin puede crear un `MovimientoInventario` de tipo `AJUSTE` (ENTRADA o SALIDA) con nota obligatoria. Ningún otro rol puede crear movimientos de tipo AJUSTE | Control de correcciones de inventario con autoría y justificación registradas |

---

## 2. Proceso To-Be

> Los actores son idénticos al as-is: **Administrador** (`tienda_admin`) y **Vendedor** (`tienda_vendedor`).
> Los cambios respecto al as-is se señalan con `[CAMBIO Cx]`. Los pasos sin marca son idénticos al as-is.

---

### Proceso 1 — Gestión de productos y proveedores

**Actor principal:** Administrador (`tienda_admin`)

**Pasos:**

1. **Admin crea un producto.** Ingresa nombre, descripción, unidad (label libre), precio de venta, punto de reorden y cantidad sugerida de pedido. El campo `avg_cost` inicia en 0 y es mantenido automáticamente por el sistema.
2. **Admin edita un producto existente.** Puede modificar cualquier campo excepto `avg_cost`, que es calculado por el sistema.
3. **Admin crea un proveedor.** Ingresa nombre y datos de contacto.
4. **Admin edita un proveedor existente.** Puede modificar nombre y contacto.
5. **Admin asocia un producto a uno o más proveedores.** La relación producto–proveedor es de muchos a muchos.

> Sin cambios respecto al as-is. El catálogo es el punto de partida de todos los flujos; su estructura es correcta y no introduce waste.

**Resultado:** Catálogo de productos y proveedores disponible para la gestión de órdenes de compra.

---

### Proceso 2 — Orden de compra y recepción de mercancía

**Actores:** Administrador (crea y cierra la orden), Administrador o Vendedor (registra la recepción)

> `[CAMBIO C6]` La `OrdenDeCompra` se conceptualiza como "pedido ya hecho al proveedor". Agrupa múltiples productos del mismo proveedor en líneas independientes (`LineaOrden`). El modelo reemplaza la restricción de un único producto por orden.

#### 2.1 Creación de la orden de compra

**Pasos:**

1. **Admin crea una `OrdenDeCompra` seleccionando el proveedor.** Ingresa la fecha en que se realizó el pedido (`fecha_pedido`) y una nota opcional. El estado inicial es `pendiente`. El campo `creado_por` registra al admin que la crea.
2. **`[CAMBIO C6]` Admin añade una o más `LineaOrden` a la orden.** Por cada línea: selecciona el producto (del catálogo asociado al proveedor), ingresa la `cantidad_pedida` y el `costo_unitario_esperado` acordado con el proveedor. Una orden puede tener tantas líneas como productos del mismo proveedor.
3. **Admin guarda la orden.** La orden queda en estado `pendiente` con todas sus líneas.

#### 2.2 Recepción de mercancía

**Actor:** Administrador o Vendedor

**Pasos:**

4. **El actor selecciona la `OrdenDeCompra` en estado `pendiente` o `parcialmente_recibida` y luego la `LineaOrden` que está recibiendo.**
5. **El actor ingresa la cantidad recibida en buen estado y la cantidad averiada** para esa línea.
   - Las unidades averiadas no entran al stock. El sistema genera un `MovimientoInventario` de tipo `SALIDA` con concepto `AVERIA` desde la ubicación destino.
   - El actor confirma o corrige el `costo_unitario_real` (puede diferir del esperado).
6. **El actor selecciona el destino de las unidades en buen estado:** inventario central (CENTRAL) o punto de venta (POS_X). Una misma recepción puede dividirse entre destinos.
7. **El sistema genera uno o dos `MovimientoInventario` de tipo ENTRADA** con concepto `COMPRA`, uno por cada destino seleccionado. Cada movimiento registra el costo unitario real, la referencia a la `OrdenDeCompra` y la `LineaOrden`, y el usuario que registra.
8. **El sistema recalcula el `avg_cost` del producto** con la fórmula de costo promedio ponderado:

   ```
   new_avg_cost = (stock_total_sistema × avg_cost_actual + qty_recibida_buen_estado × costo_unitario_real)
                  / (stock_total_sistema + qty_recibida_buen_estado)
   ```

9. **El estado de la `LineaOrden` cambia automáticamente a `parcialmente_recibida`** si la cantidad recibida acumulada para esa línea es menor a su `cantidad_pedida`. El estado de la `OrdenDeCompra` es `parcialmente_recibida` si al menos una línea tiene recepción pendiente; es `pendiente` si ninguna línea ha recibido mercancía aún.

#### 2.3 Cierre de la orden de compra

**Actor:** Administrador

10. **`[CAMBIO C4]` El admin solicita cerrar la `OrdenDeCompra`.**
    - El sistema evalúa la discrepancia por cada `LineaOrden`: si `cantidad_pedida - cantidad_recibida_acumulada > umbral_discrepancia_orden` (configurable) en alguna línea, muestra una alerta de discrepancia y solicita una justificación global antes de confirmar el cierre. El cierre no se bloquea, pero queda registrado con la justificación asociada.
    - Si ninguna línea supera el umbral, el sistema procede al cierre directamente sin alerta.
    - En ambos casos, el estado de la `OrdenDeCompra` cambia a `cerrada`.

> Una orden cerrada no puede seguir recibiendo mercancía en ninguna de sus líneas.

---

### Proceso 3 — Apertura de jornada de venta

**Actor principal:** Vendedor (`tienda_vendedor`)

> **Restricción de unicidad:** El sistema impide crear una `JornadaVenta` si ya existe una en estado `abierta` para el mismo POS. Solo puede haber una jornada abierta por POS en cualquier momento.

**Pasos:**

1. **El vendedor crea una `JornadaVenta`** para el día: selecciona fecha, POS y queda registrado como vendedor. El estado inicial es `abierta`. El sistema valida que no exista otra jornada abierta para ese POS antes de permitir la creación.
2. **`[CAMBIO C3]` El vendedor registra el traslado de apertura como una operación masiva.**
   - El sistema presenta una lista de todos los productos del catálogo activo con un campo de cantidad editable por producto.
   - El vendedor ingresa la cantidad a trasladar desde CENTRAL al POS para cada producto que llevará ese día. Los productos que no se llevan quedan con cantidad 0 (o vacío) y no generan movimiento.
   - El vendedor confirma la operación en un único paso.
3. **`[CAMBIO C3]` El sistema genera el par de MovimientoInventario del traslado para cada producto con cantidad > 0:**
   - MovimientoInventario 1: `SALIDA` de CENTRAL, concepto `TRASLADO`, cantidad indicada, `costo_unitario` = snapshot del `avg_cost` del producto en ese instante, enlazado a la JornadaVenta y al movimiento par.
   - MovimientoInventario 2: `ENTRADA` al POS, concepto `TRASLADO`, mismos datos de costo y enlace.
   - Todos los pares quedan enlazados mediante `movimiento_par` individualmente.
4. **El stock de CENTRAL disminuye** en la cantidad trasladada por cada producto.
5. **El stock del POS aumenta** en la cantidad trasladada por cada producto.
6. **El snapshot de `avg_cost` queda fijado en el momento del traslado**, no al cierre del día. Esto garantiza que el COGS del día refleje el costo vigente al momento del traslado, independientemente de recepciones posteriores.

> El traslado masivo reemplaza los traslados producto por producto del as-is. El modelo de datos subyacente no cambia: se sigue generando un par de MovimientoInventario por producto; el cambio es en la interfaz de captura, que pasa de N operaciones secuenciales a 1 operación de lote.

---

### Proceso 4 — Reposición durante el día

**Actores:** Administrador o Vendedor autorizado (ejecuta el traslado directamente)

> `[DECISIÓN C1 — RECHAZADO]` No existe flujo de solicitud/aprobación para traslados de reposición. El sistema es flexible y rápido: quien tenga acceso (admin o vendedor autorizado) ejecuta el traslado directamente. El sistema registra quién ejecutó cada traslado.

**Pasos:**

1. **El actor detecta que un producto se ha agotado o está próximo a agotarse en el POS durante el día.**
2. **El actor registra el traslado de reposición directamente en el sistema:**
   - Selecciona el producto y la cantidad a trasladar desde CENTRAL al POS.
   - El sistema genera el par de movimientos: SALIDA de CENTRAL + ENTRADA al POS, enlazados por `movimiento_par`.
   - El `costo_unitario` captura el snapshot del `avg_cost` en el momento exacto del traslado.
   - El movimiento queda registrado con el usuario que lo ejecutó (`registrado_por`).
3. **El stock de CENTRAL disminuye** en la cantidad trasladada.
4. **El stock del POS aumenta** en la cantidad trasladada.
5. **Alternativa: puede llegar mercancía urgente directamente al POS** contra una `OrdenDeCompra` creada por el admin. En este caso se aplica el Proceso 2 (recepción de mercancía) con el POS como destino.

> La trazabilidad de quién ejecutó cada traslado de reposición se garantiza mediante el campo `registrado_por` en el `MovimientoInventario`, no mediante un flujo de aprobación previo.

---

### Proceso 5 — Cierre de jornada

**Actor principal:** Vendedor (`tienda_vendedor`) o Administrador (`tienda_admin`)

> **Reglas de JornadaVenta:**
> - El sistema impide abrir una segunda `JornadaVenta` si ya hay una en estado `abierta` para el mismo POS. Solo puede haber una jornada abierta por POS en cualquier momento.
> - El cierre puede ejecutarlo el vendedor o el admin. El campo `cerrado_por` registra quién realizó el cierre.
> - Una jornada cerrada no puede reabrirse bajo ninguna circunstancia.

**Pasos:**

1. **Al final del día, el actor realiza el conteo físico** de cada producto presente en el POS.
2. **El actor ingresa el conteo por producto** en el sistema (cantidad contada de cada producto).
3. **`[CAMBIO C2]` Antes de confirmar el cierre, el sistema muestra una pantalla de resumen previo** con:
   - Por cada producto: cantidad trasladada al POS en la jornada, conteo ingresado, unidades vendidas calculadas, movimiento de retorno propuesto al CENTRAL.
   - Totales de la jornada: revenue estimado, COGS estimado, utilidad bruta estimada.
   - El actor puede corregir cualquier conteo directamente en esta pantalla antes de confirmar.
4. **`[CAMBIO C2]` El actor confirma el cierre.** Solo tras la confirmación explícita el sistema persiste los movimientos. El campo `cerrado_por` queda registrado con la identidad del actor que confirmó.
5. **El sistema calcula por cada producto los indicadores de la jornada:**

   ```
   unidades_vendidas = total_trasladado_al_POS_en_la_jornada - conteo_final

   revenue           = unidades_vendidas × precio_venta_del_producto

   COGS              = unidades_vendidas × promedio_ponderado_traslados_del_dia

   donde:
     promedio_ponderado_traslados_del_dia =
       SUM(qty_traslado × snapshot_costo_traslado) / SUM(qty_traslado)
       (suma sobre todos los traslados al POS registrados durante la jornada)

   utilidad_bruta    = revenue - COGS
   ```

6. **El sistema registra el retorno del inventario no vendido** al CENTRAL:
   - MovimientoInventario 1: `SALIDA` del POS, concepto `TRASLADO`, cantidad = conteo_final, `costo_unitario` = snapshot de costo de esos ítems.
   - MovimientoInventario 2: `ENTRADA` al CENTRAL, mismos datos, enlazados por `movimiento_par`.
7. **El sistema recalcula el `avg_cost` del producto** con las unidades que regresan al CENTRAL, usando el mismo costo snapshot con el que esas unidades habían sido trasladadas al POS.
8. **El estado de la `JornadaVenta` cambia a `cerrada`.** El campo `cerrado_por` queda registrado con la identidad del actor que confirmó el cierre. La jornada cerrada no puede reabrirse.

> El costo snapshot de los ítems que regresan es el mismo con el que salieron del CENTRAL al inicio del día (o en la reposición). No se usa un nuevo costo al cierre.

---

### Proceso 6 — Reporte de fin de día

**Actor:** Sistema (generación automática); visualizado por Administrador y Vendedor

**Pasos:**

1. **Al cierre de la JornadaVenta, el sistema genera el reporte de fin de día.**
2. **El reporte muestra por producto:**
   - Unidades vendidas en la jornada
   - Revenue (ingresos brutos)
   - COGS (costo de lo vendido)
   - Utilidad bruta (revenue - COGS)
   - Stock restante en inventario central al cierre
3. **`[DECISIÓN C5 — REEMPLAZADO]` El reporte incluye una sección "Lista de reabastecimiento":** para cada producto cuyo `stock_actual` (en CENTRAL) sea menor o igual al `punto_reorden`, el sistema muestra el producto, su stock actual y la `cantidad_sugerida_pedido`. Esta lista está pensada como referencia operativa para que el admin la consulte al momento de negociar con proveedores. No hay acción directa de crear orden desde esta sección — una orden implica buscar proveedor y negociar, lo que no se hace de forma directa desde la alerta.
4. **El registro del reporte queda almacenado históricamente** vinculado a la JornadaVenta, con identificación del vendedor.

---

### Proceso 7 — Consulta de stock

**Actor:** Administrador o Vendedor (en cualquier momento)

**Regla de cálculo (sin cambios):**

```
stock_ubicacion_producto = SUM(cantidad de ENTRADAS) - SUM(cantidad de SALIDAS)
                           filtrado por producto + ubicacion
```

```
stock_total_sistema_producto = stock_CENTRAL + stock_POS_1 + stock_POS_2 + …
```

**Pasos:**

1. **El actor selecciona el producto y/o la ubicación** que desea consultar.
2. **El sistema calcula el stock en tiempo real** sumando todas las entradas y restando todas las salidas registradas en MovimientoInventario para esa combinación producto–ubicación.
3. **El sistema puede mostrar el stock total del sistema** sumando todas las ubicaciones.

> Sin cambios respecto al as-is. La consulta es correcta, en tiempo real y sin fricción identificada.

---

### Proceso 8 — Ajuste de inventario

**Actor exclusivo:** Administrador (`tienda_admin`)

> **Proceso nuevo.** El ajuste de inventario es la vía formal para corregir discrepancias de stock que no corresponden a una compra, traslado, venta o avería. Solo el admin puede ejecutarlo, con nota obligatoria.

**Pasos:**

1. **El admin detecta una discrepancia de stock** (por ejemplo, tras un conteo físico extraordinario, o para corregir un error histórico no reversible de otro modo).
2. **El admin crea un `MovimientoInventario` de tipo `AJUSTE`:**
   - Selecciona el producto y la ubicación (CENTRAL o POS_X).
   - Selecciona la dirección: `ENTRADA` (añade unidades al stock) o `SALIDA` (retira unidades del stock).
   - Ingresa la cantidad y el `costo_unitario` aplicable (snapshot del `avg_cost` actual si no hay otro valor justificado).
   - Ingresa una nota obligatoria que explique el motivo del ajuste.
3. **El sistema registra el movimiento** con tipo `AJUSTE`, concepto libre (proveniente de la nota), y el campo `registrado_por` con la identidad del admin.
4. **Si el ajuste es una ENTRADA, el sistema recalcula el `avg_cost`** del producto usando la fórmula de costo promedio ponderado, igual que en una recepción de mercancía.
5. **Si el ajuste es una SALIDA, el `avg_cost` no se modifica** — se retiran unidades al costo registrado pero el promedio no se recalcula al bajar.
6. **El stock de la ubicación se actualiza** de forma inmediata tras el registro.

> Ningún actor distinto al admin puede crear movimientos de tipo `AJUSTE`. Los ajustes quedan visibles en el historial de movimientos del producto con su nota y la identidad del admin.

---

## 4. Pasos eliminados

| Paso as-is | Proceso | Principio Lean aplicado | Justificación |
|------------|---------|------------------------|---------------|
| "El admin autoriza un traslado adicional" mediante comunicación directa fuera del sistema (Proceso 4, paso 2 as-is) | Proceso 4 | Muda de espera + defecto de trazabilidad | La autorización verbal no deja registro y genera tiempo de espera no medible. El traslado se registra ahora directamente en el sistema por quien tenga acceso, con campo `registrado_por` para trazabilidad. No se introduce flujo de aprobación (C1 rechazado por el negocio). |
| Traslados de apertura producto por producto en secuencia (Proceso 3, múltiples ejecuciones del paso 2) | Proceso 3 | Muda de movimiento + sobre-procesamiento | N interacciones separadas para la misma operación lógica. Reemplazado por traslado masivo de apertura (C3 aceptado). |
| Ejecución automática e inmediata de movimientos de retorno sin vista de confirmación (Proceso 5, paso 4 as-is) | Proceso 5 | Muda de defecto (corrección de errores) | Sin confirmación, un error de conteo genera movimientos incorrectos que deben corregirse con ajustes posteriores. Reemplazado por pantalla de resumen + confirmación explícita (C2 aceptado). |
| Creación de N órdenes de compra independientes para un pedido multiproducto al mismo proveedor | Proceso 2 | Sobre-procesamiento | Una orden de compra por producto multiplica el esfuerzo de creación y seguimiento. Reemplazado por modelo multi-producto con `LineaOrden` (C6 aceptado). |

---

## 5. Pasos automatizables vs. manuales

| Paso | Clasificación | Comportamiento deseado (sin nombrar tecnología) |
|------|--------------|------------------------------------------------|
| Generación del par de MovimientoInventario en cualquier traslado | Automatizable | El sistema genera los dos movimientos enlazados (SALIDA + ENTRADA) de forma inmediata y atómica tras la confirmación del usuario; el actor no debe crear ningún movimiento manualmente |
| Recálculo de `avg_cost` tras cada recepción o retorno | Automatizable | El sistema aplica la fórmula de costo promedio ponderado sin intervención del actor; el resultado queda visible en el detalle del producto |
| Cambio de estado de `OrdenDeCompra` a `parcialmente_recibida` | Automatizable | El sistema evalúa automáticamente si la cantidad acumulada recibida es menor a la pedida y cambia el estado; no requiere acción del admin |
| Cálculo de indicadores de jornada (unidades vendidas, revenue, COGS, utilidad bruta) al cierre | Automatizable | El sistema calcula todos los indicadores a partir de los movimientos registrados; el actor solo provee el conteo físico |
| Retorno automático del inventario no vendido al cierre | Automatizable (condicionado a confirmación) | El sistema genera los movimientos de retorno al CENTRAL inmediatamente tras la confirmación explícita del vendedor en la pantalla de resumen |
| Generación del reporte de fin de día | Automatizable | El sistema genera el reporte en el momento de cierre de la JornadaVenta sin acción adicional del actor |
| Detección de productos bajo punto de reorden | Automatizable | El sistema evalúa el stock de CENTRAL al cierre de jornada y señala automáticamente los productos que requieren reabastecimiento |
| Generación de la "Lista de reabastecimiento" en el reporte de fin de día | Automatizable | El sistema consolida automáticamente todos los productos bajo el punto de reorden con su cantidad sugerida de pedido al momento del cierre de jornada; no requiere acción del actor |
| Validación de unicidad de `JornadaVenta` abierta por POS | Automatizable | El sistema verifica automáticamente que no exista otra jornada abierta para el mismo POS antes de permitir la creación; no requiere revisión manual |
| Registro del campo `cerrado_por` al confirmar el cierre de jornada | Automatizable | El sistema captura automáticamente la identidad del actor autenticado que confirma el cierre; el actor no introduce este dato manualmente |
| Conteo físico de productos al cierre de jornada | Manual (intransferible) | El actor realiza el conteo físico en el POS; este paso requiere presencia física e inspección del inventario real. No automatizable en v1 (escaneo de códigos de barras fuera de alcance) |
| Registro del traslado de reposición durante el día | Manual (decisión operativa) | El actor con acceso (admin o vendedor autorizado) decide cuándo y cuánto trasladar; el sistema solo registra y genera los movimientos tras la confirmación |
| Cierre manual de la `OrdenDeCompra` por el admin | Manual (decisión de negocio) | El admin confirma que lo recibido es el total final; es una decisión de negocio que no puede automatizarse sin información adicional sobre el acuerdo con el proveedor |
| Creación del catálogo de productos y proveedores | Manual (configuración inicial) | El admin ingresa los datos maestros; no hay fuente automática de donde extraerlos |
| Ingreso de líneas de la orden de compra (producto, cantidad pedida, costo esperado) | Manual (información externa) | El costo acordado con el proveedor es información externa al sistema; requiere que el actor la introduzca. El modelo multi-línea reduce el número de formularios, no el ingreso manual por línea |
| Ajuste de inventario (tipo AJUSTE) | Manual (decisión de negocio — solo admin) | El admin decide el motivo, dirección y cantidad del ajuste; requiere nota obligatoria. No puede delegarse ni automatizarse por definición del control interno |

---

## 6. Impacto estimado

### Reducción de pasos operativos

| Proceso | Pasos as-is | Pasos to-be | Reducción |
|---------|-------------|-------------|-----------|
| Proceso 3 — Apertura (operación de traslado) | N pasos secuenciales (1 por producto) | 1 operación masiva de confirmación | De N a 1 (eliminación de N–1 interacciones) |
| Proceso 4 — Reposición (registro) | 1 paso fuera del sistema (verbal) | 1 paso en sistema con `registrado_por` | Mismo número de pasos operativos; eliminación del canal fuera de sistema; ganancia de trazabilidad sin fricción de aprobación |
| Proceso 5 — Cierre (movimientos de retorno) | Ejecución automática sin revisión | Pantalla de resumen + 1 confirmación explícita | +1 paso deliberado; eliminación de errores no detectables |
| Proceso 2 — Orden de compra multiproducto | N órdenes independientes por pedido | 1 orden con N líneas (`LineaOrden`) | De N formularios a 1 formulario con N filas; reducción de overhead proporcional al número de productos por pedido |
| Proceso 6 — Reabastecimiento | Ver alerta dispersa en reporte | Sección "Lista de reabastecimiento" consolidada | Visualización centralizada; el admin tiene toda la información en una sola vista sin navegación adicional |

### Reducción de tiempo estimada

- **Apertura de jornada con 10 productos:** reducción estimada de 8–12 minutos de captura secuencial a menos de 2 minutos de revisión y confirmación masiva.
- **Ciclo de reposición:** quien tenga acceso ejecuta el traslado directamente en el sistema; el tiempo de ciclo pasa de indeterminado (esperar autorización verbal) a inmediato; la trazabilidad queda garantizada por `registrado_por`.
- **Pedido multiproducto a un proveedor:** reducción de N formularios de orden a 1 formulario con N líneas; el overhead administrativo cae proporcionalmente al número de productos por pedido.
- **Consolidación de reabastecimiento:** el admin consulta una sola sección del reporte de fin de día en lugar de identificar alertas dispersas; la negociación con proveedores parte de información ya organizada.

### Reducción de riesgo de error

- **Errores de conteo en cierre:** la pantalla de confirmación previa reduce el riesgo de persistir conteos incorrectos de alto impacto (stock de CENTRAL, `avg_cost`).
- **Traslados de reposición no registrados:** el traslado directo en el sistema con campo `registrado_por` elimina el canal verbal sin trazabilidad; el control se ejerce por permisos de acceso, no por aprobación.
- **Cierres de orden con discrepancias silenciosas:** la alerta de discrepancia con justificación obligatoria garantiza que toda diferencia significativa quede documentada.
- **Ajustes de inventario arbitrarios:** el proceso AJUSTE restringido al admin con nota obligatoria reduce el riesgo de correcciones de stock sin autoría ni justificación documentada.

---

## 7. Qué no se cambió y por qué

| Paso o regla preservada | Justificación de preservación |
|------------------------|-------------------------------|
| Fórmula de costo promedio ponderado (`avg_cost`) | Regla de negocio de valoración de inventario. Correcta y sin waste identificado. Cambiarla afectaría la integridad contable. |
| Snapshot de `costo_unitario` en el momento del traslado (no al cierre) | Regla de negocio crítica para la correcta asignación del COGS del día. Fija el costo al momento de la decisión operativa, no al resultado final. |
| Traslados siempre en par (SALIDA origen + ENTRADA destino) | Restricción de integridad del modelo de movimientos. Garantiza que el stock de cada ubicación sea siempre derivable del historial sin discrepancias. |
| Las unidades averiadas no entran al stock ni al `avg_cost` | Regla de negocio con impacto contable: las averías son pérdidas, no inventario. Su separación con concepto `AVERIA` garantiza trazabilidad sin distorsionar el costo promedio. |
| Stock calculado por suma de movimientos, sin campo de stock directo | Principio de trazabilidad total. Elimina la posibilidad de modificaciones de stock sin registro. Preservado para garantizar auditoría completa. |
| Proceso 7 — Consulta de stock sin cambios | La consulta en tiempo real por movimientos es correcta, eficiente y sin fricción identificada. |
| Proceso 1 — Gestión de productos y proveedores sin cambios | El catálogo es correcto y sin waste. Las asociaciones producto–proveedor son flexibles y no introducen fricción operativa. |
| COGS por promedio ponderado de traslados del día (no FIFO) | Decisión de negocio documentada en el as-is. No se cambia la política de valoración; cambiarla requiere decisión explícita del negocio y está fuera del alcance de este análisis. |
| Cierre manual de la `OrdenDeCompra` por el admin | Decisión de negocio: el admin es quien conoce el acuerdo con el proveedor y decide si lo recibido es el total final. La automatización del cierre introduciría riesgo de cerrar órdenes con entregas pendientes. Se mejora con alerta de discrepancia (C4) sin eliminar el control manual. |
| Flujo de solicitud/aprobación de traslados de reposición | Decisión del negocio (C1 rechazado): el sistema debe ser flexible y rápido. El control se ejerce por permisos de acceso (`tienda_admin` y `tienda_vendedor` autorizado), no por flujo de aprobación. La trazabilidad se garantiza mediante `registrado_por`. |
| Acción "Crear orden" directa desde la alerta de reabastecimiento | Decisión del negocio (C5 rechazado): una orden implica buscar proveedor y negociar precio — no se hace de una sola acción. La lista de reabastecimiento en el reporte de fin de día es la asistencia máxima adecuada para este contexto. |
| Escaneo de códigos de barras (fuera de alcance v1) | Explícitamente excluido del alcance v1. El conteo físico manual se mantiene como paso operativo en el cierre de jornada. |
| Exportación de reportes a Excel (fuera de alcance v1) | Explícitamente excluido del alcance v1. |
| Generación automática de órdenes de compra (fuera de alcance v1) | Explícitamente excluido del alcance v1. La "Lista de reabastecimiento" en el reporte es el nivel máximo de asistencia sin llegar a la generación automática. |

---

*Documento generado por `process-optimizer` y actualizado con decisiones del usuario (v1.1, 2026-05-04). Todos los items [NECESITA CONTEXTO] han sido resueltos. No quedan items bloqueantes. Para avanzar al diseño de especificaciones funcionales, invocar `systems-analyst` en una nueva sesión.*


# Tienda — Reporte de Proceso Operativo As-Is

**Versión:** 1.2
**Fecha:** 2026-05-04
**Estado:** Completo
**Módulo:** Tienda (gestión de inventario y punto de venta de productos comestibles)
**Plataforma base:** Hersa (negocio separado bajo la misma plataforma)

---

## Tabla de contenido

1. [Actores](#1-actores)
2. [Entidades del sistema](#2-entidades-del-sistema)
3. [Proceso 1 — Gestión de productos y proveedores](#3-proceso-1--gestión-de-productos-y-proveedores)
4. [Proceso 2 — Orden de compra y recepción de mercancía](#4-proceso-2--orden-de-compra-y-recepción-de-mercancía)
5. [Proceso 3 — Apertura de jornada de venta](#5-proceso-3--apertura-de-jornada-de-venta)
6. [Proceso 4 — Reposición durante el día](#6-proceso-4--reposición-durante-el-día)
7. [Proceso 5 — Cierre de jornada](#7-proceso-5--cierre-de-jornada)
8. [Proceso 6 — Reporte de fin de día](#8-proceso-6--reporte-de-fin-de-día)
9. [Proceso 7 — Consulta de stock](#9-proceso-7--consulta-de-stock)
10. [Proceso 8 — Ajuste de inventario](#10-proceso-8--ajuste-de-inventario)
11. [Puntos de decisión](#11-puntos-de-decisión)
12. [Reglas de negocio críticas](#12-reglas-de-negocio-críticas)
13. [Pain points](#13-pain-points)
14. [Ineficiencias](#14-ineficiencias)
15. [Fuera de alcance v1](#15-fuera-de-alcance-v1)
16. [Preguntas pendientes de clarificación](#16-preguntas-pendientes-de-clarificación)

---

## 1. Actores

| Actor | Rol en el sistema | Permisos operativos |
|-------|-------------------|---------------------|
| **Administrador** (`tienda_admin`) | Gestiona el catálogo de productos y proveedores, crea y cierra órdenes de compra, configura parámetros del módulo, puede recibir mercancía, ejecuta traslados adicionales durante el día, puede cerrar jornadas de venta, registra ajustes de inventario | Acceso total al módulo Tienda |
| **Vendedor** (`tienda_vendedor`) | Opera el punto de venta diario: abre jornada, registra traslados de apertura, registra reposiciones (si tiene permiso), recibe mercancía contra órdenes creadas por el admin, realiza conteo físico de cierre, puede cerrar su propia jornada | Acceso operativo al POS y a recepción de mercancía; no puede crear órdenes de compra ni cerrarlas; no puede registrar movimientos de concepto AJUSTE |

> Nota: Ambos roles son extensiones del sistema de usuarios de Hersa. No se documenta un rol de "cliente final" en el contexto del módulo Tienda; la operación es interna.

---

## 2. Entidades del sistema

### 2.1 Producto
| Campo | Descripción |
|-------|-------------|
| `nombre` | Nombre del producto |
| `descripcion` | Descripción libre |
| `unidad` | Etiqueta de unidad de medida (label libre) |
| `precio_venta` | Precio unitario de venta al público |
| `avg_cost` | Costo promedio ponderado; mantenido automáticamente por el sistema en cada recepción |
| `punto_reorden` | Umbral de stock que activa la alerta de reabastecimiento |
| `cantidad_sugerida_pedido` | Cantidad de referencia para la siguiente orden de compra |

### 2.2 Proveedor
| Campo | Descripción |
|-------|-------------|
| `nombre` | Nombre del proveedor |
| `contacto` | Datos de contacto |

Un producto puede asociarse a múltiples proveedores.

### 2.3 Ubicacion
| Campo | Descripción |
|-------|-------------|
| `nombre` | Identificador de la ubicación (CENTRAL, POS_1, POS_2, …) |
| `tipo` | `central` o `pos` |

Inicialmente existe un único POS, pero el modelo soporta múltiples.

### 2.4 OrdenDeCompra
| Campo | Descripción |
|-------|-------------|
| `proveedor` | FK a Proveedor; una orden pertenece a un único proveedor |
| `fecha_pedido` | Fecha de creación de la orden |
| `estado` | `pendiente` / `parcialmente_recibida` / `cerrada` |
| `creado_por` | FK a Usuario (solo `tienda_admin`) |

**Líneas de la orden (`LineaOrdenDeCompra`):**

| Campo | Descripción |
|-------|-------------|
| `orden_compra` | FK a OrdenDeCompra |
| `producto` | FK a Producto |
| `cantidad_pedida` | Unidades solicitadas al proveedor para este producto |
| `costo_unitario_esperado` | Costo acordado o estimado al momento de crear la orden |

Una OrdenDeCompra agrupa múltiples productos del mismo proveedor. Cada producto dentro de la orden corresponde a una LineaOrdenDeCompra independiente. La recepción de mercancía se realiza línea por línea: cada línea tiene su propio seguimiento de cantidades recibidas y estado.

### 2.5 MovimientoInventario
| Campo | Descripción |
|-------|-------------|
| `producto` | FK a Producto |
| `ubicacion` | FK a Ubicacion |
| `tipo` | `ENTRADA` o `SALIDA` |
| `cantidad` | Unidades del movimiento |
| `costo_unitario` | Costo snapshot en el momento del movimiento |
| `concepto` | `COMPRA` / `TRASLADO` / `VENTA` / `AJUSTE` / `AVERIA` |
| `orden_compra` | FK opcional a OrdenDeCompra |
| `jornada_venta` | FK opcional a JornadaVenta |
| `movimiento_par` | FK self; enlaza los dos movimientos de un traslado (SALIDA origen + ENTRADA destino) |
| `registrado_por` | FK a Usuario |
| `fecha` | Timestamp del movimiento |
| `nota` | Texto libre obligatorio cuando el concepto es `AJUSTE`; opcional en otros casos |

> Nota: Las unidades averiadas generan un `MovimientoInventario` de tipo `SALIDA` con concepto `AVERIA` desde la ubicación destino donde habrían ingresado. Quedan registradas en el libro de movimientos con trazabilidad completa pero no suman al stock disponible en ninguna ubicación.

### 2.6 JornadaVenta
| Campo | Descripción |
|-------|-------------|
| `fecha` | Fecha de la jornada |
| `ubicacion` | FK a Ubicacion (debe ser tipo `pos`) |
| `vendedor` | FK a Usuario (`tienda_vendedor`) |
| `estado` | `abierta` / `cerrada` |
| `cerrado_por` | FK a Usuario; registra quién ejecutó el cierre (admin o vendedor) |

> Restricción de unicidad: solo puede existir una JornadaVenta con estado `abierta` por POS en cualquier momento. Un vendedor puede abrir más de una jornada en el mismo día para el mismo POS, pero no puede tener dos abiertas simultáneamente. El sistema impide crear una nueva jornada si ya existe una con estado `abierta` para ese POS.

### 2.7 Usuario
Extensión del sistema de usuarios de Hersa con rol `tienda_admin` o `tienda_vendedor`.

---

## 3. Proceso 1 — Gestión de productos y proveedores

**Actor principal:** Administrador (`tienda_admin`)

**Pasos:**

1. **Admin crea un producto.** Ingresa nombre, descripción, unidad (label libre), precio de venta, punto de reorden y cantidad sugerida de pedido. El campo `avg_cost` inicia en 0 y es mantenido automáticamente por el sistema; no lo ingresa el admin manualmente.
2. **Admin edita un producto existente.** Puede modificar cualquier campo excepto `avg_cost`, que es calculado por el sistema.
3. **Admin crea un proveedor.** Ingresa nombre y datos de contacto.
4. **Admin edita un proveedor existente.** Puede modificar nombre y contacto.
5. **Admin asocia un producto a uno o más proveedores.** La relación producto–proveedor es de muchos a muchos; un producto puede tener múltiples proveedores registrados.

**Resultado:** Catálogo de productos y proveedores disponible para la gestión de órdenes de compra.

---

## 4. Proceso 2 — Orden de compra y recepción de mercancía

**Actores:** Administrador (crea y cierra la orden), Administrador o Vendedor (registra la recepción)

### 4.1 Creación de la orden de compra

**Pasos:**

1. **Admin selecciona el proveedor** para la orden de compra.
2. **Admin añade una o más líneas de producto.** Por cada línea especifica el producto, la cantidad pedida y el costo unitario esperado. El costo esperado es el acordado o estimado; puede diferir del costo real al momento de la recepción.
3. **Admin guarda la OrdenDeCompra.** El estado inicial es `pendiente`. El campo `creado_por` registra al admin que la crea.

### 4.2 Recepción de mercancía

**Actor:** Administrador o Vendedor

**Pasos:**

4. **El actor selecciona la OrdenDeCompra en estado `pendiente` o `parcialmente_recibida`.**
5. **El actor selecciona la línea de producto a recepcionar e ingresa la cantidad recibida en buen estado y la cantidad averiada.**
   - Las unidades averiadas no entran al stock. Por cada unidad averiada el sistema genera un `MovimientoInventario` de tipo `SALIDA` con concepto `AVERIA` desde la ubicación destino, garantizando trazabilidad completa sin incrementar el stock disponible.
   - El costo unitario real puede diferir del esperado; el actor lo confirma o corrige.
6. **El actor selecciona el destino de las unidades en buen estado:** inventario central (CENTRAL) o punto de venta (POS_X).
   - Una misma recepción puede dividirse entre destinos (ej.: 60 unidades al CENTRAL, 20 unidades al POS_1). En este caso se generan dos movimientos independientes con sus respectivos destinos.
7. **El sistema genera uno o dos MovimientoInventario de tipo ENTRADA** con concepto `COMPRA`, uno por cada destino seleccionado. Cada movimiento registra el costo unitario real, la referencia a la OrdenDeCompra y el usuario que registra.
8. **El sistema recalcula el `avg_cost` del producto** con la fórmula de costo promedio ponderado:

   ```
   new_avg_cost = (stock_total_sistema × avg_cost_actual + qty_recibida_buen_estado × costo_unitario_real)
                  / (stock_total_sistema + qty_recibida_buen_estado)
   ```

   El stock total del sistema es la suma de todas las ubicaciones (CENTRAL + todos los POS).

9. **El estado de la OrdenDeCompra cambia automáticamente a `parcialmente_recibida`** si queda al menos una línea con cantidad recibida acumulada menor a la cantidad pedida.

### 4.3 Cierre de la orden de compra

**Actor:** Administrador

10. **El admin cierra manualmente la OrdenDeCompra** cuando confirma que lo recibido es el total final, independientemente de si se recibió la totalidad de las unidades pedidas en todas las líneas. El estado cambia a `cerrada`.

> Una orden cerrada no puede seguir recibiendo mercancía.

---

## 5. Proceso 3 — Apertura de jornada de venta

**Actor principal:** Vendedor (`tienda_vendedor`)

**Pasos:**

1. **El vendedor crea una JornadaVenta** para el día: selecciona fecha, POS y queda registrado como vendedor. El estado inicial es `abierta`. El sistema valida que no exista ya una JornadaVenta con estado `abierta` para ese POS; si existe, impide la creación.
2. **Para cada producto que llevará al POS ese día, el vendedor registra un traslado de apertura.**
   - El vendedor especifica la cantidad a trasladar desde CENTRAL al POS.
3. **El sistema genera el par de MovimientoInventario del traslado:**
   - MovimientoInventario 1: `SALIDA` de CENTRAL, concepto `TRASLADO`, cantidad indicada, `costo_unitario` = snapshot del `avg_cost` del producto en ese instante, enlazado a la JornadaVenta y al movimiento par.
   - MovimientoInventario 2: `ENTRADA` al POS, concepto `TRASLADO`, mismos datos de costo y enlace.
   - Ambos movimientos quedan enlazados mediante `movimiento_par`.
4. **El stock de CENTRAL disminuye** en la cantidad trasladada.
5. **El stock del POS aumenta** en la cantidad trasladada.
6. **El snapshot de `avg_cost` queda fijado en el momento del traslado**, no al cierre del día. Esto garantiza que el COGS del día refleje el costo vigente al momento de cada traslado, independientemente de recepciones posteriores.

> El vendedor puede registrar traslados de apertura para múltiples productos en la misma JornadaVenta.

---

## 6. Proceso 4 — Reposición durante el día

**Actores:** Administrador o Vendedor con permiso (ejecuta el traslado directamente)

**Pasos:**

1. **El vendedor detecta que un producto se ha agotado en el POS durante el día.**
2. **El actor con acceso (admin o vendedor con permiso) registra el traslado de reposición** directamente, sin flujo formal de solicitud ni aprobación:
   - SALIDA de CENTRAL + ENTRADA al POS, enlazados por `movimiento_par`.
   - El `costo_unitario` captura el snapshot del `avg_cost` en el momento exacto del traslado de reposición.
3. **Alternativa: puede llegar mercancía urgente directamente al POS** contra una OrdenDeCompra creada por el admin. En este caso se aplica el flujo del Proceso 2 (recepción de mercancía) con el POS como destino.

> No existe un flujo de solicitud/aprobación sistematizado para los traslados durante el día. Quien tenga acceso ejecuta el traslado directamente.

---

## 7. Proceso 5 — Cierre de jornada

**Actor principal:** Vendedor (`tienda_vendedor`) o Administrador (`tienda_admin`)

**Pasos:**

1. **Al final del día, el actor realiza el conteo físico** de cada producto presente en el POS.
2. **El actor ingresa el conteo por producto** en el sistema (cantidad contada de cada producto).
3. **El sistema calcula por cada producto los indicadores de la jornada:**

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

   Se usa el promedio ponderado de todos los traslados del día (apertura + reposiciones), sin distinción de orden. No se aplica FIFO.

4. **El sistema registra el retorno del inventario no vendido** al CENTRAL:
   - MovimientoInventario 1: `SALIDA` del POS, concepto `TRASLADO`, cantidad = conteo_final, `costo_unitario` = snapshot de costo de esos ítems.
   - MovimientoInventario 2: `ENTRADA` al CENTRAL, mismos datos, enlazados por `movimiento_par`.
5. **El sistema recalcula el `avg_cost` del producto** con las unidades que regresan al CENTRAL, usando el mismo costo snapshot con el que esas unidades habían sido trasladadas al POS.
6. **El estado de la JornadaVenta cambia a `cerrada`.** El sistema registra en el campo `cerrado_por` el usuario que ejecutó el cierre (admin o vendedor).
7. **El sistema impide cerrar una jornada que ya está en estado `cerrada`.** Cualquier intento de re-cierre es bloqueado por el sistema.

> El costo snapshot de los ítems que regresan es el mismo con el que salieron del CENTRAL al inicio del día (o en la reposición). No se usa un nuevo costo al cierre.

---

## 8. Proceso 6 — Reporte de fin de día

**Actor:** Sistema (generación automática); visualizado por Administrador y Vendedor

**Pasos:**

1. **Al cierre de la JornadaVenta, el sistema genera el reporte de fin de día.**
2. **El reporte muestra por producto:**
   - Unidades vendidas en la jornada
   - Revenue (ingresos brutos)
   - COGS (costo de lo vendido)
   - Utilidad bruta (revenue - COGS)
   - Stock restante en inventario central al cierre
3. **El reporte muestra alertas de reabastecimiento:** productos cuyo `stock_actual` (en CENTRAL) es menor o igual al `punto_reorden`, con el campo `cantidad_sugerida_pedido` como referencia para la próxima orden.
4. **El registro del reporte queda almacenado históricamente** vinculado a la JornadaVenta, con identificación del vendedor.

---

## 9. Proceso 7 — Consulta de stock

**Actor:** Administrador o Vendedor (en cualquier momento)

**Regla de cálculo:**

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

> Esta consulta es posible en cualquier momento, incluyendo con una JornadaVenta abierta.

---

## 10. Proceso 8 — Ajuste de inventario

**Actor principal:** Administrador (`tienda_admin`)

**Pasos:**

1. **El admin selecciona el producto y la ubicación** sobre la que se aplicará el ajuste.
2. **El admin selecciona el tipo de ajuste:** `ENTRADA` (incremento de stock) o `SALIDA` (decremento de stock).
3. **El admin ingresa la cantidad del ajuste.**
4. **El admin ingresa una nota obligatoria** describiendo la razón del ajuste (ej.: "error de conteo", "merma detectada en revisión", "corrección de discrepancia con proveedor"). La nota es campo obligatorio; el sistema no permite guardar el movimiento sin ella.
5. **El sistema genera un MovimientoInventario** con concepto `AJUSTE`, el tipo indicado (ENTRADA o SALIDA), la cantidad, la nota, el usuario (`registrado_por`) y el timestamp.
6. **El stock de la ubicación se actualiza** de acuerdo al tipo y cantidad del ajuste.

> Solo el administrador puede registrar movimientos con concepto `AJUSTE`. No hay restricción de monto o cantidad máxima, pero el movimiento queda registrado con fecha, usuario y nota obligatoria para trazabilidad completa.

---

## 11. Puntos de decisión

| # | Condición | Actor que decide | Resultado A | Resultado B |
|---|-----------|-----------------|-------------|-------------|
| D1 | Al recibir mercancía: ¿el costo unitario real difiere del esperado? | Admin o Vendedor | Se registra el costo real (diferente al esperado) en el MovimientoInventario | Se confirma el costo esperado |
| D2 | Al recibir mercancía: ¿hay unidades averiadas? | Admin o Vendedor | Se registran las unidades averiadas con concepto `AVERIA` (SALIDA desde ubicación destino); no entran al stock | No se registran averías |
| D3 | Al recibir mercancía: ¿se divide entre destinos? | Admin o Vendedor | Se generan dos MovimientoInventario de ENTRADA (uno por destino) | Se genera un único MovimientoInventario de ENTRADA |
| D4 | Tras una recepción parcial: ¿el admin confirma que lo recibido es el total final? | Admin | Se cierra la OrdenDeCompra manualmente (estado `cerrada`) | La orden permanece en `parcialmente_recibida` y puede seguir recibiendo |
| D5 | Durante el día: ¿el vendedor detecta agotamiento de un producto en el POS? | Vendedor | El actor con acceso registra un traslado de reposición directamente (Proceso 4) | No hay acción |
| D6 | Durante el día: ¿llega mercancía urgente directamente al POS? | Admin | Se aplica el Proceso 2 con POS como destino | No aplica |
| D7 | Al intentar abrir una JornadaVenta: ¿existe ya una jornada abierta para ese POS? | Sistema | El sistema bloquea la creación de la nueva jornada | Se permite crear la jornada |
| D8 | Al intentar cerrar una JornadaVenta: ¿la jornada ya está en estado `cerrada`? | Sistema | El sistema bloquea el intento de re-cierre | Se procede al cierre normalmente |
| D9 | Al registrar un movimiento de ajuste: ¿el actor es `tienda_admin`? | Sistema | Se permite el movimiento con concepto `AJUSTE` | El sistema bloquea el movimiento |

---

## 12. Reglas de negocio críticas

1. **Costo promedio ponderado (avg_cost) automático.** El sistema recalcula `avg_cost` en cada recepción de mercancía usando la fórmula:
   `new_avg = (stock_total × avg_actual + qty_recibida × costo_real) / (stock_total + qty_recibida)`
   Solo las unidades en buen estado participan en este cálculo; las averiadas no.

2. **Snapshot de costo en el traslado, no al cierre.** El `costo_unitario` se captura en el momento exacto en que se registra cada traslado (apertura o reposición). Esto fija el COGS del día aunque llegue nueva mercancía durante la jornada y cambie el `avg_cost` global.

3. **Las unidades averiadas no entran al stock ni al cálculo de avg_cost.** Generan un `MovimientoInventario` de tipo `SALIDA` con concepto `AVERIA` desde la ubicación destino, lo que garantiza trazabilidad completa en el libro de movimientos sin incrementar el stock disponible.

4. **Trazabilidad total de movimientos.** Todo movimiento de stock queda registrado en MovimientoInventario con fecha, usuario y concepto. No hay ajustes directos de stock sin trazabilidad.

5. **Traslados siempre en par.** Todo traslado genera exactamente dos MovimientoInventario (SALIDA origen + ENTRADA destino) enlazados por `movimiento_par`. No existe un movimiento de traslado sin su contraparte.

6. **Cierre manual de órdenes por el admin.** El admin cierra la OrdenDeCompra manualmente cuando confirma que lo recibido es el total final, independientemente del porcentaje recibido en cada línea.

7. **Retorno automático de inventario al cierre.** Al cerrar la jornada, el sistema genera automáticamente el par de movimientos que devuelve el inventario no vendido del POS al CENTRAL.

8. **Stock calculado por movimientos, no por campo directo.** El stock en cualquier ubicación se deriva siempre del historial de MovimientoInventario; no existe un campo `stock_actual` modificable directamente.

9. **COGS por promedio ponderado de traslados del día.** Cuando hubo múltiples traslados al POS en la misma jornada (apertura + reposiciones) con distintos snapshots de costo, el COGS se calcula como:
   `COGS = unidades_vendidas × (SUM(qty_traslado × snapshot_costo) / SUM(qty_traslado))`
   No se aplica FIFO. El promedio pondera todos los traslados del día independientemente de su orden.

10. **Unicidad de jornada abierta por POS.** Solo puede existir una JornadaVenta con estado `abierta` por POS en cualquier momento. Un vendedor puede abrir más de una jornada en el mismo día para el mismo POS, pero nunca dos simultáneamente. El sistema impide la creación de una nueva jornada si ya hay una abierta para ese POS.

11. **Registro de quién cierra la jornada.** Tanto el vendedor como el administrador pueden cerrar una JornadaVenta. El sistema registra el usuario que ejecutó el cierre en el campo `cerrado_por`. Una jornada en estado `cerrada` no puede volver a cerrarse; el sistema bloquea cualquier intento de re-cierre.

12. **Ajustes de inventario exclusivos del administrador.** Solo el rol `tienda_admin` puede registrar MovimientoInventario con concepto `AJUSTE`. Todo ajuste requiere una nota obligatoria con la razón. No hay restricción de monto o cantidad, pero el movimiento queda auditado con fecha, usuario y nota.

13. **OrdenDeCompra multi-producto por proveedor.** Una orden de compra pertenece a un único proveedor y puede incluir múltiples líneas de producto (LineaOrdenDeCompra). Cada línea tiene su propio seguimiento de cantidades pedidas y recibidas.

---

## 13. Pain points

> Los pain points a continuación son los identificables a partir de las notas de descubrimiento. No se han realizado entrevistas adicionales; puede haber friction adicional no capturada.

1. **Traslados de reposición sin flujo de solicitud sistematizado.** Cuando el vendedor necesita una reposición durante el día, la coordinación con el admin ocurre fuera del sistema (comunicación directa). El sistema no registra la solicitud ni el motivo de la reposición, solo el traslado resultante.
2. **Cierre de orden de compra manual y discrecional.** El admin puede cerrar una orden con cualquier porcentaje recibido en sus líneas. No hay alerta ni validación si la diferencia entre lo pedido y lo recibido es significativa.
3. **Conteo físico manual al cierre.** El actor cuenta producto por producto manualmente al final de cada jornada. No hay soporte de captura asistida (ej.: escaneo de códigos de barras, que está explícitamente fuera de alcance v1).
4. **Sin generación automática de órdenes de compra.** El módulo solo sugiere la cantidad a pedir (`cantidad_sugerida_pedido`) pero no genera la orden automáticamente. El admin debe crearla manualmente cada vez que un producto alcanza el punto de reorden.

---

## 14. Ineficiencias

1. **Traslado producto por producto en la apertura.** El vendedor debe registrar un traslado por cada producto que lleva al POS. No hay operación de "traslado masivo" o "apertura estándar" para enviar de una vez todos los productos habituales.
2. **Retorno de inventario automático pero no revisable antes de confirmar.** Al cierre, el sistema ejecuta automáticamente los movimientos de retorno al CENTRAL sin mostrar una vista de confirmación previa al actor. Si el conteo ingresado tiene un error, los movimientos ya quedaron registrados.
3. **Sin exportación de reportes en v1.** Los reportes de fin de día y el historial de jornadas solo son consultables en pantalla; no hay exportación a Excel ni descarga en v1, lo que puede generar trabajo manual extra para análisis externos.
4. **Stock total de sistema incluye POS como inventario disponible.** El `avg_cost` se recalcula usando el stock total (CENTRAL + POS). Las unidades en el POS siguen siendo parte del denominador aunque ya estén comprometidas para la venta del día, lo que puede distorsionar el costo promedio si llega nueva mercancía durante la jornada.

---

## 15. Fuera de alcance v1

Los siguientes elementos están explícitamente excluidos de la versión inicial del módulo:

- Estadísticas históricas agregadas y exportación a Excel.
- Generación automática de órdenes de compra (solo sugerencia de cantidad mediante `cantidad_sugerida_pedido`).
- Escaneo de códigos de barras.

---

## 16. Preguntas pendientes de clarificación

Todas las preguntas de clarificación han sido resueltas. No quedan items pendientes.

| Pregunta | Estado | Resolución |
|----------|--------|------------|
| Q3 — Unicidad JornadaVenta por POS | Resuelta | Un vendedor puede abrir más de una jornada el mismo día para el mismo POS, pero no dos simultáneamente. Solo puede existir una jornada con estado `abierta` por POS en cualquier momento. |
| Q4 — Autorización de traslados adicionales | Resuelta | Decisión de diseño: los traslados los ejecuta directamente quien tenga acceso (admin o vendedor con permiso), sin flujo de solicitud formal ni paso de aprobación. |
| Q5 — OrdenDeCompra multi-producto | Resuelta | Una orden agrupa múltiples productos del mismo proveedor mediante líneas (LineaOrdenDeCompra). La entidad y el proceso han sido actualizados. |
| Q6 — Cierre de jornada | Resuelta | Tanto el vendedor como el admin pueden cerrar una jornada. El sistema registra el actor en `cerrado_por`. Una jornada ya cerrada no puede volver a cerrarse. |
| Q7 — Usuarios compartidos con Hersa | Resuelta | Los usuarios del módulo Tienda usan la misma tabla de usuarios de Hersa con roles adicionales (`tienda_admin`, `tienda_vendedor`). |
| Q8 — Ajuste de inventario | Resuelta | Solo el administrador puede registrar movimientos con concepto `AJUSTE`. Es obligatorio ingresar una nota. Queda registrado con fecha, usuario y nota. Documentado como Proceso 8. |

---

*Documento generado por el agente `process-analyst`. Para propuestas de mejora o diseño del proceso to-be, invocar `process-optimizer` en una nueva sesión.*

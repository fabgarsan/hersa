# Eventos Hersa — Manual de Identidad Visual
**Versión:** 1.0  
**Fecha:** Abril 2026  
**Estado:** ✅ Vigente

> Este manual define el sistema visual de Eventos Hersa. Todo diseñador, desarrollador o proveedor que produzca materiales para la marca debe leer este documento antes de comenzar.

---

## 1. Paleta de Colores

La paleta de Eventos Hersa se construye sobre dos colores estructurales — el **marino profundo** y el **oro** — que comunican simultáneamente seriedad institucional y celebración. No son colores neutros: son una declaración de posicionamiento.

### Colores principales

| Nombre | Hex | Uso |
|--------|-----|-----|
| **Marino Hersa** | `#0B1F3A` | Color primario. AppBar, encabezados, botones principales, fondos oscuros. |
| **Marino Oscuro** | `#122640` | Superficies oscuras secundarias: sidebar, drawers, capas de profundidad. |
| **Marino Medio** | `#1E3A5F` | Estados hover en elementos de marino, bordes enfatizados. |
| **Oro Hersa** | `#C9A227` | Color de acento. CTAs, iconos activos, elementos destacados. |
| **Oro Claro** | `#E8D49A` | Hover sobre elementos dorados, chips, fondos de acento suave. |
| **Oro Oscuro** | `#A07B10` | Estados presionados/activos sobre dorado. |

### Colores de soporte

| Nombre | Hex | Uso |
|--------|-----|-----|
| **Blanco** | `#FFFFFF` | Fondos de tarjeta, modales, superficies de contenido. |
| **Gris Claro** | `#F5F5F5` | Fondo general de la aplicación. |
| **Negro Marca** | `#1A1A1A` | Texto principal sobre fondos claros. |
| **Gris Texto** | `#5F5E5A` | Texto secundario, etiquetas, metadatos. |

### Colores semánticos

| Estado | Principal | Claro | Uso |
|--------|-----------|-------|-----|
| Éxito | `#3B6D11` | `#EAF3DE` | Entregado, activo, confirmado. |
| Advertencia | `#854F0B` | `#FAEEDA` | Pendiente, en proceso. |
| Error | `#A32D2D` | `#FCEBEB` | Vencido, rechazado, error. |
| Información | `#185FA5` | `#E6F1FB` | Informativo neutro. |

### Reglas de uso de color

- **Nunca** combinar oro sobre oro, marino sobre marino, ni colores semánticos entre sí.
- El logo solo aparece sobre fondo **Marino Hersa** (`#0B1F3A`) o **Blanco** (`#FFFFFF`). Nunca sobre oro.
- El texto sobre fondos oscuros (marino) es siempre **Blanco** o **Oro Hersa**. Nunca gris.
- Los colores semánticos son exclusivos para comunicar estados del sistema — nunca se usan decorativamente.

---

## 2. Tipografía

Eventos Hersa usa un sistema de dos tipografías con roles complementarios:

### Tipografía de Exhibición — Playfair Display

**Uso:** Titulares celebratorios, mensajes emocionales, secciones B2C, piezas de impresión de alto impacto (portadas de álbum, diplomas, invitaciones).

**Por qué:** Su estructura serif evoca los diplomas y la solemnidad del logro académico, con la elegancia suficiente para el registro premium que Hersa quiere proyectar. Es reconociblemente "especial" sin ser antigua.

| Variante | Peso | Aplicación |
|---------|------|-----------|
| Playfair Display Bold | 700 | Titulares principales B2C |
| Playfair Display Regular | 400 | Subtítulos celebratorios, citas de marca |

**Fuente:** Google Fonts — `Playfair Display`

### Tipografía Funcional — Inter

**Uso:** Todo el texto de interfaz digital, comunicaciones B2B, cuerpo de documentos, navegación, formularios, recibos, notificaciones.

**Por qué:** Inter está optimizada para pantallas, es altamente legible en todos los tamaños, y comunica precisión y modernidad — exactamente lo que necesita el portal institucional.

| Variante | Peso | Aplicación |
|---------|------|-----------|
| Inter SemiBold | 600 | Encabezados de sección en UI, títulos de tarjeta |
| Inter Medium | 500 | Etiquetas, botones, navegación |
| Inter Regular | 400 | Cuerpo de texto, descripciones |

**Fuente:** Google Fonts — `Inter`

### Jerarquía tipográfica

| Nivel | Tipografía | Peso | Tamaño referencia | Contexto |
|-------|-----------|------|------------------|---------|
| Display | Playfair Display | 700 | 48–64px | Portadas, pantallas de bienvenida B2C |
| H1 | Inter | 600 | 32–40px | Encabezado principal de página |
| H2 | Inter | 600 | 24–28px | Sección de contenido |
| H3 | Inter | 500 | 18–20px | Subsección, título de tarjeta |
| Body | Inter | 400 | 14–16px | Texto de contenido principal |
| Caption | Inter | 400 | 12px | Metadatos, etiquetas secundarias |
| Button | Inter | 500 | 14px | Texto de botones — nunca en mayúsculas automáticas |

---

## 3. Logo

### Descripción del logo actual

El logo de Eventos Hersa presenta un **birrete de graduación** como forma principal, con una **H estilizada** en el interior que contiene la silueta de dos graduandos. El wordmark **"TOGAS HERSA"** acompaña al ícono.

**Decisión aprobada:** El wordmark se actualiza a **"EVENTOS HERSA"**. Se buscará la versión vectorizada (SVG) del logo para proceder con las variantes digitales.

### Variantes del logo

| Variante | Composición | Cuándo usar |
|---------|-------------|------------|
| **Completa** | Ícono + wordmark "EVENTOS HERSA" | Encabezados de documentos, pantalla de login, materiales impresos de alto nivel |
| **Reducida** | Solo ícono (birrete + H) | AppBar colapsada, favicon, ícono de app móvil, espacios reducidos |
| **Horizontal** | Ícono + wordmark en línea | Encabezados de documentos en formato landscape, navbar horizontal |

### Fondos permitidos

| Fondo | Permitido |
|-------|-----------|
| Marino Hersa `#0B1F3A` | ✅ Preferido |
| Blanco `#FFFFFF` | ✅ Permitido |
| Gris Claro `#F5F5F5` | ✅ Permitido |
| Oro `#C9A227` | ❌ Prohibido |
| Cualquier color semántico | ❌ Prohibido |
| Fotografías sin overlay | ❌ Prohibido (usar con overlay marino semi-transparente) |

### Zona de seguridad

El logo debe tener un espacio libre alrededor equivalente a **la altura de la letra "H" del wordmark**. Ningún elemento (texto, imagen, borde) puede invadir esa zona.

### Usos prohibidos

- Cambiar los colores del logo
- Estirar o deformar las proporciones
- Agregar sombras, degradados, o efectos sobre el logo
- Colocar texto sobre el logo
- Usar el logo sobre fondos dorados, de color, o fotografías sin overlay adecuado
- Usar una versión pixelada (JPEG o PNG de baja resolución) en materiales impresos

---

## 4. Estilo Fotográfico

La fotografía es el corazón del negocio de Hersa. Las imágenes que producen y muestran deben ser coherentes con la promesa de marca: *"Momentos de hoy para siempre."*

### Principios

**Emoción auténtica sobre pose perfecta.** Capturar el orgullo real, la alegría real, la conexión real entre el estudiante y su familia. Los momentos construidos se ven construidos.

**Luz cálida, no clínica.** La iluminación debe complementar la paleta de la marca: tonos dorados, cálidos, ricos. Evitar iluminación fría o excesivamente blanca que haga las fotos sentir como registros médicos.

**El estudiante como protagonista.** La familia y los maestros son el marco — el graduando es el centro. Composición que enfatice al estudiante.

**Diversidad natural.** Las fotos de Hersa representan a los estudiantes colombianos tal como son. No hay un único estándar de imagen.

**Retoque con criterio.** Mejorar la imagen, nunca transformar la persona. El estudiante debe reconocerse y reconocer a sus compañeros en las fotos.

### Lo que Hersa NO hace en fotografía

- Poses genéricas de stock (grupo mirando al frente, nadie se conoce)
- Iluminación excesivamente artificial que aplana los rostros
- Filtros de redes sociales sobre las fotos oficiales
- Fondos caóticos que compiten con el graduando
- Sobre-retoque que cambia los rasgos del estudiante

### Uso de fotografías en la marca

Las fotografías de graduaciones reales de Hersa son el mejor activo de marca. Usarlas en:
- Materiales de venta (propuestas para colegios)
- Portal institucional (galería de eventos anteriores)
- Portal de estudiantes (preview de su sesión)
- Comunicaciones externas

Cuando se usen sobre texto, aplicar un **overlay marino semi-transparente** (`#0B1F3A` al 60–70% de opacidad) para garantizar legibilidad.

---

## 5. Iconografía

Los íconos en materiales de Eventos Hersa son funcionales — existen para orientar, no para decorar.

### Estilo

- **Línea delgada** (stroke, no filled) para íconos de interfaz
- **Filled** exclusivamente para estados activos o seleccionados
- **Tamaño estándar:** 24×24px en interfaces; 32×32px en materiales impresos

### Color

- Sobre fondos claros: `#0B1F3A` (marino) o `#C9A227` (oro, solo para énfasis)
- Sobre fondos oscuros: `#FFFFFF` o `#C9A227`
- Íconos de estado: usar el color semántico correspondiente

### Librería recomendada

Material Icons (Google) — disponible nativamente en MUI y coherente con el stack técnico del producto digital.

---

## 6. Aplicaciones Físicas

### Uniformes del personal

- Fondo marino (`#0B1F3A`) como color base
- Logo versión completa bordado en oro
- Sin texto adicional en la prenda (el logo es suficiente)
- El color marino comunica profesionalismo y cohesión del equipo en campo

### Álbum de fotos

- Portada en marino o negro con el logo dorado en relieve
- Tipografía interior: Playfair Display para el nombre del graduando, Inter para metadatos
- El nombre del estudiante en Playfair Display Bold en la portada interior

### Documentos de cara al cliente (cotizaciones, recibos, contratos)

- Encabezado con logo completo sobre marino
- Cuerpo en blanco con texto en Negro Marca (`#1A1A1A`)
- Acento dorado solo en el encabezado y en la línea de total/firma
- Tipografía: Inter en todo el cuerpo del documento

### Carpeta de diploma

- Marino exterior, logo dorado
- Interior crema o blanco
- El nombre de la institución en Playfair Display

---

## 7. Instrucciones para el UI Designer

> El **UI Designer** debe leer este manual completo y `documentation/brand/digital-guidelines.md` antes de producir cualquier ui-spec.

**Tokens ya implementados en código:** ver `.claude/shared/conventions/theme-tokens.md` — los valores de color e Inter ya están en el tema MUI. No reemplazarlos sin actualizar primero este manual.

**Playfair Display** no está en el tema MUI actual. Debe añadirse para headlines celebratorios en el portal B2C (página de bienvenida, confirmación de graduación, pantalla de fotos entregadas). El portal B2B institucional puede operar completamente con Inter.

**Fotografías en UI:** siempre con overlay marino antes de colocar texto. Nunca texto directo sobre foto sin overlay.

**Logo en digital:** usar exclusivamente la versión SVG (cuando esté disponible). Hasta entonces, usar el PNG de mayor resolución disponible en `documentation/brand/assets/LogoHersa.png`.

# Eventos Hersa — Lineamientos de Marca Digital
**Versión:** 1.0  
**Fecha:** Abril 2026  
**Estado:** ✅ Vigente

> Este documento traduce el sistema de identidad visual al contexto digital. El **UI Designer** y el **react-developer** deben leerlo antes de diseñar o implementar cualquier interfaz.

---

## 1. Principio rector

El producto digital de Eventos Hersa tiene dos superficies con propósitos distintos:

| Superficie | Portal institucional | Portal de estudiantes |
|-----------|---------------------|-----------------------|
| Audiencia | Rectores, coordinadores, administradores | Estudiantes graduandos, familias |
| Registro visual | Denso, funcional, orientado a datos | Limpio, celebratorio, orientado a la experiencia |
| Tipografía de titulares | Inter — precisa, sin adornos | Playfair Display — cálida, memorable |
| Tono de color | Marino como dominante | Marino estructural, más espacio en blanco, oro como acento celebratorio |

**Una sola base de componentes, dos personalidades de contenido.** Los componentes MUI son los mismos — lo que cambia es el copy, los encabezados, y el uso de Playfair Display en el portal B2C.

---

## 2. Sistema de Color Digital

Los tokens ya están implementados en `frontend/src/shared/styles/theme.ts`. Este documento añade las reglas de uso visual que el código no puede documentar.

### Combinaciones permitidas

| Fondo | Texto / Ícono | Uso |
|-------|--------------|-----|
| Marino `#0B1F3A` | Blanco `#FFFFFF` | AppBar, sidebar, drawer, headers de sección oscuros |
| Marino `#0B1F3A` | Oro `#C9A227` | Logo sobre marino, íconos de acento, texto destacado en navbar |
| Blanco `#FFFFFF` | Marino `#0B1F3A` | Tarjetas, modales, cuerpo de formularios |
| Gris Claro `#F5F5F5` | Marino `#0B1F3A` | Fondo general de la app |
| Oro `#C9A227` | Marino `#0B1F3A` | Botones de CTA de alto contraste (solo cuando el contexto lo justifica) |

### Contraste WCAG AA (mínimo obligatorio)

| Combinación | Ratio | WCAG AA |
|-------------|-------|---------|
| Blanco sobre Marino `#0B1F3A` | 14.7:1 | ✅ Pasa |
| Oro `#C9A227` sobre Marino `#0B1F3A` | 5.8:1 | ✅ Pasa (texto normal y grande) |
| Marino `#0B1F3A` sobre Blanco | 14.7:1 | ✅ Pasa |
| Marino `#0B1F3A` sobre Gris `#F5F5F5` | 12.6:1 | ✅ Pasa |
| Gris texto `#5F5E5A` sobre Blanco | 5.9:1 | ✅ Pasa (texto normal) |

**Verificación:** Antes de usar cualquier combinación no listada, verificar en [webaim.org/resources/contrastchecker](https://webaim.org/resources/contrastchecker). Ratio mínimo: 4.5:1 para texto normal, 3:1 para texto grande (≥18px bold o ≥24px regular).

### Modo oscuro

**No se implementa en esta versión.** Si en el futuro se requiere, crear una rama de tokens separada — nunca invertir la paleta existente de forma automática.

---

## 3. Sistema Tipográfico Digital

### Instalación

```html
<!-- En index.html o en el provider de fuentes -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```

### Escala tipográfica

| Nivel | Fuente | Peso | Tamaño | Line-height | Uso digital |
|-------|--------|------|--------|-------------|-------------|
| Display | Playfair Display | 700 | 48px | 1.2 | Pantalla de bienvenida B2C, confirmación de graduación |
| h1 | Inter | 600 | 32px | 1.3 | Título principal de página |
| h2 | Inter | 600 | 24px | 1.4 | Encabezado de sección |
| h3 | Inter | 500 | 20px | 1.4 | Título de tarjeta, subsección |
| h4 | Inter | 500 | 16px | 1.5 | Título de widget, etiqueta de grupo |
| body1 | Inter | 400 | 16px | 1.6 | Texto principal |
| body2 | Inter | 400 | 14px | 1.6 | Texto secundario, descripciones |
| caption | Inter | 400 | 12px | 1.5 | Metadatos, timestamps, etiquetas |
| button | Inter | 500 | 14px | — | Texto de botones — `textTransform: none` |

### Cuándo usar Playfair Display en digital

Solo en el **portal de estudiantes**, en estos momentos específicos:
- Pantalla de bienvenida / splash screen
- Pantalla de confirmación de graduación ("¡Tu graduación está confirmada!")
- Galería de fotos entregadas (título de la sección)
- Pantalla de entrega del paquete (mensaje de celebración)

**Nunca** en: formularios, tablas, navigación, alertas del sistema, el portal institucional B2B.

---

## 4. Sistema de Espaciado

Eventos Hersa usa una grilla de **8px** como unidad base.

| Token | Valor | Uso |
|-------|-------|-----|
| xs | 4px | Separación interna mínima (ícono–texto) |
| sm | 8px | Padding interno de chips, badges |
| md | 16px | Padding interno de tarjetas, separación entre campos de formulario |
| lg | 24px | Separación entre secciones menores |
| xl | 32px | Separación entre secciones principales |
| xxl | 48px | Márgenes de página, separación entre bloques de contenido |

**Regla práctica:** Si un espaciado no es múltiplo de 8, preguntar si realmente es necesario o si un valor de la escala resuelve mejor.

---

## 5. Componentes — Principios Hersa

Todos los componentes usan la librería **MUI v5+** con el tema `hersaTheme`. Los principios siguientes son adiciones de uso, no reemplazos de MUI.

### Botones

| Tipo | Variante MUI | Color | Cuándo |
|------|-------------|-------|--------|
| Acción principal | `contained` | `primary` | La acción más importante de la pantalla |
| Acción secundaria | `outlined` | `primary` | Acción alternativa o de menor peso |
| CTA celebratorio | `contained` | `secondary` | Solo en portal B2C, para acciones de alto momento emocional |
| Acción destructiva | `outlined` | `error` | Eliminar, cancelar con consecuencias |
| Enlace / Terciario | `text` | `primary` | Navegación secundaria |

**Regla:** Solo puede haber un botón `contained primary` visible por área de acción. Si hay dos acciones principales, una de ellas no es principal.

### Tarjetas (Cards)

- `elevation={0}` con `border: 1px solid rgba(0,0,0,0.08)` — nunca sombras pronunciadas
- Padding interno: 16px (md) como mínimo
- Hover state: elevar ligeramente el borde a marino claro `#1E3A5F`

### Tablas

- Header con fondo marino `primary.main`, texto blanco
- Filas alternas: blanco / `#F5F5F5`
- Sin border-collapse agresivo — dejar respiro entre celdas
- Números alineados a la derecha

### Formularios

- Labels siempre visibles (no placeholder-only)
- Estado de error: usar `error.main` con texto descriptivo específico — nunca solo el borde rojo
- Estado de éxito: `success.main` como confirmación visual
- Campos de fecha: formato colombiano — DD/MM/AAAA

### Chips / Badges de estado

Usar exclusivamente los colores semánticos del tema vía `color="success|warning|error|info"` en el componente `Chip` de MUI. Nunca crear badges con colores personalizados fuera del sistema.

### Notificaciones / Snackbars

- Duración por defecto: 4000ms
- Posición: bottom-center en móvil, bottom-right en desktop
- Nunca usar para errores críticos — esos van en Dialog o en el cuerpo del formulario

---

## 6. Comportamiento Responsive

| Breakpoint | Ancho | Adaptación |
|-----------|-------|-----------|
| xs | < 600px | Layout single-column, drawer oculto, navegación por bottom-tabs |
| sm | 600–900px | Layout de dos columnas en formularios extensos |
| md | 900–1200px | Sidebar visible, tablas completas |
| lg | > 1200px | Layout completo, densidad máxima de información |

**Marca en mobile:**
- Logo: usar variante reducida (solo ícono) en AppBar móvil
- Playfair Display: reducir display a 32px en xs
- Espaciado: usar `md` (16px) como padding de página en mobile

---

## 7. Fotografías en Interfaces

Cuando se usen fotografías como fondo o en banners:

1. Aplicar overlay: `background: rgba(11, 31, 58, 0.65)` (marino al 65%)
2. El texto sobre el overlay: siempre blanco `#FFFFFF`
3. Nunca texto directo sobre fotografía sin overlay
4. `object-fit: cover` para contenedores de imagen — nunca deformar proporciones
5. `alt` descriptivo obligatorio en todas las imágenes

---

## 8. Movimiento y Transiciones

Eventos Hersa no es una app de entretenimiento. Las transiciones son funcionales, no llamativas.

| Tipo | Duración | Curva | Cuándo |
|------|---------|-------|--------|
| Micro-interacción (hover, focus) | 150ms | ease-out | Botones, campos, íconos |
| Transición de estado (mostrar/ocultar) | 250ms | ease-in-out | Drawers, modales, expansiones |
| Navegación de página | 300ms | ease-in-out | Cambio de vista principal |

**Regla:** Si la transición tarda más de 300ms sin ser una carga de datos, es demasiado larga.

**Accesibilidad:** Respetar `prefers-reduced-motion`. Si el usuario tiene activada esta preferencia del sistema, eliminar todas las transiciones.

```css
@media (prefers-reduced-motion: reduce) {
  * { transition: none !important; animation: none !important; }
}
```

---

## 9. Instrucciones para el UI Designer

> Leer `documentation/brand/brand-manual.md` antes de este documento.

**Para cada pantalla del ui-spec, declarar explícitamente:**
1. Si es superficie B2B o B2C
2. Si usa Playfair Display en algún título (y en cuál)
3. El color dominante de la pantalla
4. Si hay fotografía y qué overlay aplica

**Tokens disponibles:** todos en `.claude/shared/conventions/theme-tokens.md` — no inventar valores fuera de esa paleta.

**Playfair Display:** agregar al tema MUI como variante tipográfica antes de usarla. No hardcodear la fuente en componentes individuales.

**Logo:** hasta contar con SVG, usar `LogoHersa.png` de `documentation/brand/assets/`. Documentar en el ui-spec que esta imagen debe reemplazarse con SVG cuando esté disponible.

---

## 10. Instrucciones para react-developer

> Leer `.claude/shared/conventions/theme-tokens.md` — todos los tokens ya están ahí.

**Agregar Playfair Display** al `ThemeProvider`:

```ts
// src/shared/styles/theme.ts — añadir en typography:
typography: {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  // Añadir variante display para portal B2C:
  display: {
    fontFamily: '"Playfair Display", "Georgia", serif',
    fontWeight: 700,
    fontSize: '3rem',
    lineHeight: 1.2,
  },
  // ... resto de variantes existentes
}
```

**Respetar `prefers-reduced-motion`** — agregar el media query global en el CSS base.

**No hardcodear colores.** Siempre `theme.palette.primary.main`, nunca `'#0B1F3A'` dentro de componentes.

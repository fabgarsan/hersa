# UX Spec — Página no encontrada (404 / Ruta Inválida)

**Versión:** 1.0
**Fecha:** 2026-05-02
**Autor:** Laura (ux-designer)
**Scope:** Pantalla de error para cualquier ruta no reconocida por React Router v6
**Estado:** Listo para handoff a react-developer

---

## 1. Users Involved in This Flow

| Usuario | Dispositivo | Estado de auth | Objetivo al llegar a una ruta inválida |
|---------|-------------|----------------|----------------------------------------|
| Personal interno (coordinador, cajero, fotógrafo, administrador, etc.) | Desktop (primary), tablet ocasional | Autenticado | Recuperarse del error y continuar su tarea sin perder contexto |
| Gerente | Desktop | Autenticado | Igual que personal interno |
| Usuario no autenticado (persona que llega con un link roto, URL tipografiada a mano, o enlace externo caducado) | Desktop o móvil | No autenticado | Llegar a una superficie válida — probablemente Login |

> **Nota de alcance actual:** La app Hersa es hoy exclusivamente B2B (portal de operaciones internas). El flujo B2C para estudiantes no existe aún en producción. Esta spec cubre únicamente los dos contextos de usuario real del sistema actual: personal interno autenticado y visitante no autenticado.

---

## 2. User Journey

### Escenario A — Usuario autenticado llega a ruta inválida

1. El usuario está trabajando en la app (ej: `/grados`).
2. Escribe manualmente una URL incorrecta en la barra del navegador, usa un enlace guardado desactualizado, o sigue un deep link roto desde un mensaje externo.
3. React Router no encuentra coincidencia y — sin catch-all — hoy muestra pantalla en blanco.
4. Con esta spec: el catch-all `*` renderiza `NotFoundPage` **dentro del `ProtectedLayout`** (con AppHeader + sidebar visibles).
5. El usuario ve una pantalla clara que le confirma que la dirección no existe.
6. El usuario identifica en el sidebar su módulo más cercano a la tarea que intentaba realizar.
7. El usuario hace clic en un CTA de recuperación y retoma su flujo de trabajo.

### Escenario B — Usuario no autenticado llega a ruta inválida

1. Una persona sin sesión activa llega a una URL desconocida (ej: un enlace roto recibido por correo, o escribió mal la URL).
2. El `AuthGuard` actual redirige todo lo que no es ruta pública reconocida hacia `/login`. Sin embargo, esto produce un redirect silencioso que no explica qué ocurrió.
3. Con esta spec: el catch-all `*` renderiza `NotFoundPage` **sin Layout** (sin AppHeader ni sidebar — superficie pública mínima).
4. La pantalla explica brevemente que la dirección no existe y ofrece ir a Login.
5. El usuario llega a `/login` y puede autenticarse normalmente.

### Escenario C — Usuario autenticado accede a módulo sin permisos (ya cubierto, referencia)

Este escenario ya está manejado por `ModuleGuard` con su pantalla "No tienes acceso a esta sección". No se duplica aquí. La pantalla 404 no debe mezclarse con el mensaje de acceso denegado.

---

## 3. Required Screens

| ID | Nombre | Cuándo se muestra | Layout |
|----|--------|--------------------|--------|
| S-1 | `NotFoundPage` (autenticado) | Usuario con sesión activa navega a ruta no reconocida por el router | Dentro de `ProtectedLayout` (AppHeader + sidebar + main content area) |
| S-2 | `NotFoundPage` (no autenticado) | Usuario sin sesión activa llega a ruta no reconocida | Sin Layout — superficie mínima pública centrada |

> Ambos estados son el mismo componente `NotFoundPage`. El Layout se determina por la posición del catch-all `Route` dentro del árbol de rutas (dentro o fuera de `ProtectedLayout`), no por lógica interna del componente.

---

## 4. Information Hierarchy Per Screen

### S-1 — NotFoundPage (autenticado)

El usuario ya conoce el sistema. El sidebar ya actúa como mapa de navegación. La pantalla debe ser concisa y no repetir lo que el sidebar ya ofrece.

| Prioridad | Elemento | Justificación |
|-----------|----------|---------------|
| 1 | Indicador visual del error (icono) + código "404" | Confirma en 0.5 s que es un error de ruta, no un fallo del sistema |
| 2 | Mensaje principal: "Esta página no existe" | Diagnóstico directo sin tecnicismos |
| 3 | Mensaje de apoyo de una línea | Contexto cálido y orientador ("La dirección que ingresaste no corresponde a ninguna sección de Hersa") |
| 4 | CTA primario: "Ir al inicio" (navega a `/profile`) | Salida segura universal — siempre disponible independientemente de permisos |
| 5 | CTA secundario: "Volver" (browser history -1) | Para quien llegó desde otra pantalla y puede recuperar el contexto previo |

El sidebar ya visible provee los CTAs adicionales de navegación por módulo. La pantalla no necesita listar módulos ni links adicionales.

### S-2 — NotFoundPage (no autenticado)

El usuario no conoce la app. No hay sidebar. La pantalla debe ser auto-suficiente.

| Prioridad | Elemento | Justificación |
|-----------|----------|---------------|
| 1 | Logo Hersa | Confirmación de marca — el usuario sabe en qué sistema aterrizó |
| 2 | Indicador visual del error (icono) + código "404" | Diagnóstico inmediato |
| 3 | Mensaje principal: "Esta página no existe" | Diagnóstico directo |
| 4 | Mensaje de apoyo de una línea | "Es posible que el enlace haya expirado o esté incorrecto" |
| 5 | CTA único: "Ir al inicio de sesión" (navega a `/login`) | El único destino válido para un usuario no autenticado en Hersa |

---

## 5. Anticipated Friction Points

| ID | Descripción | Etiqueta | Resolución |
|----|-------------|----------|------------|
| F-1 | El usuario autenticado no sabe si el error es un fallo del sistema o una URL incorrecta — puede pensar que algo se rompió | `[FRICCIÓN ALTA]` | El icono y el mensaje deben dejar inequívoco que es un problema de dirección, no del sistema. Usar ícono de mapa/brújula o similar — nunca un ícono de error técnico (`ErrorOutlineIcon`) que evoca fallo del servidor |
| F-2 | El usuario no autenticado recibe un redirect silencioso a `/login` hoy, sin entender qué pasó — puede pensar que fue redirigido por seguridad y no que llegó a una URL inválida | `[FRICCIÓN ALTA]` | Mostrar S-2 antes del redirect — el usuario entiende que la URL no existe y elige ir a Login voluntariamente |
| F-3 | El usuario autenticado que llegó desde otra sección quiere volver exactamente a donde estaba, pero "Ir al inicio" lo lleva a `/profile` perdiendo contexto | `[FRICCIÓN MEDIA]` | Ofrecer CTA secundario "Volver" (`window.history.back()` o `navigate(-1)`) siempre que `history.length > 1`. Si no hay historial (pestaña nueva), ocultar este CTA |
| F-4 | Una pantalla 404 con demasiado texto o acciones genera más confusión que certeza | `[FRICCIÓN MEDIA]` | Máximo 2 CTAs visibles. Sin listas de links, sin formularios, sin menús adicionales. El sidebar en S-1 es el mapa — la pantalla solo necesita confirmar el error y ofrecer salida |
| F-5 | Usar el término técnico "404" como único mensaje principal puede no ser comprendido por usuarios no-técnicos (coordinadores, cajeros, personal de logística) | `[FRICCIÓN MEDIA]` | El "404" se muestra en tipografía grande como elemento visual/secundario de apoyo. El mensaje principal es siempre texto claro en español: "Esta página no existe" |

---

## 6. Screen States

La pantalla 404 no tiene estados de carga ni estados vacíos. Su única función es comunicar y redirigir. Los estados relevantes son:

### S-1 — NotFoundPage (autenticado)

| Estado | Descripción |
|--------|-------------|
| Default | Pantalla renderizada con ícono, mensaje, y los dos CTAs. El sidebar permanece funcional. |
| Sin historial de navegación (pestaña nueva) | El CTA "Volver" no se muestra. Solo aparece "Ir al inicio". |

### S-2 — NotFoundPage (no autenticado)

| Estado | Descripción |
|--------|-------------|
| Default | Superficie mínima centrada con logo, ícono, mensaje y CTA único a `/login`. |

No hay estado de error dentro de la pantalla de error, ni estado de carga. Si por alguna razón el AuthGuard está en `isLoading`, ese estado ya está manejado por `AuthGuard` y la pantalla 404 nunca se renderiza.

---

## 7. Alternative Flows

### Flujo alternativo 1 — Subrutade módulo válido no reconocida (ej: `/grados/algo-que-no-existe`)

**Contexto:** El módulo existe y el usuario tiene acceso, pero la sub-ruta no tiene una `Route` declarada dentro del módulo.

**Comportamiento esperado:** El mismo catch-all `*` en el nivel raíz del router captura estas rutas también. El usuario ve S-1 dentro del ProtectedLayout con el sidebar activo. El módulo padre (`/grados`) aparece activo o visible en el sidebar, lo que ayuda al usuario a volver al módulo correcto con un clic.

**Lo que NO debe pasar:** No debe haber un catch-all separado dentro de cada módulo que produzca una pantalla de error diferente. Un único componente `NotFoundPage` manejado desde el nivel raíz del router garantiza consistencia.

### Flujo alternativo 2 — Ruta de módulo válido, sin permisos (ej: `/admin`)

**Comportamiento:** Ya manejado por `ModuleGuard`. El usuario ve "No tienes acceso a esta sección" — no una pantalla 404. Estas son experiencias semánticamente distintas y no deben compartir pantalla.

### Flujo alternativo 3 — Usuario autenticado que navega con el botón "Atrás" desde 404

**Comportamiento:** El botón nativo del navegador funciona normalmente. El CTA "Volver" del componente hace `navigate(-1)`. Si el usuario llegó a la ruta inválida desde una pantalla válida, regresa directamente a ella.

### Flujo alternativo 4 — URL con parámetros de query adjuntos a una ruta inválida (ej: `/invented?ref=email`)

**Comportamiento:** El catch-all `*` captura la ruta base inválida. Los query params no afectan la lógica de la pantalla 404. El componente no necesita leerlos ni mostrarlos.

### Flujo alternativo 5 — Usuario no autenticado llega a ruta pública inválida (no es `/login`, `/forgot-password`, ni `/reset-password`)

**Comportamiento:** El `AuthGuard` actual intercepta antes del router cuando no está autenticado y redirige a `/login`. Para que el usuario vea S-2 en lugar del redirect silencioso, el catch-all para rutas inválidas debe ser evaluado por el router antes de que `AuthGuard` emita el redirect. Esto requiere que el catch-all `*` también sea accesible en el árbol de rutas públicas, o que `AuthGuard` distinga entre "ruta protegida sin sesión" y "ruta que no existe". Ver sección 8 (wireframes) para la decisión de implementación recomendada.

---

## 8. Text Wireframes

### S-1 — NotFoundPage dentro de ProtectedLayout (usuario autenticado)

```
┌─────────────────────────────────────────────────────────────────┐
│ [AppHeader — logo Hersa + nombre de usuario + menú hamburguesa] │
├───────────────┬─────────────────────────────────────────────────┤
│               │                                                 │
│  [NavSidebar] │   ┌─────────────────────────────────────────┐  │
│               │   │                                         │  │
│  - Perfil     │   │   [Icono: mapa o brújula — NOT un       │  │
│  - Tienda     │   │    ícono de error técnico]              │  │
│  - Grados     │   │   Tamaño: ~80px, color: marino          │  │
│  - Admin      │   │                                         │  │
│               │   │   404                                   │  │
│               │   │   [Tipografía grande, display,          │  │
│               │   │    color: gris claro, decorativa]       │  │
│               │   │                                         │  │
│               │   │   Esta página no existe                 │  │
│               │   │   [H5 o H6, color: negro marca]         │  │
│               │   │                                         │  │
│               │   │   La dirección que ingresaste no        │  │
│               │   │   corresponde a ninguna sección         │  │
│               │   │   de Hersa.                             │  │
│               │   │   [body2, color: gris texto]            │  │
│               │   │                                         │  │
│               │   │   [Btn primario: "Ir al inicio"]        │  │
│               │   │   variant="contained" color="primary"   │  │
│               │   │   → navega a /profile                   │  │
│               │   │                                         │  │
│               │   │   [Btn secundario: "Volver"]            │  │
│               │   │   variant="text" color="primary"        │  │
│               │   │   → navigate(-1)                        │  │
│               │   │   [oculto si history.length <= 1]       │  │
│               │   │                                         │  │
│               │   └─────────────────────────────────────────┘  │
│               │   Bloque centrado vertical y horizontalmente    │
│               │   en el área main del Layout                    │
└───────────────┴─────────────────────────────────────────────────┘
```

**Especificaciones de layout:**
- El bloque de contenido se centra usando `display: flex; flex-direction: column; align-items: center; justify-content: center` dentro del `<Box component="main">` del Layout existente.
- Ancho máximo del bloque interior: 400px.
- Espaciado entre elementos: 16px entre icono y "404"; 8px entre "404" y título; 12px entre título y descripción; 24px entre descripción y primer botón; 8px entre botones.
- Los botones se apilan verticalmente en columna, ancho completo del bloque (400px), para facilitar el clic en cualquier dispositivo.

---

### S-2 — NotFoundPage sin Layout (usuario no autenticado)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│              [Fondo: color #F5F5F5 (Gris Claro)]               │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │          [Logo Hersa — sobre fondo blanco de card]      │  │
│   │          Altura máx: 48px, centrado horizontalmente     │  │
│   │                                                         │  │
│   │   [Icono: mapa o brújula — mismo que S-1]               │  │
│   │   Tamaño: ~64px, color: marino                          │  │
│   │                                                         │  │
│   │   404                                                   │  │
│   │   [Tipografía display grande, gris claro, decorativa]   │  │
│   │                                                         │  │
│   │   Esta página no existe                                 │  │
│   │   [H6, negro marca]                                     │  │
│   │                                                         │  │
│   │   Es posible que el enlace haya expirado                │  │
│   │   o la dirección esté incorrecta.                       │  │
│   │   [body2, gris texto]                                   │  │
│   │                                                         │  │
│   │   [Btn primario: "Ir al inicio de sesión"]              │  │
│   │   variant="contained" color="primary"                   │  │
│   │   fullWidth → navega a /login                           │  │
│   │                                                         │  │
│   └─────────────────────────────────────────────────────────┘  │
│      Card centrada vertical y horizontalmente en la pantalla    │
│      Ancho card: 400px máx. Padding interno: 32px.              │
│      elevation={0}, border: 1px solid rgba(0,0,0,0.08)          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Especificaciones de layout:**
- Página completa (`min-height: 100vh`) con `display: flex; align-items: center; justify-content: center`.
- No hay AppHeader, no hay NavSidebar, no hay Drawer — superficie completamente limpia.
- La card contiene todo el contenido. Sin elevación (igual que convención de cards del design system).
- Un único botón, `variant="contained" color="primary"`, `fullWidth`.

---

### Nota de implementación para react-developer — posición del catch-all en App.tsx

El catch-all `*` debe aparecer en dos posiciones en `App.tsx`:

**Posición 1 (rutas públicas):** Al final del bloque de rutas públicas, antes del `ProtectedLayout`. Esto captura rutas inválidas para usuarios no autenticados y les muestra S-2 sin pasar por `AuthGuard`'s redirect.

**Posición 2 (rutas protegidas):** Al final del bloque de rutas dentro de `ProtectedLayout`. Esto captura rutas inválidas para usuarios autenticados dentro del Layout.

```
<Routes>
  {/* Rutas públicas */}
  <Route path="/login" element={<AuthModal />} />
  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
  <Route path="/reset-password" element={<ResetPasswordPage />} />
  <Route path="*" element={<NotFoundPage />} />          ← S-2 (sin layout)

  {/* Rutas protegidas */}
  <Route element={<ProtectedLayout />}>
    <Route path="/" element={<Navigate to="/profile" replace />} />
    <Route path="/tienda" element={...} />
    <Route path="/grados" element={...} />
    <Route path="/admin" element={...} />
    <Route path="/profile" element={<ProfilePage />} />
    <Route path="*" element={<NotFoundPage />} />        ← S-1 (con layout)
  </Route>
</Routes>
```

El componente `NotFoundPage` recibe una prop `authenticated?: boolean` (o lo detecta internamente con `useAuthContext`) para renderizar el bloque correcto. El `AuthGuard` no interfiere porque el primer catch-all `*` público es evaluado antes de que `AuthGuard` emita el redirect a `/login`.

---

## 9. Validation Questions

Preguntas para validar con usuarios reales antes de pasar a diseño visual:

1. **Sobre el mensaje:** Cuando ves "Esta página no existe", ¿entiendes de inmediato que escribiste mal la dirección, o piensas que algo se rompió en el sistema? (valida que el texto diferencie un error de ruta de un error técnico)

2. **Sobre los CTAs en S-1:** Si llegaras a esta pantalla mientras trabajabas en el módulo de Grados, ¿harías clic en "Ir al inicio" o preferirías ir directamente a Grados desde el sidebar? (valida si "Ir al inicio" es el CTA correcto o si debería ser "Ir a Grados" dinámico)

3. **Sobre el sidebar en S-1:** ¿El sidebar a la izquierda te da suficiente orientación para saber adónde ir, o necesitas links adicionales en la pantalla central? (valida si 2 CTAs son suficientes o si el sidebar suple la necesidad de más links)

4. **Sobre el ícono:** ¿El ícono de mapa/brújula te dice algo sobre lo que pasó, o necesitas solo el número "404" y el texto? (valida si el ícono aporta o distrae)

5. **Sobre el flujo no autenticado:** Si recibes por correo un enlace que ya no funciona y ves esta pantalla, ¿sabes qué hacer a continuación? (valida que S-2 sea auto-suficiente sin sidebar ni contexto previo)

6. **Sobre el CTA "Volver":** ¿Alguna vez usas el botón de atrás del navegador en lugar del CTA? (valida si el CTA "Volver" en el componente agrega valor o es redundante con el botón nativo)

---

## UX Observations for Systems Analyst

> Esta sección documenta observaciones de UX que tienen impacto en decisiones de arquitectura o especificación funcional.

**Observación 1 — AuthGuard redirige silenciosamente rutas inválidas no autenticadas**

El `AuthGuard` actual evalúa `!isAuthenticated && !isPublicRoute` y hace `<Navigate to={ROUTES.LOGIN} replace />` sin distinguir si la ruta no es pública porque es protegida o porque simplemente no existe. Esto produce un redirect silencioso que lleva al usuario a `/login` sin explicación.

**Impacto UX:** El usuario no autenticado que llega a una URL rota no entiende por qué fue llevado a login. Puede interpretar que fue redirigido por seguridad y sentir confusión o desconfianza.

**Recomendación:** Añadir el catch-all `*` como ruta pública explícita en el árbol del router (ver wireframe en sección 8), de modo que React Router capture la ruta inválida antes de que `AuthGuard` emita el redirect. `AuthGuard` no necesita cambios; el orden de evaluación del router resuelve el problema.

**Observación 2 — ModuleGuard y NotFoundPage son experiencias semánticamente distintas**

El `ModuleGuard` actual muestra "No tienes acceso a esta sección" con `LockOutlinedIcon`. La pantalla 404 dice "Esta página no existe". Estas son condiciones diferentes: una es una ruta válida con permisos insuficientes; la otra es una ruta que no existe. No deben unificarse en el mismo componente ni en el mismo mensaje.

**Impacto UX:** Si se unificaran, un usuario que llega a `/admin` sin permisos vería "Esta página no existe", lo que es técnicamente falso y destruye la confianza. La separación actual de `ModuleGuard` es correcta y debe preservarse.

**Recomendación:** Mantener los dos componentes separados. La pantalla 404 nunca reutiliza `ModuleGuard` ni viceversa.

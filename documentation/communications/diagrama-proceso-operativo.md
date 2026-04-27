# Proceso Operativo Hersa — Diagrama General

> **Audiencia:** Gerentes y stakeholders internos  
> **Versión:** 1.0 — Abril 2026  
> **Estado:** Pendiente validación gerencial

---

## Flujo Principal: De Prospecto a Graduación

```mermaid
flowchart TD
    START([🎯 Colegio Prospecto\nIdentificado]) --> S0

    subgraph S0 ["ETAPA 0 — AGENDAMIENTO"]
        A1[Comercial contacta al rector\npor teléfono o visita presencial]
        A2[Sistema registra visita\ncon fecha y contacto]
        A1 --> A2
    end

    S0 --> S1

    subgraph S1 ["ETAPA 1 — VINCULACIÓN DE LA PROMOCIÓN"]
        B1[Reunión con representantes\nde padres y delegados estudiantiles]
        B2[Negociación del paquete:\nprecios · ítems · fechas · invitaciones]
        B3[Firma de contrato\nPadres / Acudientes con Hersa]
        B4[Sistema crea PaquetePromoción\nSnapshot aislado por Promoción]
        B5[Sistema auto-notifica\ncambios de fecha a contactos]
        B1 --> B2 --> B3 --> B4
        B4 --> B5
    end

    S1 --> OPT1

    OPT1{¿Paquete incluye\nCena de Profesores?}
    OPT1 -->|Sí| S1B
    OPT1 -->|No| S2

    subgraph S1B ["ETAPA 1b — CENA DE PROFESORES (Opcional)"]
        C1[Evento en Hersa Casa Campestre]
        C2[Personal asignado ≥48h antes:\nMeseros · Catering externo]
        C1 --> C2
    end

    S1B --> S2

    subgraph S2 ["ETAPA 2 — REUNIÓN CON ESTUDIANTES"]
        D1[Comercial visita el colegio\nse reúne con todos los graduandos]
        D2[Registro de estudiantes por grupo\n11A · 11B · 11C...]
        D3[Comercial comparte QR / enlace\nde auto-registro con delegados]
        D4[Estudiantes se unen al\ngrupo de WhatsApp]
        D1 --> D2 --> D3 --> D4
    end

    S2 --> S3

    subgraph S3 ["ETAPA 3 — TOMA FOTOGRÁFICA"]
        E1[Cajero abre sesión de cobro]
        E2[Pago mínimo 50% del paquete\nExcepciones con justificación escrita]
        E3{¿Pago mínimo\ncumplido?}
        E4[Sistema autoriza foto\nFotógrafo consulta estado en sistema]
        E5[Vestidor mide y registra\ntalla de toga en sistema]
        E6[Sesión fotográfica\nFotógrafo inicia retoque en paralelo]
        E7[Sistema genera reporte\nde cierre automático]
        E8[Sistema envía recibo\npor email/SMS a estudiante y padre]
        E1 --> E2 --> E3
        E3 -->|Sí| E4 --> E5 --> E6 --> E7
        E3 -->|No / Excepción| E2
        E7 --> E8
    end

    S3 --> S4

    subgraph S4 ["ETAPA 4 — ACTIVIDAD PROM"]
        F1[Ensayo de graduación]
        F2[Estudiantes pagan\nsaldo pendiente]
        F3[Distribución de tarjetas\nde invitación con QR único]
        F4[Catering externo · Meseros\nasignados ≥48h antes]
        F5[Sistema genera reporte\nde cierre automático]
        F1 --> F2 --> F3
        F3 --> F4 --> F5
    end

    S4 --> OPT2

    OPT2{¿Estudiantes ausentes\no solicitudes adicionales?}
    OPT2 -->|Sí| S5
    OPT2 -->|No| S6

    subgraph S5 ["ETAPA 5 — TOMA FOTOGRAFÍA VARIOS (Opcional)"]
        G1[Sesión cross-institucional\nFecha publicada con anticipación]
        G2[Tres casos:\n• Fotos adicionales\n• Retomas por inconformidad\n• Ausentes etapas 3 y 4]
        G1 --> G2
    end

    S5 --> S6

    subgraph S6 ["ETAPA 6 — DÍA DE GRADO"]
        H1[Sistema notifica automáticamente\nsaldos pendientes ≥24h antes]
        H2[Bodega prepara materiales:\nTogas · Birretes · Estolas · Menaje]
        H3[Hersa recibe graduandos\nen la entrada]
        H4[Cajero valida saldo\nCoordinador entrega paquete]
        H5{¿Saldo = 0?}
        H6[Entrega registrada\nen sistema con timestamp]
        H7[Familia ingresa\ncon QR único de invitación]
        H8[Ceremonia inicia puntual\na la hora impresa en la invitación]
        H9[Gerente registra\nescalaciones si aplica]
        H1 --> H2 --> H3 --> H4
        H4 --> H5
        H5 -->|Sí| H6 --> H7 --> H8
        H5 -->|No| H4
        H8 --> H9
    end

    S6 --> END([✅ Promoción Completada])

    style S0 fill:#E3F2FD,stroke:#1565C0
    style S1 fill:#E8F5E9,stroke:#2E7D32
    style S1B fill:#F3E5F5,stroke:#6A1B9A
    style S2 fill:#FFF8E1,stroke:#F57F17
    style S3 fill:#FBE9E7,stroke:#BF360C
    style S4 fill:#E0F7FA,stroke:#00695C
    style S5 fill:#F3E5F5,stroke:#6A1B9A
    style S6 fill:#FCE4EC,stroke:#880E4F
```

---

## Mapa de Roles por Etapa

```mermaid
flowchart LR
    subgraph ROLES ["PARTICIPANTES POR ETAPA"]
        direction TB

        subgraph COL ["🏫 Colegio / Familias"]
            R1[Rector / Director]
            R2[Representante de Padres]
            R3[Delegado Estudiantil]
            R4[Estudiantes]
            R5[Familia]
        end

        subgraph INT ["👔 Equipo Hersa Interno"]
            R6[Comercial]
            R7[Gerente]
            R8[Cajero / Planillador]
            R9[Fotógrafo]
            R10[Vestidor]
            R11[Coordinador de Grado]
            R12[Jefe de Logística]
            R13[Personal de Bodega]
        end

        subgraph EXT ["🤝 Contratistas Externos"]
            R14[Conductor]
            R15[Maestro de Ceremonias]
            R16[Catering / Alimentos]
            R17[Meseros]
            R18[Grupo Musical]
        end
    end
```

---

## Línea de Tiempo del Proceso

```mermaid
timeline
    title Ciclo de Vida de una Promoción Hersa
    section Meses antes
        Agendamiento    : Comercial contacta rector
                        : Visita presencial o telefónica
        Vinculación     : Reunión con padres y delegados
                        : Negociación de paquete
                        : Firma de contrato
    section Semanas antes
        Reunión Est.    : Visita al colegio
                        : Registro de grupos
                        : Auto-registro estudiantes
        Cena Profesores : En Casa Campestre (opcional)
    section Evento central
        Toma Fotográfica : Pago mínimo 50%
                         : Sesión por grupos
                         : Medición de toga
        Toma Varios      : Ausentes y adicionales
    section Semana de grado
        Actividad Prom  : Pago saldo
                        : Ensayo
                        : Distribución QR
        Día de Grado    : Ceremonia
                        : Entrega de paquetes
                        : Ingreso con QR único
```

---

## Ciclo Financiero del Estudiante

```mermaid
flowchart LR
    A([Estudiante\nregistrado]) --> B{Etapa 3\nToma Fotográfica}
    B -->|Paga ≥50%| C[Autorizado para foto\nSaldo pendiente en sistema]
    B -->|Paga <50%\n+ justificación| C
    C --> D{Etapa 4\nProm}
    D -->|Paga saldo| E[Saldo = 0\nRecibe tarjetas QR]
    D -->|Saldo pendiente| F[Sistema notifica\n≥24h antes de grado]
    F --> G{Etapa 6\nDía de Grado}
    G -->|Paga saldo completo| H[Coordinador\nentrega paquete]
    G -->|No puede pagar| I[No recibe paquete\nEscalación Gerente]
    E --> H

    style C fill:#FFF9C4
    style E fill:#C8E6C9
    style H fill:#A5D6A7
    style I fill:#FFCDD2
```

---

> **Cómo exportar a PDF:**  
> Abrir este archivo en VS Code con la extensión *Markdown Preview Mermaid Support* instalada → clic derecho en el preview → *Open with Live Preview* → imprimir a PDF.  
> Alternativamente: copiar cada bloque Mermaid en [mermaid.live](https://mermaid.live) para exportar cada diagrama individualmente como imagen o SVG.

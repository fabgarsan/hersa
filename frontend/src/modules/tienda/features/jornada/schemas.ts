import { z } from "zod";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const uuidField = (label: string) =>
  z.string().min(1, `${label} es requerido`).regex(UUID_RE, `${label} debe ser un UUID válido`);

// ---------------------------------------------------------------------------
// jornadaOpenSchema — POST /jornadas/
// ---------------------------------------------------------------------------

export const jornadaOpenSchema = z.object({
  location: uuidField("Ubicación"),
  date: z.string().min(1, "La fecha es requerida"),
});

// ---------------------------------------------------------------------------
// trasladoAperturaSchema — POST /jornadas/{id}/traslado-apertura/
// ---------------------------------------------------------------------------

const trasladoItemSchema = z.object({
  product: uuidField("Producto"),
  quantity: z
    .string()
    .min(1, "La cantidad es requerida")
    .refine(
      (v) => Number.isInteger(Number(v)) && Number(v) > 0,
      "La cantidad debe ser un entero mayor a 0",
    ),
});

export const trasladoAperturaSchema = z.object({
  items: z.array(trasladoItemSchema).min(1, "Debe agregar al menos un producto al traslado"),
});

// ---------------------------------------------------------------------------
// reposicionSchema — POST /jornadas/{id}/reposicion/
// ---------------------------------------------------------------------------

export const reposicionSchema = z.object({
  product: uuidField("Producto"),
  quantity: z
    .string()
    .min(1, "La cantidad es requerida")
    .refine(
      (v) => Number.isInteger(Number(v)) && Number(v) > 0,
      "La cantidad debe ser un entero mayor a 0",
    ),
});

// ---------------------------------------------------------------------------
// conteoSchema — step 1 of cierre
// ---------------------------------------------------------------------------

export const conteoSchema = z.object({
  conteos: z.array(
    z.object({
      productoId: z.string(),
      productoNombre: z.string(),
      stockInicial: z.number(),
      cantidadContada: z
        .string()
        .min(1, "Campo requerido")
        .refine(
          (v) => Number.isInteger(Number(v)) && Number(v) >= 0,
          "Debe ser un entero no negativo",
        ),
    }),
  ),
});

// ---------------------------------------------------------------------------
// dineroSchema — step 2 of cierre
// ---------------------------------------------------------------------------

export const dineroSchema = z.object({
  billetes: z.array(
    z.object({
      denominacion: z.number(),
      cantidad: z
        .string()
        .refine(
          (v) => v === "" || (Number.isInteger(Number(v)) && Number(v) >= 0),
          "Debe ser un entero no negativo",
        ),
    }),
  ),
});

// ---------------------------------------------------------------------------
// cierreDraftSchema — localStorage draft (CierreDraft)
// ---------------------------------------------------------------------------

export const cierreDraftSchema = z.object({
  conteos: z.array(
    z.object({
      productoId: z.string(),
      productoNombre: z.string(),
      stockInicial: z.number(),
      cantidadContada: z.number(),
    }),
  ),
  billetes: z.array(
    z.object({
      denominacion: z.number(),
      cantidad: z.number(),
    }),
  ),
  totalEfectivoDeclarado: z.string(),
});

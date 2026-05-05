import { z } from "zod";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const uuidField = (label: string) =>
  z.string().min(1, `${label} es requerido`).regex(UUID_RE, `${label} debe ser un UUID válido`);

// ---------------------------------------------------------------------------
// ajusteSchema — POST /ajustes/
// ---------------------------------------------------------------------------

export const ajusteSchema = z.object({
  product: uuidField("Producto"),
  location: uuidField("Ubicación"),
  movementType: z.enum(["IN", "OUT"]),
  quantity: z
    .number()
    .int("La cantidad debe ser un número entero")
    .min(1, "La cantidad debe ser mayor a 0"),
  unitCost: z
    .string()
    .min(1, "El costo unitario es requerido")
    .refine(
      (v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 0,
      "El costo debe ser un número positivo",
    ),
  note: z.string().min(1, "La nota es requerida (BR-015)"),
});

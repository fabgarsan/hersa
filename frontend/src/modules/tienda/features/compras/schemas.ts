import { z } from "zod";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const uuidField = (label: string) =>
  z.string().min(1, `${label} es requerido`).regex(UUID_RE, `${label} debe ser un UUID válido`);

// ---------------------------------------------------------------------------
// createOrdenSchema — used for both create and edit-initiated forms
// ---------------------------------------------------------------------------

export const ordenLineaSchema = z.object({
  product: uuidField("Producto"),
  orderedQuantity: z
    .string()
    .min(1, "La cantidad es requerida")
    .refine(
      (v) => Number.isInteger(Number(v)) && Number(v) > 0,
      "La cantidad debe ser un entero mayor a 0",
    ),
  expectedUnitCost: z
    .string()
    .min(1, "El precio unitario es requerido")
    .refine(
      (v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0 && parseFloat(v) <= 999_999_999,
      "El precio debe ser mayor a $0 y menor a $999.999.999",
    ),
});

export const createOrdenSchema = z.object({
  supplier: uuidField("Proveedor"),
  notes: z.string().max(1000, "Máximo 1000 caracteres"),
  orderLines: z.array(ordenLineaSchema).min(1, "La orden debe tener al menos una línea"),
});

// ---------------------------------------------------------------------------
// recepcionSchema — used for recepcionar form
// ---------------------------------------------------------------------------

export const recepcionSchema = z
  .object({
    orderLine: uuidField("Línea de orden"),
    receivedQuantityGood: z
      .string()
      .min(1, "Campo requerido")
      .refine(
        (v) => Number.isInteger(Number(v)) && Number(v) >= 0,
        "Debe ser un entero no negativo",
      ),
    damagedQuantity: z
      .string()
      .min(1, "Campo requerido")
      .refine(
        (v) => Number.isInteger(Number(v)) && Number(v) >= 0,
        "Debe ser un entero no negativo",
      ),
    realUnitCost: z
      .string()
      .min(1, "El costo unitario real es requerido")
      .refine(
        (v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0 && parseFloat(v) <= 999_999_999,
        "El costo debe ser mayor a $0 y menor a $999.999.999",
      ),
    ubicacionId: uuidField("Ubicación de destino"),
    cantidad: z
      .string()
      .min(1, "La cantidad de destino es requerida")
      .refine(
        (v) => Number.isInteger(Number(v)) && Number(v) >= 0,
        "Debe ser un entero no negativo",
      ),
  })
  .refine((data) => Number(data.receivedQuantityGood) + Number(data.damagedQuantity) > 0, {
    message: "La suma de cantidad en buen estado y averiada debe ser mayor a 0",
    path: ["receivedQuantityGood"],
  });

// ---------------------------------------------------------------------------
// closeOrdenSchema — justificacion for the cerrar dialog
// ---------------------------------------------------------------------------

export const closeOrdenSchema = z.object({
  closingJustification: z
    .string()
    .min(1, "La justificación es requerida")
    .max(1000, "Máximo 1000 caracteres"),
});

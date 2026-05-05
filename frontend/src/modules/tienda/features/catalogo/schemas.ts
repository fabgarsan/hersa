import { z } from "zod";

export const productoSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(200, "Máximo 200 caracteres"),
  description: z.string().max(1000, "Máximo 1000 caracteres"),
  salePrice: z
    .string()
    .min(1, "El precio de venta es requerido")
    .refine(
      (v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0 && parseFloat(v) <= 999_999_999,
      "El precio debe estar entre $0 y $999.999.999",
    ),
  isActive: z.boolean(),
});

export const proveedorSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(200, "Máximo 200 caracteres"),
  contact: z.string().max(1000, "Máximo 1000 caracteres"),
});

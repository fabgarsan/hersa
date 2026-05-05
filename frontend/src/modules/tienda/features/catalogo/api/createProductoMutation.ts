import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@api/client";
import { TIENDA_API } from "@modules/tienda/constants/api";
import type { Product, ProductoFormValues } from "../types";

export async function createProducto(payload: ProductoFormValues): Promise<Product> {
  const { data } = await apiClient.post<Product>(TIENDA_API.PRODUCTOS, payload);
  return data;
}

export function useCreateProductoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProducto,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tienda", "productos"] });
    },
  });
}

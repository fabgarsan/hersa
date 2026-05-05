import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@api/client";
import { assertUuid } from "@shared/utils/assertUuid";
import { TIENDA_API } from "@modules/tienda/constants/api";
import type { Product, UpdateProductoInput } from "../types";

export async function updateProducto({ id, payload }: UpdateProductoInput): Promise<Product> {
  assertUuid(id, "updateProducto");
  const { data } = await apiClient.patch<Product>(`${TIENDA_API.PRODUCTOS}${id}/`, payload);
  return data;
}

export function useUpdateProductoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProducto,
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["tienda", "productos"] });
      void queryClient.invalidateQueries({ queryKey: ["tienda", "producto", variables.id] });
    },
  });
}

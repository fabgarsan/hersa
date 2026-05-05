import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@api/client";
import { assertUuid } from "@shared/utils/assertUuid";
import { TIENDA_API } from "@modules/tienda/constants/api";
import type { RemoveProveedorInput } from "../types";

export async function removeProveedor({
  productoId,
  supplierId,
}: RemoveProveedorInput): Promise<void> {
  assertUuid(productoId, "removeProveedor:productoId");
  assertUuid(supplierId, "removeProveedor:supplierId");
  await apiClient.delete(`${TIENDA_API.PRODUCTOS}${productoId}/proveedores/${supplierId}/`);
}

export function useRemoveProveedorMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeProveedor,
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ["tienda", "producto", variables.productoId],
      });
    },
  });
}

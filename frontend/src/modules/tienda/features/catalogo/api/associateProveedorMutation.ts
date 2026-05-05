import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@api/client";
import { assertUuid } from "@shared/utils/assertUuid";
import { TIENDA_API } from "@modules/tienda/constants/api";
import type { AssociateSupplierPayload, AssociateProveedorInput } from "../types";

export async function associateProveedor({
  productoId,
  supplierId,
}: AssociateProveedorInput): Promise<void> {
  assertUuid(productoId, "associateProveedor:productoId");
  assertUuid(supplierId, "associateProveedor:supplierId");
  const payload: AssociateSupplierPayload = { supplierId };
  await apiClient.post(`${TIENDA_API.PRODUCTOS}${productoId}/proveedores/`, payload);
}

export function useAssociateProveedorMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: associateProveedor,
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ["tienda", "producto", variables.productoId],
      });
    },
  });
}

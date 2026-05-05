import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@api/client";
import { assertUuid } from "@shared/utils/assertUuid";
import { TIENDA_API } from "@modules/tienda/constants/api";
import type { Supplier, UpdateProveedorInput } from "../types";

export async function updateProveedor({ id, payload }: UpdateProveedorInput): Promise<Supplier> {
  assertUuid(id, "updateProveedor");
  const { data } = await apiClient.patch<Supplier>(`${TIENDA_API.PROVEEDORES}${id}/`, payload);
  return data;
}

export function useUpdateProveedorMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProveedor,
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["tienda", "proveedores"] });
      void queryClient.invalidateQueries({ queryKey: ["tienda", "proveedor", variables.id] });
    },
  });
}

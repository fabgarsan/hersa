import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@api/client";
import { TIENDA_API } from "@modules/tienda/constants/api";
import type { Supplier, ProveedorFormValues } from "../types";

export async function createProveedor(payload: ProveedorFormValues): Promise<Supplier> {
  const { data } = await apiClient.post<Supplier>(TIENDA_API.PROVEEDORES, payload);
  return data;
}

export function useCreateProveedorMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProveedor,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tienda", "proveedores"] });
    },
  });
}

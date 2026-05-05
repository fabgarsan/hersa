import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@api/client";
import { assertUuid } from "@shared/utils/assertUuid";
import { TIENDA_API } from "@modules/tienda/constants/api";
import type { CreateAjusteInput, InventoryMovement } from "../types";

export async function createAjuste(payload: CreateAjusteInput): Promise<InventoryMovement> {
  assertUuid(payload.product, "createAjuste.product");
  assertUuid(payload.location, "createAjuste.location");
  const { data } = await apiClient.post<InventoryMovement>(TIENDA_API.AJUSTES, payload);
  return data;
}

export function useCreateAjusteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAjuste,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tienda", "ajustes"] });
      void queryClient.invalidateQueries({ queryKey: ["tienda", "stock"] });
    },
  });
}

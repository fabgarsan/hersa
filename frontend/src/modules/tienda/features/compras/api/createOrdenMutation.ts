import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@api/client";
import { TIENDA_API } from "@modules/tienda/constants/api";
import type { CreateOrdenInput, Orden } from "../types";

export async function createOrden(payload: CreateOrdenInput): Promise<Orden> {
  const { data } = await apiClient.post<Orden>(TIENDA_API.ORDENES, payload);
  return data;
}

export function useCreateOrdenMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createOrden,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tienda", "ordenes"] });
    },
  });
}

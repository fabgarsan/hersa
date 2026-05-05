import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@api/client";
import { assertUuid } from "@shared/utils/assertUuid";
import { TIENDA_API } from "@modules/tienda/constants/api";
import type { Orden } from "../types";

export async function confirmarOrden(id: string): Promise<Orden> {
  assertUuid(id, "confirmarOrden");
  const { data } = await apiClient.post<Orden>(`${TIENDA_API.ORDENES}${id}/confirmar/`);
  return data;
}

export function useConfirmarOrdenMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: confirmarOrden,
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["tienda", "ordenes"] });
      void queryClient.invalidateQueries({ queryKey: ["tienda", "orden", data.id] });
    },
  });
}

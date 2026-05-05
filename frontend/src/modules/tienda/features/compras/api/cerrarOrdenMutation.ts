import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@api/client";
import { assertUuid } from "@shared/utils/assertUuid";
import { TIENDA_API } from "@modules/tienda/constants/api";
import type { CerrarOrdenInput, Orden } from "../types";

export async function cerrarOrden({ id, closingJustification }: CerrarOrdenInput): Promise<Orden> {
  assertUuid(id, "cerrarOrden");
  const { data } = await apiClient.post<Orden>(`${TIENDA_API.ORDENES}${id}/cerrar/`, {
    closingJustification: closingJustification ?? "",
  });
  return data;
}

export function useCerrarOrdenMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cerrarOrden,
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["tienda", "ordenes"] });
      void queryClient.invalidateQueries({ queryKey: ["tienda", "orden", data.id] });
    },
  });
}

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@api/client";
import { assertUuid } from "@shared/utils/assertUuid";
import { TIENDA_API } from "@modules/tienda/constants/api";
import type { Orden, UpdateOrdenInput } from "../types";

export async function updateOrden({ id, payload }: UpdateOrdenInput): Promise<Orden> {
  assertUuid(id, "updateOrden");
  const { data } = await apiClient.patch<Orden>(`${TIENDA_API.ORDENES}${id}/`, payload);
  return data;
}

export function useUpdateOrdenMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateOrden,
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["tienda", "ordenes"] });
      void queryClient.invalidateQueries({ queryKey: ["tienda", "orden", data.id] });
    },
  });
}

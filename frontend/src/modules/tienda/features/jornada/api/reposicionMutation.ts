import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@api/client";
import { TIENDA_API } from "@modules/tienda/constants/api";
import { assertUuid } from "@shared/utils/assertUuid";
import type { Jornada, ReposicionInput } from "../types";

export async function reposicion(input: ReposicionInput): Promise<Jornada> {
  assertUuid(input.jornadaId, "reposicionMutation");
  const { data } = await apiClient.post<Jornada>(
    `${TIENDA_API.JORNADAS}${input.jornadaId}/reposicion/`,
    { items: input.items },
  );
  return data;
}

export function useReposicionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reposicion,
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ["tienda", "jornadas", variables.jornadaId],
      });
      void queryClient.invalidateQueries({ queryKey: ["tienda", "jornada-abierta"] });
    },
  });
}

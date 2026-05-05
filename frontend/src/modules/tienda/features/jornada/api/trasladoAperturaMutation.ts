import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@api/client";
import { TIENDA_API } from "@modules/tienda/constants/api";
import { assertUuid } from "@shared/utils/assertUuid";
import type { Jornada, TrasladoAperturaInput } from "../types";

export async function trasladoApertura(input: TrasladoAperturaInput): Promise<Jornada> {
  assertUuid(input.jornadaId, "trasladoAperturaMutation");
  const { data } = await apiClient.post<Jornada>(
    `${TIENDA_API.JORNADAS}${input.jornadaId}/traslado-apertura/`,
    { items: input.items },
  );
  return data;
}

export function useTrasladoAperturaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: trasladoApertura,
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ["tienda", "jornadas", variables.jornadaId],
      });
      void queryClient.invalidateQueries({ queryKey: ["tienda", "jornada-abierta"] });
    },
  });
}

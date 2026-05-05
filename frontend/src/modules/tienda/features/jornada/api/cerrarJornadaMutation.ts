import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@api/client";
import { TIENDA_API } from "@modules/tienda/constants/api";
import { assertUuid } from "@shared/utils/assertUuid";
import type { CerrarJornadaInput, Jornada } from "../types";

export async function cerrarJornada(input: CerrarJornadaInput): Promise<Jornada> {
  assertUuid(input.jornadaId, "cerrarJornadaMutation");
  const { data } = await apiClient.post<Jornada>(
    `${TIENDA_API.JORNADAS}${input.jornadaId}/cerrar/`,
    {
      items: input.items,
      cashDelivery: input.cashDelivery,
      cashOutAmount: input.cashOutAmount ?? null,
      cashOutDescription: input.cashOutDescription ?? "",
    },
  );
  return data;
}

export function useCerrarJornadaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cerrarJornada,
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["tienda", "jornadas"] });
      void queryClient.invalidateQueries({
        queryKey: ["tienda", "jornadas", variables.jornadaId],
      });
      void queryClient.invalidateQueries({ queryKey: ["tienda", "jornada-abierta"] });
    },
  });
}

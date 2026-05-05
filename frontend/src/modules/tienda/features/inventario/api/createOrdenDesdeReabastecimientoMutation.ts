import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@api/client";
import { assertUuid } from "@shared/utils/assertUuid";
import { TIENDA_API } from "@modules/tienda/constants/api";
import type { Orden } from "../../compras/types";
import type { FromReplenishmentInput } from "../types";

export async function createOrdenDesdeReabastecimiento(
  payload: FromReplenishmentInput,
): Promise<Orden[]> {
  payload.productIds.forEach((id) => assertUuid(id, "createOrdenDesdeReabastecimiento.productIds"));
  const { data } = await apiClient.post<Orden[]>(
    TIENDA_API.ORDENES_DESDE_REABASTECIMIENTO,
    payload,
  );
  return data;
}

export function useCreateOrdenDesdeReabastecimientoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createOrdenDesdeReabastecimiento,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tienda", "ordenes"] });
      void queryClient.invalidateQueries({ queryKey: ["tienda", "stock", "reabastecimiento"] });
    },
  });
}

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@api/client";
import { assertUuid } from "@shared/utils/assertUuid";
import { TIENDA_API } from "@modules/tienda/constants/api";
import type { Orden, RecepcionarInput } from "../types";

export async function recepcionarOrden({
  ordenId,
  orderLine,
  receivedQuantityGood,
  damagedQuantity,
  realUnitCost,
  destinations,
}: RecepcionarInput): Promise<Orden> {
  assertUuid(ordenId, "recepcionarOrden");
  const { data } = await apiClient.post<Orden>(`${TIENDA_API.ORDENES}${ordenId}/recepcionar/`, {
    orderLine,
    receivedQuantityGood,
    damagedQuantity,
    realUnitCost,
    destinations,
  });
  return data;
}

export function useRecepcionarOrdenMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recepcionarOrden,
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["tienda", "ordenes"] });
      void queryClient.invalidateQueries({ queryKey: ["tienda", "orden", data.id] });
    },
  });
}

import { useMutation } from "@tanstack/react-query";

import { apiClient } from "@api/client";
import { TIENDA_API } from "@modules/tienda/constants/api";
import { assertUuid } from "@shared/utils/assertUuid";
import type { CloseSummaryItem, ResumenCierreInput } from "../types";

export async function resumenCierre(input: ResumenCierreInput): Promise<CloseSummaryItem[]> {
  assertUuid(input.jornadaId, "resumenCierreMutation");
  const { data } = await apiClient.post<CloseSummaryItem[]>(
    `${TIENDA_API.JORNADAS}${input.jornadaId}/resumen-cierre/`,
    {
      items: input.items,
      cashDelivery: input.cashDelivery,
      cashOutAmount: input.cashOutAmount ?? null,
      cashOutDescription: input.cashOutDescription ?? "",
    },
  );
  return data;
}

export function useResumenCierreMutation() {
  return useMutation({
    mutationFn: resumenCierre,
  });
}

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@api/client";
import { TIENDA_API } from "@modules/tienda/constants/api";
import type { ReplenishmentItem } from "../types";

export async function fetchReabastecimiento(): Promise<ReplenishmentItem[]> {
  const { data } = await apiClient.get<ReplenishmentItem[]>(TIENDA_API.STOCK_REABASTECIMIENTO);
  return data;
}

export function useGetReabastecimientoQuery() {
  return useQuery({
    queryKey: ["tienda", "stock", "reabastecimiento"],
    queryFn: fetchReabastecimiento,
    staleTime: 60_000,
  });
}

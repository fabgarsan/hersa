import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@api/client";
import { TIENDA_API } from "@modules/tienda/constants/api";
import type { StockTotal, StockTotalQueryParams } from "../types";

export async function fetchStockTotal(params: StockTotalQueryParams): Promise<StockTotal> {
  const { data } = await apiClient.get<StockTotal>(TIENDA_API.STOCK_TOTAL, {
    params: { producto_id: params.productoId },
  });
  return data;
}

export function useGetStockTotalQuery(params: StockTotalQueryParams, enabled = true) {
  return useQuery({
    queryKey: ["tienda", "stock", "total", { productoId: params.productoId }],
    queryFn: () => fetchStockTotal(params),
    staleTime: 30_000,
    enabled,
  });
}

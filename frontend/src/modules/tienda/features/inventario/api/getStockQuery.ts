import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@api/client";
import { TIENDA_API } from "@modules/tienda/constants/api";
import type { LocationStock, StockQueryParams } from "../types";

export async function fetchStock(params: StockQueryParams): Promise<LocationStock[]> {
  const queryParams: Record<string, string> = {};
  if (params.productoId) queryParams["producto_id"] = params.productoId;
  if (params.ubicacionId) queryParams["ubicacion_id"] = params.ubicacionId;

  const { data } = await apiClient.get<LocationStock[]>(TIENDA_API.STOCK, {
    params: queryParams,
  });
  return data;
}

export function useGetStockQuery(params: StockQueryParams, enabled = true) {
  return useQuery({
    queryKey: [
      "tienda",
      "stock",
      { productoId: params.productoId, ubicacionId: params.ubicacionId },
    ],
    queryFn: () => fetchStock(params),
    staleTime: 30_000,
    enabled,
  });
}

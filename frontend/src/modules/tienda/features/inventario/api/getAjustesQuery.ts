import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@api/client";
import { TIENDA_API } from "@modules/tienda/constants/api";
import type { AjustesQueryParams, InventoryMovementPage } from "../types";

export async function fetchAjustes(params: AjustesQueryParams): Promise<InventoryMovementPage> {
  const queryParams: Record<string, string | number> = {};
  if (params.productId) queryParams["product_id"] = params.productId;
  if (params.page !== undefined) queryParams["page"] = params.page;
  if (params.pageSize !== undefined) queryParams["page_size"] = params.pageSize;

  const { data } = await apiClient.get<InventoryMovementPage>(TIENDA_API.AJUSTES, {
    params: queryParams,
  });
  return data;
}

export function useGetAjustesQuery(params: AjustesQueryParams, enabled = true) {
  return useQuery({
    queryKey: ["tienda", "ajustes", { productId: params.productId, page: params.page }],
    queryFn: () => fetchAjustes(params),
    staleTime: 30_000,
    enabled,
  });
}

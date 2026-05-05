import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@api/client";
import { TIENDA_API } from "@modules/tienda/constants/api";
import type { PaginatedResponse, Supplier, ProveedoresQueryParams } from "../types";

export async function fetchProveedores(
  params: ProveedoresQueryParams,
): Promise<PaginatedResponse<Supplier>> {
  const queryParams: Record<string, string | number> = {};
  if (params.page !== undefined) queryParams["page"] = params.page;
  if (params.pageSize !== undefined) queryParams["page_size"] = params.pageSize;

  const { data } = await apiClient.get<PaginatedResponse<Supplier>>(TIENDA_API.PROVEEDORES, {
    params: queryParams,
  });
  return data;
}

export function useGetProveedoresQuery(params: ProveedoresQueryParams = {}, enabled = true) {
  return useQuery({
    queryKey: ["tienda", "proveedores", { page: params.page }],
    queryFn: () => fetchProveedores(params),
    staleTime: 30_000,
    enabled,
  });
}

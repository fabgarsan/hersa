import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@api/client";
import { TIENDA_API } from "@modules/tienda/constants/api";
import type { DrfQueryParams, DrfPaginatedResponse } from "@shared/hooks/types";
import type { ProveedoresQueryParams, Supplier } from "../types";

export async function fetchProveedores(
  params: DrfQueryParams,
): Promise<DrfPaginatedResponse<Supplier>> {
  const { data } = await apiClient.get<DrfPaginatedResponse<Supplier>>(TIENDA_API.PROVEEDORES, {
    params: {
      page: params.page,
      page_size: params.pageSize,
      ordering: params.ordering,
      search: params.search,
    },
  });
  return data;
}

export function useGetProveedoresQuery(params: ProveedoresQueryParams = {}, enabled = true) {
  return useQuery({
    queryKey: ["tienda", "proveedores", { page: params.page }],
    queryFn: () => fetchProveedores({ page: params.page ?? 1, pageSize: params.pageSize ?? 20 }),
    staleTime: 30_000,
    enabled,
  });
}

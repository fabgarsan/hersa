import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@api/client";
import { TIENDA_API } from "@modules/tienda/constants/api";
import type { OrdenesPage, OrdenesQueryParams } from "../types";

export async function fetchOrdenes(params: OrdenesQueryParams): Promise<OrdenesPage> {
  const queryParams: Record<string, string | number> = {};
  if (params.estado) queryParams["estado"] = params.estado;
  if (params.proveedorId) queryParams["proveedor_id"] = params.proveedorId;
  if (params.page !== undefined) queryParams["page"] = params.page;
  if (params.pageSize !== undefined) queryParams["page_size"] = params.pageSize;

  const { data } = await apiClient.get<OrdenesPage>(TIENDA_API.ORDENES, {
    params: queryParams,
  });
  return data;
}

export function useGetOrdenesQuery(params: OrdenesQueryParams) {
  return useQuery({
    queryKey: [
      "tienda",
      "ordenes",
      { estado: params.estado, proveedorId: params.proveedorId, page: params.page },
    ],
    queryFn: () => fetchOrdenes(params),
    staleTime: 30_000,
  });
}

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@api/client";
import { TIENDA_API } from "@modules/tienda/constants/api";
import type { PaginatedResponse, Product, ProductosQueryParams } from "../types";

export async function fetchProductos(
  params: ProductosQueryParams,
): Promise<PaginatedResponse<Product>> {
  const queryParams: Record<string, string | number | boolean> = {};
  if (params.q) queryParams["q"] = params.q;
  if (params.activo !== undefined) queryParams["activo"] = params.activo;
  if (params.page !== undefined) queryParams["page"] = params.page;
  if (params.pageSize !== undefined) queryParams["page_size"] = params.pageSize;

  const { data } = await apiClient.get<PaginatedResponse<Product>>(TIENDA_API.PRODUCTOS, {
    params: queryParams,
  });
  return data;
}

export function useGetProductosQuery(params: ProductosQueryParams) {
  return useQuery({
    queryKey: ["tienda", "productos", { activo: params.activo, q: params.q, page: params.page }],
    queryFn: () => fetchProductos(params),
    staleTime: 30_000,
  });
}

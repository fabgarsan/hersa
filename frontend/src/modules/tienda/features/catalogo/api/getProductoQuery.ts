import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@api/client";
import { assertUuid } from "@shared/utils/assertUuid";
import { TIENDA_API } from "@modules/tienda/constants/api";
import type { Product } from "../types";

export async function fetchProducto(id: string): Promise<Product> {
  assertUuid(id, "fetchProducto");
  const { data } = await apiClient.get<Product>(`${TIENDA_API.PRODUCTOS}${id}/`);
  return data;
}

export function useGetProductoQuery(id: string | undefined) {
  return useQuery({
    queryKey: ["tienda", "producto", id],
    queryFn: () => fetchProducto(id as string),
    enabled: !!id,
    staleTime: 60_000,
  });
}

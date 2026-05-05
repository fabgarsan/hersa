import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@api/client";
import { assertUuid } from "@shared/utils/assertUuid";
import { TIENDA_API } from "@modules/tienda/constants/api";
import type { Orden } from "../types";

export async function fetchOrden(id: string): Promise<Orden> {
  assertUuid(id, "fetchOrden");
  const { data } = await apiClient.get<Orden>(`${TIENDA_API.ORDENES}${id}/`);
  return data;
}

export function useGetOrdenQuery(id: string | undefined) {
  return useQuery({
    queryKey: ["tienda", "orden", id],
    queryFn: () => fetchOrden(id as string),
    enabled: !!id,
    staleTime: 30_000,
  });
}

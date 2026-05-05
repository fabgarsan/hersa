import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@api/client";
import { TIENDA_API } from "@modules/tienda/constants/api";
import { assertUuid } from "@shared/utils/assertUuid";
import type { Jornada } from "../types";

export async function fetchJornada(id: string): Promise<Jornada> {
  assertUuid(id, "getJornadaQuery");
  const { data } = await apiClient.get<Jornada>(`${TIENDA_API.JORNADAS}${id}/`);
  return data;
}

export function useGetJornadaQuery(id: string | undefined) {
  return useQuery({
    queryKey: ["tienda", "jornadas", id],
    queryFn: () => fetchJornada(id!),
    enabled: !!id,
    staleTime: 30_000,
  });
}

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@api/client";
import { TIENDA_API } from "@modules/tienda/constants/api";
import type { Jornada } from "../types";

export async function fetchJornadaAbierta(): Promise<Jornada | null> {
  const response = await apiClient.get<Jornada | "">(TIENDA_API.JORNADA_ABIERTA, {
    validateStatus: (status) => status === 200 || status === 204,
  });
  if (response.status === 204 || !response.data) {
    return null;
  }
  return response.data as Jornada;
}

export function useGetJornadaAbiertaQuery() {
  return useQuery({
    queryKey: ["tienda", "jornada-abierta"],
    queryFn: fetchJornadaAbierta,
    // Always fetch fresh on mount — staleTime: 0 per spec
    staleTime: 0,
  });
}

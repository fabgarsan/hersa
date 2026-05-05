import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@api/client";
import { TIENDA_API } from "@modules/tienda/constants/api";
import type { JornadasPage, JornadasQueryParams } from "../types";

export async function fetchJornadas(params: JornadasQueryParams): Promise<JornadasPage> {
  const queryParams: Record<string, string | number> = {};
  if (params.page !== undefined) queryParams["page"] = params.page;
  if (params.pageSize !== undefined) queryParams["page_size"] = params.pageSize;

  const { data } = await apiClient.get<JornadasPage>(TIENDA_API.JORNADAS, {
    params: queryParams,
  });
  return data;
}

export function useGetJornadasQuery(params: JornadasQueryParams, enabled = true) {
  return useQuery({
    queryKey: ["tienda", "jornadas", { page: params.page, pageSize: params.pageSize }],
    queryFn: () => fetchJornadas(params),
    staleTime: 30_000,
    enabled,
  });
}

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@api/client";
import { assertUuid } from "@shared/utils/assertUuid";
import { TIENDA_API } from "@modules/tienda/constants/api";
import type { Supplier } from "../types";

export async function fetchProveedor(id: string): Promise<Supplier> {
  assertUuid(id, "fetchProveedor");
  const { data } = await apiClient.get<Supplier>(`${TIENDA_API.PROVEEDORES}${id}/`);
  return data;
}

export function useGetProveedorQuery(id: string | undefined) {
  return useQuery({
    queryKey: ["tienda", "proveedor", id],
    queryFn: () => fetchProveedor(id as string),
    enabled: !!id,
    staleTime: 60_000,
  });
}

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@api/client";
import { TIENDA_API } from "@modules/tienda/constants/api";
import type { CreateJornadaInput, Jornada } from "../types";

export async function createJornada(payload: CreateJornadaInput): Promise<Jornada> {
  const { data } = await apiClient.post<Jornada>(TIENDA_API.JORNADAS, payload);
  return data;
}

export function useCreateJornadaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createJornada,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tienda", "jornadas"] });
      void queryClient.invalidateQueries({ queryKey: ["tienda", "jornada-abierta"] });
    },
  });
}

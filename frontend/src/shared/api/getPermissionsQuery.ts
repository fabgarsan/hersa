import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@api/client";
import { API } from "@shared/constants/api";

export function useGetPermissionsQuery() {
  return useQuery<string[]>({
    queryKey: ["permissions", "me"],
    queryFn: async () => {
      const { data } = await apiClient.get<string[]>(API.MY_PERMISSIONS);
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

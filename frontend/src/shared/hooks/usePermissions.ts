import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@api/client";
import { useMeQuery } from "@modules/auth";
import { API } from "@shared/constants/api";
import type { UsePermissionsReturn } from "./types";

export function usePermissions(): UsePermissionsReturn {
  const { data: user } = useMeQuery();

  const { data, isLoading } = useQuery<string[]>({
    queryKey: ["permissions", "me"],
    queryFn: async () => {
      const { data: responseData } = await apiClient.get<string[]>(API.MY_PERMISSIONS);
      return responseData;
    },
    staleTime: 5 * 60 * 1000,
  });

  const permissions = data ?? [];

  const hasAccess = (permission: string): boolean => {
    if (isLoading) return false;
    if (user?.is_superuser) return true;
    return permissions.includes(permission);
  };

  return { hasAccess, permissions, isLoading };
}

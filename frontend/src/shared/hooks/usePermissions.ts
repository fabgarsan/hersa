import { useMeQuery } from "@modules/auth";
import { useGetPermissionsQuery } from "@shared/api/getPermissionsQuery";
import type { UsePermissionsReturn } from "./types";

export function usePermissions(): UsePermissionsReturn {
  const { data: user } = useMeQuery();
  const { data, isLoading } = useGetPermissionsQuery();

  const permissions = data ?? [];

  const hasAccess = (permission: string): boolean => {
    if (isLoading) return false;
    if (user?.isSuperuser) return true;
    return permissions.includes(permission);
  };

  return { hasAccess, permissions, isLoading };
}

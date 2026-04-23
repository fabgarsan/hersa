import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@api/client';
import { API } from '@shared/constants/api';
import { ModuleSlug } from '@shared/types/permissions';

export function usePermissions() {
  const { data, isLoading } = useQuery<ModuleSlug[]>({
    queryKey: ['permissions', 'me'],
    queryFn: async () => {
      const { data: responseData } = await apiClient.get<ModuleSlug[]>(API.MY_MODULE_PERMISSIONS);
      return responseData;
    },
    staleTime: 5 * 60 * 1000,
  });

  const modules = data ?? [];

  const hasAccess = (slug: ModuleSlug): boolean => {
    if (isLoading) return false;
    return modules.includes(slug);
  };

  return { hasAccess, modules, isLoading };
}

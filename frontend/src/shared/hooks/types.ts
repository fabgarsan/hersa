import type { ModuleSlug } from "@shared/types/permissions";

export interface UsePermissionsReturn {
  hasAccess: (slug: ModuleSlug) => boolean;
  modules: ModuleSlug[];
  isLoading: boolean;
}

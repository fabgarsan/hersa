export interface UsePermissionsReturn {
  hasAccess: (permission: string) => boolean;
  permissions: string[];
  isLoading: boolean;
}

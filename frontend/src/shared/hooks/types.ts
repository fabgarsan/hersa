import type { QueryKey } from "@tanstack/react-query";

import type { DataTableAdapter } from "@shared/components/DataTable/types";

export interface UsePermissionsReturn {
  hasAccess: (permission: string) => boolean;
  permissions: string[];
  isLoading: boolean;
}

export interface DrfQueryParams {
  /** 1-based page number (DRF convention) */
  page: number;
  pageSize: number;
  /** "field1,-field2" format for DRF ordering */
  ordering?: string;
  search?: string;
}

export interface DrfPaginatedResponse<R> {
  count: number;
  next: string | null;
  previous: string | null;
  results: R[];
}

export interface UseDrfAdapterOptions<R> {
  queryFn: (params: DrfQueryParams) => Promise<DrfPaginatedResponse<R>>;
  queryKey: QueryKey;
  /** default: 10 */
  initialPageSize?: number;
}

export type UseDrfAdapterReturn<R> = DataTableAdapter<R>;

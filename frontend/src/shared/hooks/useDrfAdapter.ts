import { useEffect, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import type { QueryKey } from "@tanstack/react-query";
import type { GridSortItem } from "@mui/x-data-grid";

import type { DataTableAdapter } from "@shared/components/DataTable/types";

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

/**
 * Adapter hook that translates DataGrid conventions (0-based page, GridSortItem[])
 * into DRF query params (1-based page, ordering string) and returns a DataTableAdapter.
 */
export function useDrfAdapter<R>({
  queryFn,
  queryKey,
  initialPageSize = 10,
}: UseDrfAdapterOptions<R>): UseDrfAdapterReturn<R> {
  // 0-based page for DataGrid
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortModel, setSortModel] = useState<GridSortItem[]>([]);
  const [searchInput, setSearchInput] = useState("");
  // Debounced search value — 300ms delay before triggering query
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      // Reset to first page on new search
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Build ordering string: GridSortItem[] → "field1,-field2"
  const ordering =
    sortModel.length > 0
      ? sortModel.map((item) => (item.sort === "desc" ? `-${item.field}` : item.field)).join(",")
      : undefined;

  const queryParams: DrfQueryParams = {
    page: page + 1, // DRF is 1-based
    pageSize,
    ordering,
    search: debouncedSearch || undefined,
  };

  const { data, isLoading, error } = useQuery({
    queryKey: [...(Array.isArray(queryKey) ? queryKey : [queryKey]), queryParams],
    queryFn: () => queryFn(queryParams),
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(0);
  };

  const handleSortChange = (model: GridSortItem[]) => {
    setSortModel(model);
    setPage(0);
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  return {
    rows: data?.results ?? [],
    totalCount: data?.count ?? 0,
    page,
    pageSize,
    isLoading,
    error: error instanceof Error ? error : error != null ? new Error(String(error)) : null,
    sortModel,
    searchValue: searchInput,
    onPageChange: handlePageChange,
    onPageSizeChange: handlePageSizeChange,
    onSortChange: handleSortChange,
    onSearchChange: handleSearchChange,
  };
}

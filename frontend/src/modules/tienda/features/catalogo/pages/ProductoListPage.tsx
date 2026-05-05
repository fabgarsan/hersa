import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import InputAdornment from "@mui/material/InputAdornment";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { Navigate } from "react-router-dom";

import { useTiendaRole } from "@modules/tienda/shared/hooks/useTiendaRole";
import { useGetProductosQuery } from "../api/getProductosQuery";
import { ProductoTable } from "../components/ProductoTable";
import { useDebounce } from "@shared/hooks";
import styles from "./ProductoListPage.module.scss";

type ActiveFilter = "all" | "active" | "inactive";

export default function ProductoListPage() {
  const { isAdmin, role } = useTiendaRole();
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState("");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const debouncedSearch = useDebounce(searchInput, 300);

  const activoParam =
    activeFilter === "active" ? true : activeFilter === "inactive" ? false : undefined;

  const { data, isLoading, isError } = useGetProductosQuery({
    q: debouncedSearch || undefined,
    activo: isAdmin ? activoParam : undefined,
    page,
    pageSize,
  });

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    setPage(1);
  }, []);

  const handleFilterChange = useCallback((filter: ActiveFilter) => {
    setActiveFilter(filter);
    setPage(1);
  }, []);

  if (role === "none") {
    return <Navigate to="/tienda" replace />;
  }

  if (isLoading && !data) {
    return (
      <Box className={styles.root}>
        <Skeleton variant="rectangular" height={40} className={styles.skeletonHeader} />
        <Skeleton variant="rectangular" height={400} className={styles.skeletonTable} />
      </Box>
    );
  }

  return (
    <Box className={styles.root}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        className={styles.header}
        spacing={2}
      >
        <Typography variant="h5" className={styles.title}>
          Productos
        </Typography>
        {isAdmin && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate("/tienda/productos/nuevo")}
          >
            Nuevo Producto
          </Button>
        )}
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} className={styles.filters}>
        <TextField
          value={searchInput}
          onChange={handleSearchChange}
          placeholder="Buscar por nombre..."
          size="small"
          className={styles.search}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />

        {isAdmin && (
          <Stack direction="row" spacing={1}>
            <Chip
              label="Todos"
              onClick={() => handleFilterChange("all")}
              color={activeFilter === "all" ? "primary" : "default"}
              variant={activeFilter === "all" ? "filled" : "outlined"}
            />
            <Chip
              label="Activos"
              onClick={() => handleFilterChange("active")}
              color={activeFilter === "active" ? "success" : "default"}
              variant={activeFilter === "active" ? "filled" : "outlined"}
            />
            <Chip
              label="Inactivos"
              onClick={() => handleFilterChange("inactive")}
              color={activeFilter === "inactive" ? "default" : "default"}
              variant={activeFilter === "inactive" ? "filled" : "outlined"}
            />
          </Stack>
        )}
      </Stack>

      {isError && (
        <Alert severity="error" className={styles.error}>
          Error al cargar los productos. Intenta nuevamente.
        </Alert>
      )}

      <ProductoTable
        productos={data?.results ?? []}
        isLoading={isLoading}
        isAdmin={isAdmin}
        totalCount={data?.count ?? 0}
        page={page}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </Box>
  );
}

import { useState, useCallback } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";

import { useTiendaRole } from "@modules/tienda/shared/hooks/useTiendaRole";
import { useGetProveedoresQuery } from "../api/getProveedoresQuery";
import { ProveedorTable } from "../components/ProveedorTable";
import styles from "./ProveedorListPage.module.scss";

export default function ProveedorListPage() {
  const { isAdmin, role } = useTiendaRole();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, isError } = useGetProveedoresQuery({ page, pageSize });

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
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
          Proveedores
        </Typography>
        {isAdmin && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate("/tienda/proveedores/nuevo")}
          >
            Nuevo Proveedor
          </Button>
        )}
      </Stack>

      {isError && (
        <Alert severity="error" className={styles.error}>
          Error al cargar los proveedores. Intenta nuevamente.
        </Alert>
      )}

      <ProveedorTable
        proveedores={data?.results ?? []}
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

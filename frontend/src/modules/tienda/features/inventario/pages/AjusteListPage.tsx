import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";

import { useTiendaRole } from "@modules/tienda/shared/hooks/useTiendaRole";
import { TIENDA_ROUTES } from "@modules/tienda/constants/routes";
import { formatCOP } from "@modules/tienda/features/jornada/helpers/formatCOP";
import { useGetAjustesQuery } from "../api/getAjustesQuery";
import type { InventoryMovement } from "../types";
import styles from "./AjusteListPage.module.scss";

export default function AjusteListPage() {
  const { isAdmin } = useTiendaRole();
  const navigate = useNavigate();

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, isError } = useGetAjustesQuery({ page: page + 1, pageSize }, isAdmin);

  if (!isAdmin) {
    return <Navigate to="/tienda" replace />;
  }

  const columns: GridColDef<InventoryMovement>[] = [
    {
      field: "product",
      headerName: "Producto",
      flex: 1,
      minWidth: 160,
      renderCell: (params) => <span>{params.row.product.name}</span>,
    },
    {
      field: "location",
      headerName: "Ubicación",
      width: 120,
      renderCell: (params) => (
        <span title={params.row.location}>{params.row.location.slice(0, 8)}…</span>
      ),
    },
    {
      field: "movementType",
      headerName: "Tipo",
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.row.movementType === "IN" ? "Entrada" : "Salida"}
          size="small"
          className={params.row.movementType === "IN" ? styles.chipIn : styles.chipOut}
        />
      ),
    },
    {
      field: "quantity",
      headerName: "Cantidad",
      width: 100,
      type: "number",
      align: "right",
      headerAlign: "right",
    },
    {
      field: "unitCost",
      headerName: "Costo unit.",
      width: 120,
      align: "right",
      headerAlign: "right",
      renderCell: (params) => <span>{formatCOP(params.row.unitCost)}</span>,
    },
    {
      field: "note",
      headerName: "Nota",
      flex: 1,
      minWidth: 160,
    },
    {
      field: "recordedBy",
      headerName: "Registrado por",
      width: 140,
    },
    {
      field: "timestamp",
      headerName: "Fecha",
      width: 120,
      renderCell: (params) => {
        if (!params.row.timestamp) return <span>—</span>;
        return <span>{new Date(params.row.timestamp).toLocaleDateString("es-CO")}</span>;
      },
    },
  ];

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
          Ajustes de inventario
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate(`${TIENDA_ROUTES.AJUSTES}/nuevo`)}
        >
          Nuevo ajuste
        </Button>
      </Stack>

      {isError && (
        <Alert severity="error" className={styles.error}>
          Error al cargar los ajustes. Intenta nuevamente.
        </Alert>
      )}

      <div className={styles.gridWrapper}>
        <DataGrid
          rows={data?.results ?? []}
          columns={columns}
          rowCount={data?.count ?? 0}
          loading={isLoading}
          pageSizeOptions={[10, 25, 50]}
          paginationModel={{ page, pageSize }}
          paginationMode="server"
          onPaginationModelChange={(model) => {
            setPage(model.page);
            setPageSize(model.pageSize);
          }}
          disableRowSelectionOnClick
          className={styles.grid}
          getRowId={(row) => row.id}
        />
      </div>
    </Box>
  );
}

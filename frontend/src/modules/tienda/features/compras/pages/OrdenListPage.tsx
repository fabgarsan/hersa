import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
import { Navigate } from "react-router-dom";

import { useTiendaRole } from "@modules/tienda/shared/hooks/useTiendaRole";
import { TIENDA_ROUTES } from "@modules/tienda/constants/routes";
import { useGetOrdenesQuery } from "../api/getOrdenesQuery";
import { OrdenStatusChip } from "../components/OrdenStatusChip";
import type { Orden } from "../types";
import styles from "./OrdenListPage.module.scss";

type EstadoFilter = "all" | "initiated" | "pending" | "partially_received" | "closed";

const FILTER_OPTIONS: { label: string; value: EstadoFilter }[] = [
  { label: "Todos", value: "all" },
  { label: "Iniciadas", value: "initiated" },
  { label: "Pendientes", value: "pending" },
  { label: "Parciales", value: "partially_received" },
  { label: "Cerradas", value: "closed" },
];

export default function OrdenListPage() {
  const { isAdmin, role } = useTiendaRole();
  const navigate = useNavigate();

  const [estadoFilter, setEstadoFilter] = useState<EstadoFilter>("all");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, isError } = useGetOrdenesQuery(
    { estado: estadoFilter !== "all" ? estadoFilter : undefined, page: page + 1, pageSize },
    role !== "none",
  );

  const handleFilterChange = useCallback((filter: EstadoFilter) => {
    setEstadoFilter(filter);
    setPage(0);
  }, []);

  if (role === "none") {
    return <Navigate to="/tienda" replace />;
  }

  const columns: GridColDef<Orden>[] = [
    {
      field: "id",
      headerName: "Orden #",
      flex: 1,
      minWidth: 160,
      renderCell: (params) => <span className={styles.idCell}>{params.row.id}</span>,
    },
    {
      field: "supplier",
      headerName: "Proveedor",
      flex: 1,
      minWidth: 140,
      renderCell: (params) => <span>{params.row.supplier ?? "—"}</span>,
    },
    {
      field: "status",
      headerName: "Estado",
      width: 130,
      renderCell: (params) => <OrdenStatusChip status={params.row.status} />,
    },
    {
      field: "orderDate",
      headerName: "Fecha",
      width: 120,
      renderCell: (params) => {
        const val = params.row.orderDate;
        if (!val) return <span>—</span>;
        const [yyyy, mm, dd] = val.split("-");
        return <span>{`${dd}/${mm}/${yyyy}`}</span>;
      },
    },
    {
      field: "actions",
      headerName: "Acciones",
      width: 110,
      sortable: false,
      renderCell: (params) => (
        <Button
          size="small"
          variant="outlined"
          onClick={() => navigate(`${TIENDA_ROUTES.ORDENES}/${params.row.id}`)}
        >
          Ver
        </Button>
      ),
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
          Órdenes de compra
        </Typography>
        {isAdmin && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate(`${TIENDA_ROUTES.ORDENES}/nueva`)}
          >
            Nueva Orden
          </Button>
        )}
      </Stack>

      <Stack direction="row" spacing={1} className={styles.filters} flexWrap="wrap">
        {FILTER_OPTIONS.map((opt) => (
          <Chip
            key={opt.value}
            label={opt.label}
            onClick={() => handleFilterChange(opt.value)}
            color={estadoFilter === opt.value ? "primary" : "default"}
            variant={estadoFilter === opt.value ? "filled" : "outlined"}
          />
        ))}
      </Stack>

      {isError && (
        <Alert severity="error" className={styles.error}>
          Error al cargar las órdenes. Intenta nuevamente.
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
        />
      </div>
    </Box>
  );
}

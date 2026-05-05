import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import type { GridRenderCellParams } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";

import { useTiendaRole } from "@modules/tienda/shared/hooks/useTiendaRole";
import { TIENDA_ROUTES } from "@modules/tienda/constants/routes";
import { fetchOrdenes } from "../api/getOrdenesQuery";
import { OrdenStatusChip } from "../components/OrdenStatusChip";
import { DataTable } from "@shared/components/DataTable";
import type { DataTableColumn } from "@shared/components/DataTable";
import { PageHeader } from "@shared/components";
import { useDrfAdapter } from "@shared/hooks";
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

function buildColumns(navigate: ReturnType<typeof useNavigate>): DataTableColumn<Orden>[] {
  return [
    {
      field: "id",
      headerName: "Orden #",
      flex: 1,
      minWidth: 160,
      renderCell: (params: GridRenderCellParams<Orden, string>) => (
        <span className={styles.idCell}>{params.value}</span>
      ),
    },
    {
      field: "supplier",
      headerName: "Proveedor",
      flex: 1,
      minWidth: 140,
      renderCell: (params: GridRenderCellParams<Orden, string | null>) => (
        <span>{params.value ?? "—"}</span>
      ),
    },
    {
      field: "status",
      headerName: "Estado",
      width: 130,
      renderCell: (params: GridRenderCellParams<Orden>) => (
        <OrdenStatusChip status={params.row.status} />
      ),
    },
    {
      field: "orderDate",
      headerName: "Fecha",
      width: 120,
      renderCell: (params: GridRenderCellParams<Orden, string | null>) => {
        const val = params.value;
        if (!val) return <span>—</span>;
        const [yyyy, mm, dd] = val.split("-");
        return <span>{`${dd}/${mm}/${yyyy}`}</span>;
      },
    },
    {
      field: "createdAt",
      headerName: "Acciones",
      width: 110,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<Orden>) => (
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
}

export default function OrdenListPage() {
  const { isAdmin, role } = useTiendaRole();
  const navigate = useNavigate();

  const [estadoFilter, setEstadoFilter] = useState<EstadoFilter>("all");

  const adapter = useDrfAdapter<Orden>({
    queryFn: (params) =>
      fetchOrdenes({
        page: params.page,
        pageSize: params.pageSize,
        estado: estadoFilter !== "all" ? estadoFilter : undefined,
      }),
    queryKey: ["tienda", "ordenes", { estado: estadoFilter }],
  });

  if (role === "none") {
    return <Navigate to="/tienda" replace />;
  }

  const handleFilterChange = (filter: EstadoFilter) => {
    adapter.onPageChange(0);
    setEstadoFilter(filter);
  };

  return (
    <Box className={styles.root}>
      <PageHeader
        title="Órdenes de compra"
        breadcrumbs={[{ label: "Tienda", href: "/tienda" }, { label: "Órdenes de compra" }]}
      />

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

      <DataTable<Orden>
        tableId="tienda-ordenes"
        columns={buildColumns(navigate)}
        adapter={adapter}
        searchMode="client"
        toolbarActions={
          isAdmin ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate(`${TIENDA_ROUTES.ORDENES}/nueva`)}
            >
              Nueva Orden
            </Button>
          ) : undefined
        }
      />
    </Box>
  );
}

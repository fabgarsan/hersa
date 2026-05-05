import { Navigate, useNavigate } from "react-router-dom";
import type { GridRenderCellParams } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";

import { useTiendaRole } from "@modules/tienda/shared/hooks/useTiendaRole";
import { TIENDA_ROUTES } from "@modules/tienda/constants/routes";
import { formatCOP } from "@modules/tienda/features/jornada/helpers/formatCOP";
import { fetchAjustes } from "../api/getAjustesQuery";
import { DataTable } from "@shared/components/DataTable";
import type { DataTableColumn } from "@shared/components/DataTable";
import { PageHeader } from "@shared/components";
import { useDrfAdapter } from "@shared/hooks";
import type { InventoryMovement } from "../types";
import styles from "./AjusteListPage.module.scss";

const COLUMNS: DataTableColumn<InventoryMovement>[] = [
  {
    field: "product",
    headerName: "Producto",
    flex: 1,
    minWidth: 160,
    sortable: false,
    renderCell: (params: GridRenderCellParams<InventoryMovement>) => (
      <span>{params.row.product.name}</span>
    ),
  },
  {
    field: "location",
    headerName: "Ubicación",
    width: 120,
    renderCell: (params: GridRenderCellParams<InventoryMovement, string>) => (
      <span title={params.value}>{params.value?.slice(0, 8)}…</span>
    ),
  },
  {
    field: "movementType",
    headerName: "Tipo",
    width: 100,
    renderCell: (params: GridRenderCellParams<InventoryMovement, string>) => (
      <Chip
        label={params.value === "IN" ? "Entrada" : "Salida"}
        size="small"
        className={params.value === "IN" ? styles.chipIn : styles.chipOut}
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
    renderCell: (params: GridRenderCellParams<InventoryMovement, string>) => (
      <span>{formatCOP(params.value ?? "0")}</span>
    ),
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
    renderCell: (params: GridRenderCellParams<InventoryMovement, string>) => {
      if (!params.value) return <span>—</span>;
      return <span>{new Date(params.value).toLocaleDateString("es-CO")}</span>;
    },
  },
];

export default function AjusteListPage() {
  const { isAdmin } = useTiendaRole();
  const navigate = useNavigate();

  const adapter = useDrfAdapter<InventoryMovement>({
    queryFn: (params) => fetchAjustes({ page: params.page, pageSize: params.pageSize }),
    queryKey: ["tienda", "ajustes"],
  });

  if (!isAdmin) {
    return <Navigate to="/tienda" replace />;
  }

  return (
    <Box className={styles.root}>
      <PageHeader
        title="Ajustes de inventario"
        breadcrumbs={[{ label: "Tienda", href: "/tienda" }, { label: "Ajustes de inventario" }]}
      />

      <DataTable<InventoryMovement>
        tableId="tienda-ajustes"
        columns={COLUMNS}
        adapter={adapter}
        searchMode="client"
        toolbarActions={
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate(`${TIENDA_ROUTES.AJUSTES}/nuevo`)}
          >
            Nuevo ajuste
          </Button>
        }
      />
    </Box>
  );
}

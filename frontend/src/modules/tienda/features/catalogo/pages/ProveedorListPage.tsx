import type { GridRenderCellParams } from "@mui/x-data-grid";
import { useNavigate, Navigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";

import { useTiendaRole } from "@modules/tienda/shared/hooks/useTiendaRole";
import { DataTable } from "@shared/components/DataTable";
import type { DataTableColumn } from "@shared/components/DataTable";
import { PageHeader } from "@shared/components";
import { useDrfAdapter } from "@shared/hooks";
import { fetchProveedores } from "../api/getProveedoresQuery";
import type { Supplier } from "../types";
import styles from "./ProveedorListPage.module.scss";

function buildColumns(
  isAdmin: boolean,
  navigate: ReturnType<typeof useNavigate>,
): DataTableColumn<Supplier>[] {
  const columns: DataTableColumn<Supplier>[] = [
    { field: "name", headerName: "Nombre", flex: 2, minWidth: 160 },
    { field: "contact", headerName: "Contacto", flex: 2, minWidth: 160 },
  ];

  if (isAdmin) {
    columns.push({
      field: "id",
      headerName: "Acciones",
      width: 90,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<Supplier, string>) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Editar">
            <IconButton
              size="small"
              onClick={() => navigate(`/tienda/proveedores/${params.value}/editar`)}
              aria-label="Editar proveedor"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    });
  }

  return columns;
}

export default function ProveedorListPage() {
  const { isAdmin, role } = useTiendaRole();
  const navigate = useNavigate();

  const adapter = useDrfAdapter<Supplier>({
    queryFn: fetchProveedores,
    queryKey: ["tienda", "proveedores"],
  });

  if (role === "none") {
    return <Navigate to="/tienda" replace />;
  }

  return (
    <Box className={styles.root}>
      <PageHeader
        title="Proveedores"
        breadcrumbs={[{ label: "Tienda", href: "/tienda" }, { label: "Proveedores" }]}
      />

      <DataTable<Supplier>
        tableId="tienda-proveedores"
        columns={buildColumns(isAdmin, navigate)}
        adapter={adapter}
        toolbarActions={
          isAdmin ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate("/tienda/proveedores/nuevo")}
            >
              Nuevo Proveedor
            </Button>
          ) : undefined
        }
      />
    </Box>
  );
}

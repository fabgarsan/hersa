import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import type { GridRenderCellParams } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";

import { useTiendaRole } from "@modules/tienda/shared/hooks/useTiendaRole";
import { fetchProductos } from "../api/getProductosQuery";
import { DataTable } from "@shared/components/DataTable";
import type { DataTableColumn } from "@shared/components/DataTable";
import { PageHeader } from "@shared/components";
import { useDrfAdapter } from "@shared/hooks";
import type { Product } from "../types";
import styles from "./ProductoListPage.module.scss";

type ActiveFilter = "all" | "active" | "inactive";

function buildColumns(
  isAdmin: boolean,
  navigate: ReturnType<typeof useNavigate>,
): DataTableColumn<Product>[] {
  const columns: DataTableColumn<Product>[] = [
    { field: "name", headerName: "Nombre", flex: 2, minWidth: 160 },
    {
      field: "isActive",
      headerName: "Estado",
      width: 100,
      renderCell: (params: GridRenderCellParams<Product, boolean>) =>
        params.value ? (
          <Chip label="Activo" color="success" size="small" />
        ) : (
          <Chip label="Inactivo" color="default" size="small" />
        ),
    },
    {
      field: "id",
      headerName: "Acciones",
      width: 110,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<Product, string>) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Ver detalle">
            <IconButton
              size="small"
              onClick={() => navigate(`/tienda/productos/${params.value}`)}
              aria-label="Ver detalle"
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar">
            <IconButton
              size="small"
              onClick={() => navigate(`/tienda/productos/${params.value}/editar`)}
              aria-label="Editar producto"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  if (isAdmin) {
    columns.splice(1, 0, {
      field: "salePrice",
      headerName: "Precio Venta",
      width: 140,
      type: "number",
      align: "right",
      headerAlign: "right",
      valueFormatter: (value: string) =>
        value != null
          ? `$${parseFloat(value).toLocaleString("es-CO", { minimumFractionDigits: 2 })}`
          : "",
    });
  }

  return columns;
}

export default function ProductoListPage() {
  const { isAdmin, role } = useTiendaRole();
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
  const activoParam =
    activeFilter === "active" ? true : activeFilter === "inactive" ? false : undefined;

  const adapter = useDrfAdapter<Product>({
    queryFn: (params) =>
      fetchProductos({
        page: params.page,
        pageSize: params.pageSize,
        activo: isAdmin ? activoParam : undefined,
      }),
    queryKey: ["tienda", "productos", { activo: activoParam }],
  });

  if (role === "none") {
    return <Navigate to="/tienda" replace />;
  }

  const handleFilterChange = (filter: ActiveFilter) => {
    adapter.onPageChange(0);
    setActiveFilter(filter);
  };

  return (
    <Box className={styles.root}>
      <PageHeader
        title="Productos"
        breadcrumbs={[{ label: "Tienda", href: "/tienda" }, { label: "Productos" }]}
      />

      {isAdmin && (
        <Stack direction="row" spacing={1} className={styles.filters}>
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
            color="default"
            variant={activeFilter === "inactive" ? "filled" : "outlined"}
          />
        </Stack>
      )}

      <DataTable<Product>
        tableId="tienda-productos"
        columns={buildColumns(isAdmin, navigate)}
        adapter={adapter}
        searchMode="client"
        toolbarActions={
          isAdmin ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate("/tienda/productos/nuevo")}
            >
              Nuevo Producto
            </Button>
          ) : undefined
        }
      />
    </Box>
  );
}

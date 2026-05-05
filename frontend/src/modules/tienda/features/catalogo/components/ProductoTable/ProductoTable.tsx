import { useNavigate } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";

import type { Product } from "../../types";
import type { ProductoTableProps } from "./types";
import styles from "./ProductoTable.module.scss";

function ActionsCell({ id }: { id: string }) {
  const navigate = useNavigate();
  return (
    <Stack direction="row" spacing={0.5}>
      <Tooltip title="Ver detalle">
        <IconButton
          size="small"
          onClick={() => navigate(`/tienda/productos/${id}`)}
          aria-label="Ver detalle"
        >
          <VisibilityIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Editar">
        <IconButton
          size="small"
          onClick={() => navigate(`/tienda/productos/${id}/editar`)}
          aria-label="Editar producto"
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

function buildColumns(isAdmin: boolean): GridColDef<Product>[] {
  const base: GridColDef<Product>[] = [
    {
      field: "name",
      headerName: "Nombre",
      flex: 2,
      minWidth: 160,
    },
    {
      field: "isActive",
      headerName: "Estado",
      width: 120,
      renderCell: (params: GridRenderCellParams<Product, boolean>) =>
        params.value ? (
          <Chip label="Activo" color="success" size="small" />
        ) : (
          <Chip label="Inactivo" color="default" size="small" />
        ),
    },
    {
      field: "actions",
      headerName: "Acciones",
      width: 110,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<Product>) => <ActionsCell id={params.row.id} />,
    },
  ];

  if (isAdmin) {
    base.splice(1, 0, {
      field: "salePrice",
      headerName: "Precio Venta",
      width: 140,
      type: "number",
      align: "right",
      headerAlign: "right",
      valueFormatter: (value: string) =>
        value !== undefined && value !== null
          ? `$${parseFloat(value).toLocaleString("es-CO", { minimumFractionDigits: 2 })}`
          : "",
    });
  }

  return base;
}

export function ProductoTable({
  productos,
  isLoading,
  isAdmin,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: ProductoTableProps) {
  const columns = buildColumns(isAdmin);

  return (
    <div className={styles.root}>
      <DataGrid
        rows={productos}
        columns={columns}
        loading={isLoading}
        rowCount={totalCount}
        paginationMode="server"
        paginationModel={{ page: page - 1, pageSize }}
        onPaginationModelChange={(model) => {
          if (model.page + 1 !== page) onPageChange(model.page + 1);
          if (model.pageSize !== pageSize) onPageSizeChange(model.pageSize);
        }}
        pageSizeOptions={[10, 25, 50]}
        disableRowSelectionOnClick
        autoHeight
        className={styles.grid}
        getRowId={(row) => row.id}
      />
    </div>
  );
}

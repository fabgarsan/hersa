import { useNavigate } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import EditIcon from "@mui/icons-material/Edit";

import type { Supplier } from "../../types";
import type { ProveedorTableProps } from "./types";
import styles from "./ProveedorTable.module.scss";

function ActionsCell({ id, isAdmin }: { id: string; isAdmin: boolean }) {
  const navigate = useNavigate();
  if (!isAdmin) return null;
  return (
    <Stack direction="row" spacing={0.5}>
      <Tooltip title="Editar">
        <IconButton
          size="small"
          onClick={() => navigate(`/tienda/proveedores/${id}/editar`)}
          aria-label="Editar proveedor"
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

function buildColumns(isAdmin: boolean): GridColDef<Supplier>[] {
  const columns: GridColDef<Supplier>[] = [
    {
      field: "name",
      headerName: "Nombre",
      flex: 2,
      minWidth: 160,
    },
    {
      field: "contact",
      headerName: "Contacto",
      flex: 2,
      minWidth: 160,
    },
  ];

  if (isAdmin) {
    columns.push({
      field: "actions",
      headerName: "Acciones",
      width: 90,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<Supplier>) => (
        <ActionsCell id={params.row.id} isAdmin={isAdmin} />
      ),
    });
  }

  return columns;
}

export function ProveedorTable({
  proveedores,
  isLoading,
  isAdmin,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: ProveedorTableProps) {
  const columns = buildColumns(isAdmin);

  return (
    <div className={styles.root}>
      <DataGrid
        rows={proveedores}
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

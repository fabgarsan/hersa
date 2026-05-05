import { Navigate, useNavigate } from "react-router-dom";
import type { GridRenderCellParams } from "@mui/x-data-grid";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";

import { useTiendaRole } from "@modules/tienda/shared/hooks/useTiendaRole";
import { TIENDA_ROUTES } from "@modules/tienda/constants/routes";
import { fetchJornadas } from "../api/getJornadasQuery";
import { JornadaStatusChip } from "../components/JornadaStatusChip";
import { DataTable } from "@shared/components/DataTable";
import type { DataTableColumn } from "@shared/components/DataTable";
import { PageHeader } from "@shared/components";
import { useDrfAdapter } from "@shared/hooks";
import type { Jornada } from "../types";
import styles from "./JornadaListPage.module.scss";

function buildColumns(
  isAdmin: boolean,
  navigate: ReturnType<typeof useNavigate>,
): DataTableColumn<Jornada>[] {
  const columns: DataTableColumn<Jornada>[] = [
    { field: "location", headerName: "Ubicación", flex: 1, minWidth: 140 },
    {
      field: "status",
      headerName: "Estado",
      width: 120,
      renderCell: (params: GridRenderCellParams<Jornada>) => (
        <JornadaStatusChip status={params.row.status} />
      ),
    },
    {
      field: "date",
      headerName: "Fecha",
      width: 120,
      renderCell: (params: GridRenderCellParams<Jornada, string>) => {
        const val = params.value;
        if (!val) return <span>—</span>;
        const [yyyy, mm, dd] = val.split("-");
        return <span>{`${dd}/${mm}/${yyyy}`}</span>;
      },
    },
    {
      field: "createdAt",
      headerName: "Apertura",
      width: 180,
      renderCell: (params: GridRenderCellParams<Jornada, string>) => (
        <span>{params.value ? new Date(params.value).toLocaleString("es-CO") : "—"}</span>
      ),
    },
    {
      field: "closedAt",
      headerName: "Cierre",
      width: 180,
      renderCell: (params: GridRenderCellParams<Jornada, string | null>) => {
        const val = params.value;
        if (!val) return <span>—</span>;
        return <span>{new Date(val).toLocaleString("es-CO")}</span>;
      },
    },
    {
      field: "cashAlert",
      headerName: "Alerta caja",
      width: 110,
      renderCell: (params: GridRenderCellParams<Jornada, string | null | undefined>) => {
        const val = params.value;
        if (!val) return null;
        return (
          <Tooltip title={val}>
            <WarningAmberIcon fontSize="small" className={styles.alertIcon} />
          </Tooltip>
        );
      },
    },
  ];

  if (isAdmin) {
    columns.push({
      field: "id",
      headerName: "Acciones",
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<Jornada, string>) => (
        <Button
          size="small"
          variant="outlined"
          onClick={() => navigate(`${TIENDA_ROUTES.JORNADAS}/${params.value}`)}
        >
          Ver
        </Button>
      ),
    });
  }

  return columns;
}

export default function JornadaListPage() {
  const { isAdmin, role } = useTiendaRole();
  const navigate = useNavigate();

  const adapter = useDrfAdapter<Jornada>({
    queryFn: (params) => fetchJornadas({ page: params.page, pageSize: params.pageSize }),
    queryKey: ["tienda", "jornadas"],
  });

  if (role === "none") {
    return <Navigate to="/tienda" replace />;
  }

  return (
    <Box className={styles.root}>
      <PageHeader
        title="Jornadas de venta"
        breadcrumbs={[{ label: "Tienda", href: "/tienda" }, { label: "Jornadas de venta" }]}
      />

      <DataTable<Jornada>
        tableId="tienda-jornadas"
        columns={buildColumns(isAdmin, navigate)}
        adapter={adapter}
        searchMode="client"
      />
    </Box>
  );
}

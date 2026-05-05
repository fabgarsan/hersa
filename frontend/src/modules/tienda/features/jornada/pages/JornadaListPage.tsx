import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";

import { useTiendaRole } from "@modules/tienda/shared/hooks/useTiendaRole";
import { TIENDA_ROUTES } from "@modules/tienda/constants/routes";
import { useGetJornadasQuery } from "../api/getJornadasQuery";
import { JornadaStatusChip } from "../components/JornadaStatusChip";
import type { Jornada } from "../types";
import styles from "./JornadaListPage.module.scss";

export default function JornadaListPage() {
  const { isAdmin, role } = useTiendaRole();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, isError } = useGetJornadasQuery({
    page: page + 1,
    pageSize,
  });

  if (role === "none") {
    return <Navigate to="/tienda" replace />;
  }

  const columns: GridColDef<Jornada>[] = [
    {
      field: "location",
      headerName: "Ubicación",
      flex: 1,
      minWidth: 140,
    },
    {
      field: "status",
      headerName: "Estado",
      width: 120,
      renderCell: (params) => <JornadaStatusChip status={params.row.status} />,
    },
    {
      field: "date",
      headerName: "Fecha",
      width: 120,
      renderCell: (params) => {
        const val = params.value as string;
        if (!val) return <span>—</span>;
        const [yyyy, mm, dd] = val.split("-");
        return <span>{`${dd}/${mm}/${yyyy}`}</span>;
      },
    },
    {
      field: "createdAt",
      headerName: "Apertura",
      width: 180,
      renderCell: (params) => (
        <span>{new Date(params.value as string).toLocaleString("es-CO")}</span>
      ),
    },
    {
      field: "closedAt",
      headerName: "Cierre",
      width: 180,
      renderCell: (params) => {
        const val = params.value as string | null;
        if (!val) return <span>—</span>;
        return <span>{new Date(val).toLocaleString("es-CO")}</span>;
      },
    },
    {
      field: "cashAlert",
      headerName: "Alerta caja",
      width: 110,
      renderCell: (params) => {
        const val = params.value as string | null | undefined;
        if (!val) return null;
        return (
          <Tooltip title={val}>
            <WarningAmberIcon fontSize="small" className={styles.alertIcon} />
          </Tooltip>
        );
      },
    },
    ...(isAdmin
      ? [
          {
            field: "actions",
            headerName: "Acciones",
            width: 100,
            sortable: false,
            renderCell: (params: { row: Jornada }) => (
              <Button
                size="small"
                variant="outlined"
                onClick={() => navigate(`${TIENDA_ROUTES.JORNADAS}/${params.row.id}`)}
              >
                Ver
              </Button>
            ),
          } as GridColDef<Jornada>,
        ]
      : []),
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
          Jornadas de venta
        </Typography>
      </Stack>

      {isError && (
        <Alert severity="error" className={styles.error}>
          Error al cargar las jornadas. Intenta nuevamente.
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
          onRowClick={
            isAdmin ? (params) => navigate(`${TIENDA_ROUTES.JORNADAS}/${params.row.id}`) : undefined
          }
          disableRowSelectionOnClick
          className={styles.grid}
        />
      </div>
    </Box>
  );
}

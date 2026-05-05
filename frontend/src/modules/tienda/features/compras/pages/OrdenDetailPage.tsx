import { useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import LockIcon from "@mui/icons-material/Lock";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { isAxiosError } from "axios";
import { isNetworkError } from "@api/offlineMutationEvents";

import { ErrorState, LoadingState, PageHeader } from "@shared/components";
import { useTiendaRole } from "@modules/tienda/shared/hooks/useTiendaRole";
import { TIENDA_ROUTES } from "@modules/tienda/constants/routes";
import { useGetOrdenQuery } from "../api/getOrdenQuery";
import { useConfirmarOrdenMutation } from "../api/confirmarOrdenMutation";
import { useCerrarOrdenMutation } from "../api/cerrarOrdenMutation";
import { OrdenStatusChip } from "../components/OrdenStatusChip";
import { RecepcionRow } from "../components/RecepcionRow";
import { OrdenCloseDialog } from "../components/OrdenCloseDialog";
import type { CerrarOrden422Response, DiscrepanciaItem } from "../types";
import styles from "./OrdenDetailPage.module.scss";

function isCerrarOrden422(data: unknown): data is CerrarOrden422Response {
  return (
    typeof data === "object" &&
    data !== null &&
    "discrepancias" in data &&
    Array.isArray((data as Record<string, unknown>).discrepancias)
  );
}

export default function OrdenDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin, role } = useTiendaRole();
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [discrepancias, setDiscrepancias] = useState<DiscrepanciaItem[]>([]);
  const [umbral, setUmbral] = useState(0.05);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  const { data: orden, isLoading, isError } = useGetOrdenQuery(id);
  const { mutate: confirmar, isPending: isConfirming } = useConfirmarOrdenMutation();
  const { mutate: cerrar, isPending: isCerrando } = useCerrarOrdenMutation();

  if (role === "none") {
    return <Navigate to="/tienda" replace />;
  }

  if (!id) {
    return <Navigate to={TIENDA_ROUTES.ORDENES} replace />;
  }

  if (isLoading) {
    return <LoadingState variant="skeleton" rows={2} />;
  }

  if (isError || !orden) {
    return <ErrorState title="Error al cargar la orden" description="Intenta nuevamente." />;
  }

  const handleConfirmar = () => {
    confirmar(id, {
      onSuccess: () => {
        setSnackbarMessage("Orden confirmada correctamente");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      },
      onError: (err) => {
        if (isNetworkError(err)) return;
        setSnackbarMessage("Error al confirmar la orden");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      },
    });
  };

  const handleCerrar = () => {
    cerrar(
      { id, closingJustification: null },
      {
        onSuccess: () => {
          setSnackbarMessage("Orden cerrada correctamente");
          setSnackbarSeverity("success");
          setSnackbarOpen(true);
        },
        onError: (err) => {
          if (isNetworkError(err)) return;
          if (
            isAxiosError(err) &&
            err.response?.status === 422 &&
            isCerrarOrden422(err.response.data)
          ) {
            const resp = err.response.data;
            setDiscrepancias(resp.discrepancias);
            setUmbral(resp.umbral);
            setCloseDialogOpen(true);
          } else {
            setSnackbarMessage("Error al cerrar la orden");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
          }
        },
      },
    );
  };

  const isInProgress = orden.status === "pending" || orden.status === "partially_received";

  return (
    <Box className={styles.root}>
      <PageHeader
        title={`Orden ${id?.slice(0, 8)}…`}
        breadcrumbs={[
          { label: "Tienda", href: "/tienda" },
          { label: "Órdenes", href: "/tienda/ordenes" },
          { label: `Orden ${id?.slice(0, 8)}…` },
        ]}
        actions={
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {orden.status === "initiated" && isAdmin && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => navigate(`${TIENDA_ROUTES.ORDENES}/${id}/editar`)}
                >
                  Editar
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={
                    isConfirming ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <CheckCircleIcon />
                    )
                  }
                  onClick={handleConfirmar}
                  disabled={isConfirming}
                >
                  {isConfirming ? "Confirmando..." : "Confirmar Orden"}
                </Button>
              </>
            )}
            {isInProgress && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<ReceiptLongIcon />}
                onClick={() => navigate(`${TIENDA_ROUTES.ORDENES}/${id}/recepcionar`)}
              >
                Recepcionar
              </Button>
            )}
            {isInProgress && isAdmin && (
              <Button
                variant="outlined"
                color="error"
                startIcon={
                  isCerrando ? <CircularProgress size={20} color="inherit" /> : <LockIcon />
                }
                onClick={handleCerrar}
                disabled={isCerrando}
              >
                {isCerrando ? "Cerrando..." : "Cerrar Orden"}
              </Button>
            )}
          </Stack>
        }
      />

      <Card elevation={0} className={styles.card}>
        <CardContent>
          <Stack spacing={1}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body2" className={styles.fieldLabel}>
                Estado:
              </Typography>
              <OrdenStatusChip status={orden.status} size="medium" />
            </Stack>
            <Stack direction="row" spacing={2}>
              <Typography variant="body2" className={styles.fieldLabel}>
                Proveedor:
              </Typography>
              <Typography variant="body2">{orden.supplier ?? "—"}</Typography>
            </Stack>
            {orden.orderDate && (
              <Stack direction="row" spacing={2}>
                <Typography variant="body2" className={styles.fieldLabel}>
                  Fecha:
                </Typography>
                <Typography variant="body2">
                  {(() => {
                    const [yyyy, mm, dd] = orden.orderDate!.split("-");
                    return `${dd}/${mm}/${yyyy}`;
                  })()}
                </Typography>
              </Stack>
            )}
            {orden.notes && (
              <Stack direction="row" spacing={2}>
                <Typography variant="body2" className={styles.fieldLabel}>
                  Notas:
                </Typography>
                <Typography variant="body2">{orden.notes}</Typography>
              </Stack>
            )}
            <Stack direction="row" spacing={2}>
              <Typography variant="body2" className={styles.fieldLabel}>
                Creado:
              </Typography>
              <Typography variant="body2">
                {new Date(orden.createdAt).toLocaleDateString("es-CO")}
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Divider className={styles.divider} />

      <Typography variant="h6" className={styles.sectionTitle}>
        Líneas de la orden
      </Typography>

      <div className={styles.tableWrapper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Producto</TableCell>
              <TableCell align="right">Cant. pedida</TableCell>
              <TableCell align="right">Cant. recibida</TableCell>
              <TableCell>Estado</TableCell>
              {isAdmin && <TableCell align="right">Precio unitario</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {orden.orderLines.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 5 : 4} align="center" className={styles.emptyCell}>
                  Sin líneas registradas
                </TableCell>
              </TableRow>
            ) : (
              orden.orderLines.map((linea) => (
                <RecepcionRow key={linea.id} linea={linea} productoNombre={linea.product} />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <OrdenCloseDialog
        open={closeDialogOpen}
        discrepancias={discrepancias}
        umbral={umbral}
        ordenId={id}
        onClose={() => setCloseDialogOpen(false)}
        onSuccess={() => {
          setCloseDialogOpen(false);
          setSnackbarMessage("Orden cerrada con justificación");
          setSnackbarSeverity("success");
          setSnackbarOpen(true);
        }}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: isMdUp ? "right" : "center",
        }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} variant="filled">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import LockIcon from "@mui/icons-material/Lock";

import { isNetworkError } from "@api/offlineMutationEvents";
import { LoadingState, PageHeader } from "@shared/components";
import { useTiendaRole } from "@modules/tienda/shared/hooks/useTiendaRole";
import { TIENDA_ROUTES } from "@modules/tienda/constants/routes";
import { useResumenCierreMutation } from "../api/resumenCierreMutation";
import { useCerrarJornadaMutation } from "../api/cerrarJornadaMutation";
import { useCierreDraft } from "../hooks/useCierreDraft";
import { CierreProgressBar } from "../components/CierreProgressBar";
import { formatCOP } from "../helpers/formatCOP";
import type { CloseSummaryItem } from "../types";
import styles from "./CierreResumenPage.module.scss";

export default function CierreResumenPage() {
  const { id } = useParams<{ id: string }>();
  const { role, isAdmin } = useTiendaRole();
  const navigate = useNavigate();

  const { draft, clearDraft } = useCierreDraft(id ?? "");
  const { mutate: getResumen, isPending: isLoadingResumen } = useResumenCierreMutation();
  const { mutate: cerrar, isPending: isCerrando } = useCerrarJornadaMutation();

  const [resumen, setResumen] = useState<CloseSummaryItem[] | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !draft?.conteos?.length) return;
    getResumen(
      {
        jornadaId: id,
        items: draft.conteos.map((c) => ({
          product: c.productoId,
          finalCount: c.cantidadContada,
        })),
        cashDelivery: draft.totalEfectivoDeclarado,
      },
      {
        onSuccess: (data) => setResumen(data),
        onError: (err) => {
          if (isNetworkError(err)) return;
          setSubmitError("Error al cargar el resumen de cierre.");
        },
      },
    );
    // Run once on mount to load the preview
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (role === "none") {
    return <Navigate to="/tienda" replace />;
  }

  if (!id) {
    return <Navigate to={TIENDA_ROUTES.JORNADAS} replace />;
  }

  if (!draft?.conteos?.length) {
    return (
      <Box className={styles.root}>
        <Alert severity="warning">Completa el conteo y el efectivo antes de ver el resumen.</Alert>
      </Box>
    );
  }

  if (isLoadingResumen) {
    return <LoadingState variant="skeleton" rows={2} />;
  }

  const handleCerrar = () => {
    if (!draft) return;
    setSubmitError(null);
    cerrar(
      {
        jornadaId: id,
        items: draft.conteos.map((c) => ({
          product: c.productoId,
          finalCount: c.cantidadContada,
        })),
        cashDelivery: draft.totalEfectivoDeclarado,
      },
      {
        onSuccess: () => {
          clearDraft();
          navigate(isAdmin ? TIENDA_ROUTES.JORNADAS : TIENDA_ROUTES.VENDEDOR);
        },
        onError: (err) => {
          if (isNetworkError(err)) return;
          setSubmitError("Error al cerrar la jornada. Intenta nuevamente.");
        },
      },
    );
  };

  return (
    <Box className={styles.root}>
      <PageHeader
        title="Cierre — Resumen"
        breadcrumbs={[
          { label: "Tienda", href: "/tienda" },
          { label: "Jornadas", href: "/tienda/jornadas" },
          { label: `Jornada ${id?.slice(0, 8)}…`, href: `/tienda/jornadas/${id}` },
          { label: "Cierre — Resumen" },
        ]}
      />

      <CierreProgressBar step={3} />

      {submitError && (
        <Alert severity="error" className={styles.skeleton}>
          {submitError}
        </Alert>
      )}

      {isAdmin && draft && (
        <Box className={styles.monetarySummary}>
          <Stack spacing={1}>
            <Stack direction="row" spacing={2}>
              <Typography variant="body2" className={styles.summaryLabel}>
                Efectivo declarado:
              </Typography>
              <Typography variant="body2">
                {formatCOP(draft.totalEfectivoDeclarado || "0")}
              </Typography>
            </Stack>
          </Stack>
        </Box>
      )}

      {resumen && (
        <div className={styles.tableWrapper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Producto</TableCell>
                <TableCell align="right">Unid. trasladadas</TableCell>
                <TableCell align="right">Conteo final</TableCell>
                <TableCell align="right">Vendidas (est.)</TableCell>
                {isAdmin && <TableCell align="right">Ingresos (est.)</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {resumen.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 5 : 4} align="center">
                    Sin datos de cierre
                  </TableCell>
                </TableRow>
              ) : (
                resumen.map((item) => (
                  <TableRow key={item.product.id}>
                    <TableCell>{item.product.name}</TableCell>
                    <TableCell align="right">{item.transferredUnits}</TableCell>
                    <TableCell align="right">{item.currentPosStock}</TableCell>
                    <TableCell align="right">{item.impliedSoldUnits}</TableCell>
                    {isAdmin && (
                      <TableCell align="right">
                        {item.estimatedRevenue ? formatCOP(item.estimatedRevenue) : "—"}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Stack direction="row" justifyContent="flex-end">
        <Button
          variant="contained"
          color="primary"
          onClick={handleCerrar}
          disabled={isCerrando}
          startIcon={isCerrando ? <CircularProgress size={18} color="inherit" /> : <LockIcon />}
        >
          {isCerrando ? "Cerrando..." : "Cerrar Jornada"}
        </Button>
      </Stack>
    </Box>
  );
}

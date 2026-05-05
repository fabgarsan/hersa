import { Navigate, useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { ErrorState, LoadingState, PageHeader } from "@shared/components";
import { useTiendaRole } from "@modules/tienda/shared/hooks/useTiendaRole";
import { TIENDA_ROUTES } from "@modules/tienda/constants/routes";
import { useGetJornadaQuery } from "../api/getJornadaQuery";
import { JornadaStatusChip } from "../components/JornadaStatusChip";
import { AlertaCajaAlert } from "../components/AlertaCajaAlert";
import { formatCOP } from "../helpers/formatCOP";
import styles from "./JornadaDetailPage.module.scss";

export default function JornadaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isAdmin, role } = useTiendaRole();

  const { data: jornada, isLoading, isError } = useGetJornadaQuery(id, role !== "none");

  if (role === "none") {
    return <Navigate to="/tienda" replace />;
  }

  if (!id) {
    return <Navigate to={TIENDA_ROUTES.JORNADAS} replace />;
  }

  if (isLoading) {
    return <LoadingState variant="skeleton" rows={2} />;
  }

  if (isError || !jornada) {
    return <ErrorState title="Error al cargar la jornada" description="Intenta nuevamente." />;
  }

  return (
    <Box className={styles.root}>
      <PageHeader
        title={`Jornada ${id?.slice(0, 8)}…`}
        breadcrumbs={[
          { label: "Tienda", href: "/tienda" },
          { label: "Jornadas", href: "/tienda/jornadas" },
          { label: `Jornada ${id?.slice(0, 8)}…` },
        ]}
      />

      <AlertaCajaAlert cashAlert={jornada.cashAlert} />

      <Card elevation={0} className={styles.card}>
        <CardContent>
          <Stack spacing={1}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body2" className={styles.fieldLabel}>
                Estado:
              </Typography>
              <JornadaStatusChip status={jornada.status} size="medium" />
            </Stack>
            <Stack direction="row" spacing={2}>
              <Typography variant="body2" className={styles.fieldLabel}>
                Ubicación:
              </Typography>
              <Typography variant="body2">{jornada.location}</Typography>
            </Stack>
            <Stack direction="row" spacing={2}>
              <Typography variant="body2" className={styles.fieldLabel}>
                Fecha:
              </Typography>
              <Typography variant="body2">
                {(() => {
                  const [yyyy, mm, dd] = jornada.date.split("-");
                  return `${dd}/${mm}/${yyyy}`;
                })()}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={2}>
              <Typography variant="body2" className={styles.fieldLabel}>
                Apertura:
              </Typography>
              <Typography variant="body2">
                {new Date(jornada.createdAt).toLocaleString("es-CO")}
              </Typography>
            </Stack>
            {jornada.closedAt && (
              <Stack direction="row" spacing={2}>
                <Typography variant="body2" className={styles.fieldLabel}>
                  Cierre:
                </Typography>
                <Typography variant="body2">
                  {new Date(jornada.closedAt).toLocaleString("es-CO")}
                </Typography>
              </Stack>
            )}
            {jornada.closedBy && (
              <Stack direction="row" spacing={2}>
                <Typography variant="body2" className={styles.fieldLabel}>
                  Cerrado por:
                </Typography>
                <Typography variant="body2">{jornada.closedBy}</Typography>
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>

      {isAdmin && (
        <>
          <Divider className={styles.divider} />
          <Typography variant="h6" className={styles.sectionTitle}>
            Resumen monetario
          </Typography>
          <Box className={styles.monetarySection}>
            <Stack spacing={1}>
              <Stack direction="row" spacing={2}>
                <Typography variant="body2" className={styles.fieldLabel}>
                  Efectivo entregado:
                </Typography>
                <Typography variant="body2">{formatCOP(jornada.cashDelivery)}</Typography>
              </Stack>
              {jornada.cashOutAmount && parseFloat(jornada.cashOutAmount) > 0 && (
                <>
                  <Stack direction="row" spacing={2}>
                    <Typography variant="body2" className={styles.fieldLabel}>
                      Salida de caja:
                    </Typography>
                    <Typography variant="body2">{formatCOP(jornada.cashOutAmount)}</Typography>
                  </Stack>
                  {jornada.cashOutDescription && (
                    <Stack direction="row" spacing={2}>
                      <Typography variant="body2" className={styles.fieldLabel}>
                        Descripción:
                      </Typography>
                      <Typography variant="body2">{jornada.cashOutDescription}</Typography>
                    </Stack>
                  )}
                </>
              )}
              <Stack direction="row" spacing={2}>
                <Typography variant="body2" className={styles.fieldLabel}>
                  Total ventas:
                </Typography>
                <Typography variant="body2">{formatCOP(jornada.revenueTotal)}</Typography>
              </Stack>
            </Stack>
          </Box>
        </>
      )}
    </Box>
  );
}

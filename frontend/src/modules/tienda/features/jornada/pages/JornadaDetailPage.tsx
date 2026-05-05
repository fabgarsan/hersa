import { Navigate, useParams } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

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
    return (
      <Box className={styles.root}>
        <Skeleton variant="rectangular" height={120} className={styles.skeleton} />
        <Skeleton variant="rectangular" height={200} className={styles.skeleton} />
      </Box>
    );
  }

  if (isError || !jornada) {
    return (
      <Box className={styles.root}>
        <Alert severity="error">Error al cargar la jornada. Intenta nuevamente.</Alert>
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
          Detalle de jornada
        </Typography>
      </Stack>

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

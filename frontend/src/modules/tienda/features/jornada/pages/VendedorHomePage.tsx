import { Navigate, useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import InventoryIcon from "@mui/icons-material/Inventory";
import LockIcon from "@mui/icons-material/Lock";

import { useTiendaRole } from "@modules/tienda/shared/hooks/useTiendaRole";
import { TIENDA_ROUTES } from "@modules/tienda/constants/routes";
import { useGetJornadaAbiertaQuery } from "../api/getJornadaAbiertaQuery";
import { JornadaStatusChip } from "../components/JornadaStatusChip";
import styles from "./VendedorHomePage.module.scss";

export default function VendedorHomePage() {
  const { isAdmin, role } = useTiendaRole();
  const navigate = useNavigate();

  const { data: jornada, isLoading, isError } = useGetJornadaAbiertaQuery();

  if (isAdmin) {
    return <Navigate to={TIENDA_ROUTES.JORNADAS} replace />;
  }

  if (role === "none") {
    return <Navigate to="/tienda" replace />;
  }

  if (isLoading) {
    return (
      <Box className={styles.root}>
        <Skeleton variant="rectangular" height={40} className={styles.title} />
        <Skeleton variant="rectangular" height={160} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box className={styles.root}>
        <Alert severity="error">Error al cargar la jornada. Intenta nuevamente.</Alert>
      </Box>
    );
  }

  return (
    <Box className={styles.root}>
      <Typography variant="h5" className={styles.title}>
        Mi jornada
      </Typography>

      {!jornada ? (
        <Box className={styles.emptyState}>
          <Typography variant="body1" gutterBottom>
            No tienes una jornada abierta.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate(TIENDA_ROUTES.JORNADAS_NUEVA)}
          >
            Nueva Jornada
          </Button>
        </Box>
      ) : (
        <>
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
                    {new Date(jornada.date).toLocaleDateString("es-CO")}
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
              </Stack>
            </CardContent>
          </Card>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} className={styles.actions}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<SwapHorizIcon />}
              onClick={() => navigate(`${TIENDA_ROUTES.JORNADAS}/${jornada.id}/apertura`)}
            >
              Traslado
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<InventoryIcon />}
              onClick={() => navigate("/tienda/reposicion")}
            >
              Reposición
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<LockIcon />}
              onClick={() => navigate(`${TIENDA_ROUTES.JORNADAS}/${jornada.id}/cierre/conteo`)}
            >
              Cerrar Jornada
            </Button>
          </Stack>
        </>
      )}
    </Box>
  );
}

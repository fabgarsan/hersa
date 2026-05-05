import { Navigate } from "react-router-dom";
import { Controller } from "react-hook-form";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

import { MutationButton } from "@shared/components";
import { useTiendaRole } from "@modules/tienda/shared/hooks/useTiendaRole";
import { useProveedorForm } from "../hooks/useProveedorForm";
import styles from "./ProveedorFormPage.module.scss";

export default function ProveedorFormPage() {
  const { isAdmin } = useTiendaRole();
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  const {
    control,
    handleSubmit,
    isSubmitting,
    isEditMode,
    isLoadingProveedor,
    errorProveedor,
    snackbarOpen,
    snackbarMessage,
    snackbarSeverity,
    onCloseSnackbar,
    onSubmit,
  } = useProveedorForm();

  if (!isAdmin) {
    return <Navigate to="/tienda" replace />;
  }

  if (isEditMode && isLoadingProveedor) {
    return (
      <Box className={styles.root}>
        <Skeleton variant="rectangular" height={56} className={styles.skeleton} />
        <Skeleton variant="rectangular" height={56} className={styles.skeleton} />
      </Box>
    );
  }

  if (isEditMode && errorProveedor) {
    return (
      <Box className={styles.root}>
        <Alert severity="error">Error al cargar el proveedor. Intenta nuevamente.</Alert>
      </Box>
    );
  }

  return (
    <Box className={styles.root}>
      <Typography variant="h5" className={styles.title}>
        {isEditMode ? "Editar Proveedor" : "Nuevo Proveedor"}
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
        <Stack spacing={3}>
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Nombre"
                required
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                fullWidth
              />
            )}
          />

          <Controller
            name="contact"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Contacto"
                multiline
                rows={3}
                placeholder="Nombre de contacto, teléfono, notas..."
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                fullWidth
              />
            )}
          />

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <MutationButton
              isPending={isSubmitting}
              label={isEditMode ? "Guardar cambios" : "Crear proveedor"}
              pendingLabel={isEditMode ? "Guardando..." : "Creando..."}
            />
          </Stack>
        </Stack>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={onCloseSnackbar}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: isMdUp ? "right" : "center",
        }}
      >
        <Alert onClose={onCloseSnackbar} severity={snackbarSeverity} variant="filled">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

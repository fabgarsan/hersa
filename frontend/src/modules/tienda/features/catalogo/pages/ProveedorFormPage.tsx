import { Navigate } from "react-router-dom";
import { Controller } from "react-hook-form";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

import { ErrorState, LoadingState, MutationButton, PageHeader } from "@shared/components";
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
    return <LoadingState variant="skeleton" rows={2} />;
  }

  if (isEditMode && errorProveedor) {
    return <ErrorState title="Error al cargar el proveedor" description="Intenta nuevamente." />;
  }

  return (
    <Box className={styles.root}>
      <PageHeader
        title={isEditMode ? "Editar proveedor" : "Nuevo proveedor"}
        breadcrumbs={
          isEditMode
            ? [
                { label: "Tienda", href: "/tienda" },
                { label: "Proveedores", href: "/tienda/proveedores" },
                { label: "Editar proveedor" },
              ]
            : [
                { label: "Tienda", href: "/tienda" },
                { label: "Proveedores", href: "/tienda/proveedores" },
                { label: "Nuevo proveedor" },
              ]
        }
      />

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

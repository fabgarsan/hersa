import { Navigate } from "react-router-dom";
import { Controller } from "react-hook-form";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Skeleton from "@mui/material/Skeleton";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

import { MutationButton } from "@shared/components";
import { useTiendaRole } from "@modules/tienda/shared/hooks/useTiendaRole";
import { MonetaryInput } from "@modules/tienda/shared/components/MonetaryInput";
import { ReadOnlyBadge } from "@modules/tienda/shared/components/ReadOnlyBadge";
import { useProductoForm } from "../hooks/useProductoForm";
import styles from "./ProductoFormPage.module.scss";

export default function ProductoFormPage() {
  const { isAdmin } = useTiendaRole();
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  const {
    control,
    handleSubmit,
    isSubmitting,
    isEditMode,
    producto,
    isLoadingProducto,
    errorProducto,
    snackbarOpen,
    snackbarMessage,
    snackbarSeverity,
    onCloseSnackbar,
    onSubmit,
  } = useProductoForm();

  if (!isAdmin) {
    return <Navigate to="/tienda" replace />;
  }

  if (isEditMode && isLoadingProducto) {
    return (
      <Box className={styles.root}>
        <Skeleton variant="rectangular" height={56} className={styles.skeleton} />
        <Skeleton variant="rectangular" height={56} className={styles.skeleton} />
        <Skeleton variant="rectangular" height={56} className={styles.skeleton} />
      </Box>
    );
  }

  if (isEditMode && errorProducto) {
    return (
      <Box className={styles.root}>
        <Alert severity="error">Error al cargar el producto. Intenta nuevamente.</Alert>
      </Box>
    );
  }

  return (
    <Box className={styles.root}>
      <Typography variant="h5" className={styles.title}>
        {isEditMode ? "Editar Producto" : "Nuevo Producto"}
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
            name="description"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Descripción"
                multiline
                rows={3}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                fullWidth
              />
            )}
          />

          <MonetaryInput name="salePrice" control={control} label="Precio de venta" />

          {isEditMode && producto?.avgCost && (
            <ReadOnlyBadge label="Costo promedio" value={`$${producto.avgCost}`} />
          )}

          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch checked={field.value} onChange={field.onChange} />}
                label="Activo"
              />
            )}
          />

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <MutationButton
              isPending={isSubmitting}
              label={isEditMode ? "Guardar cambios" : "Crear producto"}
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

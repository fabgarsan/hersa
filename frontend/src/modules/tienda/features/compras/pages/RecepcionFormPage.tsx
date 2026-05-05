import { useParams, Navigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Controller } from "react-hook-form";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

import { ErrorState, LoadingState, MutationButton, PageHeader } from "@shared/components";
import { useTiendaRole } from "@modules/tienda/shared/hooks/useTiendaRole";
import { MonetaryInput } from "@modules/tienda/shared/components/MonetaryInput";
import { TIENDA_ROUTES } from "@modules/tienda/constants/routes";
import { useGetOrdenQuery } from "../api/getOrdenQuery";
import { useRecepcionForm } from "../hooks/useRecepcionForm";
import styles from "./RecepcionFormPage.module.scss";

export default function RecepcionFormPage() {
  const { id } = useParams<{ id: string }>();
  const { role } = useTiendaRole();
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  const { data: orden, isLoading: isLoadingOrden, isError } = useGetOrdenQuery(id);

  const {
    control,
    handleSubmit,
    isSubmitting,
    snackbarOpen,
    snackbarMessage,
    snackbarSeverity,
    onCloseSnackbar,
    onSubmit,
  } = useRecepcionForm();

  if (role === "none") {
    return <Navigate to="/tienda" replace />;
  }

  if (!id) {
    return <Navigate to={TIENDA_ROUTES.ORDENES} replace />;
  }

  if (isLoadingOrden) {
    return <LoadingState variant="skeleton" rows={3} />;
  }

  if (isError || !orden) {
    return <ErrorState title="Error al cargar la orden" description="Intenta nuevamente." />;
  }

  // Only lines that are not complete can be received
  const lineasPendientes = orden.orderLines.filter((l) => l.status !== "complete");

  if (lineasPendientes.length === 0) {
    return (
      <Box className={styles.root}>
        <Alert severity="info">
          Todas las líneas de esta orden ya están completas.{" "}
          <a href={`${TIENDA_ROUTES.ORDENES}/${id}`}>Volver a la orden</a>
        </Alert>
      </Box>
    );
  }

  return (
    <Box className={styles.root}>
      <PageHeader
        title="Recepcionar orden"
        breadcrumbs={[
          { label: "Tienda", href: "/tienda" },
          { label: "Órdenes", href: "/tienda/ordenes" },
          { label: `Orden ${id?.slice(0, 8)}…`, href: `/tienda/ordenes/${id}` },
          { label: "Recepcionar" },
        ]}
      />

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
        <Stack spacing={3}>
          <Controller
            name="orderLine"
            control={control}
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error} required>
                <InputLabel id="linea-label">Línea de orden</InputLabel>
                <Select {...field} labelId="linea-label" label="Línea de orden">
                  {lineasPendientes.map((l) => (
                    <MenuItem key={l.id} value={l.id}>
                      {l.product} — pedido: {l.orderedQuantity ?? "?"}, recibido:{" "}
                      {l.receivedQuantityCumulative}
                    </MenuItem>
                  ))}
                </Select>
                {fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
              </FormControl>
            )}
          />

          <Controller
            name="receivedQuantityGood"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Cantidad en buen estado"
                type="number"
                required
                fullWidth
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                slotProps={{ htmlInput: { min: 0, step: 1 } }}
              />
            )}
          />

          <Controller
            name="damagedQuantity"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Cantidad averiada"
                type="number"
                fullWidth
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                slotProps={{ htmlInput: { min: 0, step: 1 } }}
              />
            )}
          />

          <MonetaryInput name="realUnitCost" control={control} label="Costo unitario real" />

          <Typography variant="subtitle1" className={styles.sectionLabel}>
            Destino del inventario
          </Typography>

          <Controller
            name="ubicacionId"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="ID de ubicación destino"
                required
                fullWidth
                error={!!fieldState.error}
                helperText={
                  fieldState.error?.message ??
                  "Ingresa el UUID de la ubicación donde se almacenará la mercancía recibida en buen estado"
                }
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              />
            )}
          />

          <Controller
            name="cantidad"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Cantidad a destino"
                type="number"
                required
                fullWidth
                error={!!fieldState.error}
                helperText={
                  fieldState.error?.message ?? "Debe ser igual a la cantidad en buen estado"
                }
                slotProps={{ htmlInput: { min: 0, step: 1 } }}
              />
            )}
          />

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <MutationButton
              isPending={isSubmitting}
              label="Registrar recepción"
              pendingLabel="Registrando..."
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

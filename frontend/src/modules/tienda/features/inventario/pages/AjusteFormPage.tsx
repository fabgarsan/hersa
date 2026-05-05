import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import Alert from "@mui/material/Alert";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { MutationButton } from "@shared/components";
import { isNetworkError } from "@api/offlineMutationEvents";
import { useTiendaRole } from "@modules/tienda/shared/hooks/useTiendaRole";
import { TIENDA_ROUTES } from "@modules/tienda/constants/routes";
import { useGetProductosQuery } from "@modules/tienda/features/catalogo/api/getProductosQuery";
import type { Product } from "@modules/tienda/features/catalogo/types";
import { useCreateAjusteMutation } from "../api/createAjusteMutation";
import { ajusteSchema } from "../schemas";
import type { AjusteFormValues } from "../types";
import styles from "./AjusteFormPage.module.scss";

const MOVEMENT_OPTIONS = [
  { value: "IN", label: "Entrada" },
  { value: "OUT", label: "Salida" },
] as const;

export default function AjusteFormPage() {
  const { isAdmin } = useTiendaRole();
  const navigate = useNavigate();

  const [formError, setFormError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const { data: productosData, isLoading: isLoadingProductos } = useGetProductosQuery(
    { activo: true, pageSize: 200 },
    isAdmin,
  );

  const { mutate: createAjuste, isPending } = useCreateAjusteMutation();

  const { control, handleSubmit, setValue } = useForm<AjusteFormValues>({
    resolver: zodResolver(ajusteSchema),
    defaultValues: {
      product: "",
      location: "",
      movementType: "IN",
      quantity: 1,
      unitCost: "",
      note: "",
    },
  });

  if (!isAdmin) {
    return <Navigate to="/tienda" replace />;
  }

  function onSubmit(values: AjusteFormValues) {
    setFormError(null);
    createAjuste(values, {
      onSuccess: () => {
        setSnackbarOpen(true);
        setTimeout(() => navigate(TIENDA_ROUTES.AJUSTES), 1500);
      },
      onError: (err) => {
        if (isNetworkError(err)) return;
        if (isAxiosError(err) && err.response?.status === 400) {
          const data = err.response.data as Record<string, unknown>;
          const firstKey = Object.keys(data)[0];
          const msg = firstKey ? String(data[firstKey]) : "Error de validación. Revisa los campos.";
          setFormError(msg);
        } else {
          setFormError("Error al registrar el ajuste. Intenta nuevamente.");
        }
      },
    });
  }

  return (
    <Box className={styles.root}>
      <Typography variant="h5" className={styles.title}>
        Nuevo ajuste de inventario
      </Typography>

      {formError && (
        <Alert severity="error" className={styles.formError}>
          {formError}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
        <Stack spacing={3}>
          <Controller
            name="product"
            control={control}
            render={({ field, fieldState }) => (
              <Autocomplete
                options={productosData?.results ?? []}
                loading={isLoadingProductos}
                getOptionLabel={(option: Product) => option.name}
                isOptionEqualToValue={(option: Product, value: Product) => option.id === value.id}
                onChange={(_: React.SyntheticEvent, value: Product | null) => {
                  field.onChange(value?.id ?? "");
                  setValue("product", value?.id ?? "");
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Producto"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    required
                  />
                )}
              />
            )}
          />

          <Controller
            name="location"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="ID de Ubicación"
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                error={!!fieldState.error}
                helperText={
                  fieldState.error?.message ?? "UUID de la ubicación donde se realizará el ajuste"
                }
                fullWidth
                required
              />
            )}
          />

          <Controller
            name="movementType"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                select
                label="Tipo de movimiento"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                fullWidth
                required
              >
                {MOVEMENT_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <Controller
            name="quantity"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Cantidad"
                type="number"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                fullWidth
                required
                slotProps={{ htmlInput: { min: 1 } }}
                onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
              />
            )}
          />

          <Controller
            name="unitCost"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Costo unitario"
                type="number"
                error={!!fieldState.error}
                helperText={
                  fieldState.error?.message ??
                  "Para movimientos de entrada (IN), el costo no puede ser 0"
                }
                fullWidth
                required
                slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
              />
            )}
          />

          <Controller
            name="note"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Nota"
                multiline
                minRows={3}
                error={!!fieldState.error}
                helperText={
                  fieldState.error?.message ??
                  "Obligatorio — describe el motivo del ajuste (BR-015)"
                }
                fullWidth
                required
              />
            )}
          />

          <MutationButton
            isPending={isPending}
            label="Registrar ajuste"
            pendingLabel="Registrando..."
            fullWidth
          />
        </Stack>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success">
          Ajuste registrado
        </Alert>
      </Snackbar>
    </Box>
  );
}

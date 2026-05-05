import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Alert from "@mui/material/Alert";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

import { MutationButton } from "@shared/components";
import { isNetworkError } from "@api/offlineMutationEvents";
import { useTiendaRole } from "@modules/tienda/shared/hooks/useTiendaRole";
import { useGetProductosQuery } from "@modules/tienda/features/catalogo/api/getProductosQuery";
import { useGetJornadaAbiertaQuery } from "../api/getJornadaAbiertaQuery";
import { useReposicionMutation } from "../api/reposicionMutation";
import { reposicionSchema } from "../schemas";
import type { ReposicionFormValues } from "../types";
import styles from "./ReposicionPage.module.scss";

export default function ReposicionPage() {
  const { role } = useTiendaRole();
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  const { data: jornada, isLoading: isLoadingJornada } = useGetJornadaAbiertaQuery();
  const { data: productosData, isLoading: isLoadingProductos } = useGetProductosQuery({
    activo: true,
    pageSize: 200,
  });
  const { mutate: doReposicion, isPending } = useReposicionMutation();

  const { control, handleSubmit, reset } = useForm<ReposicionFormValues>({
    resolver: zodResolver(reposicionSchema),
    defaultValues: { product: "", quantity: "" },
  });

  if (role === "none") {
    return <Navigate to="/tienda" replace />;
  }

  if (isLoadingJornada || isLoadingProductos) {
    return (
      <Box className={styles.root}>
        <Skeleton variant="rectangular" height={56} className={styles.skeleton} />
        <Skeleton variant="rectangular" height={160} className={styles.skeleton} />
      </Box>
    );
  }

  if (!jornada) {
    return (
      <Box className={styles.root}>
        <Alert severity="info">
          No hay jornada abierta. Abre una jornada antes de realizar reposiciones.
        </Alert>
      </Box>
    );
  }

  const productos = productosData?.results ?? [];

  const onSubmit = (values: ReposicionFormValues) => {
    doReposicion(
      {
        jornadaId: jornada.id,
        items: [{ product: values.product, quantity: parseInt(values.quantity, 10) }],
      },
      {
        onSuccess: () => {
          setSnackbarMessage("Reposición registrada correctamente");
          setSnackbarSeverity("success");
          setSnackbarOpen(true);
          reset({ product: "", quantity: "" });
        },
        onError: (err) => {
          if (isNetworkError(err)) return;
          setSnackbarMessage("Error al registrar la reposición. Verifica el stock disponible.");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
        },
      },
    );
  };

  return (
    <Box className={styles.root}>
      <Typography variant="h5" className={styles.title}>
        Reposición de inventario
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
        <Stack spacing={3}>
          <Controller
            name="product"
            control={control}
            render={({ field: f, fieldState }) => (
              <Autocomplete
                options={productos}
                getOptionLabel={(opt) => opt.name}
                value={productos.find((p) => p.id === f.value) ?? null}
                onChange={(_, newValue) => f.onChange(newValue?.id ?? "")}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Producto"
                    required
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            )}
          />

          <Controller
            name="quantity"
            control={control}
            render={({ field: f, fieldState }) => (
              <TextField
                {...f}
                label="Cantidad"
                type="number"
                required
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                slotProps={{ htmlInput: { min: 1, step: 1 } }}
              />
            )}
          />

          <MutationButton
            isPending={isPending}
            label="Registrar reposición"
            pendingLabel="Registrando..."
            fullWidth
          />
        </Stack>
      </Box>

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

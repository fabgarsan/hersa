import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { MutationButton } from "@shared/components";
import { isNetworkError } from "@api/offlineMutationEvents";
import { useTiendaRole } from "@modules/tienda/shared/hooks/useTiendaRole";
import { TIENDA_ROUTES } from "@modules/tienda/constants/routes";
import { useCreateJornadaMutation } from "../api/createJornadaMutation";
import { jornadaOpenSchema } from "../schemas";
import type { JornadaOpenFormValues } from "../types";
import styles from "./JornadaOpenPage.module.scss";

export default function JornadaOpenPage() {
  const { role } = useTiendaRole();
  const navigate = useNavigate();
  const [conflictError, setConflictError] = useState<string | null>(null);

  const { mutate: createJornada, isPending } = useCreateJornadaMutation();

  const { control, handleSubmit } = useForm<JornadaOpenFormValues>({
    resolver: zodResolver(jornadaOpenSchema),
    defaultValues: { location: "", date: new Date().toISOString().slice(0, 10) },
  });

  if (role === "none") {
    return <Navigate to="/tienda" replace />;
  }

  const onSubmit = (values: JornadaOpenFormValues) => {
    setConflictError(null);
    createJornada(
      { location: values.location, date: values.date },
      {
        onSuccess: () => {
          navigate(TIENDA_ROUTES.VENDEDOR);
        },
        onError: (err) => {
          if (isNetworkError(err)) return;
          if (isAxiosError(err) && err.response?.status === 409) {
            setConflictError(
              "Ya existe una jornada abierta para esta ubicación. Ciérrala antes de abrir una nueva.",
            );
          } else {
            setConflictError("Error al abrir la jornada. Intenta nuevamente.");
          }
        },
      },
    );
  };

  return (
    <Box className={styles.root}>
      <Typography variant="h5" className={styles.title}>
        Nueva Jornada
      </Typography>

      {conflictError && (
        <Alert severity="error" className={styles.conflictAlert}>
          {conflictError}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
        <Stack spacing={3}>
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
                  fieldState.error?.message ??
                  "UUID de la ubicación POS donde se realizará la venta"
                }
                fullWidth
                required
              />
            )}
          />

          <Controller
            name="date"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Fecha de jornada"
                type="date"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                fullWidth
                required
                slotProps={{ inputLabel: { shrink: true } }}
              />
            )}
          />

          <MutationButton
            isPending={isPending}
            label="Abrir Jornada"
            pendingLabel="Abriendo..."
            fullWidth
          />
        </Stack>
      </Box>
    </Box>
  );
}

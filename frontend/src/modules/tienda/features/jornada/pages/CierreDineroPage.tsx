import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { useTiendaRole } from "@modules/tienda/shared/hooks/useTiendaRole";
import { TIENDA_ROUTES } from "@modules/tienda/constants/routes";
import { useCierreDraft } from "../hooks/useCierreDraft";
import { dineroSchema } from "../schemas";
import { formatCOP } from "../helpers/formatCOP";
import type { DineroFormValues } from "../types";
import { CierreProgressBar } from "../components/CierreProgressBar";
import styles from "./CierreDineroPage.module.scss";

const DENOMINACIONES = [100_000, 50_000, 20_000, 10_000, 5_000, 1_000, 500, 200, 100];

export default function CierreDineroPage() {
  const { id } = useParams<{ id: string }>();
  const { role } = useTiendaRole();
  const navigate = useNavigate();

  const { draft, saveDraft } = useCierreDraft(id ?? "");

  const { control, handleSubmit, watch } = useForm<DineroFormValues>({
    resolver: zodResolver(dineroSchema),
    defaultValues: {
      billetes: DENOMINACIONES.map((denom) => {
        const existing = draft?.billetes.find((b) => b.denominacion === denom);
        return { denominacion: denom, cantidad: existing ? String(existing.cantidad) : "" };
      }),
    },
  });

  const { fields } = useFieldArray({ control, name: "billetes" });
  const watchedBilletes = watch("billetes");

  if (role === "none") {
    return <Navigate to="/tienda" replace />;
  }

  if (!id) {
    return <Navigate to={TIENDA_ROUTES.JORNADAS} replace />;
  }

  if (!draft?.conteos?.length) {
    return (
      <Box className={styles.root}>
        <Alert severity="warning">Completa el conteo de productos primero.</Alert>
        <Button
          variant="outlined"
          onClick={() => navigate(`${TIENDA_ROUTES.JORNADAS}/${id}/cierre/conteo`)}
          className={styles.backButton}
        >
          Ir al conteo
        </Button>
      </Box>
    );
  }

  const totalEfectivo = watchedBilletes.reduce((sum, b) => {
    const cant = parseInt(b.cantidad || "0", 10);
    return sum + (isNaN(cant) ? 0 : b.denominacion * cant);
  }, 0);

  const onSubmit = (values: DineroFormValues) => {
    saveDraft({
      conteos: draft.conteos,
      billetes: values.billetes.map((b) => ({
        denominacion: b.denominacion,
        cantidad: parseInt(b.cantidad || "0", 10),
      })),
      totalEfectivoDeclarado: String(totalEfectivo),
    });
    navigate(`${TIENDA_ROUTES.JORNADAS}/${id}/cierre/resumen`);
  };

  return (
    <Box className={styles.root}>
      <Typography variant="h5" className={styles.title}>
        Cierre de jornada
      </Typography>

      <CierreProgressBar step={2} />

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={2}>
          {fields.map((field, index) => (
            <Stack key={field.id} direction="row" alignItems="center" spacing={2}>
              <Typography variant="body2" className={styles.denominationLabel}>
                {formatCOP(field.denominacion)}
              </Typography>
              <Controller
                name={`billetes.${index}.cantidad`}
                control={control}
                render={({ field: f, fieldState }) => (
                  <TextField
                    {...f}
                    label="Cantidad de billetes/monedas"
                    size="small"
                    type="number"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    slotProps={{ htmlInput: { min: 0, step: 1 } }}
                  />
                )}
              />
            </Stack>
          ))}

          <Divider />

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body1" className={styles.totalLabel}>
              Total efectivo declarado:
            </Typography>
            <Typography variant="h6" className={styles.totalRow}>
              {formatCOP(totalEfectivo)}
            </Typography>
          </Stack>

          <Stack direction="row" justifyContent="flex-end">
            <Button variant="contained" color="primary" type="submit">
              Siguiente
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}

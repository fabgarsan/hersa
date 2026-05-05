import { useEffect } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import TableCell from "@mui/material/TableCell";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { useTiendaRole } from "@modules/tienda/shared/hooks/useTiendaRole";
import { TIENDA_ROUTES } from "@modules/tienda/constants/routes";
import { InlineRowForm } from "@modules/tienda/shared/components/InlineRowForm";
import type { InlineRowFormColumn } from "@modules/tienda/shared/components/InlineRowForm/types";
import { useGetJornadaAbiertaQuery } from "../api/getJornadaAbiertaQuery";
import { useResumenCierreMutation } from "../api/resumenCierreMutation";
import { useCierreDraft } from "../hooks/useCierreDraft";
import { conteoSchema } from "../schemas";
import type { ConteoFormValues } from "../types";
import { CierreProgressBar } from "../components/CierreProgressBar";
import styles from "./CierreConteoPage.module.scss";

const COLUMNS: InlineRowFormColumn[] = [
  { key: "producto", label: "Producto" },
  { key: "stockInicial", label: "Stock inicial", width: 130 },
  { key: "cantidadContada", label: "Cantidad contada", width: 160 },
];

export default function CierreConteoPage() {
  const { id } = useParams<{ id: string }>();
  const { role } = useTiendaRole();
  const navigate = useNavigate();

  const { data: jornada, isLoading: isLoadingJornada } = useGetJornadaAbiertaQuery(role !== "none");
  const {
    mutate: getResumen,
    isPending: isLoadingResumen,
    data: resumenData,
  } = useResumenCierreMutation();

  const jornadaId = id ?? jornada?.id ?? "";
  const { saveDraft } = useCierreDraft(jornadaId);

  const { control, handleSubmit, reset } = useForm<ConteoFormValues>({
    resolver: zodResolver(conteoSchema),
    defaultValues: { conteos: [] },
  });

  const { fields } = useFieldArray({ control, name: "conteos" });

  // Load product list from resumen-cierre preview on mount
  useEffect(() => {
    if (!jornadaId) return;
    getResumen(
      { jornadaId, items: [], cashDelivery: "0" },
      {
        onSuccess: (items) => {
          reset({
            conteos: items.map((item) => ({
              productoId: item.product.id,
              productoNombre: item.product.name,
              stockInicial: item.transferredUnits,
              cantidadContada: "",
            })),
          });
        },
      },
    );
    // Only run on mount / when jornadaId is first available
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jornadaId]);

  if (role === "none") {
    return <Navigate to="/tienda" replace />;
  }

  if (!id) {
    return <Navigate to={TIENDA_ROUTES.JORNADAS} replace />;
  }

  if (isLoadingJornada || isLoadingResumen) {
    return (
      <Box className={styles.root}>
        <Skeleton variant="rectangular" height={40} className={styles.skeleton} />
        <Skeleton variant="rectangular" height={300} className={styles.skeleton} />
      </Box>
    );
  }

  if (!jornada && !resumenData) {
    return (
      <Box className={styles.root}>
        <Alert severity="info">No hay jornada abierta.</Alert>
      </Box>
    );
  }

  const onSubmit = (values: ConteoFormValues) => {
    saveDraft({
      conteos: values.conteos.map((c) => ({
        productoId: c.productoId,
        productoNombre: c.productoNombre,
        stockInicial: c.stockInicial,
        cantidadContada: parseInt(c.cantidadContada, 10),
      })),
      billetes: [],
      totalEfectivoDeclarado: "0",
    });
    navigate(`${TIENDA_ROUTES.JORNADAS}/${id}/cierre/dinero`);
  };

  return (
    <Box className={styles.root}>
      <Typography variant="h5" className={styles.title}>
        Cierre de jornada
      </Typography>

      <CierreProgressBar step={1} />

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
        <Stack spacing={3}>
          {fields.length === 0 ? (
            <Alert severity="info">No hay productos registrados para esta jornada.</Alert>
          ) : (
            <InlineRowForm
              control={control}
              name="conteos"
              columns={COLUMNS}
              renderRow={(_field, index) => (
                <>
                  <TableCell className={styles.readOnlyCell}>
                    {fields[index]?.productoNombre ?? ""}
                  </TableCell>
                  <TableCell align="right" className={styles.readOnlyCell}>
                    {fields[index]?.stockInicial ?? 0}
                  </TableCell>
                  <TableCell>
                    <Controller
                      name={`conteos.${index}.cantidadContada`}
                      control={control}
                      render={({ field: f, fieldState }) => (
                        <TextField
                          {...f}
                          label="Contado"
                          size="small"
                          type="number"
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                          slotProps={{ htmlInput: { min: 0, step: 1 } }}
                        />
                      )}
                    />
                  </TableCell>
                </>
              )}
            />
          )}

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

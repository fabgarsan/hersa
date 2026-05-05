import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Alert from "@mui/material/Alert";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import TableCell from "@mui/material/TableCell";
import TextField from "@mui/material/TextField";
import DeleteIcon from "@mui/icons-material/Delete";

import { LoadingState, MutationButton, PageHeader } from "@shared/components";
import { isNetworkError } from "@api/offlineMutationEvents";
import { useTiendaRole } from "@modules/tienda/shared/hooks/useTiendaRole";
import { TIENDA_ROUTES } from "@modules/tienda/constants/routes";
import { InlineRowForm } from "@modules/tienda/shared/components/InlineRowForm";
import { useGetProductosQuery } from "@modules/tienda/features/catalogo/api/getProductosQuery";
import type { InlineRowFormColumn } from "@modules/tienda/shared/components/InlineRowForm/types";
import { useTrasladoAperturaMutation } from "../api/trasladoAperturaMutation";
import { trasladoAperturaSchema } from "../schemas";
import type { TrasladoAperturaFormValues } from "../types";
import styles from "./TrasladoAperturaPage.module.scss";

const COLUMNS: InlineRowFormColumn[] = [
  { key: "producto", label: "Producto", width: 280 },
  { key: "cantidad", label: "Cantidad", width: 140 },
  { key: "eliminar", label: "", width: 60 },
];

export default function TrasladoAperturaPage() {
  const { id } = useParams<{ id: string }>();
  const { role } = useTiendaRole();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { mutate: doTraslado, isPending } = useTrasladoAperturaMutation();

  const ALL_PRODUCTS_PAGE_SIZE = 200; // Upper bound to load full catalog for Autocomplete selection
  const { data: productosData, isLoading: isLoadingProductos } = useGetProductosQuery(
    { activo: true, pageSize: ALL_PRODUCTS_PAGE_SIZE },
    role !== "none",
  );
  const productos = productosData?.results ?? [];

  const { control, handleSubmit } = useForm<TrasladoAperturaFormValues>({
    resolver: zodResolver(trasladoAperturaSchema),
    defaultValues: { items: [{ product: "", quantity: "" }] },
  });

  const { append, remove } = useFieldArray({ control, name: "items" });

  if (role === "none") {
    return <Navigate to="/tienda" replace />;
  }

  if (!id) {
    return <Navigate to={TIENDA_ROUTES.JORNADAS} replace />;
  }

  if (isLoadingProductos) {
    return <LoadingState variant="skeleton" rows={2} />;
  }

  const onSubmit = (values: TrasladoAperturaFormValues) => {
    setSubmitError(null);
    doTraslado(
      {
        jornadaId: id,
        items: values.items.map((item) => ({
          product: item.product,
          quantity: parseInt(item.quantity, 10),
        })),
      },
      {
        onSuccess: () => {
          navigate(`${TIENDA_ROUTES.JORNADAS}/${id}/apertura/confirmar`, {
            state: { items: values.items, productos },
          });
        },
        onError: (err) => {
          if (isNetworkError(err)) return;
          setSubmitError("Error al realizar el traslado. Verifica el stock disponible.");
        },
      },
    );
  };

  return (
    <Box className={styles.root}>
      <PageHeader
        title="Traslado apertura"
        breadcrumbs={[
          { label: "Tienda", href: "/tienda" },
          { label: "Jornadas", href: "/tienda/jornadas" },
          { label: `Jornada ${id?.slice(0, 8)}…`, href: `/tienda/jornadas/${id}` },
          { label: "Traslado apertura" },
        ]}
      />

      {submitError && (
        <Alert severity="error" className={styles.skeleton}>
          {submitError}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
        <Stack spacing={3}>
          <InlineRowForm
            control={control}
            name="items"
            columns={COLUMNS}
            appendLabel="Agregar producto"
            onAppend={() => append({ product: "", quantity: "" })}
            renderRow={(_field, index) => (
              <>
                <TableCell>
                  <Controller
                    name={`items.${index}.product`}
                    control={control}
                    render={({ field: f, fieldState }) => (
                      <Autocomplete
                        options={productos}
                        getOptionLabel={(opt) => opt.name}
                        value={productos.find((p) => p.id === f.value) ?? null}
                        onChange={(_, newValue) => f.onChange(newValue?.id ?? "")}
                        size="small"
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Producto"
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                          />
                        )}
                      />
                    )}
                  />
                </TableCell>
                <TableCell>
                  <Controller
                    name={`items.${index}.quantity`}
                    control={control}
                    render={({ field: f, fieldState }) => (
                      <TextField
                        {...f}
                        label="Cantidad"
                        size="small"
                        type="number"
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        slotProps={{ htmlInput: { min: 1, step: 1 } }}
                      />
                    )}
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    aria-label="Eliminar fila"
                    onClick={() => remove(index)}
                    size="small"
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </>
            )}
          />

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <MutationButton
              isPending={isPending}
              label="Realizar traslado"
              pendingLabel="Trasladando..."
            />
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}

import { useParams } from "react-router-dom";
import { Navigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import TableCell from "@mui/material/TableCell";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import DeleteIcon from "@mui/icons-material/Delete";
import Autocomplete from "@mui/material/Autocomplete";
import { Controller } from "react-hook-form";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

import { ErrorState, LoadingState, MutationButton, PageHeader } from "@shared/components";
import { useTiendaRole } from "@modules/tienda/shared/hooks/useTiendaRole";
import { InlineRowForm } from "@modules/tienda/shared/components/InlineRowForm";
import { MonetaryInput } from "@modules/tienda/shared/components/MonetaryInput";
import { useGetProveedoresQuery } from "@modules/tienda/features/catalogo/api/getProveedoresQuery";
import { useGetProductosQuery } from "@modules/tienda/features/catalogo/api/getProductosQuery";
import { useOrdenForm } from "../hooks/useOrdenForm";
import { useGetOrdenQuery } from "../api/getOrdenQuery";
import { TIENDA_ROUTES } from "@modules/tienda/constants/routes";
import type { InlineRowFormColumn } from "@modules/tienda/shared/components/InlineRowForm/types";
import styles from "./OrdenEditInitiatedPage.module.scss";

const LINEAS_COLUMNS: InlineRowFormColumn[] = [
  { key: "producto", label: "Producto", width: 250 },
  { key: "cantidad", label: "Cantidad pedida", width: 150 },
  { key: "precio", label: "Precio unitario", width: 160 },
  { key: "eliminar", label: "", width: 60 },
];

export default function OrdenEditInitiatedPage() {
  const { isAdmin } = useTiendaRole();
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  // We need the raw orden state to check if it's "initiated" before rendering the form.
  // useOrdenForm also fetches it, but we need the status here for early redirect.
  const { data: ordenRaw, isLoading: isLoadingRaw } = useGetOrdenQuery(id);

  const {
    control,
    handleSubmit,
    isSubmitting,
    isLoadingOrden,
    errorOrden,
    snackbarOpen,
    snackbarMessage,
    snackbarSeverity,
    onCloseSnackbar,
    onSubmit,
    appendLinea,
    removeLinea,
  } = useOrdenForm();

  const { data: proveedoresData, isLoading: isLoadingProveedores } = useGetProveedoresQuery(
    { pageSize: 200 },
    true,
  );
  const { data: productosData, isLoading: isLoadingProductos } = useGetProductosQuery({
    activo: true,
    pageSize: 200,
  });

  if (!isAdmin) {
    return <Navigate to="/tienda/ordenes" replace />;
  }

  if (isLoadingRaw || isLoadingOrden || isLoadingProveedores || isLoadingProductos) {
    return <LoadingState variant="skeleton" rows={2} />;
  }

  if (errorOrden) {
    return <ErrorState title="Error al cargar la orden" description="Intenta nuevamente." />;
  }

  // Redirect if order is not in "initiated" state
  if (ordenRaw && ordenRaw.status !== "initiated") {
    return <Navigate to={`${TIENDA_ROUTES.ORDENES}/${id}`} replace />;
  }

  const proveedores = proveedoresData?.results ?? [];
  const productos = productosData?.results ?? [];

  return (
    <Box className={styles.root}>
      <PageHeader
        title="Editar orden"
        breadcrumbs={[
          { label: "Tienda", href: "/tienda" },
          { label: "Órdenes", href: "/tienda/ordenes" },
          { label: `Orden ${id?.slice(0, 8)}…`, href: `/tienda/ordenes/${id}` },
          { label: "Editar" },
        ]}
      />

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
        <Stack spacing={3}>
          <Controller
            name="supplier"
            control={control}
            render={({ field, fieldState }) => (
              <Autocomplete
                options={proveedores}
                getOptionLabel={(opt) => opt.name}
                value={proveedores.find((p) => p.id === field.value) ?? null}
                onChange={(_, newValue) => field.onChange(newValue?.id ?? "")}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Proveedor"
                    required
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            )}
          />

          <Controller
            name="notes"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Notas"
                multiline
                rows={2}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                fullWidth
              />
            )}
          />

          <Typography variant="subtitle1" className={styles.sectionLabel}>
            Líneas de la orden
          </Typography>

          <InlineRowForm
            control={control}
            name="orderLines"
            columns={LINEAS_COLUMNS}
            appendLabel="Agregar línea"
            onAppend={appendLinea}
            renderRow={(_field, index) => (
              <>
                <TableCell>
                  <Controller
                    name={`orderLines.${index}.product`}
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
                    name={`orderLines.${index}.orderedQuantity`}
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
                  <MonetaryInput
                    name={`orderLines.${index}.expectedUnitCost`}
                    control={control}
                    label="Precio unitario"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    aria-label="Eliminar línea"
                    onClick={() => removeLinea(index)}
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
              isPending={isSubmitting}
              label="Guardar cambios"
              pendingLabel="Guardando..."
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

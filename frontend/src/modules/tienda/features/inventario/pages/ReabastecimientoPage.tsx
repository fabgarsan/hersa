import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

import { isNetworkError } from "@api/offlineMutationEvents";
import { useTiendaRole } from "@modules/tienda/shared/hooks/useTiendaRole";
import { TIENDA_ROUTES } from "@modules/tienda/constants/routes";
import { useGetReabastecimientoQuery } from "../api/getReabastecimientoQuery";
import { useCreateOrdenDesdeReabastecimientoMutation } from "../api/createOrdenDesdeReabastecimientoMutation";
import styles from "./ReabastecimientoPage.module.scss";

export default function ReabastecimientoPage() {
  const { isAdmin } = useTiendaRole();
  const navigate = useNavigate();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: items, isLoading, isError } = useGetReabastecimientoQuery();
  const { mutate: createOrden, isPending } = useCreateOrdenDesdeReabastecimientoMutation();

  if (!isAdmin) {
    return <Navigate to="/tienda" replace />;
  }

  function handleToggle(productId: string) {
    setSelectedIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    );
  }

  function handleToggleAll() {
    if (!items) return;
    const allIds = items.map((item) => item.product.id);
    setSelectedIds(selectedIds.length === allIds.length ? [] : allIds);
  }

  function handleCreateOrden() {
    setSubmitError(null);
    createOrden(
      { productIds: selectedIds },
      {
        onSuccess: () => {
          navigate(TIENDA_ROUTES.ORDENES);
        },
        onError: (err) => {
          if (isNetworkError(err)) return;
          setSubmitError("Error al crear la orden. Intenta nuevamente.");
        },
      },
    );
  }

  if (isLoading) {
    return (
      <Box className={styles.root}>
        <Skeleton variant="rectangular" height={40} className={styles.skeletonHeader} />
        <Skeleton variant="rectangular" height={400} className={styles.skeletonTable} />
      </Box>
    );
  }

  const allIds = items?.map((item) => item.product.id) ?? [];
  const allSelected = allIds.length > 0 && selectedIds.length === allIds.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < allIds.length;

  return (
    <Box className={styles.root}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        className={styles.header}
        spacing={2}
      >
        <Typography variant="h5" className={styles.title}>
          Reabastecimiento sugerido
        </Typography>
      </Stack>

      {isError && (
        <Alert severity="error" className={styles.error}>
          Error al cargar el reabastecimiento. Intenta nuevamente.
        </Alert>
      )}

      {submitError && (
        <Alert severity="error" className={styles.error}>
          {submitError}
        </Alert>
      )}

      {!isError && items && items.length === 0 && (
        <Typography className={styles.emptyState}>
          No hay productos que requieran reabastecimiento en este momento.
        </Typography>
      )}

      {!isError && items && items.length > 0 && (
        <>
          <TableContainer className={styles.tableContainer}>
            <Table size="small">
              <TableHead className={styles.tableHead}>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={allSelected}
                      indeterminate={someSelected}
                      onChange={handleToggleAll}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>Producto</TableCell>
                  <TableCell align="right">Stock actual</TableCell>
                  <TableCell align="right">Punto de reorden</TableCell>
                  <TableCell align="right">Cant. sugerida</TableCell>
                  <TableCell align="right">En órdenes activas</TableCell>
                  <TableCell align="right">A pedir (neto)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => {
                  const isChecked = selectedIds.includes(item.product.id);
                  return (
                    <TableRow
                      key={item.product.id}
                      className={styles.tableRow}
                      onClick={() => handleToggle(item.product.id)}
                      selected={isChecked}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isChecked}
                          size="small"
                          onClick={(e) => e.stopPropagation()}
                          onChange={() => handleToggle(item.product.id)}
                        />
                      </TableCell>
                      <TableCell>{item.product.name}</TableCell>
                      <TableCell align="right">
                        {item.currentQty} {item.product.unitLabel}
                      </TableCell>
                      <TableCell align="right">{item.reorderPoint}</TableCell>
                      <TableCell align="right">{item.suggestedOrderQty}</TableCell>
                      <TableCell align="right">{item.unitsInActiveOrders}</TableCell>
                      <TableCell align="right">
                        <strong>{item.netQuantityToOrder}</strong>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <Box className={styles.actions}>
            <Button
              variant="contained"
              color="primary"
              startIcon={
                isPending ? <CircularProgress size={16} color="inherit" /> : <ShoppingCartIcon />
              }
              disabled={selectedIds.length === 0 || isPending}
              onClick={handleCreateOrden}
            >
              {isPending ? "Creando orden..." : "Crear orden de compra"}
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}

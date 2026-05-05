import { useState } from "react";
import Alert from "@mui/material/Alert";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { assertUuid } from "@shared/utils/assertUuid";
import { useTiendaRole } from "@modules/tienda/shared/hooks/useTiendaRole";
import { useGetProductosQuery } from "@modules/tienda/features/catalogo/api/getProductosQuery";
import type { Product } from "@modules/tienda/features/catalogo/types";
import { useGetStockQuery } from "../api/getStockQuery";
import { useGetStockTotalQuery } from "../api/getStockTotalQuery";
import styles from "./StockPage.module.scss";

export default function StockPage() {
  const { isAdmin } = useTiendaRole();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { data: productosData, isLoading: isLoadingProductos } = useGetProductosQuery({
    activo: true,
    pageSize: 200,
  });

  const productoId = selectedProduct?.id ?? "";
  const isValidId = productoId !== "";

  // Admin: fetch total stock breakdown; vendedor: fetch per-location stock
  const {
    data: stockTotalData,
    isLoading: isLoadingTotal,
    isError: isErrorTotal,
  } = useGetStockTotalQuery({ productoId }, isAdmin && isValidId);

  const {
    data: stockListData,
    isLoading: isLoadingList,
    isError: isErrorList,
  } = useGetStockQuery({ productoId }, !isAdmin && isValidId);

  function handleProductChange(_: React.SyntheticEvent, value: Product | null) {
    if (value) {
      assertUuid(value.id, "StockPage");
    }
    setSelectedProduct(value);
  }

  const isLoading = isAdmin ? isLoadingTotal : isLoadingList;
  const isError = isAdmin ? isErrorTotal : isErrorList;

  return (
    <Box className={styles.root}>
      <Typography variant="h5" className={styles.title}>
        Stock de productos
      </Typography>

      {isLoadingProductos ? (
        <Skeleton variant="rectangular" className={styles.skeletonAutocomplete} />
      ) : (
        <Autocomplete
          className={styles.autocomplete}
          options={productosData?.results ?? []}
          getOptionLabel={(option) => option.name}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          value={selectedProduct}
          onChange={handleProductChange}
          renderInput={(params) => (
            <TextField {...params} label="Buscar producto" placeholder="Escribe para filtrar..." />
          )}
        />
      )}

      {selectedProduct && (
        <>
          {isLoading && (
            <Skeleton variant="rectangular" height={200} className={styles.skeletonTable} />
          )}

          {!isLoading && isError && (
            <Alert severity="error">Error al cargar el stock. Intenta nuevamente.</Alert>
          )}

          {!isLoading && !isError && isAdmin && stockTotalData && (
            <>
              <Box className={styles.totalBadge}>
                <Typography variant="h6" className={styles.sectionTitle}>
                  {stockTotalData.name}
                </Typography>
                <Typography variant="body1">
                  — Total:{" "}
                  <strong>
                    {stockTotalData.stockTotal} {selectedProduct.unitLabel}
                  </strong>
                </Typography>
              </Box>

              {stockTotalData.breakdown.length === 0 ? (
                <Typography className={styles.emptyState}>
                  No hay registros de stock para este producto.
                </Typography>
              ) : (
                <TableContainer className={styles.tableContainer}>
                  <Table size="small">
                    <TableHead className={styles.tableHead}>
                      <TableRow>
                        <TableCell>Ubicación (UUID)</TableCell>
                        <TableCell align="right">Cantidad actual</TableCell>
                        <TableCell>Última actualización</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stockTotalData.breakdown.map((row) => (
                        <TableRow key={row.id} className={styles.tableRow}>
                          <TableCell>{row.location}</TableCell>
                          <TableCell align="right">
                            {row.currentQuantity} {selectedProduct.unitLabel}
                          </TableCell>
                          <TableCell>
                            {new Date(row.updatedAt).toLocaleDateString("es-CO")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}

          {!isLoading && !isError && !isAdmin && stockListData && (
            <>
              {stockListData.length === 0 ? (
                <Typography className={styles.emptyState}>
                  No hay registros de stock para este producto.
                </Typography>
              ) : (
                <TableContainer className={styles.tableContainer}>
                  <Table size="small">
                    <TableHead className={styles.tableHead}>
                      <TableRow>
                        <TableCell>Ubicación (UUID)</TableCell>
                        <TableCell align="right">Cantidad actual</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stockListData.map((row) => (
                        <TableRow key={row.id} className={styles.tableRow}>
                          <TableCell>{row.location}</TableCell>
                          <TableCell align="right">
                            {row.currentQuantity} {selectedProduct.unitLabel}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
        </>
      )}
    </Box>
  );
}

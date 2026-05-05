import { Navigate, useLocation, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import CheckIcon from "@mui/icons-material/Check";

import { useTiendaRole } from "@modules/tienda/shared/hooks/useTiendaRole";
import { TIENDA_ROUTES } from "@modules/tienda/constants/routes";
import type { LocationState } from "../types";
import styles from "./TrasladoConfirmPage.module.scss";

function isLocationState(s: unknown): s is LocationState {
  return typeof s === "object" && s !== null && ("items" in s || "productos" in s);
}

export default function TrasladoConfirmPage() {
  const { role } = useTiendaRole();
  const navigate = useNavigate();
  const location = useLocation();
  const state = isLocationState(location.state) ? location.state : null;

  if (role === "none") {
    return <Navigate to="/tienda" replace />;
  }

  const items = state?.items ?? [];
  const productos = state?.productos ?? [];

  const resolveNombre = (productId: string): string => {
    const found = productos.find((p) => p.id === productId);
    return found?.name ?? productId;
  };

  return (
    <Box className={styles.root}>
      <Typography variant="h5" className={styles.title}>
        Traslado registrado
      </Typography>

      <div className={styles.tableWrapper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Producto</TableCell>
              <TableCell align="right">Cantidad trasladada</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} align="center" className={styles.emptyCell}>
                  Sin productos trasladados
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.product}>
                  <TableCell>{resolveNombre(item.product)}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className={styles.actions}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<CheckIcon />}
          onClick={() => navigate(TIENDA_ROUTES.VENDEDOR)}
        >
          Confirmar
        </Button>
      </div>
    </Box>
  );
}

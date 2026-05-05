import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";

import { OrdenStatusChip } from "../OrdenStatusChip";
import type { RecepcionRowProps } from "./types";
import styles from "./RecepcionRow.module.scss";

export function RecepcionRow({ linea, productoNombre }: RecepcionRowProps) {
  return (
    <TableRow>
      <TableCell>{productoNombre}</TableCell>
      <TableCell align="right">{linea.orderedQuantity ?? "—"}</TableCell>
      <TableCell align="right">{linea.receivedQuantityCumulative}</TableCell>
      <TableCell>
        <OrdenStatusChip status={linea.status} />
      </TableCell>
      {linea.expectedUnitCost !== undefined && (
        <TableCell align="right" className={styles.monetary}>
          ${linea.expectedUnitCost}
        </TableCell>
      )}
    </TableRow>
  );
}

import { useFieldArray } from "react-hook-form";
import type { FieldValues } from "react-hook-form";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import type { CSSProperties } from "react";
import { List } from "react-window";

import type { InlineRowFormProps } from "./types";
import styles from "./InlineRowForm.module.scss";

const VIRTUALIZE_THRESHOLD = 20;
const ROW_HEIGHT = 56;
const SKELETON_IDS = ["skeleton-0", "skeleton-1", "skeleton-2"] as const;

export function InlineRowForm<T extends FieldValues>({
  control,
  name,
  columns,
  renderRow,
  onAppend,
  appendLabel = "Agregar fila",
  isLoading = false,
}: InlineRowFormProps<T>) {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  const { fields } = useFieldArray({ control, name });

  if (isLoading) {
    return (
      <div className={styles.root}>
        {SKELETON_IDS.map((id) => (
          <Skeleton
            key={id}
            variant="rectangular"
            height={ROW_HEIGHT}
            className={styles.skeletonRow}
          />
        ))}
      </div>
    );
  }

  const shouldVirtualize = isMdUp && fields.length > VIRTUALIZE_THRESHOLD;

  if (isMdUp) {
    if (shouldVirtualize) {
      const VirtualRow = ({
        ariaAttributes,
        index,
        style,
      }: {
        ariaAttributes: { "aria-posinset": number; "aria-setsize": number; role: "listitem" };
        index: number;
        style: CSSProperties;
      }) => (
        <div style={style} {...ariaAttributes}>
          {renderRow(fields[index], index)}
        </div>
      );

      return (
        <div className={styles.root}>
          <Table>
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell key={col.key} width={col.width}>
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
          </Table>
          <List
            rowComponent={VirtualRow}
            rowCount={fields.length}
            rowHeight={ROW_HEIGHT}
            rowProps={{}}
            defaultHeight={Math.min(fields.length * ROW_HEIGHT, 400)}
          />
          {onAppend && (
            <Button variant="outlined" onClick={onAppend} className={styles.appendButton}>
              {appendLabel}
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className={styles.root}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.key} width={col.width}>
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {fields.map((field, index) => (
              <TableRow key={field.id}>{renderRow(field, index)}</TableRow>
            ))}
          </TableBody>
        </Table>
        {onAppend && (
          <Button variant="outlined" onClick={onAppend} className={styles.appendButton}>
            {appendLabel}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.mobileStack}>
        {fields.map((field, index) => (
          <Paper key={field.id} variant="outlined" className={styles.mobileCard}>
            {renderRow(field, index)}
          </Paper>
        ))}
      </div>
      {onAppend && (
        <Button variant="outlined" onClick={onAppend} className={styles.appendButton}>
          {appendLabel}
        </Button>
      )}
    </div>
  );
}

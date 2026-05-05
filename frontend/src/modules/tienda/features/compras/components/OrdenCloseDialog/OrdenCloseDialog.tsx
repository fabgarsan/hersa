import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import CircularProgress from "@mui/material/CircularProgress";
import { isNetworkError } from "@api/offlineMutationEvents";
import { closeOrdenSchema } from "../../schemas";
import { useCerrarOrdenMutation } from "../../api/cerrarOrdenMutation";
import type { OrdenCloseFormValues } from "../../types";
import type { OrdenCloseDialogProps } from "./types";
import styles from "./OrdenCloseDialog.module.scss";

export function OrdenCloseDialog({
  open,
  discrepancias,
  umbral,
  ordenId,
  onClose,
  onSuccess,
}: OrdenCloseDialogProps) {
  const { mutate: cerrar, isPending } = useCerrarOrdenMutation();

  const { control, handleSubmit, reset } = useForm<OrdenCloseFormValues>({
    resolver: zodResolver(closeOrdenSchema),
    defaultValues: { closingJustification: "" },
  });

  const onSubmit = (values: OrdenCloseFormValues) => {
    cerrar(
      { id: ordenId, closingJustification: values.closingJustification },
      {
        onSuccess: () => {
          reset();
          onSuccess();
        },
        onError: (err) => {
          if (isNetworkError(err)) return;
        },
      },
    );
  };

  const handleClose = () => {
    if (isPending) return;
    reset();
    onClose();
  };

  const umbralPct = `${(umbral * 100).toFixed(0)}%`;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle className={styles.title}>Cerrar Orden — Discrepancias detectadas</DialogTitle>
      <DialogContent>
        <Alert severity="warning" className={styles.alert}>
          Se detectaron líneas con una diferencia mayor al umbral permitido ({umbralPct}).
          Proporciona una justificación para continuar.
        </Alert>

        <Typography variant="subtitle2" className={styles.tableLabel}>
          Líneas con discrepancia
        </Typography>

        <div className={styles.tableWrapper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID Línea</TableCell>
                <TableCell align="right">Pedidas</TableCell>
                <TableCell align="right">Recibidas</TableCell>
                <TableCell align="right">Delta</TableCell>
                <TableCell align="right">Delta %</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {discrepancias.map((d) => (
                <TableRow key={d.lineId}>
                  <TableCell className={styles.lineIdCell}>{d.lineId}</TableCell>
                  <TableCell align="right">{d.orderedQuantity}</TableCell>
                  <TableCell align="right">{d.receivedQuantity}</TableCell>
                  <TableCell align="right">{d.delta}</TableCell>
                  <TableCell align="right">{(d.deltaPct * 100).toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Box
          component="form"
          id="close-orden-form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className={styles.form}
        >
          <Controller
            name="closingJustification"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Justificación"
                multiline
                rows={3}
                fullWidth
                required
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
        </Box>
      </DialogContent>
      <DialogActions className={styles.actions}>
        <Button variant="outlined" color="inherit" onClick={handleClose} disabled={isPending}>
          Cancelar
        </Button>
        <Button
          type="submit"
          form="close-orden-form"
          variant="contained"
          color="primary"
          disabled={isPending}
          startIcon={isPending ? <CircularProgress size={20} color="inherit" /> : undefined}
        >
          {isPending ? "Cerrando..." : "Cerrar orden con justificación"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

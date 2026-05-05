import { Controller } from "react-hook-form";
import type { FieldValues } from "react-hook-form";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";

import { useTiendaRole } from "@modules/tienda/shared/hooks/useTiendaRole";
import type { MonetaryInputProps } from "./types";
import styles from "./MonetaryInput.module.scss";

export function MonetaryInput<T extends FieldValues>({
  name,
  control,
  label,
}: MonetaryInputProps<T>) {
  const { isAdmin } = useTiendaRole();

  if (!isAdmin) {
    return null;
  }

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          label={label}
          className={styles.root}
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
          slotProps={{
            input: {
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            },
          }}
        />
      )}
    />
  );
}

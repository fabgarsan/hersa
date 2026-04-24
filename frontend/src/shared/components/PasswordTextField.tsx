import { useState } from "react";

import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Controller } from "react-hook-form";
import type { FieldValues } from "react-hook-form";

import type { PasswordTextFieldProps } from "./types";
import styles from "./PasswordTextField.module.scss";

export function PasswordTextField<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  error,
  autoFocus,
}: PasswordTextFieldProps<TFieldValues>) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <span className={styles.root}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label={label}
            type={showPassword ? "text" : "password"}
            error={Boolean(error)}
            helperText={error?.message}
            fullWidth
            autoFocus={autoFocus}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((v) => !v)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        )}
      />
    </span>
  );
}

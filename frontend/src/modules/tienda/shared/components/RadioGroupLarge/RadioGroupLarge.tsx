import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import type { RadioGroupLargeProps } from "./types";
import styles from "./RadioGroupLarge.module.scss";

export function RadioGroupLarge({ options, value, onChange }: RadioGroupLargeProps) {
  return (
    <div className={styles.group}>
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <Paper
            key={option.value}
            variant="outlined"
            className={isSelected ? styles.cardSelected : styles.card}
            onClick={() => onChange(option.value)}
            role="radio"
            aria-checked={isSelected}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onChange(option.value);
              }
            }}
          >
            <Typography className={styles.label}>{option.label}</Typography>
            {option.description && (
              <Typography className={styles.description}>{option.description}</Typography>
            )}
          </Paper>
        );
      })}
    </div>
  );
}

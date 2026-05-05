import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";

import type { CierreProgressBarProps } from "./types";
import styles from "./CierreProgressBar.module.scss";

const STEPS = ["Conteo", "Efectivo", "Resumen"];

export function CierreProgressBar({ step }: CierreProgressBarProps) {
  return (
    <Stepper activeStep={step - 1} className={styles.root}>
      {STEPS.map((label, index) => (
        <Step key={label}>
          <StepLabel
            slotProps={{
              label: {
                className: index === step - 1 ? styles.stepLabelActive : styles.stepLabel,
              },
            }}
          >
            {label}
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}

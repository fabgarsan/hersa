import type React from "react";
import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface TypographyVariants {
    display: React.CSSProperties;
  }
  interface TypographyVariantsOptions {
    display?: React.CSSProperties;
  }
}

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    display: true;
  }
}

export const hersaTheme = createTheme({
  palette: {
    primary: {
      main: "#0B1F3A",
      dark: "#122640",
      light: "#1E3A5F",
      contrastText: "#C9A227",
    },
    secondary: {
      main: "#C9A227",
      light: "#E8D49A",
      dark: "#A07B10",
      contrastText: "#0B1F3A",
    },
    background: {
      default: "#F5F5F5",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1A1A1A",
      secondary: "#5F5E5A",
    },
    success: { main: "#3B6D11", light: "#EAF3DE" },
    warning: { main: "#854F0B", light: "#FAEEDA" },
    error: { main: "#A32D2D", light: "#FCEBEB" },
    info: { main: "#185FA5", light: "#E6F1FB" },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 600, fontSize: "2rem", lineHeight: 1.3, color: "#0B1F3A" },
    h2: { fontWeight: 600, fontSize: "1.5rem", lineHeight: 1.4, color: "#0B1F3A" },
    h3: { fontWeight: 500, fontSize: "1.25rem", lineHeight: 1.4, color: "#0B1F3A" },
    h4: { fontWeight: 500, fontSize: "1rem", lineHeight: 1.5, color: "#0B1F3A" },
    h5: { fontWeight: 600, fontSize: "1.25rem", lineHeight: 1.4, color: "#0B1F3A" },
    h6: { fontWeight: 600, fontSize: "1.1rem", lineHeight: 1.4, color: "#0B1F3A" },
    subtitle1: { fontWeight: 500, fontSize: "1rem", lineHeight: 1.5 },
    subtitle2: { fontWeight: 600, fontSize: "0.75rem", lineHeight: 1.5, letterSpacing: "0.04em" },
    body1: { fontWeight: 400, fontSize: "1rem", lineHeight: 1.6 },
    body2: { fontWeight: 400, fontSize: "0.875rem", lineHeight: 1.6 },
    caption: { fontWeight: 400, fontSize: "0.75rem", lineHeight: 1.5 },
    button: { textTransform: "none", fontWeight: 500, fontSize: "0.875rem" },
    display: {
      fontFamily: '"Playfair Display", "Georgia", serif',
      fontWeight: 700,
      fontSize: "3rem",
      lineHeight: 1.2,
    },
  },
  components: {
    MuiTypography: {
      defaultProps: {
        variantMapping: {
          display: "h1",
        },
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
});

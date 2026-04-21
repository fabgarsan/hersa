import { createTheme } from "@mui/material/styles";

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
    h1: { fontWeight: 600, color: "#0B1F3A" },
    h2: { fontWeight: 600, color: "#0B1F3A" },
    h3: { fontWeight: 500, color: "#0B1F3A" },
    button: { textTransform: "none", fontWeight: 500 },
  },
  shape: {
    borderRadius: 8,
  },
});

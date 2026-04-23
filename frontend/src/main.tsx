import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import CssBaseline from "@mui/material/CssBaseline";
import App from "./App";
import { hersaTheme } from "@shared/styles/theme";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
});

// prepend: true makes Emotion inject its styles at the top of <head>,
// so statically-compiled SCSS (injected after) always wins specificity battles.
const emotionCache = createCache({ key: "css", prepend: true });

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

createRoot(root).render(
  <StrictMode>
    <CacheProvider value={emotionCache}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider theme={hersaTheme}>
            <CssBaseline />
            <App />
          </ThemeProvider>
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </CacheProvider>
  </StrictMode>,
);

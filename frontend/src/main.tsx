import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MutationCache, QueryClient } from "@tanstack/react-query";
import { isNetworkError, offlineMutationEvents } from "./api/offlineMutationEvents";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import CssBaseline from "@mui/material/CssBaseline";
import "./shared/styles/global.scss";
import App from "./App";
import { AuthProvider } from "@shared/contexts";
import { hersaTheme } from "@shared/styles/theme";

const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (error) => {
      if (isNetworkError(error as Error)) offlineMutationEvents.trigger();
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
      // Datos del caché offline se mantienen válidos 24 horas
      gcTime: 1000 * 60 * 60 * 24,
    },
  },
});

const persister = createAsyncStoragePersister({
  storage: window.localStorage,
  key: "hersa-rq-cache",
});

// prepend: true makes Emotion inject its styles at the top of <head>,
// so statically-compiled SCSS (injected after) always wins specificity battles.
const emotionCache = createCache({ key: "css", prepend: true });

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

createRoot(root).render(
  <StrictMode>
    <CacheProvider value={emotionCache}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister, maxAge: 1000 * 60 * 60 * 24 }}
      >
        <BrowserRouter>
          <AuthProvider>
            <ThemeProvider theme={hersaTheme}>
              <CssBaseline />
              <App />
            </ThemeProvider>
          </AuthProvider>
        </BrowserRouter>
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </PersistQueryClientProvider>
    </CacheProvider>
  </StrictMode>,
);

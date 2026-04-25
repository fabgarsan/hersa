import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import type { ReactNode } from "react";

import { AuthProvider } from "@shared/contexts/AuthProvider";
import { hersaTheme } from "@shared/styles/theme";

const emotionCache = createCache({ key: "css-test", prepend: true });

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

interface RenderWithProvidersOptions {
  queryClient?: QueryClient;
}

export function renderWithProviders(
  ui: ReactNode,
  { queryClient = createTestQueryClient() }: RenderWithProvidersOptions = {},
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <CacheProvider value={emotionCache}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AuthProvider>
              <ThemeProvider theme={hersaTheme}>{children}</ThemeProvider>
            </AuthProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </CacheProvider>
    );
  }

  return {
    ...render(<>{ui}</>, { wrapper: Wrapper }),
    user: userEvent.setup(),
  };
}

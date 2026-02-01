import { QueryClient } from "@tanstack/react-query";

export const createTanstackQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 10,
        retry: (failureCount, error) => {
          if (error && typeof error === "object" && "status" in error) {
            const status = (error as { status: number }).status;
            // Don't retry client errors (4xx), but allow retries for server errors (5xx)
            if (status >= 400 && status < 500) return false;
          }
          return failureCount < 3;
        },
      },
    },
  });
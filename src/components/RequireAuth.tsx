import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "@sdk/auth";
import { LogoMark } from "@/components/Logo";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-bg" role="status" aria-label="Checking your session">
        <div className="flex flex-col items-center gap-4">
          <LogoMark size={48} className="animate-pulse" />
          <p className="text-sm font-medium text-muted">Loading Ziganya…</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/?login=1" replace state={{ from: location.pathname + location.search }} />;
  }

  return <>{children}</>;
}

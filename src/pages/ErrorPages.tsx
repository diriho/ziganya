import { Link, isRouteErrorResponse, useRouteError } from "react-router";
import { ArrowLeft, Compass, RefreshCw } from "lucide-react";
import { LinkButton } from "@/components/ui";
import { LogoMark } from "@/components/Logo";

function Shell({ code, title, description, children }: { code: string; title: string; description: string; children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen place-items-center bg-bg px-4">
      <div className="card w-full max-w-md p-8 text-center">
        <div className="flex justify-center">
          <LogoMark size={44} />
        </div>
        <p className="eyebrow mt-6">{code}</p>
        <h1 className="mt-2 text-2xl font-bold">{title}</h1>
        <p className="mt-2 text-sm text-muted">{description}</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">{children}</div>
      </div>
    </main>
  );
}


export function RouteErrorFallback() {
  const error = useRouteError();
  const isHttp = isRouteErrorResponse(error);
  const status = isHttp ? String(error.status) : "Error";
  const title = isHttp ? error.statusText || "Something went wrong" : "Something went wrong";
  const detail = !isHttp && error instanceof Error ? error.message : "The page could not be loaded.";

  return (
    <Shell code={status} title={title} description={detail}>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm font-semibold text-ink shadow-sm hover:bg-surface-2"
      >
        <RefreshCw size={16} /> Reload
      </button>
      <LinkButton to="/dashboard" leftIcon={<ArrowLeft size={16} />}>
        Back to dashboard
      </LinkButton>
    </Shell>
  );
}

export function NotFoundPage() {
  return (
    <Shell code="404" title="Page not found" description="That link doesn't lead anywhere. Let's get you back on track.">
      <Link to="/" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm font-semibold text-ink shadow-sm hover:bg-surface-2">
        <Compass size={16} /> Home
      </Link>
      <LinkButton to="/dashboard" leftIcon={<ArrowLeft size={16} />}>
        Back to dashboard
      </LinkButton>
    </Shell>
  );
}

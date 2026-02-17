import {
  createBrowserRouter,
  RouterProvider,
  Link,
  isRouteErrorResponse,
  useRouteError,
} from "react-router";
import { DashboardLayout } from "./components/Dashboard/DashboardLayout";
import { DashboardHome } from "@components/Dashboard";
import { SubscriptionPage } from "./pages/Subscriptions";
import { TransactionsPage } from "./pages/Transactions";
import { CalendarPage } from "./pages/Calendar";
import { SettingsPage } from "./pages/Settings";
import { LogoutPage } from "./pages/Logout";
import Home from "./pages/Home";

function RouteErrorFallback() {
  const error = useRouteError();
  const isHttpError = isRouteErrorResponse(error);
  const status = isHttpError ? error.status : 500;
  const message = isHttpError ? error.statusText : "Something went wrong.";

  return (
    <main className="min-h-screen grid place-items-center px-6 bg-zinc-50">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm">
        <p className="text-sm font-medium text-zinc-500">Error {status}</p>
        <h1 className="mt-2 text-2xl font-bold text-zinc-900">{message}</h1>
        <p className="mt-3 text-sm text-zinc-600">
          The page you requested could not be loaded.
        </p>
        <Link
          to="/dashboard"
          className="mt-5 inline-flex rounded-lg bg-brand-green px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}

function NotFoundPage() {
  return (
    <main className="min-h-screen grid place-items-center px-6 bg-zinc-50">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm">
        <p className="text-sm font-medium text-zinc-500">Error 404</p>
        <h1 className="mt-2 text-2xl font-bold text-zinc-900">Page not found</h1>
        <p className="mt-3 text-sm text-zinc-600">
          The page you requested does not exist.
        </p>
        <Link
          to="/dashboard"
          className="mt-5 inline-flex rounded-lg bg-brand-green px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}

const router = createBrowserRouter([
  {
    path:"/",
    element: <Home/>,
    errorElement: <RouteErrorFallback />,
    children: [
      
    ]
  },
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    errorElement: <RouteErrorFallback />,
    children: [
      { index: true, element: <DashboardHome /> },
      { path: "transactions", element: <TransactionsPage /> },
      { path: "calendar", element: <CalendarPage /> },
      { path: "subscriptions", element: <SubscriptionPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
  {
    path: "/logout",
    element: <LogoutPage />,
    errorElement: <RouteErrorFallback />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;

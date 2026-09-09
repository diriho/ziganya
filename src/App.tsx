import { lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import { RequireAuth } from "@/components/RequireAuth";
import { DashboardLayout } from "@/components/Dashboard/DashboardLayout";
import { NotFoundPage, RouteErrorFallback } from "@/pages/ErrorPages";
import Home from "@/pages/Home";

// Route-level code splitting keeps the landing page light and isolates the chart bundle.
const DashboardHome = lazy(() => import("@/components/Dashboard/DashboardHome").then((m) => ({ default: m.DashboardHome })));
const TransactionsPage = lazy(() => import("@/pages/Transactions").then((m) => ({ default: m.TransactionsPage })));
const CalendarPage = lazy(() => import("@/pages/Calendar").then((m) => ({ default: m.CalendarPage })));
const SubscriptionPage = lazy(() => import("@/pages/Subscriptions").then((m) => ({ default: m.SubscriptionPage })));
const SettingsPage = lazy(() => import("@/pages/Settings").then((m) => ({ default: m.SettingsPage })));
const LogoutPage = lazy(() => import("@/pages/Logout").then((m) => ({ default: m.LogoutPage })));

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <RouteErrorFallback />,
  },
  {
    path: "/dashboard",
    element: (
      <RequireAuth>
        <DashboardLayout />
      </RequireAuth>
    ),
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
  { path: "*", element: <NotFoundPage /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}

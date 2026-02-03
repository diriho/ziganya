import { createBrowserRouter, RouterProvider } from "react-router";
import { DashboardLayout } from "./components/Dashboard/DashboardLayout";
import { DashboardHome } from "@components/Dashboard";
import { SubscriptionPage } from "./pages/Subscriptions";
import { TransactionsPage } from "./pages/Transactions";
import { CalendarPage } from "./pages/Calendar";
import { SettingsPage } from "./pages/Settings";
import { LogoutPage } from "./pages/Logout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout />,
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
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;

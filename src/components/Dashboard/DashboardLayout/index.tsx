import { Suspense, useState } from "react";
import { Outlet, useLocation } from "react-router";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "../Topbar";
import { PageLoading } from "@/components/PageState";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cn } from "@/components/ui";

export function DashboardLayout() {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useLocalStorage<boolean>("ziganya:sidebar-collapsed", false);

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((c) => !c)}
      />
      <div className={cn("flex min-h-screen flex-col transition-[padding] duration-300", collapsed ? "md:pl-[76px]" : "md:pl-[272px]")}>
        <Topbar onOpenMenu={() => setMobileOpen(true)} />
        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 pb-16 pt-6 sm:px-6 lg:px-8">
          <Suspense fallback={<PageLoading />}>
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          </Suspense>
        </main>
      </div>
    </div>
  );
}

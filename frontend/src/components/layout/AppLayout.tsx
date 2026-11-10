import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useTheme } from "../../contexts/useTheme";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/boardrooms": "Boardrooms",
  "/my-bookings": "My Bookings",
  "/companies": "Companies",
  "/users": "Users",
  "/audit-logs": "Audit Logs",
};

function AppLayout() {
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const title = pageTitles[location.pathname] ?? "CritaSpace";

  return (
    <div className="flex min-h-screen bg-background">
      <div
        className="lg:contents"
        onMouseEnter={() => setCollapsed(false)}
        onMouseLeave={() => setCollapsed(true)}
      >
        <Sidebar
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title={title}
          isDark={isDark}
          onThemeToggle={toggleTheme}
          onMenuClick={() => setMobileOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;

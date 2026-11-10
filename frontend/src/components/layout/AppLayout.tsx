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

  const [expanded, setExpanded] = useState(false);
  const [pinned, setPinned] = useState(false);

  const collapsed = !pinned && !expanded;
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const title = pageTitles[location.pathname] ?? "CritaSpace";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Topbar
        title={title}
        isDark={isDark}
        onThemeToggle={toggleTheme}
        onMenuClick={() => setMobileOpen((current) => !current)}
        mobileOpen={mobileOpen}
      />

      <div className="flex min-h-0 flex-1">
        <div
          className="lg:contents"
          onMouseEnter={() => setExpanded(true)}
          onMouseLeave={() => setExpanded(false)}
        >
          <Sidebar
            collapsed={mobileOpen ? false : collapsed}
            pinned={pinned}
            onTogglePin={() => setPinned((current) => !current)}
            mobileOpen={mobileOpen}
          />
        </div>

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;

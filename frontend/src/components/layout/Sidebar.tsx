import {
  LayoutDashboard,
  DoorOpen,
  CalendarDays,
  Building2,
  Users,
  ClipboardList,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";

import critaLogo from "../../assets/brand/LOGO.svg";

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onClose: () => void;
}

const baseLinkStyles =
  "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors";

function Sidebar({ collapsed, mobileOpen, onClose }: SidebarProps) {
  const { user } = useAuth();

  const navigation = [
    {
      label: "Dashboard",
      path: "/",
      icon: LayoutDashboard,
    },
    {
      label: "Boardrooms",
      path: "/boardrooms",
      icon: DoorOpen,
    },
    {
      label: "My Bookings",
      path: "/my-bookings",
      icon: CalendarDays,
    },
  ];

  const adminNavigation = [
    {
      label: "Companies",
      path: "/companies",
      icon: Building2,
    },
    {
      label: "Users",
      path: "/users",
      icon: Users,
    },
    {
      label: "Audit Logs",
      path: "/audit-logs",
      icon: ClipboardList,
    },
  ];

  const renderLink = (item: (typeof navigation)[number]) => {
    const Icon = item.icon;

    return (
      <NavLink
        key={item.path}
        to={item.path}
        onClick={onClose}
        title={collapsed ? item.label : undefined}
        className={({ isActive }) =>
          `${baseLinkStyles} ${
            isActive
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-text-secondary hover:bg-accent/30 hover:text-text-primary"
          } ${collapsed ? "justify-center px-2" : ""}`
        }
      >
        <Icon size={20} className="shrink-0" />
        {!collapsed && <span>{item.label}</span>}
      </NavLink>
    );
  };

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex flex-col",
          "border-r border-border bg-surface",
          "transition-all duration-300 ease-in-out",
          collapsed ? "w-21" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "lg:static lg:z-auto lg:shrink-0",
        ].join(" ")}
      >
        <div className="flex h-20 items-center justify-between border-b border-border px-5">
          <img
            src={critaLogo}
            alt="Crita"
            className="h-10 w-auto max-w-37.5 object-contain"
          />

          <button
            type="button"
            aria-label="Close navigation"
            onClick={onClose}
            className="rounded-lg p-2 text-text-secondary hover:bg-accent/30 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto p-4">
          {navigation.map(renderLink)}

          {user?.role === "global_admin" && (
            <>
              <div className="px-3 pb-1 pt-6">
                {!collapsed && (
                  <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                    Administration
                  </p>
                )}
              </div>

              {adminNavigation.map(renderLink)}
            </>
          )}
        </nav>

        <div className="border-t border-border p-4">
          {!collapsed && (
            <p className="text-xs text-text-secondary">CritaSpace Workspace</p>
          )}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;

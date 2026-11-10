import {
  LayoutDashboard,
  DoorOpen,
  CalendarDays,
  Building2,
  Users,
  ClipboardList,
  Lock,
  Unlock,
  ChevronUp,
  LogOut,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";
import { useState } from "react";

interface SidebarProps {
  collapsed: boolean;
  pinned: boolean;
  onTogglePin: () => void;
  mobileOpen: boolean;
}

const baseLinkStyles =
  "group flex items-center gap-3 overflow-hidden whitespace-nowrap rounded-2xl border border-transparent px-3 py-3.5 text-sm font-semibold transition-[background-color,border-color,color,box-shadow] duration-300 ease-out";

function Sidebar({ collapsed, pinned, onTogglePin, mobileOpen }: SidebarProps) {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
  };

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
        title={collapsed ? item.label : undefined}
        className={({ isActive }) =>
          `${baseLinkStyles} ${
            isActive
              ? "border-[#E1E2CB] bg-[#ECEBCB] text-[#033F2D] shadow-[5px_5px_10px_rgba(3,63,45,0.10),inset_1px_1px_3px_rgba(255,255,255,0.75)] dark:border-[#53634A] dark:bg-[#304437] dark:text-[#D6E151] dark:shadow-[5px_5px_12px_rgba(0,0,0,0.20),inset_1px_1px_3px_rgba(255,255,255,0.06)]"
              : "text-[#64745F] hover:border-[#E8E8D8] hover:bg-[#F2F2E6] hover:text-[#033F2D] dark:text-[#B5C1B1] dark:hover:border-[#344B3D] dark:hover:bg-[#24392D] dark:hover:text-[#D6E151]"
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
      <aside
        className={[
          "fixed top-20 bottom-0 left-0 z-50 flex flex-col overflow-hidden",
          "border-r border-[#E8E8D8] bg-[#FAFAF2] dark:border-[#344B3D] dark:bg-[#14251E]",
          "transition-[width,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[width,transform]",
          mobileOpen ? "w-64" : collapsed ? "w-21" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "lg:static lg:z-auto lg:h-auto lg:shrink-0",
        ].join(" ")}
      >
        <div
          className={`relative hidden h-11 items-center gap-2 lg:my-2 lg:flex ${
            collapsed ? "justify-center px-2" : "justify-end px-4"
          }`}
        >
          {!collapsed && (
            <span className="hidden text-sm font-semibold italic tracking-wide text-[#829078]/50 dark:text-[#91A58F]/75 lg:inline">
              {pinned ? "Unlock sidebar" : "Lock sidebar"}
            </span>
          )}

          <button
            type="button"
            onClick={onTogglePin}
            aria-label={
              pinned ? "Enable hover collapse" : "Keep sidebar expanded"
            }
            aria-pressed={pinned}
            title={pinned ? "Enable hover collapse" : "Keep sidebar expanded"}
            className="hidden size-9 items-center justify-center rounded-xl border border-[#E1E2CB] bg-[#F2F2E6] text-[#033F2D] shadow-[inset_2px_2px_5px_rgba(3,63,45,0.07),inset_-2px_-2px_5px_rgba(255,255,255,0.85)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#B8C78F] hover:text-[#4E6B31] active:translate-y-0 active:shadow-none dark:border-[#405346] dark:bg-[#1C3025] dark:text-[#D6E151] dark:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.18)] lg:flex"
          >
            {pinned ? <Lock size={15} /> : <Unlock size={15} />}
          </button>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto p-4">
          {navigation.map(renderLink)}

          {user?.role === "global_admin" && (
            <>
              <div className="px-3 pb-2 pt-8">
                {!collapsed && (
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#91A083] dark:text-[#849985]">
                    Administration
                  </p>
                )}
              </div>

              {adminNavigation.map(renderLink)}
            </>
          )}
        </nav>

        {/* Desktop profile section */}
        <div className="relative hidden border-t border-[#E8E8D8] p-3 dark:border-[#344B3D] lg:block">
          <button
            type="button"
            onClick={() => setProfileOpen((open) => !open)}
            aria-expanded={profileOpen}
            aria-label="Open profile menu"
            className={`flex w-full items-center rounded-xl p-2 transition-colors hover:bg-[#ECEBCB] dark:hover:bg-[#24392D] ${
              collapsed ? "justify-center" : "gap-3"
            }`}
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </span>

            {!collapsed && (
              <>
                <span className="min-w-0 flex-1 text-left">
                  <span className="block truncate text-sm font-bold text-text-primary">
                    {user?.name}
                  </span>
                  <span className="block truncate text-xs text-text-secondary">
                    {user?.email}
                  </span>
                </span>

                <ChevronUp size={16} className="shrink-0 text-text-secondary" />
              </>
            )}
          </button>

          {profileOpen && (
            <div
              className={`absolute bottom-full z-50 mb-2 overflow-hidden rounded-2xl border border-border bg-surface p-2 shadow-xl ${
                collapsed ? "left-[calc(100%+8px)] w-64" : "left-3 right-3"
              }`}
            >
              <div className="border-b border-border px-3 py-3">
                <p className="truncate text-sm font-bold text-text-primary">
                  {user?.name}
                </p>
                <p className="truncate text-xs text-text-secondary">
                  {user?.email}
                </p>
                <p className="mt-1 text-xs capitalize text-text-secondary">
                  {user?.role?.replace("_", " ")}
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
              >
                <LogOut size={17} />
                Sign out
              </button>
            </div>
          )}
        </div>

        {/* Workspace footer */}
        <div className="border-t border-[#E8E8D8] bg-[#F5F5EA] p-4 dark:border-[#344B3D] dark:bg-[#192B21]">
          {!collapsed && (
            <p className="text-[11px] font-semibold tracking-wide text-[#829078] dark:text-[#91A58F]">
              CritaSpace Workspace
            </p>
          )}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;

import { useState } from "react";
import { Bell, ChevronDown, LogOut, Menu, Moon, Sun, X } from "lucide-react";
import { useAuth } from "../../contexts/useAuth";
import critaLogo from "../../assets/brand/LOGO.svg";

interface TopbarProps {
  onMenuClick: () => void;
  onThemeToggle: () => void;
  isDark: boolean;
  title: string;
  mobileOpen: boolean;
}

function Topbar({
  onMenuClick,
  onThemeToggle,
  isDark,
  mobileOpen,
}: TopbarProps) {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-border bg-surface/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          className="rounded-xl p-2 text-text-secondary transition-colors hover:bg-accent/30 lg:hidden"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <img
          src={critaLogo}
          alt="CritaSpace"
          className="h-6 w-auto max-w-31.25 shrink-0 object-contain xs:h-6 sm:max-w-37.5"
        />
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={isDark}
          aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
          title={isDark ? "Light theme" : "Dark theme"}
          onClick={onThemeToggle}
          className="relative flex h-10 w-17 shrink-0 items-center rounded-full border border-[#E1E2CB] bg-[#ECEBCB] p-1 shadow-[inset_3px_3px_6px_rgba(3,63,45,0.09),inset_-3px_-3px_6px_rgba(255,255,255,0.8),3px_3px_8px_rgba(3,63,45,0.08)] transition-all duration-300 hover:border-[#B8C78F] active:shadow-inner dark:border-[#405346] dark:bg-[#1C3025] dark:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.3),inset_-2px_-2px_5px_rgba(255,255,255,0.04),3px_3px_8px_rgba(0,0,0,0.2)]"
        >
          <span
            className={`flex size-7 items-center justify-center rounded-full bg-[#FAFAF2] text-[#033F2D] shadow-[3px_3px_6px_rgba(3,63,45,0.15),-2px_-2px_5px_rgba(255,255,255,0.9)] transition-transform duration-300 dark:bg-[#304437] dark:text-[#D6E151] dark:shadow-[3px_3px_6px_rgba(0,0,0,0.3)] ${
              isDark ? "translate-x-7" : "translate-x-0"
            }`}
          >
            {isDark ? <Moon size={15} /> : <Sun size={15} />}
          </span>
        </button>

        <button
          type="button"
          aria-label="Notifications"
          title="Notifications"
          className="relative flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#E1E2CB] bg-[#ECEBCB] text-[#033F2D] shadow-[4px_4px_8px_rgba(3,63,45,0.10),inset_1px_1px_3px_rgba(255,255,255,0.8)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#B8C78F] hover:bg-[#E5E8C2] active:translate-y-0 active:shadow-inner dark:border-[#405346] dark:bg-[#1C3025] dark:text-[#D6E151] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.22),inset_1px_1px_3px_rgba(255,255,255,0.04)] dark:hover:bg-[#24392D]"
        >
          <Bell size={19} />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-red-500 ring-2 ring-[#ECEBCB] dark:ring-[#1C3025]" />
        </button>

        <div className="lg:hidden">
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((open) => !open)}
              aria-expanded={profileOpen}
              aria-label="Open profile menu"
              className="flex items-center gap-2 rounded-xl p-1.5 transition-colors hover:bg-accent/30"
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </span>

              <ChevronDown
                size={16}
                className="hidden text-text-secondary sm:block"
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-14 z-50 w-64 overflow-hidden rounded-2xl border border-border bg-surface p-2 shadow-xl">
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
        </div>
      </div>
    </header>
  );
}

export default Topbar;

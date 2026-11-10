import { useState } from "react";
import { Bell, ChevronDown, LogOut, Menu, Moon, Sun } from "lucide-react";
import { useAuth } from "../../contexts/useAuth";

interface TopbarProps {
  onMenuClick: () => void;
  onThemeToggle: () => void;
  isDark: boolean;
  title: string;
}

function Topbar({ onMenuClick, onThemeToggle, isDark, title }: TopbarProps) {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-border bg-surface/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          aria-label="Open navigation"
          onClick={onMenuClick}
          className="rounded-xl p-2 text-text-secondary transition-colors hover:bg-accent/30 lg:hidden"
        >
          <Menu size={22} />
        </button>

        <h1 className="truncate text-xl font-bold text-text-primary sm:text-2xl">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          aria-label="Notifications"
          title="Notifications"
          className="relative flex size-10 items-center justify-center rounded-xl border border-border bg-surface text-text-secondary transition-colors hover:bg-accent/30"
        >
          <Bell size={19} />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-red-500 ring-2 ring-surface" />
        </button>

        <button
          type="button"
          aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
          title={isDark ? "Light theme" : "Dark theme"}
          onClick={onThemeToggle}
          className="flex size-10 items-center justify-center rounded-xl border border-border bg-surface text-text-secondary transition-colors hover:bg-accent/30"
        >
          {isDark ? <Sun size={19} /> : <Moon size={19} />}
        </button>

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
    </header>
  );
}

export default Topbar;

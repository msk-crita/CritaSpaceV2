import { useEffect, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "../../contexts/useAuth";
import { getDashboardSummary } from "./dashboard.service";
import type { DashboardSummary } from "./dashboard.types";

function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { user } = useAuth();
  const isAdmin = user?.role === "global_admin";

  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await getDashboardSummary();

        if (isMounted) {
          setDashboard(data);
        }
      } catch (err) {
        console.error("Failed to load dashboard:", err);

        if (isMounted) {
          setError("Unable to load dashboard data. Please try again.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const changeDate = (days: number) => {
    setSelectedDate((current) => {
      const next = new Date(current);
      next.setDate(next.getDate() + days);
      return next;
    });
  };

  const formattedDate = selectedDate.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const isToday = new Date().toDateString() === selectedDate.toDateString();

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-8">
      {/* Dashboard heading */}
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#033F2D] dark:text-[#F2F2E6] sm:text-3xl">
            Workspace Overview
          </h1>
          <p className="mt-1 text-sm text-[#829078] dark:text-[#A5B3A0]">
            {isAdmin
              ? "Monitor boardrooms and workspace activity across all companies."
              : "View your boardrooms and workspace activity."}
          </p>
        </div>

        {/* Date navigation */}
        <div className="flex items-center gap-2 self-start rounded-2xl border border-[#E1E2CB] bg-[#F2F2E6] p-2 shadow-[4px_4px_10px_rgba(3,63,45,0.08),inset_1px_1px_3px_rgba(255,255,255,0.8)] dark:border-[#344B3D] dark:bg-[#1C3025] dark:shadow-[4px_4px_10px_rgba(0,0,0,0.2)] sm:self-auto">
          <button
            type="button"
            onClick={() => changeDate(-1)}
            aria-label="Previous day"
            className="flex size-9 items-center justify-center rounded-xl text-[#033F2D] transition-colors hover:bg-[#E5E8C2] dark:text-[#D6E151] dark:hover:bg-[#304437]"
          >
            <ChevronLeft size={19} />
          </button>

          <div className="flex min-w-37.5 items-center justify-center gap-2 px-1">
            <CalendarDays
              size={17}
              className="shrink-0 text-[#7FA53F] dark:text-[#D6E151]"
            />
            <span className="text-sm font-semibold text-[#033F2D] dark:text-[#F2F2E6]">
              {isToday ? "Today" : formattedDate}
            </span>
          </div>

          <button
            type="button"
            onClick={() => changeDate(1)}
            aria-label="Next day"
            className="flex size-9 items-center justify-center rounded-xl text-[#033F2D] transition-colors hover:bg-[#E5E8C2] dark:text-[#D6E151] dark:hover:bg-[#304437]"
          >
            <ChevronRight size={19} />
          </button>

          {!isToday && (
            <button
              type="button"
              onClick={() => setSelectedDate(new Date())}
              className="rounded-xl px-3 py-2 text-xs font-semibold text-[#4E6B31] transition-colors hover:bg-[#E5E8C2] dark:text-[#D6E151] dark:hover:bg-[#304437]"
            >
              Today
            </button>
          )}
        </div>
      </section>

      {/* Boardroom overview */}
      {dashboard && (
        <div className="text-xs text-[#829078]">
          Dashboard data loaded successfully.
        </div>
      )}

      {isLoading && (
        <div className="rounded-2xl border border-[#E1E2CB] bg-[#F2F2E6] p-6 text-center text-sm text-[#829078] dark:border-[#344B3D] dark:bg-[#1C3025] dark:text-[#A5B3A0]">
          Loading workspace dashboard...
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
        >
          {error}
        </div>
      )}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-[#033F2D] dark:text-[#F2F2E6]">
            Explore Boardrooms
          </h2>
          <p className="mt-1 text-sm text-[#829078] dark:text-[#A5B3A0]">
            View workspace boardrooms and their availability.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {dashboard?.boardrooms.items.map((boardroom) => (
            <div
              key={boardroom.id}
              className="rounded-2xl border border-[#E5E8D8] bg-[#FAFAF2] p-5 shadow-[0_4px_12px_rgba(3,63,45,0.06)] dark:border-[#35483A] dark:bg-[#1D2B22]"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-bold text-[#033F2D] dark:text-[#F2F2E6]">
                  {boardroom.name}
                </h3>

                <span className="rounded-full bg-[#ECEBCB] px-3 py-1 text-xs font-semibold text-[#033F2D] dark:bg-[#35483A] dark:text-[#D6E151]">
                  Active
                </span>
              </div>

              {boardroom.description && (
                <p className="mt-2 text-sm text-[#829078] dark:text-[#A5B3A0]">
                  {boardroom.description}
                </p>
              )}

              <div className="mt-4 text-sm text-[#033F2D] dark:text-[#F2F2E6]">
                <span className="font-semibold">Capacity:</span>{" "}
                {boardroom.capacity}
              </div>

              {boardroom.facilities.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {boardroom.facilities.map((facility) => (
                    <span
                      key={facility}
                      className="rounded-lg border border-[#DDE3CE] px-2.5 py-1 text-xs text-[#5F7058] dark:border-[#455747] dark:text-[#C1CEB8]"
                    >
                      {facility}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {dashboard && dashboard.boardrooms.items.length === 0 && (
          <p className="rounded-xl bg-[#F1F2E8] px-4 py-6 text-center text-sm text-[#829078] dark:bg-[#26362B] dark:text-[#A5B3A0]">
            No active boardrooms are available.
          </p>
        )}
      </section>

      {/* Upcoming bookings */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-[#033F2D] dark:text-[#F2F2E6]">
            Upcoming Bookings
          </h2>
          <p className="mt-1 text-sm text-[#829078] dark:text-[#A5B3A0]">
            Keep track of scheduled workspace meetings.
          </p>
        </div>

        {/* Booking content will be added here */}
      </section>
    </div>
  );
}

export default DashboardPage;

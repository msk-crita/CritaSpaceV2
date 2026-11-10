import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  CalendarDays,
  UsersRound,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../contexts/useAuth";
import logo from "../../assets/brand/LOGO.svg";
import brandPattern from "../../assets/brand/Brand pattern_5.png";

function getLoginError(error: unknown): string {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (
    message.includes("invalid-credential") ||
    message.includes("wrong-password") ||
    message.includes("user-not-found") ||
    message.includes("invalid email") ||
    message.includes("invalid credentials")
  ) {
    return "The email or password you entered is incorrect.";
  }

  if (message.includes("too-many-requests") || message.includes("too many")) {
    return "Too many sign-in attempts. Please try again later.";
  }

  if (
    message.includes("network-request-failed") ||
    message.includes("network")
  ) {
    return "Unable to connect. Please check your internet connection.";
  }

  if (message.includes("user-disabled")) {
    return "This account has been disabled. Please contact your administrator.";
  }

  return "We couldn't sign you in. Please check your details and try again.";
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [rememberMe, setRememberMe] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const from = (location.state as { from?: { pathname?: string } } | null)?.from
    ?.pathname;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password) {
      setError("Please enter both your email address and password.");
      return;
    }

    setSubmitting(true);

    try {
      await login(normalizedEmail, password);
      navigate(from && from !== "/login" ? from : "/", {
        replace: true,
      });
    } catch (err) {
      setError(getLoginError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#FAFAF2]">
      <div className="grid min-h-screen w-full lg:grid-cols-2">
        {/* LEFT — BRAND EXPERIENCE */}
        <section className="relative hidden min-h-screen flex-col overflow-hidden bg-[#033F2D] px-10 py-8 text-[#ECEBCB] lg:flex xl:px-16 xl:py-10">
          {/* Brand Pattern */}
          <img
            src={brandPattern}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center opacity-30 mix-blend-multiply"
          />

          {/* Ambient Clay Background */}
          <div className="pointer-events-none absolute -right-32 -top-36 h-110 w-110 rounded-full bg-[#4E6B31]/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-24 h-100 w-100 rounded-full bg-[#7FA53F]/20 blur-3xl" />

          {/* Brand Logo */}
          <div className="relative z-10 shrink-0">
            <img
              src={logo}
              alt="CritaSpace"
              className="h-8 w-auto object-contain xl:h-9"
            />
          </div>

          {/* Main Message */}
          <div className="relative z-10 mt-auto mb-0 max-w-xl py-10 lg:py-0">
            {/* Brand Tagline */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#D6E151]/20 bg-[#4E6B31]/40 px-3.5 py-2 text-xs font-medium tracking-wide text-[#D6E151] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.12),2px_3px_8px_rgba(0,0,0,0.12)]">
              <Sparkles size={15} />A better way to work together
            </div>

            {/* Heading */}
            <h1 className="max-w-lg text-3xl font-bold leading-[1.12] tracking-tight text-[#FAFAF2] xl:text-4xl">
              <span className="block text-[#D6E151]">
                Simplify your workspace.
              </span>
            </h1>

            {/* Description */}
            <p className="mt-4 max-w-md text-sm leading-7 text-[#ECEBCB]/75 xl:text-base">
              Bring your people, meeting spaces and schedules together. Make
              every workspace interaction effortless.
            </p>

            {/* Workspace Booking Preview */}
            <div className="relative mt-12 hidden h-60 max-w-110 items-center justify-center sm:flex lg:mt-12 lg:h-64">
              {/* Ambient Glow */}
              <div className="pointer-events-none absolute h-52 w-80 rounded-full bg-[#7FA53F]/20 blur-[70px]" />

              {/* Main Booking Card */}
              <div className="relative z-10 w-75 -rotate-2 rounded-3xl border border-white/15 bg-linear-to-br from-[#285B40] to-[#033F2D] p-3.5 shadow-[10px_16px_32px_rgba(0,0,0,0.28),inset_2px_2px_8px_rgba(255,255,255,0.13)] xl:w-[320px]">
                {/* Card Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-medium tracking-[0.12em] text-[#ECEBCB]/60">
                      WORKSPACE SCHEDULE
                    </p>

                    <h3 className="mt-1 text-lg font-bold text-[#FAFAF2]!">
                      Today's bookings
                    </h3>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-[#D6E151] shadow-[inset_1px_1px_4px_rgba(255,255,255,0.12),2px_3px_6px_rgba(0,0,0,0.15)]">
                    <CalendarDays size={19} />
                  </div>
                </div>

                {/* Date Selector */}
                <div className="mt-3 flex items-center justify-between rounded-xl border border-white/5 bg-black/15 px-3 py-2.5 shadow-inner">
                  <span className="text-xs font-semibold text-[#ECEBCB]">
                    Wednesday, November 11
                  </span>

                  <span className="rounded-lg bg-[#D6E151] px-2.5 py-1 text-[9px] font-bold tracking-wide text-[#033F2D] shadow-sm">
                    TODAY
                  </span>
                </div>

                {/* Booking Slots */}
                <div className="mt-3 space-y-2">
                  {/* Boardroom 01 */}
                  <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.07] px-3 py-2.5 shadow-[inset_1px_1px_3px_rgba(255,255,255,0.04)]">
                    <div className="h-8 w-1 shrink-0 rounded-full bg-[#D6E151]" />

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-white">
                        Boardroom 01
                      </p>

                      <p className="mt-0.5 text-[10px] text-[#ECEBCB]/60">
                        09:00 AM – 10:30 AM
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full bg-[#D6E151]/15 px-2.5 py-1 text-[9px] font-semibold text-[#D6E151]">
                      Booked
                    </span>
                  </div>

                  {/* Boardroom 02 */}
                  <div className="flex items-center gap-3 rounded-xl border border-[#D6E151]/25 bg-[#D6E151]/10 px-3 py-2.5 shadow-[inset_1px_1px_4px_rgba(214,225,81,0.06)]">
                    <div className="h-8 w-1 shrink-0 rounded-full bg-[#7FA53F]" />

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-white">
                        Boardroom 02
                      </p>

                      <p className="mt-0.5 text-[10px] text-[#ECEBCB]/60">
                        11:00 AM – 12:00 PM
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full bg-[#D6E151] px-2.5 py-1 text-[9px] font-bold text-[#033F2D]">
                      Available
                    </span>
                  </div>

                  {/* Boardroom 03 */}
                  <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.07] px-3 py-2.5 shadow-[inset_1px_1px_3px_rgba(255,255,255,0.04)]">
                    <div className="h-8 w-1 shrink-0 rounded-full bg-[#7FA53F]" />

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-white">
                        Boardroom 03
                      </p>

                      <p className="mt-0.5 text-[10px] text-[#ECEBCB]/60">
                        02:00 PM – 03:30 PM
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full bg-[#D6E151]/15 px-2.5 py-1 text-[9px] font-semibold text-[#D6E151]">
                      Booked
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating Confirmation Badge */}
              <div className="absolute -right-1 top-5 z-20 flex items-center gap-2 rounded-2xl border border-white/20 bg-[#ECEBCB] px-3 py-2.5 shadow-[8px_12px_25px_rgba(0,0,0,0.25),inset_2px_2px_5px_rgba(255,255,255,0.9)] xl:-right-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#033F2D] text-[#D6E151] shadow-inner">
                  <ShieldCheck size={17} />
                </div>

                <div>
                  <p className="text-[11px] font-bold text-[#033F2D]">
                    All set!
                  </p>

                  <p className="text-[10px] text-[#4E6B31]">
                    Booking confirmed
                  </p>
                </div>
              </div>

              {/* Floating Team Indicator */}
              <div className="absolute -bottom-1 left-0 z-20 flex items-center gap-2.5 rounded-2xl border border-white/15 bg-[#194B35] px-3 py-2.5 shadow-[8px_12px_24px_rgba(0,0,0,0.24),inset_1px_1px_4px_rgba(255,255,255,0.06)]">
                <div className="flex -space-x-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#194B35] bg-[#D6E151] text-[10px] font-bold text-[#033F2D]">
                    S
                  </div>

                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#194B35] bg-[#ECEBCB] text-[10px] font-bold text-[#033F2D]">
                    A
                  </div>

                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#194B35] bg-[#7FA53F] text-[10px] font-bold text-white">
                    R
                  </div>
                </div>

                <span className="text-[11px] font-medium text-[#ECEBCB]">
                  Teams in sync
                </span>
              </div>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="relative z-10 mt-auto mb-3 hidden grid-cols-3 justify-items-center gap-3 pt-6 lg:grid xl:gap-5">
            <div className="flex items-center gap-2 text-xs text-[#ECEBCB]/80">
              <CalendarDays size={16} className="shrink-0 text-[#D6E151]" />
              <span>Smart booking</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#ECEBCB]/80">
              <UsersRound size={16} className="shrink-0 text-[#D6E151]" />
              <span>Connected teams</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#ECEBCB]/80">
              <ShieldCheck size={16} className="shrink-0 text-[#D6E151]" />
              <span>Secure access</span>
            </div>
          </div>

          {/* Footer */}
          <div className="relative z-10 hidden shrink-0 items-center justify-between border-t border-white/10 pt-4 text-[11px] text-[#ECEBCB]/50 lg:flex">
            <span>© {new Date().getFullYear()} CritaSpace</span>
            <span>Designed for better collaboration</span>
          </div>
        </section>

        {/* RIGHT — SIGN IN */}
        <section className="flex min-h-screen w-full items-center justify-center bg-[#FAFAF2] px-6 py-12 sm:px-12 lg:px-14 xl:px-24">
          <div className="w-full max-w-107.5">
            {/* Mobile logo */}
            <div className="mb-10 flex justify-center lg:hidden">
              <img
                src={logo}
                alt="CritaSpace"
                className="h-6 w-auto object-contain"
              />
            </div>

            {/* Heading */}
            <div className="mb-10 text-center">
              <div className="mx-auto mb-6 flex h-16.5 w-16.5 items-center justify-center rounded-3xl bg-[#ECEBCB] text-[#033F2D] shadow-[7px_7px_16px_rgba(3,63,45,0.10),-6px_-6px_14px_rgba(255,255,255,0.95),inset_1px_1px_3px_rgba(255,255,255,0.8)]">
                <LockKeyhole size={27} strokeWidth={1.7} />
              </div>

              <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#7FA53F]">
                Welcome back
              </p>

              <h2 className="text-4xl font-bold tracking-tight text-[#033F2D] sm:text-[42px]">
                Sign in to your
                <span className="block text-[#4E6B31]">workspace.</span>
              </h2>

              <p className="relative top-2 text-[15px] text-[#687653]">
                Enter your details to continue to CritaSpace.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2.5 block text-sm font-semibold text-[#033F2D]"
                >
                  Email address
                </label>

                <div className="group relative">
                  <Mail
                    size={19}
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-[#7FA53F]"
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setError("");
                    }}
                    required
                    disabled={submitting}
                    className="h-15 w-full rounded-[19px] border border-[#E1E2CB] bg-[#F2F2E6] pl-12 pr-5 text-[15px] text-[#033F2D] shadow-[inset_4px_4px_9px_rgba(3,63,45,0.07),inset_-4px_-4px_9px_rgba(255,255,255,0.85)] outline-none transition-all duration-200 placeholder:text-[#9AA184] hover:border-[#B8C78F] focus:border-[#7FA53F] focus:bg-[#F8F8ED] focus:shadow-[inset_2px_2px_5px_rgba(3,63,45,0.06),0_0_0_4px_rgba(127,165,63,0.12)] disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="mb-2.5 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-[#033F2D]"
                  >
                    Password
                  </label>
                </div>

                <div className="group relative">
                  <LockKeyhole
                    size={19}
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-[#7FA53F]"
                  />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setError("");
                    }}
                    required
                    disabled={submitting}
                    className="h-15 w-full rounded-[19px] border border-[#E1E2CB] bg-[#F2F2E6] pl-12 pr-14 text-[15px] text-[#033F2D] shadow-[inset_4px_4px_9px_rgba(3,63,45,0.07),inset_-4px_-4px_9px_rgba(255,255,255,0.85)] outline-none transition-all duration-200 placeholder:text-[#9AA184] hover:border-[#B8C78F] focus:border-[#7FA53F] focus:bg-[#F8F8ED] focus:shadow-[inset_2px_2px_5px_rgba(3,63,45,0.06),0_0_0_4px_rgba(127,165,63,0.12)] disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    disabled={submitting}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[#7FA53F] transition-colors hover:text-[#033F2D] focus:outline-none focus:ring-2 focus:ring-[#7FA53F]/30"
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center justify-between">
                <label className="group flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    disabled={submitting}
                    className="peer sr-only"
                  />

                  <span className="flex h-5 w-5 items-center justify-center rounded-md border border-[#B8C28D] bg-[#F2F2E6] shadow-[inset_2px_2px_4px_rgba(3,63,45,0.06)] transition-all peer-checked:border-[#033F2D] peer-checked:bg-[#033F2D] peer-focus-visible:ring-4 peer-focus-visible:ring-[#7FA53F]/20">
                    {rememberMe && (
                      <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        className="h-3.5 w-3.5 text-white"
                      >
                        <path
                          d="M4 10L8 14L16 6"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>

                  <span className="text-sm font-medium text-[#4E6B31] transition-colors group-hover:text-[#033F2D]">
                    Remember me
                  </span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-semibold text-[#4E6B31] transition-colors hover:text-[#033F2D] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="rounded-[17px] border border-[#B94343]/20 bg-[#F7E4DF] px-4 py-3.5 text-sm text-[#9C3434] shadow-[inset_2px_2px_5px_rgba(185,67,67,0.04)]"
                >
                  {error}
                </div>
              )}

              {/* Sign in button */}
              <button
                type="submit"
                disabled={submitting || !email.trim() || !password}
                className="group flex h-15.5 w-full items-center justify-center gap-3 rounded-[19px] bg-[#033F2D] px-6 text-[15px] font-bold text-white shadow-[7px_8px_18px_rgba(3,63,45,0.19),-4px_-4px_12px_rgba(255,255,255,0.85),inset_2px_2px_5px_rgba(255,255,255,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#4E6B31] hover:shadow-[9px_12px_22px_rgba(3,63,45,0.22),-4px_-4px_12px_rgba(255,255,255,0.85)] active:translate-y-0 active:scale-[0.99] active:shadow-[inset_4px_4px_9px_rgba(0,0,0,0.2)] focus:outline-none focus:ring-4 focus:ring-[#7FA53F]/20 disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-[#89977D] disabled:opacity-70 disabled:shadow-none"
              >
                {submitting ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing you in...
                  </>
                ) : (
                  <>
                    Sign in to workspace
                    <ArrowRight
                      size={19}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </form>

            {/* Security */}
            <div className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-[#849071]">
              <ShieldCheck size={15} className="shrink-0 text-[#7FA53F]" />
              Your workspace access is protected and secure.
            </div>

            <p className="mt-10 text-center text-xs text-[#9AA184]">
              © {new Date().getFullYear()} CritaSpace
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  MailCheck,
  ShieldCheck,
  Mail,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../../contexts/useAuth";
import logo from "../../assets/brand/LOGO.svg";

function ForgotPasswordPage() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess(false);
    setSubmitting(true);

    try {
      await resetPassword(email.trim());
      setSuccess(true);
    } catch {
      setError(
        "Unable to send the reset email. Check the address and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#033F2D] px-5 py-10 sm:px-8">
      {/* Ambient background effects */}
      <div className="pointer-events-none absolute -left-40 -top-40 size-96 rounded-full bg-[#4E6B31]/30 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 size-96 rounded-full bg-[#7FA53F]/20 blur-[100px]" />

      {/* Main content */}
      <div className="relative z-10 w-full max-w-115">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center">
          <img
            src={logo}
            alt="CritaSpace"
            className="h-8 w-auto object-contain"
          />
        </div>

        {/* Recovery card */}
        <div className="rounded-[28px] border border-white/40 bg-[#ECEBCB] p-6 shadow-[12px_18px_45px_rgba(0,0,0,0.24),inset_2px_2px_8px_rgba(255,255,255,0.9)] sm:p-9">
          {/* Icon */}
          <div className="mx-auto mb-7 flex size-16 items-center justify-center rounded-[22px] border border-[#7FA53F]/15 bg-[#ECEBCB] text-[#033F2D] shadow-[5px_6px_12px_rgba(3,63,45,0.10),inset_2px_2px_5px_rgba(255,255,255,0.9)]">
            <MailCheck size={29} strokeWidth={1.8} />
          </div>

          {/* Heading */}
          <div className="mb-8 gap-3 flex flex-col text-center">
            <h1 className="text-2xl font-bold tracking-tight text-[#033F2D]! sm:text-[28px]">
              Forgot your password?
            </h1>

            <p className="mt-6 text-sm leading-6 text-[#4E6B31]/85">
              No worries! It happens. Enter your registered email address and
              we'll send you a secure link to reset your password.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
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
                className="h-15 w-full rounded-[19px] border border-[#E1E2CB] bg-[#F2F2E6] pl-12 pr-5 text-[15px] text-[#033F2D] shadow-[inset_4px_4px_9px_rgba(3,63,45,0.07),inset_-4px_-4px_9px_rgba(255,255,255,0.85)] outline-none transition-all duration-200 placeholder:text-[#9AA184] hover:border-[#B8C78F] focus:border-[#7FA53F] focus:bg-[#F8F8ED] focus:shadow-[inset_2px_2px_5px_rgba(3,63,45,0.06),0_0_0_4px_rgba(127,165,63,0.12)] disabled:opacity-60 autofill:[-webkit-text-fill-color:#033F2D] autofill:[-webkit-box-shadow:inset_0_0_0_1000px_#F2F2E6] autofill:caret-[#033F2D] [&:-webkit-autofill]:[-webkit-text-fill-color:#033F2D] [&:-webkit-autofill]:[-webkit-box-shadow:inset_0_0_0_1000px_#F2F2E6] [&:-webkit-autofill:focus]:[-webkit-box-shadow:inset_0_0_0_1000px_#F8F8ED]"
              />
            </div>

            {/* Error message */}
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
              >
                {error}
              </div>
            )}

            {/* Success message */}
            {success && (
              <div
                role="status"
                className="flex gap-3 rounded-xl border border-[#7FA53F]/30 bg-[#ECEBCB]/70 px-4 py-4"
              >
                <MailCheck
                  size={21}
                  className="mt-0.5 shrink-0 text-[#4E6B31]"
                />

                <div>
                  <p className="text-sm font-semibold text-[#033F2D]">
                    Check your inbox
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#4E6B31]">
                    If the account is eligible, a password reset email will
                    arrive shortly. Please check your inbox.
                  </p>
                </div>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={submitting || !email.trim()}
              className="group flex h-15.5 w-full items-center justify-center gap-3 rounded-[19px] bg-[#033F2D] px-6 text-[15px] font-bold text-white shadow-[7px_8px_18px_rgba(3,63,45,0.19),-4px_-4px_12px_rgba(255,255,255,0.85),inset_2px_2px_5px_rgba(255,255,255,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#4E6B31] hover:shadow-[9px_12px_22px_rgba(3,63,45,0.22),-4px_-4px_12px_rgba(255,255,255,0.85)] active:translate-y-0 active:scale-[0.99] active:shadow-[inset_4px_4px_9px_rgba(0,0,0,0.2)] focus:outline-none focus:ring-4 focus:ring-[#7FA53F]/20 disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-[#89977D] disabled:opacity-70 disabled:shadow-none"
            >
              {submitting ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Sending reset link...
                </>
              ) : (
                <>
                  Send reset link
                  <ArrowRight
                    size={19}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </>
              )}
            </button>
          </form>

          {/* Back to login */}
          <div className="mt-7 border-t border-[#033F2D]/10 pt-6">
            <Link
              to="/login"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-[#4E6B31] transition-colors hover:text-[#033F2D]"
            >
              <ArrowLeft
                size={16}
                className="transition-transform duration-200 group-hover:-translate-x-1"
              />
              Back to sign in
            </Link>
          </div>
        </div>

        {/* Security note */}
        <div className="mt-7 flex items-center justify-center gap-2 text-xs text-[#ECEBCB]/65">
          <ShieldCheck size={15} />
          <span>Secure account recovery</span>
        </div>

        {/* Footer */}
        <p className="mt-5 text-center text-[11px] text-[#ECEBCB]/45">
          © {new Date().getFullYear()} CritaSpace. All rights reserved.
        </p>
      </div>
    </main>
  );
}

export default ForgotPasswordPage;

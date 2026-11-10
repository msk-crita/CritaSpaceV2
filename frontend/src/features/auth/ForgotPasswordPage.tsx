import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, MailCheck } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../contexts/useAuth";

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
    <main className="flex min-h-screen items-center justify-center bg-app-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            CritaSpace
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Shared workspace, simplified.
          </p>
        </div>

        <Card padding="lg">
          <div className="mb-7">
            <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-accent/30 text-primary">
              <MailCheck size={24} />
            </div>

            <h2 className="text-2xl font-bold text-text-primary">
              Reset your password
            </h2>

            <p className="mt-2 text-sm leading-6 text-text-secondary">
              Enter your account email address. We'll send you a password reset
              link if the account is eligible.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email address"
              name="email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              disabled={submitting}
            />

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            {success && (
              <p
                role="status"
                className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
              >
                If the account is eligible, a password reset email will arrive
                shortly. Please check your inbox.
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={submitting || !email.trim()}
            >
              {submitting ? "Sending..." : "Send reset link"}
            </Button>
          </form>

          <Link
            to="/login"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-text-secondary transition-colors hover:text-primary"
          >
            <ArrowLeft size={16} />
            Back to sign in
          </Link>
        </Card>
      </div>
    </main>
  );
}

export default ForgotPasswordPage;

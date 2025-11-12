import { useState } from "react";
import { sendMagicLink } from "./hooks/useAuth";

/**
 * Props for AuthPrompt component
 */
interface AuthPromptProps {
  /** Callback when auth prompt is dismissed (optional) */
  onDismiss?: () => void;
}

/**
 * Authentication prompt component
 *
 * Modal dialog that prompts users to enter their email address
 * to receive a magic link for authentication. Shows loading and
 * success states during the authentication flow.
 *
 * @example
 * ```typescript
 * const { isAuthenticated } = useAuth();
 *
 * if (!isAuthenticated) {
 *   return <AuthPrompt />;
 * }
 * ```
 */
export function AuthPrompt({ onDismiss }: AuthPromptProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await sendMagicLink(email);
      setEmailSent(true);
    } catch (err) {
      console.error("[DevCaddy] Failed to send magic link:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send magic link. Please try again."
      );
      setLoading(false);
    }
  };

  /**
   * Handle closing the prompt
   */
  const handleClose = () => {
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <div
      className="dev-caddy-auth-prompt-overlay"
      data-dev-caddy
      data-testid="auth-prompt-overlay"
    >
      <div className="dev-caddy-auth-prompt" data-testid="auth-prompt">
        {!emailSent ? (
          <>
            <div className="auth-prompt-header">
              <h2>Sign in to DevCaddy</h2>
              <p>Enter your email to receive a magic link</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-prompt-form">
              <div className="form-group">
                <label htmlFor="auth-email">Email Address</label>
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={loading}
                  autoFocus
                  required
                  data-testid="email-input"
                />
              </div>

              {error && <div className="auth-prompt-error">{error}</div>}

              <div className="auth-prompt-actions">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  data-testid="send-magic-link"
                >
                  {loading ? "Sending..." : "Send Magic Link"}
                </button>
                {onDismiss && (
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                    className="btn-secondary"
                    data-testid="cancel-auth"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="auth-prompt-info">
              <p>
                <strong>Note:</strong> Your team lead must have added your email
                to the DevCaddy users in Supabase.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="auth-prompt-success" data-testid="auth-success">
              <div className="success-icon">✓</div>
              <h2>Check Your Email</h2>
              <p>
                We've sent a magic link to <strong>{email}</strong>
              </p>
              <p>
                Click the link in the email to sign in to DevCaddy. The link is
                valid for 1 hour.
              </p>
            </div>

            <div className="auth-prompt-actions">
              {onDismiss && (
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn-secondary"
                  data-testid="close-auth"
                >
                  Close
                </button>
              )}
            </div>

            <div className="auth-prompt-info">
              <p>
                <strong>Didn't receive the email?</strong> Check your spam
                folder or{" "}
                <button
                  type="button"
                  onClick={() => {
                    setEmailSent(false);
                    setEmail("");
                  }}
                  className="link-button"
                >
                  try again
                </button>
                .
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

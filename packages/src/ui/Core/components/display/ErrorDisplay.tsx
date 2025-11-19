/**
 * Props for ErrorDisplay component
 */
export interface ErrorDisplayProps {
  /** Error object or error message string */
  error: Error | string;
  /** Optional retry callback */
  onRetry?: () => void;
  /** Additional CSS class name */
  className?: string;
}

/**
 * Error display component
 *
 * Displays an error message with an optional retry button.
 * Accepts either an Error object or a string message.
 *
 * @example
 * ```tsx
 * <ErrorDisplay error="Failed to load data." />
 * <ErrorDisplay
 *   error={new Error("Network error")}
 *   onRetry={handleRetry}
 * />
 * ```
 */
export function ErrorDisplay({ error, onRetry, className = "" }: ErrorDisplayProps) {
  const errorMessage = typeof error === "string" ? error : error.message;

  return (
    <div className={`error ${className}`.trim()} data-testid="error-display">
      <p>Error: {errorMessage}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="retry-button"
          data-testid="error-retry-button"
        >
          Retry
        </button>
      )}
    </div>
  );
}

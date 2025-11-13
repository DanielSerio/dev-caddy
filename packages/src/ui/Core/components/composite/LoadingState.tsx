/**
 * Props for LoadingState component
 */
export interface LoadingStateProps {
  /** Loading message to display */
  message?: string;
  /** Size of the loading indicator */
  size?: "small" | "medium" | "large";
  /** Additional CSS class name */
  className?: string;
}

/**
 * Loading state composite component
 *
 * Displays a centered loading indicator with optional message.
 * Provides consistent loading states across the application.
 *
 * @example
 * ```tsx
 * <LoadingState />
 * <LoadingState message="Loading annotations..." />
 * <LoadingState message="Saving..." size="small" />
 * ```
 */
export function LoadingState({
  message = "Loading...",
  size = "medium",
  className = "",
}: LoadingStateProps) {
  const sizeClasses = {
    small: "loading-small",
    medium: "loading-medium",
    large: "loading-large",
  };

  return (
    <div
      className={`loading-state ${sizeClasses[size]} ${className}`.trim()}
      data-testid="loading-state"
    >
      <div className="loading-spinner" data-testid="loading-spinner">
        ⏳
      </div>
      {message && (
        <p className="loading-message" data-testid="loading-message">
          {message}
        </p>
      )}
    </div>
  );
}

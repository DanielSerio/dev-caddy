import type { ReactNode } from "react";

/**
 * Props for EmptyState component
 */
export interface EmptyStateProps {
  /** Message to display */
  message: string;
  /** Optional icon or element to display above message */
  icon?: ReactNode;
  /** Additional CSS class name */
  className?: string;
}

/**
 * Empty state component
 *
 * Displays a message when there is no data to show.
 * Optionally includes an icon or illustration.
 *
 * @example
 * ```tsx
 * <EmptyState message="No annotations yet." />
 * <EmptyState
 *   message="No results found."
 *   icon={<SearchIcon />}
 * />
 * ```
 */
export function EmptyState({ message, icon, className = "" }: EmptyStateProps) {
  return (
    <div className={`empty-state ${className}`.trim()} data-testid="empty-state">
      {icon && <div className="empty-state-icon">{icon}</div>}
      <p>{message}</p>
    </div>
  );
}

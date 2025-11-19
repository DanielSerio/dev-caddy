import { getStatusName } from "../../lib/status";

/**
 * Props for StatusBadge component
 */
export interface StatusBadgeProps {
  /** Status ID (1 = Open, 2 = In Progress, 3 = Resolved) */
  statusId: number;
  /** Additional CSS class name */
  className?: string;
}

/**
 * Status badge component
 *
 * Displays a status badge with appropriate styling based on status ID.
 * Uses the `status-{statusName}` class for styling.
 *
 * @example
 * ```tsx
 * <StatusBadge statusId={1} />
 * <StatusBadge statusId={2} className="custom-class" />
 * ```
 */
export function StatusBadge({ statusId, className = "" }: StatusBadgeProps) {
  const statusName = getStatusName(statusId);

  return (
    <span
      className={`annotation-status status-${statusName} ${className}`.trim()}
      data-testid="status-badge"
    >
      {statusName}
    </span>
  );
}

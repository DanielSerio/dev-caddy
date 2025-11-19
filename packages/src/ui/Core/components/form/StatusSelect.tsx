import { getStatusName } from "../../lib/status";
import { ANNOTATION_STATUS } from "../../../../types/annotations";

/**
 * Props for StatusSelect component
 */
export interface StatusSelectProps {
  /** Current status ID */
  value: number;
  /** Callback when status changes */
  onChange: (statusId: number) => void;
  /** Whether the select is disabled */
  disabled?: boolean;
  /** Additional CSS class name */
  className?: string;
}

/**
 * Status select component
 *
 * Dropdown for selecting annotation status. The select element
 * is styled with the current status color.
 *
 * @example
 * ```tsx
 * <StatusSelect
 *   value={statusId}
 *   onChange={(newStatus) => handleStatusChange(newStatus)}
 * />
 * ```
 */
export function StatusSelect({
  value,
  onChange,
  disabled = false,
  className = "",
}: StatusSelectProps) {
  const statusName = getStatusName(value);

  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      disabled={disabled}
      className={`annotation-status status-${statusName} ${className}`.trim()}
      data-testid="status-select"
    >
      <option value={ANNOTATION_STATUS.NEW}>New</option>
      <option value={ANNOTATION_STATUS.IN_PROGRESS}>In Progress</option>
      <option value={ANNOTATION_STATUS.IN_REVIEW}>In Review</option>
      <option value={ANNOTATION_STATUS.HOLD}>Hold</option>
      <option value={ANNOTATION_STATUS.RESOLVED}>Resolved</option>
    </select>
  );
}

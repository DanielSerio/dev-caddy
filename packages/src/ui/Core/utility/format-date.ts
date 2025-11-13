/**
 * Options for formatting dates
 */
export interface FormatDateOptions {
  /** Whether to include time in the output (default: true) */
  includeTime?: boolean;
  /** Whether to use relative time format like "2 hours ago" (default: false) */
  relative?: boolean;
}

/**
 * Format an ISO 8601 date string for display
 *
 * @param isoString - ISO 8601 formatted date string
 * @param options - Formatting options
 * @returns Formatted date string
 *
 * @example
 * // Default: full date and time
 * formatDate('2025-11-13T10:30:00Z')
 * // "11/13/2025 10:30:00 AM"
 *
 * @example
 * // Date only
 * formatDate('2025-11-13T10:30:00Z', { includeTime: false })
 * // "11/13/2025"
 *
 * @example
 * // Relative time
 * formatDate('2025-11-13T10:30:00Z', { relative: true })
 * // "2 hours ago" or "Just now"
 */
export function formatDate(isoString: string, options: FormatDateOptions = {}): string {
  const { includeTime = true, relative = false } = options;
  const date = new Date(isoString);

  if (relative) {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    // Fall through to absolute date for older dates
  }

  const dateString = date.toLocaleDateString();
  const timeString = date.toLocaleTimeString();

  return includeTime ? `${dateString} ${timeString}` : dateString;
}

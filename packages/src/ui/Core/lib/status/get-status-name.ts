/**
 * Get human-readable status name from status ID
 *
 * Maps numeric status IDs from the database to their string representations.
 * Status IDs correspond to rows in the annotation_status table.
 *
 * @param statusId - Numeric status ID (1-5)
 * @returns Human-readable status name ('new', 'in-progress', etc.)
 *
 * @example
 * ```typescript
 * getStatusName(1); // 'new'
 * getStatusName(5); // 'resolved'
 * getStatusName(99); // 'unknown'
 * ```
 */
export function getStatusName(statusId: number): string {
  const statusMap: Record<number, string> = {
    1: 'new',
    2: 'in-progress',
    3: 'in-review',
    4: 'hold',
    5: 'resolved',
  };
  return statusMap[statusId] || 'unknown';
}

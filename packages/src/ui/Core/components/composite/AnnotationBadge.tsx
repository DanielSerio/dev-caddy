import type { Annotation } from "../../../../types/annotations";
import { PageBadge } from "../badges/PageBadge";
import { StatusBadge } from "../badges/StatusBadge";

/**
 * Props for AnnotationBadge component
 */
export interface AnnotationBadgeProps {
  /** The annotation to display badges for */
  annotation: Annotation;
  /** Show page badge */
  showPage?: boolean;
  /** Show status badge */
  showStatus?: boolean;
  /** Additional CSS class name */
  className?: string;
}

/**
 * Annotation badge composite component
 *
 * Combines PageBadge and StatusBadge into a flexible badge group.
 * Allows showing/hiding individual badges as needed.
 *
 * @example
 * ```tsx
 * // Show both badges
 * <AnnotationBadge annotation={annotation} showPage showStatus />
 *
 * // Show only status
 * <AnnotationBadge annotation={annotation} showStatus />
 *
 * // Show page with full path
 * <AnnotationBadge annotation={annotation} showPage showFullPath />
 * ```
 */
export function AnnotationBadge({
  annotation,
  showPage = true,
  showStatus = true,
  className = "",
}: AnnotationBadgeProps) {
  // If nothing to show, return null
  if (!showPage && !showStatus) {
    return null;
  }

  return (
    <div
      className={`annotation-badges ${className}`.trim()}
      data-testid="annotation-badge"
    >
      {showStatus && <StatusBadge statusId={annotation.status_id} />}
      {showPage && <PageBadge annotation={annotation} />}
    </div>
  );
}

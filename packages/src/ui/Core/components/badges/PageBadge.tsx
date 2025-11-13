import { isCurrentPage } from "../../utility/navigation";
import type { Annotation } from "../../../../types/annotations";

/**
 * Props for PageBadge component
 */
export interface PageBadgeProps {
  /** The annotation containing page information */
  annotation: Annotation;
  /** Whether to show the full path or "Current Page" label */
  showFullPath?: boolean;
  /** Additional CSS class name */
  className?: string;
}

/**
 * Page badge component
 *
 * Displays a badge indicating which page the annotation belongs to.
 * Shows "Current Page" for annotations on the current page, or the page path for others.
 *
 * @example
 * ```tsx
 * <PageBadge annotation={annotation} />
 * <PageBadge annotation={annotation} showFullPath={true} />
 * ```
 */
export function PageBadge({
  annotation,
  showFullPath = false,
  className = "",
}: PageBadgeProps) {
  const isCurrent = isCurrentPage(annotation);
  const pageLabel = isCurrent && !showFullPath ? "Current Page" : annotation.page;

  return (
    <span
      className={`annotation-page-badge ${
        isCurrent ? "current-page" : "other-page"
      } ${className}`.trim()}
      data-testid="page-badge"
    >
      {pageLabel}
    </span>
  );
}

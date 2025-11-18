import { getStatusName } from "../../Core/lib/status";
import { sanitizeContent } from "../../Core/utility";
import { AnnotationBadge, AnnotationMeta } from "../../Core/components/composite";
import type { Annotation } from "../../../types/annotations";

/**
 * Props for AnnotationListItem component
 */
export interface AnnotationListItemProps {
  /** The annotation to display */
  annotation: Annotation;
  /** Callback when the item is clicked */
  onClick: (annotation: Annotation) => void;
  /** Additional CSS class name */
  className?: string;
}

/**
 * Annotation list item component for client mode
 *
 * Displays a single annotation item in the client annotation list.
 * Shows the element selector, content preview, page badge, status badge,
 * and metadata.
 *
 * @example
 * ```tsx
 * <AnnotationListItem
 *   annotation={annotation}
 *   onClick={handleSelect}
 * />
 * ```
 */
export function AnnotationListItem({
  annotation,
  onClick,
  className = "",
}: AnnotationListItemProps) {
  return (
    <div
      className={`annotation-item status-${getStatusName(
        annotation.status_id
      )} ${className}`.trim()}
      onClick={() => onClick(annotation)}
      data-testid="annotation-list-item"
    >
      <div className="annotation-header">
        <AnnotationBadge annotation={annotation} showPage showStatus />
      </div>

      <div className="annotation-content">
        <p>{sanitizeContent(annotation.content)}</p>
      </div>

      <AnnotationMeta annotation={annotation} showUpdated={false} />
    </div>
  );
}

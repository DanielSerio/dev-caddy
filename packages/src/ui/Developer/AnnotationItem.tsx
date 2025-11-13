import { getStatusName } from "../Core/lib/status";
import { formatDate, formatElementSelector, sanitizeContent } from "../Core/utility";
import { isCurrentPage } from "../Core/utility/navigation";
import type { Annotation } from "../../types/annotations";

/**
 * Props for AnnotationItem component
 */
interface AnnotationItemProps {
  /** The annotation to display */
  annotation: Annotation;
  /** Callback when annotation is clicked */
  onClick: (annotation: Annotation) => void;
}

/**
 * Single annotation item display component
 *
 * Displays a single annotation in the list with:
 * - Element selector information
 * - Status badge
 * - Content preview
 * - Author and date metadata
 *
 * @example
 * <AnnotationItem
 *   annotation={annotation}
 *   onClick={handleSelectAnnotation}
 * />
 */
export function AnnotationItem({ annotation, onClick }: AnnotationItemProps) {
  return (
    <div
      className={`annotation-item status-${getStatusName(
        annotation.status_id
      )}`}
      onClick={() => onClick(annotation)}
      data-testid="annotation-list-item"
    >
      <div className="annotation-header">
        <span className="annotation-element">
          {formatElementSelector(annotation)}
        </span>
        <div className="annotation-badges">
          <span
            className={`annotation-page-badge ${
              isCurrentPage(annotation) ? "current-page" : "other-page"
            }`}
          >
            {isCurrentPage(annotation) ? "Current Page" : annotation.page}
          </span>
          <span
            className={`annotation-status status-${getStatusName(
              annotation.status_id
            )}`}
          >
            {getStatusName(annotation.status_id)}
          </span>
        </div>
      </div>

      <div className="annotation-content">
        <p>{sanitizeContent(annotation.content)}</p>
      </div>

      <div className="annotation-meta">
        <span className="annotation-author">
          By: {annotation.created_by_email || annotation.created_by}
        </span>
        <span className="annotation-date">
          {formatDate(annotation.created_at)}
        </span>
        {annotation.updated_at !== annotation.created_at && (
          <span className="annotation-updated">
            Updated: {formatDate(annotation.updated_at)}
          </span>
        )}
        {annotation.resolved_at && (
          <span className="annotation-resolved">
            Resolved: {formatDate(annotation.resolved_at)}
          </span>
        )}
      </div>
    </div>
  );
}

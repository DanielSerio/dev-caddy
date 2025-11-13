import { getStatusName } from "../Core/lib/status";
import { sanitizeContent } from "../Core/utility/sanitize";
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
  /**
   * Format date for display
   */
  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

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
          {annotation.element_tag}
          {annotation.element_id && `#${annotation.element_id}`}
          {annotation.element_role && ` [${annotation.element_role}]`}
        </span>
        <span
          className={`annotation-status status-${getStatusName(
            annotation.status_id
          )}`}
        >
          {getStatusName(annotation.status_id)}
        </span>
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

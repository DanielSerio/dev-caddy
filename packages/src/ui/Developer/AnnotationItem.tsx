import { getStatusName } from "../Core/lib/status";
import { sanitizeContent } from "../Core/utility";
import type { Annotation } from "../../types/annotations";
import { AnnotationBadge, AnnotationMeta } from "../Core/components";

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
        <AnnotationBadge annotation={annotation} showPage showStatus />
      </div>

      <div className="annotation-content">
        <p>{sanitizeContent(annotation.content)}</p>
      </div>

      <AnnotationMeta
        annotation={annotation}
        showUpdated={annotation.updated_at !== annotation.created_at}
      />
    </div>
  );
}

import type { Annotation } from "../../../../types/annotations";
import { formatDate } from "../../utility/format-date";

/**
 * Props for AnnotationMeta component
 */
export interface AnnotationMetaProps {
  /** The annotation to display metadata for */
  annotation: Annotation;
  /** Show updated_at instead of created_at */
  showUpdated?: boolean;
  /** Additional CSS class name */
  className?: string;
}

/**
 * Annotation metadata composite component
 *
 * Displays author and timestamp information for an annotation.
 * Can show either created or updated timestamp.
 *
 * @example
 * ```tsx
 * <AnnotationMeta annotation={annotation} />
 * <AnnotationMeta annotation={annotation} showUpdated />
 * ```
 */
export function AnnotationMeta({
  annotation,
  showUpdated = false,
  className = "",
}: AnnotationMetaProps) {
  const timestamp = showUpdated ? annotation.updated_at : annotation.created_at;
  const label = showUpdated ? "Updated" : "Created";

  return (
    <div className={`annotation-meta ${className}`.trim()} data-testid="annotation-meta">
      <span className="annotation-meta-author" data-testid="annotation-author">
        {annotation.author}
      </span>
      <span className="annotation-meta-separator">•</span>
      <span className="annotation-meta-date" data-testid="annotation-date">
        <span className="annotation-meta-label">{label}:</span> {formatDate(timestamp)}
      </span>
    </div>
  );
}

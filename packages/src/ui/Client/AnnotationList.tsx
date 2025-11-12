import { useAnnotations } from "../Core/context";
import { getStatusName } from "../Core/lib/status";
import { ANNOTATION_STATUS } from "../../types/annotations";
import { Skeleton } from "../Core";

/**
 * Props for AnnotationList component
 */
interface AnnotationListProps {
  /** Current user ID to filter annotations */
  currentUserId: string;
}

/**
 * Annotation list component for client (reviewer) mode
 *
 * Displays only the current user's annotations with basic actions:
 * - View annotation details
 * - Mark as resolved
 * - Delete own annotations
 *
 * @example
 * <AnnotationList currentUserId="user-123" />
 */
export function AnnotationList({ currentUserId }: AnnotationListProps) {
  const { annotations, updateAnnotation, deleteAnnotation, loading, error } =
    useAnnotations();

  // Filter to show only user's own annotations
  const userAnnotations = annotations.filter(
    (a) => a.created_by === currentUserId
  );

  /**
   * Handle marking annotation as resolved
   */
  const handleResolve = async (id: number) => {
    try {
      await updateAnnotation(id, { status_id: ANNOTATION_STATUS.RESOLVED });
    } catch (err) {
      console.error("Failed to resolve annotation:", err);
    }
  };

  /**
   * Handle deleting annotation
   */
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this annotation?")) {
      return;
    }

    try {
      await deleteAnnotation(id);
    } catch (err) {
      console.error("Failed to delete annotation:", err);
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="dev-caddy-annotation-list">
        <Skeleton variant="text" />
        <Skeleton variant="text" />
        <Skeleton variant="text" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="dev-caddy-annotation-list">
        <p className="error">Error: {error.message}</p>
      </div>
    );
  }

  if (userAnnotations.length === 0) {
    return (
      <div className="dev-caddy-annotation-list">
        <p className="empty-state">
          No annotations yet. Click "Add Annotation" to create your first one.
        </p>
      </div>
    );
  }

  return (
    <div className="dev-caddy-annotation-list">
      <h3>My Annotations ({userAnnotations.length})</h3>
      <div className="annotation-items">
        {userAnnotations.map((annotation) => (
          <div
            key={annotation.id}
            className={`annotation-item status-${getStatusName(
              annotation.status_id
            )}`}
          >
            <div className="annotation-header">
              <span className="annotation-element">
                {annotation.element_tag}
                {annotation.element_id && `#${annotation.element_id}`}
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
              <p>{annotation.content}</p>
            </div>

            <footer>
              <div className="annotation-meta">
                <span className="annotation-date">
                  {formatDate(annotation.created_at)}
                </span>
                {annotation.resolved_at && (
                  <span className="annotation-resolved">
                    Resolved: {formatDate(annotation.resolved_at)}
                  </span>
                )}
              </div>

              <div className="annotation-actions">
                {annotation.status_id !== ANNOTATION_STATUS.RESOLVED && (
                  <button
                    onClick={() => handleResolve(annotation.id)}
                    className="btn-resolve"
                    title="Mark as resolved"
                  >
                    Resolve
                  </button>
                )}
                <button
                  onClick={() => handleDelete(annotation.id)}
                  className="btn-delete"
                  title="Delete annotation"
                >
                  Delete
                </button>
              </div>
            </footer>
          </div>
        ))}
      </div>
    </div>
  );
}

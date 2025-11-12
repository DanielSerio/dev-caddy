import { useState } from "react";
import { useAnnotations } from "../Core/context";
import { getStatusName } from "../Core/lib/status";
import type { Annotation } from "../../types/annotations";

/**
 * Props for AnnotationDetail component
 */
interface AnnotationDetailProps {
  /** The annotation to display */
  annotation: Annotation;
  /** Callback to navigate back to list */
  onBack: () => void;
  /** Current user ID for permission checks */
  currentUserId: string;
}

/**
 * Annotation detail view component for client (reviewer) mode
 *
 * Displays full details of a single annotation with edit and delete actions.
 * Clients can only edit content and delete their own annotations.
 *
 * @example
 * <AnnotationDetail annotation={annotation} onBack={() => {}} currentUserId="user-123" />
 */
export function AnnotationDetail({
  annotation,
  onBack,
}: AnnotationDetailProps) {
  const { updateAnnotation, deleteAnnotation } = useAnnotations();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(annotation.content);

  /**
   * Handle saving edited content
   */
  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      alert("Annotation content cannot be empty");
      return;
    }

    try {
      await updateAnnotation(annotation.id, { content: editContent });
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update annotation:", err);
      alert("Failed to update annotation. Please try again.");
    }
  };

  /**
   * Handle deleting annotation
   */
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this annotation?")) {
      return;
    }

    try {
      await deleteAnnotation(annotation.id);
      onBack(); // Navigate back after deletion
    } catch (err) {
      console.error("Failed to delete annotation:", err);
      alert("Failed to delete annotation. Please try again.");
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const statusName = getStatusName(annotation.status_id);

  return (
    <div className="dev-caddy-annotation-detail">
      <div className="detail-header">
        <button
          onClick={onBack}
          className="btn-back"
          data-testid="back-to-list-btn"
        >
          ← Back
        </button>
        <h3>Annotation Details</h3>
      </div>

      <div className="detail-content">
        <div className="detail-section">
          <label className="detail-label">Element</label>
          <div className="detail-value element-info">
            <code>
              {annotation.element_tag}
              {annotation.element_id && `#${annotation.element_id}`}
              {annotation.element_test_id &&
                ` [data-testid="${annotation.element_test_id}"]`}
            </code>
          </div>
        </div>

        <div className="detail-section">
          <label className="detail-label">Status</label>
          <div className="detail-value">
            <span className={`annotation-status status-${statusName}`}>
              {statusName}
            </span>
          </div>
        </div>

        <div className="detail-section">
          <label className="detail-label">Feedback</label>
          <div className="detail-value">
            {isEditing ? (
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                autoFocus
                data-testid="annotation-edit-textarea"
                className="detail-textarea"
              />
            ) : (
              <p className="annotation-content">{annotation.content}</p>
            )}
          </div>
        </div>

        <div className="detail-section">
          <label className="detail-label">Created</label>
          <div className="detail-value">
            <span className="detail-date">{formatDate(annotation.created_at)}</span>
          </div>
        </div>

        {annotation.resolved_at && (
          <div className="detail-section">
            <label className="detail-label">Resolved</label>
            <div className="detail-value">
              <span className="detail-date">
                {formatDate(annotation.resolved_at)}
              </span>
            </div>
          </div>
        )}

        {annotation.element_parent_selector && (
          <div className="detail-section">
            <label className="detail-label">Parent Selector</label>
            <div className="detail-value">
              <code className="selector-code">
                {annotation.element_parent_selector}
              </code>
            </div>
          </div>
        )}
      </div>

      <div className="detail-actions">
        {isEditing ? (
          <>
            <button
              onClick={handleSaveEdit}
              className="btn-save"
              title="Save changes"
              data-testid="save-annotation-btn"
            >
              Save
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditContent(annotation.content);
              }}
              className="btn-cancel"
              title="Cancel editing"
              data-testid="cancel-edit-btn"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="btn-edit"
              title="Edit annotation"
              data-testid="edit-annotation-btn"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="btn-delete"
              title="Delete annotation"
              data-testid="delete-annotation-btn"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}

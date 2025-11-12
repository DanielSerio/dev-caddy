import { useState } from "react";
import { useAnnotations } from "../Core/context";
import { getStatusName } from "../Core/lib/status";
import { ANNOTATION_STATUS } from "../../types/annotations";
import { sanitizeContent } from "../Core/utility/sanitize";
import type { Annotation } from "../../types/annotations";

/**
 * Props for AnnotationDetail component
 */
interface AnnotationDetailProps {
  /** The annotation to display */
  annotation: Annotation;
  /** Callback to navigate back to list */
  onBack: () => void;
}

/**
 * Annotation detail view component for developer mode
 *
 * Displays full details of a single annotation with developer actions:
 * - Change annotation status
 * - Edit annotation content
 * - Delete any annotation
 *
 * @example
 * <AnnotationDetail annotation={annotation} onBack={() => {}} />
 */
export function AnnotationDetail({ annotation, onBack }: AnnotationDetailProps) {
  const { updateAnnotation, deleteAnnotation } = useAnnotations();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(annotation.content);
  const [statusId, setStatusId] = useState(annotation.status_id);

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
   * Handle status change
   */
  const handleStatusChange = async (newStatusId: number) => {
    try {
      await updateAnnotation(annotation.id, { status_id: newStatusId });
      setStatusId(newStatusId);
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update status. Please try again.");
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

  const statusName = getStatusName(statusId);

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
              {annotation.element_role && ` [role="${annotation.element_role}"]`}
            </code>
          </div>
        </div>

        <div className="detail-section">
          <label className="detail-label">Status</label>
          <div className="detail-value">
            <select
              value={statusId}
              onChange={(e) => handleStatusChange(Number(e.target.value))}
              className={`annotation-status status-${statusName}`}
              data-testid="annotation-status-select"
            >
              <option value={ANNOTATION_STATUS.NEW}>New</option>
              <option value={ANNOTATION_STATUS.IN_PROGRESS}>In Progress</option>
              <option value={ANNOTATION_STATUS.IN_REVIEW}>In Review</option>
              <option value={ANNOTATION_STATUS.HOLD}>Hold</option>
              <option value={ANNOTATION_STATUS.RESOLVED}>Resolved</option>
            </select>
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
              <p className="annotation-content">{sanitizeContent(annotation.content)}</p>
            )}
          </div>
        </div>

        <div className="detail-section">
          <label className="detail-label">Author</label>
          <div className="detail-value">
            <span className="detail-author">{annotation.created_by}</span>
          </div>
        </div>

        <div className="detail-section">
          <label className="detail-label">Created</label>
          <div className="detail-value">
            <span className="detail-date">{formatDate(annotation.created_at)}</span>
          </div>
        </div>

        {annotation.updated_at !== annotation.created_at && (
          <div className="detail-section">
            <label className="detail-label">Updated</label>
            <div className="detail-value">
              <span className="detail-date">
                {formatDate(annotation.updated_at)}
              </span>
            </div>
          </div>
        )}

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

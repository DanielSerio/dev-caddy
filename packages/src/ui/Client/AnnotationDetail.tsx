import { useState, useEffect } from "react";
import { useAnnotations } from "../Core/context";
import { getStatusName } from "../Core/lib/status";
import { sanitizeContent } from "../Core/utility";
import type { Annotation } from "../../types/annotations";
import { BackButton } from "../Core/components/button";
import { DetailSection } from "../Core/components/layout";
import { ElementCode } from "../Core/components/display";
import { TextArea } from "../Core/components/form";
import { ActionButton } from "../Core/components/button";
import { AnnotationMeta } from "../Core/components/composite";

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
   * Sync local state when annotation prop changes (real-time updates)
   */
  useEffect(() => {
    setEditContent(annotation.content);
  }, [annotation.content]);

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

  const statusName = getStatusName(annotation.status_id);

  return (
    <div className="dev-caddy-annotation-detail">
      <div className="detail-header">
        <BackButton onClick={onBack} />
        <h3>Annotation Details</h3>
      </div>

      <div className="detail-content">
        <DetailSection label="Element">
          <ElementCode annotation={annotation} />
        </DetailSection>

        <DetailSection label="Status">
          <span className={`annotation-status status-${statusName}`}>
            {statusName}
          </span>
        </DetailSection>

        <DetailSection label="Feedback">
          {isEditing ? (
            <TextArea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              autoFocus
              data-testid="annotation-edit-textarea"
              className="detail-textarea"
            />
          ) : (
            <p className="annotation-content">{sanitizeContent(annotation.content)}</p>
          )}
        </DetailSection>

        <AnnotationMeta annotation={annotation} showUpdated={false} />

        {annotation.resolved_at && (
          <DetailSection label="Resolved">
            <span className="detail-date">
              {new Date(annotation.resolved_at).toLocaleString()}
            </span>
          </DetailSection>
        )}

        {annotation.element_parent_selector && (
          <DetailSection label="Parent Selector">
            <code className="selector-code">
              {annotation.element_parent_selector}
            </code>
          </DetailSection>
        )}
      </div>

      <div className="detail-actions">
        {isEditing ? (
          <>
            <ActionButton
              variant="primary"
              onClick={handleSaveEdit}
              title="Save changes"
              data-testid="save-annotation-btn"
            >
              Save
            </ActionButton>
            <ActionButton
              variant="secondary"
              onClick={() => {
                setIsEditing(false);
                setEditContent(annotation.content);
              }}
              title="Cancel editing"
              data-testid="cancel-edit-btn"
            >
              Cancel
            </ActionButton>
          </>
        ) : (
          <>
            <ActionButton
              variant="secondary"
              onClick={() => setIsEditing(true)}
              title="Edit annotation"
              data-testid="edit-annotation-btn"
            >
              Edit
            </ActionButton>
            <ActionButton
              variant="danger"
              onClick={handleDelete}
              title="Delete annotation"
              data-testid="delete-annotation-btn"
            >
              Delete
            </ActionButton>
          </>
        )}
      </div>
    </div>
  );
}

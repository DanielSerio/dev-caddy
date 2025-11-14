import { useState, useEffect } from "react";
import { useAnnotations } from "../Core/context";
import type { Annotation } from "../../types/annotations";
import { DetailSection } from "../Core/components/layout";
import { StatusSelect } from "../Core/components/form";
import { AnnotationMeta } from "../Core/components/composite";
import {
  AnnotationDetailHeader,
  AnnotationDetailContent,
  AnnotationContentEditor,
  AnnotationDetailActions,
} from "../Core/components/annotation";

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
   * Sync local state when annotation prop changes (real-time updates)
   */
  useEffect(() => {
    setEditContent(annotation.content);
    setStatusId(annotation.status_id);
  }, [annotation.content, annotation.status_id]);

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
   * Handle canceling edit
   */
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(annotation.content);
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

  return (
    <div className="dev-caddy-annotation-detail">
      <AnnotationDetailHeader onBack={onBack} />

      <div className="detail-content">
        {isEditing ? (
          <AnnotationContentEditor
            content={editContent}
            onChange={setEditContent}
            onSave={handleSaveEdit}
            onCancel={handleCancelEdit}
          />
        ) : (
          <AnnotationDetailContent annotation={annotation} />
        )}

        <DetailSection label="Status">
          <StatusSelect
            value={statusId}
            onChange={handleStatusChange}
            data-testid="annotation-status-select"
          />
        </DetailSection>

        <DetailSection label="Author">
          <span className="detail-author">
            {annotation.created_by_email || annotation.created_by}
          </span>
        </DetailSection>

        <AnnotationMeta annotation={annotation} showUpdated={true} />

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

      <AnnotationDetailActions
        isEditing={isEditing}
        onEdit={() => setIsEditing(true)}
        onDelete={handleDelete}
        onSave={handleSaveEdit}
        onCancel={handleCancelEdit}
      />
    </div>
  );
}

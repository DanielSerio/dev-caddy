import { ActionButton } from "../button";
import { EditIcon, DeleteIcon, SaveIcon, CancelIcon } from "../../icons";

/**
 * Props for AnnotationDetailActions component
 */
interface AnnotationDetailActionsProps {
  /** Whether currently in edit mode */
  isEditing: boolean;
  /** Callback when edit button is clicked */
  onEdit: () => void;
  /** Callback when delete button is clicked */
  onDelete: () => void;
  /** Callback when save button is clicked (in edit mode) */
  onSave: () => void;
  /** Callback when cancel button is clicked (in edit mode) */
  onCancel: () => void;
}

/**
 * Action buttons for annotation detail views
 *
 * Shows Edit/Delete when not editing, Save/Cancel when editing.
 * Used by both Developer and Client AnnotationDetail components.
 *
 * @example
 * ```tsx
 * <AnnotationDetailActions
 *   isEditing={isEditing}
 *   onEdit={() => setIsEditing(true)}
 *   onDelete={handleDelete}
 *   onSave={handleSave}
 *   onCancel={handleCancel}
 * />
 * ```
 */
export function AnnotationDetailActions({
  isEditing,
  onEdit,
  onDelete,
  onSave,
  onCancel,
}: AnnotationDetailActionsProps) {
  return (
    <div className="detail-actions">
      {isEditing ? (
        <>
          <ActionButton
            variant="primary"
            onClick={onSave}
            title="Save changes"
            data-testid="save-annotation-btn"
          >
            <SaveIcon className="button-icon" />
            <span>Save</span>
          </ActionButton>
          <ActionButton
            variant="secondary"
            onClick={onCancel}
            title="Cancel editing"
            data-testid="cancel-edit-btn"
          >
            <CancelIcon className="button-icon" />
            <span>Cancel</span>
          </ActionButton>
        </>
      ) : (
        <>
          <ActionButton
            variant="secondary"
            onClick={onEdit}
            title="Edit annotation"
            data-testid="edit-annotation-btn"
          >
            <EditIcon className="button-icon" />
            <span>Edit</span>
          </ActionButton>
          <ActionButton
            variant="danger"
            onClick={onDelete}
            title="Delete annotation"
            data-testid="delete-annotation-btn"
          >
            <DeleteIcon className="button-icon" />
            <span>Delete</span>
          </ActionButton>
        </>
      )}
    </div>
  );
}

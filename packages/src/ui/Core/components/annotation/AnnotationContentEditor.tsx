import { TextArea } from "../form";
import { ActionButton } from "../button";
import { useFormKeyboardShortcuts } from "../../hooks";

/**
 * Props for AnnotationContentEditor component
 */
interface AnnotationContentEditorProps {
  /** Current content value */
  content: string;
  /** Callback when content changes */
  onChange: (content: string) => void;
  /** Callback when save is triggered */
  onSave: () => void;
  /** Callback when cancel is triggered */
  onCancel: () => void;
}

/**
 * Editor for annotation content
 *
 * Provides textarea with save/cancel actions and keyboard shortcuts.
 * Used by both Developer and Client AnnotationDetail components.
 *
 * Keyboard shortcuts:
 * - Ctrl/Cmd + Enter: Save
 * - Escape: Cancel
 * - Shift + Enter: New line
 *
 * @example
 * ```tsx
 * <AnnotationContentEditor
 *   content={editedContent}
 *   onChange={setEditedContent}
 *   onSave={handleSave}
 *   onCancel={handleCancelEdit}
 * />
 * ```
 */
export function AnnotationContentEditor({
  content,
  onChange,
  onSave,
  onCancel,
}: AnnotationContentEditorProps) {
  const { onKeyDown } = useFormKeyboardShortcuts(onSave, onCancel);

  return (
    <div className="annotation-content-editor">
      <TextArea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Enter your feedback..."
        autoFocus
      />
      <div className="editor-actions">
        <ActionButton onClick={onSave} variant="primary">
          Save
        </ActionButton>
        <ActionButton onClick={onCancel} variant="secondary">
          Cancel
        </ActionButton>
      </div>
    </div>
  );
}

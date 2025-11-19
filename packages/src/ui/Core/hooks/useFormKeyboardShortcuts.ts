import { useCallback } from 'react';

/**
 * Keyboard shortcut handlers for forms
 */
export interface KeyboardShortcutHandlers {
  /**
   * Keyboard event handler for form shortcuts
   * - Ctrl/Cmd + Enter: Submit
   * - Escape: Cancel
   */
  onKeyDown: (e: React.KeyboardEvent) => void;
}

/**
 * Custom hook for form keyboard shortcuts
 *
 * Provides keyboard shortcut handlers for form interactions:
 * - Ctrl/Cmd + Enter to submit
 * - Escape to cancel
 * - Allows Shift + Enter for new lines in textareas
 *
 * @param onSubmit - Callback when submit shortcut is triggered
 * @param onCancel - Callback when cancel shortcut is triggered
 * @returns Object with keyboard event handler
 *
 * @example
 * ```tsx
 * const { onKeyDown } = useFormKeyboardShortcuts(
 *   () => handleSave(),
 *   () => handleCancel()
 * );
 *
 * return (
 *   <textarea
 *     value={content}
 *     onChange={e => setContent(e.target.value)}
 *     onKeyDown={onKeyDown}
 *   />
 * );
 * ```
 */
export function useFormKeyboardShortcuts(
  onSubmit: () => void,
  onCancel: () => void
): KeyboardShortcutHandlers {
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Ctrl/Cmd + Enter to submit
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        onSubmit();
        return;
      }

      // Escape to cancel
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
        return;
      }

      // Allow Shift + Enter for new lines (don't prevent default)
    },
    [onSubmit, onCancel]
  );

  return { onKeyDown };
}

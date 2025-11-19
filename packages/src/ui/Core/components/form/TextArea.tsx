import { forwardRef, type KeyboardEvent, type TextareaHTMLAttributes } from "react";

/**
 * Props for TextArea component
 */
export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Error message to display */
  error?: string;
  /** Callback for keyboard shortcuts */
  onKeyboardShortcut?: (key: "submit" | "cancel") => void;
}

/**
 * TextArea component with keyboard shortcuts
 *
 * Enhanced textarea with built-in keyboard shortcut handling:
 * - Enter (without Shift) = Submit
 * - Escape = Cancel
 * - Shift+Enter = New line (default behavior)
 *
 * @example
 * ```tsx
 * <TextArea
 *   value={value}
 *   onChange={(e) => setValue(e.target.value)}
 *   onKeyboardShortcut={(key) => {
 *     if (key === 'submit') handleSubmit();
 *     if (key === 'cancel') handleCancel();
 *   }}
 *   placeholder="Enter text..."
 * />
 * ```
 */
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ error, onKeyboardShortcut, onKeyDown, className = "", ...props }, ref) => {
    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      // Call custom onKeyDown first if provided
      onKeyDown?.(e);

      // Handle keyboard shortcuts if handler is provided
      if (onKeyboardShortcut && !e.defaultPrevented) {
        // Enter without Shift = submit
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          onKeyboardShortcut("submit");
        }

        // Escape = cancel
        if (e.key === "Escape") {
          e.preventDefault();
          onKeyboardShortcut("cancel");
        }
      }
    };

    return (
      <textarea
        ref={ref}
        onKeyDown={handleKeyDown}
        className={`detail-textarea ${error ? "has-error" : ""} ${className}`.trim()}
        aria-invalid={!!error}
        aria-describedby={error ? "textarea-error" : undefined}
        data-testid="textarea"
        {...props}
      />
    );
  }
);

TextArea.displayName = "TextArea";

import React, { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { validateAnnotationContent } from '../../../../plugin/utility/validate';

/**
 * Props for PopoverForm component
 */
export interface PopoverFormProps {
  /** Callback when form is submitted with valid content */
  onSubmit: (content: string) => void;
  /** Callback when form is cancelled */
  onCancel: () => void;
  /** Placeholder text for the textarea */
  placeholder?: string;
  /** Hint text displayed below textarea */
  hint?: string;
  /** Auto-focus the textarea on mount (default: true) */
  autoFocus?: boolean;
  /** Additional CSS class name */
  className?: string;
}

/**
 * Popover form composite component
 *
 * Provides a reusable form for annotation input with:
 * - Auto-focused textarea
 * - Content validation
 * - Error display
 * - Keyboard shortcuts (Enter to submit, Shift+Enter for new line, Escape to cancel)
 * - Submit and Cancel buttons
 *
 * @example
 * ```tsx
 * <PopoverForm
 *   onSubmit={(content) => createAnnotation(content)}
 *   onCancel={() => closePopover()}
 *   placeholder="Describe the issue..."
 * />
 * ```
 */
export function PopoverForm({
  onSubmit,
  onCancel,
  placeholder = 'Describe the issue or feedback...',
  hint = 'Press Enter to submit, Shift+Enter for new line, Esc to cancel',
  autoFocus = true,
  className = '',
}: PopoverFormProps) {
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /**
   * Auto-focus textarea on mount if enabled
   */
  useEffect(() => {
    if (autoFocus) {
      textareaRef.current?.focus();
    }
  }, [autoFocus]);

  /**
   * Handle form submission
   */
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    try {
      // Validate and trim content
      const validatedContent = validateAnnotationContent(content);

      // Clear any previous errors
      setError(null);

      // Submit and reset form
      onSubmit(validatedContent);
      setContent('');
    } catch (err) {
      // Show validation error
      setError(err instanceof Error ? err.message : 'Invalid annotation content');
    }
  };

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter without Shift = submit
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }

    // Escape = cancel
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  /**
   * Handle cancel
   */
  const handleCancel = () => {
    setContent('');
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className={`popover-form ${className}`.trim()}>
      <div className="popover-body">
        <label htmlFor="annotation-content" className="sr-only">
          Annotation content
        </label>
        <textarea
          id="annotation-content"
          ref={textareaRef}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            // Clear error when user starts typing
            if (error) setError(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={4}
          className={`annotation-textarea ${error ? 'has-error' : ''}`}
          aria-required="true"
          aria-invalid={!!error}
          aria-describedby={error ? 'annotation-error' : undefined}
          data-testid="annotation-content"
        />
        {error && (
          <p
            className="error-message"
            id="annotation-error"
            role="alert"
            data-testid="annotation-error"
          >
            {error}
          </p>
        )}
        {hint && <p className="hint">{hint}</p>}
      </div>

      <div className="popover-actions">
        <button
          type="button"
          onClick={handleCancel}
          className="btn-cancel"
          data-testid="cancel-annotation"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-submit"
          disabled={!content.trim()}
          data-testid="submit-annotation"
        >
          Submit
        </button>
      </div>
    </form>
  );
}

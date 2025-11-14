import React, { useState, useEffect, useRef, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { validateAnnotationContent } from '../../plugin/utility/validate';
import { useElementPosition } from './hooks';

/**
 * Props for AnnotationPopover component
 */
interface AnnotationPopoverProps {
  /** The selected HTML element to annotate */
  selectedElement: HTMLElement;
  /** Callback when annotation is submitted */
  onSubmit: (content: string) => void;
  /** Callback when popover is cancelled */
  onCancel: () => void;
}

/**
 * Popover component for creating annotations
 *
 * Displays a popover near the selected element with:
 * - Textarea for annotation content
 * - Submit and Cancel buttons
 * - Keyboard shortcuts (Enter to submit, Escape to cancel)
 *
 * @example
 * <AnnotationPopover
 *   selectedElement={element}
 *   onSubmit={(content) => createAnnotation(content)}
 *   onCancel={() => clearSelection()}
 * />
 */
export function AnnotationPopover({
  selectedElement,
  onSubmit,
  onCancel,
}: AnnotationPopoverProps) {
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Use useElementPosition hook for automatic position tracking
  const { position } = useElementPosition(selectedElement, { throttleMs: 100 });

  /**
   * Calculate popover position with screen bounds checking
   */
  useEffect(() => {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const scrollX = window.scrollX || document.documentElement.scrollLeft;

    // Position below the element by default
    let top = position.top + position.height + scrollY + 8;
    let left = position.left + scrollX;

    // If popover would go off-screen to the right, align to right edge
    const popoverWidth = 320; // Approximate width
    if (left + popoverWidth > window.innerWidth) {
      left = window.innerWidth - popoverWidth - 16;
    }

    // If popover would go off-screen at the bottom, position above
    const popoverHeight = 200; // Approximate height
    if (top + popoverHeight > window.innerHeight + scrollY) {
      top = position.top + scrollY - popoverHeight - 8;
    }

    setPopoverPosition({ top, left });
  }, [position]);

  /**
   * Auto-focus textarea on mount
   */
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

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

  const popover = (
    <div
      className="dev-caddy-popover"
      data-dev-caddy
      data-testid="annotation-popover"
      role="dialog"
      aria-label="Create annotation"
      style={{
        position: 'absolute',
        top: `${popoverPosition.top}px`,
        left: `${popoverPosition.left}px`,
        zIndex: 999999,
      }}
    >
      <form onSubmit={handleSubmit} className="popover-form">
        <div className="popover-header">
          <h4>Add Annotation</h4>
          <button
            type="button"
            onClick={handleCancel}
            className="btn-close"
            aria-label="Close"
            data-testid="close-popover"
          >
            ×
          </button>
        </div>

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
            placeholder="Describe the issue or feedback..."
            rows={4}
            className={`annotation-textarea ${error ? 'has-error' : ''}`}
            aria-required="true"
            aria-invalid={!!error}
            aria-describedby={error ? "annotation-error" : undefined}
            data-testid="annotation-content"
          />
          {error && (
            <p className="error-message" id="annotation-error" role="alert" data-testid="annotation-error">
              {error}
            </p>
          )}
          <p className="hint">
            Press Enter to submit, Shift+Enter for new line, Esc to cancel
          </p>
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
    </div>
  );

  return createPortal(popover, document.body);
}

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useElementPosition } from './hooks';
import { PopoverHeader, PopoverForm } from './components/composite';
import { POPOVER_DIMENSIONS, Z_INDEX } from './constants';

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
 * - Header with title and close button
 * - Form with textarea, validation, and keyboard shortcuts
 * - Automatic positioning with screen bounds checking
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
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });

  // Use useElementPosition hook for automatic position tracking
  const { position } = useElementPosition(selectedElement, { throttleMs: 100 });

  /**
   * Calculate popover position with screen bounds checking
   */
  useEffect(() => {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const scrollX = window.scrollX || document.documentElement.scrollLeft;

    // Position below the element by default
    let top = position.top + position.height + scrollY + POPOVER_DIMENSIONS.OFFSET;
    let left = position.left + scrollX;

    // If popover would go off-screen to the right, align to right edge
    if (left + POPOVER_DIMENSIONS.WIDTH > window.innerWidth) {
      left = window.innerWidth - POPOVER_DIMENSIONS.WIDTH - 16;
    }

    // If popover would go off-screen at the bottom, position above
    if (top + POPOVER_DIMENSIONS.HEIGHT > window.innerHeight + scrollY) {
      top = position.top + scrollY - POPOVER_DIMENSIONS.HEIGHT - POPOVER_DIMENSIONS.OFFSET;
    }

    setPopoverPosition({ top, left });
  }, [position]);

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
        zIndex: Z_INDEX.POPOVER,
      }}
    >
      <PopoverHeader title="Add Annotation" onClose={onCancel} />
      <PopoverForm onSubmit={onSubmit} onCancel={onCancel} />
    </div>
  );

  return createPortal(popover, document.body);
}

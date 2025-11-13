import { ActionButton } from "../button/ActionButton";

/**
 * Props for PopoverHeader component
 */
export interface PopoverHeaderProps {
  /** Header title text */
  title: string;
  /** Callback when close button is clicked */
  onClose: () => void;
  /** Additional CSS class name */
  className?: string;
}

/**
 * Popover header composite component
 *
 * Provides a consistent header for popover dialogs with title and close button.
 * Used in annotation popovers and other modal-like UIs.
 *
 * @example
 * ```tsx
 * <PopoverHeader
 *   title="Add Annotation"
 *   onClose={() => setShowPopover(false)}
 * />
 * ```
 */
export function PopoverHeader({
  title,
  onClose,
  className = "",
}: PopoverHeaderProps) {
  return (
    <div className={`popover-header ${className}`.trim()} data-testid="popover-header">
      <h3 className="popover-title" data-testid="popover-title">
        {title}
      </h3>
      <ActionButton
        variant="secondary"
        onClick={onClose}
        className="popover-close"
        aria-label="Close"
        data-testid="popover-close"
      >
        ✕
      </ActionButton>
    </div>
  );
}

import { ChevronLeftIcon } from "../../icons";

/**
 * Props for BackButton component
 */
export interface BackButtonProps {
  /** Click handler for back navigation */
  onClick: () => void;
  /** Custom label text (default: "Back") */
  label?: string;
  /** Additional CSS class name */
  className?: string;
}

/**
 * Back button component
 *
 * Displays a button for navigating back to the previous view.
 * Commonly used in detail views to return to list views.
 *
 * @example
 * ```tsx
 * <BackButton onClick={handleBack} />
 * <BackButton onClick={handleBack} label="Return to List" />
 * ```
 */
export function BackButton({ onClick, label = "Back", className = "" }: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`btn-back btn-default ${className}`.trim()}
      data-testid="back-to-list-btn"
    >
      <ChevronLeftIcon />
      <span>{label}</span>
    </button>
  );
}

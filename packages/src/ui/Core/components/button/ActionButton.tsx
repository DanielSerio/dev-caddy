import type { ReactNode, ButtonHTMLAttributes } from "react";

/**
 * Props for ActionButton component
 */
export interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant/style */
  variant: "primary" | "secondary" | "danger";
  /** Optional icon to display */
  icon?: ReactNode;
  /** Loading state */
  loading?: boolean;
}

/**
 * Action button component
 *
 * Styled button for actions with different variants (primary, secondary, danger).
 * Supports icons and loading states.
 *
 * @example
 * ```tsx
 * <ActionButton variant="primary" onClick={handleSave}>
 *   Save
 * </ActionButton>
 *
 * <ActionButton variant="danger" onClick={handleDelete}>
 *   Delete
 * </ActionButton>
 *
 * <ActionButton variant="primary" loading={true}>
 *   Saving...
 * </ActionButton>
 * ```
 */
export function ActionButton({
  variant,
  icon,
  loading = false,
  children,
  className = "",
  disabled,
  ...props
}: ActionButtonProps) {
  const variantClasses = {
    primary: "btn-save",
    secondary: "btn-cancel",
    danger: "btn-delete",
  };

  return (
    <button
      className={`${variantClasses[variant]} ${className}`.trim()}
      disabled={disabled || loading}
      data-testid="action-button"
      {...props}
    >
      {loading && <span className="button-spinner">⏳</span>}
      {!loading && icon && <span className="button-icon">{icon}</span>}
      {children}
    </button>
  );
}

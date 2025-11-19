import type { ButtonHTMLAttributes } from "react";

/**
 * Props for IconButton component
 */
export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant/style */
  variant: "default" | "primary" | "secondary" | "danger";
  /** Loading state */
  loading?: boolean;
}

/**
 * Icon button component
 *
 * Styled button for icons with different variants (primary, secondary, danger).
 * Supports icons and loading states.
 *
 * @example
 * ```tsx
 * <IconButton variant="primary" onClick={handleSave}>
 *   Save
 * </IconButton>
 *
 * <IconButton variant="danger" onClick={handleDelete}>
 *   Delete
 * </IconButton>
 *
 * <IconButton variant="primary" loading={true}>
 *   Saving...
 * </IconButton>
 * ```
 */
export function IconButton({
  variant,
  loading = false,
  children,
  className = "",
  disabled,
  ...props
}: IconButtonProps) {
  const variantClasses = {
    default: "btn-default",
    primary: "btn-save",
    secondary: "btn-cancel",
    danger: "btn-delete",
  };

  return (
    <button
      className={`icon ${variantClasses[variant]} ${className}`.trim()}
      disabled={disabled || loading}
      data-testid="icon-button"
      {...props}
    >
      {loading && <span className="button-spinner">⏳</span>}
      {!loading && !!children && <span>{children}</span>}
    </button>
  );
}

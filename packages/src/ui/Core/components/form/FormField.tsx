import type { ReactNode } from "react";

/**
 * Props for FormField component
 */
export interface FormFieldProps {
  /** Label text for the field */
  label: string;
  /** ID of the form control (used for htmlFor) */
  htmlFor: string;
  /** Error message to display */
  error?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Form control element (input, textarea, select, etc.) */
  children: ReactNode;
  /** Additional CSS class name */
  className?: string;
}

/**
 * Form field component
 *
 * Wrapper for form controls that provides consistent label, error display,
 * and accessibility markup.
 *
 * @example
 * ```tsx
 * <FormField label="Email Address" htmlFor="email" required>
 *   <input id="email" type="email" />
 * </FormField>
 *
 * <FormField label="Comments" htmlFor="comments" error="Required field">
 *   <textarea id="comments" />
 * </FormField>
 * ```
 */
export function FormField({
  label,
  htmlFor,
  error,
  required = false,
  children,
  className = "",
}: FormFieldProps) {
  return (
    <div className={`form-group ${className}`.trim()} data-testid="form-field">
      <label htmlFor={htmlFor}>
        {label}
        {required && <span className="required-indicator"> *</span>}
      </label>
      {children}
      {error && (
        <div className="field-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}

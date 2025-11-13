import type { ReactNode } from "react";

/**
 * Props for DetailSection component
 */
export interface DetailSectionProps {
  /** Label for the section */
  label: string;
  /** Content to display in the section */
  children: ReactNode;
  /** Additional CSS class name */
  className?: string;
}

/**
 * Detail section component
 *
 * Displays a labeled section in a detail view with a label and value.
 * Used in AnnotationDetail components for displaying metadata.
 *
 * @example
 * ```tsx
 * <DetailSection label="Status">
 *   <StatusBadge statusId={1} />
 * </DetailSection>
 * <DetailSection label="Element">
 *   <ElementCode annotation={annotation} />
 * </DetailSection>
 * ```
 */
export function DetailSection({ label, children, className = "" }: DetailSectionProps) {
  return (
    <div className={`detail-section ${className}`.trim()} data-testid="detail-section">
      <label className="detail-label">{label}</label>
      <div className="detail-value">{children}</div>
    </div>
  );
}

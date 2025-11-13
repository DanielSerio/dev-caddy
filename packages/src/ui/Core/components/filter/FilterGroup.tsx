import type { ReactNode } from "react";

/**
 * Props for FilterGroup component
 */
export interface FilterGroupProps {
  /** Label for the filter */
  label: string;
  /** ID of the filter control (used for htmlFor) */
  htmlFor: string;
  /** Filter control element (select, input, etc.) */
  children: ReactNode;
  /** Additional CSS class name */
  className?: string;
}

/**
 * Filter group component
 *
 * Wrapper for filter controls that provides consistent label and layout.
 * Used in filter panels to organize multiple filter controls.
 *
 * @example
 * ```tsx
 * <FilterGroup label="Status:" htmlFor="status-filter">
 *   <select id="status-filter">
 *     <option value="all">All</option>
 *     <option value="active">Active</option>
 *   </select>
 * </FilterGroup>
 *
 * <FilterGroup label="Search:" htmlFor="search-filter">
 *   <input id="search-filter" type="text" placeholder="Search..." />
 * </FilterGroup>
 * ```
 */
export function FilterGroup({
  label,
  htmlFor,
  children,
  className = "",
}: FilterGroupProps) {
  return (
    <div className={`filter-group ${className}`.trim()} data-testid="filter-group">
      <label htmlFor={htmlFor}>{label}</label>
      {children}
    </div>
  );
}

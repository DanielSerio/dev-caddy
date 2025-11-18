import { useState } from "react";
import { AnnotationFilters, type FilterOptions } from "../AnnotationFilters";
import { IconButton } from "../../Core/components";
import { FilterIcon } from "../../Core/icons";

/**
 * Props for AnnotationManagerHeader component
 */
export interface AnnotationManagerHeaderProps {
  /** Number of filtered annotations */
  filteredCount: number;
  /** Total number of annotations */
  totalCount: number;
  /** Current filter options */
  filters: FilterOptions;
  /** Callback when filters change */
  onFiltersChange: (filters: FilterOptions) => void;
  /** Available pages for filtering */
  availablePages: string[];
  /** Additional CSS class name */
  className?: string;
}

/**
 * Annotation manager header component
 *
 * Displays the annotation count and filter controls for the developer
 * annotation manager. Includes a toggle button to show/hide filters.
 *
 * @example
 * ```tsx
 * <AnnotationManagerHeader
 *   filteredCount={5}
 *   totalCount={10}
 *   filters={filters}
 *   onFiltersChange={setFilters}
 *   availablePages={['/home', '/about']}
 * />
 * ```
 */
export function AnnotationManagerHeader({
  filteredCount,
  totalCount,
  filters,
  onFiltersChange,
  availablePages,
  className = "",
}: AnnotationManagerHeaderProps) {
  const [filterWindowIsOpen, setFilterWindowIsOpen] = useState(false);

  const toggleFilterWindow = () => setFilterWindowIsOpen((isOpen) => !isOpen);

  return (
    <div className={`manager-header ${className}`.trim()}>
      <div className="manager-header-top-bar">
        <h3 className="text-muted">
          ({filteredCount}/{totalCount})
        </h3>

        <IconButton
          className="manager-filter-button"
          variant="default"
          onClick={toggleFilterWindow}
          data-testid="toggle-filters"
        >
          <FilterIcon />
        </IconButton>
      </div>

      <AnnotationFilters
        isOpen={filterWindowIsOpen}
        filters={filters}
        onFiltersChange={onFiltersChange}
        availablePages={availablePages}
      />
    </div>
  );
}

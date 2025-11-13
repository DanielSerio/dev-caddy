import { ANNOTATION_STATUS } from "../../types/annotations";

/**
 * Filter options for annotations
 */
export interface FilterOptions {
  status: number | "all";
  author: string;
}

/**
 * Props for AnnotationFilters component
 */
interface AnnotationFiltersProps {
  /** Current filter values */
  filters: FilterOptions;
  /** Callback when filters change */
  onFiltersChange: (filters: FilterOptions) => void;
}

/**
 * Annotation filters component for developer mode
 *
 * Provides filter controls for status and author.
 * Used in AnnotationManager to filter the annotation list.
 *
 * @example
 * <AnnotationFilters
 *   filters={{ status: "all", author: "" }}
 *   onFiltersChange={setFilters}
 * />
 */
export function AnnotationFilters({
  filters,
  onFiltersChange,
}: AnnotationFiltersProps) {
  return (
    <div className="manager-filters">
      <div className="filter-group">
        <label htmlFor="status-filter">Status:</label>
        <select
          id="status-filter"
          value={filters.status}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              status:
                e.target.value === "all" ? "all" : Number(e.target.value),
            })
          }
        >
          <option value="all">All</option>
          <option value={ANNOTATION_STATUS.NEW}>New</option>
          <option value={ANNOTATION_STATUS.IN_PROGRESS}>In Progress</option>
          <option value={ANNOTATION_STATUS.IN_REVIEW}>In Review</option>
          <option value={ANNOTATION_STATUS.HOLD}>Hold</option>
          <option value={ANNOTATION_STATUS.RESOLVED}>Resolved</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="author-filter">Author:</label>
        <input
          id="author-filter"
          type="text"
          placeholder="Filter by author..."
          value={filters.author}
          onChange={(e) =>
            onFiltersChange({ ...filters, author: e.target.value })
          }
        />
      </div>
    </div>
  );
}

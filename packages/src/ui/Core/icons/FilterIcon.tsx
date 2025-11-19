/**
 * Props for FilterIcon component
 */
export interface FilterIconProps {
  /** Additional CSS class name */
  className?: string;
  /** Icon size in pixels (default: 24) */
  size?: number;
}

/**
 * Filter icon component
 *
 * SVG icon for filter/funnel functionality.
 * Used in annotation manager header.
 *
 * @example
 * ```tsx
 * <FilterIcon className="filter-btn-icon" size={20} />
 * ```
 */
export function FilterIcon({ className = "", size = 24 }: FilterIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="Filter"
    >
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

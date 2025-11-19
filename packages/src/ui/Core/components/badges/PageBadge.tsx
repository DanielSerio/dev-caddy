import { formattedURL, isCurrentPage } from "../../utility/navigation";
import type { Annotation } from "../../../../types/annotations";

/**
 * Props for PageBadge component
 */
export interface PageBadgeProps {
  /** The annotation containing page information */
  annotation: Annotation;
  /** Additional CSS class name */
  className?: string;
}

/**
 * Page badge component
 *
 * Displays a badge indicating which page the annotation belongs to.
 * Shows "Current Page" for annotations on the current page, or the page path for others.
 *
 * @example
 * ```tsx
 * <PageBadge annotation={annotation} />
 * <PageBadge annotation={annotation} showFullPath={true} />
 * ```
 */
export function PageBadge({ annotation, className = "" }: PageBadgeProps) {
  const isCurrent = isCurrentPage(annotation);
  const pageUrl = formattedURL(annotation.page);
  const pageLabel = pageUrl.pathname;
  const paramsEntries = Array.from(pageUrl.searchParams.entries());

  // Build full page path for title attribute
  const fullPath = pageUrl.search
    ? `${pageUrl.pathname}${pageUrl.search}`
    : pageUrl.pathname;

  return (
    <details
      className={`annotation-page-badge ${
        isCurrent ? "current-page" : "other-page"
      } ${className}`.trim()}
      data-testid="page-badge"
      title={fullPath}
    >
      <summary>{pageLabel}</summary>

      <div>
        {paramsEntries.map(([value, key]) => {
          return (
            <div key={`${key}:${value}`}>
              {key}: {value}
            </div>
          );
        })}
      </div>
    </details>
  );
}

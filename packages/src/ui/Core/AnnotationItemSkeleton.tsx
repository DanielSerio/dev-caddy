import { Skeleton } from "./Skeleton";

/**
 * AnnotationItemSkeleton component
 *
 * Loading skeleton that matches the structure of an annotation item card.
 * Shows placeholders for:
 * - Status stripe (left edge)
 * - Page and status badges (header)
 * - Content text (2 lines)
 * - Metadata (author and date)
 *
 * @example
 * ```tsx
 * // Show 3 skeleton items while loading
 * {loading && (
 *   <>
 *     <AnnotationItemSkeleton />
 *     <AnnotationItemSkeleton />
 *     <AnnotationItemSkeleton />
 *   </>
 * )}
 * ```
 */
export function AnnotationItemSkeleton() {
  return (
    <div className="annotation-item-skeleton" data-testid="annotation-item-skeleton">
      {/* Status stripe */}
      <div className="skeleton-stripe" />

      {/* Header badges */}
      <div className="skeleton-header">
        <Skeleton variant="rectangular" width="80px" height="20px" radius="4px" />
        <Skeleton variant="rectangular" width="60px" height="20px" radius="4px" />
      </div>

      {/* Content - 2 lines */}
      <div className="skeleton-content">
        <Skeleton variant="text" width="100%" height="14px" />
        <Skeleton variant="text" width="75%" height="14px" />
      </div>

      {/* Metadata - author and date */}
      <div className="skeleton-meta">
        <Skeleton variant="text" width="120px" height="12px" />
      </div>
    </div>
  );
}

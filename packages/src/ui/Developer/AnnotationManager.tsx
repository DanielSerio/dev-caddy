import { useState, useMemo } from "react";
import { useAnnotations } from "../Core/context";
import { AnnotationDetail } from "./AnnotationDetail";
import { AnnotationFilters, type FilterOptions } from "./AnnotationFilters";
import { AnnotationItem } from "./AnnotationItem";
import type { Annotation } from "../../types/annotations";
import { Skeleton } from "../Core";

/**
 * Props for AnnotationManager component
 */
interface AnnotationManagerProps {
  /** Callback when an annotation is selected for viewing */
  onAnnotationSelect?: (annotation: Annotation | null) => void;
}

/**
 * Annotation manager component for developer mode
 *
 * Displays all annotations with advanced features:
 * - View all annotations (not filtered by user)
 * - Filter by status and author
 * - Click annotation to view details and perform actions
 * - See full annotation details with status control
 *
 * @example
 * <AnnotationManager />
 */
export function AnnotationManager({
  onAnnotationSelect,
}: AnnotationManagerProps) {
  const { annotations, loading, error } = useAnnotations();

  const [filters, setFilters] = useState<FilterOptions>({
    status: "all",
    author: "",
  });

  const [selectedAnnotation, setSelectedAnnotation] =
    useState<Annotation | null>(null);

  /**
   * Filter annotations based on current filters
   */
  const filteredAnnotations = useMemo(() => {
    let filtered = [...annotations];

    // Filter by status
    if (filters.status !== "all") {
      filtered = filtered.filter((a) => a.status_id === filters.status);
    }

    // Filter by author
    if (filters.author) {
      filtered = filtered.filter((a) =>
        a.created_by.toLowerCase().includes(filters.author.toLowerCase())
      );
    }

    return filtered;
  }, [annotations, filters]);

  /**
   * Handle selecting an annotation to view details
   */
  const handleSelectAnnotation = (annotation: Annotation) => {
    setSelectedAnnotation(annotation);
    onAnnotationSelect?.(annotation);
  };

  /**
   * Handle navigating back from detail view
   */
  const handleBack = () => {
    setSelectedAnnotation(null);
    onAnnotationSelect?.(null);
  };

  // Show detail view if annotation is selected
  if (selectedAnnotation) {
    // Find the latest version of the selected annotation from context
    // This ensures we always show the most up-to-date data after real-time updates
    const latestAnnotation = annotations.find(
      (a) => a.id === selectedAnnotation.id
    );

    // If annotation was deleted, go back to list
    if (!latestAnnotation) {
      handleBack();
      return null;
    }

    return (
      <AnnotationDetail annotation={latestAnnotation} onBack={handleBack} />
    );
  }

  if (loading) {
    return (
      <div className="dev-caddy-annotation-manager" data-dev-caddy>
        <div className="manager-header">
          {/* Title skeleton matching "All Annotations (X/Y)" */}
          <Skeleton variant="text" width="60%" height="24px" />

          {/* Filter controls skeleton */}
          <div className="manager-filters">
            <div className="filter-group">
              <Skeleton variant="text" width="50px" height="16px" />
              <Skeleton variant="rectangular" width="120px" height="32px" />
            </div>
            <div className="filter-group">
              <Skeleton variant="text" width="50px" height="16px" />
              <Skeleton variant="rectangular" width="150px" height="32px" />
            </div>
          </div>
        </div>

        <div className="annotation-items">
          {/* Skeleton for 3 annotation items */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="annotation-item">
              {/* Header with element tag and status badge */}
              <div className="annotation-header">
                <Skeleton variant="text" width="45%" height="16px" />
                <Skeleton variant="text" width="22%" height="20px" />
              </div>

              {/* Content text */}
              <div className="annotation-content">
                <Skeleton variant="text" width="90%" height="14px" />
                <Skeleton variant="text" width="75%" height="14px" />
              </div>

              {/* Meta information (author, dates) */}
              <div className="annotation-meta">
                <Skeleton variant="text" width="30%" height="12px" />
                <Skeleton variant="text" width="40%" height="12px" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dev-caddy-annotation-manager" data-dev-caddy>
        <p className="error">Error: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="dev-caddy-annotation-manager" data-dev-caddy>
      <div className="manager-header">
        <h3>
          All Annotations ({filteredAnnotations.length}/{annotations.length})
        </h3>

        <AnnotationFilters filters={filters} onFiltersChange={setFilters} />
      </div>

      {filteredAnnotations.length === 0 ? (
        <p className="empty-state">
          {annotations.length === 0
            ? "No annotations yet."
            : "No annotations match the current filters."}
        </p>
      ) : (
        <div className="annotation-items">
          {filteredAnnotations.map((annotation) => (
            <AnnotationItem
              key={annotation.id}
              annotation={annotation}
              onClick={handleSelectAnnotation}
            />
          ))}
        </div>
      )}
    </div>
  );
}

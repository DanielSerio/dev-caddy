import { useState, useMemo } from "react";
import { useAnnotations, useAnnotationSelection } from "../Core/hooks";
import { AnnotationDetail } from "./AnnotationDetail";
import { type FilterOptions } from "./AnnotationFilters";
import type { Annotation } from "../../types/annotations";
import { AnnotationItemSkeleton } from "../Core/AnnotationItemSkeleton";
import { ErrorDisplay } from "../Core/components/display";
import { AnnotationManagerHeader, AnnotationListView } from "./components";

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
  const { selected, handleSelect, handleBack } = useAnnotationSelection(
    annotations,
    loading,
    onAnnotationSelect
  );

  const [filters, setFilters] = useState<FilterOptions>({
    status: "all",
    author: "",
    page: "all",
  });

  /**
   * Get all unique pages from annotations
   */
  const availablePages = useMemo(() => {
    const pages = new Set(annotations.map((a) => a.page));
    return Array.from(pages);
  }, [annotations]);

  /**
   * Filter annotations based on current filters
   */
  const filteredAnnotations = useMemo(() => {
    let filtered = [...annotations];

    // Filter by page
    if (filters.page !== "all") {
      if (filters.page === "current") {
        const currentPath = window.location.pathname;
        filtered = filtered.filter((a) => a.page === currentPath);
      } else {
        filtered = filtered.filter((a) => a.page === filters.page);
      }
    }

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

  // Show detail view if annotation is selected
  if (selected) {
    return (
      <AnnotationDetail annotation={selected} onBack={handleBack} />
    );
  }

  if (loading) {
    return (
      <div className="dev-caddy-annotation-manager" data-dev-caddy>
        <div className="annotation-items" data-testid="annotation-manager-loading">
          <AnnotationItemSkeleton />
          <AnnotationItemSkeleton />
          <AnnotationItemSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dev-caddy-annotation-manager" data-dev-caddy>
        <ErrorDisplay error={error} />
      </div>
    );
  }

  return (
    <div className="dev-caddy-annotation-manager" data-dev-caddy>
      <AnnotationManagerHeader
        filteredCount={filteredAnnotations.length}
        totalCount={annotations.length}
        filters={filters}
        onFiltersChange={setFilters}
        availablePages={availablePages}
      />

      <AnnotationListView
        annotations={filteredAnnotations}
        totalCount={annotations.length}
        onAnnotationClick={handleSelect}
      />
    </div>
  );
}

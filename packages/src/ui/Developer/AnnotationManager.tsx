import { useState, useMemo, useEffect, useCallback } from "react";
import { useAnnotations } from "../Core/hooks";
import { AnnotationDetail } from "./AnnotationDetail";
import { type FilterOptions } from "./AnnotationFilters";
import type { Annotation } from "../../types/annotations";
import { useAnnotationNavigation } from "../Core/hooks";
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
  const { navigateToAnnotation, checkPendingAnnotation } =
    useAnnotationNavigation();

  const [filters, setFilters] = useState<FilterOptions>({
    status: "all",
    author: "",
    page: "all",
  });

  const [selectedAnnotation, setSelectedAnnotation] =
    useState<Annotation | null>(null);

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

  /**
   * Handle selecting an annotation to view details
   * Supports cross-page navigation
   */
  const handleSelectAnnotation = (annotation: Annotation) => {
    navigateToAnnotation(annotation, (ann) => {
      setSelectedAnnotation(ann);
      onAnnotationSelect?.(ann);
    });
  };

  /**
   * Check for pending annotation after cross-page navigation
   */
  useEffect(() => {
    if (!loading && annotations.length > 0) {
      checkPendingAnnotation(annotations, (annotation) => {
        setSelectedAnnotation(annotation);
        onAnnotationSelect?.(annotation);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, annotations.length]); // checkPendingAnnotation and onAnnotationSelect are stable

  /**
   * Handle navigating back from detail view
   */
  const handleBack = useCallback(() => {
    setSelectedAnnotation(null);
    onAnnotationSelect?.(null);
  }, [onAnnotationSelect]);

  /**
   * Auto-navigate back if selected annotation was deleted
   */
  useEffect(() => {
    if (selectedAnnotation && !annotations.find(a => a.id === selectedAnnotation.id)) {
      setSelectedAnnotation(null);
      onAnnotationSelect?.(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAnnotation, annotations.length]); // Run when annotations change

  // Show detail view if annotation is selected
  if (selectedAnnotation) {
    // Find the latest version of the selected annotation from context
    // This ensures we always show the most up-to-date data after real-time updates
    const latestAnnotation = annotations.find(
      (a) => a.id === selectedAnnotation.id
    );

    // If annotation was deleted, return null (useEffect will handle navigation)
    if (!latestAnnotation) {
      return null;
    }

    return (
      <AnnotationDetail annotation={latestAnnotation} onBack={handleBack} />
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
        onAnnotationClick={handleSelectAnnotation}
      />
    </div>
  );
}

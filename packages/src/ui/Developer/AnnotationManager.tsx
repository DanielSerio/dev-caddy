import { useState, useMemo } from 'react';
import { useAnnotations } from '../Core/context';
import { getStatusName } from '../Core/lib/status';
import { ANNOTATION_STATUS } from '../../types/annotations';
import { AnnotationDetail } from './AnnotationDetail';
import { sanitizeContent } from '../Core/utility/sanitize';
import type { Annotation } from '../../types/annotations';

/**
 * Filter options for annotations
 */
interface FilterOptions {
  status: number | 'all';
  author: string;
}

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
export function AnnotationManager({ onAnnotationSelect }: AnnotationManagerProps) {
  const { annotations, loading, error } = useAnnotations();

  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    author: '',
  });

  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);

  /**
   * Filter annotations based on current filters
   */
  const filteredAnnotations = useMemo(() => {
    let filtered = [...annotations];

    // Filter by status
    if (filters.status !== 'all') {
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

  /**
   * Format date for display
   */
  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Show detail view if annotation is selected
  if (selectedAnnotation) {
    return (
      <AnnotationDetail
        annotation={selectedAnnotation}
        onBack={handleBack}
      />
    );
  }

  if (loading) {
    return (
      <div className="dev-caddy-annotation-manager" data-dev-caddy>
        <p>Loading annotations...</p>
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
        <h3>All Annotations ({filteredAnnotations.length}/{annotations.length})</h3>

        <div className="manager-filters">
          <div className="filter-group">
            <label htmlFor="status-filter">Status:</label>
            <select
              id="status-filter"
              value={filters.status}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  status: e.target.value === 'all' ? 'all' : Number(e.target.value),
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
                setFilters({ ...filters, author: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      {filteredAnnotations.length === 0 ? (
        <p className="empty-state">
          {annotations.length === 0
            ? 'No annotations yet.'
            : 'No annotations match the current filters.'}
        </p>
      ) : (
        <div className="annotation-items">
          {filteredAnnotations.map((annotation) => (
            <div
              key={annotation.id}
              className={`annotation-item status-${getStatusName(
                annotation.status_id
              )}`}
              onClick={() => handleSelectAnnotation(annotation)}
              data-testid="annotation-list-item"
            >
              <div className="annotation-header">
                <span className="annotation-element">
                  {annotation.element_tag}
                  {annotation.element_id && `#${annotation.element_id}`}
                  {annotation.element_role && ` [${annotation.element_role}]`}
                </span>
                <span
                  className={`annotation-status status-${getStatusName(annotation.status_id)}`}
                >
                  {getStatusName(annotation.status_id)}
                </span>
              </div>

              <div className="annotation-content">
                <p>{sanitizeContent(annotation.content)}</p>
              </div>

              <div className="annotation-meta">
                <span className="annotation-author">By: {annotation.created_by}</span>
                <span className="annotation-date">
                  {formatDate(annotation.created_at)}
                </span>
                {annotation.updated_at !== annotation.created_at && (
                  <span className="annotation-updated">
                    Updated: {formatDate(annotation.updated_at)}
                  </span>
                )}
                {annotation.resolved_at && (
                  <span className="annotation-resolved">
                    Resolved: {formatDate(annotation.resolved_at)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

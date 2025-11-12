import { useState, useMemo } from 'react';
import { useAnnotations } from '../Core/context';
import { getStatusName } from '../Core/lib/status';
import { ANNOTATION_STATUS } from '../../types/annotations';
import type { Annotation } from '../../types/annotations';

/**
 * Filter options for annotations
 */
interface FilterOptions {
  status: number | 'all';
  author: string;
}

/**
 * Annotation manager component for developer mode
 *
 * Displays all annotations with advanced features:
 * - View all annotations (not filtered by user)
 * - Filter by status and author
 * - Resolve, edit, and delete any annotation
 * - See full annotation details
 *
 * @example
 * <AnnotationManager />
 */
export function AnnotationManager() {
  const { annotations, updateAnnotation, deleteAnnotation, loading, error } =
    useAnnotations();

  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    author: '',
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');

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
   * Format date for display
   */
  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  /**
   * Handle status change
   */
  const handleStatusChange = async (id: number, statusId: number) => {
    try {
      await updateAnnotation(id, { status_id: statusId });
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  /**
   * Handle delete
   */
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this annotation?')) {
      return;
    }

    try {
      await deleteAnnotation(id);
    } catch (err) {
      console.error('Failed to delete annotation:', err);
    }
  };

  /**
   * Start editing annotation content
   */
  const startEdit = (annotation: Annotation) => {
    setEditingId(annotation.id);
    setEditContent(annotation.content);
  };

  /**
   * Save edited content
   */
  const saveEdit = async (id: number) => {
    try {
      await updateAnnotation(id, { content: editContent });
      setEditingId(null);
      setEditContent('');
    } catch (err) {
      console.error('Failed to update content:', err);
    }
  };

  /**
   * Cancel editing
   */
  const cancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

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
            >
              <div className="annotation-header">
                <span className="annotation-element">
                  {annotation.element_tag}
                  {annotation.element_id && `#${annotation.element_id}`}
                  {annotation.element_role && ` [${annotation.element_role}]`}
                </span>
                <select
                  value={annotation.status_id}
                  onChange={(e) =>
                    handleStatusChange(annotation.id, Number(e.target.value))
                  }
                  className={`annotation-status status-${getStatusName(annotation.status_id)}`}
                >
                  <option value={ANNOTATION_STATUS.NEW}>New</option>
                  <option value={ANNOTATION_STATUS.IN_PROGRESS}>In Progress</option>
                  <option value={ANNOTATION_STATUS.IN_REVIEW}>In Review</option>
                  <option value={ANNOTATION_STATUS.HOLD}>Hold</option>
                  <option value={ANNOTATION_STATUS.RESOLVED}>Resolved</option>
                </select>
              </div>

              <div className="annotation-content">
                {editingId === annotation.id ? (
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                  />
                ) : (
                  <p>{annotation.content}</p>
                )}
              </div>

              <div className="annotation-meta">
                <span className="annotation-author">By: {annotation.created_by}</span>
                <span className="annotation-date">
                  Created: {formatDate(annotation.created_at)}
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

              <div className="annotation-actions">
                {editingId === annotation.id ? (
                  <>
                    <button
                      onClick={() => saveEdit(annotation.id)}
                      className="btn-save"
                    >
                      Save
                    </button>
                    <button onClick={cancelEdit} className="btn-cancel">
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(annotation)}
                      className="btn-edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(annotation.id)}
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

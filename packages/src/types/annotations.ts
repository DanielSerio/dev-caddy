/**
 * Annotation status types based on schema.dbml
 */
export type AnnotationStatusName =
  | 'new'
  | 'in-progress'
  | 'in-review'
  | 'hold'
  | 'resolved';

export interface AnnotationStatus {
  id: number;
  status_name: AnnotationStatusName;
}

/**
 * Main annotation type based on schema.dbml
 * All timestamp fields are ISO 8601 strings (e.g., "2024-01-15T10:30:00Z")
 */
export interface Annotation {
  /** Unique annotation identifier */
  id: number;
  /** Page URL where annotation was created (normalized) */
  page: string;
  /** HTML tag name of the annotated element */
  element_tag: string;
  /** Compressed representation of element tree for selector generation */
  compressed_element_tree: string;
  /** Element's id attribute if present */
  element_id: string | null;
  /** Element's data-test-id attribute if present */
  element_test_id: string | null;
  /** Element's role attribute if present */
  element_role: string | null;
  /** Space-separated unique class names on the element */
  element_unique_classes: string | null;
  /** CSS selector for parent element */
  element_parent_selector: string | null;
  /** Nth-child position relative to parent selector */
  element_nth_child: number | null;
  /** Annotation content/comment text */
  content: string;
  /** Foreign key to annotation_status table */
  status_id: number;
  /** User identifier who created the annotation (from JWT auth.uid()) */
  created_by: string;
  /** ISO 8601 timestamp when annotation was created */
  created_at: string;
  /** ISO 8601 timestamp when annotation was last updated */
  updated_at: string;
  /** ISO 8601 timestamp when annotation was resolved (null if not resolved) */
  resolved_at: string | null;
}

/**
 * Input type for creating a new annotation
 * Omits auto-generated fields: id, created_at, updated_at, resolved_at
 */
export type CreateAnnotationInput = Omit<
  Annotation,
  'id' | 'created_at' | 'updated_at' | 'resolved_at'
>;

/**
 * Input type for updating an existing annotation
 * Only content and status_id can be updated by users
 * Other fields are managed automatically by the database
 */
export type UpdateAnnotationInput = Partial<
  Pick<Annotation, 'content' | 'status_id'>
>;

/**
 * Annotation with populated status information
 */
export interface AnnotationWithStatus extends Annotation {
  status: AnnotationStatus;
}

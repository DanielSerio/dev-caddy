/**
 * Annotation status types
 *
 * Status values are fixed and never change. TypeScript constants are the source of truth.
 * Database validates with CHECK constraint (status_id BETWEEN 1 AND 5).
 */
export type AnnotationStatusName =
  | 'new'
  | 'in-progress'
  | 'in-review'
  | 'hold'
  | 'resolved';

/**
 * Annotation status ID constants
 *
 * These are the only valid status values. Database enforces this with CHECK constraint.
 * No separate status table is needed since these values are fixed.
 *
 * @example
 * ```typescript
 * // Instead of using magic numbers:
 * await updateAnnotation(id, { status_id: 5 }); // ❌ What does 5 mean?
 *
 * // Use named constants:
 * await updateAnnotation(id, { status_id: ANNOTATION_STATUS.RESOLVED }); // ✅ Clear intent
 * ```
 */
export const ANNOTATION_STATUS = {
  NEW: 1,
  IN_PROGRESS: 2,
  IN_REVIEW: 3,
  HOLD: 4,
  RESOLVED: 5,
} as const;

/**
 * Type for annotation status ID values (1-5)
 */
export type AnnotationStatusId =
  (typeof ANNOTATION_STATUS)[keyof typeof ANNOTATION_STATUS];

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
  /** Status ID (1=new, 2=in-progress, 3=in-review, 4=hold, 5=resolved). Use ANNOTATION_STATUS constants. */
  status_id: number;
  /** User identifier who created the annotation (from JWT auth.uid()) */
  created_by: string;
  /** ISO 8601 timestamp when annotation was created */
  created_at: string;
  /** User identifier who last updated the annotation (from JWT auth.uid()) */
  updated_by: string | null;
  /** ISO 8601 timestamp when annotation was last updated */
  updated_at: string;
  /** ISO 8601 timestamp when annotation was resolved (null if not resolved) */
  resolved_at: string | null;
}

/**
 * Input type for creating a new annotation
 * Omits auto-generated fields: id, created_at, updated_by, updated_at, resolved_at
 */
export type CreateAnnotationInput = Omit<
  Annotation,
  'id' | 'created_at' | 'updated_by' | 'updated_at' | 'resolved_at'
>;

/**
 * Input type for updating an existing annotation
 * Only content and status_id can be updated by users
 * Other fields are managed automatically by the database
 */
export type UpdateAnnotationInput = Partial<
  Pick<Annotation, 'content' | 'status_id'>
>;

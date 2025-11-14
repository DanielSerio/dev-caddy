import type { Annotation } from "../../src/types/annotations";
import { ANNOTATION_STATUS } from "../../src/types/annotations";

/**
 * Creates a mock annotation for use in Storybook stories
 *
 * @param overrides - Optional fields to override in the mock annotation
 * @returns A complete Annotation object with all required fields
 */
export function createMockAnnotation(overrides?: Partial<Annotation>): Annotation {
  const baseAnnotation: Annotation = {
    id: 1,
    page: window.location.pathname,
    element_tag: "button",
    compressed_element_tree: "html>body>div>button",
    element_id: "submit-btn",
    element_test_id: "submit-button",
    element_role: "button",
    element_unique_classes: "btn btn-primary",
    element_parent_selector: "div.form-container",
    element_nth_child: 1,
    content: "This needs fixing",
    status_id: ANNOTATION_STATUS.NEW,
    created_by: "user-123",
    created_by_email: "john.doe@example.com",
    created_at: new Date().toISOString(),
    updated_by: null,
    updated_at: new Date().toISOString(),
    resolved_at: null,
  };

  return { ...baseAnnotation, ...overrides };
}

/**
 * Pre-configured mock annotation for current page
 */
export const currentPageAnnotation = createMockAnnotation({
  page: window.location.pathname,
});

/**
 * Pre-configured mock annotation for a different page
 */
export const otherPageAnnotation = createMockAnnotation({
  id: 2,
  page: "/dashboard",
  status_id: ANNOTATION_STATUS.IN_PROGRESS,
});

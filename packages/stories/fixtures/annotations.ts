import type { Annotation } from '../../src/types/annotations';
import { ANNOTATION_STATUS } from '../../src/types/annotations';

/**
 * Base mock annotation for testing
 */
export const mockAnnotation: Annotation = {
  id: 1,
  page: '/products',
  element_tag: 'button',
  element_id: 'submit-btn',
  element_test_id: 'product-submit',
  element_role: 'button',
  element_unique_classes: 'btn-primary btn-large',
  element_parent_selector: '#product-form',
  element_nth_child: 3,
  content: 'This button should be larger and more prominent',
  status_id: ANNOTATION_STATUS.NEW,
  created_by: 'user-123',
  created_by_email: 'user@example.com',
  created_at: '2025-11-10T14:30:00Z',
  updated_by: null,
  updated_at: '2025-11-10T14:30:00Z',
  resolved_at: null,
  compressed_element_tree: 'html>body>main>form#product-form>button#submit-btn',
};

/**
 * Mock annotation on current page (matches window.location.pathname)
 */
export const mockAnnotationCurrentPage: Annotation = {
  ...mockAnnotation,
  id: 2,
  page: '/', // Assuming current page is '/'
  element_tag: 'h1',
  element_id: 'page-title',
  element_test_id: null,
  element_role: 'heading',
  element_unique_classes: 'heading-large',
  element_parent_selector: 'header',
  element_nth_child: 1,
  content: 'Update this heading to match brand guidelines',
  created_at: '2025-11-11T09:15:00Z',
  updated_at: '2025-11-11T09:15:00Z',
  compressed_element_tree: 'html>body>header>h1#page-title',
};

/**
 * Mock annotation with IN_PROGRESS status
 */
export const mockAnnotationInProgress: Annotation = {
  ...mockAnnotation,
  id: 3,
  page: '/dashboard',
  element_tag: 'div',
  element_id: 'chart-container',
  element_test_id: 'sales-chart',
  element_role: null,
  element_unique_classes: 'chart-wrapper',
  element_parent_selector: '.dashboard-grid',
  element_nth_child: 2,
  content: 'Chart colors need to match the new design system',
  status_id: ANNOTATION_STATUS.IN_PROGRESS,
  created_by: 'designer-456',
  created_by_email: 'designer@example.com',
  created_at: '2025-11-09T16:45:00Z',
  updated_by: 'dev-789',
  updated_at: '2025-11-12T10:20:00Z',
  compressed_element_tree: 'html>body>main>div.dashboard-grid>div#chart-container',
};

/**
 * Mock annotation with IN_REVIEW status
 */
export const mockAnnotationInReview: Annotation = {
  ...mockAnnotation,
  id: 4,
  page: '/settings',
  element_tag: 'input',
  element_id: 'email-input',
  element_test_id: 'user-email',
  element_role: 'textbox',
  element_unique_classes: 'form-control',
  element_parent_selector: '#user-settings-form',
  element_nth_child: 1,
  content: 'Add email validation with better error messages',
  status_id: ANNOTATION_STATUS.IN_REVIEW,
  created_by: 'qa-101',
  created_by_email: 'qa@example.com',
  created_at: '2025-11-08T11:00:00Z',
  updated_by: 'dev-789',
  updated_at: '2025-11-13T08:30:00Z',
  compressed_element_tree: 'html>body>main>form#user-settings-form>input#email-input',
};

/**
 * Mock annotation with HOLD status
 */
export const mockAnnotationOnHold: Annotation = {
  ...mockAnnotation,
  id: 5,
  page: '/checkout',
  element_tag: 'section',
  element_id: 'payment-methods',
  element_test_id: null,
  element_role: null,
  element_unique_classes: 'payment-section',
  element_parent_selector: '#checkout-container',
  element_nth_child: 2,
  content: 'Need to add Apple Pay integration - waiting on API keys',
  status_id: ANNOTATION_STATUS.HOLD,
  created_by: 'pm-202',
  created_by_email: 'pm@example.com',
  created_at: '2025-11-05T13:20:00Z',
  updated_by: 'pm-202',
  updated_at: '2025-11-07T15:45:00Z',
  compressed_element_tree: 'html>body>main>div#checkout-container>section#payment-methods',
};

/**
 * Mock annotation with RESOLVED status
 */
export const mockAnnotationResolved: Annotation = {
  ...mockAnnotation,
  id: 6,
  page: '/about',
  element_tag: 'p',
  element_id: null,
  element_test_id: null,
  element_role: null,
  element_unique_classes: 'company-description',
  element_parent_selector: '.about-section',
  element_nth_child: 2,
  content: 'Fix typo in company description',
  status_id: ANNOTATION_STATUS.RESOLVED,
  created_by: 'editor-303',
  created_by_email: 'editor@example.com',
  created_at: '2025-11-01T10:00:00Z',
  updated_by: 'dev-789',
  updated_at: '2025-11-02T14:30:00Z',
  resolved_at: '2025-11-02T14:30:00Z',
  compressed_element_tree: 'html>body>main>section.about-section>p.company-description',
};

/**
 * Mock annotation with minimal element data (no id, test-id, role, classes)
 */
export const mockAnnotationMinimal: Annotation = {
  ...mockAnnotation,
  id: 7,
  page: '/blog',
  element_tag: 'article',
  element_id: null,
  element_test_id: null,
  element_role: null,
  element_unique_classes: null,
  element_parent_selector: '.blog-grid',
  element_nth_child: 1,
  content: 'Add featured image to this blog post',
  status_id: ANNOTATION_STATUS.NEW,
  created_by: 'content-404',
  created_by_email: 'content@example.com',
  created_at: '2025-11-13T12:00:00Z',
  updated_by: null,
  updated_at: '2025-11-13T12:00:00Z',
  compressed_element_tree: 'html>body>main>div.blog-grid>article',
};

/**
 * Mock annotation with long content (for testing text overflow)
 */
export const mockAnnotationLongContent: Annotation = {
  ...mockAnnotation,
  id: 8,
  page: '/products/jewelry/watches/some-really-really-long-watch-product-name',
  element_tag: 'div',
  element_id: 'product-card',
  element_test_id: 'product-card-123',
  element_role: null,
  element_unique_classes: 'card product-item',
  element_parent_selector: '.products-grid',
  element_nth_child: 5,
  content: 'This is a very long annotation content that spans multiple lines and contains detailed feedback about the product card design. The designer wants to see better spacing between elements, improved typography, and a more prominent call-to-action button. Additionally, the product image should be larger and the price should be highlighted more clearly to improve conversion rates.',
  status_id: ANNOTATION_STATUS.IN_PROGRESS,
  created_by: 'designer-456',
  created_by_email: 'designer@example.com',
  created_at: '2025-11-13T13:15:00Z',
  updated_by: null,
  updated_at: '2025-11-13T13:15:00Z',
  compressed_element_tree: 'html>body>main>div.products-grid>div#product-card',
};

/**
 * Array of all mock annotations for list views
 */
export const mockAnnotations: Annotation[] = [
  mockAnnotation,
  mockAnnotationCurrentPage,
  mockAnnotationInProgress,
  mockAnnotationInReview,
  mockAnnotationOnHold,
  mockAnnotationResolved,
  mockAnnotationMinimal,
  mockAnnotationLongContent,
];

/**
 * Mock annotations filtered by status
 */
export const mockAnnotationsByStatus = {
  new: mockAnnotations.filter((a) => a.status_id === ANNOTATION_STATUS.NEW),
  inProgress: mockAnnotations.filter((a) => a.status_id === ANNOTATION_STATUS.IN_PROGRESS),
  inReview: mockAnnotations.filter((a) => a.status_id === ANNOTATION_STATUS.IN_REVIEW),
  hold: mockAnnotations.filter((a) => a.status_id === ANNOTATION_STATUS.HOLD),
  resolved: mockAnnotations.filter((a) => a.status_id === ANNOTATION_STATUS.RESOLVED),
};

/**
 * Mock annotations filtered by page
 */
export const mockAnnotationsByPage = {
  products: mockAnnotations.filter((a) => a.page === '/products'),
  dashboard: mockAnnotations.filter((a) => a.page === '/dashboard'),
  settings: mockAnnotations.filter((a) => a.page === '/settings'),
  checkout: mockAnnotations.filter((a) => a.page === '/checkout'),
  about: mockAnnotations.filter((a) => a.page === '/about'),
  blog: mockAnnotations.filter((a) => a.page === '/blog'),
  home: mockAnnotations.filter((a) => a.page === '/'),
};

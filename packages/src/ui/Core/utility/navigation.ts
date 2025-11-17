import type { Annotation } from "../../../types/annotations";

/**
 * Session storage key for pending annotation ID
 */
const PENDING_ANNOTATION_KEY = "devcaddy_pending_annotation";

/**
 * Navigate to an annotation's page and select it
 *
 * If the annotation is on a different page, stores the annotation ID in
 * sessionStorage and navigates to that page. The page will then detect
 * the pending annotation on load and select it automatically.
 *
 * If the annotation is on the current page, calls the callback immediately.
 *
 * @param annotation - The annotation to navigate to
 * @param onSelect - Callback to select the annotation (called if on current page)
 *
 * @example
 * navigateToAnnotation(annotation, (ann) => {
 *   setSelectedAnnotation(ann);
 *   scrollToElement(ann);
 * });
 */
export function navigateToAnnotation(
  annotation: Annotation,
  onSelect: (annotation: Annotation) => void
): void {
  const currentPath = window.location.pathname;

  if (annotation.page !== currentPath) {
    // Different page - store annotation ID and navigate
    sessionStorage.setItem(PENDING_ANNOTATION_KEY, annotation.id.toString());
    window.location.pathname = annotation.page;
  } else {
    // Same page - select immediately
    onSelect(annotation);
  }
}

/**
 * Check if there's a pending annotation to select after navigation
 *
 * This should be called on page load to detect if the user navigated
 * from another page by clicking an annotation. If a pending annotation
 * is found, it clears the sessionStorage and returns the annotation ID.
 *
 * @param annotations - All available annotations
 * @param onSelect - Callback to select the annotation if found
 *
 * @example
 * useEffect(() => {
 *   checkPendingAnnotation(annotations, (annotation) => {
 *     setSelectedAnnotation(annotation);
 *     scrollToElement(annotation);
 *   });
 * }, [annotations]);
 */
export function checkPendingAnnotation(
  annotations: Annotation[],
  onSelect: (annotation: Annotation) => void
): void {
  const pendingId = sessionStorage.getItem(PENDING_ANNOTATION_KEY);

  if (pendingId) {
    // Clear the pending annotation
    sessionStorage.removeItem(PENDING_ANNOTATION_KEY);

    // Find the annotation in the list
    const annotation = annotations.find((a) => a.id === Number(pendingId));

    if (annotation) {
      // Select the annotation
      onSelect(annotation);
    }
  }
}

/**
 * Check if an annotation is on the current page
 *
 * @param annotation - The annotation to check
 * @returns True if the annotation's page matches the current pathname
 *
 * @example
 * const badge = isCurrentPage(annotation) ? "Current Page" : annotation.page;
 */
export function isCurrentPage(annotation: Annotation): boolean {
  return annotation.page === window.location.pathname;
}


function isFullURL(url: string): boolean {
  return /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(url);
}

/**
 * Take a string or URL input and return a properly formatted URL.
 * 
 * @param url - The url to format
 * @returns URL object.
 */
export function formattedURL(url: string | URL) {
  if (typeof url !== "string") {
    return url;
  }

  if (isFullURL(url)) {
    return new URL(url);
  }

  const { origin } = window;

  return new URL(`${origin}${url}`.replace(/\/\//g, "/"));
}

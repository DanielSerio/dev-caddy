/**
 * CSS selectors that commonly identify backdrop/overlay elements
 *
 * These patterns are used by popular UI libraries to create modal
 * backdrops and overlays that should not be selectable for annotations.
 */
const BACKDROP_SELECTORS = [
  '.modal-backdrop',
  '.overlay',
  '[data-backdrop]',
  '.MuiBackdrop-root',
  '.MuiModal-backdrop',
  '.chakra-modal__overlay',
  '[role="presentation"]',
] as const;

/**
 * Checks if an element is a backdrop/overlay element
 *
 * Backdrop elements are typically used by modal libraries to create
 * semi-transparent overlays behind modals. These should not be
 * selectable for annotations as they're not actual UI elements.
 *
 * Supports common patterns from:
 * - Material-UI (MuiBackdrop-root, MuiModal-backdrop)
 * - Chakra UI (chakra-modal__overlay)
 * - Radix UI ([role="presentation"])
 * - Generic patterns (.modal-backdrop, .overlay, [data-backdrop])
 *
 * @param element - The HTML element to check
 * @returns true if the element is a backdrop, false otherwise
 *
 * @example
 * ```typescript
 * const handleClick = (event: MouseEvent) => {
 *   const target = event.target as HTMLElement;
 *
 *   if (isBackdropElement(target)) {
 *     return; // Let click pass through - user likely wants to close modal
 *   }
 *
 *   // ... handle element selection
 * };
 * ```
 */
export function isBackdropElement(element: HTMLElement): boolean {
  return BACKDROP_SELECTORS.some((selector) => element.matches(selector));
}

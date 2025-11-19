/**
 * DevCaddy UI Constants
 *
 * Centralized constants for magic numbers, dimensions, and timeouts
 * used throughout the DevCaddy UI components.
 */

/**
 * Popover dimensions for annotation input
 */
export const POPOVER_DIMENSIONS = {
  /** Approximate width of the annotation popover in pixels */
  WIDTH: 320,
  /** Approximate height of the annotation popover in pixels */
  HEIGHT: 200,
  /** Offset from the selected element in pixels */
  OFFSET: 8,
} as const;

/**
 * Debounce timeouts for various operations (in milliseconds)
 */
export const DEBOUNCE_TIMEOUTS = {
  /** Timeout for DOM mutation observer debouncing */
  DOM_MUTATION: 50,
  /** Timeout for scroll event debouncing */
  SCROLL: 100,
  /** Timeout for resize event debouncing */
  RESIZE: 150,
} as const;

/**
 * Z-index values for layering DevCaddy UI elements
 */
export const Z_INDEX = {
  /** Z-index for the annotation popover (highest) */
  POPOVER: 999999,
  /** Z-index for element highlights */
  HIGHLIGHT: 999998,
  /** Z-index for the DevCaddy window */
  WINDOW: 999997,
  /** Z-index for the toggle button */
  TOGGLE: 999996,
} as const;

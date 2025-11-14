import { useState, useCallback } from 'react';
import { useThrottledPosition } from './useThrottledPosition';
import { useElementVisibility } from './useElementVisibility';

/**
 * Position object for element placement
 */
export interface Position {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * Options for position calculation
 */
export interface PositionOptions {
  /** Throttle delay in milliseconds (default: 100) */
  throttleMs?: number;
  /** Offset from element in pixels */
  offset?: {
    top?: number;
    left?: number;
  };
}

/**
 * Custom hook for tracking element position and visibility
 *
 * Combines throttled position tracking and visibility detection into a single hook.
 * Returns the element's position and visibility status.
 *
 * @param element - The element to track
 * @param options - Position calculation options
 * @returns Object with position and visibility status
 *
 * @example
 * ```tsx
 * const { position, isVisible } = useElementPosition(targetElement, {
 *   throttleMs: 100,
 *   offset: { top: 10, left: 0 }
 * });
 *
 * return isVisible && (
 *   <div style={{ position: 'fixed', top: position.top, left: position.left }}>
 *     Popover content
 *   </div>
 * );
 * ```
 */
export function useElementPosition(
  element: Element | null,
  options: PositionOptions = {}
): { position: Position; isVisible: boolean } {
  const { throttleMs = 100, offset = {} } = options;
  const [position, setPosition] = useState<Position>({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });

  const isVisible = useElementVisibility(element);

  const calculatePosition = useCallback(() => {
    if (!element) return;

    const rect = element.getBoundingClientRect();
    setPosition({
      top: rect.top + (offset.top || 0),
      left: rect.left + (offset.left || 0),
      width: rect.width,
      height: rect.height,
    });
  }, [element, offset.top, offset.left]);

  useThrottledPosition(element, calculatePosition, throttleMs);

  return { position, isVisible };
}

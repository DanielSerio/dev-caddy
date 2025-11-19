import { useMemo } from 'react';
import type { WindowCorner } from '../../../types/ui';
import { getCornerStyles } from '../utility';

/**
 * Hook to calculate DevCaddy toggle and window styles based on position
 *
 * Computes the CSS styles for both the toggle button and main window
 * based on the corner position and offset configuration.
 *
 * @param corner - The corner to position the UI ('top-left' | 'top-right' | 'bottom-left' | 'bottom-right')
 * @param offset - The offset from the corner in pixels (or [x, y] tuple)
 * @returns Object with toggle and window styles
 *
 * @example
 * ```typescript
 * function MyComponent({ corner, offset }) {
 *   const styles = useDevCaddyStyles(corner, offset);
 *
 *   return (
 *     <>
 *       <button style={styles.toggle}>Toggle</button>
 *       <div style={styles.window}>Window</div>
 *     </>
 *   );
 * }
 * ```
 */
export function useDevCaddyStyles(
  corner: WindowCorner,
  offset: number | [number, number]
) {
  return useMemo(
    () => ({
      toggle: getCornerStyles('toggle', corner, offset),
      window: getCornerStyles('window', corner, offset),
    }),
    [corner, offset]
  );
}

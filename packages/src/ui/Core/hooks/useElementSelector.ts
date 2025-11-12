import { useState, useEffect, useCallback } from 'react';

/**
 * Selection mode for element selector
 */
export type SelectionMode = 'idle' | 'selecting';

/**
 * Hook for selecting elements on the page for annotation
 *
 * This hook enables a "click to select" mode where users can click any element
 * on the page to select it for annotation. When in selecting mode, hovering
 * over elements shows an outline, and clicking selects the element.
 *
 * @returns Object with selection mode, selected element, and control functions
 *
 * @example
 * const { mode, setMode, selectedElement, clearSelection } = useElementSelector();
 *
 * // Enable selection mode
 * setMode('selecting');
 *
 * // When user clicks an element, selectedElement will be set
 * useEffect(() => {
 *   if (selectedElement) {
 *     console.log('Element selected:', selectedElement);
 *   }
 * }, [selectedElement]);
 */
export function useElementSelector() {
  const [mode, setMode] = useState<SelectionMode>('idle');
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(
    null
  );

  /**
   * Clear the selected element
   */
  const clearSelection = useCallback(() => {
    setSelectedElement(null);
  }, []);

  useEffect(() => {
    if (mode !== 'selecting') {
      return;
    }

    // Store reference to currently hovered element for outline
    let hoveredElement: HTMLElement | null = null;

    /**
     * Handle mouse over to show outline
     */
    const handleMouseOver = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Don't select DevCaddy's own UI elements
      if (target.closest('[data-dev-caddy]')) {
        return;
      }

      hoveredElement = target;
      hoveredElement.style.outline = '2px dashed #0066ff';
      hoveredElement.style.outlineOffset = '2px';
    };

    /**
     * Handle mouse out to remove outline
     */
    const handleMouseOut = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (hoveredElement && hoveredElement === target) {
        hoveredElement.style.outline = '';
        hoveredElement.style.outlineOffset = '';
        hoveredElement = null;
      }
    };

    /**
     * Handle click to select element
     */
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Don't select DevCaddy's own UI elements
      if (target.closest('[data-dev-caddy]')) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      // Remove outline from selected element
      if (hoveredElement) {
        hoveredElement.style.outline = '';
        hoveredElement.style.outlineOffset = '';
      }

      setSelectedElement(target);
      setMode('idle'); // Exit selection mode after selecting
    };

    // Add event listeners
    document.addEventListener('mouseover', handleMouseOver, true);
    document.addEventListener('mouseout', handleMouseOut, true);
    document.addEventListener('click', handleClick, true);

    // Cleanup
    return () => {
      document.removeEventListener('mouseover', handleMouseOver, true);
      document.removeEventListener('mouseout', handleMouseOut, true);
      document.removeEventListener('click', handleClick, true);

      // Remove any remaining outlines
      if (hoveredElement) {
        hoveredElement.style.outline = '';
        hoveredElement.style.outlineOffset = '';
      }
    };
  }, [mode]);

  return {
    mode,
    setMode,
    selectedElement,
    clearSelection,
  };
}

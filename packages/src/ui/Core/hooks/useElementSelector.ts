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

  /**
   * Add highlighted border to selected element while creating/editing annotation
   */
  useEffect(() => {
    if (!selectedElement) {
      return;
    }

    // Add highlight to selected element
    selectedElement.style.outline = '3px solid var(--dc-primary, #6633ff)';
    selectedElement.style.outlineOffset = '2px';

    // Cleanup: remove highlight when selection changes or clears
    return () => {
      selectedElement.style.outline = '';
      selectedElement.style.outlineOffset = '';
    };
  }, [selectedElement]);

  /**
   * Observe DOM mutations to detect if selected element is removed
   *
   * This handles cases where:
   * - User starts annotating an element inside a modal
   * - Modal is closed while popover is still open
   * - Element is removed from DOM by framework (React, Vue, etc.)
   *
   * When element is removed, we auto-clear the selection to prevent errors.
   */
  useEffect(() => {
    if (!selectedElement) {
      return;
    }

    let timeoutId: number | null = null;

    const observer = new MutationObserver(() => {
      // Debounce checks to avoid excessive calls during rapid DOM changes
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }

      timeoutId = window.setTimeout(() => {
        // Check if element is still in the document
        if (!document.body.contains(selectedElement)) {
          clearSelection();
        }
      }, 50);
    });

    // Observe entire document for child list changes
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    };
  }, [selectedElement, clearSelection]);

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

      // Don't select modal backdrops/overlays
      // Common patterns from popular modal libraries:
      // - Material-UI: .MuiBackdrop-root, .MuiModal-backdrop
      // - Chakra UI: .chakra-modal__overlay
      // - Radix UI: [data-radix-portal] with overlay role
      // - Headless UI: [data-headlessui-portal] with overlay
      // - Generic: .modal-backdrop, .overlay, [data-backdrop]
      const backdropSelectors = [
        '.modal-backdrop',
        '.overlay',
        '[data-backdrop]',
        '.MuiBackdrop-root',
        '.MuiModal-backdrop',
        '.chakra-modal__overlay',
        '[role="presentation"]',
      ];

      if (backdropSelectors.some(selector => target.matches(selector))) {
        // Let click pass through - user likely wants to close modal
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      // Remove outline from hovered element
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

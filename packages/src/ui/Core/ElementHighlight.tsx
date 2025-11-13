import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { Annotation } from '../../types/annotations';

/**
 * Check if an element is actually visible (not behind a modal/overlay)
 */
function isElementVisible(element: Element): boolean {
  const rect = element.getBoundingClientRect();

  // Check center point of element
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  // Get the topmost element at this position
  const topElement = document.elementFromPoint(centerX, centerY);

  // Element is visible if it (or one of its descendants) is at the top
  return topElement !== null && element.contains(topElement);
}

/**
 * Find a DOM element using annotation selectors
 */
function findElement(annotation: Annotation): Element | null {
  // Try test ID first (most reliable)
  if (annotation.element_test_id) {
    const el = document.querySelector(`[data-testid="${annotation.element_test_id}"]`);
    if (el) return el;
  }

  // Try ID
  if (annotation.element_id) {
    const el = document.getElementById(annotation.element_id);
    if (el) return el;
  }

  // Try unique classes with tag
  if (annotation.element_unique_classes) {
    const tag = annotation.element_tag.toLowerCase();
    const classes = annotation.element_unique_classes.split(' ').map(c => `.${c}`).join('');
    const el = document.querySelector(`${tag}${classes}`);
    if (el) return el;
  }

  // Try using compressed element tree as fallback
  if (annotation.compressed_element_tree) {
    try {
      // Convert compressed tree to querySelector syntax
      // e.g., "body>DIV[0]>P[1]" -> "body > div:nth-child(1) > p:nth-child(2)"
      const selector = annotation.compressed_element_tree
        .split('>')
        .map(segment => {
          const match = segment.match(/^([A-Za-z0-9]+)\[(\d+)\]$/);
          if (match) {
            const tag = match[1].toLowerCase();
            const index = parseInt(match[2], 10) + 1; // nth-child is 1-based
            return `${tag}:nth-child(${index})`;
          }
          return segment.toLowerCase();
        })
        .join(' > ');

      const el = document.querySelector(selector);
      if (el) return el;
    } catch (e) {
      console.warn('[ElementHighlight] Failed to parse compressed tree:', annotation.compressed_element_tree, e);
    }
  }

  return null;
}

/**
 * Props for ElementHighlight component
 */
interface ElementHighlightProps {
  /** The annotation whose element should be highlighted */
  annotation: Annotation | null;
}

/**
 * ElementHighlight component
 *
 * Renders a visual highlight overlay on the element associated with an annotation.
 * The highlight automatically scrolls the element into view and updates on window resize/scroll.
 *
 * @example
 * <ElementHighlight annotation={selectedAnnotation} />
 */
export function ElementHighlight({ annotation }: ElementHighlightProps) {
  const [element, setElement] = useState<Element | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  const updateRect = useCallback(() => {
    if (!element) return;
    setRect(element.getBoundingClientRect());
    setIsVisible(isElementVisible(element));
  }, [element]);

  useEffect(() => {
    if (!annotation) {
      setElement(null);
      setRect(null);
      setIsVisible(true);
      return;
    }

    const targetElement = findElement(annotation);

    if (targetElement) {
      setElement(targetElement);

      // Scroll element into view
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Initial rect and visibility calculation
      setRect(targetElement.getBoundingClientRect());
      setIsVisible(isElementVisible(targetElement));
    } else {
      setElement(null);
      setRect(null);
      setIsVisible(true);
    }
  }, [annotation]);

  /**
   * Update highlight position on window scroll/resize and parent container scroll
   */
  useEffect(() => {
    if (!element) return;

    // Find all scrollable ancestors
    const scrollableAncestors: HTMLElement[] = [];
    let parent = element.parentElement;

    while (parent) {
      const computedStyle = window.getComputedStyle(parent);
      const overflow = computedStyle.overflow + computedStyle.overflowY + computedStyle.overflowX;

      if (overflow.includes('scroll') || overflow.includes('auto')) {
        scrollableAncestors.push(parent);
      }

      parent = parent.parentElement;
    }

    // Throttle updates for performance
    let throttleTimer: number | null = null;

    const handleUpdate = () => {
      if (throttleTimer !== null) {
        return;
      }

      throttleTimer = window.setTimeout(() => {
        updateRect();
        throttleTimer = null;
      }, 100);
    };

    // Add listeners to window and scrollable ancestors
    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);

    scrollableAncestors.forEach(el => {
      el.addEventListener('scroll', handleUpdate, { passive: true });
    });

    // Watch for DOM changes (e.g., modals opening/closing)
    const mutationObserver = new MutationObserver(() => {
      handleUpdate();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'], // Watch for style/class changes that might affect visibility
    });

    return () => {
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);

      scrollableAncestors.forEach(el => {
        el.removeEventListener('scroll', handleUpdate);
      });

      mutationObserver.disconnect();

      if (throttleTimer !== null) {
        clearTimeout(throttleTimer);
      }
    };
  }, [element, updateRect]);

  // Don't render highlight if element is not visible (behind modal/overlay)
  if (!element || !rect || !annotation || !isVisible) {
    return null;
  }

  const scrollY = window.scrollY || document.documentElement.scrollTop;
  const scrollX = window.scrollX || document.documentElement.scrollLeft;

  return createPortal(
    <div
      className="dev-caddy-element-highlight"
      data-testid="element-highlight"
      style={{
        position: 'absolute',
        top: `${rect.top + scrollY}px`,
        left: `${rect.left + scrollX}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        zIndex: 999997,
        pointerEvents: 'none',
      }}
    />,
    document.body
  );
}

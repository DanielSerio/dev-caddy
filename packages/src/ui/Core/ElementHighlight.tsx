import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Annotation } from '../../types/annotations';

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
      const selector = annotation.compressed_element_tree
        .split('>')
        .map(segment => {
          const match = segment.match(/^([A-Z]+)\[(\d+)\]$/);
          if (match) {
            const tag = match[1].toLowerCase();
            const index = parseInt(match[2], 10) + 1;
            return `${tag}:nth-child(${index})`;
          }
          return segment.toLowerCase();
        })
        .join('>');

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

  useEffect(() => {
    if (!annotation) {
      setElement(null);
      setRect(null);
      return;
    }

    const targetElement = findElement(annotation);

    if (targetElement) {
      setElement(targetElement);

      // Scroll element into view
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

      const updateRect = () => {
        setRect(targetElement.getBoundingClientRect());
      };

      updateRect();

      // Update on scroll/resize
      window.addEventListener('scroll', updateRect, true);
      window.addEventListener('resize', updateRect);

      return () => {
        window.removeEventListener('scroll', updateRect, true);
        window.removeEventListener('resize', updateRect);
      };
    } else {
      setElement(null);
      setRect(null);
    }
  }, [annotation]);

  if (!element || !rect || !annotation) {
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

import { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import type { Annotation } from '../../types/annotations';
import { findElement } from './lib/element';
import { useElementPosition } from './hooks';

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

  // Memoize options to prevent new object on every render
  const positionOptions = useMemo(() => ({ throttleMs: 100 }), []);

  // Use useElementPosition hook for automatic position and visibility tracking
  const { position, isVisible } = useElementPosition(element, positionOptions);

  // Find and scroll to element when annotation changes
  useEffect(() => {
    if (!annotation) {
      setElement(null);
      return;
    }

    const targetElement = findElement(annotation);

    if (targetElement) {
      setElement(targetElement);
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      setElement(null);
    }
  }, [annotation]);

  // Don't render highlight if element is not visible (behind modal/overlay)
  if (!element || !annotation || !isVisible) {
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
        top: `${position.top + scrollY}px`,
        left: `${position.left + scrollX}px`,
        width: `${position.width}px`,
        height: `${position.height}px`,
        zIndex: 999997,
        pointerEvents: 'none',
      }}
    />,
    document.body
  );
}

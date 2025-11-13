import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAnnotations } from './context';
import { getStatusName } from './lib/status';
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
      console.warn('[findElement] Failed to parse compressed tree:', annotation.compressed_element_tree, e);
    }
  }

  return null;
}

/**
 * Calculate position for an annotation badge (top-right corner of element)
 */
function getBadgePosition(element: Element | null): { top: number; left: number } | null {
  if (!element) return null;

  const rect = element.getBoundingClientRect();
  const scrollY = window.scrollY || document.documentElement.scrollTop;
  const scrollX = window.scrollX || document.documentElement.scrollLeft;

  return {
    top: rect.top + scrollY, // Top edge of element
    left: rect.right + scrollX - 4, // Right edge of element, offset slightly left
  };
}

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
 * Single annotation badge component for one status on one element
 */
function AnnotationBadge({
  annotations,
  statusId
}: {
  annotations: Annotation[];
  statusId: number;
}) {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [element, setElement] = useState<Element | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Use the first annotation's selector to find the element
    const firstAnnotation = annotations[0];
    const targetElement = findElement(firstAnnotation);

    setElement(targetElement);

    if (targetElement) {
      const updatePosition = () => {
        const pos = getBadgePosition(targetElement);
        setPosition(pos);

        // Check if element is visible (not behind modal)
        setIsVisible(isElementVisible(targetElement));
      };

      updatePosition();

      // Update position on scroll/resize
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);

      // Watch for DOM changes (e.g., modals opening/closing)
      const mutationObserver = new MutationObserver(() => {
        updatePosition();
      });

      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class'], // Watch for style/class changes
      });

      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
        mutationObserver.disconnect();
      };
    }
  }, [annotations]);

  // Don't render badge if element is not visible (behind modal/overlay)
  if (!element || !position || !isVisible) {
    return null;
  }

  const handleClick = () => {
    // Scroll element into view and highlight it
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const statusName = getStatusName(statusId);
  const count = annotations.length;

  return createPortal(
    <div
      className={`dev-caddy-annotation-badge status-${statusName}`}
      data-testid="annotation-badge"
      data-status={statusName}
      data-count={count}
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 999998,
      }}
      onClick={handleClick}
      title={`${count} ${statusName} annotation${count !== 1 ? 's' : ''}`}
    >
      <span className="badge-count">{count}</span>
    </div>,
    document.body
  );
}

/**
 * Props for AnnotationBadges component
 */
interface AnnotationBadgesProps {
  /** Whether DevCaddy is open/active */
  isActive: boolean;
  /** Current selection mode ('idle' | 'selecting') */
  selectionMode: 'idle' | 'selecting';
  /** Currently selected element (if any) */
  selectedElement: HTMLElement | null;
  /** Currently viewing annotation (if any) */
  viewingAnnotation: Annotation | null;
}

/**
 * Create a unique key for an element based on its selectors
 */
function getElementKey(annotation: Annotation): string {
  if (annotation.element_test_id) return `testid:${annotation.element_test_id}`;
  if (annotation.element_id) return `id:${annotation.element_id}`;
  if (annotation.element_unique_classes) return `classes:${annotation.element_unique_classes}`;
  if (annotation.compressed_element_tree) return `tree:${annotation.compressed_element_tree}`;
  return `unknown:${annotation.id}`;
}

/**
 * Group annotations by element and then by status
 */
function groupAnnotations(annotations: Annotation[]): Map<string, Map<number, Annotation[]>> {
  const elementGroups = new Map<string, Map<number, Annotation[]>>();

  annotations.forEach((annotation) => {
    const elementKey = getElementKey(annotation);

    if (!elementGroups.has(elementKey)) {
      elementGroups.set(elementKey, new Map());
    }

    const statusGroups = elementGroups.get(elementKey)!;
    const statusId = annotation.status_id;

    if (!statusGroups.has(statusId)) {
      statusGroups.set(statusId, []);
    }

    statusGroups.get(statusId)!.push(annotation);
  });

  return elementGroups;
}

/**
 * Annotation badges component
 *
 * Renders visual badges on annotated elements when DevCaddy is active.
 * Groups annotations by element and status, showing a count badge for each
 * status on each element. Badges are positioned in the top-right corner
 * of their target elements.
 *
 * Badges are ONLY visible when:
 * - An element is currently selected (creating new annotation), OR
 * - Viewing an existing annotation's element
 *
 * This prevents badges from appearing through modals and keeps the UI clean.
 *
 * @example
 * <AnnotationBadges
 *   isActive={devCaddyIsActive}
 *   selectionMode={mode}
 *   selectedElement={selectedElement}
 *   viewingAnnotation={viewingAnnotation}
 * />
 */
export function AnnotationBadges({
  selectedElement,
  viewingAnnotation,
}: AnnotationBadgesProps) {
  const { annotations } = useAnnotations();

  const groupedAnnotations = groupAnnotations(annotations);
  const badges: React.ReactElement[] = [];

  // Determine which element's badges should be visible
  let targetElementKey: string | null = null;

  // Priority 1: Show badges for selected element (creating new annotation)
  if (selectedElement) {
    for (const annotation of annotations) {
      const element = findElement(annotation);
      if (element === selectedElement) {
        targetElementKey = getElementKey(annotation);
        break;
      }
    }
  }
  // Priority 2: Show badges for viewing annotation's element
  else if (viewingAnnotation) {
    targetElementKey = getElementKey(viewingAnnotation);
  }

  // No element to show badges for
  if (!targetElementKey) {
    return null;
  }

  // Only create badges for the target element
  const statusGroups = groupedAnnotations.get(targetElementKey);

  if (statusGroups) {
    statusGroups.forEach((annotationsForStatus, statusId) => {
      badges.push(
        <AnnotationBadge
          key={`${targetElementKey}-${statusId}`}
          annotations={annotationsForStatus}
          statusId={statusId}
        />
      );
    });
  }

  return <>{badges}</>;
}

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAnnotations } from './context';
import { getStatusName } from './lib/status';
import type { Annotation } from '../../types/annotations';
import { findElement, isElementVisible, getBadgePosition } from './lib/element';
import { getElementKey, groupAnnotations } from './lib/annotation';

/**
 * Single annotation badge component for one status on one element
 *
 * Internal component that renders a positioned badge with annotation count.
 * Automatically updates position on scroll/resize and monitors visibility.
 */
function SingleBadge({
  annotations,
  statusId
}: {
  annotations: Annotation[];
  statusId: number;
}) {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [element, setElement] = useState<Element | null>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const firstAnnotation = annotations[0];
    const targetElement = findElement(firstAnnotation);
    setElement(targetElement);

    if (targetElement) {
      const updatePosition = () => {
        setPosition(getBadgePosition(targetElement));
        setVisible(isElementVisible(targetElement));
      };

      updatePosition();

      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);

      const observer = new MutationObserver(updatePosition);
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class'],
      });

      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
        observer.disconnect();
      };
    }
  }, [annotations]);

  if (!element || !position || !visible) {
    return null;
  }

  const handleClick = () => {
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

  // Group annotations and get badges for target element
  const groupedAnnotations = groupAnnotations(annotations);
  const statusGroups = groupedAnnotations.get(targetElementKey);

  if (!statusGroups) {
    return null;
  }

  // Render badges for each status on the target element
  const badges: React.ReactElement[] = [];
  statusGroups.forEach((annotationsForStatus, statusId) => {
    badges.push(
      <SingleBadge
        key={`${targetElementKey}-${statusId}`}
        annotations={annotationsForStatus}
        statusId={statusId}
      />
    );
  });

  return <>{badges}</>;
}

import { formatElementSelector } from "../../utility";
import type { Annotation } from "../../../../types/annotations";

/**
 * Props for ElementCode component
 */
export interface ElementCodeProps {
  /** The annotation containing element information */
  annotation: Annotation;
  /** Additional CSS class name */
  className?: string;
}

/**
 * Element code display component
 *
 * Displays the element selector as formatted code in a code block.
 * Used in detail views to show which element the annotation is attached to.
 *
 * @example
 * ```tsx
 * <ElementCode annotation={annotation} />
 * <ElementCode annotation={annotation} className="custom-style" />
 * ```
 */
export function ElementCode({ annotation, className = "" }: ElementCodeProps) {
  return (
    <div className={`detail-value element-info ${className}`.trim()}>
      <code data-testid="element-code">{formatElementSelector(annotation)}</code>
    </div>
  );
}

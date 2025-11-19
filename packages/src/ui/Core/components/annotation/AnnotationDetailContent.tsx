import type { Annotation } from "../../../../types/annotations";
import { DetailSection } from "../layout";
import { ElementCode } from "../display";
import { sanitizeContent } from "../../utility";

/**
 * Props for AnnotationDetailContent component
 */
interface AnnotationDetailContentProps {
  /** The annotation to display */
  annotation: Annotation;
}

/**
 * Content display for annotation detail views
 *
 * Shows the annotation's content and associated element information.
 * Used by both Developer and Client AnnotationDetail components.
 *
 * @example
 * ```tsx
 * <AnnotationDetailContent annotation={annotation} />
 * ```
 */
export function AnnotationDetailContent({
  annotation,
}: AnnotationDetailContentProps) {
  return (
    <>
      <DetailSection label="Element">
        <ElementCode annotation={annotation} />
      </DetailSection>

      <DetailSection label="Feedback">
        <p className="annotation-content-text">
          {sanitizeContent(annotation.content)}
        </p>
      </DetailSection>
    </>
  );
}

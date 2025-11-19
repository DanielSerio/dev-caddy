import { BackButton } from "../button";

/**
 * Props for AnnotationDetailHeader component
 */
interface AnnotationDetailHeaderProps {
  /** Callback when back button is clicked */
  onBack: () => void;
}

/**
 * Header for annotation detail views
 *
 * Provides consistent header layout with back button navigation.
 * Used by both Developer and Client AnnotationDetail components.
 *
 * @example
 * ```tsx
 * <AnnotationDetailHeader onBack={() => setSelectedAnnotation(null)} />
 * ```
 */
export function AnnotationDetailHeader({ onBack }: AnnotationDetailHeaderProps) {
  return (
    <div className="annotation-detail-header">
      <BackButton onClick={onBack} label="Back to list" />
    </div>
  );
}

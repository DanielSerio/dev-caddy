import { createContext } from 'react';
import type {
  Annotation,
  CreateAnnotationInput,
  UpdateAnnotationInput,
} from '../../../types/annotations';

/**
 * Annotation context interface
 */
export interface AnnotationContextValue {
  /** All annotations across the entire project */
  annotations: Annotation[];
  /** Create a new annotation */
  addAnnotation: (input: CreateAnnotationInput) => Promise<Annotation>;
  /** Update an existing annotation */
  updateAnnotation: (
    id: number,
    input: UpdateAnnotationInput
  ) => Promise<Annotation>;
  /** Delete an annotation */
  deleteAnnotation: (id: number) => Promise<void>;
  /** Loading state for initial fetch */
  loading: boolean;
  /** Error state */
  error: Error | null;
}

/**
 * Annotation context
 */
export const AnnotationContext = createContext<AnnotationContextValue | undefined>(
  undefined
);

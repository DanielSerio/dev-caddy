import { useContext } from 'react';
import { AnnotationContext } from '../context/AnnotationContext';

/**
 * Hook to access annotation context
 *
 * Must be used within an AnnotationProvider.
 *
 * @throws {Error} If used outside of AnnotationProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { annotations, addAnnotation } = useAnnotations();
 *   // ...
 * }
 * ```
 */
export function useAnnotations() {
  const context = useContext(AnnotationContext);

  if (!context) {
    throw new Error(
      'useAnnotations must be used within an AnnotationProvider. ' +
        'Make sure your component is wrapped with <AnnotationProvider>.'
    );
  }

  return context;
}

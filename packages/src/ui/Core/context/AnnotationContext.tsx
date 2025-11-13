import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import {
  createAnnotation as apiCreateAnnotation,
  updateAnnotation as apiUpdateAnnotation,
  deleteAnnotation as apiDeleteAnnotation,
  getAllAnnotations,
  subscribeToAllAnnotations,
} from '../../../client';
import type {
  Annotation,
  CreateAnnotationInput,
  UpdateAnnotationInput,
} from '../../../types/annotations';
import type { RealtimeEventType } from '../../../client';

/**
 * Annotation context interface
 */
interface AnnotationContextValue {
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
const AnnotationContext = createContext<AnnotationContextValue | undefined>(
  undefined
);

/**
 * Props for AnnotationProvider
 */
interface AnnotationProviderProps {
  /** Child components */
  children: ReactNode;
}

/**
 * Annotation provider component
 *
 * Manages annotation state for the entire project, including:
 * - Loading all annotations from the database
 * - Real-time subscription to annotation changes (project-wide)
 * - CRUD operations for annotations
 *
 * Note: This provider loads ALL annotations across all pages.
 * Users can filter annotations by page in the UI layer.
 *
 * @example
 * <AnnotationProvider>
 *   <YourApp />
 * </AnnotationProvider>
 */
export function AnnotationProvider({
  children,
}: AnnotationProviderProps) {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Load all annotations (project-wide) on mount
   */
  useEffect(() => {
    let cancelled = false;

    async function loadAnnotations() {
      try {
        setLoading(true);
        setError(null);

        const data = await getAllAnnotations();

        if (!cancelled) {
          setAnnotations(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err : new Error('Failed to load annotations')
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAnnotations();

    return () => {
      cancelled = true;
    };
  }, []); // No dependencies - load once on mount

  /**
   * Subscribe to real-time annotation changes (project-wide)
   */
  useEffect(() => {
    const unsubscribe = subscribeToAllAnnotations(
      (annotation, eventType: RealtimeEventType) => {
        setAnnotations((prev) => {
          if (eventType === 'DELETE') {
            // Remove deleted annotation
            return prev.filter((a) => a.id !== annotation.id);
          }

          // Check if annotation already exists
          const existingIndex = prev.findIndex((a) => a.id === annotation.id);

          if (existingIndex > -1) {
            // Update existing annotation
            const updated = [...prev];
            updated[existingIndex] = annotation;
            return updated;
          } else {
            // Add new annotation
            return [annotation, ...prev];
          }
        });
      }
    );

    return unsubscribe;
  }, []); // No dependencies - subscribe once on mount

  /**
   * Create a new annotation
   */
  const addAnnotation = useCallback(
    async (input: CreateAnnotationInput): Promise<Annotation> => {
      try {
        const newAnnotation = await apiCreateAnnotation(input);

        // Update state with response data
        setAnnotations((prev) => [newAnnotation, ...prev]);

        return newAnnotation;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to create annotation');
        setError(error);
        throw error;
      }
    },
    []
  );

  /**
   * Update an existing annotation
   */
  const updateAnnotation = useCallback(
    async (
      id: number,
      input: UpdateAnnotationInput
    ): Promise<Annotation> => {
      try {
        const updated = await apiUpdateAnnotation(id, input);

        // Update state with response data
        setAnnotations((prev) => {
          const index = prev.findIndex((a) => a.id === id);
          if (index > -1) {
            const newAnnotations = [...prev];
            newAnnotations[index] = updated;
            return newAnnotations;
          }
          return prev;
        });

        return updated;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to update annotation');
        setError(error);
        throw error;
      }
    },
    []
  );

  /**
   * Delete an annotation
   */
  const deleteAnnotation = useCallback(async (id: number): Promise<void> => {
    try {
      await apiDeleteAnnotation(id);

      // Update state after successful deletion
      setAnnotations((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to delete annotation');
      setError(error);
      throw error;
    }
  }, []);

  const value: AnnotationContextValue = {
    annotations,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
    loading,
    error,
  };

  return (
    <AnnotationContext.Provider value={value}>
      {children}
    </AnnotationContext.Provider>
  );
}

/**
 * Hook to access annotation context
 *
 * @throws {Error} If used outside of AnnotationProvider
 *
 * @example
 * const { annotations, addAnnotation } = useAnnotations();
 */
export function useAnnotations(): AnnotationContextValue {
  const context = useContext(AnnotationContext);

  if (!context) {
    throw new Error(
      'useAnnotations must be used within an AnnotationProvider'
    );
  }

  return context;
}

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
  getAnnotationsByPage,
  subscribeToAnnotations,
} from '../../../client';
import type {
  Annotation,
  CreateAnnotationInput,
  UpdateAnnotationInput,
} from '../../../types/annotations';

/**
 * Annotation context interface
 */
interface AnnotationContextValue {
  /** All annotations for the current page */
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
  /** Current page pathname (defaults to window.location.pathname) */
  pageUrl?: string;
}

/**
 * Annotation provider component
 *
 * Manages annotation state for the current page, including:
 * - Loading annotations from the database
 * - Real-time subscription to annotation changes
 * - CRUD operations for annotations
 *
 * @example
 * <AnnotationProvider>
 *   <YourApp />
 * </AnnotationProvider>
 */
export function AnnotationProvider({
  children,
  pageUrl = typeof window !== 'undefined' ? window.location.pathname : '',
}: AnnotationProviderProps) {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(pageUrl);

  /**
   * Track URL changes for SPA navigation
   */
  useEffect(() => {
    const handleUrlChange = () => {
      const newPath = window.location.pathname;
      if (newPath !== currentPage) {
        setCurrentPage(newPath);
      }
    };

    // Listen for browser back/forward navigation
    window.addEventListener('popstate', handleUrlChange);

    // Intercept pushState and replaceState for SPA navigation
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (...args) {
      originalPushState.apply(this, args);
      handleUrlChange();
    };

    window.history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      handleUrlChange();
    };

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, [currentPage]);

  /**
   * Load initial annotations for the current page
   */
  useEffect(() => {
    let cancelled = false;

    async function loadAnnotations() {
      try {
        setLoading(true);
        setError(null);

        const data = await getAnnotationsByPage(currentPage);

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
  }, [currentPage]);

  /**
   * Subscribe to real-time annotation changes
   */
  useEffect(() => {
    const unsubscribe = subscribeToAnnotations(
      currentPage,
      (annotation) => {
        setAnnotations((prev) => {
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
  }, [currentPage]);

  /**
   * Create a new annotation
   */
  const addAnnotation = useCallback(
    async (input: CreateAnnotationInput): Promise<Annotation> => {
      try {
        const newAnnotation = await apiCreateAnnotation(input);
        // Real-time subscription will update state
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
        // Real-time subscription will update state
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
      // Optimistically remove from state
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

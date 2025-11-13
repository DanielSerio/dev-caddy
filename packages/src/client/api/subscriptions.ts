import { getSupabaseClient } from './init';
import type { Annotation } from '../../types/annotations';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Normalize a URL for consistent annotation matching
 *
 * This function strips protocol, default ports, query params, and hash
 * to create a consistent page identifier for annotations.
 *
 * @param url - The URL to normalize
 * @returns Normalized URL string
 *
 * @example
 * normalizeUrl('https://example.com:443/page?foo=bar#section')
 * // Returns: 'example.com/page'
 *
 * normalizeUrl('http://localhost:3000/products')
 * // Returns: 'localhost:3000/products'
 *
 * normalizeUrl('https://app.site.com/dashboard/')
 * // Returns: 'app.site.com/dashboard'
 */
export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);

    // Start with hostname
    let normalized = parsed.hostname;

    // Add port if it's not a default port
    if (parsed.port && parsed.port !== '80' && parsed.port !== '443') {
      normalized += `:${parsed.port}`;
    }

    // Add pathname, removing trailing slash
    const pathname = parsed.pathname.replace(/\/$/, '') || '';
    normalized += pathname;

    return normalized;
  } catch {
    // If URL parsing fails, return the original string stripped of common parts
    return url
      .replace(/^https?:\/\//, '') // Remove protocol
      .replace(/:\d+/, '') // Remove port
      .replace(/[?#].*$/, '') // Remove query and hash
      .replace(/\/$/, ''); // Remove trailing slash
  }
}

/**
 * Callback function for annotation changes
 */
export type AnnotationChangeCallback = (annotation: Annotation) => void;

/**
 * Realtime event types for annotations
 */
export type RealtimeEventType = 'INSERT' | 'UPDATE' | 'DELETE';

/**
 * Callback function for annotation realtime updates with event type
 *
 * Used for project-wide subscriptions where you need to know
 * whether an annotation was inserted, updated, or deleted.
 */
export type AnnotationRealtimeCallback = (
  annotation: Annotation,
  eventType: RealtimeEventType
) => void;

/**
 * Subscribe to real-time changes for ALL annotations across the entire project
 *
 * Creates a Supabase Realtime subscription that listens for INSERT, UPDATE,
 * and DELETE events on all annotations, regardless of page.
 *
 * This is used for project-wide annotation views where users need to see
 * all feedback across all pages in a single list.
 *
 * @param callback - Function called when any annotation changes (receives annotation and event type)
 * @returns Unsubscribe function to stop listening
 * @throws {Error} If DevCaddy is not initialized
 *
 * @example
 * const unsubscribe = subscribeToAllAnnotations(
 *   (annotation, eventType) => {
 *     if (eventType === 'INSERT') {
 *       console.log('New annotation:', annotation);
 *     } else if (eventType === 'UPDATE') {
 *       console.log('Updated annotation:', annotation);
 *     } else if (eventType === 'DELETE') {
 *       console.log('Deleted annotation:', annotation);
 *     }
 *   }
 * );
 *
 * // Later, stop listening
 * unsubscribe();
 */
export function subscribeToAllAnnotations(
  callback: AnnotationRealtimeCallback
): () => void {
  const client = getSupabaseClient();

  // Create a project-wide channel
  const channelName = 'annotations:all';

  const channel: RealtimeChannel = client
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*', // Listen to INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'annotation',
        // No filter - subscribe to ALL annotations
      },
      (payload) => {
        // The payload.new contains the annotation data for INSERT and UPDATE
        // For DELETE, payload.old contains the deleted annotation
        const annotation =
          payload.eventType === 'DELETE'
            ? (payload.old as Annotation)
            : (payload.new as Annotation);

        const eventType = payload.eventType as RealtimeEventType;

        if (annotation) {
          callback(annotation, eventType);
        }
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    client.removeChannel(channel);
  };
}

/**
 * Subscribe to real-time annotation changes for a specific page
 *
 * Creates a Supabase Realtime subscription that listens for INSERT, UPDATE,
 * and DELETE events on annotations matching the normalized page URL.
 *
 * @param pageUrl - The page URL to subscribe to (will be normalized)
 * @param callback - Function called when annotations change
 * @returns Unsubscribe function to stop listening
 * @throws {Error} If DevCaddy is not initialized
 *
 * @example
 * const unsubscribe = subscribeToAnnotations(
 *   window.location.href,
 *   (annotation) => {
 *     console.log('Annotation changed:', annotation);
 *   }
 * );
 *
 * // Later, stop listening
 * unsubscribe();
 */
export function subscribeToAnnotations(
  pageUrl: string,
  callback: AnnotationChangeCallback
): () => void {
  const client = getSupabaseClient();
  const normalizedUrl = normalizeUrl(pageUrl);

  // Create a unique channel name for this page
  const channelName = `annotations:${normalizedUrl}`;

  const channel: RealtimeChannel = client
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*', // Listen to INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'annotation',
        filter: `page=eq.${normalizedUrl}`,
      },
      (payload) => {
        // The payload.new contains the annotation data for INSERT and UPDATE
        // For DELETE, payload.old contains the deleted annotation
        const annotation =
          payload.eventType === 'DELETE'
            ? (payload.old as Annotation)
            : (payload.new as Annotation);

        if (annotation) {
          callback(annotation);
        }
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    client.removeChannel(channel);
  };
}

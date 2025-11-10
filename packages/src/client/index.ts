/**
 * DevCaddy Client API
 *
 * This module provides the client-side API for interacting with DevCaddy's
 * annotation system. It includes functions for initialization, creating/updating
 * annotations, and subscribing to real-time updates.
 *
 * @module client
 */

// Initialization
export { initDevCaddy, getSupabaseClient, type DevCaddyConfig } from './api/init';

// Annotation CRUD operations
export {
  createAnnotation,
  updateAnnotation,
  deleteAnnotation,
  getAnnotationsByPage,
} from './api/annotations';

// Realtime subscriptions
export {
  subscribeToAnnotations,
  normalizeUrl,
  type AnnotationChangeCallback,
} from './api/subscriptions';

// Re-export types from annotations
export type {
  Annotation,
  CreateAnnotationInput,
  UpdateAnnotationInput,
  AnnotationStatus,
  AnnotationStatusName,
  AnnotationWithStatus,
} from '../types/annotations';

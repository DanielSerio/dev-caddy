import { getSupabaseClient } from './init';
import type {
  Annotation,
  CreateAnnotationInput,
  UpdateAnnotationInput,
} from '../../types/annotations';

/**
 * Create a new annotation
 *
 * @param input - Annotation data excluding auto-generated fields
 * @returns Promise resolving to the created annotation
 * @throws {Error} If DevCaddy is not initialized
 * @throws {Error} If the database operation fails
 *
 * @example
 * ```typescript
 * import { ANNOTATION_STATUS } from 'dev-caddy/types/annotations';
 *
 * const annotation = await createAnnotation({
 *   page: '/products',
 *   element_tag: 'button',
 *   compressed_element_tree: '...',
 *   element_id: 'submit-btn',
 *   element_test_id: null,
 *   element_role: 'button',
 *   element_unique_classes: 'btn-primary',
 *   element_parent_selector: '#form',
 *   element_nth_child: 1,
 *   content: 'This button should be larger',
 *   status_id: ANNOTATION_STATUS.NEW,
 *   created_by: 'user-123'
 * });
 * ```
 */
export async function createAnnotation(
  input: CreateAnnotationInput
): Promise<Annotation> {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from('annotation')
    .insert(input)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create annotation: ${error.message}`);
  }

  if (!data) {
    throw new Error('Failed to create annotation: No data returned');
  }

  return data as Annotation;
}

/**
 * Update an existing annotation
 *
 * Only the content and status_id fields can be updated by users.
 * The updated_by field is automatically set to the current user's ID.
 * Other fields are managed automatically by the database.
 *
 * @param id - The annotation ID to update
 * @param input - Partial annotation data with fields to update
 * @returns Promise resolving to the updated annotation
 * @throws {Error} If DevCaddy is not initialized
 * @throws {Error} If the annotation is not found
 * @throws {Error} If the database operation fails
 * @throws {Error} If unable to get current user
 *
 * @example
 * ```typescript
 * import { ANNOTATION_STATUS } from 'dev-caddy/types/annotations';
 *
 * const updated = await updateAnnotation(123, {
 *   content: 'Updated feedback text',
 *   status_id: ANNOTATION_STATUS.IN_PROGRESS
 * });
 * ```
 */
export async function updateAnnotation(
  id: number,
  input: UpdateAnnotationInput
): Promise<Annotation> {
  const client = getSupabaseClient();

  // Get current user to set updated_by
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    throw new Error('Unable to update annotation: No authenticated user found');
  }

  // Include updated_by in the update
  const updateData = {
    ...input,
    updated_by: user.id,
  };

  const { data, error } = await client
    .from('annotation')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error(`Annotation with id ${id} not found`);
    }
    throw new Error(`Failed to update annotation: ${error.message}`);
  }

  if (!data) {
    throw new Error(`Annotation with id ${id} not found`);
  }

  return data as Annotation;
}

/**
 * Delete an annotation by ID
 *
 * @param id - The annotation ID to delete
 * @returns Promise resolving when deletion is complete
 * @throws {Error} If DevCaddy is not initialized
 * @throws {Error} If the annotation is not found
 * @throws {Error} If the database operation fails
 *
 * @example
 * await deleteAnnotation(123);
 */
export async function deleteAnnotation(id: number): Promise<void> {
  const client = getSupabaseClient();

  const { error } = await client.from('annotation').delete().eq('id', id);

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error(`Annotation with id ${id} not found`);
    }
    throw new Error(`Failed to delete annotation: ${error.message}`);
  }
}

/**
 * Get all annotations across the entire project
 *
 * Fetches all annotations regardless of which page they belong to.
 * Useful for project-wide annotation views and cross-page navigation.
 *
 * @returns Promise resolving to array of all annotations
 * @throws {Error} If DevCaddy is not initialized
 * @throws {Error} If the database operation fails
 *
 * @example
 * const allAnnotations = await getAllAnnotations();
 */
export async function getAllAnnotations(): Promise<Annotation[]> {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from('annotation')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch annotations: ${error.message}`);
  }

  return (data as Annotation[]) || [];
}

/**
 * Get all annotations for a specific page
 *
 * @param pageUrl - The normalized page URL to fetch annotations for
 * @returns Promise resolving to array of annotations
 * @throws {Error} If DevCaddy is not initialized
 * @throws {Error} If the database operation fails
 *
 * @example
 * const annotations = await getAnnotationsByPage('/products');
 */
export async function getAnnotationsByPage(
  pageUrl: string
): Promise<Annotation[]> {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from('annotation')
    .select('*')
    .eq('page', pageUrl)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch annotations: ${error.message}`);
  }

  return (data as Annotation[]) || [];
}

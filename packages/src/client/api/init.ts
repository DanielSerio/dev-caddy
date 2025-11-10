import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Configuration options for initializing DevCaddy
 */
export interface DevCaddyConfig {
  /** Supabase project URL */
  supabaseUrl: string;
  /** Supabase anonymous key */
  supabaseAnonKey: string;
}

/**
 * Singleton Supabase client instance
 */
let supabaseClient: SupabaseClient | null = null;

/**
 * Initialize DevCaddy with Supabase configuration
 *
 * This function must be called before using any DevCaddy features.
 * It creates a singleton Supabase client that will be used for all
 * database operations and realtime subscriptions.
 *
 * @param config - Configuration with Supabase URL and anonymous key
 * @throws {Error} If supabaseUrl or supabaseAnonKey is missing
 * @throws {Error} If DevCaddy is already initialized
 *
 * @example
 * initDevCaddy({
 *   supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
 *   supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY
 * });
 */
export function initDevCaddy(config: DevCaddyConfig): void {
  if (supabaseClient) {
    throw new Error(
      'DevCaddy is already initialized. Call initDevCaddy() only once.'
    );
  }

  if (!config.supabaseUrl) {
    throw new Error(
      'DevCaddy: supabaseUrl is required. Please provide your Supabase project URL.'
    );
  }

  if (!config.supabaseAnonKey) {
    throw new Error(
      'DevCaddy: supabaseAnonKey is required. Please provide your Supabase anonymous key.'
    );
  }

  // Validate URL format
  try {
    new URL(config.supabaseUrl);
  } catch {
    throw new Error(
      `DevCaddy: Invalid supabaseUrl format: "${config.supabaseUrl}". Must be a valid URL.`
    );
  }

  supabaseClient = createClient(config.supabaseUrl, config.supabaseAnonKey);
}

/**
 * Get the initialized Supabase client instance
 *
 * @returns {SupabaseClient} The Supabase client instance
 * @throws {Error} If DevCaddy has not been initialized
 *
 * @example
 * const client = getSupabaseClient();
 * const { data } = await client.from('annotations').select('*');
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    throw new Error(
      'DevCaddy has not been initialized. Call initDevCaddy() first with your Supabase configuration.'
    );
  }

  return supabaseClient;
}

/**
 * Reset the Supabase client (primarily for testing)
 * @internal
 */
export function resetDevCaddy(): void {
  supabaseClient = null;
}

import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Configuration options for initializing DevCaddy
 */
export interface DevCaddyConfig {
  /** Supabase project URL (e.g., https://xxx.supabase.co) */
  supabaseUrl: string;
  /** Supabase anonymous key (safe to expose client-side with RLS enabled) */
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
 * **Important:** You must pass configuration explicitly. Environment variables
 * should be read in your application code, not in the library.
 *
 * @param config - Supabase configuration (required)
 * @throws {Error} If supabaseUrl or supabaseAnonKey is missing or invalid
 * @throws {Error} If DevCaddy is already initialized
 *
 * @example
 * // Read from your app's environment variables
 * initDevCaddy({
 *   supabaseUrl: import.meta.env.VITE_DEVCADDY_SUPABASE_URL,
 *   supabaseAnonKey: import.meta.env.VITE_DEVCADDY_SUPABASE_ANON_KEY,
 * });
 */
export function initDevCaddy(config: DevCaddyConfig): void {
  if (supabaseClient) {
    throw new Error(
      'DevCaddy is already initialized. Call initDevCaddy() only once.'
    );
  }

  const { supabaseUrl, supabaseAnonKey } = config;

  // Validate required fields
  if (!supabaseUrl) {
    throw new Error(
      'DevCaddy: supabaseUrl is required.\n\n' +
        'Pass it in config: initDevCaddy({ \n' +
        '  supabaseUrl: import.meta.env.VITE_DEVCADDY_SUPABASE_URL,\n' +
        '  supabaseAnonKey: import.meta.env.VITE_DEVCADDY_SUPABASE_ANON_KEY \n' +
        '})\n\n' +
        'Get your Supabase URL from: https://supabase.com/dashboard/project/_/settings/api'
    );
  }

  if (!supabaseAnonKey) {
    throw new Error(
      'DevCaddy: supabaseAnonKey is required.\n\n' +
        'Pass it in config: initDevCaddy({ \n' +
        '  supabaseUrl: import.meta.env.VITE_DEVCADDY_SUPABASE_URL,\n' +
        '  supabaseAnonKey: import.meta.env.VITE_DEVCADDY_SUPABASE_ANON_KEY \n' +
        '})\n\n' +
        'Get your anonymous key from: https://supabase.com/dashboard/project/_/settings/api'
    );
  }

  // Validate URL format
  try {
    new URL(supabaseUrl);
  } catch {
    throw new Error(
      `DevCaddy: Invalid supabaseUrl format: "${supabaseUrl}".\n` +
        'Must be a valid URL (e.g., https://xxx.supabase.co)'
    );
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
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

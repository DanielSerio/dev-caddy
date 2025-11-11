import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../../client/api/init';
import type { Session, User } from '@supabase/supabase-js';

/**
 * Authentication state interface
 */
export interface AuthState {
  /** Current user session */
  session: Session | null;
  /** Current authenticated user */
  user: User | null;
  /** Loading state during initial session check */
  loading: boolean;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
}

/**
 * Hook for managing authentication state
 *
 * Manages Supabase authentication session and provides current user information.
 * Automatically subscribes to auth state changes and handles session persistence.
 *
 * @returns Authentication state and user information
 *
 * @example
 * ```typescript
 * const { user, isAuthenticated, loading } = useAuth();
 *
 * if (loading) {
 *   return <div>Checking authentication...</div>;
 * }
 *
 * if (!isAuthenticated) {
 *   return <AuthPrompt />;
 * }
 *
 * return <div>Welcome {user.email}!</div>;
 * ```
 */
export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const initializeAuth = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data: { session: currentSession } } = await supabase.auth.getSession();

        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error('[DevCaddy] Failed to get session:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Subscribe to auth state changes
    const supabase = getSupabaseClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (mounted) {
          setSession(newSession);
          setUser(newSession?.user ?? null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    session,
    user,
    loading,
    isAuthenticated: !!session && !!user,
  };
}

/**
 * Send magic link to user's email
 *
 * Sends a passwordless authentication link to the provided email address.
 * User must click the link in their email to complete authentication.
 *
 * @param email - User's email address
 * @param redirectTo - URL to redirect to after authentication (defaults to current URL)
 * @returns Promise that resolves when email is sent
 * @throws {Error} If email sending fails
 *
 * @example
 * ```typescript
 * try {
 *   await sendMagicLink('user@example.com');
 *   alert('Check your email for the magic link!');
 * } catch (error) {
 *   alert('Failed to send magic link. Please try again.');
 * }
 * ```
 */
export async function sendMagicLink(
  email: string,
  redirectTo?: string
): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo || window.location.href,
    },
  });

  if (error) {
    throw new Error(`Failed to send magic link: ${error.message}`);
  }
}

/**
 * Sign out the current user
 *
 * Clears the current session and signs the user out.
 *
 * @returns Promise that resolves when sign out is complete
 * @throws {Error} If sign out fails
 *
 * @example
 * ```typescript
 * await signOut();
 * // User is now signed out, auth state will update automatically
 * ```
 */
export async function signOut(): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(`Failed to sign out: ${error.message}`);
  }
}

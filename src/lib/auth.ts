import { createClient } from '@/lib/supabase/server';
import { User } from './db-types';

/**
 * Get the currently authenticated user's profile.
 * Returns null ONLY if there is no Supabase auth session at all.
 * If session exists but profile is missing, returns a minimal user to avoid redirect loops.
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = await createClient();

    // 1. Check if there is a valid session
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser) return null; // genuinely not logged in

    // 2. Try to fetch profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (profileError || !profile) {
      // Session exists but profile missing (e.g. trigger didn't fire, or RLS issue).
      // Return a minimal user so we don't redirect back to /login and cause an infinite loop.
      console.warn('Profile not found for authenticated user:', authUser.id, profileError?.message);
      return {
        id: authUser.id,
        email: authUser.email ?? '',
        name: authUser.user_metadata?.name ?? authUser.email ?? 'User',
        role: 'owner',
        clinic_id: '',
        branchId: null,
      };
    }

    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role,
      clinic_id: profile.clinic_id,
      branchId: profile.branch_id ?? null,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Sign in with email and password.
 */
export async function login(
  email: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      return { success: false, error: error?.message || 'Authentication failed' };
    }

    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Login succeeded but profile could not be loaded.' };
    }

    return { success: true, user };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Sign out.
 */
export async function logout(): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Logout error:', error);
  }
}

/**
 * Sign up a new clinic owner.
 * The DB trigger auto-creates the clinic + profile row.
 */
export async function signUp(
  email: string,
  password: string,
  name: string,
  clinicName?: string,
  staffInvite?: { clinicId: string; role: string; branchId: string | null }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    
    const metaData: Record<string, any> = { name };
    if (staffInvite) {
      metaData.clinic_id = staffInvite.clinicId;
      metaData.role = staffInvite.role;
      metaData.branch_id = staffInvite.branchId || null;
    } else if (clinicName) {
      metaData.clinic_name = clinicName;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metaData },
    });

    if (error || !data.user) {
      return { success: false, error: error?.message || 'Sign up failed' };
    }

    return { success: true };
  } catch (error) {
    console.error('Sign up error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

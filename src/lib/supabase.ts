import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

// Environment variables or fallback demo credentials
// In Vite, client-side env variables must start with VITE_
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-supabase') && 
  !supabaseAnonKey.includes('your-anon-key')
);

// Create Supabase client singleton
export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder-project.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined
    }
  }
);

export interface UserProfileRecord {
  id: string; // matches auth.users.id
  full_name: string;
  phone: string;
  email: string;
  country_code?: string;
  country?: string;
  currency?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Send 6-digit numeric OTP to the user's email address via Supabase Auth
 * Configured so new users are auto-created without requiring pre-signup.
 */
export async function sendEmailOtp(email: string): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  if (!isSupabaseConfigured) {
    // Provide a helpful error with instructions if credentials haven't been configured yet
    return { 
      success: false, 
      error: 'Supabase credentials (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY) are not yet set in .env. Please configure them in your environment settings.' 
    };
  }

  try {
    const { error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        shouldCreateUser: true,
      }
    });

    if (error) {
      if (error.status === 429 || error.message.toLowerCase().includes('rate limit')) {
        return { success: false, error: 'Too many requests. Please wait a minute before requesting another OTP.' };
      }
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to send verification code. Please check your network connection.' };
  }
}

/**
 * Verify 6-digit email OTP with Supabase Auth
 */
export async function verifyEmailOtp(
  email: string, 
  token: string
): Promise<{ success: boolean; user?: User | null; session?: Session | null; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanToken = token.trim();

  if (!cleanToken || cleanToken.length < 6) {
    return { success: false, error: 'Please enter all 6 digits of your verification code.' };
  }

  if (!isSupabaseConfigured) {
    return { 
      success: false, 
      error: 'Supabase credentials are not configured. Please supply VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.' 
    };
  }

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: cleanToken,
      type: 'email'
    });

    if (error) {
      // Map to friendly message
      let msg = error.message;
      if (msg.toLowerCase().includes('expired')) {
        msg = 'Your verification code has expired. Please tap "Resend OTP" to get a new code.';
      } else if (msg.toLowerCase().includes('invalid')) {
        msg = 'Invalid verification code. Please double-check the 6-digit code in your email.';
      }
      return { success: false, error: msg };
    }

    return { 
      success: true, 
      user: data.user, 
      session: data.session 
    };
  } catch (err: any) {
    return { 
      success: false, 
      error: err?.message || 'Network error verifying code. Please try again.' 
    };
  }
}

/**
 * Upsert customer profile in Supabase profiles table linked to auth.users id
 */
export async function upsertUserProfile(profile: {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  country_code?: string;
  country?: string;
  currency?: string;
}): Promise<{ data?: UserProfileRecord | null; error?: string }> {
  if (!isSupabaseConfigured) {
    return { error: 'Supabase is not configured' };
  }

  try {
    const payload = {
      id: profile.id,
      full_name: profile.full_name.trim(),
      phone: profile.phone.trim(),
      email: profile.email.trim().toLowerCase(),
      country_code: profile.country_code || '',
      country: profile.country || '',
      currency: profile.currency || 'USD',
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.warn('Profile upsert notice:', error.message);
      return { error: error.message };
    }

    return { data };
  } catch (err: any) {
    return { error: err?.message || 'Failed to save profile' };
  }
}

/**
 * Fetch profile from Supabase profiles table
 */
export async function getUserProfile(userId: string): Promise<UserProfileRecord | null> {
  if (!isSupabaseConfigured || !userId) return null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) return null;
    return data as UserProfileRecord;
  } catch {
    return null;
  }
}

/**
 * Sign out user from Supabase session
 */
export async function signOutUser(): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) {
    return {};
  }
  try {
    const { error } = await supabase.auth.signOut();
    if (error) return { error: error.message };
    return {};
  } catch (err: any) {
    return { error: err?.message };
  }
}

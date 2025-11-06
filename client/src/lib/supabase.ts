import { createClient } from '@supabase/supabase-js';

// Supabase client configuration
// These should be set as environment variables in Cloudflare Pages
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not set. Some features may not work.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Analytics don't need persistent sessions
    autoRefreshToken: false,
  },
});


// lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Default client configuration to prevent fetch errors
const defaultClientOptions = {
  auth: {
    persistSession: typeof window !== 'undefined',
    autoRefreshToken: typeof window !== 'undefined',
    detectSessionInUrl: typeof window !== 'undefined',
  },
};

// Create a dummy client if env vars are missing (for development)
// This prevents build errors when env vars are not set yet
let supabase;

if (!supabaseUrl || !supabaseAnonKey) {
  if (process.env.NODE_ENV === 'development') {
    console.warn('⚠️  Supabase environment variables are not set.');
    console.warn('   Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local');
  }
  // Create a dummy client to prevent errors, but mark it as invalid
  supabase = createClient('https://placeholder.supabase.co', 'placeholder-key', defaultClientOptions);
  supabase._isValid = false;
} else {
  // Validate URL format
  const isValidUrl = supabaseUrl.startsWith('http') && supabaseUrl.includes('.supabase.co');
  if (!isValidUrl && process.env.NODE_ENV === 'development') {
    console.warn('⚠️  Invalid Supabase URL format. Expected format: https://your-project.supabase.co');
  }
  supabase = createClient(supabaseUrl, supabaseAnonKey, defaultClientOptions);
  supabase._isValid = isValidUrl;
}

export { supabase }

// Server-side Supabase client (for API routes)
export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  if (!url || !key) {
    throw new Error('Supabase credentials not configured for server client');
  }
  
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}


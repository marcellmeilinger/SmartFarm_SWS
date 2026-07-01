import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Detect if we have valid-looking Supabase credentials
export const isSupabaseConfigured =
  supabaseUrl.trim() !== '' &&
  supabaseAnonKey.trim() !== '' &&
  !supabaseUrl.includes('your-supabase-project-id');

// Custom storage wrapper to respect the 'Remember me' option
const dynamicStorage = {
  getItem: (key: string): string | null => {
    const rememberMe = localStorage.getItem('smartfarm_remember_me') !== 'false';
    if (rememberMe) {
      return localStorage.getItem(key);
    } else {
      return sessionStorage.getItem(key) || localStorage.getItem(key);
    }
  },
  setItem: (key: string, value: string): void => {
    const rememberMe = localStorage.getItem('smartfarm_remember_me') !== 'false';
    if (rememberMe) {
      localStorage.setItem(key, value);
      sessionStorage.removeItem(key);
    } else {
      sessionStorage.setItem(key, value);
      localStorage.removeItem(key);
    }
  },
  removeItem: (key: string): void => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }
};

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: dynamicStorage,
        persistSession: true
      }
    })
  : null;

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase has not been configured. The SmartFarm app will run in offline LocalStorage mode.'
  );
}

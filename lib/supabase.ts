import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables with detailed error messages
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration error:', {
    url: supabaseUrl ? 'OK' : 'MISSING',
    key: supabaseAnonKey ? 'OK' : 'MISSING',
    env: import.meta.env
  });

  throw new Error(
    'Variáveis de ambiente do Supabase não configuradas.\n\n' +
    'Verifique se VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão definidas no arquivo .env.local\n\n' +
    `Status:\n` +
    `- VITE_SUPABASE_URL: ${supabaseUrl ? '✓ OK' : '✗ FALTANDO'}\n` +
    `- VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✓ OK' : '✗ FALTANDO'}`
  );
}

// Log successful configuration (only in development)
if (import.meta.env.DEV) {
  console.log('✓ Supabase client configured successfully', {
    url: supabaseUrl,
    keyLength: supabaseAnonKey.length
  });
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
});

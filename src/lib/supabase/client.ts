import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

// Explicit 4-argument generic alignment between @supabase/ssr 0.5 and @supabase/supabase-js 2.119
export type TypedBrowserClient = SupabaseClient<
  Database,
  'public',
  'public',
  Database['public']
>;

export function createClient(): TypedBrowserClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables are missing.');
  }

  const rawClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  return rawClient as unknown as TypedBrowserClient;
}

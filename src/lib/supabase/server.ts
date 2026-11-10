import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database.types';

interface CookieToSet {
  name: string;
  value: string;
  options?: CookieOptions;
}

export type TypedServerClient = SupabaseClient<
  Database,
  'public',
  'public',
  Database['public']
>;

export interface AuthenticatedUser {
  id: string;
  email?: string | null;
}

export async function createClient(): Promise<TypedServerClient> {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables are missing.');
  }

  const rawClient = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Handled via middleware
        }
      },
    },
  });

  return rawClient as unknown as TypedServerClient;
}

export async function getAuthenticatedCounselor(): Promise<{
  supabase: TypedServerClient | null;
  user: AuthenticatedUser | null;
}> {
  const cookieStore = await cookies();
  const demoCookie = cookieStore.get('lighthouse_demo_session');

  let supabase: TypedServerClient | null = null;
  try {
    supabase = await createClient();
  } catch {
    // Suppress config error in demo mode
  }

  // 1. Check Dev Mock Demo Session
  if (demoCookie?.value) {
    try {
      const parsed = JSON.parse(demoCookie.value);
      if (parsed?.email) {
        return {
          supabase,
          user: {
            id: parsed.id ?? '00000000-0000-0000-0000-000000000001',
            email: parsed.email,
          },
        };
      }
    } catch {
      // Ignore parse error
    }
  }

  // 2. Validate with Supabase Auth
  if (supabase) {
    try {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        return {
          supabase,
          user: { id: data.user.id, email: data.user.email },
        };
      }
    } catch {
      return { supabase: null, user: null };
    }
  }

  return { supabase: null, user: null };
}

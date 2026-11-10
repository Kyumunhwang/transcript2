import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/types/database.types';

interface CookieToSet {
  name: string;
  value: string;
  options?: CookieOptions;
}

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Check for Dev Mock Demo Session cookie first
  const demoCookie = request.cookies.get('lighthouse_demo_session');
  let user = null;

  if (demoCookie?.value) {
    try {
      const parsed = JSON.parse(demoCookie.value);
      if (parsed?.email) {
        user = {
          id: parsed.id ?? '00000000-0000-0000-0000-000000000001',
          email: parsed.email,
        };
      }
    } catch {
      // Ignore JSON parse error
    }
  }

  // If no dev session, validate with Supabase Auth
  if (!user) {
    try {
      const { data } = await supabase.auth.getUser();
      user = data.user;
    } catch {
      // Fallback on connection error
    }
  }

  const pathname = request.nextUrl.pathname;
  const isLoginPage = pathname === '/login' || pathname.startsWith('/login/');

  // 1. Unauthenticated users trying to access protected paths -> redirect to /login
  if (!user && !isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // 2. Authenticated users trying to access /login -> redirect to main portal /
  if (user && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

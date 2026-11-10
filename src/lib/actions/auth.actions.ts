'use server';

import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { loginSchema } from '@/lib/validations/auth.schema';
import type { ActionResult } from '@/types/domain.types';

const DEMO_COUNSELOR = {
  email: 'counselor@lighthouse.edu',
  password: 'counselor123!',
  id: '00000000-0000-0000-0000-000000000001',
};

export async function loginAction(
  input: unknown
): Promise<ActionResult<{ userEmail: string }>> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Please verify the entered credentials.',
        details: parsed.error.flatten().fieldErrors,
      },
    };
  }

  const { email, password } = parsed.data;

  // Development Mock Auth Bypass
  if (
    email.toLowerCase() === DEMO_COUNSELOR.email &&
    password === DEMO_COUNSELOR.password
  ) {
    const cookieStore = await cookies();
    cookieStore.set('lighthouse_demo_session', JSON.stringify({
      id: DEMO_COUNSELOR.id,
      email: DEMO_COUNSELOR.email,
    }), {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return {
      success: true,
      data: { userEmail: DEMO_COUNSELOR.email },
      message: 'Demo Counselor authenticated successfully.',
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return {
      success: false,
      error: {
        code: 'AUTH_FAILED',
        message: error?.message || 'Authentication failed. Please check your credentials.',
      },
    };
  }

  return {
    success: true,
    data: { userEmail: data.user.email ?? email },
    message: 'Login successful.',
  };
}

export async function logoutAction(): Promise<ActionResult> {
  const cookieStore = await cookies();
  cookieStore.delete('lighthouse_demo_session');

  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Ignore Supabase connection error in demo mode
  }

  return {
    success: true,
    message: 'Signed out successfully.',
  };
}

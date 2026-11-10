'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { loginSchema, type LoginInput } from '@/lib/validations/auth.schema';
import { loginAction } from '@/lib/actions/auth.actions';

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<LoginInput>({
    defaultValues: {
      email: 'counselor@lighthouse.edu',
      password: 'counselor123!',
    },
  });

  const onSubmit = async (values: LoginInput) => {
    setServerError(null);

    // Client-side Zod validation
    const validation = loginSchema.safeParse(values);
    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      if (fieldErrors.email?.[0]) {
        setError('email', { type: 'manual', message: fieldErrors.email[0] });
      }
      if (fieldErrors.password?.[0]) {
        setError('password', { type: 'manual', message: fieldErrors.password[0] });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await loginAction(validation.data);
      if (!result.success) {
        setServerError(result.error.message);
        setIsSubmitting(false);
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      setServerError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-4 py-12">
      <div className="w-full max-w-sm rounded-md border border-[#E9E9E7] bg-surface p-8 shadow-xs">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-content-primary">
            Counselor Portal
          </h1>
          <p className="mt-1 text-sm text-content-secondary">
            Lighthouse College Counseling Workspace
          </p>
        </div>

        {serverError && (
          <div className="mb-4 rounded-sm border border-semantic-danger/30 bg-semantic-danger-subtle p-3 text-xs text-semantic-danger">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium text-content-secondary"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              disabled={isSubmitting}
              placeholder="counselor@lighthouse.edu"
              {...register('email')}
              className="mt-1 block w-full rounded-md border border-[#E9E9E7] bg-surface px-3 py-2 text-sm text-content-primary placeholder:text-content-muted focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary disabled:opacity-50"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-semantic-danger">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium text-content-secondary"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              disabled={isSubmitting}
              placeholder="••••••••"
              {...register('password')}
              className="mt-1 block w-full rounded-md border border-[#E9E9E7] bg-surface px-3 py-2 text-sm text-content-primary placeholder:text-content-muted focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary disabled:opacity-50"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-semantic-danger">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center rounded-md bg-brand-primary py-2 px-4 text-sm font-medium text-white transition-colors hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-1 disabled:pointer-events-none disabled:opacity-60"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Signing in...
              </span>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <div className="mt-6 border-t border-[#F1F1F0] pt-4 text-center space-y-2">
          <div className="p-2.5 rounded bg-[#FAF9F8] border border-[#EBEBEA] text-left">
            <span className="block text-[11px] font-semibold text-[#2383E2] uppercase tracking-wider mb-1">
              🔑 Dev Demo Counselor
            </span>
            <div className="text-xs text-[#5F5E5B] space-y-0.5">
              <p>Email: <strong className="text-[#37352F]">counselor@lighthouse.edu</strong></p>
              <p>Password: <strong className="text-[#37352F]">counselor123!</strong></p>
            </div>
          </div>
          <p className="text-[11px] text-content-muted">
            Authorized Lighthouse faculty access only.
          </p>
        </div>
      </div>
    </main>
  );
}

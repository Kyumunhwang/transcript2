import type { ReactNode } from 'react';
import { StudentSidebar } from '@/components/shared/student-sidebar';
import { PortalHeader } from '@/components/shared/portal-header';
import { getStudentsAction } from '@/lib/actions/student.actions';
import { getAuthenticatedCounselor } from '@/lib/supabase/server';
import { logoutAction } from '@/lib/actions/auth.actions';
import { redirect } from 'next/navigation';

interface PortalLayoutProps {
  children: ReactNode;
}

export default async function PortalLayout({ children }: PortalLayoutProps) {
  const { user } = await getAuthenticatedCounselor();

  const studentsRes = await getStudentsAction();
  const initialStudents = studentsRes.success && studentsRes.data ? studentsRes.data : [];

  async function handleSignOut() {
    'use server';
    await logoutAction();
    redirect('/login');
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-canvas">
      {/* Responsive Sidebar (Fixed on mobile drawer, static 260px on desktop) */}
      <StudentSidebar initialStudents={initialStudents} />

      {/* Main Workspace Area */}
      <div className="flex flex-1 flex-col overflow-hidden w-full min-w-0">
        {/* Global Navigation Bar */}
        <PortalHeader userEmail={user?.email} onSignOut={handleSignOut} />

        {/* Dynamic Viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 w-full max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

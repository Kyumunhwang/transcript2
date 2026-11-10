import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { formatGpa } from '@/lib/utils';
import { StudentNavigationTabs } from '@/components/shared/student-navigation-tabs';

interface StudentLayoutProps {
  children: ReactNode;
  params: Promise<{
    studentId: string;
  }>;
}

export default async function StudentDetailLayout({
  children,
  params,
}: StudentLayoutProps) {
  const { studentId } = await params;
  const supabase = await createClient();

  const { data: student, error } = await supabase
    .from('students')
    .select('*')
    .eq('id', studentId)
    .single();

  if (error || !student) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Student Fixed Profile Header */}
      <div className="rounded-md border border-[#E9E9E7] bg-surface p-6 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight text-content-primary">
                {student.name_ko}
              </h1>
              {student.name_en && (
                <span className="text-sm font-medium text-content-secondary">
                  ({student.name_en})
                </span>
              )}
              <span className="rounded-sm bg-brand-subtle px-2 py-0.5 text-xs font-semibold text-brand-primary">
                Grade {student.grade_level}
              </span>
            </div>
            <p className="mt-1 text-xs text-content-muted">
              Student Code: {student.student_code} • Expected Graduation: {student.expected_graduation_year ?? 'TBD'}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="block text-[11px] text-content-muted">Unweighted GPA</span>
              <span className="text-xl font-bold text-content-primary">
                {formatGpa(student.cumulative_gpa_unweighted)}
              </span>
            </div>
            <div className="h-8 w-px bg-[#E9E9E7]" />
            <div className="text-right">
              <span className="block text-[11px] text-content-muted">Weighted GPA</span>
              <span className="text-2xl font-bold text-brand-primary">
                {formatGpa(student.cumulative_gpa_weighted)}
              </span>
            </div>
          </div>
        </div>

        {/* 4 Core Navigation Tabs */}
        <div className="mt-6 border-t border-[#F1F1F0] pt-2">
          <StudentNavigationTabs studentId={studentId} />
        </div>
      </div>

      {/* Tab Child Content Viewport */}
      <div>{children}</div>
    </div>
  );
}

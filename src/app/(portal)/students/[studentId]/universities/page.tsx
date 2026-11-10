import React from 'react';
import { notFound } from 'next/navigation';
import { getTargetUniversitiesAction } from '@/lib/actions/university.actions';
import { getStudentByIdAction } from '@/lib/actions/student.actions';
import { UniversityComparisonBoard } from '@/components/universities/university-comparison-board';

interface UniversitiesPageProps {
  params: Promise<{
    studentId: string;
  }>;
}

export default async function UniversitiesPage({ params }: UniversitiesPageProps) {
  const { studentId } = await params;

  const [studentRes, unisRes] = await Promise.all([
    getStudentByIdAction(studentId),
    getTargetUniversitiesAction(studentId),
  ]);

  if (!studentRes.success || !studentRes.data) {
    notFound();
  }

  const universities = unisRes.success && unisRes.data ? unisRes.data : [];

  return (
    <div className="space-y-4">
      <div className="pb-3 border-b border-[#F1F1F0]">
        <h2 className="text-base font-bold text-[#37352F]">
          Target Universities & Strategic Comparison
        </h2>
        <p className="text-xs text-[#787774] mt-0.5">
          Side-by-side analysis of teacher suggestions vs student preferences with detailed pros, cons, and strategic notes
        </p>
      </div>

      <UniversityComparisonBoard
        universities={universities}
        studentId={studentId}
      />
    </div>
  );
}

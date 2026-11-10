import React from 'react';
import { notFound } from 'next/navigation';
import { getCounselingLogsAction } from '@/lib/actions/counseling.actions';
import { getStudentByIdAction } from '@/lib/actions/student.actions';
import { CounselingTimeline } from '@/components/counseling/counseling-timeline';

interface CounselingPageProps {
  params: Promise<{
    studentId: string;
  }>;
}

export default async function CounselingPage({ params }: CounselingPageProps) {
  const { studentId } = await params;

  const [studentRes, logsRes] = await Promise.all([
    getStudentByIdAction(studentId),
    getCounselingLogsAction(studentId),
  ]);

  if (!studentRes.success || !studentRes.data) {
    notFound();
  }

  const logs = logsRes.success && logsRes.data ? logsRes.data : [];

  return (
    <div className="space-y-4">
      <div className="pb-3 border-b border-[#F1F1F0]">
        <h2 className="text-base font-bold text-[#37352F]">
          1:1 College Admissions Counseling Sessions
        </h2>
        <p className="text-xs text-[#787774] mt-0.5">
          Chronological record of student advising meetings, action items, and strategic decisions
        </p>
      </div>

      <CounselingTimeline logs={logs} studentId={studentId} />
    </div>
  );
}

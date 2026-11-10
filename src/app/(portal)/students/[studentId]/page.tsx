import React from 'react';
import { notFound } from 'next/navigation';
import { BookOpen, GraduationCap, Award, Users, CheckCircle2 } from 'lucide-react';
import { getStudentDashboardAction } from '@/lib/actions/student.actions';
import { GpaTrendChart } from '@/components/dashboard/gpa-trend-chart';
import { TestSummaryGrid } from '@/components/dashboard/test-summary-grid';
import { ClubAwardList } from '@/components/dashboard/club-award-list';
import { formatGpa } from '@/lib/utils';

interface StudentDashboardPageProps {
  params: Promise<{
    studentId: string;
  }>;
}

export default async function StudentDashboardPage({
  params,
}: StudentDashboardPageProps) {
  const { studentId } = await params;
  const result = await getStudentDashboardAction(studentId);

  if (!result.success || !result.data) {
    notFound();
  }

  const { student, terms, testScores, clubs, awards } = result.data;

  // Aggregate credits
  let totalCredits = 0;
  for (const t of terms) {
    for (const c of t.courses) {
      totalCredits += Number(c.credits || 0);
    }
  }

  const latestTerm = terms[terms.length - 1];

  return (
    <div className="space-y-6">
      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-[#E5E5E3] rounded-md p-4 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs text-[#787774] font-medium mb-1">
            <GraduationCap className="w-3.5 h-3.5 text-[#2383E2]" />
            Cumulative Weighted
          </div>
          <div className="text-xl font-bold text-[#37352F]">
            {formatGpa(student.cumulative_gpa_weighted)}
          </div>
          <span className="text-[11px] text-[#787774]">Grade Scale: 5.0 AP Max</span>
        </div>

        <div className="bg-white border border-[#E5E5E3] rounded-md p-4 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs text-[#787774] font-medium mb-1">
            <BookOpen className="w-3.5 h-3.5 text-[#787774]" />
            Total Earned Credits
          </div>
          <div className="text-xl font-bold text-[#37352F]">
            {totalCredits.toFixed(1)}
          </div>
          <span className="text-[11px] text-[#787774]">Across {terms.length} terms</span>
        </div>

        <div className="bg-white border border-[#E5E5E3] rounded-md p-4 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs text-[#787774] font-medium mb-1">
            <Award className="w-3.5 h-3.5 text-[#2383E2]" />
            Test Scores Logged
          </div>
          <div className="text-xl font-bold text-[#37352F]">
            {testScores.length}
          </div>
          <span className="text-[11px] text-[#787774]">TOEFL / SAT / AP</span>
        </div>

        <div className="bg-white border border-[#E5E5E3] rounded-md p-4 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs text-[#787774] font-medium mb-1">
            <Users className="w-3.5 h-3.5 text-[#787774]" />
            Clubs & Honors
          </div>
          <div className="text-xl font-bold text-[#37352F]">
            {clubs.length + awards.length}
          </div>
          <span className="text-[11px] text-[#787774]">
            {clubs.length} clubs, {awards.length} awards
          </span>
        </div>
      </div>

      {/* Main Grid: GPA Chart */}
      <GpaTrendChart
        terms={terms}
        studentId={studentId}
        cumulativeGpa={student.cumulative_gpa_weighted}
      />

      {/* Academic Courses Table Preview */}
      {terms.length > 0 && (
        <div className="bg-white border border-[#E5E5E3] rounded-md p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F1F1F0]">
            <div>
              <h3 className="text-sm font-semibold text-[#37352F] flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#2383E2]" />
                Recent Academic Terms & Course Highlights
              </h3>
              <p className="text-xs text-[#787774] mt-0.5">
                Course performance from official transcript
              </p>
            </div>
            <span className="text-xs text-[#787774]">
              Grade {student.grade_level} • Cohort {student.expected_graduation_year ?? 'N/A'}
            </span>
          </div>

          <div className="space-y-4">
            {terms.slice(-2).reverse().map((t) => (
              <div key={t.id} className="border border-[#E5E5E3] rounded-md p-3 bg-[#FBFAF9]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#37352F]">
                    {t.academic_year} {t.semester}
                  </span>
                  <div className="flex items-center gap-3 text-xs text-[#787774]">
                    <span>Term W-GPA: <strong className="text-[#37352F]">{formatGpa(t.term_gpa_weighted)}</strong></span>
                    <span>UW-GPA: <strong className="text-[#37352F]">{formatGpa(t.term_gpa_unweighted)}</strong></span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {t.courses.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded bg-white border border-[#EBEBEA] text-xs"
                    >
                      <span className="truncate pr-2 text-[#37352F]" title={c.course_name}>
                        {c.course_name}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {c.is_credit_makeup && (
                          <span className="px-1 py-0.2 text-[9px] font-bold rounded bg-[#FCE8E6] text-[#EB5757] border border-[#EB5757]/30">
                            Makeup
                          </span>
                        )}
                        <span className="font-semibold text-[#37352F]">
                          {c.letter_grade ?? '-'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Standardized Tests Section */}
      <TestSummaryGrid testScores={testScores} studentId={studentId} />

      {/* Extracurriculars & Honors Section */}
      <ClubAwardList clubs={clubs} awards={awards} studentId={studentId} />
    </div>
  );
}

'use client';

import { useState } from 'react';
import type { AcademicTermRow, CourseGradeRow } from '@/types/domain.types';
import { CreditMakeupModal } from '@/components/transcript/credit-makeup-modal';
import { Edit3, CheckCircle2 } from 'lucide-react';
import { formatGpa } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface TermWithCourses extends AcademicTermRow {
  courses: CourseGradeRow[];
}

interface TranscriptRecordsViewProps {
  terms: TermWithCourses[];
}

export function TranscriptRecordsView({ terms }: TranscriptRecordsViewProps) {
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState<CourseGradeRow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenMakeup = (course: CourseGradeRow) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4 rounded-md border border-[#E9E9E7] bg-surface p-6 shadow-xs">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-content-primary">
            Academic Course Records & Credit Make-up
          </h3>
          <p className="text-xs text-content-secondary">
            Manage semester course grades and apply Credit Make-up overrides.
          </p>
        </div>
      </div>

      {terms.length === 0 ? (
        <p className="py-6 text-center text-xs text-content-muted">
          No academic term records uploaded yet. Please upload a Gradelink transcript.
        </p>
      ) : (
        <div className="space-y-4">
          {terms.map((term) => (
            <div key={term.id} className="rounded-md border border-[#F1F1F0] bg-canvas p-4">
              <div className="mb-2.5 flex items-center justify-between border-b border-[#E9E9E7] pb-2 text-xs font-semibold text-content-primary">
                <span>
                  {term.academic_year} {term.semester} (Grade {term.grade_level_at_term ?? '-'})
                </span>
                <span className="text-content-secondary">
                  Term GPA: <strong>{formatGpa(term.term_gpa_weighted)}</strong> • {term.total_credits} Credits
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E9E9E7] text-[11px] text-content-muted">
                      <th className="py-1">Course Name</th>
                      <th className="py-1">Credits</th>
                      <th className="py-1">Grade</th>
                      <th className="py-1">Points</th>
                      <th className="py-1 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F1F0]">
                    {term.courses.map((course) => (
                      <tr key={course.id} className="text-content-primary">
                        <td className="py-1.5 flex items-center gap-1.5">
                          <span>{course.course_name}</span>
                          {course.is_honors_or_ap && (
                            <span className="rounded-sm bg-brand-subtle px-1 py-0.2 text-[9px] font-bold text-brand-primary">
                              AP/H
                            </span>
                          )}
                          {course.is_credit_makeup && (
                            <span className="inline-flex items-center gap-0.5 rounded-sm bg-semantic-success-subtle px-1 py-0.2 text-[9px] font-medium text-semantic-success">
                              <CheckCircle2 className="h-2.5 w-2.5" />
                              Make-up
                            </span>
                          )}
                        </td>
                        <td className="py-1.5">{course.credits.toFixed(2)}</td>
                        <td className="py-1.5 font-medium">{course.letter_grade}</td>
                        <td className="py-1.5">{course.grade_points?.toFixed(2) ?? '-'}</td>
                        <td className="py-1.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenMakeup(course)}
                            className="inline-flex items-center gap-1 rounded-sm border border-[#E9E9E7] bg-surface px-2 py-0.5 text-[11px] text-content-secondary hover:bg-surface-secondary hover:text-content-primary"
                          >
                            <Edit3 className="h-3 w-3" />
                            <span>Make-up</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Credit Make-up Modal */}
      <CreditMakeupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        course={selectedCourse}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}

import React from 'react';
import Link from 'next/link';
import { Award, ArrowUpRight } from 'lucide-react';
import type { TestScoreRow } from '@/types/domain.types';
import { EmptyStateCard } from '@/components/shared/empty-state-card';

export interface TestSummaryGridProps {
  testScores: TestScoreRow[];
  studentId: string;
}

export function TestSummaryGrid({ testScores, studentId }: TestSummaryGridProps) {
  if (!testScores || testScores.length === 0) {
    return (
      <EmptyStateCard
        title="No Test Scores Recorded"
        description="Standardized tests (TOEFL, SAT, PSAT, AP) have not been entered yet for this student."
        actionLabel="Add Test Scores"
        actionHref={`/students/${studentId}/records`}
        icon={Award}
      />
    );
  }

  // Group latest score per test type
  const scoreByType = new Map<string, TestScoreRow>();
  for (const score of testScores) {
    if (!scoreByType.has(score.test_type)) {
      scoreByType.set(score.test_type, score);
    }
  }

  const uniqueScores = Array.from(scoreByType.values());

  return (
    <div className="bg-white border border-[#E5E5E3] rounded-md p-5 shadow-xs">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#F1F1F0]">
        <div>
          <h3 className="text-sm font-semibold text-[#37352F] flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#2383E2]" />
            Standardized Test Scores
          </h3>
          <p className="text-xs text-[#787774] mt-0.5">
            Official exams (TOEFL, SAT, PSAT, AP)
          </p>
        </div>
        <Link
          href={`/students/${studentId}/records`}
          className="text-xs font-medium text-[#2383E2] hover:underline inline-flex items-center gap-0.5"
        >
          Manage <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {uniqueScores.map((score) => {
          let sections: Record<string, unknown> = {};
          if (score.section_scores) {
            try {
              sections =
                typeof score.section_scores === 'string'
                  ? JSON.parse(score.section_scores)
                  : (score.section_scores as Record<string, unknown>);
            } catch {
              sections = {};
            }
          }

          return (
            <div
              key={score.id}
              className="p-3.5 rounded border border-[#E5E5E3] bg-[#FAF9F8] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded bg-white border border-[#D3D3D0] text-[#37352F]">
                    {score.test_type}
                  </span>
                  <span className="text-[11px] text-[#787774]">
                    {score.test_date ?? 'No date'}
                  </span>
                </div>
                <div className="text-lg font-bold text-[#37352F] mb-1">
                  {score.total_score ?? 'N/A'}
                </div>

                {Object.keys(sections).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {Object.entries(sections).map(([key, val]) => (
                      <span
                        key={key}
                        className="text-[11px] px-1.5 py-0.5 rounded bg-white text-[#5F5E5B] border border-[#E0E0DE]"
                      >
                        {key}: <strong className="text-[#37352F]">{String(val)}</strong>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {score.detailed_notes && (
                <p className="mt-3 text-xs text-[#787774] line-clamp-2 italic border-t border-[#EAEAE8] pt-2">
                  "{score.detailed_notes}"
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

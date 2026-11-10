'use client';

import { useState } from 'react';
import type { StudentRow, TranscriptPreviewDTO } from '@/types/domain.types';
import { CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronRight, UserCheck } from 'lucide-react';
import { cn, formatGpa } from '@/lib/utils';

interface TranscriptPreviewTableProps {
  previews: TranscriptPreviewDTO[];
  students: StudentRow[];
  onStudentMatchChange: (index: number, studentId: string) => void;
  onConfirmCommit: () => void;
  isSaving: boolean;
}

export function TranscriptPreviewTable({
  previews,
  students,
  onStudentMatchChange,
  onConfirmCommit,
  isSaving,
}: TranscriptPreviewTableProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const canCommitAll =
    previews.length > 0 &&
    previews.every((p) => p.parseStatus === 'READY' && p.matchedStudentId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-content-primary">
            Step 2: Verification & Review ({previews.length} Files)
          </h2>
          <p className="text-xs text-content-secondary">
            Verify parsed student identities, grades, and GPAs before persisting to the database.
          </p>
        </div>

        <button
          type="button"
          disabled={!canCommitAll || isSaving}
          onClick={onConfirmCommit}
          className="flex items-center gap-2 rounded-md bg-brand-primary px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-brand-hover disabled:pointer-events-none disabled:opacity-50"
        >
          {isSaving ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Saving to Database...
            </span>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              <span>Confirm & Save All</span>
            </>
          )}
        </button>
      </div>

      <div className="divide-y divide-[#E9E9E7] rounded-md border border-[#E9E9E7] bg-surface shadow-xs">
        {previews.map((preview, idx) => {
          const isExpanded = expandedIndex === idx;

          return (
            <div key={`${preview.sourceFileName}-${idx}`} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                    className="text-content-muted hover:text-content-primary"
                  >
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-content-primary">
                        {preview.extractedStudentName}
                      </span>
                      {preview.extractedStudentCode && (
                        <span className="rounded-sm bg-[#F1F1F0] px-1.5 py-0.5 text-[10px] text-content-secondary">
                          {preview.extractedStudentCode}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-content-muted">{preview.sourceFileName}</p>
                  </div>
                </div>

                {/* Status & Matching Control */}
                <div className="flex items-center gap-3">
                  {preview.parseStatus === 'READY' ? (
                    <span className="inline-flex items-center gap-1 rounded-sm bg-semantic-success-subtle px-2 py-0.5 text-[11px] font-medium text-semantic-success">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Ready
                    </span>
                  ) : preview.parseStatus === 'UNMATCHED_STUDENT' ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-sm bg-semantic-warning-subtle px-2 py-0.5 text-[11px] font-medium text-semantic-warning">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Unmatched
                      </span>
                      <select
                        value={preview.matchedStudentId ?? ''}
                        onChange={(e) => onStudentMatchChange(idx, e.target.value)}
                        className="rounded-md border border-[#E9E9E7] bg-surface px-2 py-1 text-xs text-content-primary focus:border-brand-primary focus:outline-none"
                      >
                        <option value="">Select student...</option>
                        {students.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name_ko} ({s.student_code})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-sm bg-semantic-danger-subtle px-2 py-0.5 text-[11px] font-medium text-semantic-danger">
                      <XCircle className="h-3.5 w-3.5" />
                      Parse Error
                    </span>
                  )}
                </div>
              </div>

              {/* Collapsible Details */}
              {isExpanded && (
                <div className="mt-4 border-t border-[#F1F1F0] pt-3">
                  <div className="mb-2 flex items-center justify-between text-xs text-content-secondary">
                    <span>Extracted Terms ({preview.terms.length})</span>
                    <span>
                      Cum. Weighted GPA: <strong>{formatGpa(preview.cumulativeGpaWeighted)}</strong>
                    </span>
                  </div>

                  <div className="space-y-3">
                    {preview.terms.map((term, tIdx) => (
                      <div key={tIdx} className="rounded-md border border-[#F1F1F0] bg-canvas p-3">
                        <div className="mb-2 flex items-center justify-between text-xs font-medium text-content-primary">
                          <span>
                            {term.academicYear} {term.semester} (Grade {term.gradeLevelAtTerm ?? '-'})
                          </span>
                          <span>
                            Term GPA: {formatGpa(term.termGpaWeighted)} • {term.totalCredits} Credits
                          </span>
                        </div>

                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-[#E9E9E7] text-[11px] text-content-muted">
                              <th className="py-1">Course Name</th>
                              <th className="py-1">Credits</th>
                              <th className="py-1">Grade</th>
                              <th className="py-1">Points</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#F1F1F0]">
                            {term.courses.map((c, cIdx) => (
                              <tr key={cIdx} className="text-content-primary">
                                <td className="py-1.5 flex items-center gap-1.5">
                                  <span>{c.courseName}</span>
                                  {c.isHonorsOrAp && (
                                    <span className="rounded-sm bg-brand-subtle px-1 py-0.2 text-[9px] font-bold text-brand-primary">
                                      AP/H
                                    </span>
                                  )}
                                </td>
                                <td className="py-1.5">{c.credits.toFixed(2)}</td>
                                <td className="py-1.5 font-medium">{c.letterGrade}</td>
                                <td className="py-1.5">{c.gradePoints !== null && c.gradePoints !== undefined ? c.gradePoints.toFixed(2) : '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

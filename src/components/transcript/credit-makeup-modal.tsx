'use client';

import { useState } from 'react';
import type { CourseGradeRow } from '@/types/domain.types';
import { updateCourseGradeMakeupAction } from '@/lib/actions/makeup.actions';
import { STANDARD_GRADE_POINTS } from '@/lib/pdf-parser/gpa-calculator';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';

interface CreditMakeupModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: CourseGradeRow | null;
  onSuccess?: () => void;
}

const AVAILABLE_GRADES = Object.keys(STANDARD_GRADE_POINTS);

export function CreditMakeupModal({
  isOpen,
  onClose,
  course,
  onSuccess,
}: CreditMakeupModalProps) {
  const [newGrade, setNewGrade] = useState('A');
  const [makeupDate, setMakeupDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [makeupNote, setMakeupNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !course) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!makeupNote.trim()) {
      setErrorMessage('Please provide a reason for the Credit Make-up.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await updateCourseGradeMakeupAction({
        courseId: course.id,
        newLetterGrade: newGrade,
        makeupDate,
        makeupNote,
      });

      if (res.success) {
        onSuccess?.();
        onClose();
      } else {
        setErrorMessage(res.error.message);
      }
    } catch {
      setErrorMessage('Failed to save Credit Make-up. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-lg border border-[#E9E9E7] bg-surface p-6 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F1F1F0] pb-3">
          <div>
            <h3 className="text-sm font-semibold text-content-primary">
              Credit Make-up Grade Override
            </h3>
            <p className="text-xs text-content-secondary">{course.course_name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm p-1 text-content-muted hover:bg-[#F1F1F0] hover:text-content-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Feedback Alert */}
        {errorMessage && (
          <div className="mt-3 flex items-center gap-2 rounded-md border border-semantic-danger/30 bg-semantic-danger-subtle p-2.5 text-xs text-semantic-danger">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Current Grade Badge */}
          <div className="flex items-center justify-between rounded-md bg-canvas p-2.5 text-xs">
            <span className="text-content-secondary">Current Grade:</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-content-primary">
                {course.letter_grade} ({course.grade_points?.toFixed(2) ?? '-'})
              </span>
              {course.original_letter_grade && (
                <span className="rounded-sm bg-[#E9E9E7] px-1.5 py-0.5 text-[10px] text-content-muted">
                  Original: {course.original_letter_grade}
                </span>
              )}
            </div>
          </div>

          {/* New Grade Selection */}
          <div>
            <label className="block text-xs font-medium text-content-secondary">
              New Letter Grade
            </label>
            <select
              value={newGrade}
              onChange={(e) => setNewGrade(e.target.value)}
              disabled={isSubmitting}
              className="mt-1 block w-full rounded-md border border-[#E9E9E7] bg-surface px-3 py-2 text-xs text-content-primary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
            >
              {AVAILABLE_GRADES.map((g) => (
                <option key={g} value={g}>
                  {g} ({STANDARD_GRADE_POINTS[g].toFixed(2)} pts)
                </option>
              ))}
            </select>
          </div>

          {/* Make-up Date */}
          <div>
            <label className="block text-xs font-medium text-content-secondary">
              Make-up Date
            </label>
            <input
              type="date"
              value={makeupDate}
              onChange={(e) => setMakeupDate(e.target.value)}
              disabled={isSubmitting}
              className="mt-1 block w-full rounded-md border border-[#E9E9E7] bg-surface px-3 py-1.5 text-xs text-content-primary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>

          {/* Reason / Note */}
          <div>
            <label className="block text-xs font-medium text-content-secondary">
              Reason / Documentation Notes
            </label>
            <textarea
              rows={3}
              value={makeupNote}
              onChange={(e) => setMakeupNote(e.target.value)}
              disabled={isSubmitting}
              placeholder="e.g. Summer School retake passed with 88%, verified by principal."
              className="mt-1 block w-full resize-none rounded-md border border-[#E9E9E7] bg-surface p-2.5 text-xs text-content-primary placeholder:text-content-muted focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 border-t border-[#F1F1F0] pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-md border border-[#E9E9E7] bg-surface px-3 py-1.5 text-xs text-content-secondary hover:bg-surface-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 rounded-md bg-brand-primary px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Recalculating GPA...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Apply & Recalculate</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

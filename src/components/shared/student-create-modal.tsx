'use client';

import React, { useState } from 'react';
import { UserPlus, X, Loader2 } from 'lucide-react';
import { createStudentSchema } from '@/lib/validations/student.schema';
import { createStudentAction } from '@/lib/actions/student.actions';
import type { StudentRow } from '@/types/domain.types';

export interface StudentCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (newStudent: StudentRow) => void;
}

export function StudentCreateModal({
  isOpen,
  onClose,
  onCreated,
}: StudentCreateModalProps) {
  const [nameKo, setNameKo] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [gradeLevel, setGradeLevel] = useState<number>(11);
  const [expectedGraduationYear, setExpectedGraduationYear] = useState<number>(2026);
  const [email, setEmail] = useState('');
  const [basicMemo, setBasicMemo] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const payload = {
      nameKo: nameKo.trim(),
      nameEn: nameEn.trim(),
      studentCode: studentCode.trim(),
      gradeLevel: Number(gradeLevel),
      expectedGraduationYear: expectedGraduationYear ? Number(expectedGraduationYear) : null,
      email: email.trim() || undefined,
      basicMemo: basicMemo.trim() || null,
    };

    const parsed = createStudentSchema.safeParse(payload);
    if (!parsed.success) {
      setIsSubmitting(false);
      setErrorMessage(parsed.error.errors[0]?.message ?? 'Invalid input data.');
      return;
    }

    try {
      const res = await createStudentAction(payload);
      if (!res.success) {
        setErrorMessage(res.error.message);
        return;
      }

      if (res.data) {
        onCreated?.(res.data);
      }
      onClose();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg border border-[#E5E5E3] w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#F1F1F0]">
          <h3 className="text-sm font-semibold text-[#37352F] flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-[#2383E2]" />
            Register New Student
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#787774] hover:bg-[#F1F1F0]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 mb-4 text-xs text-[#EB5757] bg-[#FCE8E6] border border-[#EB5757]/30 rounded">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#787774] mb-1">
                Korean Name (한글 성명) *
              </label>
              <input
                type="text"
                placeholder="e.g. 김은솔"
                value={nameKo}
                onChange={(e) => setNameKo(e.target.value)}
                required
                className="w-full text-xs px-2.5 py-1.5 rounded border border-[#E0E0DE] bg-white focus:outline-none focus:border-[#2383E2]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#787774] mb-1">
                English Name (영문 성명) *
              </label>
              <input
                type="text"
                placeholder="e.g. Eunsol Kim"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                required
                className="w-full text-xs px-2.5 py-1.5 rounded border border-[#E0E0DE] bg-white focus:outline-none focus:border-[#2383E2]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#787774] mb-1">
                Student Code (학번) *
              </label>
              <input
                type="text"
                placeholder="e.g. 2026-0315"
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value)}
                required
                className="w-full text-xs px-2.5 py-1.5 rounded border border-[#E0E0DE] bg-white focus:outline-none focus:border-[#2383E2]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#787774] mb-1">
                Grade Level *
              </label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(Number(e.target.value))}
                className="w-full text-xs px-2 py-1.5 rounded border border-[#E0E0DE] bg-white focus:outline-none focus:border-[#2383E2]"
              >
                {[9, 10, 11, 12].map((g) => (
                  <option key={g} value={g}>
                    Grade {g}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#787774] mb-1">
                Expected Grad Year
              </label>
              <input
                type="number"
                value={expectedGraduationYear}
                onChange={(e) => setExpectedGraduationYear(Number(e.target.value))}
                className="w-full text-xs px-2.5 py-1.5 rounded border border-[#E0E0DE] bg-white focus:outline-none focus:border-[#2383E2]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#787774] mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="eunsol.kim@student.lighthouse.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 rounded border border-[#E0E0DE] bg-white focus:outline-none focus:border-[#2383E2]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#787774] mb-1">
              Initial Counseling Notes (Memo)
            </label>
            <textarea
              rows={3}
              placeholder="Academic interests, target majors, background notes..."
              value={basicMemo}
              onChange={(e) => setBasicMemo(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded border border-[#E0E0DE] bg-white focus:outline-none focus:border-[#2383E2]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#F1F1F0]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3 py-1.5 text-xs text-[#787774] hover:bg-[#F1F1F0] rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 text-xs font-medium text-white bg-[#37352F] hover:bg-[#2F2E2A] rounded flex items-center gap-1.5 shadow-xs"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Register Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

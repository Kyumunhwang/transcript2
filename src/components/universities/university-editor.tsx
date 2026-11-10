'use client';

import React, { useState } from 'react';
import { Loader2, Plus, Edit3, X } from 'lucide-react';
import {
  createTargetUniversitySchema,
  proposerTypeEnum,
  type ProposerType,
} from '@/lib/validations/university.schema';
import {
  createTargetUniversityAction,
  updateTargetUniversityAction,
} from '@/lib/actions/university.actions';
import type { TargetUniversityRow } from '@/types/domain.types';

export interface UniversityEditorProps {
  studentId: string;
  initialData?: TargetUniversityRow | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function UniversityEditor({
  studentId,
  initialData,
  isOpen,
  onClose,
  onSuccess,
}: UniversityEditorProps) {
  const isEditing = Boolean(initialData);

  const [universityName, setUniversityName] = useState(initialData?.university_name ?? '');
  const [intendedMajor, setIntendedMajor] = useState(initialData?.intended_major ?? '');
  const [proposerType, setProposerType] = useState<ProposerType>(
    (initialData?.proposer_type as ProposerType) || 'TEACHER'
  );
  const [applicationRound, setApplicationRound] = useState(initialData?.application_round ?? 'RD');
  const [countryOrRegion, setCountryOrRegion] = useState(initialData?.country_or_region ?? 'USA');
  const [priorityOrder, setPriorityOrder] = useState<number>(initialData?.priority_order ?? 1);
  const [pros, setPros] = useState(initialData?.pros ?? '');
  const [cons, setCons] = useState(initialData?.cons ?? '');
  const [strategicNotes, setStrategicNotes] = useState(initialData?.strategic_notes ?? '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const payload = {
      studentId,
      universityName,
      countryOrRegion: countryOrRegion.trim() || null,
      intendedMajor: intendedMajor.trim() || null,
      proposerType,
      applicationRound: applicationRound.trim() || null,
      pros: pros.trim() || null,
      cons: cons.trim() || null,
      strategicNotes: strategicNotes.trim() || null,
      priorityOrder: Number(priorityOrder) || 1,
    };

    const parsed = createTargetUniversitySchema.safeParse(payload);
    if (!parsed.success) {
      setIsSubmitting(false);
      setErrorMessage(parsed.error.errors[0]?.message ?? 'Validation failed.');
      return;
    }

    try {
      if (isEditing && initialData) {
        const res = await updateTargetUniversityAction({ ...payload, id: initialData.id });
        if (!res.success) {
          setErrorMessage(res.error.message);
          return;
        }
      } else {
        const res = await createTargetUniversityAction(payload);
        if (!res.success) {
          setErrorMessage(res.error.message);
          return;
        }
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to save university.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg border border-[#E5E5E3] w-full max-w-xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#F1F1F0]">
          <h3 className="text-sm font-semibold text-[#37352F] flex items-center gap-2">
            {isEditing ? <Edit3 className="w-4 h-4 text-[#2383E2]" /> : <Plus className="w-4 h-4 text-[#2383E2]" />}
            {isEditing ? 'Edit Target University' : 'Add Target University'}
          </h3>
          <button onClick={onClose} className="p-1 rounded text-[#787774] hover:bg-[#F1F1F0] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 mb-4 text-xs text-[#EB5757] bg-[#FCE8E6] border border-[#EB5757]/30 rounded">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#787774] mb-1">University Name *</label>
              <input
                type="text"
                placeholder="e.g. Stanford University"
                value={universityName}
                onChange={(e) => setUniversityName(e.target.value)}
                required
                className="w-full text-xs px-2.5 py-1.5 rounded border border-[#E0E0DE] bg-white focus:outline-none focus:border-[#2383E2]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#787774] mb-1">Intended Major</label>
              <input
                type="text"
                placeholder="e.g. Computer Science"
                value={intendedMajor}
                onChange={(e) => setIntendedMajor(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 rounded border border-[#E0E0DE] bg-white focus:outline-none focus:border-[#2383E2]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#787774] mb-1">Proposed By *</label>
              <select
                value={proposerType}
                onChange={(e) => setProposerType(e.target.value as ProposerType)}
                className="w-full text-xs px-2 py-1.5 rounded border border-[#E0E0DE] bg-white focus:outline-none focus:border-[#2383E2]"
              >
                {proposerTypeEnum.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === 'TEACHER' ? 'Teacher Suggested' : opt === 'STUDENT' ? 'Student Desired' : 'Mutual Choice'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#787774] mb-1">Application Round</label>
              <input
                type="text"
                placeholder="ED / EA / RD / Rolling"
                value={applicationRound}
                onChange={(e) => setApplicationRound(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 rounded border border-[#E0E0DE] bg-white focus:outline-none focus:border-[#2383E2]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#787774] mb-1">Country / Region</label>
              <input
                type="text"
                placeholder="USA, UK, etc."
                value={countryOrRegion}
                onChange={(e) => setCountryOrRegion(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 rounded border border-[#E0E0DE] bg-white focus:outline-none focus:border-[#2383E2]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#0F7B6C] mb-1">Pros (Advantages / Strengths)</label>
            <textarea
              rows={2}
              placeholder="Why this university is a strong fit (academics, faculty, culture, location)..."
              value={pros}
              onChange={(e) => setPros(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded border border-[#E0E0DE] bg-white focus:outline-none focus:border-[#0F7B6C]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#EB5757] mb-1">Cons (Disadvantages / Challenges)</label>
            <textarea
              rows={2}
              placeholder="Potential hurdles, low acceptance rates, cost of attendance, climate..."
              value={cons}
              onChange={(e) => setCons(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded border border-[#E0E0DE] bg-white focus:outline-none focus:border-[#EB5757]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#787774] mb-1">Strategic Counselor Notes</label>
            <textarea
              rows={2}
              placeholder="Application strategy, supplemental essay focus, test requirements..."
              value={strategicNotes}
              onChange={(e) => setStrategicNotes(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded border border-[#E0E0DE] bg-white focus:outline-none focus:border-[#2383E2]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[#F1F1F0]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3 py-1.5 text-xs font-medium text-[#787774] hover:bg-[#F1F1F0] rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 text-xs font-medium text-white bg-[#37352F] hover:bg-[#2F2E2A] rounded transition-colors flex items-center gap-1.5 shadow-xs"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Add University'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

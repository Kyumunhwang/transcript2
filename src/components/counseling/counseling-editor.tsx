'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Plus, Edit3, X, Pin, RotateCcw } from 'lucide-react';
import { createCounselingLogSchema } from '@/lib/validations/counseling.schema';
import {
  createCounselingLogAction,
  updateCounselingLogAction,
} from '@/lib/actions/counseling.actions';
import { useAutosave } from '@/hooks/use-autosave';
import { AutosaveIndicator } from '@/components/shared/autosave-indicator';
import type { CounselingLogRow } from '@/types/domain.types';

export interface CounselingEditorProps {
  studentId: string;
  initialData?: CounselingLogRow | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface DraftState {
  counselorName: string;
  counselingDate: string;
  sessionTopic: string;
  content: string;
  actionItems: string;
  isPinned: boolean;
}

export function CounselingEditor({
  studentId,
  initialData,
  isOpen,
  onClose,
  onSuccess,
}: CounselingEditorProps) {
  const isEditing = Boolean(initialData);
  const storageKey = isEditing ? undefined : `counseling_draft_${studentId}`;

  const [counselorName, setCounselorName] = useState(initialData?.counselor_name ?? 'Lead Counselor');
  const [counselingDate, setCounselingDate] = useState(
    initialData?.counseling_date ?? new Date().toISOString().slice(0, 10)
  );
  const [sessionTopic, setSessionTopic] = useState(initialData?.session_topic ?? '');
  const [content, setContent] = useState(initialData?.content ?? '');
  const [actionItems, setActionItems] = useState(initialData?.action_items ?? '');
  const [isPinned, setIsPinned] = useState(initialData?.is_pinned ?? false);

  const [hasDraftNotice, setHasDraftNotice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const draftData: DraftState = { counselorName, counselingDate, sessionTopic, content, actionItems, isPinned };
  const { status, lastSavedAt, restoreDraft, clearDraft } = useAutosave<DraftState>({
    data: draftData,
    storageKey,
    enabled: isOpen && !isEditing,
  });

  useEffect(() => {
    if (isOpen && !isEditing) {
      const saved = restoreDraft();
      if (saved && (saved.content || saved.sessionTopic) && !content) {
        setHasDraftNotice(true);
      }
    }
  }, [isOpen, isEditing, restoreDraft, content]);

  if (!isOpen) return null;

  function applyDraft() {
    const saved = restoreDraft();
    if (saved) {
      setCounselorName(saved.counselorName || 'Lead Counselor');
      setCounselingDate(saved.counselingDate || new Date().toISOString().slice(0, 10));
      setSessionTopic(saved.sessionTopic || '');
      setContent(saved.content || '');
      setActionItems(saved.actionItems || '');
      setIsPinned(saved.isPinned || false);
    }
    setHasDraftNotice(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const payload = {
      studentId, counselorName, counselingDate, sessionTopic, content,
      actionItems: actionItems.trim().length > 0 ? actionItems : null, isPinned,
    };

    const parsed = createCounselingLogSchema.safeParse(payload);
    if (!parsed.success) {
      setIsSubmitting(false);
      setErrorMessage(parsed.error.errors[0]?.message ?? 'Validation failed.');
      return;
    }

    try {
      const res = isEditing && initialData
        ? await updateCounselingLogAction({ ...payload, id: initialData.id })
        : await createCounselingLogAction(payload);

      if (!res.success) {
        setErrorMessage(res.error.message);
        return;
      }

      clearDraft();
      onSuccess?.();
      onClose();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to save counseling log.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg border border-[#E5E5E3] w-full max-w-xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F1F1F0]">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[#37352F] flex items-center gap-1.5">
              {isEditing ? <Edit3 className="w-4 h-4 text-[#2383E2]" /> : <Plus className="w-4 h-4 text-[#2383E2]" />}
              {isEditing ? 'Edit Counseling Session' : 'New 1:1 Counseling Log'}
            </h3>
            {!isEditing && <AutosaveIndicator status={status} lastSavedAt={lastSavedAt} />}
          </div>
          <button onClick={onClose} className="p-1 rounded text-[#787774] hover:bg-[#F1F1F0]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {hasDraftNotice && (
          <div className="p-2.5 mb-3 bg-[#E8F2FC] border border-[#2383E2]/30 rounded text-xs flex items-center justify-between">
            <span className="text-[#2383E2] font-medium flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5" /> Recover unsaved draft?
            </span>
            <div className="flex items-center gap-2">
              <button onClick={applyDraft} className="px-2 py-0.5 rounded bg-[#2383E2] text-white text-[11px] font-semibold">Restore</button>
              <button onClick={() => { clearDraft(); setHasDraftNotice(false); }} className="text-[11px] text-[#787774] hover:underline">Discard</button>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 mb-3 text-xs text-[#EB5757] bg-[#FCE8E6] border border-[#EB5757]/30 rounded">{errorMessage}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#787774] mb-1">Date *</label>
              <input type="date" value={counselingDate} onChange={(e) => setCounselingDate(e.target.value)} required className="w-full text-xs px-2.5 py-1.5 rounded border border-[#E0E0DE] bg-white focus:outline-none focus:border-[#2383E2]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#787774] mb-1">Counselor Name *</label>
              <input type="text" value={counselorName} onChange={(e) => setCounselorName(e.target.value)} required className="w-full text-xs px-2.5 py-1.5 rounded border border-[#E0E0DE] bg-white focus:outline-none focus:border-[#2383E2]" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#787774] mb-1">Session Topic *</label>
            <input type="text" placeholder="e.g. 11th Grade Fall College Strategy" value={sessionTopic} onChange={(e) => setSessionTopic(e.target.value)} required className="w-full text-xs px-2.5 py-1.5 rounded border border-[#E0E0DE] bg-white focus:outline-none focus:border-[#2383E2]" />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#787774] mb-1">Detailed Counseling Notes *</label>
            <textarea rows={5} placeholder="Record counseling dialogue and decisions..." value={content} onChange={(e) => setContent(e.target.value)} required className="w-full text-xs px-3 py-2 rounded border border-[#E0E0DE] bg-white focus:outline-none focus:border-[#2383E2] leading-relaxed" />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#787774] mb-1">Action Items & Next Steps</label>
            <textarea rows={2} placeholder="Deliverables before next meeting..." value={actionItems} onChange={(e) => setActionItems(e.target.value)} className="w-full text-xs px-3 py-2 rounded border border-[#E0E0DE] bg-white focus:outline-none focus:border-[#2383E2]" />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input type="checkbox" id="isPinned" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} className="rounded border-[#E0E0DE] text-[#2383E2]" />
            <label htmlFor="isPinned" className="text-xs text-[#37352F] flex items-center gap-1 cursor-pointer select-none">
              <Pin className="w-3.5 h-3.5 text-[#2383E2]" /> Pin session to the top
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#F1F1F0]">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-3 py-1.5 text-xs text-[#787774] hover:bg-[#F1F1F0] rounded">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-1.5 text-xs font-medium text-white bg-[#37352F] hover:bg-[#2F2E2A] rounded flex items-center gap-1.5 shadow-xs">
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Create Counseling Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

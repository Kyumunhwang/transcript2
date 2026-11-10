'use client';

import { useState } from 'react';
import type { TestScoreRow } from '@/types/domain.types';
import type { TestTypeEnum } from '@/types/database.types';
import { upsertTestScoreAction, deleteTestScoreAction } from '@/lib/actions/records.actions';
import { Plus, Trash2, Edit2, CheckCircle2, AlertCircle } from 'lucide-react';

interface TestScoreFormProps {
  studentId: string;
  initialScores: TestScoreRow[];
}

export function TestScoreForm({ studentId, initialScores }: TestScoreFormProps) {
  const [scores, setScores] = useState<TestScoreRow[]>(initialScores);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [testType, setTestType] = useState<TestTypeEnum>('TOEFL');
  const [subjectOrDetail, setSubjectOrDetail] = useState('');
  const [totalScore, setTotalScore] = useState('');
  const [testDate, setTestDate] = useState('');
  const [detailedNotes, setDetailedNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(undefined);
    setTestType('TOEFL');
    setSubjectOrDetail('');
    setTotalScore('');
    setTestDate('');
    setDetailedNotes('');
  };

  const handleOpenEdit = (score: TestScoreRow) => {
    setEditingId(score.id);
    setTestType(score.test_type);
    setSubjectOrDetail(score.subject_or_detail ?? '');
    setTotalScore(score.total_score);
    setTestDate(score.test_date ?? '');
    setDetailedNotes(score.detailed_notes ?? '');
    setIsEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const res = await upsertTestScoreAction({
      id: editingId,
      studentId,
      testType,
      subjectOrDetail: subjectOrDetail.trim() || null,
      totalScore: totalScore.trim(),
      testDate: testDate || null,
      sectionScores: {},
      detailedNotes: detailedNotes.trim() || null,
    });

    setIsSubmitting(false);

    if (res.success && res.data) {
      setFeedback({ type: 'success', message: 'Test score saved.' });
      const saved = res.data;
      setScores((prev) =>
        editingId ? prev.map((s) => (s.id === editingId ? saved : s)) : [saved, ...prev]
      );
      resetForm();
    } else if (!res.success) {
      setFeedback({ type: 'error', message: res.error.message });
    }
  };

  const handleDelete = async (scoreId: string) => {
    if (!confirm('Are you sure you want to delete this test score record?')) return;
    const res = await deleteTestScoreAction(scoreId, studentId);
    if (res.success) {
      setScores((prev) => prev.filter((s) => s.id !== scoreId));
    }
  };

  return (
    <div className="space-y-4 rounded-md border border-[#E9E9E7] bg-surface p-6 shadow-xs">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-content-primary">Standardized Test Scores</h3>
          <p className="text-xs text-content-secondary">TOEFL, SAT/PSAT, AP exam logs and detailed preparation analysis.</p>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 rounded-md bg-brand-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-hover"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Score</span>
          </button>
        )}
      </div>

      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-md p-2.5 text-xs ${
            feedback.type === 'success'
              ? 'bg-semantic-success-subtle text-semantic-success'
              : 'bg-semantic-danger-subtle text-semantic-danger'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Editor Form */}
      {isEditing && (
        <form onSubmit={handleSubmit} className="rounded-md border border-[#E9E9E7] bg-canvas p-4 space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div>
              <label className="block text-[11px] font-medium text-content-secondary">Type</label>
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value as TestTypeEnum)}
                className="mt-1 block w-full rounded-md border border-[#E9E9E7] bg-surface p-1.5 text-xs text-content-primary"
              >
                <option value="TOEFL">TOEFL</option>
                <option value="SAT">SAT</option>
                <option value="PSAT">PSAT</option>
                <option value="AP">AP</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-content-secondary">Detail / Subject</label>
              <input
                type="text"
                placeholder={testType === 'AP' ? 'e.g. AP Chemistry' : 'e.g. Official / Mock'}
                value={subjectOrDetail}
                onChange={(e) => setSubjectOrDetail(e.target.value)}
                className="mt-1 block w-full rounded-md border border-[#E9E9E7] bg-surface p-1.5 text-xs text-content-primary"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-content-secondary">Score</label>
              <input
                type="text"
                required
                placeholder="e.g. 112, 1520, 5"
                value={totalScore}
                onChange={(e) => setTotalScore(e.target.value)}
                className="mt-1 block w-full rounded-md border border-[#E9E9E7] bg-surface p-1.5 text-xs text-content-primary font-semibold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-content-secondary">Test Date</label>
              <input
                type="date"
                value={testDate}
                onChange={(e) => setTestDate(e.target.value)}
                className="mt-1 block w-full rounded-md border border-[#E9E9E7] bg-surface p-1.5 text-xs text-content-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-content-secondary">Detailed Notes & Analysis (Long-form)</label>
            <textarea
              rows={2}
              value={detailedNotes}
              onChange={(e) => setDetailedNotes(e.target.value)}
              placeholder="Record section breakdown (R/L/S/W), strengths, weaknesses, target goals..."
              className="mt-1 block w-full resize-none rounded-md border border-[#E9E9E7] bg-surface p-2 text-xs text-content-primary"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="rounded-md border border-[#E9E9E7] bg-surface px-3 py-1.5 text-xs text-content-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-brand-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-hover disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : editingId ? 'Update Score' : 'Save Score'}
            </button>
          </div>
        </form>
      )}

      {/* List */}
      <div className="divide-y divide-[#F1F1F0]">
        {scores.length === 0 ? (
          <p className="py-4 text-center text-xs text-content-muted">No test scores recorded yet.</p>
        ) : (
          scores.map((score) => (
            <div key={score.id} className="flex items-start justify-between py-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-sm bg-brand-subtle px-1.5 py-0.5 text-[10px] font-bold text-brand-primary">
                    {score.test_type}
                  </span>
                  <span className="text-sm font-semibold text-content-primary">{score.total_score}</span>
                  {score.subject_or_detail && (
                    <span className="text-xs text-content-secondary">• {score.subject_or_detail}</span>
                  )}
                  {score.test_date && <span className="text-[11px] text-content-muted">({score.test_date})</span>}
                </div>
                {score.detailed_notes && (
                  <p className="mt-1 text-xs text-content-secondary whitespace-pre-wrap">{score.detailed_notes}</p>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(score)}
                  className="rounded-sm p-1 text-content-muted hover:bg-[#F1F1F0] hover:text-content-primary"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(score.id)}
                  className="rounded-sm p-1 text-content-muted hover:bg-semantic-danger-subtle hover:text-semantic-danger"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

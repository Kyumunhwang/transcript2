'use client';

import { useState, useEffect, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { useUploadQueueStore } from '@/stores/use-upload-queue-store';
import { TranscriptPreviewTable } from '@/components/transcript/transcript-preview-table';
import { commitTranscriptsAction } from '@/lib/actions/transcript.actions';
import { getStudentsAction } from '@/lib/actions/student.actions';
import type { StudentRow } from '@/types/domain.types';

export default function TranscriptUploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [statusFeedback, setStatusFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const {
    queue,
    previews,
    isSaving,
    addToQueue,
    clearQueue,
    setPreviews,
    updatePreviewStudent,
    clearPreviews,
    setIsSaving,
  } = useUploadQueueStore();

  // Load students for manual mapping
  useEffect(() => {
    async function loadStudents() {
      const res = await getStudentsAction();
      if (res.success && res.data) {
        setStudents(res.data);
      }
    }
    loadStudents();
  }, []);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const pdfFiles = Array.from(e.dataTransfer.files).filter((f) => f.name.endsWith('.pdf'));
      if (pdfFiles.length > 0) addToQueue(pdfFiles);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const pdfFiles = Array.from(e.target.files).filter((f) => f.name.endsWith('.pdf'));
      if (pdfFiles.length > 0) addToQueue(pdfFiles);
    }
  };

  const handleParseTranscripts = async () => {
    if (queue.length === 0) return;
    setIsParsing(true);
    setStatusFeedback(null);

    const formData = new FormData();
    queue.forEach((item) => formData.append('files', item.file));

    try {
      const res = await fetch('/api/transcript/parse', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success && data.data) {
        setPreviews(data.data);
      } else {
        setStatusFeedback({ type: 'error', message: data.error?.message || 'Parsing failed.' });
      }
    } catch {
      setStatusFeedback({ type: 'error', message: 'Network error occurred while parsing transcripts.' });
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmCommit = async () => {
    setIsSaving(true);
    setStatusFeedback(null);

    try {
      const validPreviews = previews.map((p) => ({
        sourceFileName: p.sourceFileName,
        matchedStudentId: p.matchedStudentId!,
        extractedStudentCode: p.extractedStudentCode,
        extractedStudentName: p.extractedStudentName,
        cumulativeGpaUnweighted: p.cumulativeGpaUnweighted,
        cumulativeGpaWeighted: p.cumulativeGpaWeighted,
        terms: p.terms,
      }));

      const res = await commitTranscriptsAction({ previews: validPreviews });
      if (res.success) {
        setStatusFeedback({ type: 'success', message: res.message || 'Saved successfully.' });
        clearQueue();
        clearPreviews();
      } else {
        setStatusFeedback({ type: 'error', message: res.error.message });
      }
    } catch {
      setStatusFeedback({ type: 'error', message: 'Failed to persist transcript records.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-content-primary">
          Gradelink Transcript Batch Upload Center
        </h1>
        <p className="mt-1 text-xs text-content-secondary">
          Upload semester transcript PDFs to parse grades, calculate cumulative GPAs, and update student profiles.
        </p>
      </div>

      {statusFeedback && (
        <div
          className={`flex items-center gap-2 rounded-md p-3 text-xs ${
            statusFeedback.type === 'success'
              ? 'border border-semantic-success/30 bg-semantic-success-subtle text-semantic-success'
              : 'border border-semantic-danger/30 bg-semantic-danger-subtle text-semantic-danger'
          }`}
        >
          {statusFeedback.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <span>{statusFeedback.message}</span>
        </div>
      )}

      {/* Step 1: Upload Box */}
      {previews.length === 0 && (
        <div className="rounded-md border border-[#E9E9E7] bg-surface p-6 shadow-xs">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-[#D3D1CB] p-10 text-center transition-colors hover:border-brand-primary hover:bg-canvas cursor-pointer"
          >
            <UploadCloud className="h-10 w-10 text-brand-primary" />
            <h3 className="mt-3 text-sm font-semibold text-content-primary">
              Drag & Drop Gradelink Transcript PDFs here
            </h3>
            <p className="mt-1 text-xs text-content-muted">or click to browse local files (Supports multi-select)</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="application/pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Queue List */}
          {queue.length > 0 && (
            <div className="mt-6 border-t border-[#F1F1F0] pt-4">
              <div className="mb-3 flex items-center justify-between text-xs text-content-secondary">
                <span>Selected Files ({queue.length})</span>
                <button type="button" onClick={clearQueue} className="text-content-muted hover:text-semantic-danger">
                  Clear All
                </button>
              </div>

              <div className="max-h-48 space-y-1.5 overflow-y-auto">
                {queue.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-sm bg-canvas px-3 py-2 text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="h-4 w-4 text-brand-primary" />
                      <span className="truncate text-content-primary">{item.file.name}</span>
                    </div>
                    <span className="text-[11px] text-content-muted">{(item.file.size / 1024).toFixed(0)} KB</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  disabled={isParsing}
                  onClick={handleParseTranscripts}
                  className="flex items-center gap-2 rounded-md bg-brand-primary px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
                >
                  {isParsing ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Parsing PDFs...
                    </span>
                  ) : (
                    'Parse Transcripts'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Verification Preview Table */}
      {previews.length > 0 && (
        <TranscriptPreviewTable
          previews={previews}
          students={students}
          onStudentMatchChange={updatePreviewStudent}
          onConfirmCommit={handleConfirmCommit}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}

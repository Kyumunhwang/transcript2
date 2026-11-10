'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  Plus,
  Pin,
  Trash2,
  Edit,
  CheckCircle2,
  Calendar,
  User,
  Search,
} from 'lucide-react';
import type { CounselingLogRow } from '@/types/domain.types';
import {
  togglePinCounselingAction,
  deleteCounselingLogAction,
} from '@/lib/actions/counseling.actions';
import { CounselingEditor } from './counseling-editor';
import { EmptyStateCard } from '@/components/shared/empty-state-card';

export interface CounselingTimelineProps {
  logs: CounselingLogRow[];
  studentId: string;
}

export function CounselingTimeline({ logs, studentId }: CounselingTimelineProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<CounselingLogRow | null>(null);

  const filteredLogs = logs.filter((log) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      log.session_topic.toLowerCase().includes(term) ||
      log.content.toLowerCase().includes(term) ||
      log.counselor_name.toLowerCase().includes(term)
    );
  });

  async function handleTogglePin(id: string, currentPin: boolean) {
    await togglePinCounselingAction({
      id,
      studentId,
      isPinned: !currentPin,
    });
  }

  async function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this counseling log?')) {
      await deleteCounselingLogAction({ id, studentId });
    }
  }

  return (
    <div className="space-y-4">
      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white border border-[#E5E5E3] rounded-md p-3.5 shadow-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-[#787774] absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search counseling sessions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded border border-[#E0E0DE] bg-[#FBFAF9] focus:bg-white focus:outline-none focus:border-[#2383E2]"
          />
        </div>
        <button
          onClick={() => {
            setEditingLog(null);
            setIsEditorOpen(true);
          }}
          className="px-3 py-1.5 text-xs font-medium text-white bg-[#37352F] hover:bg-[#2F2E2A] rounded transition-colors flex items-center justify-center gap-1.5 shadow-xs shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          New Counseling Log
        </button>
      </div>

      {/* Logs Feed */}
      {filteredLogs.length === 0 ? (
        <EmptyStateCard
          title="No Counseling Sessions Found"
          description={
            searchTerm
              ? 'No counseling sessions match your search criteria.'
              : 'There are no 1:1 counseling logs recorded for this student yet.'
          }
          actionLabel="Log First Counseling Session"
          actionHref="#"
          icon={MessageSquare}
        />
      ) : (
        <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-[#EAEAE8]">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className={`relative pl-8 transition-all ${
                log.is_pinned ? 'scale-[1.005]' : ''
              }`}
            >
              {/* Timeline Dot */}
              <div
                className={`absolute left-2 top-4 w-3.5 h-3.5 rounded-full border-2 bg-white -translate-x-1/2 ${
                  log.is_pinned
                    ? 'border-[#2383E2] bg-[#2383E2]'
                    : 'border-[#787774]'
                }`}
              />

              {/* Card Container */}
              <div
                className={`bg-white border rounded-md p-4 shadow-xs transition-colors ${
                  log.is_pinned
                    ? 'border-[#2383E2]/50 shadow-sm'
                    : 'border-[#E5E5E3] hover:border-[#D1D1CE]'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 pb-2.5 mb-2.5 border-b border-[#F1F1F0]">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {log.is_pinned && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#E8F2FC] text-[#2383E2]">
                          <Pin className="w-2.5 h-2.5" /> PINNED
                        </span>
                      )}
                      <span className="text-xs text-[#787774] flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {log.counseling_date}
                      </span>
                      <span className="text-xs text-[#787774] flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {log.counselor_name}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-[#37352F]">
                      {log.session_topic}
                    </h4>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleTogglePin(log.id, log.is_pinned)}
                      title={log.is_pinned ? 'Unpin' : 'Pin to top'}
                      className={`p-1.5 rounded transition-colors ${
                        log.is_pinned
                          ? 'text-[#2383E2] bg-[#E8F2FC]'
                          : 'text-[#787774] hover:bg-[#F1F1F0]'
                      }`}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingLog(log);
                        setIsEditorOpen(true);
                      }}
                      title="Edit"
                      className="p-1.5 rounded text-[#787774] hover:bg-[#F1F1F0] transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(log.id)}
                      title="Delete"
                      className="p-1.5 rounded text-[#EB5757] hover:bg-[#FCE8E6] transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Content Body */}
                <div className="text-xs text-[#37352F] whitespace-pre-line leading-relaxed mb-3">
                  {log.content}
                </div>

                {/* Action Items Box */}
                {log.action_items && (
                  <div className="mt-3 p-3 rounded bg-[#FBFAF9] border border-[#EAEAE8]">
                    <div className="text-[11px] font-semibold text-[#37352F] flex items-center gap-1.5 mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2383E2]" />
                      Action Items & Next Steps
                    </div>
                    <p className="text-xs text-[#5F5E5B] whitespace-pre-line leading-relaxed">
                      {log.action_items}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Counseling Editor Modal */}
      <CounselingEditor
        studentId={studentId}
        initialData={editingLog}
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingLog(null);
        }}
      />
    </div>
  );
}

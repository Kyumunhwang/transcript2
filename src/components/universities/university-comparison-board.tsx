'use client';

import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Globe,
  Tag,
} from 'lucide-react';
import type { TargetUniversityRow } from '@/types/domain.types';
import { deleteTargetUniversityAction } from '@/lib/actions/university.actions';
import { UniversityEditor } from './university-editor';
import { EmptyStateCard } from '@/components/shared/empty-state-card';

export interface UniversityComparisonBoardProps {
  universities: TargetUniversityRow[];
  studentId: string;
}

export function UniversityComparisonBoard({
  universities,
  studentId,
}: UniversityComparisonBoardProps) {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingUni, setEditingUni] = useState<TargetUniversityRow | null>(null);

  const filteredUnis = universities.filter((u) => {
    if (filterType === 'ALL') return true;
    return u.proposer_type === filterType;
  });

  async function handleDelete(id: string) {
    if (confirm('Are you sure you want to remove this target university?')) {
      await deleteTargetUniversityAction({ id, studentId });
    }
  }

  return (
    <div className="space-y-4">
      {/* Control & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white border border-[#E5E5E3] rounded-md p-3.5 shadow-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          {['ALL', 'TEACHER', 'STUDENT', 'BOTH'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-2.5 py-1 text-xs rounded transition-colors ${
                filterType === type
                  ? 'bg-[#37352F] text-white font-medium'
                  : 'bg-[#F1F1F0] text-[#787774] hover:text-[#37352F]'
              }`}
            >
              {type === 'ALL'
                ? `All (${universities.length})`
                : type === 'TEACHER'
                ? 'Teacher Suggested'
                : type === 'STUDENT'
                ? 'Student Desired'
                : 'Mutual'}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            setEditingUni(null);
            setIsEditorOpen(true);
          }}
          className="px-3 py-1.5 text-xs font-medium text-white bg-[#37352F] hover:bg-[#2F2E2A] rounded transition-colors flex items-center justify-center gap-1.5 shadow-xs shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Target University
        </button>
      </div>

      {/* University Comparison Cards */}
      {filteredUnis.length === 0 ? (
        <EmptyStateCard
          title="No Target Universities Found"
          description={
            filterType === 'ALL'
              ? 'No target universities have been proposed yet. Add aspirational, match, and safety schools to analyze pros and cons.'
              : 'No universities found for this filter category.'
          }
          actionLabel="Add Target University"
          actionHref="#"
          icon={GraduationCap}
        />
      ) : (
        <div className="space-y-4">
          {filteredUnis.map((uni) => (
            <div
              key={uni.id}
              className="bg-white border border-[#E5E5E3] rounded-md p-5 shadow-xs hover:border-[#D1D1CE] transition-all"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3 pb-3 mb-3 border-b border-[#F1F1F0]">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                        uni.proposer_type === 'TEACHER'
                          ? 'bg-[#E8F2FC] text-[#2383E2]'
                          : uni.proposer_type === 'STUDENT'
                          ? 'bg-[#F6E8FC] text-[#9333EA]'
                          : 'bg-[#DCFCE7] text-[#166534]'
                      }`}
                    >
                      {uni.proposer_type === 'TEACHER'
                        ? 'Teacher Suggested'
                        : uni.proposer_type === 'STUDENT'
                        ? 'Student Desired'
                        : 'Mutual Agreement'}
                    </span>
                    {uni.application_round && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F1F1F0] text-[#37352F]">
                        {uni.application_round}
                      </span>
                    )}
                    {uni.country_or_region && (
                      <span className="text-xs text-[#787774] flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {uni.country_or_region}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-[#37352F]">
                    {uni.university_name}
                  </h3>
                  {uni.intended_major && (
                    <p className="text-xs text-[#787774] mt-0.5 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-[#2383E2]" />
                      Intended Major: <strong className="text-[#37352F]">{uni.intended_major}</strong>
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      setEditingUni(uni);
                      setIsEditorOpen(true);
                    }}
                    title="Edit"
                    className="p-1.5 rounded text-[#787774] hover:bg-[#F1F1F0] transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(uni.id)}
                    title="Delete"
                    className="p-1.5 rounded text-[#EB5757] hover:bg-[#FCE8E6] transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 3-Column Comparison: Pros, Cons, Strategy */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Pros */}
                <div className="p-3.5 rounded bg-[#F0FDF4] border border-[#DCFCE7] text-xs">
                  <div className="font-semibold text-[#166534] flex items-center gap-1.5 mb-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#166534]" />
                    Pros (Strengths & Fit)
                  </div>
                  <p className="text-[#14532D] whitespace-pre-line leading-relaxed">
                    {uni.pros || 'No pros specified.'}
                  </p>
                </div>

                {/* Cons */}
                <div className="p-3.5 rounded bg-[#FEF2F2] border border-[#FEE2E2] text-xs">
                  <div className="font-semibold text-[#991B1B] flex items-center gap-1.5 mb-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#991B1B]" />
                    Cons (Hurdles & Concerns)
                  </div>
                  <p className="text-[#7F1D1D] whitespace-pre-line leading-relaxed">
                    {uni.cons || 'No cons specified.'}
                  </p>
                </div>

                {/* Strategic Notes */}
                <div className="p-3.5 rounded bg-[#FBFAF9] border border-[#EBEBEA] text-xs">
                  <div className="font-semibold text-[#37352F] flex items-center gap-1.5 mb-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#2383E2]" />
                    Strategic Counselor Notes
                  </div>
                  <p className="text-[#5F5E5B] whitespace-pre-line leading-relaxed">
                    {uni.strategic_notes || 'No strategic notes added.'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      <UniversityEditor
        studentId={studentId}
        initialData={editingUni}
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingUni(null);
        }}
      />
    </div>
  );
}

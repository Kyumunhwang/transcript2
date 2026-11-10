import React from 'react';
import Link from 'next/link';
import { Users, Trophy, ArrowUpRight } from 'lucide-react';
import type { StudentClubRow, StudentAwardRow } from '@/types/domain.types';
import { EmptyStateCard } from '@/components/shared/empty-state-card';

export interface ClubAwardListProps {
  clubs: StudentClubRow[];
  awards: StudentAwardRow[];
  studentId: string;
}

export function ClubAwardList({ clubs, awards, studentId }: ClubAwardListProps) {
  const hasNoData = (!clubs || clubs.length === 0) && (!awards || awards.length === 0);

  if (hasNoData) {
    return (
      <EmptyStateCard
        title="No Extracurricular Activities Recorded"
        description="Clubs, leadership roles, and honors/awards have not been logged yet."
        actionLabel="Manage Activities & Honors"
        actionHref={`/students/${studentId}/records`}
        icon={Users}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Clubs & Activities */}
      <div className="bg-white border border-[#E5E5E3] rounded-md p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F1F1F0]">
            <h3 className="text-sm font-semibold text-[#37352F] flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#2383E2]" />
              Clubs & Leadership ({clubs.length})
            </h3>
            <Link
              href={`/students/${studentId}/records`}
              className="text-xs font-medium text-[#2383E2] hover:underline inline-flex items-center gap-0.5"
            >
              Edit <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          {clubs.length === 0 ? (
            <p className="text-xs text-[#787774] py-6 text-center italic">
              No club activities recorded.
            </p>
          ) : (
            <div className="space-y-3">
              {clubs.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded border border-[#EBEBEA] bg-[#FAF9F8]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-semibold text-[#37352F]">
                      {c.club_name}
                    </h4>
                    {c.role_title && (
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-white border border-[#D3D3D0] text-[#37352F] font-medium shrink-0">
                        {c.role_title}
                      </span>
                    )}
                  </div>
                  {c.active_grades && (
                    <span className="text-[11px] text-[#787774] block mt-0.5">
                      Grades: {c.active_grades}
                    </span>
                  )}
                  {c.detailed_description && (
                    <p className="text-xs text-[#5F5E5B] mt-1.5 line-clamp-2 leading-relaxed">
                      {c.detailed_description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Awards & Honors */}
      <div className="bg-white border border-[#E5E5E3] rounded-md p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F1F1F0]">
            <h3 className="text-sm font-semibold text-[#37352F] flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-[#2383E2]" />
              Awards & Honors ({awards.length})
            </h3>
            <Link
              href={`/students/${studentId}/records`}
              className="text-xs font-medium text-[#2383E2] hover:underline inline-flex items-center gap-0.5"
            >
              Edit <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          {awards.length === 0 ? (
            <p className="text-xs text-[#787774] py-6 text-center italic">
              No awards recorded.
            </p>
          ) : (
            <div className="space-y-3">
              {awards.map((a) => (
                <div
                  key={a.id}
                  className="p-3 rounded border border-[#EBEBEA] bg-[#FAF9F8]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-semibold text-[#37352F]">
                      {a.award_title}
                    </h4>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-white border border-[#D3D3D0] text-[#37352F] shrink-0">
                      {a.award_scope}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#787774] mt-0.5">
                    {a.award_date && <span>{a.award_date}</span>}
                    {a.issuing_organization && <span>• {a.issuing_organization}</span>}
                  </div>
                  {a.detailed_description && (
                    <p className="text-xs text-[#5F5E5B] mt-1.5 line-clamp-2 leading-relaxed">
                      {a.detailed_description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

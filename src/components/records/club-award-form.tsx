'use client';

import { useState } from 'react';
import type { StudentClubRow, StudentAwardRow } from '@/types/domain.types';
import {
  upsertStudentClubAction,
  deleteStudentClubAction,
  upsertStudentAwardAction,
  deleteStudentAwardAction,
} from '@/lib/actions/records.actions';
import { Plus, Trash2, Award, Users, CheckCircle2 } from 'lucide-react';

interface ClubAwardFormProps {
  studentId: string;
  initialClubs: StudentClubRow[];
  initialAwards: StudentAwardRow[];
}

export function ClubAwardForm({ studentId, initialClubs, initialAwards }: ClubAwardFormProps) {
  const [clubs, setClubs] = useState<StudentClubRow[]>(initialClubs);
  const [awards, setAwards] = useState<StudentAwardRow[]>(initialAwards);

  // Club Form State
  const [isAddingClub, setIsAddingClub] = useState(false);
  const [clubName, setClubName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [activeGrades, setActiveGrades] = useState('');
  const [clubDesc, setClubDesc] = useState('');
  const [isSubmittingClub, setIsSubmittingClub] = useState(false);

  // Award Form State
  const [isAddingAward, setIsAddingAward] = useState(false);
  const [awardTitle, setAwardTitle] = useState('');
  const [awardScope, setAwardScope] = useState<'INTERNAL' | 'EXTERNAL'>('INTERNAL');
  const [awardRank, setAwardRank] = useState('');
  const [awardDate, setAwardDate] = useState('');
  const [awardDesc, setAwardDesc] = useState('');
  const [isSubmittingAward, setIsSubmittingAward] = useState(false);

  const handleSaveClub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clubName.trim() || !clubDesc.trim()) return;
    setIsSubmittingClub(true);

    const res = await upsertStudentClubAction({
      studentId,
      clubName: clubName.trim(),
      roleTitle: roleTitle.trim() || null,
      activeGrades: activeGrades.trim() || null,
      detailedDescription: clubDesc.trim(),
      displayOrder: clubs.length,
    });

    setIsSubmittingClub(false);
    if (res.success && res.data) {
      const savedClub = res.data;
      setClubs((prev) => [savedClub, ...prev]);
      setClubName('');
      setRoleTitle('');
      setActiveGrades('');
      setClubDesc('');
      setIsAddingClub(false);
    }
  };

  const handleSaveAward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!awardTitle.trim() || !awardDesc.trim()) return;
    setIsSubmittingAward(true);

    const res = await upsertStudentAwardAction({
      studentId,
      awardTitle: awardTitle.trim(),
      awardScope,
      awardRank: awardRank.trim() || null,
      awardDate: awardDate || null,
      detailedDescription: awardDesc.trim(),
    });

    setIsSubmittingAward(false);
    if (res.success && res.data) {
      const savedAward = res.data;
      setAwards((prev) => [savedAward, ...prev]);
      setAwardTitle('');
      setAwardRank('');
      setAwardDate('');
      setAwardDesc('');
      setIsAddingAward(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* 1. Clubs Section */}
      <div className="rounded-md border border-[#E9E9E7] bg-surface p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-brand-primary" />
            <h3 className="text-sm font-semibold text-content-primary">Club Activities</h3>
          </div>
          {!isAddingClub && (
            <button
              type="button"
              onClick={() => setIsAddingClub(true)}
              className="flex items-center gap-1 rounded-sm border border-[#E9E9E7] bg-surface px-2 py-1 text-xs text-content-primary hover:bg-surface-secondary"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Club</span>
            </button>
          )}
        </div>

        {isAddingClub && (
          <form onSubmit={handleSaveClub} className="rounded-md border border-[#E9E9E7] bg-canvas p-3 space-y-2.5">
            <input
              type="text"
              required
              placeholder="Club Name (e.g. Model UN, Robotics)"
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
              className="w-full rounded-md border border-[#E9E9E7] bg-surface p-1.5 text-xs text-content-primary"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Role (e.g. President, Founder)"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                className="rounded-md border border-[#E9E9E7] bg-surface p-1.5 text-xs text-content-primary"
              />
              <input
                type="text"
                placeholder="Grades (e.g. 10th, 11th)"
                value={activeGrades}
                onChange={(e) => setActiveGrades(e.target.value)}
                className="rounded-md border border-[#E9E9E7] bg-surface p-1.5 text-xs text-content-primary"
              />
            </div>
            <textarea
              rows={3}
              required
              placeholder="Detailed description of initiatives, leadership, project contributions..."
              value={clubDesc}
              onChange={(e) => setClubDesc(e.target.value)}
              className="w-full resize-none rounded-md border border-[#E9E9E7] bg-surface p-2 text-xs text-content-primary"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddingClub(false)}
                className="px-2.5 py-1 text-xs text-content-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingClub}
                className="rounded-md bg-brand-primary px-3 py-1 text-xs font-medium text-white hover:bg-brand-hover"
              >
                {isSubmittingClub ? 'Saving...' : 'Save Club'}
              </button>
            </div>
          </form>
        )}

        <div className="divide-y divide-[#F1F1F0]">
          {clubs.length === 0 ? (
            <p className="py-4 text-center text-xs text-content-muted">No club activities recorded.</p>
          ) : (
            clubs.map((club) => (
              <div key={club.id} className="py-2.5 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-content-primary">{club.club_name}</span>
                    {club.role_title && (
                      <span className="rounded-sm bg-[#F1F1F0] px-1.5 py-0.2 text-[10px] text-content-secondary">
                        {club.role_title}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-content-secondary whitespace-pre-wrap">{club.detailed_description}</p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    if (confirm('Delete this club record?')) {
                      await deleteStudentClubAction(club.id, studentId);
                      setClubs((prev) => prev.filter((c) => c.id !== club.id));
                    }
                  }}
                  className="rounded-sm p-1 text-content-muted hover:text-semantic-danger"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 2. Awards Section */}
      <div className="rounded-md border border-[#E9E9E7] bg-surface p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-brand-primary" />
            <h3 className="text-sm font-semibold text-content-primary">Honors & Awards</h3>
          </div>
          {!isAddingAward && (
            <button
              type="button"
              onClick={() => setIsAddingAward(true)}
              className="flex items-center gap-1 rounded-sm border border-[#E9E9E7] bg-surface px-2 py-1 text-xs text-content-primary hover:bg-surface-secondary"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Award</span>
            </button>
          )}
        </div>

        {isAddingAward && (
          <form onSubmit={handleSaveAward} className="rounded-md border border-[#E9E9E7] bg-canvas p-3 space-y-2.5">
            <input
              type="text"
              required
              placeholder="Award Title (e.g. AMC 12 Distinction)"
              value={awardTitle}
              onChange={(e) => setAwardTitle(e.target.value)}
              className="w-full rounded-md border border-[#E9E9E7] bg-surface p-1.5 text-xs text-content-primary"
            />
            <div className="grid grid-cols-3 gap-2">
              <select
                value={awardScope}
                onChange={(e) => setAwardScope(e.target.value as 'INTERNAL' | 'EXTERNAL')}
                className="rounded-md border border-[#E9E9E7] bg-surface p-1.5 text-xs text-content-primary"
              >
                <option value="INTERNAL">Internal</option>
                <option value="EXTERNAL">External</option>
              </select>
              <input
                type="text"
                placeholder="Rank (e.g. 1st Place)"
                value={awardRank}
                onChange={(e) => setAwardRank(e.target.value)}
                className="rounded-md border border-[#E9E9E7] bg-surface p-1.5 text-xs text-content-primary"
              />
              <input
                type="date"
                value={awardDate}
                onChange={(e) => setAwardDate(e.target.value)}
                className="rounded-md border border-[#E9E9E7] bg-surface p-1.5 text-xs text-content-primary"
              />
            </div>
            <textarea
              rows={3}
              required
              placeholder="Context, selective rate, significance of the award..."
              value={awardDesc}
              onChange={(e) => setAwardDesc(e.target.value)}
              className="w-full resize-none rounded-md border border-[#E9E9E7] bg-surface p-2 text-xs text-content-primary"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddingAward(false)}
                className="px-2.5 py-1 text-xs text-content-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingAward}
                className="rounded-md bg-brand-primary px-3 py-1 text-xs font-medium text-white hover:bg-brand-hover"
              >
                {isSubmittingAward ? 'Saving...' : 'Save Award'}
              </button>
            </div>
          </form>
        )}

        <div className="divide-y divide-[#F1F1F0]">
          {awards.length === 0 ? (
            <p className="py-4 text-center text-xs text-content-muted">No honors or awards recorded.</p>
          ) : (
            awards.map((award) => (
              <div key={award.id} className="py-2.5 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-content-primary">{award.award_title}</span>
                    <span className="rounded-sm bg-brand-subtle px-1.5 py-0.2 text-[10px] font-medium text-brand-primary">
                      {award.award_scope}
                    </span>
                    {award.award_rank && <span className="text-xs text-content-secondary">({award.award_rank})</span>}
                  </div>
                  <p className="mt-1 text-xs text-content-secondary whitespace-pre-wrap">{award.detailed_description}</p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    if (confirm('Delete this award record?')) {
                      await deleteStudentAwardAction(award.id, studentId);
                      setAwards((prev) => prev.filter((a) => a.id !== award.id));
                    }
                  }}
                  className="rounded-sm p-1 text-content-muted hover:text-semantic-danger"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

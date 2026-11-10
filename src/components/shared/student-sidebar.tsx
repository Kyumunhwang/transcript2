'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, UploadCloud, Users, GraduationCap, X, Plus } from 'lucide-react';
import { usePortalStore } from '@/stores/use-portal-store';
import { getStudentsAction } from '@/lib/actions/student.actions';
import { StudentCreateModal } from './student-create-modal';
import type { StudentRow } from '@/types/domain.types';
import { cn, formatGpa } from '@/lib/utils';

interface StudentSidebarProps {
  initialStudents?: StudentRow[];
}

const GRADE_OPTIONS = [
  { label: 'All', value: null },
  { label: '12th', value: 12 },
  { label: '11th', value: 11 },
  { label: '10th', value: 10 },
  { label: '9th', value: 9 },
];

export function StudentSidebar({ initialStudents = [] }: StudentSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const {
    isSidebarOpen,
    setSidebarOpen,
    selectedGrade,
    searchQuery,
    setSelectedGrade,
    setSearchQuery,
  } = usePortalStore();

  const [students, setStudents] = useState<StudentRow[]>(initialStudents);
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    startTransition(async () => {
      const res = await getStudentsAction({
        gradeLevel: selectedGrade,
        search: debouncedQuery,
      });
      if (res.success && res.data) {
        setStudents(res.data);
      }
    });
  }, [selectedGrade, debouncedQuery]);

  function handleSelectStudent(studentId: string) {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
    router.push(`/students/${studentId}`);
  }

  return (
    <aside
      aria-label="Student Directory"
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex h-full w-64 flex-col border-r border-[#E9E9E7] bg-surface-secondary text-content-primary transition-transform duration-200 md:static md:translate-x-0 shadow-lg md:shadow-none',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      {/* Header & Logo */}
      <div className="flex h-14 items-center justify-between border-b border-[#E9E9E7] px-4">
        <Link href="/" className="flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-brand-primary rounded">
          <GraduationCap className="h-5 w-5 text-brand-primary" />
          <span className="text-sm font-semibold tracking-tight text-content-primary">
            Lighthouse Portal
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
          className="flex md:hidden p-1.5 rounded text-content-muted hover:bg-[#E3E2E0] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Grade Filters */}
      <div className="border-b border-[#E9E9E7] p-3">
        <div className="flex items-center gap-1" role="group" aria-label="Grade Filter">
          {GRADE_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => setSelectedGrade(opt.value)}
              className={cn(
                'flex-1 rounded-sm py-1.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-brand-primary',
                selectedGrade === opt.value
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'text-content-secondary hover:bg-[#E3E2E0]'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-content-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student or code..."
            aria-label="Search students by name or student code"
            className="w-full rounded-md border border-[#E9E9E7] bg-surface py-1.5 pl-8 pr-3 text-xs text-content-primary placeholder:text-content-muted focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
          />
        </div>
      </div>

      {/* Student List */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="mb-1 flex items-center justify-between px-2 text-[11px] font-medium text-content-muted">
          <span>STUDENTS ({students.length})</span>
          <div className="flex items-center gap-1">
            {isPending && <span className="animate-pulse">Loading...</span>}
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              aria-label="Add new student"
              title="Add New Student"
              className="p-1 rounded text-content-secondary hover:bg-[#E3E2E0] hover:text-content-primary transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-brand-primary" />
            </button>
          </div>
        </div>

        {students.length === 0 ? (
          <div className="py-8 text-center text-xs text-content-muted">
            <Users className="mx-auto mb-2 h-6 w-6 opacity-40" />
            No matching students.
          </div>
        ) : (
          <nav className="space-y-0.5">
            {students.map((student) => {
              const isActive = pathname.startsWith(`/students/${student.id}`);
              return (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => handleSelectStudent(student.id)}
                  className={cn(
                    'w-full text-left rounded-md px-2.5 py-2.5 text-xs transition-colors min-h-[44px] flex flex-col justify-center focus-visible:ring-2 focus-visible:ring-brand-primary',
                    isActive
                      ? 'bg-brand-subtle text-brand-primary font-medium'
                      : 'hover:bg-[#EAEAEA] text-content-primary'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate font-medium">{student.name_ko}</span>
                    <span className="rounded-sm bg-white/70 px-1.5 py-0.5 text-[10px] text-content-secondary">
                      Gr.{student.grade_level}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between text-[11px] text-content-muted">
                    <span className="truncate">{student.name_en || student.student_code}</span>
                    <span>GPA {formatGpa(student.cumulative_gpa_weighted)}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="border-t border-[#E9E9E7] p-2">
        <Link
          href="/transcript-upload"
          onClick={() => {
            if (typeof window !== 'undefined' && window.innerWidth < 768) {
              setSidebarOpen(false);
            }
          }}
          className={cn(
            'flex w-full items-center gap-2 rounded-md px-2.5 py-2.5 text-xs font-medium text-content-secondary transition-colors hover:bg-[#EAEAEA] min-h-[44px]',
            pathname === '/transcript-upload' && 'bg-brand-subtle text-brand-primary'
          )}
        >
          <UploadCloud className="h-4 w-4" />
          <span>Upload Transcripts</span>
        </Link>
      </div>

      {/* Student Registration Modal */}
      <StudentCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={(newStudent) => {
          setStudents((prev) => [newStudent, ...prev]);
          handleSelectStudent(newStudent.id);
        }}
      />
    </aside>
  );
}

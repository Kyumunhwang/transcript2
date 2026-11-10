'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, MessageSquare, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StudentNavigationTabsProps {
  studentId: string;
}

export function StudentNavigationTabs({ studentId }: StudentNavigationTabsProps) {
  const pathname = usePathname();

  const tabs = [
    {
      label: 'Overview Dashboard',
      href: `/students/${studentId}`,
      icon: LayoutDashboard,
      isActive: pathname === `/students/${studentId}`,
    },
    {
      label: 'Academic & Activities',
      href: `/students/${studentId}/records`,
      icon: BookOpen,
      isActive: pathname === `/students/${studentId}/records`,
    },
    {
      label: '1:1 Counseling',
      href: `/students/${studentId}/counseling`,
      icon: MessageSquare,
      isActive: pathname === `/students/${studentId}/counseling`,
    },
    {
      label: 'Target Universities',
      href: `/students/${studentId}/universities`,
      icon: GraduationCap,
      isActive: pathname === `/students/${studentId}/universities`,
    },
  ];

  return (
    <nav
      aria-label="Student Workspace Tabs"
      className="flex items-center gap-1 overflow-x-auto border-b border-[#E9E9E7] no-scrollbar"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={tab.isActive ? 'page' : undefined}
            className={cn(
              'flex items-center gap-2 border-b-2 px-3.5 py-3 text-xs font-medium transition-colors whitespace-nowrap min-h-[44px] focus-visible:ring-2 focus-visible:ring-brand-primary outline-none',
              tab.isActive
                ? 'border-brand-primary text-brand-primary font-semibold'
                : 'border-transparent text-content-secondary hover:border-[#D3D1CB] hover:text-content-primary'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

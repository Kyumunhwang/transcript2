'use client';

import React from 'react';
import { Menu, User, LogOut } from 'lucide-react';
import { usePortalStore } from '@/stores/use-portal-store';

export interface PortalHeaderProps {
  userEmail?: string | null;
  onSignOut: () => Promise<void>;
}

export function PortalHeader({ userEmail, onSignOut }: PortalHeaderProps) {
  const { toggleSidebar, isSidebarOpen, setSidebarOpen } = usePortalStore();

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/30 backdrop-blur-[1px] z-30 md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Global Navigation Header */}
      <header className="flex h-14 items-center justify-between border-b border-[#E9E9E7] bg-white px-4 md:px-6 z-20 shrink-0">
        <div className="flex items-center gap-3">
          {/* Hamburger toggle button for mobile */}
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Toggle navigation sidebar"
            className="flex items-center justify-center w-9 h-9 rounded-md text-[#787774] hover:bg-[#F1F1F0] md:hidden focus-visible:ring-2 focus-visible:ring-[#2383E2]"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="text-xs font-semibold text-[#37352F] tracking-tight">
            Lighthouse College Counseling Workspace
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-[#787774]">
            <User className="h-3.5 w-3.5 text-[#9B9A97]" />
            <span className="hidden sm:inline">{userEmail ?? 'Counselor'}</span>
          </div>

          <form action={onSignOut}>
            <button
              type="submit"
              aria-label="Sign out"
              className="flex items-center gap-1.5 rounded border border-[#E0E0DE] bg-white px-2.5 py-1 text-xs text-[#787774] transition-colors hover:bg-[#F1F1F0] hover:text-[#37352F] focus-visible:ring-2 focus-visible:ring-[#2383E2]"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </form>
        </div>
      </header>
    </>
  );
}

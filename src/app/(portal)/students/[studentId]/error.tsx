'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Users } from 'lucide-react';
import Link from 'next/link';

export default function StudentWorkspaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Student workspace error caught:', error);
  }, [error]);

  return (
    <div className="bg-white border border-[#E5E5E3] rounded-md p-8 text-center shadow-xs">
      <div className="w-10 h-10 rounded-full bg-[#FCE8E6] text-[#EB5757] flex items-center justify-center mx-auto mb-3">
        <AlertTriangle className="w-5 h-5" />
      </div>

      <h3 className="text-sm font-bold text-[#37352F] mb-1">
        Failed to load student record
      </h3>

      <p className="text-xs text-[#787774] max-w-md mx-auto mb-5 leading-relaxed">
        Could not retrieve student portfolio data from the database. This may be due to an active session timeout or temporary network disconnection.
      </p>

      {error.message && (
        <div className="p-2 mb-5 text-left rounded bg-[#FAF9F8] border border-[#EBEBEA] text-[11px] font-mono text-[#5F5E5B] max-w-sm mx-auto overflow-x-auto">
          {error.message}
        </div>
      )}

      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => reset()}
          className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#37352F] hover:bg-[#2F2E2A] rounded transition-colors inline-flex items-center gap-1.5 shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
        <Link
          href="/"
          className="px-3.5 py-1.5 text-xs font-medium text-[#37352F] bg-white border border-[#D3D3D0] hover:bg-[#F1F1F0] rounded transition-colors inline-flex items-center gap-1.5"
        >
          <Users className="w-3.5 h-3.5" />
          Select Another Student
        </Link>
      </div>
    </div>
  );
}

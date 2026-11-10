'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected client error
    console.error('Portal Global Error Boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="bg-white border border-[#E5E5E3] rounded-lg p-8 max-w-md w-full text-center shadow-sm">
        <div className="w-12 h-12 rounded-full bg-[#FCE8E6] text-[#EB5757] flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>

        <h3 className="text-base font-bold text-[#37352F] mb-2">
          Something went wrong
        </h3>

        <p className="text-xs text-[#787774] mb-6 leading-relaxed">
          An unexpected error occurred while loading the counselor portal workspace.
          Please try again or return to the main dashboard.
        </p>

        {error.message && (
          <div className="p-2.5 mb-6 text-left rounded bg-[#FBFAF9] border border-[#EAEAE8] text-[11px] font-mono text-[#5F5E5B] overflow-x-auto max-h-24">
            {error.message}
          </div>
        )}

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="px-4 py-2 text-xs font-medium text-white bg-[#37352F] hover:bg-[#2F2E2A] rounded transition-colors inline-flex items-center gap-1.5 shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Try Again
          </button>
          <Link
            href="/"
            className="px-4 py-2 text-xs font-medium text-[#37352F] bg-white border border-[#D3D3D0] hover:bg-[#F1F1F0] rounded transition-colors inline-flex items-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5" />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}

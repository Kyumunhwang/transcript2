import React from 'react';

export default function PortalLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-pulse">
      {/* Top Header Skeleton */}
      <div className="bg-white border border-[#E5E5E3] rounded-md p-5 shadow-xs">
        <div className="h-6 w-48 bg-[#F1F1F0] rounded mb-2" />
        <div className="h-4 w-80 bg-[#F1F1F0] rounded" />
      </div>

      {/* Main Content Area Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-48 bg-white border border-[#E5E5E3] rounded-md p-4 space-y-3">
          <div className="h-4 w-28 bg-[#F1F1F0] rounded" />
          <div className="h-8 w-20 bg-[#F1F1F0] rounded" />
          <div className="h-4 w-40 bg-[#F1F1F0] rounded" />
        </div>
        <div className="h-48 bg-white border border-[#E5E5E3] rounded-md p-4 space-y-3">
          <div className="h-4 w-28 bg-[#F1F1F0] rounded" />
          <div className="h-8 w-20 bg-[#F1F1F0] rounded" />
          <div className="h-4 w-40 bg-[#F1F1F0] rounded" />
        </div>
        <div className="h-48 bg-white border border-[#E5E5E3] rounded-md p-4 space-y-3">
          <div className="h-4 w-28 bg-[#F1F1F0] rounded" />
          <div className="h-8 w-20 bg-[#F1F1F0] rounded" />
          <div className="h-4 w-40 bg-[#F1F1F0] rounded" />
        </div>
      </div>
    </div>
  );
}

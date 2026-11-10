import React from 'react';

export default function StudentDetailLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Metrics Bar Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-[#E5E5E3] rounded-md p-4 space-y-2">
            <div className="h-3 w-24 bg-[#F1F1F0] rounded" />
            <div className="h-7 w-16 bg-[#F1F1F0] rounded" />
            <div className="h-2.5 w-20 bg-[#F1F1F0] rounded" />
          </div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="bg-white border border-[#E5E5E3] rounded-md p-5 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-[#F1F1F0]">
          <div className="h-4 w-40 bg-[#F1F1F0] rounded" />
          <div className="h-4 w-24 bg-[#F1F1F0] rounded" />
        </div>
        <div className="h-56 bg-[#FBFAF9] rounded flex items-center justify-center">
          <div className="h-8 w-32 bg-[#F1F1F0] rounded" />
        </div>
      </div>

      {/* 2-Column Feed Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-[#E5E5E3] rounded-md p-5 space-y-3">
          <div className="h-4 w-32 bg-[#F1F1F0] rounded" />
          <div className="h-16 bg-[#FBFAF9] rounded" />
          <div className="h-16 bg-[#FBFAF9] rounded" />
        </div>
        <div className="bg-white border border-[#E5E5E3] rounded-md p-5 space-y-3">
          <div className="h-4 w-32 bg-[#F1F1F0] rounded" />
          <div className="h-16 bg-[#FBFAF9] rounded" />
          <div className="h-16 bg-[#FBFAF9] rounded" />
        </div>
      </div>
    </div>
  );
}

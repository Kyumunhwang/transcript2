import React from 'react';
import Link from 'next/link';
import { FileQuestion } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EmptyStateCardProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export function EmptyStateCard({
  title,
  description,
  actionLabel,
  actionHref,
  icon: Icon = FileQuestion,
  className,
}: EmptyStateCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-md border border-dashed border-[#E0E0DE] bg-[#FBFAF9]',
        className
      )}
    >
      <div className="w-10 h-10 rounded-full bg-[#F1F1F0] flex items-center justify-center text-[#787774] mb-3">
        <Icon className="w-5 h-5" />
      </div>
      <h4 className="text-sm font-semibold text-[#37352F] mb-1">{title}</h4>
      <p className="text-xs text-[#787774] max-w-sm mb-4 leading-relaxed">
        {description}
      </p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-[#37352F] bg-white border border-[#D3D3D0] rounded hover:bg-[#F7F6F5] transition-colors shadow-xs"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

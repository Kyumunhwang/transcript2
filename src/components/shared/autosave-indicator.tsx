import React from 'react';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import type { AutosaveStatus } from '@/hooks/use-autosave';
import { cn } from '@/lib/utils';

export interface AutosaveIndicatorProps {
  status: AutosaveStatus;
  lastSavedAt?: Date | null;
  className?: string;
}

export function AutosaveIndicator({
  status,
  lastSavedAt,
  className,
}: AutosaveIndicatorProps) {
  if (status === 'saving') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 text-[11px] text-[#787774]',
          className
        )}
      >
        <Loader2 className="w-3 h-3 animate-spin text-[#2383E2]" />
        Saving draft...
      </span>
    );
  }

  if (status === 'saved') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 text-[11px] text-[#0F7B6C]',
          className
        )}
        title={lastSavedAt ? `Saved at ${lastSavedAt.toLocaleTimeString()}` : 'Saved'}
      >
        <Check className="w-3 h-3 text-[#0F7B6C]" />
        Draft saved
      </span>
    );
  }

  if (status === 'error') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 text-[11px] text-[#EB5757]',
          className
        )}
      >
        <AlertCircle className="w-3 h-3 text-[#EB5757]" />
        Save failed
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[11px] text-[#9B9A97]',
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#D3D3D0]" />
      Auto-backup active
    </span>
  );
}

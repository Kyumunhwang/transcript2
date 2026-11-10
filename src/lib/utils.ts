import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatGpa(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '-';
  }
  return value.toFixed(2);
}

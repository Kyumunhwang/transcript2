import Link from 'next/link';
import { Users, UploadCloud } from 'lucide-react';

export default function PortalHomePage() {
  return (
    <div className="flex h-full min-h-[400px] flex-col items-center justify-center text-center">
      <div className="max-w-md rounded-md border border-[#E9E9E7] bg-surface p-8 shadow-xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-subtle text-brand-primary">
          <Users className="h-6 w-6" />
        </div>

        <h2 className="mt-4 text-base font-semibold text-content-primary">
          No Student Selected
        </h2>
        <p className="mt-1.5 text-xs leading-relaxed text-content-secondary">
          Please select a student from the sidebar navigation to inspect academic
          GPA, standardized test scores, activity records, and 1:1 counseling logs.
        </p>

        <div className="mt-6 border-t border-[#F1F1F0] pt-4">
          <Link
            href="/transcript-upload"
            className="inline-flex items-center gap-1.5 rounded-md bg-brand-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-hover"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Upload Gradelink PDF</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

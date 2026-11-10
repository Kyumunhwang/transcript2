import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Lighthouse Counseling Portal',
  description: 'College Counseling and Academic Portal for Lighthouse Education Community',
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-canvas text-content-primary antialiased">
        {children}
      </body>
    </html>
  );
}

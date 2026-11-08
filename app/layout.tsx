import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'InkPath — Autonomous AI Manhwa & Learning Engine',
  description: 'Transform complex textbooks, lecture transcripts, and research papers into serialized, full-color Korean manhwa with pedagogical precision.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-text-primary antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}

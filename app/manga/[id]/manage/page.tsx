'use client';

import React from 'react';
import { StudioShell } from '@/components/layout/StudioShell';
import { DEMO_MANGA } from '@/lib/mock-data/quantum-hunter';
import { Layers, BookOpen, Plus, RefreshCw, CheckCircle2, Lock } from 'lucide-react';
import Link from 'next/link';

export default function StoryChapterManagementPage() {
  const chapters = [
    {
      id: 'ch-01',
      chapterNumber: 1,
      title: 'Schrödinger’s Abyss',
      status: 'published',
      totalPanels: 6,
      progressPercentage: 100,
      objective: 'Master quantum state superposition & collapse',
      isUnlocked: true,
    },
    {
      id: 'ch-02',
      chapterNumber: 2,
      title: 'Wavepacket Dispersion',
      status: 'published',
      totalPanels: 6,
      progressPercentage: 100,
      objective: 'Derive Heisenberg uncertainty relation in battle',
      isUnlocked: true,
    },
    {
      id: 'ch-03',
      chapterNumber: 3,
      title: 'The Decoherence Breach',
      status: 'draft',
      totalPanels: 6,
      progressPercentage: 0,
      objective: 'Unitary Hamiltonian time evolution',
      isUnlocked: false,
    },
  ];

  return (
    <StudioShell>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-manga-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-manga-violet/20 text-manga-accent border border-manga-violet/30 font-bold">
                Story Studio Management
              </span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl text-text-primary mt-1">
              {DEMO_MANGA.title}
            </h1>
          </div>

          <Link
            href="/create"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-manga-violet text-white text-xs font-semibold hover:brightness-110 shadow-glow-violet"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Next Chapter</span>
          </Link>
        </div>

        <div className="space-y-4">
          {chapters.map((ch) => (
            <div
              key={ch.id}
              className="p-5 rounded-2xl border border-manga-border bg-background-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg hover:border-manga-borderHighlight transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-manga-accent font-bold">
                    Chapter 0{ch.chapterNumber}
                  </span>
                  {ch.status === 'published' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      Ready to Read
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      <Lock className="w-3 h-3" />
                      Quiz Gated (Unlock via Ch. 2 Quiz)
                    </span>
                  )}
                </div>

                <h3 className="font-heading font-bold text-base text-text-primary">
                  {ch.title}
                </h3>
                <p className="text-xs text-text-muted">
                  Pedagogical Objective: {ch.objective}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/read/quantum-hunter/${ch.id}`}
                  className="px-4 py-2 rounded-xl bg-manga-violet text-white text-xs font-semibold hover:brightness-110 shadow-glow-violet flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Open Reader</span>
                </Link>

                <Link
                  href={`/quiz/${ch.id}`}
                  className="px-3 py-2 rounded-xl bg-background-surface border border-manga-border hover:border-manga-violet text-xs text-text-secondary hover:text-text-primary"
                >
                  Concept Quiz
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </StudioShell>
  );
}

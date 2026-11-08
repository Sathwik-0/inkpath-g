'use client';

import React from 'react';
import { StudioShell } from '@/components/layout/StudioShell';
import { 
  Sparkles, 
  BookOpen, 
  Trophy, 
  Flame, 
  ArrowRight, 
  Layers, 
  Clock,
  Bookmark
} from 'lucide-react';
import Link from 'next/link';
import { DEMO_MANGA } from '@/lib/mock-data/quantum-hunter';

export default function DashboardPage() {
  return (
    <StudioShell>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Welcome Banner */}
        <div className="relative rounded-2xl bg-gradient-to-r from-background-card via-background-card to-manga-violet/20 border border-manga-border p-6 sm:p-8 overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-manga-violet/20 border border-manga-violet/30 text-[11px] font-mono text-manga-accent">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Level 12 Lorekeeper • 3,420 XP</span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-text-primary">
              Welcome back, Ren.
            </h1>
            <p className="text-xs text-text-secondary leading-relaxed">
              Your next chapter of <strong className="text-text-primary">The Quantum Hunter</strong> is waiting. You are 1 concept battle away from unlocking the Chapter 02 Wavepacket Dispersion relic.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <Link
                href="/read/quantum-hunter/ch-01"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-manga-violet to-manga-indigo text-white text-xs font-semibold shadow-glow-violet hover:brightness-110 transition-all flex items-center gap-1.5"
              >
                <BookOpen className="w-4 h-4" />
                <span>Resume Chapter 01</span>
              </Link>
              <Link
                href="/create"
                className="px-4 py-2.5 rounded-xl bg-background-surface border border-manga-border text-text-secondary hover:text-text-primary text-xs font-medium"
              >
                + New Manga
              </Link>
            </div>
          </div>
        </div>

        {/* Learning Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-background-card border border-manga-border">
            <span className="text-[10px] font-mono text-text-muted">SERIES ACTIVE</span>
            <p className="text-2xl font-bold font-heading text-text-primary mt-1">2</p>
          </div>
          <div className="p-4 rounded-xl bg-background-card border border-manga-border">
            <span className="text-[10px] font-mono text-text-muted">CONCEPTS MASTERED</span>
            <p className="text-2xl font-bold font-heading text-manga-cyan mt-1">18</p>
          </div>
          <div className="p-4 rounded-xl bg-background-card border border-manga-border">
            <span className="text-[10px] font-mono text-text-muted">FREE ALLOWANCE</span>
            <p className="text-2xl font-bold font-heading text-emerald-400 mt-1">3 / 3</p>
          </div>
          <div className="p-4 rounded-xl bg-background-card border border-manga-border">
            <span className="text-[10px] font-mono text-text-muted">MASTERY STREAK</span>
            <p className="text-2xl font-bold font-heading text-amber-400 mt-1">5 Days</p>
          </div>
        </div>

        {/* Continue Reading Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-base text-text-primary">
              Continue Reading
            </h2>
            <Link href="/library" className="text-xs text-manga-cyan hover:underline">
              View All in Library →
            </Link>
          </div>

          <div className="rounded-2xl border border-manga-border bg-background-card p-4 sm:p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={DEMO_MANGA.coverImageUrl}
              alt={DEMO_MANGA.title}
              className="w-24 h-32 rounded-xl object-cover flex-shrink-0 shadow-lg border border-manga-border"
            />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-manga-violet/20 text-manga-accent">
                  {DEMO_MANGA.curriculumCode}
                </span>
                <span className="text-[10px] font-mono text-text-muted">
                  {DEMO_MANGA.academicField}
                </span>
              </div>
              <h3 className="font-heading font-bold text-base text-text-primary">
                {DEMO_MANGA.title}
              </h3>
              <p className="text-xs text-text-muted line-clamp-2">
                {DEMO_MANGA.synopsis}
              </p>
              <div className="flex items-center gap-3 pt-1">
                <Link
                  href="/read/quantum-hunter/ch-01"
                  className="px-4 py-1.5 rounded-lg bg-manga-violet text-white text-xs font-semibold hover:brightness-110 shadow-glow-violet"
                >
                  Read Chapter 01
                </Link>
                <Link
                  href="/manga/quantum-hunter/characters"
                  className="px-3 py-1.5 rounded-lg bg-background-surface border border-manga-border text-text-secondary hover:text-text-primary text-xs"
                >
                  Character Bible
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudioShell>
  );
}

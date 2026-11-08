'use client';

import React from 'react';
import { StudioShell } from '@/components/layout/StudioShell';
import { Compass, BookOpen, Sparkles, Filter } from 'lucide-react';
import Link from 'next/link';
import { DEMO_MANGA } from '@/lib/mock-data/quantum-hunter';

export default function ExploreMangaPage() {
  const exploreSeries = [
    DEMO_MANGA,
    {
      id: '00000000-0000-0000-0000-000000000002',
      title: 'Neural Blade: The Deep Learning',
      slug: 'neural-blade',
      synopsis: 'A cybernetic mercenary navigates gradient descent manifolds and transformer attention mechanisms in the neon alleys of Neo-Tokyo.',
      genre: 'cyberpunk',
      academicField: 'Computer Science & AI',
      curriculumCode: 'CS 229',
      coverImageUrl: '/assets/covers/neural-blade.png',
      bannerImageUrl: '/assets/scenes/neo-seoul.png',
      totalChapters: 4,
    },
  ];

  return (
    <StudioShell>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-manga-border pb-4">
          <div>
            <h1 className="font-heading font-extrabold text-2xl text-text-primary">
              Explore Educational Manhwa
            </h1>
            <p className="text-xs text-text-muted mt-0.5">
              Verified curriculum series featuring interactive LaTeX derivations and concept boss battles
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {exploreSeries.map((manga) => (
            <div
              key={manga.id}
              className="rounded-2xl border border-manga-border bg-background-card overflow-hidden shadow-xl hover:border-manga-borderHighlight transition-all flex flex-col group"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={manga.coverImageUrl}
                  alt={manga.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-background/80 backdrop-blur-md text-manga-accent border border-white/10">
                    {manga.curriculumCode}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-background/80 backdrop-blur-md text-manga-cyan border border-white/10 uppercase">
                    {manga.genre}
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-heading font-bold text-sm text-text-primary line-clamp-1">
                    {manga.title}
                  </h3>
                  <p className="text-[11px] text-text-muted line-clamp-2 mt-1">
                    {manga.synopsis}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-manga-border">
                  <span className="text-[10px] font-mono text-text-muted">
                    {manga.totalChapters} Chapters
                  </span>
                  <Link
                    href={`/read/${manga.slug}/ch-01`}
                    className="px-3.5 py-1.5 rounded-lg bg-manga-violet text-white text-xs font-semibold hover:brightness-110 shadow-glow-violet flex items-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Read Demo</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </StudioShell>
  );
}

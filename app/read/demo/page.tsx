'use client';

import React from 'react';
import { WebtoonReader } from '@/components/reader/WebtoonReader';
import { DEMO_MANGA, DEMO_PANELS } from '@/lib/mock-data/quantum-hunter';

export default function DemoReaderPage() {
  return (
    <WebtoonReader
      mangaId="demo"
      chapterId="ch-01"
      title="THE AGE OF INTELLIGENCE: Quantum Origins"
      chapterTitle="Chapter 01: Wavepacket Genesis"
      chapterNumber={1}
      totalChapters={3}
      panels={DEMO_PANELS}
      freeChaptersLeft={3}
    />
  );
}

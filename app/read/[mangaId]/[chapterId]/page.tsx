'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { WebtoonReader } from '@/components/reader/WebtoonReader';
import { DEMO_MANGA, DEMO_PANELS } from '@/lib/mock-data/quantum-hunter';

export default function ReaderPage() {
  const params = useParams();
  const mangaId = (params?.mangaId as string) || 'quantum-hunter';
  const chapterId = (params?.chapterId as string) || 'ch-01';

  return (
    <WebtoonReader
      mangaId={mangaId}
      chapterId={chapterId}
      title={DEMO_MANGA.title}
      chapterTitle="Chapter 01: Wavepacket Genesis"
      chapterNumber={1}
      totalChapters={3}
      panels={DEMO_PANELS}
      freeChaptersLeft={3}
    />
  );
}

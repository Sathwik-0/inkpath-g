'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { WebtoonReader } from '@/components/reader/WebtoonReader';
import { DEMO_MANGA, DEMO_PANELS } from '@/lib/mock-data/quantum-hunter';
import { RefreshCw } from 'lucide-react';

export default function ReaderPage() {
  const params = useParams();
  const mangaId = (params?.mangaId as string) || 'quantum-hunter';
  const chapterId = (params?.chapterId as string) || 'ch-01';

  const [loading, setLoading] = useState(true);
  const [chapterData, setChapterData] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadChapter() {
      try {
        // First check localStorage in case this chapter was just generated in the session
        const stored = typeof window !== 'undefined' ? localStorage.getItem(`inkpath_chapter_${chapterId}`) : null;
        if (stored) {
          const parsed = JSON.parse(stored);
          if (isMounted) {
            setChapterData(parsed);
            setLoading(false);
            return;
          }
        }

        // Fetch from API
        const res = await fetch(`/api/manga/${mangaId}/chapters/${chapterId}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setChapterData(data);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.warn('Failed to load dynamic chapter, using fallback:', e);
      }

      if (isMounted) {
        setChapterData({
          mangaId,
          chapterId,
          title: DEMO_MANGA.title,
          chapterTitle: 'Chapter 01: Wavepacket Genesis',
          chapterNumber: 1,
          totalChapters: 3,
          panels: DEMO_PANELS,
          freeChaptersLeft: 3,
        });
        setLoading(false);
      }
    }

    loadChapter();

    return () => {
      isMounted = false;
    };
  }, [mangaId, chapterId]);

  if (loading || !chapterData) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 text-manga-violet animate-spin" />
        <p className="text-xs font-mono text-text-muted uppercase tracking-wider">
          Rendering Manhwa Webtoon Stream...
        </p>
      </div>
    );
  }

  return (
    <WebtoonReader
      mangaId={mangaId}
      chapterId={chapterId}
      title={chapterData.title}
      chapterTitle={chapterData.chapterTitle}
      chapterNumber={chapterData.chapterNumber}
      totalChapters={chapterData.totalChapters}
      panels={chapterData.panels}
      freeChaptersLeft={chapterData.freeChaptersLeft ?? 3}
    />
  );
}

'use client';

import React from 'react';
import { StudioShell } from '@/components/layout/StudioShell';
import { QuizBossBattle } from '@/components/quiz/QuizBossBattle';
import { DEMO_QUIZ } from '@/lib/mock-data/quantum-hunter';
import { useParams } from 'next/navigation';

export default function QuizPage() {
  const params = useParams();
  const chapterId = (params?.chapterId as string) || 'ch-01';

  const handleComplete = async (score: number) => {
    try {
      await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterId,
          score,
          passed: score >= 1,
        }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <StudioShell>
      <div className="py-6">
        <QuizBossBattle
          bossName={DEMO_QUIZ.bossName}
          bossMaxHp={DEMO_QUIZ.bossMaxHp}
          chapterNumber={1}
          questions={DEMO_QUIZ.questions}
          onComplete={handleComplete}
        />
      </div>
    </StudioShell>
  );
}

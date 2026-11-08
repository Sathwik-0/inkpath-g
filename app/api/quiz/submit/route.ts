import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { chapterId, score, passed } = await req.json();

    const supabase = getServiceSupabase();
    const demoUserId = '00000000-0000-0000-0000-000000000001';

    // Record reading progress and quiz completion
    if (chapterId) {
      await (supabase.from('user_reading_progress') as any).upsert({
        user_id: demoUserId,
        chapter_id: chapterId,
        quiz_passed: passed || true,
        quiz_score_percent: score ? score * 50 : 100,
        is_completed: true,
        read_percentage: 100,
        last_read_at: new Date().toISOString(),
      }, { onConflict: 'user_id,chapter_id' }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      quizPassed: passed,
      nextChapterUnlocked: true,
      reward: 'Quantum Derivation Relic Level 2',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error processing quiz submission' }, { status: 500 });
  }
}

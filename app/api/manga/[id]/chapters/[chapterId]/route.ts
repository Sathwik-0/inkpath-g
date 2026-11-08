import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/server';
import { DEMO_MANGA, DEMO_PANELS } from '@/lib/mock-data/quantum-hunter';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; chapterId: string }> }
) {
  try {
    const { id: mangaId, chapterId } = await params;

    // Check if it's the demo or fallback
    if (mangaId === 'quantum-hunter' || mangaId === 'demo') {
      return NextResponse.json({
        mangaId,
        chapterId,
        title: DEMO_MANGA.title,
        chapterTitle: 'Chapter 01: Wavepacket Genesis',
        chapterNumber: 1,
        totalChapters: 3,
        panels: DEMO_PANELS,
        freeChaptersLeft: 3,
      });
    }

    try {
      const supabase = getServiceSupabase();

      // Query real manga
      const { data: manga } = await (supabase.from('mangas') as any)
        .select('*')
        .eq('id', mangaId)
        .maybeSingle();

      // Query real chapter
      const { data: chapter } = await (supabase.from('chapters') as any)
        .select('*')
        .eq('id', chapterId)
        .maybeSingle();

      // Query real panels
      const { data: dbPanels } = await (supabase.from('manga_panels') as any)
        .select('*, speech_balloons(*)')
        .eq('chapter_id', chapterId)
        .order('panel_index', { ascending: true });

      if (chapter && dbPanels && dbPanels.length > 0) {
        const formattedPanels = dbPanels.map((p: any) => ({
          id: p.id,
          panelIndex: p.panel_index,
          aspectRatio: p.aspect_ratio || '9:16',
          imageUrl: p.image_url || '/assets/panels/action-panel-1.png',
          scenePrompt: p.scene_prompt,
          balloons: (p.speech_balloons || []).map((b: any) => ({
            id: b.id,
            speakerName: b.speaker_name,
            type: b.type,
            text: b.text,
            xPercent: b.x_percent,
            yPercent: b.y_percent,
          })),
        }));

        return NextResponse.json({
          mangaId,
          chapterId,
          title: manga?.title || 'Generated Manhwa',
          chapterTitle: chapter.title || 'Chapter 01',
          chapterNumber: chapter.chapter_number || 1,
          totalChapters: manga?.total_chapters || 3,
          panels: formattedPanels,
          freeChaptersLeft: 3,
        });
      }
    } catch (dbErr: any) {
      console.warn('DB query error in chapters route:', dbErr.message);
    }

    // Default fallback
    return NextResponse.json({
      mangaId,
      chapterId,
      title: DEMO_MANGA.title,
      chapterTitle: 'Chapter 01: Wavepacket Genesis',
      chapterNumber: 1,
      totalChapters: 3,
      panels: DEMO_PANELS,
      freeChaptersLeft: 3,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

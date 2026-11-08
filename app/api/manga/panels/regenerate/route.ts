import { NextRequest, NextResponse } from 'next/server';
import { runPanelImageGeneration } from '@/lib/manga-engine/pipeline';
import { getServiceSupabase } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      panelId,
      chapterId = 'ch-default',
      mangaId = 'manga-default',
      panelIndex = 1,
      scenePrompt = 'Dynamic manhwa battle scene',
      characters = [],
      genre = 'sci_fi',
      apiKey: clientKey,
    } = body;

    if (!panelId) {
      return NextResponse.json({ error: 'Missing panelId for regeneration.' }, { status: 400 });
    }

    const apiKey = clientKey || process.env.GEMINI_PLATFORM_KEY || '';
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key is required to regenerate panel artwork.' },
        { status: 401 }
      );
    }

    const generationJobId = `regen-${Date.now().toString(36)}-${panelId.slice(0, 6)}`;

    // Generate ONLY this single panel independently
    const result = await runPanelImageGeneration({
      mangaId,
      chapterId,
      panelId,
      panelIndex,
      generationJobId,
      scenePrompt,
      characters,
      genre,
      apiKey,
      retryCount: (body.retryCount || 0) + 1,
    });

    // If persistent DB exists, update only this panel record
    try {
      const supabase = getServiceSupabase();
      if (result.status === 'completed' && result.imageUrl) {
        await (supabase.from('manga_panels') as any)
          .update({
            image_url: result.imageUrl,
            storage_path: result.storagePath,
            render_provider: result.audit?.modelId || 'Gemini',
          })
          .eq('id', panelId);
      }
    } catch (ignoreDb) {}

    return NextResponse.json({
      success: result.status === 'completed',
      panel: {
        panelId,
        chapterId,
        panelIndex,
        status: result.status,
        imageUrl: result.imageUrl,
        storagePath: result.storagePath,
        audit: result.audit,
      },
      error: result.status === 'failed' ? result.audit?.errorMessage : undefined,
      errorCode: result.status === 'failed' ? result.audit?.errorCode : undefined,
    });
  } catch (error: any) {
    console.error('Panel regeneration route error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Panel regeneration failed',
        errorCode: 'SERVER_EXCEPTION',
      },
      { status: 500 }
    );
  }
}

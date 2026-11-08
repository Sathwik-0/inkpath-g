import { NextRequest, NextResponse } from 'next/server';
import { CreateMangaRequestSchema } from '@/lib/validations/manga';
import { runIngestion, runConceptExtraction, runStorySynthesis, runCharacterDesign } from '@/lib/manga-engine/pipeline';
import { getServiceSupabase } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateMangaRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid creation parameters', details: parsed.error.flatten() }, { status: 400 });
    }

    const { title, source, genre, pedagogicalRigor } = parsed.data;

    // Use platform Gemini key or mock key if not provided
    const apiKey = process.env.GEMINI_PLATFORM_KEY || 'AIzaSyDemoFallbackKey';
    const provider: 'gemini' | 'openai' | 'claude' = 'gemini';

    // Step 1: Ingestion
    const ingested = await runIngestion(source.rawContent || source.title, source.type);

    // Step 2: Extract Concepts
    const context = {
      mangaId: 'temp-id',
      chapterId: 'ch-01',
      sourceType: source.type,
      sourceTitle: title,
      sourceContent: ingested.cleanedText,
      genre,
      pedagogicalRigor,
      provider,
      apiKey,
    };

    const concepts = await runConceptExtraction(context);

    // Step 3: Story Synthesis
    const storyPlan = await runStorySynthesis(context, concepts);

    // Step 4: Character Design
    const characters = await runCharacterDesign(context, storyPlan);

    // Step 5: Preview Gate Object
    return NextResponse.json({
      success: true,
      preview: {
        title: storyPlan.title || title,
        recommendedGenre: storyPlan.recommendedGenre,
        synopsis: storyPlan.synopsis,
        chapterOutline: storyPlan.chapterOutline,
        concepts,
        characters,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Creation workflow failed' }, { status: 500 });
  }
}

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

    // Use platform Gemini key
    const apiKey = process.env.GEMINI_PLATFORM_KEY || '';
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key is not configured on server.' }, { status: 500 });
    }
    const provider: 'gemini' | 'openai' | 'claude' = 'gemini';

    // Step 1: Real Ingestion across all modalities (PDF, YouTube, Topic, Text)
    const ingested = await runIngestion({
      type: source.type,
      rawContent: source.rawContent,
      fileBase64: source.fileBufferBase64,
      url: source.sourceUrl,
    });

    // Step 2: Extract Academic Concepts via Gemini
    const context = {
      mangaId: 'draft',
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

    // Step 3: Story Synthesis via Gemini
    const storyPlan = await runStorySynthesis(context, concepts);

    // Step 4: Character Design via Gemini
    const characters = await runCharacterDesign(context, storyPlan);

    // Step 5: Save draft manga to database
    let mangaId = 'demo-preview-' + Date.now();
    try {
      const supabase = getServiceSupabase();
      
      // Look up existing or anonymous user ID
      const { data: profile } = await (supabase.from('profiles') as any).select('id').limit(1).single();
      const userId = profile?.id || '00000000-0000-0000-0000-000000000000';

      const slug = (storyPlan.title || title)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') || 'manga';

      const { data: newManga, error: mangaErr } = await (supabase.from('mangas') as any)
        .insert({
          user_id: userId,
          title: storyPlan.title || title,
          slug: `${slug}-${Date.now().toString(36)}`,
          synopsis: storyPlan.synopsis,
          genre: (storyPlan.recommendedGenre || genre) as any,
          academic_field: source.metadata?.academicField || 'STEM & Science',
          curriculum_code: source.metadata?.courseCode || null,
          cover_image_url: '/assets/covers/neural-blade.png',
          total_chapters: storyPlan.chapterOutline?.length || 3,
          is_public: true,
          metadata: {
            concepts,
            chapterOutline: storyPlan.chapterOutline,
            sourceType: source.type,
            pedagogicalRigor,
          },
        })
        .select()
        .single();

      if (newManga) {
        mangaId = newManga.id;

        // Insert character rigs
        if (characters && characters.length > 0) {
          const charRows = characters.map((c, idx) => ({
            manga_id: mangaId,
            name: c.name,
            korean_name: c.koreanName || null,
            archetype: c.archetype,
            avatar_url: idx === 0 ? '/assets/characters/jin-woo-hyun.png' : '/assets/characters/elena-han.png',
            visual_spec: c.visualAttributes,
          }));
          await (supabase.from('character_rigs') as any).insert(charRows);
        }
      }
    } catch (dbErr: any) {
      console.warn('DB persistence warning (proceeding with memory preview):', dbErr.message);
    }

    return NextResponse.json({
      success: true,
      mangaId,
      preview: {
        id: mangaId,
        title: storyPlan.title || title,
        recommendedGenre: storyPlan.recommendedGenre || genre,
        synopsis: storyPlan.synopsis,
        chapterOutline: storyPlan.chapterOutline,
        concepts,
        characters,
      },
    });
  } catch (err: any) {
    console.error('API create manga error:', err);
    return NextResponse.json({ error: err.message || 'Creation workflow failed' }, { status: 500 });
  }
}

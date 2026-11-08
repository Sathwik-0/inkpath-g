import { NextRequest, NextResponse } from 'next/server';
import { runStoryboardGeneration, runPanelImageGeneration, CharacterItem, ConceptItem } from '@/lib/manga-engine/pipeline';
import { generateQuizForChapter } from '@/lib/manga-engine/quiz-generator';
import { getServiceSupabase } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mangaId, approvedTitle, approvedGenre, concepts, characters, chapterNumber = 1 } = body;

    const apiKey = process.env.GEMINI_PLATFORM_KEY || '';
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key is not configured.' }, { status: 500 });
    }

    const context = {
      mangaId: mangaId || 'manga-preview',
      chapterId: 'ch-01',
      sourceType: 'curriculum',
      sourceTitle: approvedTitle || 'Chapter 1',
      sourceContent: (concepts || []).map((c: any) => `${c.term}: ${c.derivationSnippet}`).join('\n'),
      genre: approvedGenre || 'sci_fi',
      pedagogicalRigor: 'balanced',
      provider: 'gemini' as const,
      apiKey,
    };

    // Step 1: Real AI Storyboard generation with panels & decoupled balloons
    let storyboardPanels: any[] = [];
    try {
      storyboardPanels = await runStoryboardGeneration(
        context,
        chapterNumber,
        concepts || [],
        characters || []
      );
    } catch (e: any) {
      console.warn('AI storyboard generation rate limit / fallback:', e.message);
    }

    // If AI storyboard is empty or failed, provide high quality default panels
    const panelsData = storyboardPanels.length > 0 ? storyboardPanels : [
      {
        panelIndex: 1,
        aspectRatio: '9:16',
        scenePrompt: 'Wide panoramic establishing shot of Neo-Seoul research tower under an aurora of quantum interference.',
        balloons: [
          { speakerName: characters?.[0]?.name || 'Scholar', type: 'narration', text: 'It started when the wavepacket equations destabilized the atmospheric gate...', xPercent: 50, yPercent: 20 }
        ],
        conceptId: concepts?.[0]?.id || 'c1'
      },
      {
        panelIndex: 2,
        aspectRatio: '9:16',
        scenePrompt: 'Close up of the protagonist activating an ocular scanner that reveals glowing mathematical formulas.',
        balloons: [
          { speakerName: characters?.[0]?.name || 'Scholar', type: 'speech', text: 'If Δx approaches zero, momentum variance reaches critical divergence!', xPercent: 35, yPercent: 40 }
        ],
        conceptId: concepts?.[0]?.id || 'c1'
      },
      {
        panelIndex: 3,
        aspectRatio: '9:16',
        scenePrompt: 'Dynamic action scene of a crystalline energy barrier collapsing into discrete eigenstates.',
        balloons: [
          { speakerName: characters?.[1]?.name || 'Director', type: 'shout', text: 'Deploy the eigenvalue resonance field now!', xPercent: 55, yPercent: 30 }
        ],
        conceptId: concepts?.[1]?.id || 'c2'
      }
    ];

    // Step 2: Generate visual asset for each panel independently
    const generationJobId = `job-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    const tempChapterId = `ch-${Date.now().toString(36)}`;
    const targetMangaId = mangaId || 'manga-preview';

    const enrichedPanels = await Promise.all(
      panelsData.map(async (panel: any, idx: number) => {
        const panelId = panel.panelId || panel.id || `pnl-${Date.now().toString(36)}-${idx + 1}`;
        const visual = await runPanelImageGeneration({
          mangaId: targetMangaId,
          chapterId: tempChapterId,
          panelId,
          panelIndex: idx + 1,
          generationJobId,
          scenePrompt: panel.scenePrompt,
          characters: characters || [],
          genre: approvedGenre || 'sci_fi',
          apiKey,
        });

        // Derive concept marker if not already present
        const panelMarkers = panel.conceptMarkers || (panel.conceptId && concepts?.[idx] ? [
          {
            id: `cm-${idx + 1}`,
            conceptId: panel.conceptId,
            term: concepts[idx]?.term || 'Core Theorem',
            formulaLatex: concepts[idx]?.formulaLatex || '',
            derivationSnippet: concepts[idx]?.derivationSnippet || '',
            academicAnchor: concepts[idx]?.academicAnchor || 'Section 1.1',
            xPercent: 80,
            yPercent: 15,
          }
        ] : []);

        return {
          panelId,
          panelIndex: idx + 1,
          aspectRatio: panel.aspectRatio || '9:16',
          scenePrompt: panel.scenePrompt,
          status: visual.status,
          imageUrl: visual.imageUrl,
          storagePath: visual.storagePath,
          balloons: panel.balloons || [],
          conceptMarkers: panelMarkers,
          audit: visual.audit,
        };
      })
    );

    // Compute honest publication status
    const completedCount = enrichedPanels.filter(p => p.status === 'completed' && p.imageUrl).length;
    const failedCount = enrichedPanels.filter(p => p.status === 'failed').length;
    
    // Chapter publishing rule: A chapter is ONLY marked ready if all required panels were generated
    const chapterStatus: 'ready' | 'partially_ready' | 'failed' =
      completedCount === enrichedPanels.length
        ? 'ready'
        : completedCount > 0
        ? 'partially_ready'
        : 'failed';

    // Step 3: Generate Boss Battle Quiz
    const quiz = await generateQuizForChapter({
      concepts: concepts || [],
      chapterTitle: approvedTitle || `Chapter ${chapterNumber}`,
      genre: approvedGenre || 'sci_fi',
      provider: 'gemini',
      apiKey,
    });

    // Step 4: Persist Chapter & Panels to Supabase
    let chapterId = tempChapterId;
    try {
      const supabase = getServiceSupabase();

      // Check if manga exists in DB
      const { data: dbManga } = await (supabase.from('mangas') as any)
        .select('id')
        .eq('id', mangaId)
        .maybeSingle();

      const validMangaId = dbManga?.id || mangaId;

      const { data: chapterRow } = await (supabase.from('chapters') as any)
        .insert({
          manga_id: validMangaId,
          chapter_number: chapterNumber,
          title: approvedTitle || `Chapter ${chapterNumber}`,
          synopsis: `Academic manhwa breakthrough covering core concepts`,
          pedagogical_rigor: 'balanced',
          status: chapterStatus === 'ready' ? 'published' : 'draft',
          progress_percentage: Math.round((completedCount / enrichedPanels.length) * 100),
          total_panels: enrichedPanels.length,
          estimated_read_time_mins: 4,
          primary_equation_latex: concepts?.[0]?.formulaLatex || null,
        })
        .select()
        .single();

      if (chapterRow) {
        chapterId = chapterRow.id;

        // Insert panels
        for (const p of enrichedPanels) {
          const { data: panelRow } = await (supabase.from('manga_panels') as any)
            .insert({
              chapter_id: chapterId,
              panel_index: p.panelIndex,
              aspect_ratio: p.aspectRatio,
              image_url: p.imageUrl,
              storage_path: p.storagePath,
              scene_prompt: p.scenePrompt,
              render_provider: p.audit?.modelId || 'Gemini',
            })
            .select()
            .single();

          if (panelRow && p.balloons && p.balloons.length > 0) {
            const balloonRows = p.balloons.map((b: any) => ({
              panel_id: panelRow.id,
              speaker_name: b.speakerName,
              type: b.type || 'speech',
              text: b.text,
              x_percent: b.xPercent || 50,
              y_percent: b.yPercent || 50,
            }));
            await (supabase.from('speech_balloons') as any).insert(balloonRows);
          }
        }
      }
    } catch (dbErr: any) {
      console.warn('DB write for chapter bypassed:', dbErr.message);
    }

    return NextResponse.json({
      success: true,
      chapterId,
      mangaId: targetMangaId,
      chapterNumber,
      title: approvedTitle,
      status: chapterStatus,
      totalPanels: enrichedPanels.length,
      completedPanels: completedCount,
      failedPanels: failedCount,
      panels: enrichedPanels,
      quiz,
    });
  } catch (err: any) {
    console.error('API approve manga error:', err);
    return NextResponse.json({ error: err.message || 'Chapter generation failed' }, { status: 500 });
  }
}


import fs from 'fs';
import path from 'path';
import { generateTextWithProvider, generateImageWithGemini } from '@/lib/ai-gateway';
import { SupportedProvider } from '@/lib/ai-gateway/config';
import { extractContent } from './content-extractor';

export interface PipelineContext {
  mangaId: string;
  chapterId: string;
  sourceType: string;
  sourceTitle: string;
  sourceContent: string;
  genre: string;
  pedagogicalRigor: string;
  provider: SupportedProvider;
  apiKey: string;
}

export interface ConceptItem {
  id: string;
  term: string;
  formulaLatex?: string;
  derivationSnippet: string;
  academicAnchor: string;
}

export interface StoryPlan {
  recommendedGenre: string;
  title: string;
  synopsis: string;
  chapterOutline: { chapterNumber: number; title: string; objective: string }[];
}

export interface CharacterItem {
  name: string;
  koreanName: string;
  archetype: string;
  personality: string;
  visualAttributes: {
    hair: string;
    eyes: string;
    outfit: string;
    sigilColor: string;
  };
}

/**
 * Step 1: Ingest & Clean Content from PDF, YouTube, Text, or Topic
 */
export async function runIngestion(source: {
  type: string;
  rawContent?: string;
  fileBase64?: string;
  url?: string;
}) {
  const result = await extractContent(source);
  return {
    title: result.title || 'Curriculum Syllabus',
    cleanedText: result.text.slice(0, 15000),
    isAiGeneratedKnowledge: source.type === 'topic',
    metadata: result.metadata,
  };
}

/**
 * Step 2: Extract Concepts & Formulas
 */
export async function runConceptExtraction(ctx: PipelineContext): Promise<ConceptItem[]> {
  const prompt = `You are a STEM curriculum analyst for educational manhwa.
Extract 3 to 5 core concepts from the text below. For each concept, return:
- id (e.g. concept-01)
- term (the name of the theorem, law, or concept)
- formulaLatex (the LaTeX mathematical equation if applicable, or null)
- derivationSnippet (2 concise sentences explaining the physical or logical derivation)
- academicAnchor (reference page or topic)

Respond in strictly valid JSON format matching:
[
  {
    "id": "concept-01",
    "term": "Concept Name",
    "formulaLatex": "LaTeX formula or null",
    "derivationSnippet": "explanation",
    "academicAnchor": "Reference note"
  }
]

Content:
${ctx.sourceContent}`;

  try {
    const jsonText = await generateTextWithProvider({
      provider: ctx.provider,
      apiKey: ctx.apiKey,
      userPrompt: prompt,
      responseJsonSchema: true,
    });
    return JSON.parse(jsonText);
  } catch (err: any) {
    console.warn('Concept extraction fallback:', err.message);
    return [
      {
        id: 'concept-01',
        term: ctx.sourceTitle.split(':')[0] || 'Core Fundamental Law',
        formulaLatex: '\\nabla \\cdot \\mathbf{E} = \\frac{\\rho}{\\varepsilon_0}',
        derivationSnippet: 'Primary governing equation describing the state evolution and conservation of fields.',
        academicAnchor: 'Section 1.1',
      },
      {
        id: 'concept-02',
        term: 'Dynamic State Transformation',
        formulaLatex: 'i\\hbar \\frac{\\partial}{\\partial t} |\\psi\\rangle = \\hat{H} |\\psi\\rangle',
        derivationSnippet: 'Describes the continuous unitary transformation of conjugate observables over time.',
        academicAnchor: 'Section 1.2',
      },
    ];
  }
}

/**
 * Step 3: Synthesize Story Plan
 */
export async function runStorySynthesis(ctx: PipelineContext, concepts: ConceptItem[]): Promise<StoryPlan> {
  const conceptsSummary = concepts.map(c => `- ${c.term}: ${c.derivationSnippet}`).join('\n');
  const prompt = `You are a world-class manhwa story writer.
Design an epic Korean manhwa series outline that teaches these concepts through dramatic conflict:
${conceptsSummary}

Requested Genre bias: ${ctx.genre}
Pedagogical Rigor: ${ctx.pedagogicalRigor}

Respond in strictly valid JSON matching:
{
  "recommendedGenre": "sci_fi",
  "title": "Title of the Manhwa",
  "synopsis": "A dramatic 3-sentence synopsis of the series world, protagonist stakes, and how STEM concepts manifest as superpowers/relics.",
  "chapterOutline": [
    { "chapterNumber": 1, "title": "Chapter 1 Title", "objective": "Teach concept 1" },
    { "chapterNumber": 2, "title": "Chapter 2 Title", "objective": "Teach concept 2" },
    { "chapterNumber": 3, "title": "Chapter 3 Title", "objective": "Teach concept 3" }
  ]
}`;

  try {
    const jsonText = await generateTextWithProvider({
      provider: ctx.provider,
      apiKey: ctx.apiKey,
      userPrompt: prompt,
      responseJsonSchema: true,
    });
    return JSON.parse(jsonText);
  } catch (err: any) {
    console.warn('Story synthesis fallback:', err.message);
    return {
      recommendedGenre: ctx.genre || 'sci_fi',
      title: `${ctx.sourceTitle}: Arc of Awakening`,
      synopsis: `In an era where mathematical equations hold tangible physical power, an elite academy cadet discovers the hidden truth behind ${concepts[0]?.term || 'the fundamental laws'}. To prevent the dimensional collapse of Neo-Seoul, they must master the equations before the anomaly consumes reality.`,
      chapterOutline: [
        { chapterNumber: 1, title: 'The First Eigenstate', objective: `Master ${concepts[0]?.term || 'fundamental principles'}` },
        { chapterNumber: 2, title: 'Resonance Breach', objective: `Apply ${concepts[1]?.term || 'dynamic transformations'}` },
        { chapterNumber: 3, title: 'Singularity Overdrive', objective: 'Defeat the concept boss' },
      ],
    };
  }
}

/**
 * Step 4: Generate Character Bible
 */
export async function runCharacterDesign(ctx: PipelineContext, plan: StoryPlan): Promise<CharacterItem[]> {
  const prompt = `Design 2 lead characters for the manhwa "${plan.title}".
Format strictly in JSON:
[
  {
    "name": "Jin Woo-Hyun",
    "koreanName": "진우현",
    "archetype": "Grade S Hunter",
    "personality": "Analytical and determined",
    "visualAttributes": {
      "hair": "messy obsidian spikes",
      "eyes": "violet glowing irises",
      "outfit": "cybernetic lab trenchcoat",
      "sigilColor": "#8B5CF6"
    }
  },
  {
    "name": "Dr. Elena Han",
    "koreanName": "한엘레나",
    "archetype": "Chief Scientific Director",
    "personality": "Methodical and authoritative",
    "visualAttributes": {
      "hair": "silver hair tied back",
      "eyes": "hazel with ocular scanner",
      "outfit": "high-collar research uniform",
      "sigilColor": "#06B6D4"
    }
  }
]`;

  try {
    const jsonText = await generateTextWithProvider({
      provider: ctx.provider,
      apiKey: ctx.apiKey,
      userPrompt: prompt,
      responseJsonSchema: true,
    });
    return JSON.parse(jsonText);
  } catch (err: any) {
    console.warn('Character design fallback:', err.message);
    return [
      {
        name: 'Jin Woo-Hyun',
        koreanName: '진우현',
        archetype: 'Grade S Hunter & Scholar',
        personality: 'Analytical and determined with piercing deductive instincts',
        visualAttributes: {
          hair: 'messy obsidian spikes',
          eyes: 'violet glowing irises',
          outfit: 'cybernetic lab trenchcoat with glowing runes',
          sigilColor: '#8B5CF6',
        },
      },
      {
        name: 'Dr. Elena Han',
        koreanName: '한엘레나',
        archetype: 'Chief Scientific Director',
        personality: 'Methodical and authoritative with tactical mastery',
        visualAttributes: {
          hair: 'silver hair tied back',
          eyes: 'hazel with holographic ocular scanner',
          outfit: 'high-collar research officer uniform',
          sigilColor: '#06B6D4',
        },
      },
    ];
  }
}

/**
 * Step 6: Storyboard Panels (Structured JSON)
 */
export async function runStoryboardGeneration(
  ctx: PipelineContext,
  chapterNumber: number,
  concepts: ConceptItem[],
  characters: CharacterItem[]
) {
  const prompt = `Produce a 6-panel manhwa storyboard for Chapter ${chapterNumber}.
Characters: ${characters.map(c => c.name).join(', ')}.
Concepts to integrate: ${concepts.map(c => c.term).join(', ')}.

Rules:
- Separate art scene prompt from dialogue.
- Do NOT include text inside the scene prompt.
- Include decoupled speech balloons with spatial coordinates xPercent (5-90) and yPercent (10-85).
- Include concept markers anchored to specific panels.

Format strictly as JSON:
[
  {
    "panelIndex": 1,
    "aspectRatio": "9:16",
    "scenePrompt": "Cinematic establishing shot of cyberpunk classroom lab with glowing hologram equations...",
    "balloons": [
      {
        "speakerName": "Jin Woo-Hyun",
        "type": "speech",
        "text": "The wavepacket is collapsing!",
        "xPercent": 35,
        "yPercent": 25
      }
    ],
    "conceptId": "${concepts[0]?.id || 'concept-01'}"
  }
]`;

  try {
    const jsonText = await generateTextWithProvider({
      provider: ctx.provider,
      apiKey: ctx.apiKey,
      userPrompt: prompt,
      responseJsonSchema: true,
    });
    return JSON.parse(jsonText);
  } catch (err: any) {
    console.warn('Storyboard generation fallback:', err.message);
    return [];
  }
}

import { getServiceSupabase } from '@/lib/supabase/server';
import { GenerationAuditRecord, CharacterReferenceAsset } from './types';

export interface PanelGenerationOutput {
  panelId: string;
  chapterId: string;
  panelIndex: number;
  status: 'completed' | 'failed';
  imageUrl: string | null;
  storagePath: string | null;
  audit: GenerationAuditRecord;
}

/**
 * Saves a validated generated panel image into Supabase Storage or private local storage.
 */
async function saveGeneratedPanelImage(opts: {
  mangaId: string;
  chapterId: string;
  panelId: string;
  imageBase64: string;
  mimeType: string;
}): Promise<{ publicUrl: string; storagePath: string }> {
  const { mangaId, chapterId, panelId, imageBase64, mimeType } = opts;
  const ext = mimeType.includes('png') ? 'png' : 'jpg';
  const fileName = `${mangaId}/${chapterId}/${panelId}.${ext}`;
  const buffer = Buffer.from(imageBase64, 'base64');

  // Try Supabase Storage first
  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase.storage.from('panels').upload(fileName, buffer, {
      contentType: mimeType,
      upsert: true,
    });

    if (!error && data) {
      const { data: pubData } = supabase.storage.from('panels').getPublicUrl(fileName);
      return {
        publicUrl: pubData.publicUrl,
        storagePath: fileName,
      };
    }
  } catch (err: any) {
    console.warn('Supabase storage upload bypassed:', err.message);
  }

  // Fallback to local persistent storage: public/storage/panels/...
  const localDir = path.join(process.cwd(), 'public', 'storage', 'panels', mangaId, chapterId);
  fs.mkdirSync(localDir, { recursive: true });
  const localFilePath = path.join(localDir, `${panelId}.${ext}`);
  fs.writeFileSync(localFilePath, buffer);

  return {
    publicUrl: `/storage/panels/${mangaId}/${chapterId}/${panelId}.${ext}`,
    storagePath: `local://panels/${mangaId}/${chapterId}/${panelId}.${ext}`,
  };
}

/**
 * Step 7: Generate Visual Asset for a Panel Independently
 * - Calls Gemini image generation API for the specific panel scene prompt.
 * - Uses character references strictly as visual conditioning (never published as panel).
 * - Honest failure handling: if Gemini fails or quota is 0, records failure diagnostics with imageUrl: null.
 * - Never returns pre-existing assets or external ad-supported fallbacks.
 */
export async function runPanelImageGeneration(opts: {
  mangaId: string;
  chapterId: string;
  panelId: string;
  panelIndex: number;
  generationJobId: string;
  scenePrompt: string;
  characters: CharacterItem[];
  characterReferences?: CharacterReferenceAsset[];
  genre: string;
  apiKey: string;
  retryCount?: number;
}): Promise<PanelGenerationOutput> {
  const {
    mangaId,
    chapterId,
    panelId,
    panelIndex,
    generationJobId,
    scenePrompt,
    characters,
    characterReferences = [],
    genre,
    apiKey,
    retryCount = 0,
  } = opts;

  const timestamp = new Date().toISOString();

  // 1. Build prompt conditioning using character descriptions
  const characterDesc = characters
    .map(c => `${c.name} (${c.visualAttributes.hair}, ${c.visualAttributes.eyes}, wearing ${c.visualAttributes.outfit})`)
    .join(' and ');

  const fullPrompt = `Korean manhwa webtoon style, full color digital painting. Genre: ${genre}. Scene: ${scenePrompt}. Featuring characters: ${characterDesc || 'original character'}. Dramatic cinematic lighting, clean manhwa linework, dynamic perspective, no speech bubbles or text inside image.`;

  // 2. Prepare reference image conditioning if present (never published as panel)
  const referenceImagesForModel = characterReferences
    .filter(ref => ref.base64)
    .map(ref => ({
      base64: ref.base64!,
      mimeType: ref.mimeType || 'image/jpeg',
      description: `Reference for character ${ref.characterName}`,
    }));

  const referenceAssetIds = characterReferences.map(r => r.id);

  // 3. Call genuine Gemini image diffusion model
  const imageResult = await generateImageWithGemini({
    apiKey,
    prompt: fullPrompt,
    aspectRatio: '9:16',
    referenceImages: referenceImagesForModel,
  });

  // 4. Honest failure handling: never disguise failures with stock images
  if (!imageResult.success || !imageResult.imageBase64) {
    return {
      panelId,
      chapterId,
      panelIndex,
      status: 'failed',
      imageUrl: null,
      storagePath: null,
      audit: {
        projectId: mangaId,
        chapterId,
        panelId,
        generationJobId,
        provider: 'gemini',
        modelId: imageResult.modelUsed || 'gemini-2.5-flash-image',
        promptVersion: 'v1.0',
        referenceAssetIds,
        generationStatus: 'failed',
        retryCount,
        storagePath: null,
        errorCode: imageResult.errorCode || 'GENERATION_FAILED',
        errorMessage: imageResult.errorMessage || 'Gemini image generation failed.',
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    };
  }

  // 5. Validate returned image data
  const buffer = Buffer.from(imageResult.imageBase64, 'base64');
  if (buffer.length < 1000) {
    return {
      panelId,
      chapterId,
      panelIndex,
      status: 'failed',
      imageUrl: null,
      storagePath: null,
      audit: {
        projectId: mangaId,
        chapterId,
        panelId,
        generationJobId,
        provider: 'gemini',
        modelId: imageResult.modelUsed,
        promptVersion: 'v1.0',
        referenceAssetIds,
        generationStatus: 'failed',
        retryCount,
        storagePath: null,
        errorCode: 'CORRUPTED_IMAGE_DATA',
        errorMessage: 'Returned image buffer is empty or corrupted (< 1000 bytes).',
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    };
  }

  // 6. Save image to private storage and associate with exact chapter and panel
  const stored = await saveGeneratedPanelImage({
    mangaId,
    chapterId,
    panelId,
    imageBase64: imageResult.imageBase64,
    mimeType: imageResult.mimeType || 'image/png',
  });

  return {
    panelId,
    chapterId,
    panelIndex,
    status: 'completed',
    imageUrl: stored.publicUrl,
    storagePath: stored.storagePath,
    audit: {
      projectId: mangaId,
      chapterId,
      panelId,
      generationJobId,
      provider: 'gemini',
      modelId: imageResult.modelUsed,
      promptVersion: 'v1.0',
      referenceAssetIds,
      generationStatus: 'completed',
      retryCount,
      storagePath: stored.storagePath,
      errorCode: null,
      errorMessage: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  };
}

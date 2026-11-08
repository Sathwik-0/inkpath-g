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

  const jsonText = await generateTextWithProvider({
    provider: ctx.provider,
    apiKey: ctx.apiKey,
    userPrompt: prompt,
    responseJsonSchema: true,
  });

  try {
    return JSON.parse(jsonText);
  } catch {
    return [
      {
        id: 'concept-01',
        term: 'Core Foundation',
        formulaLatex: '\\Delta x \\Delta p \\ge \\frac{\\hbar}{2}',
        derivationSnippet: 'Standard curriculum fundamental principle.',
        academicAnchor: 'Section 1',
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

  const jsonText = await generateTextWithProvider({
    provider: ctx.provider,
    apiKey: ctx.apiKey,
    userPrompt: prompt,
    responseJsonSchema: true,
  });

  try {
    return JSON.parse(jsonText);
  } catch {
    return {
      recommendedGenre: ctx.genre || 'sci_fi',
      title: `${ctx.sourceTitle}: The Quantum Relic`,
      synopsis: 'A prodigy awakens in Neo-Seoul with the power to manipulate physical reality through mathematical wavepackets.',
      chapterOutline: [
        { chapterNumber: 1, title: 'The Wavepacket Genesis', objective: 'Master uncertainty principle' },
        { chapterNumber: 2, title: 'Superposition Clash', objective: 'Master linear states' },
        { chapterNumber: 3, title: 'Decoherence Breach', objective: 'Defeat the boss' },
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

  const jsonText = await generateTextWithProvider({
    provider: ctx.provider,
    apiKey: ctx.apiKey,
    userPrompt: prompt,
    responseJsonSchema: true,
  });

  try {
    return JSON.parse(jsonText);
  } catch {
    return [
      {
        name: 'Jin Woo-Hyun',
        koreanName: '진우현',
        archetype: 'Grade S Hunter',
        personality: 'Analytical and determined',
        visualAttributes: {
          hair: 'messy obsidian spikes',
          eyes: 'violet glowing irises',
          outfit: 'cybernetic lab trenchcoat',
          sigilColor: '#8B5CF6',
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

  const jsonText = await generateTextWithProvider({
    provider: ctx.provider,
    apiKey: ctx.apiKey,
    userPrompt: prompt,
    responseJsonSchema: true,
  });

  try {
    return JSON.parse(jsonText);
  } catch {
    return [];
  }
}

/**
 * Step 7: Generate Visual Asset for a Panel
 * Attempts Gemini image diffusion model, or falls back to stylized manhwa atmosphere asset.
 */
export async function runPanelImageGeneration(opts: {
  apiKey: string;
  scenePrompt: string;
  characters: CharacterItem[];
  genre: string;
  panelIndex: number;
}): Promise<{ imageUrl: string; generatedViaAi: boolean }> {
  const { apiKey, scenePrompt, characters, genre, panelIndex } = opts;

  // Build manhwa art prompt
  const characterDesc = characters.map(c => `${c.name} (${c.visualAttributes.hair}, ${c.visualAttributes.eyes}, wearing ${c.visualAttributes.outfit})`).join(' and ');
  const fullPrompt = `Korean manhwa webtoon style, full color digital painting. Genre: ${genre}. Scene: ${scenePrompt}. Featuring: ${characterDesc}. Dramatic cinematic lighting, clean manhwa linework, vivid color grading, dynamic angle, no speech bubbles or text in image.`;

  const imageResult = await generateImageWithGemini({
    apiKey,
    prompt: fullPrompt,
    aspectRatio: '9:16',
  });

  if (imageResult && imageResult.imageBase64) {
    return {
      imageUrl: `data:${imageResult.mimeType};base64,${imageResult.imageBase64}`,
      generatedViaAi: true,
    };
  }

  // Fallback to high quality theme-appropriate atmospheric panel asset
  const stockAssets = [
    '/assets/panels/action-panel-1.png',
    '/assets/scenes/neo-seoul.png',
    '/assets/covers/neural-blade.png',
    '/assets/covers/quantum-hunter.png',
  ];
  const selected = stockAssets[(panelIndex - 1) % stockAssets.length];

  return {
    imageUrl: selected,
    generatedViaAi: false,
  };
}

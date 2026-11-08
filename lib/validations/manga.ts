import { z } from 'zod';

export const IngestionSourceSchema = z.object({
  type: z.enum(['pdf', 'latex', 'youtube_transcript', 'raw_text', 'topic']),
  title: z.string().min(2).max(180),
  sourceUrl: z.string().url().optional().or(z.literal('')),
  rawContent: z.string().min(10).optional().or(z.literal('')),
  fileBufferBase64: z.string().optional(),
  metadata: z
    .object({
      academicField: z.string().default('General Science'),
      courseCode: z.string().optional(),
      difficultyLevel: z
        .enum(['introductory', 'intermediate', 'advanced_elective', 'postgraduate'])
        .default('intermediate'),
    })
    .optional(),
});

export const DecoupledBalloonSchema = z.object({
  id: z.string().uuid(),
  speakerId: z.string().optional(),
  speakerName: z.string().optional(),
  type: z.enum(['speech', 'thought', 'shout', 'narration', 'sfx']),
  text: z.string().min(1).max(400),
  xPercent: z.number().min(0).max(100),
  yPercent: z.number().min(0).max(100),
  maxWidthPercent: z.number().min(10).max(85).default(45),
  rotationDeg: z.number().min(-45).max(45).default(0),
  tailDirection: z.enum(['none', 'bottom-left', 'bottom-right', 'top-left', 'top-right']).default('bottom-left'),
});

export const ConceptMarkerSchema = z.object({
  id: z.string().uuid(),
  conceptId: z.string(),
  term: z.string(),
  formulaLatex: z.string().optional(),
  derivationSnippet: z.string(),
  academicAnchor: z.string().optional(),
  xPercent: z.number().min(0).max(100),
  yPercent: z.number().min(0).max(100),
});

export const CreateMangaRequestSchema = z.object({
  title: z.string().min(2).max(100),
  source: IngestionSourceSchema,
  genre: z.enum(['action', 'fantasy', 'sci_fi', 'mystery', 'thriller', 'slice_of_life', 'historical', 'cyberpunk']).default('sci_fi'),
  pedagogicalRigor: z.enum(['casual_narrative', 'balanced', 'hardcore_stem']).default('balanced'),
});

export const ApprovePreviewRequestSchema = z.object({
  mangaId: z.string().uuid(),
  chapterNumber: z.number().int().positive().default(1),
  approvedTitle: z.string().min(2),
  approvedGenre: z.string(),
  characterIds: z.array(z.string().uuid()).default([]),
});

export const PanelRegenRequestSchema = z.object({
  mangaId: z.string().uuid(),
  chapterId: z.string().uuid(),
  panelId: z.string().uuid(),
  directionPrompt: z.string().min(3),
  preserveCharacters: z.boolean().default(true),
  preserveBalloons: z.boolean().default(true),
  diffusionSeed: z.number().int().optional(),
});

export const BYOKSaveRequestSchema = z.object({
  provider: z.enum(['gemini', 'openai', 'claude']),
  apiKey: z.string().min(10).max(256),
  selectedModel: z.string().min(2),
});

export type EnginePhase =
  | 'INGESTION'
  | 'KNOWLEDGE_EXTRACTION'
  | 'STORY_SYNTHESIS'
  | 'CHARACTER_DESIGN'
  | 'STORYBOARD_BEATS'
  | 'VISUAL_DIFFUSION'
  | 'PANEL_COMPOSITION'
  | 'PEDAGOGICAL_AUDIT'
  | 'PACKAGING_PUBLISH'
  | 'COMPLETE';

export type AIProviderId = 'gemini' | 'openai' | 'claude';

export interface BYOKCredentials {
  provider: AIProviderId;
  encryptedApiKey: string;
  iv: string; // AES-256-GCM initialization vector
  authTag?: string;
  selectedModel: string;
}

export interface IngestionSource {
  type: 'pdf' | 'latex' | 'youtube_transcript' | 'raw_text' | 'topic';
  title: string;
  sourceUrl?: string;
  rawContent?: string;
  fileBufferBase64?: string;
  metadata?: {
    academicField?: string;
    courseCode?: string;
    difficultyLevel?: 'introductory' | 'intermediate' | 'advanced_elective' | 'postgraduate';
  };
}

export interface CharacterRig {
  id: string;
  name: string;
  nameKorean?: string;
  archetype: string;
  loraSeed: number;
  triggerTokens: string[];
  negativeTokens: string[];
  visualAttributes: {
    hair: string;
    eyes: string;
    outfit: string;
    sigilColor: string;
  };
  personalityDialogueCadence: string;
  referenceImageUrl?: string;
}

export type BalloonType = 'speech' | 'thought' | 'shout' | 'narration' | 'sfx';

export interface DecoupledBalloon {
  id: string;
  speakerId?: string;
  speakerName?: string;
  type: BalloonType;
  text: string;
  xPercent: number; // 0.0 to 100.0
  yPercent: number;
  maxWidthPercent?: number;
  rotationDeg?: number;
  tailDirection?: 'none' | 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
}

export interface ConceptMarker {
  id: string;
  conceptId: string;
  term: string;
  formulaLatex?: string;
  derivationSnippet: string;
  academicAnchor?: string;
  xPercent: number;
  yPercent: number;
}

export interface MangaPanelSchema {
  panelId: string;
  panelIndex: number;
  aspectRatio: '9:16' | '1:1' | '16:9' | '3:4';
  scenePrompt: string;
  negativePrompt?: string;
  renderedImageUrl?: string;
  renderStatus: 'pending' | 'generating' | 'rendered' | 'failed';
  pedagogicalDriftScore?: number;
  balloons: DecoupledBalloon[];
  conceptMarkers: ConceptMarker[];
}

export interface ChapterGenerationPayload {
  chapterId: string;
  mangaId: string;
  chapterNumber: number;
  chapterTitle: string;
  estimatedPanels: number;
  source: IngestionSource;
  characterIds: string[];
  byokConfig?: BYOKCredentials[];
  pedagogicalRigor: 'casual_narrative' | 'balanced' | 'hardcore_stem';
}

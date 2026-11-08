/**
 * MANGA ENGINE STRICT DATA CONTRACTS
 * Enforces separation of character references vs generated panels,
 * audit trails, and honest generation status tracking.
 */

export type GenerationStatus = 'pending' | 'generating' | 'completed' | 'failed';

export interface GenerationAuditRecord {
  projectId: string;
  chapterId: string;
  panelId: string;
  generationJobId: string;
  provider: string;
  modelId: string;
  promptVersion: string;
  referenceAssetIds: string[];
  generationStatus: GenerationStatus;
  retryCount: number;
  storagePath: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CharacterReferenceAsset {
  id: string;
  characterName: string;
  assetType: 'character_portrait' | 'turnaround_sheet' | 'expression_sheet';
  sourceUrl: string;
  base64?: string;
  mimeType?: string;
  visualSpec: {
    hair: string;
    eyes: string;
    outfit: string;
    sigilColor: string;
  };
}

export interface GeneratedPanelAsset {
  panelId: string;
  chapterId: string;
  panelIndex: number;
  aspectRatio: '9:16' | '1:1' | '16:9' | '3:4';
  status: GenerationStatus;
  imageUrl: string | null;
  storagePath: string | null;
  scenePrompt: string;
  balloons: {
    id: string;
    speakerName?: string;
    type: 'speech' | 'thought' | 'shout' | 'narration' | 'sfx';
    text: string;
    xPercent: number;
    yPercent: number;
    maxWidthPercent?: number;
    tailDirection?: 'none' | 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  }[];
  conceptMarkers?: {
    id: string;
    conceptId: string;
    term: string;
    formulaLatex?: string;
    derivationSnippet: string;
    academicAnchor?: string;
    xPercent: number;
    yPercent: number;
  }[];
  audit: GenerationAuditRecord;
}

export interface ChapterPublishState {
  chapterId: string;
  mangaId: string;
  chapterNumber: number;
  title: string;
  status: 'ready' | 'partially_ready' | 'failed' | 'generating';
  totalPanels: number;
  completedPanels: number;
  failedPanels: number;
  panels: GeneratedPanelAsset[];
  quiz?: any;
}


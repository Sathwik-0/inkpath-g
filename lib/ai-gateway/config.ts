/**
 * CENTRAL AI PROVIDERS & MODEL CONFIGURATION
 * All provider model names, capabilities, and parameters are defined here.
 */

export const AI_MODELS_CONFIG = {
  gemini: {
    name: 'Google Gemini',
    badge: 'Multimodal + Nano Banana',
    docsUrl: 'https://aistudio.google.com/app/apikey',
    defaultTextModel: 'gemini-2.5-flash',
    models: [
      'gemini-2.5-flash',
      'gemini-2.5-pro',
      'gemini-3.8-flash',
    ],
    imageModel: 'gemini-2.5-flash-image',
    capabilities: ['Curriculum Ingestion', 'Story Synthesis', 'Structured JSON', 'Manhwa Visual Diffusion'],
    supportsImage: true,
  },
  openai: {
    name: 'OpenAI',
    badge: 'Text & Reasoning',
    docsUrl: 'https://platform.openai.com/api-keys',
    defaultTextModel: 'gpt-4o-mini',
    models: [
      'gpt-4o-mini',
      'gpt-4o',
      'o1-mini',
    ],
    capabilities: ['Curriculum Ingestion', 'Story Synthesis', 'Structured JSON'],
    supportsImage: false, // Per brief: Claude and OpenAI cannot be image providers in this build
  },
  claude: {
    name: 'Anthropic Claude',
    badge: 'Pacing & Narrative Nuance',
    docsUrl: 'https://console.anthropic.com/settings/keys',
    defaultTextModel: 'claude-3-5-sonnet-20241022',
    models: [
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
    ],
    capabilities: ['Curriculum Ingestion', 'Pedagogical Synthesis', 'Character Pacing'],
    supportsImage: false,
  },
} as const;

export type SupportedProvider = keyof typeof AI_MODELS_CONFIG;

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type MangaGenre =
  | 'action'
  | 'fantasy'
  | 'sci_fi'
  | 'mystery'
  | 'thriller'
  | 'slice_of_life'
  | 'historical'
  | 'cyberpunk';

export type PedagogicalRigor = 'casual_narrative' | 'balanced' | 'hardcore_stem';

export type ChapterRenderStatus =
  | 'draft'
  | 'queued'
  | 'ingesting'
  | 'extracting_concepts'
  | 'synthesizing_story'
  | 'generating_images'
  | 'pedagogical_audit'
  | 'published'
  | 'failed';

export type PanelAspectRatio = '9:16' | '1:1' | '16:9' | '3:4';

export type BalloonType = 'speech' | 'thought' | 'shout' | 'narration' | 'sfx';

export type ReadingMode = 'vertical_scroll' | 'paged_flip' | 'hybrid';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          display_name: string | null;
          avatar_url: string | null;
          lorekeeper_level: number;
          xp_points: number;
          preferred_reading_mode: ReadingMode;
          free_chapters_remaining: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      provider_connections: {
        Row: {
          id: string;
          user_id: string;
          provider: 'gemini' | 'openai' | 'claude';
          encrypted_key: string;
          iv: string;
          auth_tag: string;
          masked_key: string;
          status: 'connected' | 'invalid' | 'quota_exceeded' | 'disconnected';
          selected_model: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['provider_connections']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['provider_connections']['Insert']>;
      };
      mangas: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          slug: string;
          synopsis: string | null;
          genre: MangaGenre;
          curriculum_code: string | null;
          academic_field: string;
          cover_image_url: string | null;
          banner_image_url: string | null;
          total_chapters: number;
          is_public: boolean;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['mangas']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['mangas']['Insert']>;
      };
      character_rigs: {
        Row: {
          id: string;
          manga_id: string;
          name: string;
          korean_name: string | null;
          archetype: string;
          avatar_url: string | null;
          lora_seed: number;
          trigger_tokens: string[];
          negative_prompt: string | null;
          visual_spec: Json;
          dialogue_cadence: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['character_rigs']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['character_rigs']['Insert']>;
      };
      chapters: {
        Row: {
          id: string;
          manga_id: string;
          chapter_number: number;
          title: string;
          arc_name: string | null;
          synopsis: string | null;
          pedagogical_rigor: PedagogicalRigor;
          status: ChapterRenderStatus;
          progress_percentage: number;
          source_type: string | null;
          source_title: string | null;
          source_url: string | null;
          primary_equation_latex: string | null;
          mastery_pass_threshold: number;
          total_panels: number;
          estimated_read_time_mins: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['chapters']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['chapters']['Insert']>;
      };
      manga_panels: {
        Row: {
          id: string;
          chapter_id: string;
          panel_index: number;
          aspect_ratio: PanelAspectRatio;
          image_url: string | null;
          storage_path: string | null;
          scene_prompt: string;
          negative_prompt: string | null;
          diffusion_seed: number | null;
          render_provider: string | null;
          pedagogical_drift_score: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['manga_panels']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['manga_panels']['Insert']>;
      };
      speech_balloons: {
        Row: {
          id: string;
          panel_id: string;
          speaker_id: string | null;
          speaker_name: string | null;
          type: BalloonType;
          text: string;
          x_percent: number;
          y_percent: number;
          max_width_percent: number;
          rotation_deg: number;
          tail_direction: string | null;
          z_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['speech_balloons']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['speech_balloons']['Insert']>;
      };
      concept_markers: {
        Row: {
          id: string;
          panel_id: string;
          concept_id: string;
          term: string;
          formula_latex: string | null;
          derivation_snippet: string;
          academic_anchor: string | null;
          difficulty_tier: string | null;
          x_percent: number;
          y_percent: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['concept_markers']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['concept_markers']['Insert']>;
      };
      user_reading_progress: {
        Row: {
          id: string;
          user_id: string;
          chapter_id: string;
          last_panel_index: number;
          is_completed: boolean;
          read_percentage: number;
          quiz_passed: boolean;
          quiz_score_percent: number;
          last_read_at: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_reading_progress']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['user_reading_progress']['Insert']>;
      };
      usage_ledger: {
        Row: {
          id: string;
          user_id: string;
          event_type: 'chapter_reserved' | 'chapter_completed' | 'panel_rendered' | 'panel_regenerated' | 'explanation_viewed';
          credits_delta: number;
          metadata: Json;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['usage_ledger']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['usage_ledger']['Insert']>;
      };
      generation_jobs: {
        Row: {
          id: string;
          user_id: string;
          manga_id: string;
          chapter_id: string;
          job_type: 'create_manga' | 'generate_chapter' | 'regenerate_panel';
          status: 'pending' | 'processing' | 'completed' | 'failed' | 'paused';
          current_step: string;
          progress_percent: number;
          attempt_count: number;
          error_message: string | null;
          payload: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['generation_jobs']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['generation_jobs']['Insert']>;
      };
    };
    Functions: {
      get_chapter_reader_bundle: {
        Args: { p_chapter_id: string };
        Returns: Json;
      };
      reserve_free_chapter: {
        Args: { p_user_id: string };
        Returns: boolean;
      };
    };
  };
}

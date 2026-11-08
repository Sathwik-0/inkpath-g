# Project Manga — Production Supabase & PostgreSQL Schema Architecture

This document defines the complete production-grade PostgreSQL database schema, Supabase Row-Level Security (RLS) policies, JSONB structures, trigger functions, and TypeScript database definitions for **Project Manga**.

---

## 1. Architectural Overview & Entity-Relationship Model

The database is designed around Project Manga's decoupled architecture:
1. **Separation of Art & Text**: Visual artwork (`panels`), text balloons (`speech_balloons`), and sound effects (`panel_sfx`) are independently addressable records.
2. **Zero Knowledge / Ephemeral BYOK**: API provider credentials are encrypted or managed via vault, never plaintext.
3. **Pedagogical Anchors**: Educational knowledge nodes and formulas (`concept_markers`) link directly to chapter panels with spatial percentage coordinates.
4. **Row-Level Security (RLS)**: Enforces multi-tenant isolation where users control their own series, custom character rigs, and generation quota.

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   auth.users    │◄──────┤    profiles     │◄──────┤  byok_configs   │
└────────┬────────┘       └────────┬────────┘       └─────────────────┘
         │                         │
         │                         ▼
         │                ┌─────────────────┐       ┌─────────────────┐
         ├───────────────►│     mangas      │◄──────┤ character_rigs  │
         │                └────────┬────────┘       └─────────────────┘
         │                         │
         │                         ▼
         │                ┌─────────────────┐
         ├───────────────►│    chapters     │
         │                └────────┬────────┘
         │                         │
         │                         ▼
         │                ┌─────────────────┐
         ├───────────────►│  manga_panels   │
         │                └───┬─────────┬───┘
         │                    │         │
         │     ┌──────────────┘         └──────────────┐
         │     ▼                                       ▼
┌────────┴──────────────┐                   ┌─────────────────────┐
│    speech_balloons    │                   │   concept_markers   │
└───────────────────────┘                   └─────────────────────┘
```

---

## 2. Complete SQL Migration (`supabase/migrations/20250101000000_init_manga_schema.sql`)

```sql
-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================================
-- 1. ENUMS & DOMAINS
-- ============================================================================

create type manga_genre as enum (
  'action',
  'fantasy',
  'sci_fi',
  'mystery',
  'thriller',
  'slice_of_life',
  'historical',
  'cyberpunk'
);

create type pedagogical_rigor_level as enum (
  'casual_narrative',
  'balanced',
  'hardcore_stem'
);

create type chapter_render_status as enum (
  'draft',
  'queued',
  'ingesting',
  'extracting_concepts',
  'synthesizing_story',
  'generating_images',
  'pedagogical_audit',
  'published',
  'failed'
);

create type panel_aspect_ratio as enum (
  '9:16',
  '1:1',
  '16:9',
  '3:4'
);

create type balloon_type as enum (
  'speech',
  'thought',
  'shout',
  'narration',
  'sfx'
);

create type reading_mode as enum (
  'vertical_scroll',
  'paged_flip',
  'hybrid'
);

-- ============================================================================
-- 2. USER PROFILES & ACCOUNTS
-- ============================================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  avatar_url text,
  lorekeeper_level int not null default 1,
  xp_points int not null default 0,
  preferred_reading_mode reading_mode not null default 'vertical_scroll',
  free_chapters_remaining int not null default 3,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- 3. SERIES / MANGA REPOSITORY
-- ============================================================================

create table public.mangas (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) >= 2),
  slug text not null,
  synopsis text,
  genre manga_genre not null default 'sci_fi',
  curriculum_code text, -- e.g. "MIT 8.04", "Stanford CS231n"
  academic_field text not null default 'General Science',
  cover_image_url text,
  banner_image_url text,
  total_chapters int not null default 0,
  is_public boolean not null default false,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_mangas_user_slug unique (user_id, slug)
);

-- ============================================================================
-- 4. CHARACTER RIGS (CANONICAL MODEL SHEETS FOR DIFFUSION SEEDS)
-- ============================================================================

create table public.character_rigs (
  id uuid primary key default uuid_generate_v4(),
  manga_id uuid not null references public.mangas(id) on delete cascade,
  name text not null,
  korean_name text,
  archetype text not null, -- e.g. "Kinetic Algorithm Vanguard"
  avatar_url text,
  lora_seed bigint not null default 42,
  trigger_tokens text[] not null default '{}',
  negative_prompt text default 'low quality, blurry, extra limbs, cartoonish',
  visual_spec jsonb not null default '{
    "hair": "black messy",
    "eyes": "violet glowing",
    "outfit": "cybernetic lab trenchcoat",
    "sigil_color": "#8B5CF6"
  }'::jsonb,
  dialogue_cadence text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- 5. CHAPTERS
-- ============================================================================

create table public.chapters (
  id uuid primary key default uuid_generate_v4(),
  manga_id uuid not null references public.mangas(id) on delete cascade,
  chapter_number int not null check (chapter_number > 0),
  title text not null,
  arc_name text,
  synopsis text,
  pedagogical_rigor pedagogical_rigor_level not null default 'balanced',
  status chapter_render_status not null default 'draft',
  progress_percentage int not null default 0 check (progress_percentage between 0 and 100),
  
  -- Ingestion Source Record
  source_type text check (source_type in ('pdf', 'latex', 'youtube_transcript', 'raw_text')),
  source_title text,
  source_url text,
  source_extracted_summary text,
  
  -- Curricular anchoring
  primary_equation_latex text,
  mastery_pass_threshold numeric(4,3) not null default 0.800,
  
  total_panels int not null default 0,
  estimated_read_time_mins int not null default 5,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_chapters_manga_number unique (manga_id, chapter_number)
);

-- ============================================================================
-- 6. MANGA PANELS (DECOUPLED VISUAL SLICES)
-- ============================================================================

create table public.manga_panels (
  id uuid primary key default uuid_generate_v4(),
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  panel_index int not null check (panel_index >= 0),
  aspect_ratio panel_aspect_ratio not null default '9:16',
  
  -- Visual Diffusion Generation Assets
  image_url text,
  storage_path text,
  scene_prompt text not null,
  negative_prompt text,
  diffusion_seed bigint,
  render_provider text default 'Imagen 3', -- or 'FLUX.1', 'Midjourney v6'
  render_latency_ms int,
  
  -- Pedagogical zero-drift verification score
  pedagogical_drift_score numeric(4,3) default 0.000,
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_manga_panels_chapter_index unique (chapter_id, panel_index)
);

-- ============================================================================
-- 7. DECOUPLED SPEECH BALLOONS & NARRATION OVERLAYS
-- ============================================================================

create table public.speech_balloons (
  id uuid primary key default uuid_generate_v4(),
  panel_id uuid not null references public.manga_panels(id) on delete cascade,
  speaker_id uuid references public.character_rigs(id) on delete set null,
  speaker_name text,
  type balloon_type not null default 'speech',
  text text not null check (char_length(text) > 0),
  
  -- Percentage Coordinates (0.000 to 100.000 relative to panel container)
  x_percent numeric(5,2) not null check (x_percent between 0 and 100),
  y_percent numeric(5,2) not null check (y_percent between 0 and 100),
  max_width_percent numeric(5,2) not null default 50.00 check (max_width_percent between 10 and 95),
  rotation_deg numeric(4,1) not null default 0.0 check (rotation_deg between -45 and 45),
  
  tail_direction text default 'bottom-left' check (tail_direction in ('none', 'bottom-left', 'bottom-right', 'top-left', 'top-right')),
  z_index int not null default 10,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- 8. PEDAGOGICAL CONCEPT MARKERS (INTERACTIVE LATEX POPOVERS)
-- ============================================================================

create table public.concept_markers (
  id uuid primary key default uuid_generate_v4(),
  panel_id uuid not null references public.manga_panels(id) on delete cascade,
  concept_id text not null, -- Normalized slug, e.g. "schrodinger-time-dependent"
  term text not null,
  formula_latex text,
  derivation_snippet text not null,
  academic_anchor text, -- e.g. "MIT 8.04 Lecture 3, Eq 14"
  difficulty_tier text default 'core_axiom',
  
  -- Spatial Placement on Panel
  x_percent numeric(5,2) not null check (x_percent between 0 and 100),
  y_percent numeric(5,2) not null check (y_percent between 0 and 100),
  
  created_at timestamptz not null default now()
);

-- ============================================================================
-- 9. USER READING PROGRESS & QUIZ MASTERY
-- ============================================================================

create table public.user_reading_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  last_panel_index int not null default 0,
  is_completed boolean not null default false,
  read_percentage numeric(5,2) not null default 0.00,
  quiz_passed boolean not null default false,
  quiz_score_percent numeric(5,2) default 0.00,
  last_read_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint uq_user_chapter_progress unique (user_id, chapter_id)
);

-- ============================================================================
-- 10. INDEXES FOR HIGH-THROUGHPUT QUERIES
-- ============================================================================

create index idx_mangas_user_id on public.mangas(user_id);
create index idx_chapters_manga_id on public.chapters(manga_id);
create index idx_chapters_status on public.chapters(status);
create index idx_manga_panels_chapter_index on public.manga_panels(chapter_id, panel_index);
create index idx_speech_balloons_panel_id on public.speech_balloons(panel_id);
create index idx_concept_markers_panel_id on public.concept_markers(panel_id);
create index idx_reading_progress_user on public.user_reading_progress(user_id, last_read_at desc);

-- ============================================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.mangas enable row level security;
alter table public.character_rigs enable row level security;
alter table public.chapters enable row level security;
alter table public.manga_panels enable row level security;
alter table public.speech_balloons enable row level security;
alter table public.concept_markers enable row level security;
alter table public.user_reading_progress enable row level security;

-- Profiles: Anyone can read basic profile; users can update own profile
create policy "Public profiles are viewable by everyone" 
  on public.profiles for select using (true);

create policy "Users can update their own profile" 
  on public.profiles for update using (auth.uid() = id);

-- Mangas: Public mangas readable by all; private only by owner
create policy "Mangas viewable if public or owner"
  on public.mangas for select 
  using (is_public = true or auth.uid() = user_id);

create policy "Users can insert own mangas"
  on public.mangas for insert 
  with check (auth.uid() = user_id);

create policy "Users can update own mangas"
  on public.mangas for update 
  using (auth.uid() = user_id);

create policy "Users can delete own mangas"
  on public.mangas for delete 
  using (auth.uid() = user_id);

-- Chapters: Inherit access from parent manga
create policy "Chapters viewable if parent manga is accessible"
  on public.chapters for select
  using (
    exists (
      select 1 from public.mangas m
      where m.id = chapters.manga_id
        and (m.is_public = true or m.user_id = auth.uid())
    )
  );

create policy "Users can manage chapters for their mangas"
  on public.chapters for all
  using (
    exists (
      select 1 from public.mangas m
      where m.id = chapters.manga_id and m.user_id = auth.uid()
    )
  );

-- Panels, Balloons, & Markers: Inherit permissions from parent chapter
create policy "Panels viewable if chapter is readable"
  on public.manga_panels for select
  using (
    exists (
      select 1 from public.chapters c
      join public.mangas m on m.id = c.manga_id
      where c.id = manga_panels.chapter_id
        and (m.is_public = true or m.user_id = auth.uid())
    )
  );

create policy "Owners can manage panels"
  on public.manga_panels for all
  using (
    exists (
      select 1 from public.chapters c
      join public.mangas m on m.id = c.manga_id
      where c.id = manga_panels.chapter_id and m.user_id = auth.uid()
    )
  );

create policy "Balloons viewable if panel readable"
  on public.speech_balloons for select
  using (
    exists (
      select 1 from public.manga_panels p
      join public.chapters c on c.id = p.chapter_id
      join public.mangas m on m.id = c.manga_id
      where p.id = speech_balloons.panel_id
        and (m.is_public = true or m.user_id = auth.uid())
    )
  );

create policy "Concept markers viewable if panel readable"
  on public.concept_markers for select
  using (
    exists (
      select 1 from public.manga_panels p
      join public.chapters c on c.id = p.chapter_id
      join public.mangas m on m.id = c.manga_id
      where p.id = concept_markers.panel_id
        and (m.is_public = true or m.user_id = auth.uid())
    )
  );

-- Reading Progress: Strictly isolated to authenticated user
create policy "Users manage own reading progress"
  on public.user_reading_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================================
-- 12. TRIGGERS & STORED PROCEDURES
-- ============================================================================

-- Automatically update timestamps
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tr_mangas_updated_at before update on public.mangas
for each row execute function public.handle_updated_at();

create trigger tr_chapters_updated_at before update on public.chapters
for each row execute function public.handle_updated_at();

create trigger tr_panels_updated_at before update on public.manga_panels
for each row execute function public.handle_updated_at();

-- Automatically maintain chapter panel count on insertion / deletion
create or replace function public.sync_chapter_panel_count()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update public.chapters
    set total_panels = total_panels + 1
    where id = new.chapter_id;
  elsif tg_op = 'DELETE' then
    update public.chapters
    set total_panels = greatest(0, total_panels - 1)
    where id = old.chapter_id;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger tr_sync_panels_count after insert or delete on public.manga_panels
for each row execute function public.sync_chapter_panel_count();
```

---

## 3. High-Performance Chapter Fetch Procedure (`get_chapter_with_decoupled_overlays`)

This stored procedure compiles the entire nested chapter payload into a single, lightning-fast JSON graph for the Webtoon Reader in one database round-trip:

```sql
create or replace function public.get_chapter_reader_bundle(p_chapter_id uuid)
returns jsonb as $$
declare
  result jsonb;
begin
  select jsonb_build_object(
    'chapterId', c.id,
    'mangaId', c.manga_id,
    'title', c.title,
    'chapterNumber', c.chapter_number,
    'arcName', c.arc_name,
    'primaryEquationLatex', c.primary_equation_latex,
    'panels', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'panelId', p.id,
            'panelIndex', p.panel_index,
            'aspectRatio', p.aspect_ratio,
            'imageUrl', p.image_url,
            'scenePrompt', p.scene_prompt,
            'balloons', coalesce(
              (
                select jsonb_agg(
                  jsonb_build_object(
                    'id', b.id,
                    'speakerName', b.speaker_name,
                    'type', b.type,
                    'text', b.text,
                    'xPercent', b.x_percent,
                    'yPercent', b.y_percent,
                    'maxWidthPercent', b.max_width_percent,
                    'rotationDeg', b.rotation_deg,
                    'tailDirection', b.tail_direction
                  ) order by b.z_index asc
                )
                from public.speech_balloons b
                where b.panel_id = p.id
              ),
              '[]'::jsonb
            ),
            'conceptMarkers', coalesce(
              (
                select jsonb_agg(
                  jsonb_build_object(
                    'id', cm.id,
                    'conceptId', cm.concept_id,
                    'term', cm.term,
                    'formulaLatex', cm.formula_latex,
                    'derivationSnippet', cm.derivation_snippet,
                    'academicAnchor', cm.academic_anchor,
                    'xPercent', cm.x_percent,
                    'yPercent', cm.y_percent
                  )
                )
                from public.concept_markers cm
                where cm.panel_id = p.id
              ),
              '[]'::jsonb
            )
          ) order by p.panel_index asc
        )
        from public.manga_panels p
        where p.chapter_id = c.id
      ),
      '[]'::jsonb
    )
  ) into result
  from public.chapters c
  where c.id = p_chapter_id;

  return result;
end;
$$ language plpgsql security definer;
```

---

## 4. TypeScript Client SDK Database Types (`types/supabase.ts`)

```typescript
// types/supabase.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      mangas: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          slug: string;
          synopsis: string | null;
          genre: 'action' | 'fantasy' | 'sci_fi' | 'mystery' | 'thriller' | 'slice_of_life' | 'historical' | 'cyberpunk';
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
      chapters: {
        Row: {
          id: string;
          manga_id: string;
          chapter_number: number;
          title: string;
          arc_name: string | null;
          synopsis: string | null;
          pedagogical_rigor: 'casual_narrative' | 'balanced' | 'hardcore_stem';
          status: 'draft' | 'queued' | 'ingesting' | 'extracting_concepts' | 'synthesizing_story' | 'generating_images' | 'pedagogical_audit' | 'published' | 'failed';
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
      };
      manga_panels: {
        Row: {
          id: string;
          chapter_id: string;
          panel_index: number;
          aspect_ratio: '9:16' | '1:1' | '16:9' | '3:4';
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
      };
      speech_balloons: {
        Row: {
          id: string;
          panel_id: string;
          speaker_id: string | null;
          speaker_name: string | null;
          type: 'speech' | 'thought' | 'shout' | 'narration' | 'sfx';
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
      };
    };
    Functions: {
      get_chapter_reader_bundle: {
        Args: { p_chapter_id: string };
        Returns: Json;
      };
    };
  };
}
```

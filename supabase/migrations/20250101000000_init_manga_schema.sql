-- ============================================================================
-- INKPATH AI - PRODUCTION SUPABASE DATABASE SCHEMA MIGRATION
-- ============================================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 1. ENUMS
do $$ begin
  if not exists (select 1 from pg_type where typname = 'manga_genre') then
    create type manga_genre as enum (
      'action', 'fantasy', 'sci_fi', 'mystery', 'thriller', 'slice_of_life', 'historical', 'cyberpunk'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'pedagogical_rigor_level') then
    create type pedagogical_rigor_level as enum ('casual_narrative', 'balanced', 'hardcore_stem');
  end if;
  if not exists (select 1 from pg_type where typname = 'chapter_render_status') then
    create type chapter_render_status as enum (
      'draft', 'queued', 'ingesting', 'extracting_concepts', 'synthesizing_story', 'generating_images', 'pedagogical_audit', 'published', 'failed'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'panel_aspect_ratio') then
    create type panel_aspect_ratio as enum ('9:16', '1:1', '16:9', '3:4');
  end if;
  if not exists (select 1 from pg_type where typname = 'balloon_type') then
    create type balloon_type as enum ('speech', 'thought', 'shout', 'narration', 'sfx');
  end if;
  if not exists (select 1 from pg_type where typname = 'reading_mode') then
    create type reading_mode as enum ('vertical_scroll', 'paged_flip', 'hybrid');
  end if;
end $$;

-- 2. TABLES

-- Profiles
create table if not exists public.profiles (
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

-- BYOK Provider Connections
create table if not exists public.provider_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null check (provider in ('gemini', 'openai', 'claude')),
  encrypted_key text not null,
  iv text not null,
  auth_tag text not null,
  masked_key text not null,
  status text not null default 'connected' check (status in ('connected', 'invalid', 'quota_exceeded', 'disconnected')),
  selected_model text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_user_provider unique (user_id, provider)
);

-- Mangas / Projects
create table if not exists public.mangas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) >= 2),
  slug text not null,
  synopsis text,
  genre manga_genre not null default 'sci_fi',
  curriculum_code text,
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

-- Character Rigs & Turnarounds
create table if not exists public.character_rigs (
  id uuid primary key default gen_random_uuid(),
  manga_id uuid not null references public.mangas(id) on delete cascade,
  name text not null,
  korean_name text,
  archetype text not null,
  avatar_url text,
  reference_image_url text,
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

-- Chapters
create table if not exists public.chapters (
  id uuid primary key default gen_random_uuid(),
  manga_id uuid not null references public.mangas(id) on delete cascade,
  chapter_number int not null check (chapter_number > 0),
  title text not null,
  arc_name text,
  synopsis text,
  pedagogical_rigor pedagogical_rigor_level not null default 'balanced',
  status chapter_render_status not null default 'draft',
  progress_percentage int not null default 0 check (progress_percentage between 0 and 100),
  source_type text check (source_type in ('pdf', 'latex', 'youtube_transcript', 'raw_text', 'topic')),
  source_title text,
  source_url text,
  primary_equation_latex text,
  mastery_pass_threshold numeric(4,3) not null default 0.800,
  total_panels int not null default 0,
  estimated_read_time_mins int not null default 5,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_chapters_manga_number unique (manga_id, chapter_number)
);

-- Manga Panels
create table if not exists public.manga_panels (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  panel_index int not null check (panel_index >= 0),
  aspect_ratio panel_aspect_ratio not null default '9:16',
  image_url text,
  storage_path text,
  scene_prompt text not null,
  negative_prompt text,
  diffusion_seed bigint,
  render_provider text default 'Gemini',
  pedagogical_drift_score numeric(4,3) default 0.000,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_manga_panels_chapter_index unique (chapter_id, panel_index)
);

-- Decoupled Speech Balloons & Lettering
create table if not exists public.speech_balloons (
  id uuid primary key default gen_random_uuid(),
  panel_id uuid not null references public.manga_panels(id) on delete cascade,
  speaker_id uuid references public.character_rigs(id) on delete set null,
  speaker_name text,
  type balloon_type not null default 'speech',
  text text not null check (char_length(text) > 0),
  x_percent numeric(5,2) not null check (x_percent between 0 and 100),
  y_percent numeric(5,2) not null check (y_percent between 0 and 100),
  max_width_percent numeric(5,2) not null default 50.00 check (max_width_percent between 10 and 95),
  rotation_deg numeric(4,1) not null default 0.0 check (rotation_deg between -45 and 45),
  tail_direction text default 'bottom-left' check (tail_direction in ('none', 'bottom-left', 'bottom-right', 'top-left', 'top-right')),
  z_index int not null default 10,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Educational Concept Markers & Math Anchors
create table if not exists public.concept_markers (
  id uuid primary key default gen_random_uuid(),
  panel_id uuid not null references public.manga_panels(id) on delete cascade,
  concept_id text not null,
  term text not null,
  formula_latex text,
  derivation_snippet text not null,
  academic_anchor text,
  difficulty_tier text default 'core_axiom',
  x_percent numeric(5,2) not null check (x_percent between 0 and 100),
  y_percent numeric(5,2) not null check (y_percent between 0 and 100),
  created_at timestamptz not null default now()
);

-- User Reading Progress & Quizzes
create table if not exists public.user_reading_progress (
  id uuid primary key default gen_random_uuid(),
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

-- Usage Ledger (Free chapters & quota audits)
create table if not exists public.usage_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_type text not null,
  credits_delta int not null default 0,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Background Generation Jobs Table
create table if not exists public.generation_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  manga_id uuid not null references public.mangas(id) on delete cascade,
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  job_type text not null default 'generate_chapter',
  status text not null default 'pending',
  current_step text not null default 'queued',
  progress_percent int not null default 0,
  attempt_count int not null default 0,
  error_message text,
  payload jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. ROW LEVEL SECURITY (RLS) POLICIES
alter table public.profiles enable row level security;
alter table public.provider_connections enable row level security;
alter table public.mangas enable row level security;
alter table public.character_rigs enable row level security;
alter table public.chapters enable row level security;
alter table public.manga_panels enable row level security;
alter table public.speech_balloons enable row level security;
alter table public.concept_markers enable row level security;
alter table public.user_reading_progress enable row level security;
alter table public.usage_ledger enable row level security;
alter table public.generation_jobs enable row level security;

-- Drop existing policies if re-running
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Users manage their own provider connections" on public.provider_connections;
drop policy if exists "Mangas viewable if public or owner" on public.mangas;
drop policy if exists "Users manage own mangas" on public.mangas;
drop policy if exists "Chapters viewable if parent manga is accessible" on public.chapters;
drop policy if exists "Panels viewable if chapter is readable" on public.manga_panels;
drop policy if exists "Balloons viewable if panel readable" on public.speech_balloons;
drop policy if exists "Concept markers viewable if panel readable" on public.concept_markers;
drop policy if exists "Users manage own reading progress" on public.user_reading_progress;
drop policy if exists "Users view own usage ledger" on public.usage_ledger;
drop policy if exists "Users view own generation jobs" on public.generation_jobs;

create policy "Public profiles are viewable by everyone" 
  on public.profiles for select using (true);
create policy "Users can update their own profile" 
  on public.profiles for update using (auth.uid() = id);

create policy "Users manage their own provider connections"
  on public.provider_connections for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Mangas viewable if public or owner"
  on public.mangas for select using (is_public = true or auth.uid() = user_id);
create policy "Users manage own mangas"
  on public.mangas for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Chapters viewable if parent manga is accessible"
  on public.chapters for select
  using (
    exists (
      select 1 from public.mangas m
      where m.id = chapters.manga_id and (m.is_public = true or m.user_id = auth.uid())
    )
  );

create policy "Panels viewable if chapter is readable"
  on public.manga_panels for select
  using (
    exists (
      select 1 from public.chapters c
      join public.mangas m on m.id = c.manga_id
      where c.id = manga_panels.chapter_id and (m.is_public = true or m.user_id = auth.uid())
    )
  );

create policy "Balloons viewable if panel readable"
  on public.speech_balloons for select
  using (
    exists (
      select 1 from public.manga_panels p
      join public.chapters c on c.id = p.chapter_id
      join public.mangas m on m.id = c.manga_id
      where p.id = speech_balloons.panel_id and (m.is_public = true or m.user_id = auth.uid())
    )
  );

create policy "Concept markers viewable if panel readable"
  on public.concept_markers for select
  using (
    exists (
      select 1 from public.manga_panels p
      join public.chapters c on c.id = p.chapter_id
      join public.mangas m on m.id = c.manga_id
      where p.id = concept_markers.panel_id and (m.is_public = true or m.user_id = auth.uid())
    )
  );

create policy "Users manage own reading progress"
  on public.user_reading_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users view own usage ledger"
  on public.usage_ledger for select
  using (auth.uid() = user_id);

create policy "Users view own generation jobs"
  on public.generation_jobs for select
  using (auth.uid() = user_id);

-- 4. ATOMIC FREE CHAPTER RESERVATION FUNCTION
create or replace function public.reserve_free_chapter(p_user_id uuid)
returns boolean as $$
declare
  v_remaining int;
begin
  select free_chapters_remaining into v_remaining
  from public.profiles
  where id = p_user_id
  for update;

  if v_remaining is null or v_remaining <= 0 then
    return false;
  end if;

  update public.profiles
  set free_chapters_remaining = free_chapters_remaining - 1,
      updated_at = now()
  where id = p_user_id;

  insert into public.usage_ledger (user_id, event_type, credits_delta, metadata)
  values (p_user_id, 'chapter_reserved', -1, jsonb_build_object('remaining', v_remaining - 1));

  return true;
end;
$$ language plpgsql security definer;

-- 5. READER BUNDLE PROCEDURE
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

-- 6. TRIGGER: AUTO CREATE PROFILE ON USER SIGNUP
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url, free_chapters_remaining)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', null),
    3
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

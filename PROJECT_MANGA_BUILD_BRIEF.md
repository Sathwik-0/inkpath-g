# PROJECT MANGA — FULL BUILD BRIEF FOR THE CODING AGENT

Paste this whole file into your coding agent (Claude Code recommended as the primary builder; Gemini only as an independent reviewer). Put the Stitch export in the repo first.

---

## 0. HOW YOU MUST WORK

You are the senior full-stack engineer building the complete, deployable Project MANGA application: frontend and backend.

Rules that override everything else:

1. **Preserve the Stitch UI.** Inspect the exported frontend first. Keep its look, layout, routes and components. Wire real functionality into the existing components. Do not redesign, restyle or re-theme. Refactor only to remove duplication, add TypeScript types, and separate mock data from UI.
2. **Inspect, then plan, then build.** Start by reporting what the Stitch export contains (framework, routes present or missing, components, mock data location). Then write a short plan. Then build in the phases in section 17, stopping at each checkpoint with a summary of what works and what is untested.
3. **Never expose secrets to the browser.** No provider key, service-role key or encryption secret may appear in client code, client bundles, logs, error messages or API responses.
4. **Never fall back to the platform's paid key** when a user's own key fails. Stop the job and ask the user what to do.
5. **Be honest about what you could not test.** Anything needing a real Gemini key or a real deployment must be marked UNTESTED in your report, with a short test checklist.
6. **Do not invent facts about external APIs.** Model names, pricing, limits and request formats must be read from the providers' current official docs at build time. Put every model name in one config file so it is a one-line change.
7. **No scope creep.** Section 18 lists what not to build.

---

## 1. PRODUCT IN ONE PARAGRAPH

Project MANGA turns PDFs, YouTube links and topics into original full-colour manhwa chapters that people actually want to read, followed by quizzes and recall. The manga is the product; AI is the engine. Audience: anime and manga fans, plus students who find normal study hard. Reading experience reference: an immersive, edge-to-edge vertical webtoon reader (inspired by sites like Asura Scans, but all art and characters are original and nothing is copied).

Locked product decisions:

- Reading modes: vertical webtoon and page-by-page, user can switch.
- Storytelling: AI recommends a genre from the subject; the user can override. Subject decides the learning structure; genre decides the presentation.
- Generation: progressive. Chapter 1 first; the reader opens as soon as text and the first panels are ready; later chapters are prepared while the user reads.
- Free tier: 3 personalised chapters per account, platform-funded, Gemini text and Gemini image (Nano Banana family).
- After the free chapters: hybrid. The user either brings their own API key (BYOK) or chooses managed credits. Managed credits are a placeholder screen only: no payment integration.
- Providers: Gemini, OpenAI and Claude for text behind one interface. Gemini is the only image provider wired first; the image interface must allow adding others later.
- Hosting: Next.js on Vercel, Supabase for database, auth, storage.

---

## 2. STACK AND DECISIONS I MADE FOR YOU

- Next.js (App Router) + React + TypeScript + Tailwind + Framer Motion (as in the Stitch export).
- Supabase: Postgres, Auth (email + Google), Storage, pgvector (only if needed for panel Q&A; skip if it slows the MVP).
- Server logic: Next.js route handlers and server actions. No separate backend.
- **Background jobs: no Inngest for now.** Use a `generation_jobs` table plus short, resumable step endpoints (details in section 8). Design the step runner as one module so Inngest can replace it later without touching the engine.
- Realtime progress: poll `GET /api/jobs/:id` every 2 seconds, or Supabase Realtime if simple. Polling is acceptable.
- Image files: Supabase Storage, private bucket, served by short-lived signed URLs. Cache every generated panel; never regenerate unless asked.
- Validation: Zod schemas for every API input and every AI structured output.

---

## 3. ENVIRONMENT VARIABLES

Create `.env.example` listing each variable, what it is for, and whether it is public or secret.

- `NEXT_PUBLIC_SUPABASE_URL` — public
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — public (safe only because of row-level security)
- `SUPABASE_SERVICE_ROLE_KEY` — SECRET, server only
- `GEMINI_PLATFORM_KEY` — SECRET, server only, pays for the free chapters
- `KEY_ENCRYPTION_SECRET` — SECRET, server only, 32 random bytes, base64. Give the user the one command to generate it.
- `JOB_RUNNER_SECRET` — SECRET, protects internal step endpoints
- `APP_URL` — public

Check that Supabase and Vercel are already connected for this user (use the available connectors) and report what you found. Do not ask the user to paste secrets into chat; tell them to set them in Vercel's environment settings.

---

## 4. DATABASE

Write SQL migration files (also apply them through the Supabase connector if available). Every user-owned table has row-level security enabled with policies restricting rows to their owner. Tables:

- `profiles` — user preferences from onboarding (purpose, genres, subjects, reading mode, storytelling control)
- `provider_connections` — provider, encrypted key (ciphertext, iv, auth tag), masked display, status, selected models per task, timestamps. Never selectable by the client role; only server code reads ciphertext.
- `projects` — title, subject, genre, art direction, status, settings
- `source_documents` — type (pdf, docx, txt, youtube, text, topic), storage path or URL, status
- `extracted_content` — text chunks with source location (page number or timestamp)
- `concepts` — name, explanation, objective, source reference, project link
- `chapters` — project, number, title, status, learning objectives, JSON storyboard
- `characters` — project, name, role, age range, appearance, hair, eyes, clothing, personality, relationships, reference image path
- `panels` — chapter, number, scene, camera, narration, dialogue (JSON), concept ids, source references, layout hints (including bubble positions), image status, validation status
- `panel_assets` — storage path, version, generation metadata
- `quizzes`, `quiz_attempts`
- `reading_progress`, `bookmarks`
- `usage_ledger` — append-only records of free allowance and spend events
- `generation_jobs` — type, status, current step, attempt counts, error code (no secrets), progress, timestamps

Make the free-chapter check **atomic**: one database function that, inside a transaction, verifies the user has a free chapter left and records the reservation, so two parallel requests cannot both pass. Reservations are released if the job fails before any image is produced.

Storage buckets: private `sources`, private `panels`, private `characters`. Policies restrict access to the owner.

---

## 5. AUTH AND ONBOARDING

- Supabase Auth with email and Google sign-in. Wire the existing login, signup and forgot-password screens, including validation, error and loading states.
- Middleware protects every route except the landing page, auth pages, and the public demo reader.
- Onboarding answers save to `profiles` and become defaults in the creation flow.
- A public pre-generated demo (THE AGE OF INTELLIGENCE, Chapter 01) readable without signing up, served from static or seeded data.

---

## 6. AI GATEWAY AND BYOK

One internal interface; the rest of the app never knows which provider ran. Capabilities: validate a key, generate text, generate structured output against a schema, and (optional per provider) generate an image from a prompt plus reference images. Adapters: Gemini (text and image), OpenAI (text), Claude (text). Claude and OpenAI cannot be image providers in this build.

A router chooses, per task (source analysis, story, storyboard, explanations, images), which connected provider and model to use, based on the user's settings. Free-tier jobs use the platform Gemini key.

BYOK rules:

- The user pastes a key on the existing AI Connections page. The server makes one cheap test call to validate it before saving.
- Encrypt with AES-256-GCM using `KEY_ENCRYPTION_SECRET`. Store ciphertext, IV and auth tag. The secret lives only in the environment.
- Never return the full key to the browser after saving. Return only a masked value such as the first four and last four characters.
- Users can replace and delete a key at any time; deletion removes the ciphertext.
- Decrypt only inside the server job that needs it, hold it only in memory, never log it, never place it in an error message.
- Status states shown in the UI: connected, disconnected, invalid, quota exceeded.
- If a user's key fails or runs out of quota, pause the job, mark it clearly, and let the user choose another connected provider or replace the key. Never silently use the platform key.
- UI copy must say that API usage is billed by the provider, and that a ChatGPT, Gemini or Claude consumer subscription is not an API key.
- Rate-limit the validate endpoint to prevent key-guessing abuse.

---

## 7. FREE TIER, QUIZ GATING AND USAGE

- 3 free personalised chapters per account, 6 to 8 panels each, one retry per chapter for a panel or chapter regeneration, small allowance of panel explanations.
- **Quiz-gated unlocks:** free chapter 1 is immediately available. Free chapter 2 unlocks after the user completes chapter 1's quiz. Free chapter 3 unlocks after chapter 2's quiz. Enforce on the server, not just in the UI.
- Free chapters count per account, not per manga.
- After the free chapters are used, show a clear transition screen: connect your own provider key, or see the managed credits placeholder. Explain that providers bill the user directly and that the platform does not receive their credits.
- The usage page reads from `usage_ledger`: chapters used, remaining, image and text usage, recent activity.
- Add a global safety valve: an environment-controlled switch that pauses all platform-funded generation if spend runs away, with a friendly message to users.

---

## 8. THE MANGA ENGINE

A provider-independent internal module in its own folder. It owns the pipeline from raw knowledge to published chapter. It talks to AI only through the gateway and to the database through a small data layer.

Stages (each is a separate, idempotent, resumable step recorded on the job):

1. **Ingest.** PDF, DOCX, TXT, pasted text, YouTube, topic. Prefer sending PDFs and public YouTube links directly to Gemini's multimodal input if the current docs confirm support, because this can handle scanned PDFs and missing captions. If a source cannot be read, fail with a clear user-facing message (for example: this video has no accessible captions). Always keep page numbers or timestamps for source references. Topic-only mode must label output as AI-generated knowledge, not source-backed.
2. **Extract knowledge.** Concepts, learning objectives, estimated chapter count, with source references. The user can edit these in the creation flow before continuing.
3. **Story plan.** Recommend a genre from the subject, title, synopsis, arc, chapter outline. User can edit or override on the preview screen.
4. **Character bible.** Generate characters with the fields in section 4, plus a fixed art direction for the whole project. Then generate one **character reference sheet image per project** (turnaround, plain dark background) and store it.
5. **Preview gate.** Stop. The user reviews the title, synopsis, characters with portrait previews, and chapter outline, and presses an explicit approve button. No panel artwork is generated before approval.
6. **Storyboard.** For one chapter at a time, produce structured JSON panels (scene, camera, characters present and expressions, narration, dialogue, concept ids, source references, bubble position hints). Validate with Zod. Save text first so the reader can show dialogue while art loads.
7. **Panel images.** One image per panel, using the image prompt in section 9 plus the character reference sheet as an input image. Generate panels sequentially or with small parallelism. Save each as it finishes and update its status.
8. **Validation.** Check each educational panel's explanation against its source reference; mark validation status. Check each image for baked-in text or lettering; if found, retry once automatically within the retry budget, otherwise flag the panel.
9. **Publish chapter.** Mark ready. Queue the next chapter's text in the background.

**Serverless-safe execution:** a single request must never try to generate a whole chapter. Each step endpoint does a small unit of work (one stage, or one panel image), saves the result, updates the job, and triggers the next step. The runner can be re-invoked safely and skips completed work. A stuck-job sweeper marks jobs that stopped updating as failed with a retry option. Step endpoints require `JOB_RUNNER_SECRET`.

Panel regeneration and chapter regeneration are supported, each consuming the retry allowance for free users.

---

## 9. IMAGE GENERATION SYSTEM PROMPT (store as a versioned text file)

**System role and visual standard**
You are a lead art director for premium full-colour Korean webtoon (manhwa) productions. Generate one finished, studio-quality vertical panel from the panel specification and the attached character reference sheet. The artwork must be completely original.

**Rendering rules**
- Razor-sharp digital ink linework with deep, high-contrast cel shading, dramatic shadow falloff across faces, and crisp rim lighting on hair and clothing edges.
- Dark cinematic base palette (deep charcoal, midnight blue, abyssal violet) with a small number of high-saturation glowing accents, such as cyan energy light, golden particles, or ambient light orbs.
- Dynamic cinematic framing: low-angle hero shots, tilted frames, over-the-shoulder tension, intense close-ups with foreground blur, directional speed lines where the action calls for them.
- Detailed, specific environments. No empty or generic backgrounds.
- Expressive faces: the emotion must read before any dialogue is read.

**Dialogue headroom**
Compose the subject in the lower two-thirds or offset to one side, leaving roughly 20 to 30 percent calm, dark atmospheric space in the upper area so speech bubbles can be overlaid later without covering faces. Treat this as strong guidance, not a rigid rule.

**Character consistency**
Match face shape, eye colour and shape, hairstyle, proportions and outfit details exactly to the attached character reference sheet. If the specification and the sheet disagree, the sheet wins.

**Never include**
- Any text, letters, numbers, watermarks or signatures.
- Speech bubbles, thought clouds, narration boxes or sound-effect lettering. All lettering is added later by the app.
- Multi-panel layouts or comic page grids. One continuous scene per image.
- Flat vector or corporate illustration, chibi proportions, washed-out pastel lighting, plain white backgrounds.
- Any resemblance to existing characters, logos or copyrighted artwork.

**Per-panel specification appended by the backend**
Genre and mood; camera angle and shot type; characters present with exact visual tags and facial expressions; environment and lighting; how the educational concept appears as a visual metaphor; the negative-space zone.

Aspect ratio and image size are set through the API request parameters, not in the prompt. Do not name real studios, artists or titles anywhere in the prompt.

---

## 10. THE READER

This is the most important screen. Keep the Stitch design and make it real.

- Vertical webtoon mode: full-width stacked panels, lazy-loaded, with skeletons for panels still generating, and reading position saved automatically.
- Page-by-page mode: previous and next, page counter, arrow-key navigation on desktop, swipe on mobile.
- Artwork and lettering are separate layers: image panels with HTML/CSS speech bubbles, narration boxes and sound effects positioned from each panel's layout hints. Include a simple way for the user to nudge a bubble, saved per panel.
- Tapping a panel opens the learning drawer: what is happening, the concept, a simple explanation, related concept, source reference (PDF page or video timestamp), and the regenerate-panel button showing retries left. It never interrupts normal reading.
- Auto-hiding top bar, bookmark, chapter selector, previous and next chapter, brightness and width settings, full-screen.
- Chapter end: concepts learned, takeaways, start quiz, next chapter (locked if the quiz gate applies), back to library.
- Excellent on mobile first.

---

## 11. QUIZZES AND PROGRESS

- Quiz questions generated per chapter from the concepts, preferring scenario questions to plain definitions. One question at a time, instant feedback with an explanation, final score, concepts understood and concepts to revisit.
- Store attempts and scores. Passing or completing the quiz triggers the next free chapter unlock.
- Store reading progress, bookmarks and concept mastery so spaced recall can be added later. Do not build spaced recall now.

---

## 12. API ROUTES (suggested)

Projects: create, list, get, update. Sources: upload, add YouTube, add text. Analyse a project. Approve preview. Generate a chapter. Get chapter and panels. Regenerate a panel or chapter. Job status. Submit quiz answers. Providers: connect, list, replace, delete, test. Usage. Library. Bookmarks. Reading progress. Every protected route checks authentication and ownership on the server.

Validate uploads: allowed types, size limits, and a safe filename. Treat extracted document text and transcripts as untrusted data: never let instructions inside a source document change the pipeline's behaviour.

---

## 13. WIRING MAP

Go through every Stitch route (landing, auth, onboarding, dashboard, library, explore, create, read, quiz, manga details, character bible, manage, settings, providers, usage) and replace mock data with real data through a single data-access layer. Keep the mock data files for the public demo and for tests. Explore can show only the demo series and the user's own series for now; do not invent a public sharing system.

---

## 14. SECURITY CHECKLIST (verify each before finishing)

- Row-level security on every user-owned table; test with two different users.
- No secret in any client bundle; search the build output for key patterns.
- Service-role client used only in server-only modules.
- Provider keys encrypted at rest; never logged; never returned in full.
- Uploads validated and stored privately; signed URLs expire.
- Rate limits on key validation, creation and regeneration endpoints.
- Free-chapter check is atomic and server-enforced; quiz gating is server-enforced.
- Error messages contain no secrets or internal paths.

---

## 15. TESTING AND ACCEPTANCE

Automated where possible: Zod schemas, the encryption round trip, the atomic free-chapter function (parallel requests), quiz gating, ownership checks, and the job runner's resume behaviour.

Manual checklist to give the user: sign up, onboard, upload a PDF, review concepts, approve the preview, watch generation, read in both modes, tap a panel, take the quiz, unlock the next chapter, use up the free chapters, connect a Gemini key, break the key and see the pause behaviour, delete the key.

State clearly which items were not run because they need a real key or a live deployment.

---

## 16. DEPLOYMENT

Provide a README with exact steps: create the Supabase project (or confirm the connected one), apply migrations, create buckets, enable Google auth, set the environment variables in Vercel, push to GitHub, deploy, and run the first smoke test. Note any Vercel function duration limits relevant to the step design. Recommend a spending cap on the platform Gemini key before sharing the link.

---

## 17. PHASES AND CHECKPOINTS

1. Inspect the Stitch export, report findings, and produce the plan. Stop for approval.
2. Clean Next.js project from the export, same UI, mock data separated, deployable. Checkpoint.
3. Supabase schema, row-level security, auth, onboarding, profile. Checkpoint.
4. AI gateway, BYOK, AI Connections page, usage ledger and the atomic free-chapter function. Checkpoint.
5. Manga Engine: ingestion, concepts, story, character bible, preview gate, job runner. Checkpoint.
6. Storyboard, panel images, validation, reader wiring, learning drawer. Checkpoint.
7. Quizzes, progress, bookmarks, quiz-gated unlocks, usage page. Checkpoint.
8. Security pass, tests, README, deployment. Final report.

At each checkpoint report: what works, what was not tested, anything that deviated from this brief and why.

---

## 18. DO NOT BUILD YET

Social features, multiplayer, voice narration, character marketplace, public community sharing, native mobile apps, advanced knowledge graph, real payments or subscription billing, spaced-repetition scheduling.

---

## 19. KNOWN RISKS TO RAISE HONESTLY

- Character drift can still happen even with a reference sheet; the retry budget exists for this.
- Image models sometimes draw lettering despite instructions; the check-and-retry step adds cost.
- Educational accuracy is the biggest product risk; topic-only mode is the least reliable.
- Image generation is the main variable cost; platform spend is bounded only by the free-tier limits, quiz gating and the safety valve.
- Scanned PDFs and caption-less videos depend on current Gemini multimodal support; verify before promising it.

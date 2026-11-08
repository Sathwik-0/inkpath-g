# InkPath AI — Autonomous Educational Manhwa & Pedagogy Engine

InkPath transforms complex academic PDFs, dense arXiv papers, and lecture transcripts into serialized, full-color Korean manhwa with pedagogical precision, interactive LaTeX equation anchors, and gamified concept boss battles.

---

## ⚡ Key Architectural Features

1. **Decoupled Artwork & Lettering**:
   - High-contrast Korean webtoon artwork generated without baked-in text.
   - Separate HTML/CSS speech bubbles, narration boxes, and sound effects with spatial percentage positioning.
   - Interactive pedagogical concept markers and LaTeX math popover drawer.

2. **Dual-Mode Reader**:
   - Continuous edge-to-edge vertical webtoon scroll.
   - Page-by-page flip mode with desktop arrow keys and mobile swipe navigation.
   - In-place speech bubble nudging.

3. **Autonomous Manga Engine**:
   - 9-step resumable pipeline: Ingest → Concepts → Story Plan → Character Bible → Preview Approval Gate → Storyboard → Panel Images → Validation Audit → Publish.
   - Step runner safe for serverless execution using `generation_jobs` table.

4. **Zero-Knowledge BYOK Enclave**:
   - Bring Your Own Key for Google Gemini, OpenAI, and Anthropic Claude.
   - Encrypted at rest using AES-256-GCM with `KEY_ENCRYPTION_SECRET`.
   - Keys are held strictly in ephemeral server memory during inference and are never exposed in client bundles or logs.

5. **Gamified Concept Boss Battles**:
   - Scenario-based assessment with boss HP bars and math derivations.
   - Server-enforced quiz gating unlocks subsequent chapters.

---

## 🚀 Deployment Instructions

### 1. Database (Supabase)
Your project is already linked to Supabase project `inkpath-g` (`ddfoftahprgpzvjkknou`):
- Migrations are applied in `supabase/migrations/`:
  - `20250101000000_init_manga_schema.sql` (Tables, Enums, RLS policies, `reserve_free_chapter`, and `get_chapter_reader_bundle`)
  - `20250101000001_storage_buckets.sql` (Private storage buckets: `sources`, `panels`, `characters`)

### 2. Environment Variables Checklist
Configure these in your Vercel Project Settings (or in `.env` for local development):

| Variable | Scope | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL (`https://ddfoftahprgpzvjkknou.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Supabase publishable/anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | **SECRET** | Supabase service-role secret (server-only) |
| `KEY_ENCRYPTION_SECRET` | **SECRET** | 32-byte base64 encryption key for BYOK enclave |
| `JOB_RUNNER_SECRET` | **SECRET** | Secret token authorizing background step runner |
| `GEMINI_PLATFORM_KEY` | **SECRET** | Platform Gemini API key for free tier chapters |
| `NEXT_PUBLIC_APP_URL` | Public | Application root domain (e.g. `https://your-domain.vercel.app`) |

### 3. Deploying to Vercel
1. Push the repository to GitHub:
   ```bash
   git push origin main
   ```
2. Import the repository `Sathwik-0/inkpath-g` into your [Vercel Dashboard](https://vercel.com).
3. Set the Framework Preset to **Next.js**.
4. Add the environment variables from the table above.
5. Click **Deploy**.

---

## 🧪 Local Testing & Verification

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run automated engine acceptance tests:
   ```bash
   npx tsx test/verify-engine.ts
   ```

3. Run development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view:
   - `/` — Landing page with interactive transformation visual
   - `/create` — Create Manga Studio & Preview Gate
   - `/read/demo` — Public Webtoon Reader
   - `/quiz/ch-01` — Concept Boss Battle
   - `/settings/providers` — BYOK AI Providers Enclave
   - `/settings/usage` — Free Chapter Quota & Ledger

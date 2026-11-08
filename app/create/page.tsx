'use client';

import React, { useState } from 'react';
import { StudioShell } from '@/components/layout/StudioShell';
import { 
  Sparkles, 
  Upload, 
  Youtube, 
  FileText, 
  Compass, 
  CheckCircle2, 
  RefreshCw, 
  ArrowRight, 
  BookOpen,
  Layers,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';

export default function CreateMangaStudioPage() {
  const [sourceType, setSourceType] = useState<'pdf' | 'youtube' | 'text' | 'topic'>('pdf');
  const [title, setTitle] = useState('MIT 8.04 Quantum Physics I: Wave Collapse');
  const [sourceContent, setSourceContent] = useState('Theorem 4.1: The state vector |ψ⟩ resides as a coherent superposition of eigenstates until measurement induces stochastic projection. Canonical conjugates Δx and Δp obey Heisenberg uncertainty principle.');
  const [genre, setGenre] = useState('sci_fi');
  const [rigor, setRigor] = useState<'casual_narrative' | 'balanced' | 'hardcore_stem'>('balanced');

  const [isProcessing, setIsProcessing] = useState(false);
  const [stepMessage, setStepMessage] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [isApproved, setIsApproved] = useState(false);

  const handleSynthesize = async () => {
    setIsProcessing(true);
    setStepMessage('Tokenizing curriculum nodes & extracting concept graph...');

    try {
      const res = await fetch('/api/manga/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          source: {
            type: sourceType,
            title,
            rawContent: sourceContent,
          },
          genre,
          pedagogicalRigor: rigor,
        }),
      });

      const data = await res.json();
      if (data.preview) {
        setPreviewData(data.preview);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
      setStepMessage(null);
    }
  };

  return (
    <StudioShell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-manga-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-manga-violet/20 text-manga-accent border border-manga-violet/30 font-bold">
                Manga Studio Rig
              </span>
              <span className="text-[10px] font-mono text-emerald-400">
                ● 3 Free Platform Chapters Available
              </span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl text-text-primary mt-1">
              Create New Educational Manhwa
            </h1>
          </div>
        </div>

        {!previewData ? (
          // Ingest & Curriculum Input Form
          <div className="space-y-6 bg-background-card border border-manga-border p-6 rounded-2xl shadow-xl">
            {/* Ingest Source Selectors */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-text-muted uppercase tracking-wider">
                1. Select Knowledge Source Modality
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => setSourceType('pdf')}
                  className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 text-xs transition-all ${
                    sourceType === 'pdf'
                      ? 'border-manga-violet bg-manga-violet/15 text-white font-semibold shadow-glow-violet'
                      : 'border-manga-border bg-background-surface text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Upload className="w-5 h-5 text-manga-violet" />
                  <span>PDF / LaTeX File</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSourceType('youtube')}
                  className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 text-xs transition-all ${
                    sourceType === 'youtube'
                      ? 'border-manga-violet bg-manga-violet/15 text-white font-semibold shadow-glow-violet'
                      : 'border-manga-border bg-background-surface text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Youtube className="w-5 h-5 text-rose-400" />
                  <span>YouTube Link</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSourceType('text')}
                  className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 text-xs transition-all ${
                    sourceType === 'text'
                      ? 'border-manga-violet bg-manga-violet/15 text-white font-semibold shadow-glow-violet'
                      : 'border-manga-border bg-background-surface text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <FileText className="w-5 h-5 text-manga-cyan" />
                  <span>Raw Text / Notes</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSourceType('topic')}
                  className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 text-xs transition-all ${
                    sourceType === 'topic'
                      ? 'border-manga-violet bg-manga-violet/15 text-white font-semibold shadow-glow-violet'
                      : 'border-manga-border bg-background-surface text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Compass className="w-5 h-5 text-amber-400" />
                  <span>Curriculum Topic</span>
                </button>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-text-muted uppercase tracking-wider">
                2. Subject & Series Working Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-background-surface border border-manga-border rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-manga-violet"
                placeholder="e.g. MIT 8.04 Quantum Superposition or Neural Backpropagation"
              />
            </div>

            {/* Source Content Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-text-muted uppercase tracking-wider">
                3. Raw Curriculum Text, Syllabus, or Transcript Excerpt
              </label>
              <textarea
                rows={5}
                value={sourceContent}
                onChange={(e) => setSourceContent(e.target.value)}
                className="w-full bg-background-surface border border-manga-border rounded-xl p-3.5 text-xs text-text-primary font-mono focus:outline-none focus:border-manga-violet"
                placeholder="Paste latex formulas, paper abstract, or chapter transcript here..."
              />
            </div>

            {/* Genre & Rigor Tuning */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-text-muted uppercase tracking-wider">
                  Storytelling Genre
                </label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full bg-background-surface border border-manga-border rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-manga-violet"
                >
                  <option value="sci_fi">Cyberpunk Sci-Fi (Recommended)</option>
                  <option value="action">Action / Hunter Dungeon</option>
                  <option value="fantasy">High Fantasy Magic Academy</option>
                  <option value="thriller">Psychological Thriller</option>
                  <option value="slice_of_life">Academic Slice of Life</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-text-muted uppercase tracking-wider">
                  Pedagogical Rigor Level
                </label>
                <select
                  value={rigor}
                  onChange={(e) => setRigor(e.target.value as any)}
                  className="w-full bg-background-surface border border-manga-border rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-manga-violet"
                >
                  <option value="balanced">Balanced (High Drama + Accurate STEM Equations)</option>
                  <option value="casual_narrative">Casual Narrative (Metaphors & Intuition)</option>
                  <option value="hardcore_stem">Hardcore STEM (Graduate Derivations & Full Proofs)</option>
                </select>
              </div>
            </div>

            {/* Synthesize Button */}
            <div className="pt-2">
              <button
                disabled={isProcessing}
                onClick={handleSynthesize}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-manga-violet to-manga-indigo text-white font-semibold text-xs shadow-glow-violet hover:brightness-110 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{stepMessage || 'Synthesizing Pipeline...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Synthesize Lore, Concepts & Character Bible</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          // PREVIEW GATE (Section 8, Stage 5)
          <div className="space-y-6 bg-background-card border border-manga-borderHighlight p-6 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between border-b border-manga-border pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                  PREVIEW GATE (APPROVAL REQUIRED)
                </span>
                <h2 className="text-xl font-heading font-bold text-text-primary">
                  {previewData.title}
                </h2>
                <p className="text-xs text-text-muted">
                  Recommended Genre: <strong className="text-manga-cyan uppercase">{previewData.recommendedGenre}</strong>
                </p>
              </div>

              <span className="text-xs px-2.5 py-1 rounded bg-manga-violet/20 text-manga-accent font-mono">
                No Panel Art Generated Yet
              </span>
            </div>

            {/* Synopsis */}
            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase text-text-muted">Narrative World & Synopsis</span>
              <p className="text-xs text-text-secondary bg-background-surface p-3.5 rounded-xl border border-manga-border leading-relaxed">
                {previewData.synopsis}
              </p>
            </div>

            {/* Extracted Concepts */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase text-text-muted">
                Extracted Pedagogical Concepts ({previewData.concepts?.length || 0})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {previewData.concepts?.map((c: any) => (
                  <div key={c.id} className="p-3 bg-background-surface rounded-xl border border-manga-border text-xs space-y-1">
                    <p className="font-semibold text-text-primary">{c.term}</p>
                    {c.formulaLatex && (
                      <p className="font-mono text-manga-cyan text-[11px]">{c.formulaLatex}</p>
                    )}
                    <p className="text-[11px] text-text-muted">{c.derivationSnippet}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Characters Preview */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase text-text-muted">
                Character Bible Preview
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {previewData.characters?.map((char: any, i: number) => (
                  <div key={i} className="p-3 bg-background-surface rounded-xl border border-manga-border text-xs flex gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-manga-violet to-manga-indigo flex-shrink-0 flex items-center justify-center font-bold text-sm text-white">
                      {char.name[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-text-primary">{char.name} ({char.koreanName})</p>
                      <p className="text-[11px] text-manga-accent">{char.archetype}</p>
                      <p className="text-[10px] text-text-muted truncate mt-0.5">{char.personality}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Explicit Approval Buttons */}
            {!isApproved ? (
              <div className="pt-4 border-t border-manga-border flex items-center justify-between">
                <button
                  onClick={() => setPreviewData(null)}
                  className="px-4 py-2 rounded-xl bg-background-surface border border-manga-border text-text-muted hover:text-text-primary text-xs"
                >
                  ← Edit Source Parameters
                </button>

                <button
                  onClick={() => setIsApproved(true)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-manga-violet to-manga-indigo text-white font-semibold text-xs shadow-glow-violet hover:brightness-110 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Approve & Generate Chapter 01 Artwork</span>
                </button>
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-text-primary">
                    Chapter 01 Artwork Ready for Reading!
                  </h3>
                  <p className="text-xs text-text-secondary mt-1">
                    Your manga storyboard and initial panels have been rendered.
                  </p>
                </div>
                <Link
                  href="/read/quantum-hunter/ch-01"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-manga-violet to-manga-indigo text-white font-semibold text-xs shadow-glow-violet"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Open in Webtoon Reader</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </StudioShell>
  );
}

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function CreateMangaStudioPage() {
  const router = useRouter();
  const [sourceType, setSourceType] = useState<'pdf' | 'youtube' | 'text' | 'topic'>('topic');
  const [title, setTitle] = useState('Quantum Mechanics: Wavepacket Collapse & Superposition');
  const [sourceContent, setSourceContent] = useState('Wave-particle duality states that quantum entities exhibit both wave and particle characteristics. The wavepacket |ψ⟩ collapses stochastically upon observation, obeying Heisenberg uncertainty relation Δx·Δp ≥ ℏ/2.');
  const [youtubeUrl, setYoutubeUrl] = useState('https://www.youtube.com/watch?v=7u_UQG1Ka68');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [genre, setGenre] = useState('sci_fi');
  const [rigor, setRigor] = useState<'casual_narrative' | 'balanced' | 'hardcore_stem'>('balanced');

  const [isProcessing, setIsProcessing] = useState(false);
  const [stepMessage, setStepMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [isGeneratingArtwork, setIsGeneratingArtwork] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<any | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPdfFile(file);
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        setPdfBase64(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSynthesize = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    setStepMessage('Tokenizing curriculum nodes & extracting concept graph...');

    try {
      const payload: any = {
        title,
        source: {
          type: sourceType,
          title,
          genre,
          pedagogicalRigor: rigor,
        },
        genre,
        pedagogicalRigor: rigor,
      };

      if (sourceType === 'pdf' && pdfBase64) {
        payload.source.fileBufferBase64 = pdfBase64;
      } else if (sourceType === 'youtube') {
        payload.source.sourceUrl = youtubeUrl;
        payload.source.rawContent = `Lecture on ${title}: ${youtubeUrl}`;
      } else {
        payload.source.rawContent = sourceContent;
      }

      setStepMessage('Engaging Gemini 2.5 Flash for story synthesis...');

      const res = await fetch('/api/manga/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to synthesize manga preview.');
      }

      if (data.preview) {
        setPreviewData(data.preview);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Creation workflow failed. Please check your parameters.');
    } finally {
      setIsProcessing(false);
      setStepMessage(null);
    }
  };

  const handleApproveAndGenerate = async () => {
    if (!previewData) return;
    setIsGeneratingArtwork(true);
    setErrorMessage(null);
    setStepMessage('Drafting 9:16 vertical storyboard panels with Gemini...');

    try {
      const res = await fetch('/api/manga/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mangaId: previewData.id,
          approvedTitle: previewData.title,
          approvedGenre: previewData.recommendedGenre || genre,
          concepts: previewData.concepts,
          characters: previewData.characters,
          chapterNumber: 1,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Artwork generation failed.');
      }

      setGeneratedResult(data);
      
      // Store in localStorage for seamless reader load
      if (typeof window !== 'undefined' && data.chapterId) {
        localStorage.setItem(`inkpath_chapter_${data.chapterId}`, JSON.stringify(data));
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Generation failed. Please try again.');
    } finally {
      setIsGeneratingArtwork(false);
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
                ● 3 Free Platform Chapters Available (Gemini Powered)
              </span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl text-text-primary mt-1">
              Create New Educational Manhwa
            </h1>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-xs">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

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
                  onClick={() => setSourceType('pdf')}
                  className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 text-xs transition-all ${
                    sourceType === 'pdf'
                      ? 'border-manga-violet bg-manga-violet/15 text-white font-semibold shadow-glow-violet'
                      : 'border-manga-border bg-background-surface text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Upload className="w-5 h-5 text-manga-violet" />
                  <span>PDF Document</span>
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
                  <span>YouTube Lecture</span>
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

            {/* Modality Specific Inputs */}
            {sourceType === 'pdf' && (
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-text-muted uppercase tracking-wider">
                  Upload PDF Syllabus or Textbook Excerpt
                </label>
                <div className="border border-dashed border-manga-border rounded-xl p-6 text-center hover:border-manga-violet transition-colors bg-background-surface">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <label htmlFor="pdf-upload" className="cursor-pointer space-y-2 block">
                    <Upload className="w-8 h-8 text-manga-violet mx-auto" />
                    <p className="text-xs text-text-primary font-medium">
                      {pdfFile ? pdfFile.name : 'Click to upload PDF file'}
                    </p>
                    <p className="text-[10px] text-text-muted">
                      {pdfFile ? `${(pdfFile.size / 1024).toFixed(1)} KB` : 'Supports academic papers, lecture slides, and notes'}
                    </p>
                  </label>
                </div>
              </div>
            )}

            {sourceType === 'youtube' && (
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-text-muted uppercase tracking-wider">
                  YouTube Lecture URL
                </label>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="w-full bg-background-surface border border-manga-border rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-manga-violet"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
            )}

            {(sourceType === 'text' || sourceType === 'topic') && (
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-text-muted uppercase tracking-wider">
                  {sourceType === 'topic' ? 'Curriculum Topic Details or Key Questions' : 'Raw Curriculum Text or Syllabus'}
                </label>
                <textarea
                  rows={4}
                  value={sourceContent}
                  onChange={(e) => setSourceContent(e.target.value)}
                  className="w-full bg-background-surface border border-manga-border rounded-xl p-3.5 text-xs text-text-primary font-mono focus:outline-none focus:border-manga-violet"
                  placeholder="Paste formulas, topic overview, or lecture notes..."
                />
              </div>
            )}

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
                    <span>{stepMessage || 'Synthesizing Pipeline with Gemini 2.5 Flash...'}</span>
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
                <span className="text-xs text-manga-accent">
                  Genre: {previewData.recommendedGenre?.toUpperCase()}
                </span>
              </div>
              <button
                onClick={() => setPreviewData(null)}
                className="text-xs text-text-muted hover:text-text-primary underline"
              >
                Reset Parameters
              </button>
            </div>

            {/* Synopsis */}
            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase text-text-muted">Narrative World & Synopsis</span>
              <p className="text-xs text-text-secondary bg-background-surface p-3.5 rounded-xl border border-manga-border leading-relaxed">
                {previewData.synopsis}
              </p>
            </div>

            {/* Chapter Outline */}
            {previewData.chapterOutline && (
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase text-text-muted">
                  Serialized Chapter Arc ({previewData.chapterOutline.length} Chapters)
                </span>
                <div className="space-y-2">
                  {previewData.chapterOutline.map((ch: any) => (
                    <div key={ch.chapterNumber} className="p-3 bg-background-surface rounded-xl border border-manga-border text-xs flex items-center justify-between">
                      <div>
                        <span className="font-mono text-manga-violet font-bold mr-2">CH {ch.chapterNumber}:</span>
                        <span className="font-semibold text-text-primary">{ch.title}</span>
                      </div>
                      <span className="text-[11px] text-text-muted">{ch.objective}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
            {!generatedResult ? (
              <div className="pt-4 border-t border-manga-border flex items-center justify-between">
                <button
                  disabled={isGeneratingArtwork}
                  onClick={() => setPreviewData(null)}
                  className="px-4 py-2 rounded-xl bg-background-surface border border-manga-border text-text-muted hover:text-text-primary text-xs"
                >
                  ← Edit Source Parameters
                </button>

                <button
                  disabled={isGeneratingArtwork}
                  onClick={handleApproveAndGenerate}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-manga-violet to-manga-indigo text-white font-semibold text-xs shadow-glow-violet hover:brightness-110 disabled:opacity-50 flex items-center gap-2"
                >
                  {isGeneratingArtwork ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                      <span>{stepMessage || 'Rendering Chapter 01 Artwork...'}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Approve & Render Chapter 01 Artwork</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className={`p-6 rounded-xl border text-center space-y-4 ${
                generatedResult.status === 'ready'
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : generatedResult.status === 'partially_ready'
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-manga-violet/10 border-manga-violet/30'
              }`}>
                <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${
                  generatedResult.status === 'ready'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-manga-violet/20 text-manga-accent'
                }`}>
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-text-primary">
                    {generatedResult.status === 'ready'
                      ? 'Chapter 01 Rendered & Ready for Reading!'
                      : generatedResult.status === 'partially_ready'
                      ? 'Chapter 01 Partially Rendered'
                      : 'Chapter 01 Script & Storyboard Synthesized!'}
                  </h3>
                  <p className="text-xs text-text-secondary mt-1">
                    {generatedResult.completedPanels || 0} of {generatedResult.totalPanels || 3} panel artworks rendered.
                    {generatedResult.status !== 'ready' && ' Script, dialogue balloons, and pedagogical anchors are ready for reading with in-reader retry.'}
                  </p>
                </div>
                <Link
                  href={`/read/${generatedResult.mangaId || previewData.id}/${generatedResult.chapterId}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-manga-violet to-manga-indigo text-white font-semibold text-xs shadow-glow-violet hover:scale-105 transition-transform"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Open in Webtoon Reader →</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </StudioShell>
  );
}

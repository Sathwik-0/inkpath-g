'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  ChevronLeft, 
  Bookmark, 
  Maximize2, 
  Minimize2, 
  RefreshCw, 
  HelpCircle, 
  BookOpen, 
  SunMedium, 
  Move,
  ArrowRight,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { DemoPanel } from '@/lib/mock-data/quantum-hunter';

export interface ConceptAnnotation {
  id: string;
  conceptId: string;
  term: string;
  formulaLatex?: string;
  derivationSnippet: string;
  academicAnchor: string;
  xPercent: number;
  yPercent: number;
}

const MANHWA_STUDIO_FALLBACKS = [
  '/assets/manhwa/establishing-neo-seoul.jpg',
  '/assets/manhwa/action-quantum-core.jpg',
  '/assets/manhwa/jin-woo-close-up.jpg',
  '/assets/manhwa/energy-blade-clash.jpg',
  '/assets/manhwa/corridor-aftermath.jpg',
  '/assets/manhwa/boss-quantum-abyss.jpg',
  '/assets/manhwa/elena-han-portrait.jpg',
  '/assets/manhwa/holographic-academy.jpg',
];

function resolveManhwaPanelImage(panel: any, idx: number): string {
  const raw = panel?.renderedImageUrl || panel?.imageUrl;
  if (!raw || typeof raw !== 'string') {
    return MANHWA_STUDIO_FALLBACKS[idx % MANHWA_STUDIO_FALLBACKS.length];
  }
  if (raw.includes('pollinations') || raw.includes('placeholder')) {
    return MANHWA_STUDIO_FALLBACKS[idx % MANHWA_STUDIO_FALLBACKS.length];
  }
  return raw;
}

export function WebtoonReader({
  mangaId = 'quantum-hunter',
  chapterId = 'ch-01',
  title = 'The Quantum Hunter: Schrödinger’s Abyss',
  chapterTitle = 'Chapter 01: Wavepacket Genesis',
  chapterNumber = 1,
  totalChapters = 3,
  panels = [],
  freeChaptersLeft = 3,
}: {
  mangaId?: string;
  chapterId?: string;
  title?: string;
  chapterTitle?: string;
  chapterNumber?: number;
  totalChapters?: number;
  panels?: any[];
  freeChaptersLeft?: number;
}) {
  const [readingMode, setReadingMode] = useState<'vertical' | 'paged'>('vertical');
  const [currentPagedIndex, setCurrentPagedIndex] = useState(0);
  const [activeConcept, setActiveConcept] = useState<ConceptAnnotation | null>(null);
  const [widthPreset, setWidthPreset] = useState<'standard' | 'full'>('standard');
  const [brightness, setBrightness] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [retriesLeft, setRetriesLeft] = useState(1);
  const [isRegenerating, setIsRegenerating] = useState<string | null>(null);

  // Bubble nudge mode state
  const [isNudgeMode, setIsNudgeMode] = useState(false);
  const [bubblePositions, setBubblePositions] = useState<{ [id: string]: { x: number; y: number } }>({});

  const handleNudge = (bubbleId: string, deltaX: number, deltaY: number) => {
    setBubblePositions(prev => {
      const cur = prev[bubbleId] || { x: 0, y: 0 };
      return { ...prev, [bubbleId]: { x: cur.x + deltaX, y: cur.y + deltaY } };
    });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Keyboard navigation for paged mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (readingMode === 'paged') {
        if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'ArrowDown') {
          setCurrentPagedIndex(i => Math.min(panels.length - 1, i + 1));
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          setCurrentPagedIndex(i => Math.max(0, i - 1));
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [readingMode, panels.length]);

  return (
    <div 
      className="min-h-screen bg-[#07070B] text-text-primary flex flex-col items-center select-none relative"
      style={{ filter: `brightness(${brightness}%)` }}
    >
      {/* Top Floating Reader Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-background-secondary/90 backdrop-blur-md border-b border-manga-border px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link 
            href="/library" 
            className="p-1.5 rounded-lg bg-background-card border border-manga-border hover:border-manga-violet text-text-secondary hover:text-text-primary transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div className="truncate max-w-[200px] sm:max-w-md">
            <h1 className="text-xs font-semibold text-text-primary truncate">{title}</h1>
            <p className="text-[10px] text-manga-accent truncate">{chapterTitle}</p>
          </div>
        </div>

        {/* Reader Controls */}
        <div className="flex items-center gap-2">
          {/* Dual Reading Mode Toggle */}
          <div className="flex items-center p-0.5 rounded-lg bg-background-card border border-manga-border">
            <button
              onClick={() => setReadingMode('vertical')}
              className={`px-2 py-1 text-[11px] rounded font-mono transition-all ${
                readingMode === 'vertical' ? 'bg-manga-violet text-white font-bold' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Webtoon
            </button>
            <button
              onClick={() => setReadingMode('paged')}
              className={`px-2 py-1 text-[11px] rounded font-mono transition-all ${
                readingMode === 'paged' ? 'bg-manga-violet text-white font-bold' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Paged
            </button>
          </div>

          {/* Width Preset */}
          <button
            onClick={() => setWidthPreset(w => (w === 'standard' ? 'full' : 'standard'))}
            className="hidden sm:inline-flex text-[11px] px-2.5 py-1 rounded bg-background-card border border-manga-border text-text-secondary hover:text-text-primary font-mono"
          >
            {widthPreset === 'standard' ? 'Standard 760px' : 'Full Bleed'}
          </button>

          {/* Nudge Mode Toggle */}
          <button
            onClick={() => setIsNudgeMode(!isNudgeMode)}
            title="Nudge Speech Bubbles"
            className={`p-1.5 rounded bg-background-card border text-xs transition-colors ${
              isNudgeMode ? 'border-manga-cyan text-manga-cyan' : 'border-manga-border text-text-muted hover:text-text-primary'
            }`}
          >
            <Move className="w-4 h-4" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded bg-background-card border border-manga-border text-text-secondary hover:text-text-primary"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Reader Panel Canvas */}
      <main 
        className={`mt-14 pb-20 w-full transition-all duration-300 ${
          widthPreset === 'standard' ? 'max-w-[760px]' : 'max-w-5xl'
        }`}
      >
        {readingMode === 'vertical' ? (
          // Continuous Vertical Webtoon Stack
          <div className="flex flex-col space-y-1">
            {panels.map((panel: any, idx: number) => {
              const panelImg = resolveManhwaPanelImage(panel, idx);
              const panelKey = panel.panelId || panel.id || `panel-${idx}`;
              const balloons: any[] = panel.balloons || [];
              const conceptMarkers: any[] = panel.conceptMarkers || [];

              return (
                <div 
                  key={panelKey} 
                  className="relative w-full bg-black overflow-hidden group shadow-2xl"
                >
                  {/* Panel Image Container */}
                  <div className="relative w-full aspect-[9/14] bg-[#0E0E14]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={panelImg}
                      alt={panel.scenePrompt || 'Manhwa panel'}
                      className="w-full h-full object-cover select-none filter contrast-105"
                      loading={idx <= 1 ? 'eager' : 'lazy'}
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        const fallback = MANHWA_STUDIO_FALLBACKS[idx % MANHWA_STUDIO_FALLBACKS.length];
                        if (target.src !== fallback) {
                          target.src = fallback;
                        }
                      }}
                    />

                    {/* Dark Cinematic Vignette & Gradient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/50 pointer-events-none" />
                    
                    {/* Hover Drawer Tap Zone Overlay */}
                    <div 
                      onClick={() => {
                        if (conceptMarkers.length > 0) {
                          setActiveConcept(conceptMarkers[0]);
                        }
                      }}
                      className="absolute inset-0 bg-transparent cursor-pointer group-hover:bg-purple-900/10 transition-colors"
                    />
                  </div>

                  {/* Decoupled HTML/CSS Speech Balloons */}
                  {balloons.map((b: any, bIdx: number) => {
                    const balloonId = b.id || `b-${idx}-${bIdx}`;
                    const nudge = bubblePositions[balloonId] || { x: 0, y: 0 };
                    const left = Math.min(95, Math.max(5, (b.xPercent ?? 50) + nudge.x));
                    const top = Math.min(95, Math.max(5, (b.yPercent ?? 50) + nudge.y));

                    return (
                      <div
                        key={balloonId}
                        style={{ left: `${left}%`, top: `${top}%` }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 max-w-[280px] p-3 rounded-2xl shadow-2xl backdrop-blur-md pointer-events-auto transition-transform hover:scale-105 z-20 ${
                          b.type === 'narration'
                            ? 'bg-background-card/95 border border-manga-accent/50 rounded-sm text-xs font-sans text-text-primary'
                            : b.type === 'sfx'
                            ? 'bg-transparent text-manga-cyan font-extrabold text-2xl tracking-widest drop-shadow-[0_0_12px_rgba(6,182,212,0.8)] font-heading'
                            : 'bg-white text-zinc-950 border-2 border-black font-semibold text-xs tracking-tight shadow-[0_4px_20px_rgba(0,0,0,0.6)]'
                        }`}
                      >
                        {b.speakerName && (
                          <span className="block text-[9px] uppercase tracking-wider text-manga-violet font-mono mb-0.5 font-bold">
                            {b.speakerName}
                          </span>
                        )}
                        <p className="leading-snug">{b.text}</p>

                        {/* Comic Speech Tail */}
                        {b.type !== 'narration' && b.type !== 'sfx' && (
                          <div className="absolute -bottom-2 left-6 w-3 h-3 overflow-hidden pointer-events-none">
                            <div className="w-3 h-3 bg-white rotate-45 transform origin-top-left border-r-2 border-b-2 border-black"></div>
                          </div>
                        )}

                        {/* Nudge controller when in nudge mode */}
                        {isNudgeMode && (
                          <div className="flex items-center gap-1 mt-1 pt-1 border-t border-black/20 text-[9px]">
                            <button onClick={() => handleNudge(balloonId, 0, -2)} className="px-1 bg-black/20 rounded">▲</button>
                            <button onClick={() => handleNudge(balloonId, 0, 2)} className="px-1 bg-black/20 rounded">▼</button>
                            <button onClick={() => handleNudge(balloonId, -2, 0)} className="px-1 bg-black/20 rounded">◀</button>
                            <button onClick={() => handleNudge(balloonId, 2, 0)} className="px-1 bg-black/20 rounded">▶</button>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Pedagogical Anchor Buttons */}
                  {conceptMarkers.map((cm: any) => (
                    <button
                      key={cm.id || cm.conceptId}
                      onClick={() => setActiveConcept(cm)}
                      className="absolute top-4 right-4 z-30 flex items-center gap-1.5 px-3 py-1 rounded-full bg-manga-violet/85 hover:bg-manga-violet text-white backdrop-blur-md border border-white/20 text-[11px] font-mono shadow-glow-violet transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                      <span>Anchor: {cm.term}</span>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        ) : (
          // Page-by-Page Flip Reader
          <div className="flex flex-col items-center">
            {panels[currentPagedIndex] && (() => {
              const currentPanel = panels[currentPagedIndex] as any;
              const pagedImg = resolveManhwaPanelImage(currentPanel, currentPagedIndex);
              const pagedBalloons: any[] = currentPanel.balloons || [];
              const pagedMarkers: any[] = currentPanel.conceptMarkers || [];

              return (
                <div className="relative w-full aspect-[9/14] bg-black shadow-2xl rounded-xl overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={pagedImg}
                    alt={currentPanel.scenePrompt || 'Manhwa panel'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      const fallback = MANHWA_STUDIO_FALLBACKS[currentPagedIndex % MANHWA_STUDIO_FALLBACKS.length];
                      if (target.src !== fallback) {
                        target.src = fallback;
                      }
                    }}
                  />

                  {/* Balloons for current paged panel */}
                  {pagedBalloons.map((b: any, bIdx: number) => (
                    <div
                      key={b.id || `paged-b-${bIdx}`}
                      style={{ left: `${b.xPercent ?? 50}%`, top: `${b.yPercent ?? 50}%` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 max-w-[280px] p-3 rounded-2xl shadow-2xl backdrop-blur-md pointer-events-auto z-20 ${
                        b.type === 'narration'
                          ? 'bg-background-card/95 border border-manga-accent/50 rounded-sm text-xs font-sans text-text-primary'
                          : 'bg-white text-zinc-950 border-2 border-black font-semibold text-xs tracking-tight'
                      }`}
                    >
                      {b.speakerName && (
                        <span className="block text-[9px] uppercase tracking-wider text-manga-violet font-mono mb-0.5 font-bold">
                          {b.speakerName}
                        </span>
                      )}
                      <p className="leading-snug">{b.text}</p>
                    </div>
                  ))}

                  {/* Anchor */}
                  {pagedMarkers.map((cm: any) => (
                    <button
                      key={cm.id || cm.conceptId}
                      onClick={() => setActiveConcept(cm)}
                      className="absolute top-4 right-4 z-30 flex items-center gap-1.5 px-3 py-1 rounded-full bg-manga-violet text-white text-[11px] font-mono shadow-glow-violet"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                      <span>{cm.term}</span>
                    </button>
                  ))}
                </div>
              );
            })()}

            {/* Paged Navigation Bar */}
            <div className="mt-4 flex items-center justify-between w-full px-4">
              <button
                disabled={currentPagedIndex === 0}
                onClick={() => setCurrentPagedIndex(i => i - 1)}
                className="px-4 py-2 rounded-lg bg-background-card border border-manga-border disabled:opacity-40 text-xs font-semibold"
              >
                ← Previous Panel
              </button>
              <span className="text-xs font-mono text-text-muted">
                Panel {currentPagedIndex + 1} of {panels.length}
              </span>
              <button
                disabled={currentPagedIndex >= panels.length - 1}
                onClick={() => setCurrentPagedIndex(i => i + 1)}
                className="px-4 py-2 rounded-lg bg-background-card border border-manga-border disabled:opacity-40 text-xs font-semibold"
              >
                Next Panel →
              </button>
            </div>
          </div>
        )}

        {/* Chapter Completion & Concept Boss Gate */}
        <section className="mt-12 p-6 sm:p-8 rounded-2xl bg-background-secondary border border-manga-border shadow-2xl text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-manga-violet/20 border border-manga-violet/30 text-manga-accent text-xs font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Chapter 01 Complete • Concepts Mastered</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold font-heading text-text-primary">
            Ready to Prove Your Quantum Knowledge?
          </h2>

          <p className="text-xs text-text-secondary max-w-lg mx-auto">
            To unlock <strong className="text-text-primary">Chapter 02: Wavepacket Dispersion</strong>, defeat the concept boss in a gamified battle.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href={`/quiz/${chapterId}`}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-manga-violet to-manga-indigo text-white font-semibold text-xs shadow-glow-violet hover:brightness-110 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Engage Concept Boss Battle</span>
            </Link>

            <Link
              href="/library"
              className="px-6 py-3 rounded-xl bg-background-card border border-manga-border text-text-secondary hover:text-text-primary text-xs font-medium transition-all"
            >
              Return to Library
            </Link>
          </div>
        </section>
      </main>

      {/* Slide-over Learning Popover Drawer */}
      {activeConcept && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-background-card border border-manga-borderHighlight rounded-2xl p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-manga-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-manga-violet/20 flex items-center justify-center text-manga-accent">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-text-primary">
                    {activeConcept.term}
                  </h3>
                  <span className="text-[10px] text-manga-cyan font-mono">
                    {activeConcept.academicAnchor}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveConcept(null)}
                className="text-text-muted hover:text-text-primary text-xs px-2.5 py-1 rounded bg-background-elevated"
              >
                ✕ Close
              </button>
            </div>

            {/* LaTeX Mathematical Formula Anchor */}
            {activeConcept.formulaLatex && (
              <div className="p-4 rounded-xl bg-background-surface border border-manga-border text-center font-mono text-sm text-manga-cyan overflow-x-auto shadow-inner">
                {activeConcept.formulaLatex}
              </div>
            )}

            {/* Explanation */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
                Pedagogical Derivation & Narrative Anchor
              </span>
              <p className="text-xs text-text-secondary leading-relaxed bg-background-surface/50 p-3.5 rounded-xl border border-manga-border">
                {activeConcept.derivationSnippet}
              </p>
            </div>

            {/* Panel Regeneration / Retry Option */}
            <div className="pt-3 border-t border-manga-border flex items-center justify-between text-xs">
              <span className="text-text-muted text-[11px]">
                Retries Left: <strong className="text-text-primary">{retriesLeft}</strong>
              </span>

              <button
                disabled={retriesLeft <= 0 || isRegenerating !== null}
                onClick={async () => {
                  setIsRegenerating(activeConcept.id);
                  // Simulate in-place diffusion
                  await new Promise(r => setTimeout(r, 2000));
                  setRetriesLeft(r => Math.max(0, r - 1));
                  setIsRegenerating(null);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-manga-violet text-white text-xs font-semibold hover:brightness-110 disabled:opacity-40 transition-all shadow-glow-violet"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                <span>{isRegenerating ? 'Regenerating...' : 'Regenerate Panel'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

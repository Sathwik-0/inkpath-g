'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  BookOpen, 
  ArrowRight, 
  CheckCircle2, 
  Cpu, 
  Layers, 
  ShieldCheck, 
  Flame,
  Zap
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-text-primary overflow-x-hidden">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-background/80 backdrop-blur-xl border-b border-manga-border px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-manga-violet to-manga-cyan p-0.5 flex items-center justify-center shadow-glow-violet">
            <div className="w-full h-full bg-background rounded-[6px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-manga-accent group-hover:rotate-12 transition-transform" />
            </div>
          </div>
          <span className="font-heading font-bold text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-text-primary via-purple-200 to-manga-accent">
            INKPATH
          </span>
          <span className="px-2 py-0.5 rounded-full bg-manga-violet/20 border border-manga-violet/30 text-[10px] font-mono text-manga-accent uppercase tracking-wider">
            Beta
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-xs text-text-secondary">
          <Link href="/explore" className="hover:text-text-primary transition-colors">Explore</Link>
          <Link href="/read/quantum-hunter/ch-01" className="hover:text-text-primary transition-colors">Interactive Reader</Link>
          <Link href="/settings/providers" className="hover:text-text-primary transition-colors">BYOK Enclave</Link>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            href="/auth/signin" 
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/create"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-manga-violet to-manga-indigo text-white text-xs font-semibold hover:brightness-110 shadow-glow-violet transition-all"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Start Free</span>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-28 pb-20 px-4 sm:px-6 max-w-6xl mx-auto flex flex-col items-center text-center">
        {/* Glow Orbs */}
        <div className="absolute top-16 left-1/4 w-96 h-96 bg-manga-violet/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-48 right-10 w-[450px] h-[450px] bg-manga-cyan/10 rounded-full blur-[160px] pointer-events-none" />

        {/* Engine Banner */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-background-card border border-manga-border shadow-sm mb-6">
          <span className="w-2 h-2 rounded-full bg-manga-cyan animate-pulse" />
          <span className="text-[11px] font-mono text-manga-cyan uppercase tracking-wider font-semibold">
            Autonomous AI Manhwa Orchestration Engine
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-heading font-extrabold text-4xl sm:text-6xl text-text-primary tracking-tight leading-tight max-w-4xl mb-6">
          Your next chapter could <br />
          <span className="bg-gradient-to-r from-manga-violet via-manga-cyan to-purple-300 bg-clip-text text-transparent">
            change how you learn.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-text-secondary max-w-2xl mb-8 leading-relaxed">
          Transform dry academic PDFs, dense arXiv papers, and lecture transcripts into serialized, full-color Korean manhwa. Master advanced quantum mechanics, neural networks, and biochemistry through stories you will stay up all night to finish.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
          <Link
            href="/create"
            className="group px-6 py-3.5 rounded-xl bg-gradient-to-r from-manga-violet to-manga-indigo text-white font-semibold text-sm shadow-glow-violet hover:brightness-110 transition-all flex items-center gap-2.5"
          >
            <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            <span>Create Your First Manga</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/20 text-white">
              3 Free Chapters
            </span>
          </Link>

          <Link
            href="/read/quantum-hunter/ch-01"
            className="px-6 py-3.5 rounded-xl bg-background-card hover:bg-background-elevated border border-manga-border text-text-primary font-medium text-sm transition-all flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4 text-manga-cyan" />
            <span>Read Demo Chapter</span>
          </Link>
        </div>

        {/* Interactive Transformation Canvas */}
        <div className="w-full rounded-2xl bg-background-secondary border border-manga-border p-4 sm:p-6 shadow-2xl text-left">
          {/* Header bar */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-manga-border">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-mono text-text-muted ml-2">
                MIT_8.04_Quantum_Superposition_Proof.pdf → S1_EP01_Schrodingers_Abyss.manga
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
              AUTONOMOUS RIG ENGINE: ACTIVE
            </span>
          </div>

          {/* Split View */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left: Academic Curriculum Ingest */}
            <div className="lg:col-span-5 flex flex-col justify-between p-5 rounded-xl bg-background-surface border border-manga-border">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
                    Source Material (Ingested)
                  </span>
                  <span className="text-[10px] font-mono text-manga-cyan bg-manga-cyan/10 px-2 py-0.5 rounded">
                    LATEX ARX-8042
                  </span>
                </div>

                <div className="p-3 bg-background-card rounded-lg mb-3 border border-manga-border">
                  <p className="font-semibold text-xs text-text-primary mb-0.5">MIT 8.04 Quantum Physics I</p>
                  <p className="text-[11px] text-text-muted">Prof. Barton Zwiebach • Superposition & Wave Collapse</p>
                </div>

                <div className="space-y-2 font-mono text-[11px] leading-relaxed text-text-muted p-3 bg-background-card/50 rounded-lg border border-manga-border">
                  <p className="text-manga-cyan">iℏ ∂/∂t |Ψ(x,t)⟩ = Ĥ |Ψ(x,t)⟩</p>
                  <p>Theorem 4.1: The state vector |ψ⟩ resides as a coherent superposition of eigenstates until measurement induces stochastic projection.</p>
                  <p className="text-manga-accent">Δx · Δp ≥ ℏ/2</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between p-2.5 rounded-lg bg-background-card border border-manga-border text-xs">
                <span className="text-text-secondary flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Synthesizing Lore Anchors & Character Rigs...
                </span>
                <span className="font-mono text-emerald-400 text-[10px]">100% RIGGED</span>
              </div>
            </div>

            {/* Right: Manhwa Visual Panel with Decoupled Bubble */}
            <div className="lg:col-span-7 relative overflow-hidden rounded-xl bg-black border border-manga-border shadow-2xl min-h-[380px] flex flex-col justify-end p-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/panels/action-panel-1.png"
                alt="Manhwa Action Panel"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background-secondary via-background-secondary/30 to-transparent" />

              {/* Speech Bubble Overlay */}
              <div className="relative z-10 max-w-sm p-3.5 rounded-2xl rounded-bl-none bg-background-card/95 backdrop-blur-md border border-manga-accent/40 shadow-xl space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono text-manga-violet font-bold uppercase">
                    Jin Woo-Hyun • Grade S Quantum Hunter
                  </span>
                  <span className="text-[10px] font-mono text-manga-cyan">ΔxΔp ≥ ℏ/2</span>
                </div>
                <p className="text-xs text-text-primary leading-snug">
                  "If the wavepacket collapses before we breach the dimensional seal, our entire team decoheres!"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <section className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <div className="p-6 rounded-2xl bg-background-card border border-manga-border space-y-3">
            <div className="w-10 h-10 rounded-xl bg-manga-violet/20 flex items-center justify-center text-manga-accent">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-base text-text-primary">Immersive Webtoon Reader</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Full-bleed vertical webtoon or page-by-page flip mode. Artwork and text are decoupled so you can tap any equation or concept anchor to open derivation popovers without interrupting reading.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-background-card border border-manga-border space-y-3">
            <div className="w-10 h-10 rounded-xl bg-manga-cyan/20 flex items-center justify-center text-manga-cyan">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-base text-text-primary">Ephemeral BYOK Enclave</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Bring your own Gemini, OpenAI, or Claude API keys. Encrypted at rest via AES-256-GCM. Never logged, never visible to client bundles, with zero platform markup on token usage.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-background-card border border-manga-border space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-base text-text-primary">Concept Boss Battles</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Turn passive reading into active mastery. Defeat gamified concept bosses with LaTeX derivations to prove comprehension and unlock subsequent chapters.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-manga-border py-8 px-6 text-center text-xs text-text-muted">
        <p>© 2026 InkPath AI. Autonomous Manhwa & Pedagogy Engine. All art and characters are original productions.</p>
      </footer>
    </div>
  );
}

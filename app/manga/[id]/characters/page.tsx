'use client';

import React, { useState } from 'react';
import { StudioShell } from '@/components/layout/StudioShell';
import { DEMO_CHARACTERS, DEMO_MANGA } from '@/lib/mock-data/quantum-hunter';
import { Users, Sparkles, RefreshCw, Layers, ShieldCheck } from 'lucide-react';

export default function CharacterBiblePage() {
  const [selectedChar, setSelectedChar] = useState<any | null>(null);
  const [testPrompt, setTestPrompt] = useState('Standing atop a glowing quantum pillar unsheathing violet katana');
  const [isGeneratingTest, setIsGeneratingTest] = useState(false);

  return (
    <StudioShell>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-manga-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-manga-violet/20 text-manga-accent border border-manga-violet/30 font-bold">
                Series Character Bible
              </span>
              <span className="text-[10px] font-mono text-emerald-400">
                ● Turnaround Sheets Bound to Project
              </span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl text-text-primary mt-1">
              {DEMO_MANGA.title}
            </h1>
          </div>
        </div>

        {/* Characters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {DEMO_CHARACTERS.map((char) => (
            <div
              key={char.id}
              className="rounded-2xl border border-manga-border bg-background-card overflow-hidden shadow-xl p-5 space-y-4"
            >
              <div className="flex gap-4 items-start">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={char.avatarUrl}
                  alt={char.name}
                  className="w-24 h-28 rounded-xl object-cover border border-manga-border shadow-md"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-bold text-base text-text-primary">
                      {char.name}
                    </h3>
                    <span className="text-[11px] font-mono text-text-muted">
                      {char.koreanName}
                    </span>
                  </div>
                  <span className="inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-manga-violet/20 text-manga-accent">
                    {char.archetype}
                  </span>
                  <p className="text-xs text-text-muted leading-relaxed pt-1">
                    {char.personality}
                  </p>
                </div>
              </div>

              {/* Visual Traits */}
              <div className="p-3 bg-background-surface rounded-xl border border-manga-border text-xs space-y-1.5">
                <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider block">
                  Fixed Visual Attributes (LoRA Anchor)
                </span>
                <p><strong className="text-text-primary">Hair:</strong> {char.visualAttributes.hair}</p>
                <p><strong className="text-text-primary">Eyes:</strong> {char.visualAttributes.eyes}</p>
                <p><strong className="text-text-primary">Outfit:</strong> {char.visualAttributes.outfit}</p>
              </div>

              <button
                onClick={() => setSelectedChar(char)}
                className="w-full py-2 rounded-xl bg-background-surface hover:bg-background-elevated border border-manga-border text-xs font-semibold text-text-primary transition-all flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-manga-cyan" />
                <span>Test Scene Prompt with Character</span>
              </button>
            </div>
          ))}
        </div>

        {/* Prompt Test Modal */}
        {selectedChar && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-background-card border border-manga-borderHighlight rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-manga-border pb-3">
                <h3 className="font-heading font-bold text-base text-text-primary">
                  Test Character Consistency: {selectedChar.name}
                </h3>
                <button
                  onClick={() => setSelectedChar(null)}
                  className="text-text-muted hover:text-text-primary text-xs px-2.5 py-1 rounded bg-background-elevated"
                >
                  ✕ Close
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-text-muted uppercase">Scene Prompt Modifier</label>
                <textarea
                  rows={3}
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  className="w-full bg-background-surface border border-manga-border rounded-xl p-3 text-xs text-text-primary font-mono focus:outline-none focus:border-manga-violet"
                />
              </div>

              <div className="p-3 rounded-xl bg-background-surface/60 border border-manga-border text-[11px] text-text-muted leading-relaxed">
                Appends the project turnaround reference sheet and fixed visual tokens to the system prompt in Section 9.
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  disabled={isGeneratingTest}
                  onClick={async () => {
                    setIsGeneratingTest(true);
                    await new Promise(r => setTimeout(r, 2000));
                    setIsGeneratingTest(false);
                    setSelectedChar(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-manga-violet text-white text-xs font-semibold hover:brightness-110 shadow-glow-violet flex items-center gap-1.5"
                >
                  {isGeneratingTest ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>{isGeneratingTest ? 'Synthesizing...' : 'Run Test Generation'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </StudioShell>
  );
}

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, BookOpen, Layers, CheckCircle2, ArrowRight } from 'lucide-react';

export default function OnboardingWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [purpose, setPurpose] = useState('stem_study');
  const [preferredGenre, setPreferredGenre] = useState('sci_fi');
  const [readingMode, setReadingMode] = useState('vertical_scroll');

  const handleFinish = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 relative overflow-hidden select-none">
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-manga-violet/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-xl bg-background-card border border-manga-border p-8 rounded-2xl shadow-2xl space-y-6 relative z-10">
        <div className="flex items-center justify-between border-b border-manga-border pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-manga-accent" />
            <span className="font-heading font-bold text-base text-text-primary">
              InkPath Lorekeeper Setup
            </span>
          </div>
          <span className="text-xs font-mono text-manga-cyan">
            Step {step} of 3
          </span>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-heading font-bold text-xl text-text-primary">
              What is your primary learning mission?
            </h2>
            <p className="text-xs text-text-muted">
              We tune pedagogical pacing, concept marker density, and character dialogue to match your goals.
            </p>

            <div className="grid grid-cols-1 gap-3 pt-2">
              {[
                { id: 'stem_study', title: 'Hard STEM Coursework & Exams', desc: 'Quantum mechanics, machine learning, organic chemistry, or algorithms.' },
                { id: 'visual_learner', title: 'I Find Dense Textbooks Hard to Read', desc: 'Turn dry papers and transcripts into stories you cannot put down.' },
                { id: 'creator', title: 'Educational Manga Creator', desc: 'Author original graphic learning materials for students and fans.' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setPurpose(opt.id)}
                  className={`p-4 rounded-xl border text-left space-y-1 transition-all ${
                    purpose === opt.id
                      ? 'border-manga-violet bg-manga-violet/15 text-white font-semibold shadow-glow-violet'
                      : 'border-manga-border bg-background-surface text-text-secondary'
                  }`}
                >
                  <p className="text-xs font-bold">{opt.title}</p>
                  <p className="text-[11px] text-text-muted">{opt.desc}</p>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full mt-4 py-3 rounded-xl bg-manga-violet text-white text-xs font-semibold hover:brightness-110 shadow-glow-violet flex items-center justify-center gap-1.5"
            >
              <span>Next: Story Presentation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-heading font-bold text-xl text-text-primary">
              Choose your default manhwa genre
            </h2>
            <p className="text-xs text-text-muted">
              Subject decides learning structure; genre decides presentation and visual metaphors.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                { id: 'sci_fi', title: 'Cyberpunk Sci-Fi', desc: 'Holographic formulas & neon equations' },
                { id: 'action', title: 'Hunter Dungeon Action', desc: 'Monster ranks & weaponized proofs' },
                { id: 'fantasy', title: 'High Magic Academy', desc: 'Spells powered by physical laws' },
                { id: 'thriller', title: 'Psychological Thriller', desc: 'High-stakes tactical deductions' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setPreferredGenre(opt.id)}
                  className={`p-3.5 rounded-xl border text-left space-y-1 transition-all ${
                    preferredGenre === opt.id
                      ? 'border-manga-violet bg-manga-violet/15 text-white font-semibold shadow-glow-violet'
                      : 'border-manga-border bg-background-surface text-text-secondary'
                  }`}
                >
                  <p className="text-xs font-bold">{opt.title}</p>
                  <p className="text-[10px] text-text-muted">{opt.desc}</p>
                </button>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep(1)}
                className="py-3 px-4 rounded-xl bg-background-surface border border-manga-border text-xs text-text-muted"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 rounded-xl bg-manga-violet text-white text-xs font-semibold hover:brightness-110 shadow-glow-violet flex items-center justify-center gap-1.5"
              >
                <span>Next: Reader Experience</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-heading font-bold text-xl text-text-primary">
              Preferred Reading Viewport
            </h2>
            <p className="text-xs text-text-muted">
              You can toggle between both modes anytime inside the reader.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                { id: 'vertical_scroll', title: 'Continuous Webtoon Scroll', desc: 'Edge-to-edge stacked manhwa panels with decoupled overlays.' },
                { id: 'paged_flip', title: 'Page-by-Page Flip', desc: 'One panel at a time with arrow-key and mobile swipe navigation.' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setReadingMode(opt.id)}
                  className={`p-4 rounded-xl border text-left space-y-1 transition-all ${
                    readingMode === opt.id
                      ? 'border-manga-violet bg-manga-violet/15 text-white font-semibold shadow-glow-violet'
                      : 'border-manga-border bg-background-surface text-text-secondary'
                  }`}
                >
                  <p className="text-xs font-bold">{opt.title}</p>
                  <p className="text-[10px] text-text-muted">{opt.desc}</p>
                </button>
              ))}
            </div>

            <button
              onClick={handleFinish}
              className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-manga-violet to-manga-indigo text-white text-xs font-semibold hover:brightness-110 shadow-glow-violet flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Complete Setup & Enter Studio (3 Free Chapters)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

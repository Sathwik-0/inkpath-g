'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Award, ShieldAlert, Sparkles, CheckCircle2, ChevronRight, RotateCcw } from 'lucide-react';

export interface QuizQuestion {
  id: string;
  conceptTitle: string;
  scenarioDialogue: string;
  equationPrompt?: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation: string;
}

export function QuizBossBattle({
  bossName = 'The Decoherence Colossus',
  bossMaxHp = 100,
  chapterNumber = 1,
  questions = [],
  onComplete,
}: {
  bossName?: string;
  bossMaxHp?: number;
  chapterNumber?: number;
  questions: QuizQuestion[];
  onComplete?: (score: number) => void;
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [bossHp, setBossHp] = useState(bossMaxHp);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [unlockedNext, setUnlockedNext] = useState(false);

  const q = questions[currentIdx];

  const handleSelect = (optionId: string) => {
    if (isAnswered) return;
    setSelectedOption(optionId);
    setIsAnswered(true);

    const chosen = q.options.find((o) => o.id === optionId);
    if (chosen?.isCorrect) {
      setScore((s) => s + 1);
      const damage = Math.round(bossMaxHp / questions.length);
      setBossHp((hp) => Math.max(0, hp - damage));
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 >= questions.length) {
      setUnlockedNext(true);
      if (onComplete) onComplete(score);
    } else {
      setSelectedOption(null);
      setIsAnswered(false);
      setCurrentIdx((i) => i + 1);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setBossHp(bossMaxHp);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setUnlockedNext(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Boss Health Status */}
      <div className="rounded-2xl border border-manga-border bg-background-card p-5 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <div>
              <span className="text-[10px] font-mono text-rose-400 uppercase tracking-widest font-bold">
                CONCEPT BOSS BATTLE • CHAPTER {chapterNumber}
              </span>
              <h2 className="font-heading font-bold text-lg text-text-primary">{bossName}</h2>
            </div>
          </div>
          <span className="font-mono text-sm text-text-primary font-bold">
            {bossHp} / {bossMaxHp} HP
          </span>
        </div>

        {/* HP Bar */}
        <div className="w-full h-3 rounded-full bg-background-surface overflow-hidden border border-manga-border">
          <div
            className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${(bossHp / bossMaxHp) * 100}%` }}
          />
        </div>
      </div>

      {currentIdx < questions.length && !unlockedNext ? (
        // Active Question Card
        <div className="rounded-2xl border border-manga-borderHighlight bg-background-card p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-manga-border pb-3">
            <span className="text-xs font-mono text-manga-accent">
              Phase {currentIdx + 1} of {questions.length} • {q.conceptTitle}
            </span>
            <span className="text-xs font-mono text-text-muted">Mastery Score: {score}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-background-surface border border-manga-border italic text-xs text-text-secondary leading-relaxed">
            "{q.scenarioDialogue}"
          </div>

          {q.equationPrompt && (
            <div className="p-3.5 rounded-lg bg-background-elevated text-center font-mono text-sm text-manga-cyan border border-manga-border">
              {q.equationPrompt}
            </div>
          )}

          <div className="space-y-2.5">
            {q.options.map((opt) => {
              let btnStyle = 'border-manga-border hover:border-manga-violet/50 bg-background-surface';
              if (isAnswered) {
                if (opt.isCorrect) btnStyle = 'border-emerald-500 bg-emerald-500/15 text-emerald-300 font-semibold';
                else if (selectedOption === opt.id) btnStyle = 'border-rose-500 bg-rose-500/15 text-rose-300';
              }

              return (
                <button
                  key={opt.id}
                  disabled={isAnswered}
                  onClick={() => handleSelect(opt.id)}
                  className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all ${btnStyle}`}
                >
                  {opt.text}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div className="pt-4 border-t border-manga-border flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-text-secondary max-w-md">{q.explanation}</p>
              <button
                onClick={handleNext}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-manga-violet text-white text-xs font-semibold hover:brightness-110 shadow-glow-violet transition-all flex items-center justify-center gap-1.5"
              >
                <span>{currentIdx + 1 === questions.length ? 'Finalize Battle' : 'Next Phase'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        // Victory Card & Unlock Gateway
        <div className="rounded-2xl border border-manga-border bg-background-card p-8 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <h2 className="font-heading font-bold text-2xl text-text-primary">
              Boss Defeated: Concept Mastered!
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              You scored {score} / {questions.length} and unlocked the Chapter 02 derivation relic.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-background-surface border border-manga-border inline-flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-mono text-emerald-400">
              FREE CHAPTER 02 PERMISSION UNLOCKED
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/read/quantum-hunter/ch-01"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-manga-violet to-manga-indigo text-white font-semibold text-xs shadow-glow-violet"
            >
              Back to Reader
            </Link>
            <button
              onClick={handleRestart}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-background-card border border-manga-border text-text-secondary hover:text-text-primary text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Battle</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { StudioShell } from '@/components/layout/StudioShell';
import { Settings, User, Eye, Sparkles, CheckCircle2 } from 'lucide-react';

export default function GeneralSettingsPage() {
  const [displayName, setDisplayName] = useState('Ren Jin');
  const [preferredMode, setPreferredMode] = useState<'vertical_scroll' | 'paged_flip'>('vertical_scroll');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <StudioShell>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="border-b border-manga-border pb-4">
          <h1 className="font-heading font-extrabold text-2xl text-text-primary">
            General Settings & Reader Preferences
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Manage your profile, default reading viewport, and pedagogical display modes
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-background-card border border-manga-border space-y-5 shadow-xl">
          {/* Display Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-text-muted uppercase">Display Name / Lorekeeper Alias</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-background-surface border border-manga-border rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-manga-violet"
            />
          </div>

          {/* Reading Mode */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-text-muted uppercase">Default Reader Viewport</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPreferredMode('vertical_scroll')}
                className={`p-4 rounded-xl border text-left space-y-1 transition-all ${
                  preferredMode === 'vertical_scroll'
                    ? 'border-manga-violet bg-manga-violet/15 text-white font-semibold shadow-glow-violet'
                    : 'border-manga-border bg-background-surface text-text-secondary'
                }`}
              >
                <p className="text-xs font-bold">Continuous Vertical Webtoon</p>
                <p className="text-[11px] text-text-muted">Infinite scroll optimized for mobile and edge-to-edge reading.</p>
              </button>

              <button
                type="button"
                onClick={() => setPreferredMode('paged_flip')}
                className={`p-4 rounded-xl border text-left space-y-1 transition-all ${
                  preferredMode === 'paged_flip'
                    ? 'border-manga-violet bg-manga-violet/15 text-white font-semibold shadow-glow-violet'
                    : 'border-manga-border bg-background-surface text-text-secondary'
                }`}
              >
                <p className="text-xs font-bold">Page-by-Page Flip</p>
                <p className="text-[11px] text-text-muted">Standard book layout with arrow key and swipe transitions.</p>
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-manga-border flex items-center justify-between">
            {saved ? (
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Preferences updated!
              </span>
            ) : <span />}

            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-manga-violet text-white text-xs font-semibold hover:brightness-110 shadow-glow-violet transition-all"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </StudioShell>
  );
}

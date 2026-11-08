'use client';

import React from 'react';
import { StudioShell } from '@/components/layout/StudioShell';
import { ShieldCheck, Zap, Sparkles, CreditCard, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function UsageQuotaPage() {
  return (
    <StudioShell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-manga-border pb-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
              Usage & Entitlements
            </span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-text-primary mt-1">
            Free Chapter Quota & Usage Ledger
          </h1>
        </div>

        {/* Free Tier Allowance Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-background-card border border-manga-border space-y-2">
            <span className="text-xs font-mono text-text-muted">FREE CHAPTERS REMAINING</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-heading font-bold text-text-primary">3</span>
              <span className="text-xs font-mono text-text-muted">/ 3 chapters</span>
            </div>
            <div className="w-full h-2 rounded-full bg-background-surface overflow-hidden">
              <div className="h-full bg-manga-violet w-full" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-background-card border border-manga-border space-y-2">
            <span className="text-xs font-mono text-text-muted">PANELS RENDERED</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-heading font-bold text-text-primary">14</span>
              <span className="text-xs font-mono text-text-muted">panels</span>
            </div>
            <p className="text-[10px] text-text-muted">Gemini Nano Banana + Imagen 3</p>
          </div>

          <div className="p-5 rounded-2xl bg-background-card border border-manga-border space-y-2">
            <span className="text-xs font-mono text-text-muted">RETRY BUDGET PER CHAPTER</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-heading font-bold text-emerald-400">1</span>
              <span className="text-xs font-mono text-text-muted">free in-place retry</span>
            </div>
            <p className="text-[10px] text-text-muted">Active on each educational panel</p>
          </div>
        </div>

        {/* Managed Credits Placeholder Screen (as required by Section 7) */}
        <div className="p-6 rounded-2xl bg-background-card border border-manga-borderHighlight space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-manga-cyan/20 flex items-center justify-center text-manga-cyan">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-text-primary">
                  Managed Cloud Credits (Coming Soon)
                </h3>
                <p className="text-xs text-text-muted">
                  Prepaid generation without needing your own cloud developer accounts
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-background-elevated text-text-muted">
              Placeholder Mode
            </span>
          </div>

          <p className="text-xs text-text-secondary leading-relaxed bg-background-surface p-4 rounded-xl border border-manga-border">
            After using your 3 free platform-funded chapters, you can seamlessly connect your own API key on the <Link href="/settings/providers" className="text-manga-cyan underline">BYOK page</Link>. When you bring your own key, external providers bill you directly at base rates with zero platform fee.
          </p>
        </div>

        {/* Recent Activity Ledger */}
        <div className="space-y-3">
          <h3 className="font-heading font-bold text-sm text-text-primary">
            Recent Activity Ledger
          </h3>
          <div className="rounded-xl border border-manga-border bg-background-card divide-y divide-manga-border text-xs">
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Account Onboarding Bonus: 3 Free Chapters Assigned</span>
              </div>
              <span className="font-mono text-emerald-400">+3 Chapters</span>
            </div>
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-text-muted" />
                <span>Demo Chapter Render: The Quantum Hunter Ch. 01</span>
              </div>
              <span className="font-mono text-text-muted">0 Spent (Platform Seed)</span>
            </div>
          </div>
        </div>
      </div>
    </StudioShell>
  );
}

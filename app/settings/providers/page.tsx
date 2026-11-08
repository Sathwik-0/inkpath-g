'use client';

import React, { useState } from 'react';
import { StudioShell } from '@/components/layout/StudioShell';
import { ProviderCard, ProviderConfig } from '@/components/settings/ProviderCard';
import { AI_MODELS_CONFIG } from '@/lib/ai-gateway/config';
import { Shield, Lock, Cpu, Info } from 'lucide-react';

export default function AIProvidersSettingsPage() {
  const [providers, setProviders] = useState<ProviderConfig[]>([
    {
      id: 'gemini',
      name: AI_MODELS_CONFIG.gemini.name,
      badge: AI_MODELS_CONFIG.gemini.badge,
      models: [...AI_MODELS_CONFIG.gemini.models],
      capabilities: [...AI_MODELS_CONFIG.gemini.capabilities],
      status: 'connected',
      maskedKey: 'AIza...7891',
      docsUrl: AI_MODELS_CONFIG.gemini.docsUrl,
    },
    {
      id: 'openai',
      name: AI_MODELS_CONFIG.openai.name,
      badge: AI_MODELS_CONFIG.openai.badge,
      models: [...AI_MODELS_CONFIG.openai.models],
      capabilities: [...AI_MODELS_CONFIG.openai.capabilities],
      status: 'disconnected',
      docsUrl: AI_MODELS_CONFIG.openai.docsUrl,
    },
    {
      id: 'claude',
      name: AI_MODELS_CONFIG.claude.name,
      badge: AI_MODELS_CONFIG.claude.badge,
      models: [...AI_MODELS_CONFIG.claude.models],
      capabilities: [...AI_MODELS_CONFIG.claude.capabilities],
      status: 'disconnected',
      docsUrl: AI_MODELS_CONFIG.claude.docsUrl,
    },
  ]);

  const handleSaveKey = async (id: 'gemini' | 'openai' | 'claude', apiKey: string, selectedModel: string) => {
    const res = await fetch('/api/providers/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: id,
        apiKey,
        selectedModel,
      }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      setProviders(prev => prev.map(p => {
        if (p.id === id) {
          return {
            ...p,
            status: 'connected',
            maskedKey: data.maskedKey,
          };
        }
        return p;
      }));
      return { success: true };
    }
    return { success: false, message: data.error };
  };

  const handleDeleteKey = async (id: 'gemini' | 'openai' | 'claude') => {
    await fetch('/api/providers/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: id }),
    });

    setProviders(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          status: 'disconnected',
          maskedKey: undefined,
        };
      }
      return p;
    }));
  };

  return (
    <StudioShell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-manga-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-manga-cyan/20 text-manga-cyan border border-manga-cyan/30 font-bold">
                Zero-Knowledge Enclave
              </span>
              <span className="text-[10px] font-mono text-emerald-400">
                ● AES-256-GCM Hardware Sealed
              </span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl text-text-primary mt-1">
              AI Providers & BYOK Key Management
            </h1>
          </div>
        </div>

        {/* Security Enclave Notice */}
        <div className="p-4 rounded-xl bg-background-card border border-manga-border flex items-start gap-3">
          <Shield className="w-5 h-5 text-manga-accent flex-shrink-0 mt-0.5" />
          <div className="text-xs text-text-secondary space-y-1">
            <p className="font-semibold text-text-primary">Zero Plaintext Persistence Guarantee</p>
            <p>
              Your personal API keys are encrypted at rest with AES-256-GCM. They are held in transient memory only during active inference pipelines, and are never logged, exposed to client bundles, or accessible by third parties.
            </p>
          </div>
        </div>

        {/* Provider Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {providers.map((p) => (
            <ProviderCard
              key={p.id}
              provider={p}
              onSaveKey={handleSaveKey}
              onDeleteKey={handleDeleteKey}
            />
          ))}
        </div>
      </div>
    </StudioShell>
  );
}

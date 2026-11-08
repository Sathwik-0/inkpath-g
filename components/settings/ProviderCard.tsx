'use client';

import React, { useState } from 'react';
import { Shield, Key, CheckCircle2, AlertCircle, RefreshCw, Trash2, ExternalLink } from 'lucide-react';

export interface ProviderConfig {
  id: 'gemini' | 'openai' | 'claude';
  name: string;
  badge: string;
  models: string[];
  capabilities: string[];
  status: 'connected' | 'invalid' | 'quota_exceeded' | 'disconnected';
  maskedKey?: string;
  docsUrl: string;
}

export function ProviderCard({
  provider,
  onSaveKey,
  onDeleteKey,
}: {
  provider: ProviderConfig;
  onSaveKey: (id: 'gemini' | 'openai' | 'claude', key: string, model: string) => Promise<{ success: boolean; message?: string }>;
  onDeleteKey?: (id: 'gemini' | 'openai' | 'claude') => Promise<void>;
}) {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState(provider.models[0]);
  const [isTesting, setIsTesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleConnect = async () => {
    if (!apiKey) return;
    setIsTesting(true);
    setStatusMessage(null);
    try {
      const res = await onSaveKey(provider.id, apiKey, selectedModel);
      if (res.success) {
        setApiKey('');
        setStatusMessage('Provider key encrypted and verified successfully!');
      } else {
        setStatusMessage(res.message || 'Key validation failed. Please verify provider key.');
      }
    } catch (err: any) {
      setStatusMessage(err.message || 'Validation error');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-manga-border bg-background-card p-5 space-y-4 shadow-lg hover:border-manga-borderHighlight transition-all">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-heading font-bold text-base text-text-primary">{provider.name}</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-background-elevated text-text-muted">
              {provider.badge}
            </span>
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            {provider.capabilities.join(' • ')}
          </p>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          {provider.status === 'connected' ? (
            <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Connected
            </span>
          ) : provider.status === 'quota_exceeded' ? (
            <span className="flex items-center gap-1 text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
              <AlertCircle className="w-3.5 h-3.5" />
              Quota Exceeded
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              <AlertCircle className="w-3.5 h-3.5" />
              Setup Needed
            </span>
          )}
        </div>
      </div>

      {/* Model Selection */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
          Active Inference Target Model
        </label>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="w-full bg-background-surface border border-manga-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-manga-violet"
        >
          {provider.models.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* Key Input / Masked Display */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono text-text-muted">
          <span>CLIENT-SIDE ENCLAVE KEY (AES-256-GCM)</span>
          <a 
            href={provider.docsUrl} 
            target="_blank" 
            rel="noreferrer"
            className="text-[10px] text-manga-cyan hover:underline flex items-center gap-1"
          >
            <span>Get API Key</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {provider.maskedKey ? (
          <div className="flex items-center justify-between bg-background-surface border border-manga-border rounded-lg px-3 py-2 text-xs">
            <span className="font-mono text-text-primary">Key: {provider.maskedKey}</span>
            {onDeleteKey && (
              <button
                onClick={() => onDeleteKey(provider.id)}
                className="text-text-muted hover:text-rose-400 text-xs flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            )}
          </div>
        ) : (
          <div className="relative">
            <input
              type="password"
              placeholder={`Paste raw ${provider.name} API key...`}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-background-surface border border-manga-border rounded-lg pl-3 pr-24 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-manga-violet"
            />
            <button
              disabled={!apiKey || isTesting}
              onClick={handleConnect}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 rounded bg-manga-violet text-white text-[10px] font-semibold hover:brightness-110 disabled:opacity-50 transition-all"
            >
              {isTesting ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Verify & Save'}
            </button>
          </div>
        )}
      </div>

      {statusMessage && (
        <p className="text-[11px] text-manga-accent font-mono bg-background-surface/80 p-2 rounded border border-manga-border">
          {statusMessage}
        </p>
      )}

      {/* Pricing / Consumer warning copy as mandated by Section 6 */}
      <div className="p-2.5 rounded-lg bg-background-surface/40 border border-manga-border text-[10px] text-text-muted leading-relaxed">
        API usage is billed directly by {provider.name}. Note: A consumer web subscription (e.g., ChatGPT Plus, Gemini Advanced, Claude Pro) is <strong>not</strong> an API key and cannot be used here.
      </div>
    </div>
  );
}

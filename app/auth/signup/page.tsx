'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Sparkles, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            full_name: username,
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        router.push('/onboarding');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 select-none relative overflow-hidden">
      <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-manga-cyan/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md bg-background-card border border-manga-border p-8 rounded-2xl shadow-2xl space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-manga-violet to-manga-cyan p-0.5 flex items-center justify-center shadow-glow-violet">
              <div className="w-full h-full bg-background rounded-[6px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-manga-accent group-hover:rotate-12 transition-transform" />
              </div>
            </div>
            <span className="font-heading font-extrabold text-xl tracking-wider text-text-primary">
              INKPATH
            </span>
          </Link>
          <h1 className="font-heading font-bold text-2xl text-text-primary">
            Create Your Account
          </h1>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Includes 3 Free Personal Chapters</span>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-mono text-text-muted uppercase">Username / Alias</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ren"
              className="w-full bg-background-surface border border-manga-border rounded-xl px-4 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-manga-violet"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-text-muted uppercase">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ren@inkpath.ai"
              className="w-full bg-background-surface border border-manga-border rounded-xl px-4 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-manga-violet"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-text-muted uppercase">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-background-surface border border-manga-border rounded-xl px-4 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-manga-violet"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-manga-violet to-manga-indigo text-white font-semibold text-xs shadow-glow-violet hover:brightness-110 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Claim 3 Free Chapters & Start</span>}
          </button>
        </form>

        <p className="text-center text-xs text-text-muted">
          Already registered?{' '}
          <Link href="/auth/signin" className="text-manga-cyan hover:underline font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

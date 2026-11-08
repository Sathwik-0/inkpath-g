'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Sparkles, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Google OAuth failed');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 select-none relative overflow-hidden">
      {/* Glow Orbs */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-manga-violet/15 rounded-full blur-[140px] pointer-events-none" />

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
            Sign In to Lorekeeper Portal
          </h1>
          <p className="text-xs text-text-secondary">
            Access your serialized manhwa chapters, character rigs, and curriculum progress
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-4">
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
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Sign In</span>}
          </button>
        </form>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-manga-border w-full" />
          <span className="bg-background-card px-3 text-[10px] font-mono text-text-muted uppercase">
            Or continue with
          </span>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full py-2.5 rounded-xl bg-background-surface border border-manga-border hover:bg-background-elevated text-xs font-medium text-text-primary transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
          </svg>
          <span>Continue with Google</span>
        </button>

        <p className="text-center text-xs text-text-muted">
          Need an account?{' '}
          <Link href="/auth/signup" className="text-manga-cyan hover:underline font-semibold">
            Sign up for 3 free chapters
          </Link>
        </p>
      </div>
    </div>
  );
}

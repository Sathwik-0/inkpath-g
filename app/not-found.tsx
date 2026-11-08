import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="space-y-4 max-w-md">
        <span className="text-xs font-mono uppercase px-3 py-1 rounded bg-manga-violet/20 text-manga-accent border border-manga-violet/30 font-bold">
          404 - Panel Not Found
        </span>
        <h1 className="font-heading font-extrabold text-3xl text-text-primary">
          Dimensional Boundary Breach
        </h1>
        <p className="text-sm text-text-secondary leading-relaxed">
          The requested manhwa chapter or panel could not be located in this coordinate space.
        </p>
        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-manga-violet hover:bg-manga-violet/90 text-white font-semibold text-xs tracking-wide shadow-glow-violet transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Return to Catalog</span>
          </Link>
        </div>
      </div>
    </div>
  );
}


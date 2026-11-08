'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BookOpen, 
  Compass, 
  Sparkles, 
  LayoutDashboard, 
  Bookmark, 
  Users, 
  Layers, 
  Cpu, 
  Settings, 
  Search,
  Bell,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const navSections: { title?: string; items: NavItem[] }[] = [
  {
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'My Library', href: '/library', icon: Bookmark },
      { label: 'Create Studio', href: '/create', icon: Sparkles, badge: 'New' },
      { label: 'Explore Manga', href: '/explore', icon: Compass },
    ],
  },
  {
    title: 'SERIES & MANGA STUDIO',
    items: [
      { label: 'Webtoon Reader', href: '/read/quantum-hunter/ch-01', icon: BookOpen },
      { label: 'Character Bible', href: '/manga/quantum-hunter/characters', icon: Users },
      { label: 'Story & Chapters', href: '/manga/quantum-hunter/manage', icon: Layers },
    ],
  },
  {
    title: 'INFRASTRUCTURE & ENGINE',
    items: [
      { label: 'AI Providers (BYOK)', href: '/settings/providers', icon: Cpu },
      { label: 'Usage & Quota', href: '/settings/usage', icon: ShieldCheck },
      { label: 'General Settings', href: '/settings', icon: Settings },
    ],
  },
];

export function StudioShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-background text-text-primary overflow-hidden font-sans">
      {/* Sidebar Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-manga-border bg-background-secondary/95 backdrop-blur-md flex flex-col justify-between transition-transform duration-300 md:static md:translate-x-0 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div>
          {/* Brand Header */}
          <div className="p-5 flex items-center justify-between border-b border-manga-border">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-manga-violet to-manga-cyan p-0.5 flex items-center justify-center shadow-glow-violet">
                <div className="w-full h-full bg-background rounded-[6px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-manga-accent group-hover:rotate-12 transition-transform" />
                </div>
              </div>
              <span className="font-heading font-bold text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-text-primary via-purple-200 to-manga-accent">
                INKPATH
              </span>
            </Link>
            <div className="flex items-center gap-1">
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-manga-violet/20 text-manga-accent border border-manga-violet/30">
                Beta
              </span>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="md:hidden p-1 text-text-muted hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-5 overflow-y-auto max-h-[calc(100vh-170px)]">
            {navSections.map((sec, idx) => (
              <div key={idx} className="space-y-1">
                {sec.title && (
                  <p className="px-3 text-[10px] font-mono tracking-wider text-text-muted uppercase mb-1.5">
                    {sec.title}
                  </p>
                )}
                {sec.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href) && item.href !== '/dashboard');
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-manga-violet text-white font-semibold shadow-glow-violet'
                          : 'text-text-secondary hover:text-text-primary hover:bg-background-card/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-text-muted'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-manga-cyan/20 text-manga-cyan">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* User Pill / Lorekeeper Status */}
        <div className="p-3 border-t border-manga-border bg-background-surface/60">
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-full bg-background-card/60 border border-manga-border mb-2.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono text-emerald-400">ENGINE ACTIVE</span>
            </div>
            <span className="text-[10px] font-mono text-text-muted">3/3 FREE CHAPTERS</span>
          </div>

          <Link href="/settings" className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-background-card transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-manga-violet to-manga-indigo flex items-center justify-center font-bold text-xs ring-1 ring-manga-border">
              RJ
            </div>
            <div className="truncate flex-1">
              <p className="text-xs font-semibold text-text-primary truncate">Ren Jin</p>
              <p className="text-[10px] text-manga-cyan font-mono">Level 12 Lorekeeper</p>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-manga-border bg-background-secondary/60 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between flex-shrink-0 z-30">
          <div className="flex items-center gap-3 flex-1 max-w-lg">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 rounded-lg bg-background-card border border-manga-border text-text-secondary"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search manga, physics lore, concepts, or characters... (⌘K)"
                className="w-full bg-background-card/80 border border-manga-border rounded-lg pl-9 pr-4 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-manga-violet transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden lg:flex text-xs font-mono text-text-muted items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              BYOK ENCLAVE READY
            </span>

            <button className="p-2 rounded-lg bg-background-card border border-manga-border hover:border-manga-violet/40 text-text-secondary hover:text-text-primary transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-manga-cyan absolute top-2 right-2 animate-ping" />
            </button>

            <Link
              href="/create"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-manga-violet to-manga-indigo text-white text-xs font-semibold hover:brightness-110 transition-all shadow-glow-violet"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Quick Create</span>
            </Link>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 relative">
          {children}
        </main>
      </div>
    </div>
  );
}

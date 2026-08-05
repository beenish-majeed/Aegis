'use client';

import * as React from 'react';
import { Search, Sun, Moon, Command } from 'lucide-react';
import { useUIStore } from '@/store/use-ui-store';
import { CommandPalette } from './command-palette';

export function Header() {
  const { theme, setTheme } = useUIStore();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = React.useState(false);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', nextTheme);
    }
  };

  return (
    <>
      <header className="flex h-16 w-full items-center justify-between border-b border-aegis-border bg-aegis-surface px-6 z-20">
        {/* Command Palette Trigger */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="flex h-9 w-72 items-center justify-between rounded-small border border-aegis-border bg-aegis-background px-3 text-xs text-aegis-muted hover:border-indigo-400/40 transition-all cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-aegis-muted" />
              <span>Search audit scans or commands...</span>
            </div>
            <kbd className="flex items-center space-x-0.5 rounded border border-aegis-border bg-aegis-surface px-1.5 py-0.5 text-[10px] font-mono text-aegis-muted">
              <Command className="h-3 w-3" />
              <span>K</span>
            </kbd>
          </button>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-small border border-aegis-border bg-aegis-surface text-aegis-muted hover:bg-aegis-surface-hover hover:text-aegis-text transition-colors"
            aria-label="Toggle dark mode theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Global Command Palette Component */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </>
  );
}

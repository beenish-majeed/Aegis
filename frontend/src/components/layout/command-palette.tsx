'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Home, Zap, FolderOpen, BarChart3, History, FileText, Settings, X } from 'lucide-react';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState('');

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        isOpen ? onClose() : null;
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const commands: CommandItem[] = [
    {
      id: 'home',
      title: 'Go to Overview Dashboard',
      description: 'View macro health metrics and recent evaluations',
      icon: <Home className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
      action: () => {
        router.push('/');
        onClose();
      },
    },
    {
      id: 'scan',
      title: 'Start New Single Scan',
      description: 'Input a question, context chunks, and answer payload',
      icon: <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      action: () => {
        router.push('/scan');
        onClose();
      },
    },
    {
      id: 'batch',
      title: 'Batch Scan Directory',
      description: 'Drag & drop folder for multi-file evaluation',
      icon: <FolderOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
      action: () => {
        router.push('/batch');
        onClose();
      },
    },
    {
      id: 'results',
      title: 'Open Results Dashboard',
      description: 'Sentence similarity timeline & inspection drawer',
      icon: <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
      action: () => {
        router.push('/results');
        onClose();
      },
    },
    {
      id: 'history',
      title: 'View Audit History Log',
      description: 'Chronological list of all saved workspace evaluations',
      icon: <History className="w-4 h-4 text-aegis-muted" />,
      action: () => {
        router.push('/history');
        onClose();
      },
    },
    {
      id: 'reports',
      title: 'Open Export Center',
      description: 'Generate styled HTML, JSON, or text audit reports',
      icon: <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
      action: () => {
        router.push('/reports');
        onClose();
      },
    },
    {
      id: 'settings',
      title: 'Workspace Settings',
      description: 'Embedding models, default threshold & preferences',
      icon: <Settings className="w-4 h-4 text-aegis-muted" />,
      action: () => {
        router.push('/settings');
        onClose();
      },
    },
  ];

  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.title.toLowerCase().includes(query.toLowerCase()) ||
      cmd.description.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Palette Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-xl rounded-large bg-aegis-surface shadow-2xl border border-aegis-border overflow-hidden z-50"
          >
            {/* Search Bar Input */}
            <div className="flex items-center px-4 border-b border-aegis-border">
              <Search className="w-4 h-4 text-aegis-muted mr-3" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command or search destination..."
                className="w-full h-12 text-sm text-aegis-text bg-transparent placeholder:text-aegis-muted focus:outline-none"
                autoFocus
              />
              <button onClick={onClose} className="p-1 text-aegis-muted hover:text-aegis-text rounded">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Command List */}
            <div className="p-2 max-h-80 overflow-y-auto space-y-1">
              {filteredCommands.length === 0 ? (
                <div className="p-6 text-center text-xs text-aegis-muted">
                  No matching commands found for "{query}".
                </div>
              ) : (
                filteredCommands.map((cmd) => (
                  <button
                    key={cmd.id}
                    onClick={cmd.action}
                    className="w-full flex items-center justify-between p-3 rounded-medium hover:bg-aegis-surface-hover transition-colors text-left group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-aegis-surface-subtle group-hover:bg-indigo-500/10 rounded-small transition-colors">
                        {cmd.icon}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-aegis-text group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {cmd.title}
                        </p>
                        <p className="text-[11px] text-aegis-muted">{cmd.description}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-aegis-muted opacity-0 group-hover:opacity-100 transition-opacity">
                      Select ↵
                    </span>
                  </button>
                ))
              )}
            </div>

            {/* Footer Hint */}
            <div className="p-3 border-t border-aegis-border bg-aegis-surface-subtle flex items-center justify-between text-[11px] text-aegis-muted">
              <span>Press <kbd className="font-mono bg-aegis-surface border border-aegis-border px-1 rounded">Esc</kbd> to exit</span>
              <span className="font-mono">Aegis v5.0.0</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

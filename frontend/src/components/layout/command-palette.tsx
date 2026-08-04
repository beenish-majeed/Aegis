'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Home, Zap, FolderOpen, BarChart3, History, FileText, Settings, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      icon: <Home className="w-4 h-4 text-indigo-600" />,
      action: () => {
        router.push('/');
        onClose();
      },
    },
    {
      id: 'scan',
      title: 'Start New Single Scan',
      description: 'Input a question, context chunks, and answer payload',
      icon: <Zap className="w-4 h-4 text-emerald-600" />,
      action: () => {
        router.push('/scan');
        onClose();
      },
    },
    {
      id: 'batch',
      title: 'Batch Scan Directory',
      description: 'Drag & drop folder for multi-file evaluation',
      icon: <FolderOpen className="w-4 h-4 text-amber-600" />,
      action: () => {
        router.push('/batch');
        onClose();
      },
    },
    {
      id: 'results',
      title: 'Open Results Dashboard',
      description: 'Sentence similarity timeline & inspection drawer',
      icon: <BarChart3 className="w-4 h-4 text-indigo-600" />,
      action: () => {
        router.push('/results');
        onClose();
      },
    },
    {
      id: 'history',
      title: 'View Audit History Log',
      description: 'Chronological list of all saved workspace evaluations',
      icon: <History className="w-4 h-4 text-slate-600" />,
      action: () => {
        router.push('/history');
        onClose();
      },
    },
    {
      id: 'reports',
      title: 'Open Export Center',
      description: 'Generate styled HTML, JSON, or text audit reports',
      icon: <FileText className="w-4 h-4 text-indigo-600" />,
      action: () => {
        router.push('/reports');
        onClose();
      },
    },
    {
      id: 'settings',
      title: 'Workspace Settings',
      description: 'Embedding models, default threshold & preferences',
      icon: <Settings className="w-4 h-4 text-slate-600" />,
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
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Palette Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-xl rounded-large bg-white shadow-2xl border border-slate-200 overflow-hidden z-50"
          >
            {/* Search Bar Input */}
            <div className="flex items-center px-4 border-b border-slate-100">
              <Search className="w-4 h-4 text-slate-400 mr-3" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command or search destination..."
                className="w-full h-12 text-sm text-aegis-text bg-transparent placeholder:text-aegis-muted focus:outline-none"
                autoFocus
              />
              <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
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
                    className="w-full flex items-center justify-between p-3 rounded-medium hover:bg-slate-50 transition-colors text-left group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-slate-100 group-hover:bg-indigo-50 rounded-small transition-colors">
                        {cmd.icon}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-aegis-text group-hover:text-indigo-600 transition-colors">
                          {cmd.title}
                        </p>
                        <p className="text-[11px] text-aegis-muted">{cmd.description}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Select ↵
                    </span>
                  </button>
                ))
              )}
            </div>

            {/* Footer Hint */}
            <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-[11px] text-aegis-muted">
              <span>Press <kbd className="font-mono bg-white border px-1 rounded">Esc</kbd> to exit</span>
              <span className="font-mono">Aegis v5.0.0</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

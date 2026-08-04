import * as React from 'react';

export interface ShortcutConfig {
  key: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      shortcuts.forEach((sc) => {
        const matchesKey = event.key.toLowerCase() === sc.key.toLowerCase();
        const matchesMeta = sc.metaKey ? event.metaKey || event.ctrlKey : true;
        const matchesShift = sc.shiftKey ? event.shiftKey : true;

        if (matchesKey && matchesMeta && matchesShift) {
          event.preventDefault();
          sc.action();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

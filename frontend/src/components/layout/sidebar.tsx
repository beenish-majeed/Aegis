import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Zap,
  FolderOpen,
  BarChart3,
  History,
  FileText,
  Settings,
  Info,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/use-ui-store';
import { AegisLogo } from '@/components/brand/aegis-logo';

export function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, toggleSidebar } = useUIStore();

  const navItems = [
    { label: 'Overview', icon: Home, href: '/' },
    { label: 'Single Scan', icon: Zap, href: '/scan' },
    { label: 'Batch Scan', icon: FolderOpen, href: '/batch' },
    { label: 'Results Dashboard', icon: BarChart3, href: '/results' },
    { label: 'Audit History', icon: History, href: '/history' },
    { label: 'Export Center', icon: FileText, href: '/reports' },
    { label: 'Settings', icon: Settings, href: '/settings' },
    { label: 'About & Diagnostics', icon: Info, href: '/about' },
  ];

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r border-aegis-border bg-aegis-surface transition-all duration-200 z-30 select-none',
        isSidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Aegis Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-aegis-border">
        <Link href="/" className="flex items-center overflow-hidden">
          <AegisLogo size="md" showBadge={isSidebarOpen} />
        </Link>
        <button
          onClick={toggleSidebar}
          className="rounded-small p-1 text-aegis-muted hover:bg-aegis-surface-hover hover:text-aegis-text transition-colors"
          aria-label="Toggle Navigation Sidebar"
        >
          {isSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-3 py-2.5 rounded-small text-sm font-medium transition-colors',
                isActive
                  ? 'bg-aegis-primary-subtle text-aegis-primary font-semibold'
                  : 'text-aegis-muted hover:bg-aegis-surface-hover hover:text-aegis-text'
              )}
            >
              <Icon className={cn('h-5 w-5 flex-shrink-0', isActive ? 'text-aegis-primary' : 'text-aegis-muted')} />
              {isSidebarOpen && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer System Status */}
      {isSidebarOpen && (
        <div className="p-4 border-t border-aegis-border bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-aegis-text">Engine Active</span>
          </div>
          <p className="text-[11px] text-aegis-muted mt-0.5 truncate">
            Model: all-MiniLM-L6-v2
          </p>
        </div>
      )}
    </aside>
  );
}

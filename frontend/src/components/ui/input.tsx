import * as React from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded-small border border-aegis-border bg-aegis-surface px-3 py-2 text-sm text-aegis-text placeholder:text-aegis-muted transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aegis-primary focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-aegis-danger ring-1 ring-aegis-danger',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-aegis-danger">{error}</p>}
      </div>
    );
  }
);
TextInput.displayName = 'TextInput';

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-aegis-muted" />
        <input
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded-small border border-aegis-border bg-aegis-surface pl-9 pr-4 py-2 text-sm text-aegis-text placeholder:text-aegis-muted transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aegis-primary focus-visible:ring-offset-1',
            className
          )}
          placeholder="Search sentences, evidence, or reasons..."
          {...props}
        />
      </div>
    );
  }
);
SearchInput.displayName = 'SearchInput';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <select
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded-small border border-aegis-border bg-aegis-surface px-3 py-2 text-sm text-aegis-text transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aegis-primary focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer',
            error && 'border-aegis-danger ring-1 ring-aegis-danger',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-aegis-danger">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';

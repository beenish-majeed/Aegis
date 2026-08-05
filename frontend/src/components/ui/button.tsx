import * as React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      children,
      onClick,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aegis-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none rounded-small';

    const variantStyles = {
      primary:
        'bg-aegis-primary hover:bg-aegis-primary-hover text-white shadow-sm active:scale-[0.98]',
      secondary:
        'bg-aegis-surface hover:bg-aegis-surface-hover text-aegis-text border border-aegis-border shadow-sm active:scale-[0.98]',
      danger:
        'bg-aegis-danger-bg hover:bg-red-100 text-aegis-danger border border-aegis-danger-border active:scale-[0.98]',
      ghost:
        'bg-transparent hover:bg-aegis-surface-hover text-aegis-muted hover:text-aegis-text',
    };

    const sizeStyles = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
    };

    return (
      <motion.button
        ref={ref}
        type={type}
        onClick={onClick as any}
        disabled={disabled || isLoading}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...(props as any)}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin text-current" />}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

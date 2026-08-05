import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  children?: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverEffect = true, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
        className={cn(
          'bg-aegis-surface border border-aegis-border rounded-large shadow-card overflow-hidden transition-all duration-250',
          hoverEffect && 'hover:-translate-y-0.5 hover:shadow-floating hover:border-indigo-500/30 dark:hover:border-indigo-400/40 hover:shadow-indigo-500/5',
          className
        )}
        {...(props as any)}
      >
        {children}
      </motion.div>
    );
  }
);
Card.displayName = 'Card';

export const CardSkeleton = ({ className }: { className?: string }) => (
  <div className={cn('p-6 bg-aegis-surface border border-aegis-border rounded-large shadow-card animate-pulse space-y-4', className)}>
    <div className="h-4 w-1/3 bg-aegis-surface-hover rounded" />
    <div className="h-8 w-1/2 bg-aegis-surface-hover rounded" />
    <div className="h-3 w-2/3 bg-aegis-surface-hover rounded" />
  </div>
);

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6 border-b border-aegis-border/40', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-base font-bold leading-none tracking-tight text-aegis-text', className)}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-xs text-aegis-muted', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6', className)} {...props} />
));
CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0 border-t border-aegis-border/40 bg-aegis-surface-subtle', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

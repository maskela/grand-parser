import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-slate-100 border border-slate-300 dark:border-slate-600',
      success: 'bg-[var(--success-light)] text-[var(--success-dark)] dark:text-[var(--success)] border border-[var(--success)] font-bold',
      warning: 'bg-[var(--warning-light)] text-[var(--warning-dark)] dark:text-[var(--warning)] border border-[var(--warning)] font-bold',
      danger: 'bg-[var(--danger-light)] text-[var(--danger-dark)] dark:text-[var(--danger)] border border-[var(--danger)] font-bold',
      info: 'bg-[var(--info-light)] text-[var(--info-dark)] dark:text-[var(--info)] border border-[var(--info)] font-bold',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold shadow-sm',
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;


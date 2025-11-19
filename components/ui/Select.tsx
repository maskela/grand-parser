import { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, children, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-sm font-semibold text-[var(--text-primary)]">
            {label}
          </label>
        )}
        <select
          className={cn(
            'flex h-11 w-full rounded-lg border-2 border-[var(--border-default)] bg-[var(--card-bg)] px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm',
            error && 'border-[var(--danger)] focus:ring-[var(--danger)] focus:border-[var(--danger)]',
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        {error && <p className="mt-2 text-sm font-medium text-[var(--danger)]">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;


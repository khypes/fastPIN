import React from 'react';
import { cn } from '../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'surface1' | 'surface2' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'surface1',
      padding = 'md',
      className,
      children,
      ...props
    },
    ref
  ) => {
    const paddingStyles = {
      none: 'p-0',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-5',
    }[padding];

    const variantStyles = {
      surface1: 'bg-surface-1 border border-main',
      surface2: 'bg-surface-2 border border-main',
      interactive: 'bg-surface-1 border border-main active:border-focus active:scale-[0.99] transition-all cursor-pointer',
    }[variant];

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-md-app text-main',
          paddingStyles,
          variantStyles,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { tg } from '../lib/telegram';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      disabled = false,
      icon,
      className,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || disabled) return;
      tg.haptic.impact('light');
      onClick?.(e);
    };

    // Size styles (Tegish maydoni har doim >= 44px)
    const sizeStyles = {
      sm: 'h-11 px-4 text-xs font-semibold',
      md: 'h-12 px-5 text-sm font-semibold',
      lg: 'h-14 px-6 text-base font-bold', // Asosiy CTA 52-56px
    }[size];

    // Variant styles relying strictly on design tokens
    const variantStyles = {
      primary: 'bg-accent text-white shadow-sm active:opacity-90',
      secondary: 'bg-surface-2 text-main border border-main active:bg-surface-1',
      ghost: 'bg-transparent text-sec hover:text-main active:bg-surface-2',
      danger: 'bg-danger-soft text-danger border border-danger active:opacity-80',
    }[variant];

    return (
      <motion.button
        ref={ref}
        whileTap={disabled || loading ? undefined : { scale: 0.98 }}
        transition={{ duration: 0.15, ease: [0.2, 0.8, 0.2, 1] }}
        disabled={disabled || loading}
        onClick={handleClick}
        className={cn(
          'inline-flex items-center justify-center gap-2 cursor-pointer transition-colors',
          'rounded-sm-app font-sans touch-target select-none outline-none',
          fullWidth ? 'w-full' : 'w-auto',
          sizeStyles,
          variantStyles,
          (disabled || loading) && 'opacity-50 cursor-not-allowed pointer-events-none',
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Yuklanmoqda...</span>
          </>
        ) : (
          <>
            {icon && <span className="inline-flex shrink-0">{icon}</span>}
            <span>{children}</span>
          </>
        )}
      </motion.button>
    );
  }
);
Button.displayName = 'Button';

export interface IconButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  label: string;
  children: React.ReactNode;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      variant = 'secondary',
      size = 'md',
      label,
      disabled = false,
      className,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;
      tg.haptic.impact('light');
      onClick?.(e);
    };

    const sizeStyles = {
      sm: 'w-11 h-11',
      md: 'w-12 h-12',
      lg: 'w-14 h-14',
    }[size];

    const variantStyles = {
      primary: 'bg-accent text-white shadow-sm',
      secondary: 'bg-surface-2 text-main border border-main',
      ghost: 'bg-transparent text-sec hover:text-main',
    }[variant];

    return (
      <motion.button
        ref={ref}
        aria-label={label}
        whileTap={disabled ? undefined : { scale: 0.95 }}
        transition={{ duration: 0.15, ease: [0.2, 0.8, 0.2, 1] }}
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          'inline-flex items-center justify-center shrink-0 cursor-pointer',
          'rounded-sm-app touch-target transition-colors outline-none',
          sizeStyles,
          variantStyles,
          disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
IconButton.displayName = 'IconButton';

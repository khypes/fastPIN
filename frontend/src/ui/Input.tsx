import React from 'react';
import { X, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { tg } from '../lib/telegram';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  onClear?: () => void;
  prefixNode?: React.ReactNode;
  suffixNode?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      value,
      disabled = false,
      onClear,
      prefixNode,
      suffixNode,
      className,
      onChange,
      ...props
    },
    ref
  ) => {
    const hasValue = value !== undefined && value !== '';

    return (
      <div className="w-full flex flex-col gap-1.5 font-sans">
        {label && (
          <label className="text-xs font-semibold text-sec flex items-center justify-between">
            <span>{label}</span>
          </label>
        )}

        <div
          className={cn(
            'relative flex items-center w-full min-h-[46px] px-3.5 bg-surface-2 border transition-all rounded-sm-app',
            error
              ? 'border-danger focus-within:border-danger'
              : 'border-main focus-within:border-focus',
            disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
          )}
        >
          {prefixNode && <div className="shrink-0 mr-2 text-sec">{prefixNode}</div>}

          <input
            ref={ref}
            value={value}
            disabled={disabled}
            onChange={onChange}
            className={cn(
              'w-full bg-transparent text-main placeholder:text-ter text-sm outline-none font-medium',
              className
            )}
            {...props}
          />

          {hasValue && onClear && !disabled && (
            <button
              type="button"
              aria-label="Tozalash"
              onClick={() => {
                tg.haptic.impact('light');
                onClear();
              }}
              className="p-1 text-sec hover:text-main shrink-0 cursor-pointer ml-1 touch-target flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {suffixNode && <div className="shrink-0 ml-2 text-sec">{suffixNode}</div>}
        </div>

        {error ? (
          <div className="flex items-center gap-1 text-xs text-danger font-medium mt-0.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : helperText ? (
          <p className="text-xs text-sec mt-0.5">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = 'Input';

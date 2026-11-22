import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { tg } from '../lib/telegram';

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Chip: React.FC<ChipProps> = ({
  selected = false,
  icon,
  className,
  children,
  onClick,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    tg.haptic.selection();
    onClick?.(e);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold',
        'rounded-sm-app touch-target transition-all cursor-pointer border select-none',
        selected
          ? 'bg-accent text-white border-transparent shadow-sm'
          : 'bg-surface-2 text-sec border-main hover:text-main active:bg-surface-1',
        className
      )}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

export interface SegmentedOption<T extends string = string> {
  value: T;
  label: string;
  badge?: string | number;
}

export interface SegmentedProps<T extends string = string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export const Segmented = <T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedProps<T>) => {
  return (
    <div
      className={cn(
        'relative flex items-center p-1 bg-surface-2 border border-main rounded-sm-app select-none',
        className
      )}
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              if (!isSelected) {
                tg.haptic.selection();
                onChange(option.value);
              }
            }}
            className={cn(
              'relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold',
              'touch-target transition-colors rounded-sm-app cursor-pointer',
              isSelected ? 'text-white' : 'text-sec hover:text-main'
            )}
          >
            {isSelected && (
              <motion.div
                layoutId="segmented-indicator"
                className="absolute inset-0 bg-accent rounded-sm-app -z-10 shadow-sm"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              />
            )}
            <span>{option.label}</span>
            {option.badge !== undefined && (
              <span
                className={cn(
                  'px-1.5 py-0.2 text-[10px] font-bold rounded-pill-app tabular-nums',
                  isSelected ? 'bg-white/20 text-white' : 'bg-surface-1 text-sec'
                )}
              >
                {option.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

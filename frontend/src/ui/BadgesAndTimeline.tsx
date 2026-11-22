import React from 'react';
import { cn } from '../lib/utils';
import { Check, Clock, AlertCircle } from 'lucide-react';

export type BadgeVariant = 'success' | 'warn' | 'danger' | 'info' | 'neutral';

export interface StatusBadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  variant = 'neutral',
  children,
  icon,
  className,
}) => {
  const variantStyles = {
    success: 'bg-success-soft text-success border border-success/20',
    warn: 'bg-warn-soft text-warn border border-warn/20',
    danger: 'bg-danger-soft text-danger border border-danger/20',
    info: 'bg-accent-soft text-brand border border-accent/20',
    neutral: 'bg-surface-2 text-sec border border-main',
  }[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-pill-app select-none',
        variantStyles,
        className
      )}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

export interface TimelineStep {
  title: string;
  description?: string;
  status: 'completed' | 'active' | 'pending' | 'failed';
  time?: string;
}

export interface TimelineProps {
  steps: TimelineStep[];
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ steps, className }) => {
  return (
    <div className={cn('flex flex-col font-sans', className)}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;

        const getIndicator = () => {
          switch (step.status) {
            case 'completed':
              return (
                <div className="w-7 h-7 rounded-pill-app bg-success text-white flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              );
            case 'active':
              return (
                <div className="w-7 h-7 rounded-pill-app bg-accent text-white flex items-center justify-center shrink-0 animate-pulse">
                  <Clock className="w-4 h-4" />
                </div>
              );
            case 'failed':
              return (
                <div className="w-7 h-7 rounded-pill-app bg-danger text-white flex items-center justify-center shrink-0">
                  <AlertCircle className="w-4 h-4" />
                </div>
              );
            default:
              return (
                <div className="w-7 h-7 rounded-pill-app bg-surface-2 border border-main text-ter flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-pill-app bg-sec/40" />
                </div>
              );
          }
        };

        return (
          <div key={index} className="flex gap-3">
            {/* Indicator + Connecting Line */}
            <div className="flex flex-col items-center">
              {getIndicator()}
              {!isLast && (
                <div
                  className={cn(
                    'w-0.5 flex-1 my-1.5 min-h-[28px]',
                    step.status === 'completed' ? 'bg-success' : 'bg-surface-2'
                  )}
                />
              )}
            </div>

            {/* Step Content */}
            <div className={cn('flex-1 pb-5', isLast && 'pb-0')}>
              <div className="flex items-center justify-between">
                <h4
                  className={cn(
                    'text-sm font-semibold',
                    step.status === 'completed' || step.status === 'active'
                      ? 'text-main'
                      : 'text-sec'
                  )}
                >
                  {step.title}
                </h4>
                {step.time && <span className="text-[11px] text-ter tabular-nums">{step.time}</span>}
              </div>
              {step.description && (
                <p className="text-xs text-sec mt-0.5">{step.description}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

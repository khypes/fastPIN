import React from 'react';
import { cn } from '../lib/utils';
import { AlertCircle, RefreshCw, Inbox } from 'lucide-react';
import { Button } from './Button';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  rounded?: 'sm' | 'md' | 'lg' | 'pill';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  rounded = 'sm',
  className,
  ...props
}) => {
  const roundedStyles = {
    sm: 'rounded-sm-app',
    md: 'rounded-md-app',
    lg: 'rounded-lg-app',
    pill: 'rounded-pill-app',
  }[rounded];

  return (
    <div
      className={cn('bg-surface-2 animate-skeleton select-none', roundedStyles, className)}
      {...props}
    />
  );
};

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 bg-surface-1 border border-main rounded-md-app font-sans',
        className
      )}
    >
      <div className="w-14 h-14 flex items-center justify-center rounded-sm-app bg-surface-2 text-sec mb-3.5">
        {icon || <Inbox className="w-7 h-7" />}
      </div>
      <h3 className="text-base font-bold text-main">{title}</h3>
      {description && <p className="text-xs text-sec max-w-xs mt-1 mb-4">{description}</p>}
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction} className="mt-1">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Xatolik yuz berdi",
  message = "Ma'lumotlarni yuklab bo'lmadi. Internet aloqasini tekshiring.",
  onRetry,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 bg-surface-1 border border-main rounded-md-app font-sans',
        className
      )}
    >
      <div className="w-14 h-14 flex items-center justify-center rounded-sm-app bg-danger-soft text-danger mb-3.5">
        <AlertCircle className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-main">{title}</h3>
      <p className="text-xs text-sec max-w-xs mt-1 mb-5">{message}</p>
      {onRetry && (
        <Button
          variant="primary"
          size="sm"
          onClick={onRetry}
          icon={<RefreshCw className="w-4 h-4" />}
        >
          Qayta urinish
        </Button>
      )}
    </div>
  );
};

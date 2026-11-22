import React, { useState } from 'react';
import { Plus, Eye, EyeOff, ArrowDownLeft, ArrowUpRight, RotateCcw } from 'lucide-react';
import { cn, formatUzSum } from '../lib/utils';
import { Button } from './Button';
import { Card } from './Card';
import { StatusBadge } from './BadgesAndTimeline';
import { tg } from '../lib/telegram';

export interface BalanceCardProps {
  balance: number;
  onTopUp: () => void;
  className?: string;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  onTopUp,
  className,
}) => {
  const [showBalance, setShowBalance] = useState(true);

  const toggleVisibility = () => {
    tg.haptic.impact('light');
    setShowBalance((prev) => !prev);
  };

  return (
    <Card
      variant="surface1"
      padding="lg"
      className={cn('relative overflow-hidden font-sans border border-main', className)}
    >
      {/* Background Subtle Accent Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent-soft rounded-pill-app filter blur-2xl -mr-10 -mt-10 pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-sec uppercase tracking-wider">Hamyon balansi</span>
          <button
            type="button"
            aria-label="Balansni ko'rsatish yoki yashirish"
            onClick={toggleVisibility}
            className="p-1.5 text-sec hover:text-main touch-target flex items-center justify-center cursor-pointer rounded-sm-app"
          >
            {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-main tabular-nums tracking-tight">
            {showBalance ? balance.toLocaleString('uz-UZ').replace(/,/g, ' ') : '••••••'}
          </span>
          <span className="text-base font-bold text-sec">so'm</span>
        </div>

        <div className="pt-2">
          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={onTopUp}
            icon={<Plus className="w-4 h-4" />}
          >
            Hisobni to'ldirish
          </Button>
        </div>
      </div>
    </Card>
  );
};

export interface TransactionRowProps {
  id: string;
  type: 'topup' | 'purchase' | 'refund' | 'adjust';
  title: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  onClick?: () => void;
}

export const TransactionRow: React.FC<TransactionRowProps> = ({
  type,
  title,
  amount,
  status,
  date,
  onClick,
}) => {
  const isIncome = type === 'topup' || type === 'refund';

  const getIcon = () => {
    switch (type) {
      case 'topup':
        return <ArrowDownLeft className="w-4 h-4 text-success" />;
      case 'refund':
        return <RotateCcw className="w-4 h-4 text-brand" />;
      default:
        return <ArrowUpRight className="w-4 h-4 text-sec" />;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'pending':
        return <StatusBadge variant="warn">Kutilmoqda</StatusBadge>;
      case 'failed':
        return <StatusBadge variant="danger">Bekor qilindi</StatusBadge>;
      default:
        return null;
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center justify-between p-3.5 bg-surface-1 border border-main rounded-md-app',
        'touch-target transition-colors cursor-pointer select-none active:bg-surface-2'
      )}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="w-10 h-10 rounded-sm-app bg-surface-2 flex items-center justify-center shrink-0">
          {getIcon()}
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="text-xs font-bold text-main truncate">{title}</span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-sec tabular-nums">{date}</span>
            {getStatusBadge()}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end shrink-0 pl-2">
        <span
          className={cn(
            'text-sm font-bold tabular-nums',
            isIncome ? 'text-success' : 'text-main'
          )}
        >
          {isIncome ? '+' : '-'}{formatUzSum(amount)}
        </span>
      </div>
    </div>
  );
};

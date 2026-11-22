import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Sparkles, Bell } from 'lucide-react';
import { cn, formatUzSum } from '../lib/utils';
import { tg } from '../lib/telegram';

export interface GameCardProps {
  id: string;
  name: string;
  category?: string;
  minPrice?: number;
  iconGradient?: string;
  imageUrl?: string;
  letter: string;
  badge?: 'hot' | 'new';
  onClick: () => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  name,
  minPrice,
  iconGradient = 'from-blue-600 to-indigo-600',
  imageUrl,
  letter,
  badge,
  onClick,
}) => {
  const handleClick = () => {
    tg.haptic.impact('light');
    onClick();
  };

  return (
    <motion.div
      whileTap={{ scale: 0.94 }}
      transition={{ duration: 0.15, ease: [0.2, 0.8, 0.2, 1] }}
      onClick={handleClick}
      className="flex flex-col items-center cursor-pointer select-none group"
    >
      {/* 3D Artwork Frame (TezPIN 1:1 clone style) */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-surface-2 border border-line shadow-md group-hover:border-accent transition-all duration-200">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div
            className={cn(
              'w-full h-full flex flex-col items-center justify-center font-black text-white text-2xl bg-gradient-to-br shadow-inner',
              iconGradient
            )}
          >
            {letter}
          </div>
        )}

        {/* Badge (Hot / New) */}
        {badge && (
          <div className="absolute top-1.5 right-1.5 z-10">
            {badge === 'hot' ? (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-black rounded-md bg-amber-500 text-black shadow-sm">
                <Flame className="w-2.5 h-2.5" />
                HOT
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-black rounded-md bg-blue-500 text-white shadow-sm">
                <Sparkles className="w-2.5 h-2.5" />
                NEW
              </span>
            )}
          </div>
        )}
      </div>

      {/* Title centered uppercase */}
      <div className="mt-1.5 text-center px-0.5 w-full">
        <h4 className="text-[11px] font-extrabold text-main uppercase tracking-tight leading-tight truncate">
          {name}
        </h4>
        {minPrice ? (
          <p className="text-[10px] text-sec font-medium mt-0.5">
            dan {formatUzSum(minPrice)}
          </p>
        ) : null}
      </div>
    </motion.div>
  );
};

export interface PackCardProps {
  id: string;
  amount: number | string;
  unit?: string; // UC, Diamonds, Stars, etc.
  bonus?: number | string;
  price: number;
  oldPrice?: number;
  badge?: 'popular' | 'best_value';
  selected?: boolean;
  disabled?: boolean;
  onSelect: () => void;
  onNotify?: () => void;
}

export const PackCard: React.FC<PackCardProps> = ({
  amount,
  unit = 'UC',
  bonus,
  price,
  oldPrice,
  badge,
  selected = false,
  disabled = false,
  onSelect,
  onNotify,
}) => {
  const handleClick = () => {
    if (disabled) return;
    tg.haptic.selection();
    onSelect();
  };

  return (
    <motion.div
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.15, ease: [0.2, 0.8, 0.2, 1] }}
      onClick={handleClick}
      className={cn(
        'relative flex flex-col justify-between p-3.5 bg-surface-1 border rounded-md-app select-none cursor-pointer transition-all',
        selected
          ? 'border-focus shadow-md bg-surface-2 ring-2 ring-accent/30'
          : 'border-main active:border-focus',
        disabled && 'opacity-60 cursor-not-allowed bg-surface-2/40'
      )}
    >
      {/* Top Badges */}
      <div className="flex items-center justify-between w-full mb-2 min-h-[20px]">
        {badge ? (
          badge === 'popular' ? (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-pill-app bg-warn-soft text-warn border border-warn/30">
              Eng ommabop
            </span>
          ) : (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-pill-app bg-success-soft text-success border border-success/30">
              Eng foydali
            </span>
          )
        ) : <div />}

        {bonus && (
          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-pill-app bg-accent-soft text-brand tabular-nums">
            +{bonus}
          </span>
        )}
      </div>

      {/* Main Hierarchy: Amount > Price > Bonus */}
      <div className="flex flex-col gap-1 my-1">
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-extrabold text-main tabular-nums tracking-tight">
            {amount}
          </span>
          <span className="text-xs font-bold text-sec">{unit}</span>
        </div>

        {/* Pricing */}
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-sm font-bold text-main tabular-nums">
            {formatUzSum(price)}
          </span>
          {oldPrice && (
            <span className="text-xs text-ter line-through tabular-nums">
              {formatUzSum(oldPrice)}
            </span>
          )}
        </div>
      </div>

      {/* Out of stock action */}
      {disabled && (
        <div className="pt-2 mt-2 border-t border-main/50">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              tg.haptic.impact('light');
              onNotify?.();
            }}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-sec hover:text-main bg-surface-2 rounded-sm-app touch-target"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Xabar ber</span>
          </button>
        </div>
      )}
    </motion.div>
  );
};

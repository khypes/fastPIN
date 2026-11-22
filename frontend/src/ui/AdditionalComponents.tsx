import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Copy, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { tg } from '../lib/telegram';

// ─── Banner Carousel ───
export interface BannerItem {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  bgGradient: string;
}

export interface BannerCarouselProps {
  banners: BannerItem[];
  onBannerClick?: (banner: BannerItem) => void;
}

export const BannerCarousel: React.FC<BannerCarouselProps> = ({
  banners,
  onBannerClick,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (!banners.length) return null;

  const current = banners[currentIndex];

  return (
    <div className="relative w-full flex flex-col gap-2 font-sans select-none">
      <div
        onClick={() => onBannerClick?.(current)}
        className="relative w-full h-36 rounded-md-app overflow-hidden cursor-pointer"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
            className={cn(
              'absolute inset-0 flex flex-col justify-between p-4 bg-gradient-to-r text-white shadow-md',
              current.bgGradient
            )}
          >
            <div className="flex items-center justify-between">
              {current.badge ? (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-pill-app bg-white/20 backdrop-blur-xs">
                  {current.badge}
                </span>
              ) : <div />}
            </div>

            <div>
              <h3 className="text-base font-extrabold leading-tight mb-1">
                {current.title}
              </h3>
              <p className="text-xs text-white/80 line-clamp-1">
                {current.subtitle}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Indicator Pills */}
      {banners.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 py-1">
          {banners.map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`Slayd ${idx + 1}`}
              onClick={() => {
                tg.haptic.selection();
                setCurrentIndex(idx);
              }}
              className={cn(
                'h-1.5 rounded-pill-app transition-all cursor-pointer',
                idx === currentIndex ? 'w-5 bg-accent' : 'w-1.5 bg-sec/30'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Search Bar ───
export interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Qidirish...",
  className,
}) => {
  return (
    <div
      className={cn(
        'relative flex items-center w-full h-11 px-3.5 bg-surface-2 border border-main rounded-sm-app',
        'focus-within:border-focus transition-colors',
        className
      )}
    >
      <Search className="w-4 h-4 text-sec shrink-0 mr-2" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-main placeholder:text-ter outline-none font-medium"
      />
      {value && (
        <button
          type="button"
          aria-label="Tozalash"
          onClick={() => {
            tg.haptic.impact('light');
            onChange('');
          }}
          className="p-1 text-sec hover:text-main touch-target flex items-center justify-center cursor-pointer ml-1"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

// ─── Avatar ───
export interface AvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  isOnline?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  size = 'md',
  isOnline,
}) => {
  const sizeStyles = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg font-bold',
  }[size];

  const firstLetter = name ? name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="relative inline-flex shrink-0">
      <div
        className={cn(
          'rounded-sm-app flex items-center justify-center font-bold bg-surface-2 border border-main text-main overflow-hidden select-none',
          sizeStyles
        )}
      >
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span>{firstLetter}</span>
        )}
      </div>

      {isOnline !== undefined && (
        <span
          className={cn(
            'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-pill-app border-2 border-surface-1',
            isOnline ? 'bg-success' : 'bg-ter'
          )}
        />
      )}
    </div>
  );
};

// ─── Copy Field ───
export interface CopyFieldProps {
  label?: string;
  value: string;
  className?: string;
}

export const CopyField: React.FC<CopyFieldProps> = ({
  label,
  value,
  className,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(value);
    tg.haptic.notification('success');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn('flex flex-col gap-1 font-sans w-full', className)}>
      {label && <span className="text-xs font-semibold text-sec">{label}</span>}
      <div
        onClick={handleCopy}
        className={cn(
          'flex items-center justify-between px-3.5 py-2.5 bg-surface-2 border border-main rounded-sm-app',
          'cursor-pointer active:border-focus transition-all select-none touch-target'
        )}
      >
        <span className="text-sm font-semibold text-main tabular-nums truncate mr-2">
          {value}
        </span>
        <div className="flex items-center gap-1 shrink-0 text-brand">
          {copied ? (
            <>
              <Check className="w-4 h-4 text-success" />
              <span className="text-xs font-bold text-success">Nusxalandi</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-sec" />
              <span className="text-xs font-semibold text-sec">Nusxalash</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

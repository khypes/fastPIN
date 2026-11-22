import React, { useEffect } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';
import { tg } from '../lib/telegram';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  showCloseButton = true,
}) => {
  useEffect(() => {
    if (isOpen) {
      tg.haptic.impact('light');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    // If dragged down enough or with velocity
    if (info.offset.y > 100 || info.velocity.y > 400) {
      tg.haptic.impact('light');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center font-sans">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Sheet Panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className={cn(
              'relative z-10 w-full max-w-lg bg-surface-1 border-t border-x border-main',
              'rounded-t-[24px] max-h-[90vh] flex flex-col overflow-hidden shadow-2xl'
            )}
          >
            {/* Drag Handle */}
            <div className="w-full flex items-center justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
              <div className="w-10 h-1.5 bg-sec/30 rounded-pill-app" />
            </div>

            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between px-5 py-2">
                <div>
                  {title && <h3 className="text-base font-bold text-main">{title}</h3>}
                  {description && <p className="text-xs text-sec mt-0.5">{description}</p>}
                </div>
                {showCloseButton && (
                  <button
                    type="button"
                    aria-label="Yopish"
                    onClick={() => {
                      tg.haptic.impact('light');
                      onClose();
                    }}
                    className="p-2 text-sec hover:text-main touch-target flex items-center justify-center rounded-sm-app"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            {/* Content with scrollable body */}
            <div className="px-5 py-3 overflow-y-auto overflow-x-hidden safe-bottom-padding">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

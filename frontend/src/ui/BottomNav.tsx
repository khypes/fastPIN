import React from 'react';
import { motion } from 'framer-motion';
import { Home, Wallet, Clock, User } from 'lucide-react';
import { cn } from '../lib/utils';
import { tg } from '../lib/telegram';

export type TabKey = 'home' | 'balance' | 'history' | 'profile';

export interface BottomNavProps {
  currentTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const tabs = [
    { key: 'home' as TabKey, label: 'Bosh sahifa', icon: Home },
    { key: 'balance' as TabKey, label: 'Balans', icon: Wallet },
    { key: 'history' as TabKey, label: 'Tarix', icon: Clock },
    { key: 'profile' as TabKey, label: 'Profil', icon: User },
  ];

  const handleTabClick = (key: TabKey) => {
    if (key !== currentTab) {
      tg.haptic.selection();
      onTabChange(key);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-2 pt-1 pointer-events-none select-none">
      <div
        className={cn(
          'max-w-md mx-auto pointer-events-auto',
          'flex items-center justify-between px-2 py-1.5',
          'bg-[#0f1222]/95 dark:bg-[#0f1222]/95 backdrop-blur-xl',
          'border border-[#202744] dark:border-[#202744]',
          'rounded-full shadow-2xl transition-all duration-200'
        )}
        style={{ marginBottom: 'env(safe-area-inset-bottom, 4px)' }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabClick(tab.key)}
              className="relative flex-1 flex flex-col items-center justify-center py-1 touch-target cursor-pointer outline-none"
            >
              {isActive ? (
                <motion.div
                  layoutId="activeTabPill"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  className="flex flex-col items-center justify-center bg-[#2563eb] text-white rounded-full px-4 py-1.5 shadow-md min-w-[72px]"
                >
                  <Icon className="w-4 h-4 stroke-[2.4]" />
                  <span className="text-[10px] font-bold mt-0.5 whitespace-nowrap leading-tight">
                    {tab.label}
                  </span>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 hover:text-gray-200 transition-colors py-1">
                  <Icon className="w-4 h-4 stroke-[1.8]" />
                  <span className="text-[10px] font-medium mt-0.5 whitespace-nowrap leading-tight">
                    {tab.label}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

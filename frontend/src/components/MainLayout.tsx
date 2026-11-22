import React, { useEffect } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BottomNav, type TabKey } from '../ui';
import { tg } from '../lib/telegram';

export const MainLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Aniqlash: hozirgi tab qaysi
  const getCurrentTab = (): TabKey => {
    const path = location.pathname;
    if (path === '/balance') return 'balance';
    if (path === '/history' || path === '/orders') return 'history';
    if (path === '/profile') return 'profile';
    return 'home';
  };

  const handleTabChange = (tab: TabKey) => {
    switch (tab) {
      case 'home':
        navigate('/');
        break;
      case 'balance':
        navigate('/balance');
        break;
      case 'history':
        navigate('/history');
        break;
      case 'profile':
        navigate('/profile');
        break;
    }
  };

  // Telegram BackButton nazorati
  useEffect(() => {
    const isRoot = location.pathname === '/';
    if (!isRoot) {
      tg.backButton.show();
      const removeListener = tg.backButton.onClick(() => {
        tg.haptic.impact('light');
        navigate(-1);
      });
      return () => {
        removeListener();
        tg.backButton.hide();
      };
    } else {
      tg.backButton.hide();
    }
  }, [location.pathname, navigate]);

  return (
    <div className="relative min-h-screen bg-app text-main font-sans pb-20 max-w-md mx-auto">
      {/* Sahifa o'tish animatsiyalari */}
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
          className="w-full"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>

      {/* 4 tabli BottomNav */}
      <BottomNav
        currentTab={getCurrentTab()}
        onTabChange={handleTabChange}
      />
    </div>
  );
};

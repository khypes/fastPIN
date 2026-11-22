import React, { useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import WebApp from '@twa-dev/sdk';
import { AuthProvider, useAuth } from './context/AuthContext';
import { initI18n } from './i18n';
import './index.css';

import { MainLayout } from './components/MainLayout';
import { AuthGate } from './components/AuthGate';
import HomePage from './pages/HomePage';
import GameDetailPage from './pages/GameDetailPage';
import BalancePage from './pages/BalancePage';
import OrdersPage from './pages/OrdersPage';
import OrderResultPage from './pages/OrderResultPage';
import ProfilePage from './pages/ProfilePage';
import { UiShowcasePage } from './pages/UiShowcasePage';
import { ToastProvider, useToast } from './ui/Toast';

const queryClient = new QueryClient();

// Ilova Kontenti va Auth Gate nazorati
const AppContent: React.FC = () => {
  const { isLoading, setGuestMode, loginWithMagicLink } = useAuth();
  const { success, error } = useToast();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-app text-main">
        <div className="w-8 h-8 rounded-pill-app border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      {/* UI Showcase */}
      <Route path="/_ui" element={<UiShowcasePage />} />
      <Route
        path="/auth"
        element={
          <AuthGate
            onContinueAsGuest={() => {
              setGuestMode(true);
              success("Ko'rish rejimida kirdingiz");
            }}
            onMagicLinkSubmit={async (code) => {
              try {
                await loginWithMagicLink(code);
                success("Muvaffaqiyatli kirdingiz!");
              } catch (err: any) {
                error(err.message || "Noto'g'ri kod");
              }
            }}
          />
        }
      />

      {/* Mini App 4-Tab Shell */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/balance" element={<BalancePage />} />
        <Route path="/history" element={<OrdersPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        {/* Game Detail Page */}
        <Route path="/game/:id" element={<GameDetailPage />} />
        {/* Order Result Page */}
        <Route path="/order/:id" element={<OrderResultPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  useEffect(() => {
    try {
      if (WebApp.ready) WebApp.ready();
      if (WebApp.expand) WebApp.expand();

      // Telegram mavzusiga avtomatik moslashish
      const colorScheme = WebApp.colorScheme || 'dark';
      document.documentElement.setAttribute('data-theme', colorScheme);
      if (colorScheme === 'light') {
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
      }
    } catch (e) {
      console.warn('Telegram SDK initialization failed', e);
    }

    initI18n('uz');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Suspense
              fallback={
                <div className="flex items-center justify-center min-h-screen bg-app text-main">
                  <div className="w-8 h-8 rounded-pill-app border-2 border-accent border-t-transparent animate-spin" />
                </div>
              }
            >
              <AppContent />
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
};

export default App;

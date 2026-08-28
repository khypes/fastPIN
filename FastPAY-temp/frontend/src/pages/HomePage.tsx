import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccountIcon, UCIcon, StarsIcon, ChevronRightIcon } from '../components/icons';

const C = {
  bg: '#111321',
  card: '#202440',
  border: '#3C4378',
  accent: '#6F78F0',
  text: '#F5F5FF',
  muted: '#9298C2',
};

const categories = [
  {
    id: 'accounts',
    path: '/accounts',
    title: 'Akkauntlar',
    sub: 'PUBG Mobile',
    icon: <AccountIcon size={32} className="text-[#6F78F0]" />,
    color: '#6F78F0',
  },
  {
    id: 'uc',
    path: '/accounts?tab=uc',
    title: 'PUBG UC',
    sub: 'Arzon va Tez',
    icon: <UCIcon size={32} className="text-[#6F78F0]" />,
    color: '#6F78F0',
  },
  {
    id: 'stars',
    path: '/accounts?tab=stars',
    title: 'Stars',
    sub: 'Telegram',
    icon: <StarsIcon size={32} className="text-[#facc15]" />,
    color: '#facc15',
  },
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const triggerHaptic = (style: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
    }
  };

  useEffect(() => {
    // Simulate loading for UI
    setTimeout(() => setIsLoading(false), 300);
  }, []);

  return (
    <div className="page-container" style={{ background: C.bg }}>
      <div style={{ padding: '16px 16px 0' }}>

        {/* ── Big Banner Card (PUBG Akkauntlar) ── */}
        {isLoading ? (
          <div className="shimmer rounded-3xl mb-4" style={{ height: 130 }} />
        ) : (
          <div
            onClick={() => { triggerHaptic(); navigate('/accounts'); }}
            className="relative rounded-3xl overflow-hidden mb-4 cursor-pointer active:scale-[0.98] transition-transform shadow-xl"
            style={{ height: 130, border: `1.5px solid ${C.border}` }}
          >
            <img
              src="/banner.jpg"
              alt="PUBG"
              className="w-full h-full object-cover"
              style={{ display: 'block' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,25,0.95) 0%, rgba(10,10,25,0.3) 60%, transparent 100%)' }} />
            <div style={{ position: 'absolute', bottom: 12, left: 16, right: 16, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <div>
                <span style={{ color: C.muted, fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block', marginBottom: 2 }}>
                  PUBG Mobile
                </span>
                <h2 style={{ color: C.text, fontWeight: 900, fontSize: '1.25rem', letterSpacing: '0.5px', textTransform: 'uppercase', lineHeight: 1.1 }}>
                  AKKAUNTLAR
                </h2>
              </div>
              <div
                style={{ background: C.accent, borderRadius: 12, padding: '6px 12px', color: '#fff', fontWeight: 800, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                Ko'rish
                <ChevronRightIcon size={14} className="text-white" />
              </div>
            </div>
          </div>
        )}

        {/* ── 3-Column Grid ── */}
        <div className="grid grid-cols-3 gap-3">
          {categories.map(cat => (
            isLoading ? (
              <div key={cat.id} className="shimmer rounded-2xl aspect-square" />
            ) : (
              <div
                key={cat.id}
                onClick={() => { triggerHaptic(); navigate(cat.path); }}
                className="cursor-pointer active:scale-95 transition-all flex flex-col items-center justify-center text-center p-3 relative overflow-hidden"
                style={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: 20,
                  aspectRatio: '1 / 1',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                }}
              >
                {/* Icon */}
                <div style={{ marginBottom: 8 }}>
                  {cat.icon}
                </div>

                {/* Text */}
                <h3 style={{ color: C.text, fontWeight: 900, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.2px', marginBottom: 2, lineHeight: 1.1 }}>
                  {cat.title}
                </h3>
                <p style={{ color: C.muted, fontSize: '0.6rem', fontWeight: 500, lineHeight: 1.2 }}>{cat.sub}</p>
              </div>
            )
          ))}
        </div>

      </div>
    </div>
  );
};

export default HomePage;

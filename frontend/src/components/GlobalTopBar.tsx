import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const GlobalTopBar: React.FC = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState<number>(0);

  const triggerHaptic = (style: 'light' | 'medium' | 'heavy' = 'light') => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
    }
  };

  useEffect(() => {
    const fetchBalance = async (isSilent = false) => {
      try {
        const res = await api.get('/users/me');
        const newBalance = Number(res.data.balance) || 0;
        setBalance(prev => {
          if (isSilent && newBalance > prev) {
            triggerHaptic('heavy');
            if (window.Telegram?.WebApp?.showAlert) {
              window.Telegram.WebApp.showAlert(`Hisobingiz to'ldirildi!\nYangi balans: ${newBalance.toLocaleString()} UZS`);
            }
          }
          return newBalance;
        });
      } catch (e) {
        console.error('Failed to fetch balance:', e);
      }
    };
    fetchBalance();
    const interval = setInterval(() => fetchBalance(true), 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{ background: '#1A1D2D', borderBottom: '1px solid #2A2E45', height: 56 }}
      className="flex items-center justify-between px-4 sticky top-0 z-40 backdrop-blur-lg"
    >
      <div className="flex items-center gap-3">
        <div
          style={{ background: 'linear-gradient(135deg, #5B6BF0, #7B8BF0)', width: 36, height: 36 }}
          className="rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
        >
          F
        </div>

        <div
          style={{ background: '#141621', border: '1px solid #2A2E45' }}
          className="flex items-center gap-2 rounded-xl px-3 py-2"
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" style={{ color: '#5B6BF0' }}>
            <rect x="2" y="6" width="20" height="12" rx="2.5" stroke="currentColor" strokeWidth="2"/>
            <path d="M2 10h20" stroke="currentColor" strokeWidth="2"/>
            <circle cx="17" cy="15" r="1.5" fill="currentColor"/>
          </svg>
          <span style={{ color: '#FFFFFF', fontSize: 14 }} className="font-semibold">
            {balance.toLocaleString()}
          </span>
        </div>
      </div>

      <button
        onClick={() => {
          triggerHaptic();
          navigate('/balance');
        }}
        style={{ background: '#5B6BF0' }}
        className="flex items-center gap-2 rounded-xl px-4 py-2 active:scale-95 transition-all shadow-lg"
      >
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
          <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
        <span style={{ color: '#fff', fontSize: 14 }} className="font-semibold">
          To'ldirish
        </span>
      </button>
    </div>
  );
};

export default GlobalTopBar;

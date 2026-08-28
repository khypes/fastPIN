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
      }
    };
    fetchBalance();
    const interval = setInterval(() => fetchBalance(true), 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{ background: '#111321', borderBottom: '1.5px solid #3C4378', height: 60 }}
      className="flex items-center justify-between px-4 sticky top-0 z-40"
    >
      {/* Left: Avatar + Balance */}
      <div className="flex items-center gap-2.5">
        {/* Avatar */}
        <div
          style={{ background: 'linear-gradient(135deg, #6F78F0, #858CF5)', width: 38, height: 38 }}
          className="rounded-xl flex items-center justify-center text-white font-black text-base flex-shrink-0 shadow-md"
        >
          F
        </div>

        {/* Balance Chip */}
        <div
          style={{ background: '#202440', border: '1.5px solid #3C4378' }}
          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5"
        >
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" style={{ color: '#6F78F0' }}>
            <rect x="2" y="6" width="20" height="12" rx="2.5" stroke="currentColor" strokeWidth="2"/>
            <path d="M2 10h20" stroke="currentColor" strokeWidth="2"/>
            <circle cx="17" cy="15" r="1.5" fill="currentColor"/>
          </svg>
          <span style={{ color: '#F5F5FF', fontSize: '0.8rem' }} className="font-bold">
            {balance.toLocaleString()} UZS
          </span>
        </div>
      </div>

      {/* Right: Top-up button */}
      <button
        onClick={() => {
          triggerHaptic();
          navigate('/balance');
        }}
        style={{ background: '#6F78F0' }}
        className="flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 active:scale-95 transition-all shadow-md"
      >
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
          <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
        <span style={{ color: '#fff', fontSize: '0.8rem' }} className="font-bold uppercase tracking-wide">
          To'ldirish
        </span>
      </button>
    </div>
  );
};

export default GlobalTopBar;

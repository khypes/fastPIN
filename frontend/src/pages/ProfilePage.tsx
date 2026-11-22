import React, { useState } from 'react';
import {
  Tag,
  Phone,
  Headphones,
  Moon,
  Sun,
  Megaphone,
  FileText,
  Copy,
  Check,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { tg } from '../lib/telegram';
import { BottomSheet, Button } from '../ui';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [lang, setLang] = useState<'uz' | 'ru'>('uz');
  const [isDarkMode, setIsDarkMode] = useState(
    !document.documentElement.classList.contains('light')
  );
  const [activeSheet, setActiveSheet] = useState<string | null>(null);

  const telegramId = user?.telegramId?.toString() || '8407085035';
  const userName = user?.firstName || 'khypes';

  const handleCopyId = () => {
    navigator.clipboard.writeText(telegramId).catch(() => {});
    setCopied(true);
    tg.haptic.notification('success');
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleDarkMode = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    if (nextMode) {
      document.documentElement.classList.remove('light');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.setAttribute('data-theme', 'light');
    }
    tg.haptic.impact('light');
  };

  const handleLangChange = (selected: 'uz' | 'ru') => {
    setLang(selected);
    tg.haptic.impact('light');
  };

  const openTelegramLink = (url: string) => {
    tg.haptic.impact('light');
    if (window.Telegram?.WebApp?.openTelegramLink) {
      window.Telegram.WebApp.openTelegramLink(url);
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="flex flex-col gap-4 px-3.5 pt-4 pb-24 font-sans select-none">
      {/* ─── 1. User Info Card (TezPIN 1:1) ─── */}
      <div className="w-full bg-surface-1 border border-line rounded-2xl p-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 flex items-center justify-center font-black text-white text-xl shadow-md">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <h2 className="text-base font-extrabold text-main leading-tight">
              {userName}
            </h2>
            <span className="text-xs text-sec font-medium mt-0.5 tabular-nums">
              ID {telegramId}
            </span>
          </div>
        </div>

        {/* Copy ID Button */}
        <button
          type="button"
          onClick={handleCopyId}
          className="w-10 h-10 rounded-xl bg-surface-2 border border-line flex items-center justify-center text-sec hover:text-main active:scale-95 transition-all cursor-pointer shadow-xs"
          aria-label="ID nusxalash"
        >
          {copied ? (
            <Check className="w-4 h-4 text-emerald-400" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* ─── 2. TIL (Language Segmented - TezPIN 1:1) ─── */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-bold text-sec uppercase tracking-wider px-1">
          TIL
        </span>
        <div className="grid grid-cols-2 p-1 bg-surface-1 border border-line rounded-2xl">
          <button
            type="button"
            onClick={() => handleLangChange('uz')}
            className={`py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
              lang === 'uz'
                ? 'bg-[#2563eb] text-white shadow-sm'
                : 'text-sec hover:text-main'
            }`}
          >
            O'zbekcha
          </button>
          <button
            type="button"
            onClick={() => handleLangChange('ru')}
            className={`py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
              lang === 'ru'
                ? 'bg-[#2563eb] text-white shadow-sm'
                : 'text-sec hover:text-main'
            }`}
          >
            Русский
          </button>
        </div>
      </div>

      {/* ─── 3. XIZMATLAR Menu (TezPIN 1:1) ─── */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-bold text-sec uppercase tracking-wider px-1">
          XIZMATLAR
        </span>
        <div className="bg-surface-1 border border-line rounded-2xl divide-y divide-line overflow-hidden shadow-xs">
          {/* 1. Chegirma kodlar */}
          <button
            type="button"
            onClick={() => setActiveSheet('promo')}
            className="w-full flex items-center justify-between p-3.5 hover:bg-surface-2 transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-surface-2 flex items-center justify-center text-blue-400 shrink-0">
                <Tag className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-main">Chegirma kodlar</span>
            </div>
            <ChevronRight className="w-4 h-4 text-sec" />
          </button>

          {/* 2. Telefon raqamini ulashish */}
          <button
            type="button"
            onClick={() => setActiveSheet('phone')}
            className="w-full flex items-center justify-between p-3.5 hover:bg-surface-2 transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-surface-2 flex items-center justify-center text-blue-400 shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-main">Telefon raqamini ulashish</span>
            </div>
            <ChevronRight className="w-4 h-4 text-sec" />
          </button>

          {/* 3. Qo'llab-quvvatlash */}
          <button
            type="button"
            onClick={() => openTelegramLink('https://t.me/FastUC_support')}
            className="w-full flex items-center justify-between p-3.5 hover:bg-surface-2 transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-surface-2 flex items-center justify-center text-blue-400 shrink-0">
                <Headphones className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-main">Qo'llab-quvvatlash</span>
            </div>
            <ChevronRight className="w-4 h-4 text-sec" />
          </button>

          {/* 4. Tungi rejim (iOS switch) */}
          <div className="w-full flex items-center justify-between p-3.5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-surface-2 flex items-center justify-center text-blue-400 shrink-0">
                {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </div>
              <span className="text-xs font-bold text-main">Tungi rejim</span>
            </div>
            {/* iOS Switch */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer outline-none p-0.5 ${
                isDarkMode ? 'bg-[#2563eb]' : 'bg-gray-300 dark:bg-gray-700'
              }`}
              aria-label="Tungi rejimni o'zgartirish"
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                  isDarkMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 5. Yangiliklar kanali */}
          <button
            type="button"
            onClick={() => openTelegramLink('https://t.me/FastUC_news')}
            className="w-full flex items-center justify-between p-3.5 hover:bg-surface-2 transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-surface-2 flex items-center justify-center text-blue-400 shrink-0">
                <Megaphone className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-main">Yangiliklar kanali</span>
            </div>
            <ChevronRight className="w-4 h-4 text-sec" />
          </button>

          {/* 6. Ommaviy oferta */}
          <button
            type="button"
            onClick={() => setActiveSheet('terms')}
            className="w-full flex items-center justify-between p-3.5 hover:bg-surface-2 transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-surface-2 flex items-center justify-center text-blue-400 shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-main">Ommaviy oferta</span>
            </div>
            <ChevronRight className="w-4 h-4 text-sec" />
          </button>
        </div>
      </div>

      {/* ─── BottomSheets ─── */}
      <BottomSheet
        isOpen={activeSheet === 'promo'}
        onClose={() => setActiveSheet(null)}
        title="Chegirma kodlar"
      >
        <div className="flex flex-col gap-3 p-3">
          <p className="text-xs text-sec">
            Promokodingiz bo'lsa, xarid qilish vaqtida savatda kiriting yoki pastdagi maydonga yozing:
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Masalan: FASTPAY10"
              className="flex-1 bg-surface-2 border border-line rounded-xl px-3 py-2.5 text-xs text-main uppercase font-bold outline-none"
            />
            <Button size="sm" variant="primary" onClick={() => tg.haptic.notification('success')}>
              Faollashtirish
            </Button>
          </div>
        </div>
      </BottomSheet>

      <BottomSheet
        isOpen={activeSheet === 'phone'}
        onClose={() => setActiveSheet(null)}
        title="Telefon raqami"
      >
        <div className="flex flex-col items-center text-center p-3 gap-3">
          <p className="text-xs text-sec">
            Hisobingizga telefon raqam ulash orqali to'lovlar va xavfsizlikni kuchaytirishingiz mumkin.
          </p>
          <Button
            fullWidth
            variant="primary"
            onClick={() => {
              tg.haptic.notification('success');
              setActiveSheet(null);
            }}
          >
            Telegram orqali ulash
          </Button>
        </div>
      </BottomSheet>

      <BottomSheet
        isOpen={activeSheet === 'terms'}
        onClose={() => setActiveSheet(null)}
        title="Ommaviy oferta"
      >
        <div className="p-3 max-h-64 overflow-y-auto text-xs text-sec leading-relaxed flex flex-col gap-2">
          <p className="font-bold text-main">1. Umumiy qoidalar</p>
          <p>
            FastPAY xizmati foydalanuvchilarga o'yin valyutalari va raqamli xizmatlarni xarid qilish bo'yicha vositachilik qiladi. Barcha xaridlar avtomatik tarzda yetkazib beriladi.
          </p>
          <p className="font-bold text-main">2. Qaytarish shartlari</p>
          <p>
            Agar tizim xatosi tufayli buyurtma yetkazilmasa, mablag' 100% foydalanuvchi hamyoniga qaytariladi.
          </p>
        </div>
      </BottomSheet>
    </div>
  );
};

export default ProfilePage;

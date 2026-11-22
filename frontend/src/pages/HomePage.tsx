import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Wallet,
  Gift,
  MessageSquare,
  Headphones,
  Plus,
  Sun,
  Moon,
  Search,
  Bot,
} from 'lucide-react';
import {
  GameCard,
  Skeleton,
  ErrorState,
  BottomSheet,
  Button,
} from '../ui';
import { useAuth } from '../context/AuthContext';
import { MOCK_GAMES, MOCK_BANNERS } from '../data/mockGames';
import { tg } from '../lib/telegram';

export const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [activeTab, setActiveTab] = useState<'games' | 'services'>('games');
  const [activeSheet, setActiveSheet] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>(
    document.documentElement.classList.contains('light') ? 'light' : 'dark'
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    if (next === 'light') document.documentElement.classList.add('light');
    else document.documentElement.classList.remove('light');
    tg.haptic.impact('light');
  };

  const handleRetry = () => {
    setIsLoading(true);
    setHasError(false);
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  };

  const filteredGames = MOCK_GAMES.filter((g) => {
    const matchesTab = activeTab === 'games' ? g.type === 'game' : g.type === 'service';
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const userName = user?.firstName || 'Foydalanuvchi';
  const userBalance = user?.balance ?? 0;

  if (hasError) {
    return (
      <div className="p-4 pt-10">
        <ErrorState
          title={t('common.error')}
          message="O'yinlar ro'yxatini yuklashda xatolik yuz berdi. Internet aloqasini tekshiring."
          onRetry={handleRetry}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-3.5 pt-3 pb-24 font-sans select-none">
      {/* ─── 1. Header: Xush kelibsiz + Name + Theme/Bot Actions (TezPIN 1:1) ─── */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center font-black text-white text-base shadow-sm">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-sec font-medium leading-tight">Xush kelibsiz</span>
            <h2 className="text-base font-extrabold text-main truncate max-w-[160px] leading-snug">
              {userName}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Switcher Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full bg-surface-2 border border-line flex items-center justify-center text-main active:scale-95 transition-all"
            aria-label="Mavzuni o'zgartirish"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500" />
            )}
          </button>

          {/* Bot / Support Avatar */}
          <button
            type="button"
            onClick={() => setActiveSheet('help')}
            className="w-9 h-9 rounded-full bg-[#2563eb] text-white flex items-center justify-center active:scale-95 transition-all shadow-sm"
            aria-label="Yordam"
          >
            <Bot className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ─── 2. Banners (Bentley & Brawl Stars Promo) ─── */}
      <div className="grid grid-cols-2 gap-2.5">
        {MOCK_BANNERS.map((b) => (
          <div
            key={b.id}
            onClick={() => {
              tg.haptic.impact('light');
              if (b.id === 'b1') navigate('/game/pubg-mobile');
              else if (b.id === 'b2') navigate('/game/brawl-stars');
            }}
            className="relative h-24 rounded-2xl overflow-hidden cursor-pointer active:scale-98 transition-transform border border-line/60 shadow-sm"
          >
            <img
              src={b.imageUrl}
              alt={b.title}
              className="w-full h-full object-cover object-center"
            />
          </div>
        ))}
      </div>

      {/* ─── 3. Wallet Card (Exact TezPIN Deep Blue Card + Yellow CTA) ─── */}
      <div className="w-full bg-gradient-to-r from-[#1c388c] to-[#162a6b] rounded-2xl p-4 flex items-center justify-between text-white shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
            <Wallet className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tabular-nums tracking-tight">
              {userBalance.toLocaleString('uz-UZ').replace(/,/g, ' ')} so'm
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            tg.haptic.impact('medium');
            navigate('/balance');
          }}
          className="bg-[#f5b800] hover:bg-[#e0a800] active:scale-95 text-black font-extrabold text-xs px-3.5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          To'ldirish
        </button>
      </div>

      {/* ─── 4. Quick Actions: Sovg'alar · Sharhlar · Yordam (TezPIN 1:1) ─── */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => {
            tg.haptic.impact('light');
            setActiveSheet('gifts');
          }}
          className="flex items-center justify-center gap-1.5 py-2.5 px-2 bg-surface-1 border border-line rounded-xl cursor-pointer active:scale-95 transition-all text-main shadow-xs"
        >
          <Gift className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold truncate">Sovg'alar</span>
        </button>

        <button
          type="button"
          onClick={() => {
            tg.haptic.impact('light');
            setActiveSheet('reviews');
          }}
          className="flex items-center justify-center gap-1.5 py-2.5 px-2 bg-surface-1 border border-line rounded-xl cursor-pointer active:scale-95 transition-all text-main shadow-xs"
        >
          <MessageSquare className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-bold truncate">Sharhlar</span>
        </button>

        <button
          type="button"
          onClick={() => {
            tg.haptic.impact('light');
            setActiveSheet('help');
          }}
          className="flex items-center justify-center gap-1.5 py-2.5 px-2 bg-surface-1 border border-line rounded-xl cursor-pointer active:scale-95 transition-all text-main shadow-xs"
        >
          <Headphones className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold truncate">Yordam</span>
        </button>
      </div>

      {/* ─── 5. O'yinlar | Xizmatlar Segmenti + Qidiruv Icon (TezPIN 1:1) ─── */}
      <div className="flex items-center justify-between gap-2 mt-1">
        <div className="flex items-center gap-1.5 bg-surface-2 p-1 rounded-full border border-line">
          <button
            type="button"
            onClick={() => {
              tg.haptic.impact('light');
              setActiveTab('games');
            }}
            className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
              activeTab === 'games'
                ? 'bg-[#2563eb] text-white shadow-sm'
                : 'text-sec hover:text-main'
            }`}
          >
            O'yinlar
          </button>
          <button
            type="button"
            onClick={() => {
              tg.haptic.impact('light');
              setActiveTab('services');
            }}
            className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
              activeTab === 'services'
                ? 'bg-[#2563eb] text-white shadow-sm'
                : 'text-sec hover:text-main'
            }`}
          >
            Xizmatlar
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowSearch(!showSearch)}
          className={`w-9 h-9 rounded-full flex items-center justify-center border border-line transition-all active:scale-95 ${
            showSearch ? 'bg-[#2563eb] text-white' : 'bg-surface-2 text-sec'
          }`}
        >
          <Search className="w-4 h-4" />
        </button>
      </div>

      {/* Qidiruv satri ochilganda */}
      {showSearch && (
        <div className="animate-in fade-in duration-150">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="O'yin nomi bo'yicha qidiruv..."
            className="w-full bg-surface-1 border border-line rounded-xl px-3.5 py-2.5 text-sm text-main placeholder:text-sec outline-none focus:border-accent"
            autoFocus
          />
        </div>
      )}

      {/* ─── 6. O'yinlar Gridi: 3 USTUN (TezPIN 1:1 clone!) ─── */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-2.5">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <Skeleton className="w-full aspect-square rounded-2xl" />
              <Skeleton className="h-3 w-16 rounded" />
            </div>
          ))}
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="text-center py-10 bg-surface-1 border border-line rounded-2xl p-4">
          <p className="text-xs text-sec">Hech narsa topilmadi</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2.5">
          {filteredGames.map((game) => (
            <GameCard
              key={game.id}
              id={game.id}
              name={game.name}
              category={game.type}
              minPrice={game.minPrice}
              imageUrl={game.imageUrl}
              letter={game.letter}
              iconGradient={game.iconGradient}
              badge={game.badge}
              onClick={() => {
                tg.haptic.impact('medium');
                navigate(`/game/${game.id}`);
              }}
            />
          ))}
        </div>
      )}

      {/* ─── 7. Bottom Sheets: Sovg'alar · Sharhlar · Yordam ─── */}
      <BottomSheet
        isOpen={activeSheet === 'gifts'}
        onClose={() => setActiveSheet(null)}
        title="Sovg'alar va Bonuslar"
      >
        <div className="flex flex-col items-center text-center p-4 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Gift className="w-7 h-7" />
          </div>
          <h3 className="text-base font-extrabold text-main">Sovg'alar tizimi</h3>
          <p className="text-xs text-sec leading-relaxed">
            Tez orada har bir xaridingiz uchun bonus ballar to'plashingiz va ularni bepul UC yoki Premiumga almashtirishingiz mumkin bo'ladi!
          </p>
          <Button fullWidth variant="secondary" onClick={() => setActiveSheet(null)}>
            Tushunarli
          </Button>
        </div>
      </BottomSheet>

      <BottomSheet
        isOpen={activeSheet === 'reviews'}
        onClose={() => setActiveSheet(null)}
        title="Foydalanuvchilar sharhlari"
      >
        <div className="flex flex-col items-center text-center p-4 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
            <MessageSquare className="w-7 h-7" />
          </div>
          <h3 className="text-base font-extrabold text-main">9 460+ mamnun mijozlar</h3>
          <p className="text-xs text-sec leading-relaxed">
            Bizning rasmiy sharhlar kanalimizda barcha real foydalanuvchilar fikri bilan tanishishingiz mumkin.
          </p>
          <Button
            fullWidth
            variant="primary"
            onClick={() => {
              tg.haptic.impact('light');
              if (window.Telegram?.WebApp?.openTelegramLink) {
                window.Telegram.WebApp.openTelegramLink('https://t.me/FastUC_reviews');
              } else {
                window.open('https://t.me/FastUC_reviews', '_blank');
              }
            }}
          >
            Sharhlar kanaliga o'tish
          </Button>
        </div>
      </BottomSheet>

      <BottomSheet
        isOpen={activeSheet === 'help'}
        onClose={() => setActiveSheet(null)}
        title="Qo'llab-quvvatlash va Yordam"
      >
        <div className="flex flex-col gap-3 p-2">
          <div className="p-3 bg-surface-2 rounded-xl border border-line">
            <h4 className="text-xs font-bold text-main mb-1">⚡ Donat qancha vaqtda yetkaziladi?</h4>
            <p className="text-xs text-sec">To'lov tasdiqlangach, avtomatlashtirilgan tizim 30-60 soniya ichida o'yin hisobingizga yetkazadi.</p>
          </div>
          <div className="p-3 bg-surface-2 rounded-xl border border-line">
            <h4 className="text-xs font-bold text-main mb-1">🔍 Player ID qayerda joylashgan?</h4>
            <p className="text-xs text-sec">O'yin profilingizni oching, profil rasmi yonida 8-10 xonali raqamli ID joylashgan bo'ladi.</p>
          </div>
          <Button
            fullWidth
            variant="primary"
            onClick={() => {
              tg.haptic.impact('light');
              if (window.Telegram?.WebApp?.openTelegramLink) {
                window.Telegram.WebApp.openTelegramLink('https://t.me/FastUC_support');
              } else {
                window.open('https://t.me/FastUC_support', '_blank');
              }
            }}
          >
            Operator bilan bog'lanish (24/7)
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
};

export default HomePage;

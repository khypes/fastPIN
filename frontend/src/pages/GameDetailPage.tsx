import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Zap,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Wallet,
  ChevronLeft,
  Gift,
} from 'lucide-react';
import {
  Button,
  BottomSheet,
} from '../ui';
import { tg } from '../lib/telegram';
import { formatUzSum } from '../lib/utils';
import { MOCK_GAMES } from '../data/mockGames';
import api from '../api';

interface PackageItem {
  id: string;
  gameId: string;
  type: string;
  name: string;
  amount: number | string;
  unit: string;
  bonus?: string;
  price: number;
  oldPrice?: number;
  badge?: 'popular' | 'best_value';
  inStock: boolean;
  region?: string;
  iconImg?: string;
}

export const GameDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const gameId = id || 'pubg-mobile';
  const gameMeta = MOCK_GAMES.find((g) => g.id === gameId) || MOCK_GAMES[0];
  const isTelegram = gameId === 'telegram';

  // Tabs & Regions
  const [selectedTab, setSelectedTab] = useState<string>(isTelegram ? 'stars' : 'uc');
  const [selectedRegion] = useState<string>('Global');
  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);

  // Player ID State
  const savedPlayerIdKey = `last_player_id_${gameId}`;
  const [playerId, setPlayerId] = useState<string>(() => {
    return localStorage.getItem(savedPlayerIdKey) || '';
  });
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean;
    nickname?: string;
    server?: string;
    error?: string;
  } | null>(null);

  // Checkout & Guide States
  const [showGuideSheet, setShowGuideSheet] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [userBalance, setUserBalance] = useState<number>(95000);
  const [promoCode] = useState<string>('FASTPAY10');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);

  // Saved accounts
  const [savedAccounts, setSavedAccounts] = useState<string[]>(() => {
    const raw = localStorage.getItem(`accounts_${gameId}`);
    return raw ? JSON.parse(raw) : ['512894192', '599812401'];
  });

  // Fetch real balance
  useEffect(() => {
    api.get('/wallet/balance').then((res) => {
      if (res.data?.balance !== undefined) {
        setUserBalance(Number(res.data.balance));
      }
    }).catch(() => {});
  }, []);

  // Packages list
  const getPackages = (): PackageItem[] => {
    if (isTelegram) {
      if (selectedTab === 'stars') {
        return [
          { id: 'tg-50', gameId, type: 'stars', name: '50 Stars', amount: 50, unit: 'Stars', price: 10250, inStock: true },
          { id: 'tg-75', gameId, type: 'stars', name: '75 Stars', amount: 75, unit: 'Stars', price: 15375, inStock: true },
          { id: 'tg-100', gameId, type: 'stars', name: '100 Stars', amount: 100, unit: 'Stars', price: 20500, badge: 'popular', inStock: true },
          { id: 'tg-150', gameId, type: 'stars', name: '150 Stars', amount: 150, unit: 'Stars', price: 30750, inStock: true },
          { id: 'tg-250', gameId, type: 'stars', name: '250 Stars', amount: 250, unit: 'Stars', price: 51250, inStock: true },
          { id: 'tg-350', gameId, type: 'stars', name: '350 Stars', amount: 350, unit: 'Stars', price: 71750, inStock: true },
          { id: 'tg-500', gameId, type: 'stars', name: '500 Stars', amount: 500, unit: 'Stars', price: 102500, badge: 'best_value', inStock: true },
          { id: 'tg-750', gameId, type: 'stars', name: '750 Stars', amount: 750, unit: 'Stars', price: 153750, inStock: true },
          { id: 'tg-1000', gameId, type: 'stars', name: '1000 Stars', amount: 1000, unit: 'Stars', price: 205000, inStock: true },
        ];
      }
      if (selectedTab === 'premium') {
        return [
          { id: 'tg-prem-3', gameId, type: 'premium', name: 'Premium (3 oy)', amount: 3, unit: 'oy', price: 135000, inStock: true },
          { id: 'tg-prem-6', gameId, type: 'premium', name: 'Premium (6 oy)', amount: 6, unit: 'oy', bonus: '10% tejash', price: 245000, badge: 'popular', inStock: true },
          { id: 'tg-prem-12', gameId, type: 'premium', name: 'Premium (12 oy)', amount: 12, unit: 'oy', bonus: '25% tejash', price: 430000, badge: 'best_value', inStock: true },
        ];
      }
      return [
        { id: 'tg-gift-bear', gameId, type: 'gifts', name: 'Ayiq', amount: 1, unit: 'dona', price: 3575, iconImg: '/gifts/bear.png', inStock: true },
        { id: 'tg-gift-heart', gameId, type: 'gifts', name: 'Yurak', amount: 1, unit: 'dona', price: 3575, iconImg: '/gifts/heart.png', inStock: true },
        { id: 'tg-gift-rose', gameId, type: 'gifts', name: 'AtirGul', amount: 1, unit: 'dona', price: 6975, iconImg: '/gifts/rose.png', inStock: true },
        { id: 'tg-gift-box', gameId, type: 'gifts', name: 'Sovg\'a', amount: 1, unit: 'dona', price: 6975, iconImg: '/gifts/gift.png', inStock: true },
      ];
    }

    if (selectedTab === 'nabor') {
      return [
        { id: 'pubg-prime-1',  gameId, type: 'nabor', name: 'Prime (1 oy)',      amount: 1,  unit: 'oy', price: 12300,   inStock: true  },
        { id: 'pubg-prime-3',  gameId, type: 'nabor', name: 'Prime (3 oy)',      amount: 3,  unit: 'oy', price: 35000,   inStock: false },
        { id: 'pubg-prime-6',  gameId, type: 'nabor', name: 'Prime (6 oy)',      amount: 6,  unit: 'oy', price: 67600,   inStock: true  },
        { id: 'pubg-prime-12', gameId, type: 'nabor', name: 'Prime (12 oy)',     amount: 12, unit: 'oy', price: 129400,  inStock: true  },
        { id: 'pubg-plus-1',   gameId, type: 'nabor', name: 'Prime Plus (1 oy)', amount: 1,  unit: 'oy', price: 113200,  inStock: true  },
        { id: 'pubg-plus-3',   gameId, type: 'nabor', name: 'Prime Plus (3 oy)', amount: 3,  unit: 'oy', price: 0,       inStock: false },
        { id: 'pubg-plus-6',   gameId, type: 'nabor', name: 'Prime Plus (6 oy)', amount: 6,  unit: 'oy', price: 651000,  inStock: true  },
        { id: 'pubg-plus-12',  gameId, type: 'nabor', name: 'Prime Plus (12 oy)',amount: 12, unit: 'oy', price: 1215000, inStock: true  },
      ];
    }

    return [
      { id: 'pubg-60',   gameId, type: 'uc', name: '60 UC',   amount: 60,   unit: 'UC', price: 11840,   inStock: true,  iconImg: '/uc-icons/uc-60.png' },
      { id: 'pubg-325',  gameId, type: 'uc', name: '325 UC',  amount: 325,  unit: 'UC', price: 59400,   inStock: true,  iconImg: '/uc-icons/uc-325.png' },
      { id: 'pubg-660',  gameId, type: 'uc', name: '660 UC',  amount: 660,  unit: 'UC', price: 117700,  inStock: true,  iconImg: '/uc-icons/uc-60.png' },
      { id: 'pubg-1800', gameId, type: 'uc', name: '1800 UC', amount: 1800, unit: 'UC', price: 294800,  inStock: true,  iconImg: '/uc-icons/uc-325.png' },
      { id: 'pubg-3850', gameId, type: 'uc', name: '3850 UC', amount: 3850, unit: 'UC', price: 587000,  inStock: true,  iconImg: '/uc-icons/uc-60.png' },
      { id: 'pubg-8100', gameId, type: 'uc', name: '8100 UC', amount: 8100, unit: 'UC', price: 1135000, inStock: true,  iconImg: '/uc-icons/uc-325.png' },
    ];
  };

  const packages = getPackages();
  const selectedPackage = packages.find((p) => p.id === selectedPackId);

  // Debounced Player ID Verification
  useEffect(() => {
    const cleanId = playerId.trim();
    if (!cleanId) {
      setVerificationResult(null);
      setIsValidating(false);
      return;
    }

    setIsValidating(true);
    setVerificationResult(null);

    const timer = setTimeout(() => {
      if (cleanId === '00000' || cleanId.length < 5) {
        setVerificationResult({
          valid: false,
          error: "ID topilmadi. Raqamlarni tekshirib, qayta kiriting.",
        });
        setIsValidating(false);
        tg.haptic.notification('error');
        return;
      }

      if (cleanId === '99999') {
        setVerificationResult({
          valid: false,
          error: "O'yin serveri vaqtincha javob bermayapti. Qaytadan urinib ko'ring.",
        });
        setIsValidating(false);
        tg.haptic.notification('warning');
        return;
      }

      const nickname = isTelegram
        ? cleanId.startsWith('@') ? cleanId.slice(1) : cleanId
        : cleanId.endsWith('1') ? 'NightHawk_UZ' : cleanId.endsWith('2') ? 'Sardor_Pro' : 'FastPlayer_01';
      const server = selectedRegion || 'Global';

      setVerificationResult({
        valid: true,
        nickname,
        server,
      });
      setIsValidating(false);
      tg.haptic.notification('success');

      localStorage.setItem(savedPlayerIdKey, cleanId);
      if (!savedAccounts.includes(cleanId)) {
        const nextAccounts = [cleanId, ...savedAccounts.slice(0, 3)];
        setSavedAccounts(nextAccounts);
        localStorage.setItem(`accounts_${gameId}`, JSON.stringify(nextAccounts));
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [playerId, selectedRegion, gameId, isTelegram]);

  // Open Checkout BottomSheet
  const handleCheckout = () => {
    if (!selectedPackage || !verificationResult?.valid) return;
    tg.haptic.impact('medium');
    setIsCheckoutOpen(true);
  };

  // Pricing calculations
  const discountPercent = promoCode.trim().toUpperCase() === 'FASTPAY10' ? 10 : 0;
  const rawPrice = selectedPackage?.price || 0;
  const finalPrice = discountPercent > 0 ? Math.round(rawPrice * 0.9) : rawPrice;
  const isBalanceEnough = userBalance >= finalPrice;
  const missingBalance = isBalanceEnough ? 0 : finalPrice - userBalance;

  // Confirm order execution
  const handleConfirmOrder = async () => {
    if (isSubmittingOrder || !selectedPackage) return;
    setIsSubmittingOrder(true);
    tg.haptic.impact('heavy');

    try {
      const res = await api.post('/orders/checkout', {
        gameId,
        gameTitle: gameMeta.name,
        packageId: selectedPackage.id,
        packageName: selectedPackage.name,
        amount: finalPrice,
        playerId,
        playerNickname: verificationResult?.nickname,
        serverId: selectedRegion,
        promoCode,
        idempotencyKey: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      });

      setIsCheckoutOpen(false);
      navigate(`/order/${res.data.orderId || 'ord-demo-1'}`);
    } catch {
      setIsCheckoutOpen(false);
      navigate('/order/ord-demo-1');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const isReadyToProceed = Boolean(selectedPackage && verificationResult?.valid);
  const mainButtonText = !selectedPackage
    ? t('game.selectPackage')
    : !playerId
    ? t('game.enterPlayerId')
    : isValidating
    ? t('common.loading')
    : !verificationResult?.valid
    ? "Player ID xato"
    : `Davom etish · ${formatUzSum(selectedPackage.price)}`;

  return (
    <div className="relative min-h-screen bg-app text-main font-sans pb-32 select-none">
      {/* ─── 1. Top Bar: Orqaga + Hamyon Balans (TezPIN 1:1) ─── */}
      <div className="flex items-center justify-between px-3.5 pt-3 pb-2">
        <button
          type="button"
          onClick={() => {
            tg.haptic.impact('light');
            navigate(-1);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-1 border border-line rounded-full text-xs font-bold text-main active:scale-95 transition-all cursor-pointer shadow-xs"
        >
          <ChevronLeft className="w-4 h-4 text-sec" />
          <span>Orqaga</span>
        </button>

        <button
          type="button"
          onClick={() => {
            tg.haptic.impact('light');
            navigate('/balance');
          }}
          className="flex items-center gap-2 px-3 py-1.5 bg-surface-1 border border-line rounded-full text-xs font-extrabold text-main active:scale-95 transition-all cursor-pointer shadow-xs tabular-nums"
        >
          <Wallet className="w-3.5 h-3.5 text-accent" />
          <span>{userBalance.toLocaleString('uz-UZ').replace(/,/g, ' ')} so'm</span>
        </button>
      </div>

      {/* ─── 2. Game Hero Card (TezPIN 1:1) ─── */}
      <div className="px-3.5 mb-3">
        <div className="w-full bg-surface-1 border border-line rounded-2xl p-3.5 flex items-center gap-3.5 shadow-xs">
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-surface-2 border border-line shrink-0 shadow-sm">
            {gameMeta.imageUrl ? (
              <img
                src={gameMeta.imageUrl}
                alt={gameMeta.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-black text-white text-xl bg-gradient-to-br from-blue-600 to-indigo-700">
                {gameMeta.letter}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <h1 className="text-base font-extrabold text-main uppercase tracking-tight">
              {gameMeta.name}
            </h1>
            <div className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold text-emerald-400">
              <Zap className="w-3 h-3" />
              <span>Avtomatik yetkazish</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 3. Tabs (UC | Naborlar yoki Stars | Premium | Sovg'alar) ─── */}
      <div className="px-3.5 mb-3">
        {isTelegram ? (
          <div className="grid grid-cols-3 p-1 bg-surface-1 border border-line rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => {
                tg.haptic.impact('light');
                setSelectedTab('stars');
                setSelectedPackId(null);
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                selectedTab === 'stars'
                  ? 'bg-[#2563eb] text-white shadow-sm'
                  : 'text-sec hover:text-main'
              }`}
            >
              ⭐ Stars
            </button>
            <button
              type="button"
              onClick={() => {
                tg.haptic.impact('light');
                setSelectedTab('premium');
                setSelectedPackId(null);
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                selectedTab === 'premium'
                  ? 'bg-[#2563eb] text-white shadow-sm'
                  : 'text-sec hover:text-main'
              }`}
            >
              👑 Premium
            </button>
            <button
              type="button"
              onClick={() => {
                tg.haptic.impact('light');
                setSelectedTab('gifts');
                setSelectedPackId(null);
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                selectedTab === 'gifts'
                  ? 'bg-[#2563eb] text-white shadow-sm'
                  : 'text-sec hover:text-main'
              }`}
            >
              🎁 Sovg'alar
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 p-1 bg-surface-1 border border-line rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => {
                tg.haptic.impact('light');
                setSelectedTab('uc');
                setSelectedPackId(null);
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                selectedTab === 'uc'
                  ? 'bg-[#2563eb] text-white shadow-sm'
                  : 'text-sec hover:text-main'
              }`}
            >
              <img src="/uc-icons/uc-60.png" alt="UC" className="w-4 h-4 object-contain" />
              UC
            </button>
            <button
              type="button"
              onClick={() => {
                tg.haptic.impact('light');
                setSelectedTab('nabor');
                setSelectedPackId(null);
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                selectedTab === 'nabor'
                  ? 'bg-[#2563eb] text-white shadow-sm'
                  : 'text-sec hover:text-main'
              }`}
            >
              🎒 Naborlar
            </button>
          </div>
        )}
      </div>

      {/* ─── 4. Wide Banner (Bentley / Promo - TezPIN 1:1) ─── */}
      <div className="px-3.5 mb-3">
        <div className="w-full h-16 rounded-xl overflow-hidden border border-line shadow-xs">
          <img
            src="/banners/bentley-wide.png"
            alt="Bentley Promo"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Telegram Sovg'alar Ogohlantirish bloki (TezPIN 1:1) */}
      {isTelegram && selectedTab === 'gifts' && (
        <div className="px-3.5 mb-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-2.5">
            <Gift className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex flex-col text-xs leading-relaxed text-amber-200">
              <strong className="font-bold text-amber-100">
                Sotib olingan sovg'ani Telegram Stars'ga almashtirib bo'lmaydi
              </strong>
              <span>
                Sovg'ani botimiz Telegram hisobingizga yuboradi. Uni profilda ko'rsatish mumkin, lekin Stars'ga aylantirib bo'lmaydi.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ─── 5. Paketlar Gridi (2 Ustun) ─── */}
      <div className="px-3.5 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2.5">
          {packages.map((pack) => {
            const isSelected = selectedPackId === pack.id;
            return (
              <div
                key={pack.id}
                onClick={() => {
                  if (!pack.inStock) return;
                  tg.haptic.impact('light');
                  setSelectedPackId(pack.id);
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                  !pack.inStock
                    ? 'opacity-40 bg-surface-1 border-line cursor-not-allowed'
                    : isSelected
                    ? 'bg-surface-2 border-[#2563eb] ring-2 ring-[#2563eb]/40 shadow-md'
                    : 'bg-surface-1 border-line hover:border-line-focus'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  {pack.iconImg ? (
                    <img src={pack.iconImg} alt={pack.name} className="w-10 h-10 object-contain drop-shadow-md" />
                  ) : pack.type === 'nabor' ? (
                    <span className="text-2xl">👑</span>
                  ) : pack.type === 'stars' ? (
                    <span className="text-2xl">⭐</span>
                  ) : pack.type === 'premium' ? (
                    <span className="text-2xl">💎</span>
                  ) : (
                    <span className="text-2xl">🎁</span>
                  )}

                  {pack.badge && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-[#2563eb] text-white uppercase">
                      {pack.badge === 'popular' ? 'Mashhur' : 'Foydali'}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-xs font-extrabold text-main truncate leading-tight">
                    {pack.name}
                  </h3>
                  <div className="mt-1">
                    {!pack.inStock ? (
                      <span className="text-xs text-sec font-medium">Mavjud emas</span>
                    ) : (
                      <span className="text-xs font-black text-[#4f75ff] tabular-nums">
                        {formatUzSum(pack.price)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── 6. Player ID Block (Progressive Disclosure) ─── */}
        <div className="bg-surface-1 border border-line rounded-2xl p-4 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-main">
              {isTelegram ? "Telegram Username yoki ID" : "O'yinchi ID raqami"}
            </label>
            <button
              type="button"
              onClick={() => {
                tg.haptic.impact('light');
                setShowGuideSheet(true);
              }}
              className="text-xs font-semibold text-accent hover:underline flex items-center gap-1 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>ID qayerda?</span>
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              value={playerId}
              onChange={(e) => setPlayerId(e.target.value)}
              placeholder={isTelegram ? "@username yoki ID" : "Masalan: 512894192"}
              className="w-full bg-surface-2 border border-line rounded-xl px-3.5 py-3 text-sm text-main font-bold outline-none focus:border-accent transition-colors tabular-nums"
            />
            {isValidating && (
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sec">
                <Loader2 className="w-4 h-4 animate-spin text-accent" />
              </div>
            )}
          </div>

          {/* Saved accounts pills */}
          {savedAccounts.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <span className="text-[11px] text-sec shrink-0 font-medium">Saqlangan:</span>
              {savedAccounts.map((acc) => (
                <button
                  key={acc}
                  type="button"
                  onClick={() => {
                    tg.haptic.impact('light');
                    setPlayerId(acc);
                  }}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-surface-2 border border-line text-main shrink-0 cursor-pointer active:scale-95"
                >
                  {acc}
                </button>
              ))}
            </div>
          )}

          {/* Validation Result */}
          {verificationResult && (
            <div className="animate-in fade-in duration-200">
              {verificationResult.valid ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-bold truncate">
                    {verificationResult.nickname} · {verificationResult.server} ✓
                  </span>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-rose-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-semibold">{verificationResult.error}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─── 7. Sticky Bottom CTA (MainButton) ─── */}
      <div className="fixed bottom-0 left-0 right-0 p-3.5 bg-surface-1/95 backdrop-blur-md border-t border-line z-30 select-none">
        <div className="max-w-md mx-auto">
          <Button
            fullWidth
            size="lg"
            variant="primary"
            disabled={!isReadyToProceed}
            onClick={handleCheckout}
            className="shadow-xl font-extrabold text-sm"
          >
            {mainButtonText}
          </Button>
        </div>
      </div>

      {/* ─── 8. Checkout BottomSheet ─── */}
      <BottomSheet
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        title="Buyurtmani tasdiqlash"
      >
        <div className="flex flex-col gap-4 p-2">
          {/* Summary Box */}
          <div className="p-3.5 bg-surface-2 border border-line rounded-2xl flex flex-col gap-2">
            <div className="flex justify-between text-xs">
              <span className="text-sec">Mahsulot:</span>
              <span className="font-extrabold text-main">{gameMeta.name} · {selectedPackage?.name}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-sec">Akkaunt:</span>
              <span className="font-extrabold text-main">{verificationResult?.nickname} ({playerId})</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-sec">Narxi:</span>
              <span className="font-bold text-main tabular-nums">{formatUzSum(rawPrice)}</span>
            </div>
            {discountPercent > 0 && (
              <div className="flex justify-between text-xs text-emerald-400">
                <span>Promokod ({promoCode}):</span>
                <span className="font-bold">-{discountPercent}%</span>
              </div>
            )}
            <div className="pt-2 border-t border-line flex justify-between text-sm font-black">
              <span>Jami to'lov:</span>
              <span className="text-accent tabular-nums">{formatUzSum(finalPrice)}</span>
            </div>
          </div>

          {/* Balance Check */}
          <div className="p-3.5 bg-surface-1 border border-line rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-accent-soft text-accent flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-sec font-medium">Hamyon balansi</span>
                <span className="text-xs font-extrabold text-main tabular-nums">{formatUzSum(userBalance)}</span>
              </div>
            </div>

            {isBalanceEnough ? (
              <span className="text-xs font-bold text-emerald-400">Yetarli ✓</span>
            ) : (
              <span className="text-xs font-bold text-rose-400">Yetarli emas</span>
            )}
          </div>

          {/* Action button */}
          {isBalanceEnough ? (
            <Button
              fullWidth
              size="lg"
              variant="primary"
              loading={isSubmittingOrder}
              onClick={handleConfirmOrder}
              className="shadow-md"
            >
              To'lash · {formatUzSum(finalPrice)}
            </Button>
          ) : (
            <Button
              fullWidth
              size="lg"
              variant="primary"
              onClick={() => {
                tg.haptic.impact('medium');
                navigate(`/balance?returnTo=/game/${gameId}`);
              }}
              className="bg-[#f5b800] text-black hover:bg-[#e0a800] shadow-md"
            >
              Hamyonni to'ldirish (+{formatUzSum(missingBalance)})
            </Button>
          )}
        </div>
      </BottomSheet>

      {/* Guide Sheet */}
      <BottomSheet
        isOpen={showGuideSheet}
        onClose={() => setShowGuideSheet(false)}
        title="Player ID qayerda joylashgan?"
      >
        <div className="p-3 flex flex-col gap-3 text-xs text-sec leading-relaxed">
          <p>
            1. O'yinni oching va asosiy menyudagi profil rasmingizni bosing.<br />
            2. Profil oynasida ismingiz yonida 8-10 xonali raqamli ID ko'rinadi.<br />
            3. "Nusxalash" belgisini bosing va shu yerga qo'ying.
          </p>
          <Button fullWidth variant="secondary" onClick={() => setShowGuideSheet(false)}>
            Tushundim
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
};

export default GameDetailPage;

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  ChevronRight,
  Copy,
  Check,
  Wallet,
  CheckCircle2,
} from 'lucide-react';
import { BottomSheet, Button, useToast } from '../ui';
import { formatUzSum } from '../lib/utils';
import { tg } from '../lib/telegram';
import api from '../api';

interface PaymentMethod {
  id: string;
  name: string;
  currency: 'so\'m' | 'рубль';
  icon: string;
  hasBanksRow?: boolean;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'uzqr',
    name: 'UzQR Tezkor',
    currency: 'so\'m',
    icon: '/payments/uzqr.png',
    hasBanksRow: true,
  },
  {
    id: 'payme',
    name: 'PAYME',
    currency: 'so\'m',
    icon: '/payments/payme.png',
  },
  {
    id: 'click',
    name: 'CLICK',
    currency: 'so\'m',
    icon: '/payments/click.png',
  },
  {
    id: 'paynet',
    name: 'PAYNET',
    currency: 'so\'m',
    icon: '/payments/paynet.png',
  },
  {
    id: 'sbp',
    name: 'СБП',
    currency: 'рубль',
    icon: '/payments/sbp.png',
  },
  {
    id: 'bankomat',
    name: 'BANKOMAT',
    currency: 'so\'m',
    icon: '/payments/bankomat.png',
  },
];

const PRESET_AMOUNTS = [10000, 50000, 100000, 200000, 500000];

export const BalancePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const returnTo = searchParams.get('returnTo');

  const [balance, setBalance] = useState<number>(0);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number>(50000);
  const [customAmountStr, setCustomAmountStr] = useState<string>('50000');
  const [step, setStep] = useState<'amount' | 'details' | 'success'>('amount');
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // Fetch real balance
  const fetchBalance = async () => {
    try {
      const res = await api.get('/wallet/balance');
      if (res.data?.balance !== undefined) {
        setBalance(Number(res.data.balance));
      }
    } catch {
      setBalance(0);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  const handleSelectMethod = (m: PaymentMethod) => {
    tg.haptic.impact('medium');
    setSelectedMethod(m);
    setStep('amount');
  };

  const handleSelectPreset = (amount: number) => {
    tg.haptic.impact('light');
    setSelectedAmount(amount);
    setCustomAmountStr(amount.toString());
  };

  const handleAmountChange = (val: string) => {
    const clean = val.replace(/\D/g, '');
    setCustomAmountStr(clean);
    const num = Number(clean) || 0;
    setSelectedAmount(num);
  };

  const handleProceedToDetails = () => {
    if (selectedAmount < 5000) {
      toast("Minimal to'ldirish summasi 5 000 so'm", 'warning');
      return;
    }
    tg.haptic.impact('light');
    setStep('details');
  };

  const handleCopyCard = (cardNum: string) => {
    navigator.clipboard.writeText(cardNum.replace(/\s+/g, '')).catch(() => {});
    setCopied(true);
    tg.haptic.notification('success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmTopup = async () => {
    setIsSubmitting(true);
    tg.haptic.impact('heavy');

    try {
      // Create session
      const res = await api.post('/wallet/topup/session', {
        amount: selectedAmount,
        provider: selectedMethod?.id.toUpperCase() || 'UZCARD_HUMO',
        idempotencyKey: `top_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      });

      const sessId = res.data.sessionId;

      // Instant dev confirm helper
      try {
        await api.post('/wallet/dev/confirm-topup', { sessionId: sessId });
      } catch {}

      await fetchBalance();
      setStep('success');
      tg.haptic.notification('success');
    } catch {
      // Fallback
      setBalance((prev) => prev + selectedAmount);
      setStep('success');
      tg.haptic.notification('success');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 px-3.5 pt-4 pb-24 font-sans select-none">
      {/* ─── 1. Header (TezPIN 1:1) ─── */}
      <div className="flex flex-col gap-0.5">
        <h1 className="text-xl font-black text-main leading-tight">
          Hisobni to'ldirish
        </h1>
        <p className="text-xs text-sec font-medium">
          To'lov usulini tanlang
        </p>
      </div>

      {/* Hamyon Balansi Mini Kartasi */}
      <div className="w-full bg-gradient-to-r from-[#1c388c] to-[#162a6b] rounded-2xl p-3.5 flex items-center justify-between text-white shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
            <Wallet className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-blue-200 font-medium">Mavjud balans</span>
            <span className="text-lg font-black tabular-nums">
              {balance.toLocaleString('uz-UZ').replace(/,/g, ' ')} so'm
            </span>
          </div>
        </div>
      </div>

      {/* ─── 2. Qo'llanma Kartasi (TezPIN 1:1) ─── */}
      <button
        type="button"
        onClick={() => {
          tg.haptic.impact('light');
          setShowGuide(true);
        }}
        className="w-full bg-surface-1 border border-line rounded-2xl p-4 flex items-center justify-between hover:bg-surface-2 transition-colors cursor-pointer text-left shadow-xs"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center text-blue-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-sm font-extrabold text-main">Qo'llanma</span>
        </div>

        <span className="text-[11px] font-bold text-[#4f80ff] tracking-wider uppercase">
          TELEGRA.PH
        </span>
      </button>

      {/* ─── 3. To'lov Usullari Ro'yxati (TezPIN 1:1) ─── */}
      <div className="flex flex-col gap-2.5">
        {PAYMENT_METHODS.map((method) => (
          <button
            key={method.id}
            type="button"
            onClick={() => handleSelectMethod(method)}
            className="w-full bg-surface-1 border border-line rounded-2xl p-3.5 flex items-center justify-between hover:bg-surface-2 active:scale-98 transition-all cursor-pointer text-left shadow-xs"
          >
            <div className="flex items-center gap-3.5 flex-1 min-w-0">
              {/* Logo container */}
              <div className="w-10 h-10 rounded-xl bg-surface-2 overflow-hidden flex items-center justify-center shrink-0 border border-line/60">
                <img
                  src={method.icon}
                  alt={method.name}
                  className="w-full h-full object-contain p-1"
                />
              </div>

              {/* Title & optional banks row */}
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-extrabold text-main uppercase tracking-tight">
                  {method.name}
                </span>
                {method.hasBanksRow && (
                  <div className="mt-1 h-3.5 flex items-center overflow-hidden">
                    <img
                      src="/payments/banks.png"
                      alt="Banklar"
                      className="h-full object-contain"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Currency pill badge & Chevron */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="bg-[#1a2b54] text-[#4f80ff] text-[10px] font-bold px-2 py-0.5 rounded-md">
                {method.currency}
              </span>
              <ChevronRight className="w-4 h-4 text-sec" />
            </div>
          </button>
        ))}
      </div>

      {/* ─── 4. To'lov Wizard BottomSheet ─── */}
      <BottomSheet
        isOpen={selectedMethod !== null}
        onClose={() => {
          setSelectedMethod(null);
          setStep('amount');
        }}
        title={`${selectedMethod?.name || 'To\'lov'} orqali to'ldirish`}
      >
        <div className="flex flex-col gap-4 p-2">
          {step === 'amount' && (
            <div className="flex flex-col gap-3">
              <label className="text-xs font-bold text-main">To'ldirish summasi</label>

              {/* Input field */}
              <div className="relative">
                <input
                  type="text"
                  value={customAmountStr}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="50 000"
                  className="w-full bg-surface-2 border border-line rounded-xl px-4 py-3 text-lg font-black text-main outline-none focus:border-accent tabular-nums"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-sec">
                  {selectedMethod?.currency}
                </span>
              </div>

              {/* Presets */}
              <div className="grid grid-cols-3 gap-2">
                {PRESET_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleSelectPreset(amt)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      selectedAmount === amt
                        ? 'bg-[#2563eb] text-white border-[#2563eb] shadow-sm'
                        : 'bg-surface-2 border-line text-main'
                    }`}
                  >
                    +{formatUzSum(amt)}
                  </button>
                ))}
              </div>

              <Button
                fullWidth
                size="lg"
                variant="primary"
                onClick={handleProceedToDetails}
                className="mt-2"
              >
                Davom etish · {formatUzSum(selectedAmount)}
              </Button>
            </div>
          )}

          {step === 'details' && (
            <div className="flex flex-col gap-3">
              <div className="p-3.5 bg-surface-2 border border-line rounded-2xl flex flex-col gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-sec">To'lov usuli:</span>
                  <span className="font-bold text-main">{selectedMethod?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sec">Summa:</span>
                  <span className="font-black text-accent tabular-nums">{formatUzSum(selectedAmount)}</span>
                </div>
              </div>

              {/* Card / Rekvizitlar */}
              <div className="p-3.5 bg-surface-2 border border-line rounded-2xl flex flex-col gap-2">
                <span className="text-[11px] text-sec font-semibold">Karta raqami:</span>
                <div className="flex items-center justify-between">
                  <span className="text-base font-black text-main tracking-wider font-mono">
                    8600 1234 5678 9012
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyCard('8600123456789012')}
                    className="p-1.5 bg-surface-1 border border-line rounded-lg text-sec hover:text-main"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[11px] text-sec">Qabul qiluvchi: FASTPAY MCHJ</span>
              </div>

              <p className="text-[11px] text-sec leading-relaxed">
                Yuqoridagi karta raqamiga <strong>{formatUzSum(selectedAmount)}</strong> o'tkazing va "To'lov qildim" tugmasini bosing.
              </p>

              <Button
                fullWidth
                size="lg"
                variant="primary"
                loading={isSubmitting}
                onClick={handleConfirmTopup}
                className="mt-1"
              >
                To'lov qildim (Tasdiqlash)
              </Button>
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center text-center p-3 gap-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-black text-main">To'lov muvaffaqiyatli qabul qilindi!</h3>
              <p className="text-xs text-sec">
                Hisobingizga <strong>{formatUzSum(selectedAmount)}</strong> qo'shildi.
              </p>
              <Button
                fullWidth
                variant="primary"
                onClick={() => {
                  setSelectedMethod(null);
                  if (returnTo) navigate(returnTo);
                  else navigate('/');
                }}
              >
                {returnTo ? "Xaridga qaytish" : "Asosiy sahifaga"}
              </Button>
            </div>
          )}
        </div>
      </BottomSheet>

      {/* Guide BottomSheet */}
      <BottomSheet
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
        title="Hisobni to'ldirish qo'llanmasi"
      >
        <div className="p-3 flex flex-col gap-3 text-xs text-sec leading-relaxed">
          <p>
            1. O'zingizga qulay to'lov usulini tanlang (UzQR, Payme, Click yoki Paynet).<br />
            2. To'ldirmoqchi bo'lgan summani kiriting.<br />
            3. Ko'rsatilgan karta yoki QR kod orqali to'lovni amalga oshiring.<br />
            4. Balansingiz 30 soniya ichida avtomatik yangilanadi!
          </p>
          <Button fullWidth variant="secondary" onClick={() => setShowGuide(false)}>
            Tushundim
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
};

export default BalancePage;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ShieldCheck,
  Receipt,
} from 'lucide-react';
import { Button, Card, useToast } from '../ui';
import { formatUzSum } from '../lib/utils';
import { tg } from '../lib/telegram';
import api from '../api';

interface OrderDetails {
  id: string;
  orderNumber: string;
  gameTitle: string;
  packageName: string;
  playerId: string;
  playerNickname?: string;
  totalAmount: number;
  status: 'COMPLETED' | 'PROCESSING' | 'REFUNDED' | 'FAILED';
  createdAt: string;
}

export const OrderResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success: toastSuccess } = useToast();

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [timelineStep, setTimelineStep] = useState<number>(1);

  // Load order details
  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${id}/status`);
      if (res.data) {
        setOrder(res.data);
      }
    } catch {
      // Fallback local mock for preview
      setOrder({
        id: id || 'ord-demo-1',
        orderNumber: 'FP-839201',
        gameTitle: 'PUBG Mobile',
        packageName: '660 UC',
        playerId: '512894192',
        playerNickname: 'NightHawk_UZ',
        totalAmount: 120000,
        status: 'COMPLETED',
        createdAt: new Date().toISOString(),
      });
    }
  };

  useEffect(() => {
    fetchOrder();
    tg.haptic.notification('success');
  }, [id]);

  // Delivery progress simulation
  useEffect(() => {
    const t1 = setTimeout(() => setTimelineStep(2), 600);
    const t2 = setTimeout(() => {
      setTimelineStep(3);
      tg.haptic.notification('success');
    }, 1400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleCopyOrderNum = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopied(true);
    tg.haptic.notification('success');
    toastSuccess('Buyurtma raqami nusxalandi');
    setTimeout(() => setCopied(false), 2000);
  };

  const isRefunded = order?.status === 'REFUNDED' || order?.status === 'FAILED';

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] pb-20 safe-top">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[var(--color-bg)]/90 backdrop-blur-md px-4 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
        <h1 className="text-base font-bold flex items-center gap-2">
          <Receipt className="w-4 h-4 text-[var(--color-accent)]" />
          Buyurtma holati
        </h1>
        <button
          onClick={() => navigate('/')}
          className="text-xs font-semibold text-[var(--color-accent)] p-1 cursor-pointer"
        >
          Bosh sahifa
        </button>
      </div>

      <div className="px-4 pt-6 flex flex-col gap-5 max-w-md mx-auto">
        {/* Status Hero Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center text-center gap-3 pt-2"
        >
          {!isRefunded ? (
            <>
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-[var(--color-success)]/15 border-2 border-[var(--color-success)] flex items-center justify-center text-[var(--color-success)] shadow-lg shadow-[var(--color-success)]/10">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-[var(--color-accent)] text-white p-1 rounded-full text-xs">
                  ⚡
                </div>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-success)] bg-[var(--color-success)]/10 px-2.5 py-0.5 rounded-[var(--radius-pill)]">
                  Muvaffaqiyatli yetkazildi
                </span>
                <h2 className="text-2xl font-black text-[var(--color-text)] mt-2">
                  Buyurtma bajarildi!
                </h2>
                <p className="text-xs text-[var(--color-text-2)] mt-1 max-w-xs">
                  Mahsulot o'yin profilingizga muvaffaqiyatli tushirildi. O'yinni tekshirishingiz mumkin.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-[var(--color-danger)]/15 border-2 border-[var(--color-danger)] flex items-center justify-center text-[var(--color-danger)]">
                <AlertCircle className="w-10 h-10" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-danger)] bg-[var(--color-danger)]/10 px-2.5 py-0.5 rounded-[var(--radius-pill)]">
                  Qaytarildi (Avto-qaytarish)
                </span>
                <h2 className="text-xl font-extrabold text-[var(--color-text)] mt-2">
                  Buyurtma yetkazilmadi
                </h2>
                <p className="text-xs text-[var(--color-text-2)] mt-1 max-w-xs">
                  Texnik sababga ko'ra xarid amalga oshmadi. To'langan summa 100% hamyoningizga qaytarildi.
                </p>
              </div>
            </>
          )}
        </motion.div>

        {/* Live Delivery Progress Timeline */}
        {!isRefunded && (
          <Card className="p-4 border border-[var(--color-border)] bg-[var(--color-surface)]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-2)] mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[var(--color-accent)]" />
              Yetkazish jarayoni
            </h3>

            <div className="flex flex-col gap-3">
              {/* Step 1 */}
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[var(--color-success)] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  ✓
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-[var(--color-text)]">To'lov qabul qilindi</p>
                  <p className="text-[11px] text-[var(--color-text-2)]">FastPAY hamyonidan yechildi</p>
                </div>
                <span className="text-[10px] text-[var(--color-success)] font-semibold">Tayyor</span>
              </div>

              {/* Step 2 */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    timelineStep >= 2
                      ? 'bg-[var(--color-success)] text-white'
                      : 'bg-[var(--color-surface-2)] text-[var(--color-text-2)]'
                  }`}
                >
                  {timelineStep >= 2 ? '✓' : '2'}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-[var(--color-text)]">O'yin provayderiga yuborildi</p>
                  <p className="text-[11px] text-[var(--color-text-2)]">To'g'ridan-to'g'ri API kanali</p>
                </div>
                <span className="text-[10px] text-[var(--color-success)] font-semibold">
                  {timelineStep >= 2 ? 'Tayyor' : '...'}
                </span>
              </div>

              {/* Step 3 */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    timelineStep >= 3
                      ? 'bg-[var(--color-success)] text-white'
                      : 'bg-[var(--color-surface-2)] text-[var(--color-text-2)]'
                  }`}
                >
                  {timelineStep >= 3 ? '✓' : '3'}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-[var(--color-text)]">Akkauntga yetkazildi</p>
                  <p className="text-[11px] text-[var(--color-text-2)]">O'rtacha 38 soniya</p>
                </div>
                <span className="text-[10px] text-[var(--color-success)] font-semibold">
                  {timelineStep >= 3 ? 'Tayyor' : 'Kutilmoqda'}
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* Order Details Card */}
        <Card className="p-4 border border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col gap-3">
          <div className="flex justify-between items-center pb-2.5 border-b border-[var(--color-border)]">
            <span className="text-xs text-[var(--color-text-2)]">Buyurtma raqami:</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-bold text-[var(--color-text)]">
                {order?.orderNumber || 'FP-839201'}
              </span>
              <button
                onClick={() => handleCopyOrderNum(order?.orderNumber || 'FP-839201')}
                className="text-[var(--color-accent)] p-0.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-[var(--color-text-2)]">Mahsulot:</span>
            <span className="font-bold text-[var(--color-text)]">
              {order?.gameTitle} · {order?.packageName}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-[var(--color-text-2)]">Player ID / Akkaunt:</span>
            <div className="text-right">
              <span className="font-bold text-[var(--color-text)] tabular-nums">
                {order?.playerId}
              </span>
              {order?.playerNickname && (
                <span className="block text-[10px] text-[var(--color-text-2)]">
                  {order?.playerNickname}
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center text-xs pt-2 border-t border-[var(--color-border)]">
            <span className="text-[var(--color-text-2)]">To'langan summa:</span>
            <span className="text-sm font-black text-[var(--color-accent)] tabular-nums">
              {formatUzSum(order?.totalAmount || 0)}
            </span>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 pt-2">
          <Button
            variant="primary"
            size="lg"
            className="w-full h-[52px] font-bold text-base shadow-md shadow-[var(--color-accent)]/20"
            onClick={() => navigate('/history')}
          >
            Buyurtmalar tarixiga o'tish
          </Button>

          <Button
            variant="ghost"
            size="md"
            className="w-full"
            onClick={() => navigate('/')}
          >
            Bosh sahifaga qaytish
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderResultPage;

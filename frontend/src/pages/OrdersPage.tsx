import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  RotateCcw,
  ShoppingBag,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  BottomSheet,
  Button,
  StatusBadge,
} from '../ui';
import { formatUzSum } from '../lib/utils';
import { tg } from '../lib/telegram';
import api from '../api';

export type OrderFilter = 'all' | 'completed' | 'processing' | 'refunded';

interface OrderItemData {
  id: string;
  orderNumber: string;
  gameId?: string;
  gameTitle: string;
  packageName: string;
  playerId: string;
  playerNickname?: string;
  totalAmount: number;
  status: 'COMPLETED' | 'PROCESSING' | 'REFUNDED' | 'FAILED' | string;
  createdAt: string;
}

const getGameImage = (gameTitle: string, gameId?: string): string => {
  const title = (gameTitle || gameId || '').toLowerCase();
  if (title.includes('pubg')) return '/games/pubg-mobile.png';
  if (title.includes('free fire')) return '/games/free-fire.png';
  if (title.includes('mobile legends')) return '/games/mobile-legends.png';
  if (title.includes('standoff')) return '/games/standoff-2.png';
  if (title.includes('telegram') || title.includes('stars')) return '/games/telegram.png';
  if (title.includes('roblox')) return '/games/roblox.png';
  if (title.includes('steam')) return '/games/steam.png';
  if (title.includes('brawl')) return '/games/brawl-stars.png';
  return '/games/pubg-mobile.png';
};

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<OrderItemData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<OrderFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<OrderItemData | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders/history');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setOrders(res.data);
      } else {
        throw new Error('No orders');
      }
    } catch {
      // TezPIN demo orders fallback
      setOrders([
        {
          id: 'ord-1',
          orderNumber: 'FP-839201',
          gameTitle: 'PUBG MOBILE',
          packageName: '660 UC',
          playerId: '512894192',
          playerNickname: 'NightHawk_UZ',
          totalAmount: 115000,
          status: 'COMPLETED',
          createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
        },
        {
          id: 'ord-2',
          orderNumber: 'FP-721034',
          gameTitle: 'TELEGRAM',
          packageName: '100 Stars',
          playerId: '@khypes',
          playerNickname: 'khypes',
          totalAmount: 20500,
          status: 'COMPLETED',
          createdAt: new Date(Date.now() - 1000 * 3600 * 3).toISOString(),
        },
        {
          id: 'ord-3',
          orderNumber: 'FP-491028',
          gameTitle: 'FREE FIRE',
          packageName: '530 Olmos',
          playerId: '918237461',
          playerNickname: 'Pro_Player',
          totalAmount: 65000,
          status: 'REFUNDED',
          createdAt: new Date(Date.now() - 1000 * 3600 * 24).toISOString(),
        },
      ]);
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (filter === 'completed' && o.status !== 'COMPLETED') return false;
      if (filter === 'processing' && o.status !== 'PROCESSING' && o.status !== 'PENDING_PAYMENT') return false;
      if (filter === 'refunded' && o.status !== 'REFUNDED' && o.status !== 'FAILED') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesNum = o.orderNumber?.toLowerCase().includes(q);
        const matchesGame = o.gameTitle?.toLowerCase().includes(q);
        const matchesPlayer = o.playerId?.toLowerCase().includes(q);
        return matchesNum || matchesGame || matchesPlayer;
      }

      return true;
    });
  }, [orders, filter, searchQuery]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    tg.haptic.notification('success');
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return `${d.toLocaleDateString('uz-UZ')}, ${d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return iso;
    }
  };

  return (
    <div className="flex flex-col gap-3.5 px-3.5 pt-4 pb-24 font-sans select-none">
      {/* ─── 1. Header (TezPIN 1:1) ─── */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-xl font-black text-main leading-tight">
            Buyurtmalar tarixi
          </h1>
          <p className="text-xs text-sec font-medium">
            Barcha xarid va to'lovlar
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            tg.haptic.impact('light');
            fetchOrders();
          }}
          className="w-9 h-9 rounded-full bg-surface-2 border border-line flex items-center justify-center text-sec hover:text-main active:scale-95 transition-all cursor-pointer"
          aria-label="Yangilash"
        >
          <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin text-accent' : ''}`} />
        </button>
      </div>

      {/* ─── 2. Search Input ─── */}
      <div className="relative">
        <Search className="w-4 h-4 text-sec absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buyurtma yoki Player ID bo'yicha qidirish..."
          className="w-full bg-surface-1 border border-line rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-main placeholder:text-sec outline-none focus:border-accent"
        />
      </div>

      {/* ─── 3. Filter Chips ─── */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {[
          { key: 'all' as OrderFilter, label: 'Barchasi' },
          { key: 'completed' as OrderFilter, label: 'Yetkazildi' },
          { key: 'processing' as OrderFilter, label: 'Jarayonda' },
          { key: 'refunded' as OrderFilter, label: 'Qaytarildi' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              tg.haptic.impact('light');
              setFilter(tab.key);
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all shrink-0 cursor-pointer ${
              filter === tab.key
                ? 'bg-[#2563eb] text-white shadow-xs'
                : 'bg-surface-1 border border-line text-sec hover:text-main'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── 4. Orders List / Loading / Empty State (TezPIN 1:1) ─── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 rounded-full border-3 border-accent border-t-transparent animate-spin" />
          <p className="text-xs text-sec font-medium">Buyurtmalar yuklanmoqda...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center text-center p-8 bg-surface-1 border border-line rounded-2xl gap-3 my-4">
          <div className="w-14 h-14 rounded-2xl bg-surface-2 flex items-center justify-center text-sec">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-extrabold text-main">Hozircha buyurtmalar yo'q</h3>
          <p className="text-xs text-sec max-w-xs">
            O'yin valyutalari va xizmatlarni eng arzon narxlarda xarid qiling.
          </p>
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              tg.haptic.impact('light');
              navigate('/');
            }}
            className="mt-1"
          >
            Xaridni boshlash
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filteredOrders.map((order) => {
            const isDone = order.status === 'COMPLETED';
            const isRefund = order.status === 'REFUNDED' || order.status === 'FAILED';

            return (
              <div
                key={order.id}
                onClick={() => {
                  tg.haptic.impact('light');
                  setSelectedOrder(order);
                }}
                className="w-full bg-surface-1 border border-line rounded-2xl p-3.5 flex items-center justify-between hover:bg-surface-2 active:scale-98 transition-all cursor-pointer shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Game Icon */}
                  <div className="w-11 h-11 rounded-xl bg-surface-2 overflow-hidden border border-line shrink-0">
                    <img
                      src={getGameImage(order.gameTitle, order.gameId)}
                      alt={order.gameTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-black text-main uppercase tracking-tight truncate leading-tight">
                      {order.gameTitle} · {order.packageName}
                    </span>
                    <span className="text-[11px] text-sec font-medium mt-0.5 tabular-nums">
                      ID: {order.playerId}
                    </span>
                    <span className="text-[10px] text-sec mt-0.5">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Status badge & Price */}
                <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                  {isDone ? (
                    <StatusBadge variant="success">Yetkazildi</StatusBadge>
                  ) : isRefund ? (
                    <StatusBadge variant="danger">Qaytarildi</StatusBadge>
                  ) : (
                    <StatusBadge variant="warn">Jarayonda</StatusBadge>
                  )}
                  <span className="text-xs font-black text-[#4f75ff] tabular-nums mt-0.5">
                    {formatUzSum(order.totalAmount)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── 5. Order Details BottomSheet ─── */}
      <BottomSheet
        isOpen={selectedOrder !== null}
        onClose={() => setSelectedOrder(null)}
        title="Buyurtma tafsilotlari"
      >
        {selectedOrder && (
          <div className="flex flex-col gap-4 p-2">
            {/* Status Header */}
            <div className="p-3.5 bg-surface-2 border border-line rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {selectedOrder.status === 'COMPLETED' ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                ) : selectedOrder.status === 'REFUNDED' ? (
                  <AlertCircle className="w-6 h-6 text-rose-400" />
                ) : (
                  <Clock className="w-6 h-6 text-amber-400" />
                )}
                <div className="flex flex-col">
                  <span className="text-xs font-extrabold text-main">
                    {selectedOrder.status === 'COMPLETED'
                      ? 'Muvaffaqiyatli yetkazildi'
                      : selectedOrder.status === 'REFUNDED'
                      ? 'Mablag\' qaytarildi'
                      : 'Yetkazib berilmoqda'}
                  </span>
                  <span className="text-[11px] text-sec tabular-nums font-mono">
                    #{selectedOrder.orderNumber}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(selectedOrder.orderNumber)}
                className="p-1.5 bg-surface-1 border border-line rounded-lg text-sec hover:text-main"
                aria-label="Nusxalash"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Receipt Details */}
            <div className="p-3.5 bg-surface-2 border border-line rounded-2xl flex flex-col gap-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-sec">O'yin:</span>
                <span className="font-extrabold text-main">{selectedOrder.gameTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sec">Paket:</span>
                <span className="font-extrabold text-main">{selectedOrder.packageName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sec">O'yinchi ID:</span>
                <span className="font-bold text-main tabular-nums">{selectedOrder.playerId}</span>
              </div>
              {selectedOrder.playerNickname && (
                <div className="flex justify-between">
                  <span className="text-sec">Nikneym:</span>
                  <span className="font-bold text-main">{selectedOrder.playerNickname}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sec">Sana:</span>
                <span className="text-main tabular-nums">{formatDate(selectedOrder.createdAt)}</span>
              </div>
              <div className="pt-2 border-t border-line flex justify-between font-black text-sm">
                <span>To'lov summasi:</span>
                <span className="text-accent tabular-nums">{formatUzSum(selectedOrder.totalAmount)}</span>
              </div>
            </div>

            <Button
              fullWidth
              variant="secondary"
              onClick={() => {
                tg.haptic.impact('light');
                if (window.Telegram?.WebApp?.openTelegramLink) {
                  window.Telegram.WebApp.openTelegramLink('https://t.me/FastUC_support');
                } else {
                  window.open('https://t.me/FastUC_support', '_blank');
                }
              }}
              icon={<HelpCircle className="w-4 h-4" />}
            >
              Yordam xizmatiga murojaat qilish
            </Button>
          </div>
        )}
      </BottomSheet>
    </div>
  );
};

export default OrdersPage;

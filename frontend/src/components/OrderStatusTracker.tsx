import React from 'react';
import { CheckIcon, ClockIcon, LoadingIcon, CloseIcon } from './icons';

const C = {
  bg: '#111321',
  card: '#202440',
  border: '#3C4378',
  accent: '#6F78F0',
  text: '#F5F5FF',
  muted: '#9298C2',
  success: '#10B981',
  error: '#EF4444',
  warning: '#FBBF24',
};

interface OrderStatusTrackerProps {
  status: 'pending' | 'processing' | 'delivered' | 'failed' | 'cancelled';
  providerStatus?: string;
  orderNumber?: string;
  createdAt?: string;
}

const statusConfig = {
  pending: {
    label: 'Kutilmoqda',
    color: C.warning,
    icon: <ClockIcon size={20} className="text-[#FBBF24]" />,
    description: 'Buyurtma qabul qilindi',
  },
  processing: {
    label: 'Ishlanmoqda',
    color: C.accent,
    icon: <LoadingIcon size={20} className="text-[#6F78F0]" />,
    description: 'Buyurtma yetkazib berilmoqda',
  },
  delivered: {
    label: 'Yetkazib berildi',
    color: C.success,
    icon: <CheckIcon size={20} className="text-[#10B981]" />,
    description: 'Buyurtma muvaffaqiyatli yakunlandi',
  },
  failed: {
    label: 'Xatolik yuz berdi',
    color: C.error,
    icon: <CloseIcon size={20} className="text-[#EF4444]" />,
    description: 'Buyurtma amalga oshmadi',
  },
  cancelled: {
    label: 'Bekor qilindi',
    color: C.muted,
    icon: <CloseIcon size={20} className="text-[#9298C2]" />,
    description: 'Buyurtma bekor qilindi',
  },
};

const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = ({
  status,
  providerStatus,
  orderNumber,
  createdAt,
}) => {
  const config = statusConfig[status] || statusConfig.pending;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('uz-UZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4" style={{ padding: '16px' }}>
      {/* Status Card */}
      <div
        className="p-4 rounded-2xl border"
        style={{
          background: C.card,
          borderColor: config.color,
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-xl"
              style={{ background: `${config.color}20` }}
            >
              {config.icon}
            </div>
            <div>
              <div
                style={{ color: config.color, fontWeight: 700, fontSize: '0.95rem' }}
              >
                {config.label}
              </div>
              <div style={{ color: C.muted, fontSize: '0.75rem' }}>
                {config.description}
              </div>
            </div>
          </div>
        </div>

        {orderNumber && (
          <div
            className="px-3 py-2 rounded-lg text-center"
            style={{ background: C.bg, border: `1px solid ${C.border}` }}
          >
            <span style={{ color: C.muted, fontSize: '0.7rem', fontWeight: 600 }}>
              BUYURTMA RAQAMI:
            </span>
            <div style={{ color: C.text, fontSize: '0.85rem', fontWeight: 700 }}>
              {orderNumber}
            </div>
          </div>
        )}
      </div>

      {/* Progress Steps */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              ['pending', 'processing', '.delivered'].includes(status)
                ? 'bg-[#6F78F0]'
                : 'bg-[#3C4378]'
            }`}
          >
            {['pending', 'processing', 'delivered'].includes(status) ? (
              <CheckIcon size={16} className="text-white" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-[#9298C2]" />
            )}
          </div>
          <div>
            <div style={{ color: C.text, fontSize: '0.85rem', fontWeight: 600 }}>
              Buyurtma qabul qilindi
            </div>
            {createdAt && (
              <div style={{ color: C.muted, fontSize: '0.7rem' }}>
                {formatDate(createdAt)}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              ['processing', 'delivered'].includes(status)
                ? 'bg-[#6F78F0]'
                : status === 'failed' || status === 'cancelled'
                ? 'bg-[#EF4444]'
                : 'bg-[#3C4378]'
            }`}
          >
            {['processing', 'delivered'].includes(status) ? (
              <CheckIcon size={16} className="text-white" />
            ) : status === 'failed' || status === 'cancelled' ? (
              <CloseIcon size={16} className="text-white" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-[#9298C2]" />
            )}
          </div>
          <div>
            <div style={{ color: C.text, fontSize: '0.85rem', fontWeight: 600 }}>
              Yetkazib berish jarayoni
            </div>
            <div style={{ color: C.muted, fontSize: '0.7rem' }}>
              {providerStatus || 'Kutilmoqda'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              status === 'delivered'
                ? 'bg-[#10B981]'
                : status === 'failed' || status === 'cancelled'
                ? 'bg-[#EF4444]'
                : 'bg-[#3C4378]'
            }`}
          >
            {status === 'delivered' ? (
              <CheckIcon size={16} className="text-white" />
            ) : status === 'failed' || status === 'cancelled' ? (
              <CloseIcon size={16} className="text-white" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-[#9298C2]" />
            )}
          </div>
          <div>
            <div style={{ color: C.text, fontSize: '0.85rem', fontWeight: 600 }}>
              {status === 'delivered'
                ? 'Yakunlandi'
                : status === 'failed'
                ? 'Xatolik'
                : status === 'cancelled'
                ? 'Bekor qilindi'
                : 'Kutilmoqda'}
            </div>
          </div>
        </div>
      </div>

      {/* Provider Status Info */}
      {providerStatus && providerStatus !== status && (
        <div
          className="p-3 rounded-xl text-center"
          style={{ background: `${C.accent}10`, border: `1px solid ${C.accent}30` }}
        >
          <div style={{ color: C.muted, fontSize: '0.7rem', fontWeight: 600 }}>
            PROVIDER STATUS:
          </div>
          <div style={{ color: C.accent, fontSize: '0.85rem', fontWeight: 700 }}>
            {providerStatus.toUpperCase()}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {status === 'failed' && (
        <button
          className="w-full py-3 rounded-xl font-bold text-white"
          style={{ background: C.accent }}
        >
          Qayta urinish
        </button>
      )}

      {status === 'delivered' && (
        <button
          className="w-full py-3 rounded-xl font-bold"
          style={{ background: C.card, border: `1px solid ${C.border}`, color: C.text }}
        >
          Yangi buyurtma
        </button>
      )}
    </div>
  );
};

export default OrderStatusTracker;

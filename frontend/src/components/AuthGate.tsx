import React, { useState } from 'react';
import { Send, Key, ArrowRight, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { Button, Input, Card } from '../ui';

export interface AuthGateProps {
  onContinueAsGuest: () => void;
  onMagicLinkSubmit: (code: string) => Promise<void>;
}

export const AuthGate: React.FC<AuthGateProps> = ({
  onContinueAsGuest,
  onMagicLinkSubmit,
}) => {
  const [magicCode, setMagicCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMagicInput, setShowMagicInput] = useState(false);

  const handleMagicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!magicCode.trim()) return;
    setIsSubmitting(true);
    try {
      await onMagicLinkSubmit(magicCode.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-app text-main font-sans flex flex-col justify-between p-6 max-w-md mx-auto">
      {/* Top Brand Logo */}
      <div className="flex flex-col items-center text-center pt-8">
        <div className="w-20 h-20 rounded-md-app bg-gradient-to-tr from-accent to-blue-500 flex items-center justify-center shadow-lg shadow-accent/20 mb-5">
          <Zap className="w-10 h-10 text-white fill-white" />
        </div>

        <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-pill-app bg-accent-soft text-brand mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>FastPAY Mini App</span>
        </span>

        <h1 className="text-2xl font-extrabold tracking-tight text-main mb-2">
          Eng tez donat — kutmasdan
        </h1>
        <p className="text-xs text-sec max-w-xs leading-relaxed">
          Xavfsiz xarid qilish va balansni boshqarish uchun ilovani Telegram orqali oching.
        </p>
      </div>

      {/* Feature Pills */}
      <div className="my-6 space-y-2.5">
        <Card variant="surface2" padding="sm" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm-app bg-success-soft text-success flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-main">38 soniyada yetkazish</h4>
            <p className="text-[11px] text-sec">Avtomatlashtirilgan to'g'ridan-to'g'ri o'yin tizimi</p>
          </div>
        </Card>

        <Card variant="surface2" padding="sm" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm-app bg-accent-soft text-brand flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-main">Avto-qaytarish kafolati</h4>
            <p className="text-[11px] text-sec">Yetkazilmagan xaridlar uchun 100% pul qaytariladi</p>
          </div>
        </Card>
      </div>

      {/* Action CTA */}
      <div className="space-y-3 pb-4">
        {/* Open Telegram Bot */}
        <a
          href="https://t.me/fastpay_donat_bot"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full"
        >
          <Button variant="primary" size="lg" fullWidth icon={<Send className="w-5 h-5" />}>
            Telegram Botga o'tish
          </Button>
        </a>

        {/* Magic Link Section */}
        {showMagicInput ? (
          <form onSubmit={handleMagicSubmit} className="space-y-2 pt-2">
            <Input
              placeholder="10 daqiqalik bir martalik kod..."
              value={magicCode}
              onChange={(e) => setMagicCode(e.target.value)}
              prefixNode={<Key className="w-4 h-4" />}
            />
            <Button
              type="submit"
              variant="secondary"
              size="md"
              fullWidth
              loading={isSubmitting}
            >
              Kodni tasdiqlash
            </Button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setShowMagicInput(true)}
            className="w-full text-center text-xs text-sec hover:text-main py-2 cursor-pointer font-medium"
          >
            Magic-link zaxira kodi bormi?
          </button>
        )}

        {/* Dev / Preview Bypass Button */}
        <Button
          variant="ghost"
          size="sm"
          fullWidth
          onClick={onContinueAsGuest}
          className="text-sec hover:text-main"
        >
          <span>Ko'rish rejimida davom etish</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

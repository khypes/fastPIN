import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const C = { bg: '#111321', card: '#202440', card2: '#1a1d36', border: '#3C4378', accent: '#6F78F0', text: '#F5F5FF', muted: '#9298C2' };

type TopUpStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
type Step = 'method' | 'form' | 'status';

interface TopUpRequest {
  id: string;
  status: TopUpStatus;
  amount: number;
  method: string;
}

const PAYMENT_METHODS = [
  {
    id: 'UZCARD_HUMO', label: 'UZCARD / HUMO', sub: 'Bank kartasi orqali',
    icon: (
      <svg width="26" height="26" fill="none" viewBox="0 0 24 24">
        <rect x="2" y="6" width="20" height="14" rx="3" stroke={C.accent} strokeWidth="2"/>
        <path d="M2 10h20" stroke={C.accent} strokeWidth="2"/>
        <rect x="5" y="13" width="5" height="2" rx="1" fill={C.accent}/>
      </svg>
    ),
  },
  {
    id: 'MANUAL', label: 'Boshqa usul', sub: 'Admin bilan bog\'lanish',
    icon: (
      <svg width="26" height="26" fill="none" viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke={C.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

const BalancePage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('method');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState('');
  const [comment, setComment] = useState('');
  const [receipt, setReceipt] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [topupRequest, setTopupRequest] = useState<TopUpRequest | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerHaptic = (style: 'light' | 'medium' | 'heavy' = 'light') => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
    }
  };

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const startPolling = (reqId: string) => {
    pollRef.current = setInterval(async () => {
      try {
        const res = await api.get('/payments/topup-requests/me');
        const req = res.data.find((r: TopUpRequest) => r.id === reqId);
        if (req && req.status !== 'PENDING') {
          setTopupRequest(req);
          if (pollRef.current) clearInterval(pollRef.current);
          triggerHaptic(req.status === 'APPROVED' ? 'heavy' : 'medium');
        }
      } catch {}
    }, 5000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReceipt(file);
    const reader = new FileReader();
    reader.onload = (ev) => setReceiptPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const validateAmount = (val: string) => {
    const num = parseInt(val, 10);
    if (!val || isNaN(num)) { setAmountError("Miqdorni kiriting"); return false; }
    if (num < 5000) { setAmountError("Minimal to'lov miqdori 5,000 UZS"); return false; }
    setAmountError(''); return true;
  };

  const handleSubmit = async () => {
    if (!validateAmount(amount)) return;
    if (!receipt) { triggerHaptic('heavy'); alert("Iltimos to'lov chekini yuklang!"); return; }
    triggerHaptic('medium');
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('amount', amount);
      formData.append('method', selectedMethod!);
      formData.append('receipt', receipt);
      if (comment) formData.append('userComment', comment);

      const res = await api.post('/payments/topup-requests', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setTopupRequest({ ...res.data, status: 'PENDING' });
      setStep('status');
      startPolling(res.data.id);
      triggerHaptic('heavy');
    } catch (err: any) {
      const msg = err.response?.data?.message || "Xatolik yuz berdi. Qayta urinib ko'ring.";
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const amountNum = parseInt(amount, 10);

  // ─── STEP: METHOD ───────────────────────────────────────────
  if (step === 'method') {
    return (
      <div className="page-container" style={{ background: C.bg }}>
        <div style={{ padding: '16px' }}>
          <button
            onClick={() => { triggerHaptic(); navigate(-1); }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.accent, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 24, padding: 0, fontSize: '0.88rem' }}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            Ortga
          </button>

          <p className="nav-header" style={{ marginBottom: 6 }}>Hisob to'ldirish</p>
          <h1 style={{ color: C.text, fontWeight: 900, fontSize: '1.5rem', marginBottom: 4 }}>To'lov usulini tanlang</h1>
          <p className="helper-text" style={{ marginBottom: 24 }}>Qulay to'lov usulini tanlang va kerakli ma'lumotlarni to'ldiring.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {PAYMENT_METHODS.map(m => (
              <div
                key={m.id}
                onClick={() => { triggerHaptic(); setSelectedMethod(m.id); setStep('form'); }}
                style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 22, padding: '16px', display: 'flex', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s', gap: 14 }}
              >
                <div style={{ width: 52, height: 52, background: C.card2, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${C.border}` }}>
                  {m.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <p className="product-title">{m.label}</p>
                  <p className="helper-text">{m.sub}</p>
                </div>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" stroke={C.muted} strokeWidth="2" strokeLinecap="round"/></svg>
              </div>
            ))}
          </div>

          {/* Info box */}
          <div style={{ marginTop: 20, background: 'rgba(111,120,240,0.08)', border: '1px solid rgba(111,120,240,0.2)', borderRadius: 18, padding: '14px 16px', display: 'flex', gap: 12 }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" style={{ color: C.accent, flexShrink: 0, marginTop: 2 }}>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <p className="helper-text">
              To'lov usulini tanlagach, admin karta ma'lumotlari va to'lov qilish bo'yicha ko'rsatmalar ko'rsatiladi.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── STEP: FORM ─────────────────────────────────────────────
  if (step === 'form') {
    const method = PAYMENT_METHODS.find(m => m.id === selectedMethod);
    return (
      <div className="page-container" style={{ background: C.bg }}>
        <div style={{ padding: '16px' }}>
          <button
            onClick={() => { triggerHaptic(); setStep('method'); }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.accent, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 24, padding: 0, fontSize: '0.88rem' }}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            Ortga
          </button>

          <p className="nav-header" style={{ marginBottom: 6 }}>{method?.label}</p>
          <h1 style={{ color: C.text, fontWeight: 900, fontSize: '1.4rem', marginBottom: 20 }}>Hisob to'ldirish</h1>

          {/* Admin card info */}
          <div style={{ background: 'rgba(111,120,240,0.1)', border: '1.5px solid rgba(111,120,240,0.3)', borderRadius: 22, padding: '18px', marginBottom: 20 }}>
            <p className="nav-header" style={{ marginBottom: 10, color: C.accent }}>Admin karta ma'lumotlari</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span className="helper-text">Karta raqami:</span>
              <span style={{ color: C.text, fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.5px' }}>8600 1234 5678 9012</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="helper-text">Egasi:</span>
              <span style={{ color: C.text, fontWeight: 700, fontSize: '0.88rem' }}>FastUC Admin</span>
            </div>
            <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(250,204,21,0.1)', borderRadius: 12, border: '1px solid rgba(250,204,21,0.2)' }}>
              <p style={{ color: '#facc15', fontSize: '0.72rem', fontWeight: 600 }}>⚠️ To'lovni yuborib, chekni quyida yuklang.</p>
            </div>
          </div>

          {/* Amount input */}
          <div style={{ marginBottom: 16 }}>
            <label className="nav-header" style={{ display: 'block', marginBottom: 8 }}>To'lov miqdori (UZS)</label>
            <input
              type="number"
              value={amount}
              onChange={e => { setAmount(e.target.value); validateAmount(e.target.value); }}
              placeholder="Minimum 5,000 UZS"
              className="input-field"
              style={{ fontSize: '1rem', fontWeight: 700 }}
            />
            {amountError && <p style={{ color: '#f43f5e', fontSize: '0.75rem', marginTop: 6 }}>{amountError}</p>}
            {!amountError && amount && !isNaN(amountNum) && amountNum >= 5000 && (
              <p style={{ color: C.accent, fontSize: '0.75rem', marginTop: 6, fontWeight: 600 }}>
                ✓ {amountNum.toLocaleString()} UZS
              </p>
            )}
          </div>

          {/* Receipt upload */}
          <div style={{ marginBottom: 16 }}>
            <label className="nav-header" style={{ display: 'block', marginBottom: 8 }}>To'lov cheki (rasm)</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${receipt ? C.accent : C.border}`,
                borderRadius: 18,
                padding: '20px',
                textAlign: 'center',
                cursor: 'pointer',
                background: receipt ? 'rgba(111,120,240,0.05)' : C.card,
                transition: 'all 0.2s',
              }}
            >
              {receiptPreview ? (
                <img src={receiptPreview} alt="Chek" style={{ maxHeight: 160, borderRadius: 12, margin: '0 auto', display: 'block', objectFit: 'contain' }} />
              ) : (
                <>
                  <svg width="32" height="32" fill="none" viewBox="0 0 24 24" style={{ color: C.muted, margin: '0 auto 8px', display: 'block' }}>
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p style={{ color: C.muted, fontSize: '0.82rem', fontWeight: 600 }}>Chek rasmini tanlang</p>
                  <p className="helper-text" style={{ marginTop: 4 }}>JPG, PNG yoki HEIC</p>
                </>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
            {receipt && (
              <p style={{ color: C.accent, fontSize: '0.72rem', marginTop: 6, fontWeight: 600 }}>✓ {receipt.name}</p>
            )}
          </div>

          {/* Optional comment */}
          <div style={{ marginBottom: 24 }}>
            <label className="nav-header" style={{ display: 'block', marginBottom: 8 }}>Izoh (ixtiyoriy)</label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Qo'shimcha ma'lumot..."
              rows={2}
              className="input-field"
              style={{ resize: 'none', fontSize: '0.88rem' }}
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !receipt || !amount || !!amountError}
            style={{
              width: '100%', background: C.accent, color: '#fff', fontWeight: 800,
              padding: '16px', borderRadius: 16, border: 'none',
              cursor: isSubmitting || !receipt || !amount || !!amountError ? 'not-allowed' : 'pointer',
              opacity: isSubmitting || !receipt || !amount || !!amountError ? 0.5 : 1,
              fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin" width="18" height="18" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10"/>
                </svg>
                Yuklanmoqda...
              </>
            ) : (
              "So'rov yuborish ✓"
            )}
          </button>
        </div>
      </div>
    );
  }

  // ─── STEP: STATUS ────────────────────────────────────────────
  const statusConfig = {
    PENDING: {
      color: '#facc15',
      bg: 'rgba(250,204,21,0.1)',
      border: 'rgba(250,204,21,0.25)',
      label: 'Tekshirilmoqda',
      icon: (
        <svg className="animate-spin" width="32" height="32" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="#facc15" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10"/>
        </svg>
      ),
    },
    APPROVED: {
      color: '#22c55e',
      bg: 'rgba(34,197,94,0.1)',
      border: 'rgba(34,197,94,0.3)',
      label: 'Tasdiqlandi ✓',
      icon: (
        <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
          <path d="M20 6L9 17l-5-5" stroke="#22c55e" strokeWidth="3" strokeLinecap="round"/>
        </svg>
      ),
    },
    REJECTED: {
      color: '#f43f5e',
      bg: 'rgba(244,63,94,0.1)',
      border: 'rgba(244,63,94,0.3)',
      label: 'Rad etildi',
      icon: (
        <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
          <path d="M18 6L6 18M6 6l12 12" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round"/>
        </svg>
      ),
    },
  };
  const status = topupRequest?.status ?? 'PENDING';
  const cfg = statusConfig[status];

  return (
    <div className="page-container" style={{ background: C.bg }}>
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 48 }}>
        {/* Status Icon */}
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: cfg.bg, border: `2px solid ${cfg.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          {cfg.icon}
        </div>

        {/* Status Badge */}
        <span style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, borderRadius: 9999, padding: '6px 18px', fontSize: '0.82rem', fontWeight: 700, marginBottom: 12 }}>
          {cfg.label}
        </span>

        {/* Amount */}
        <h2 style={{ color: C.text, fontWeight: 900, fontSize: '1.8rem', marginBottom: 6 }}>
          {topupRequest ? parseInt(String(topupRequest.amount)).toLocaleString() : ''} UZS
        </h2>

        {/* Message */}
        <p style={{ color: C.muted, textAlign: 'center', fontSize: '0.88rem', maxWidth: 280, lineHeight: 1.6, marginBottom: 32 }}>
          {status === 'PENDING' && "To'lovingiz tekshirilmoqda. Bu odatda bir necha daqiqa ichida tasdiqlanadi. Sahifani yopmasligingiz mumkin."}
          {status === 'APPROVED' && "To'lovingiz tasdiqlandi! Hisobingizga mablag' qo'shildi. Xarid qilishingiz mumkin."}
          {status === 'REJECTED' && "Afsuski, to'lovingiz rad etildi. Admin bilan bog'laning yoki qaytadan urinib ko'ring."}
        </p>

        {/* Details card */}
        <div style={{ width: '100%', background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 22, padding: '18px', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span className="helper-text">So'rov ID:</span>
            <span style={{ color: C.text, fontWeight: 700, fontSize: '0.75rem', fontFamily: 'monospace' }}>{topupRequest?.id?.slice(0, 8).toUpperCase()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span className="helper-text">Usul:</span>
            <span style={{ color: C.text, fontWeight: 700, fontSize: '0.82rem' }}>{PAYMENT_METHODS.find(m => m.id === topupRequest?.method)?.label}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="helper-text">Holat:</span>
            <span style={{ color: cfg.color, fontWeight: 700, fontSize: '0.82rem' }}>{cfg.label}</span>
          </div>
        </div>

        {status === 'PENDING' && (
          <p style={{ color: C.muted, fontSize: '0.72rem', textAlign: 'center' }}>
            Holat avtomatik yangilanadi...
          </p>
        )}

        {status !== 'PENDING' && (
          <button
            onClick={() => { triggerHaptic(); navigate('/'); }}
            style={{ background: C.accent, color: '#fff', fontWeight: 700, padding: '14px 32px', borderRadius: 16, border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
          >
            Bosh sahifaga qaytish
          </button>
        )}
      </div>
    </div>
  );
};

export default BalancePage;

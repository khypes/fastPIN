import React, { useState, useEffect } from 'react';
import { coinDropApi } from '../api';

const C = {
  bg: '#111321',
  card: '#202440',
  border: '#3C4378',
  accent: '#6F78F0',
  text: '#F5F5FF',
  muted: '#9298C2',
  error: '#EF4444',
  success: '#10B981',
};

interface GameOrderFormProps {
  gameKey: string;
  gameName: string;
  gameConfig: {
    id_type: 'numeric' | 'text';
    requires_server: boolean;
    has_validator: boolean;
    amount_based: boolean;
  };
  onOrderCreated: (orderData: any) => void;
}

const GameOrderForm: React.FC<GameOrderFormProps> = ({
  gameKey,
  gameName,
  gameConfig,
  onOrderCreated,
}) => {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [playerId, setPlayerId] = useState('');
  const [serverId, setServerId] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await coinDropApi.getProducts(gameKey);
        setProducts(response.data);
        if (response.data.length > 0) {
          setSelectedProduct(response.data[0]);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError('Mahsulotlarni yuklab bo\'lmadi');
      }
    };

    fetchProducts();
  }, [gameKey]);

  const validatePlayer = async () => {
    if (!playerId) {
      setError('Player ID kiritilishi shart');
      return;
    }

    if (gameConfig.id_type === 'numeric' && !/^\d+$/.test(playerId)) {
      setError('Player ID faqat raqamlardan iborat bo\'lishi kerak');
      return;
    }

    if (gameConfig.requires_server && !serverId) {
      setError('Server tanlanishi shart');
      return;
    }

    setIsValidating(true);
    setError(null);
    setValidationResult(null);

    try {
      const response = await coinDropApi.validatePlayer(
        gameKey,
        playerId,
        gameConfig.requires_server ? serverId : undefined,
      );
      setValidationResult(response.data);
      
      if (!response.data.valid) {
        setError(response.data.message || 'Player ID noto\'g\'ri');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Validatsiya xatosi');
    } finally {
      setIsValidating(false);
    }
  };

  const handleCreateOrder = async () => {
    if (!selectedProduct) {
      setError('Mahsulot tanlanishi shart');
      return;
    }

    if (!playerId) {
      setError('Player ID kiritilishi shart');
      return;
    }

    if (gameConfig.requires_server && !serverId) {
      setError('Server tanlanishi shart');
      return;
    }

    if (gameConfig.has_validator && !validationResult?.valid) {
      setError('Avval player ID\'ni validatsiya qiling');
      return;
    }

    setIsCreatingOrder(true);
    setError(null);

    try {
      const response = await coinDropApi.createOrder({
        gameKey,
        productId: selectedProduct.id,
        amount: selectedProduct.amount,
        playerId,
        serverId: gameConfig.requires_server ? serverId : undefined,
      });
      
      onOrderCreated(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Buyurtma yaratishda xatolik');
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const triggerHaptic = (style: 'light' | 'medium' | 'heavy' = 'light') => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
    }
  };

  return (
    <div className="space-y-4" style={{ padding: '16px' }}>
      {/* Header */}
      <div>
        <h2 style={{ color: C.text, fontWeight: 700, fontSize: '1.1rem', letterSpacing: '0.5px' }}>
          {gameName.toUpperCase()}
        </h2>
        <p style={{ color: C.muted, fontSize: '0.85rem' }}>Buyurtmani rasmiylashtirish</p>
      </div>

      {/* Product Selection */}
      {gameConfig.amount_based && products.length > 0 && (
        <div>
          <label style={{ color: C.muted, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 8 }}>
            MIQDOR
          </label>
          <div className="grid grid-cols-2 gap-2">
            {products.map((product) => (
              <button
                key={product.id}
                onClick={() => {
                  triggerHaptic();
                  setSelectedProduct(product);
                  setQuantity(1);
                }}
                className={`p-3 rounded-xl border transition-all ${
                  selectedProduct?.id === product.id
                    ? 'border-[#6F78F0] bg-[#6F78F0]/10'
                    : 'border-[#3C4378] bg-[#202440]'
                }`}
              >
                <div style={{ color: C.text, fontWeight: 700, fontSize: '0.9rem' }}>
                  {product.amount || product.name}
                </div>
                <div style={{ color: C.muted, fontSize: '0.75rem' }}>
                  {Number(product.retail_uzs).toLocaleString()} UZS
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity Selector */}
      {selectedProduct && (
        <div>
          <label style={{ color: C.muted, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 8 }}>
            SONI
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                triggerHaptic();
                setQuantity(Math.max(1, quantity - 1));
              }}
              disabled={quantity <= 1}
              className="w-10 h-10 rounded-xl bg-[#202440] border border-[#3C4378] flex items-center justify-center text-white font-bold disabled:opacity-50"
            >
              −
            </button>
            <div className="w-16 h-10 rounded-xl bg-[#202440] border border-[#3C4378] flex items-center justify-center text-white font-bold">
              {quantity}
            </div>
            <button
              onClick={() => {
                triggerHaptic();
                setQuantity(quantity + 1);
              }}
              className="w-10 h-10 rounded-xl bg-[#202440] border border-[#3C4378] flex items-center justify-center text-white font-bold"
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* Player ID Input */}
      <div>
        <label style={{ color: C.muted, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 8 }}>
          PLAYER ID
        </label>
        <input
          type={gameConfig.id_type === 'numeric' ? 'number' : 'text'}
          value={playerId}
          onChange={(e) => {
            setPlayerId(e.target.value);
            setValidationResult(null);
            setError(null);
          }}
          placeholder={
            gameConfig.id_type === 'numeric'
              ? '12345678'
              : '@username'
          }
          className="w-full px-4 py-3 rounded-xl bg-[#202440] border border-[#3C4378] text-white placeholder-[#9298C2] focus:outline-none focus:border-[#6F78F0]"
          style={{ fontSize: '0.9rem' }}
        />
      </div>

      {/* Server Selection */}
      {gameConfig.requires_server && (
        <div>
          <label style={{ color: C.muted, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 8 }}>
            SERVER
          </label>
          <input
            type="text"
            value={serverId}
            onChange={(e) => {
              setServerId(e.target.value);
              setValidationResult(null);
              setError(null);
            }}
            placeholder="Server nomi yoki raqami"
            className="w-full px-4 py-3 rounded-xl bg-[#202440] border border-[#3C4378] text-white placeholder-[#9298C2] focus:outline-none focus:border-[#6F78F0]"
            style={{ fontSize: '0.9rem' }}
          />
        </div>
      )}

      {/* Validation Button */}
      {gameConfig.has_validator && (
        <button
          onClick={validatePlayer}
          disabled={isValidating}
          className="w-full py-3 rounded-xl bg-[#202440] border border-[#3C4378] text-white font-bold disabled:opacity-50"
        >
          {isValidating ? 'Tekshirilmoqda...' : 'Player ID\'ni tekshirish'}
        </button>
      )}

      {/* Validation Result */}
      {validationResult && (
        <div
          className={`p-3 rounded-xl ${
            validationResult.valid
              ? 'bg-[#10B981]/10 border border-[#10B981]'
              : 'bg-[#EF4444]/10 border border-[#EF4444]'
          }`}
        >
          <div
            style={{
              color: validationResult.valid ? C.success : C.error,
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            {validationResult.valid
              ? `✓ ${validationResult.player_name || 'Player topildi'}`
              : `✗ ${validationResult.message}`}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]">
          <div style={{ color: C.error, fontSize: '0.85rem' }}>{error}</div>
        </div>
      )}

      {/* Total Price */}
      {selectedProduct && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-[#202440] border border-[#3C4378]">
          <span style={{ color: C.muted, fontSize: '0.9rem' }}>Jami:</span>
          <span style={{ color: C.text, fontSize: '1.1rem', fontWeight: 700 }}>
            {(Number(selectedProduct.retail_uzs) * quantity).toLocaleString()} UZS
          </span>
        </div>
      )}

      {/* Create Order Button */}
      <button
        onClick={handleCreateOrder}
        disabled={isCreatingOrder || (gameConfig.has_validator && !validationResult?.valid)}
        className="w-full py-4 rounded-xl bg-[#6F78F0] text-white font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isCreatingOrder ? 'Yaratilmoqda...' : 'Buyurtma berish'}
      </button>
    </div>
  );
};

export default GameOrderForm;

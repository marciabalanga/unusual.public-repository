import React, { useState } from 'react';
import {
  X,
  Clock,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useStore, sanitizeProductVariants } from '../context/StoreContext';
import { formatAOA } from '../lib/format';
import { Product } from '../types';
import { WULogo } from './wu-logo';

interface PreOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  selectedSize?: string;
  selectedColor?: string;
  onProceedToCheckout: (item: {
    product: Product;
    size: string;
    color: string;
    quantity: number;
    price: number;
  }) => void;
}

const isLightColor = (hex?: string) => {
  if (!hex) return false;
  const cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 160;
  }
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 160;
  }
  return false;
};

export const PreOrderModal: React.FC<PreOrderModalProps> = ({
  isOpen,
  onClose,
  product: rawProduct,
  selectedSize: initialSize,
  selectedColor: initialColor,
  onProceedToCheckout,
}) => {
  const { t, settings, language } = useStore();
  const product = React.useMemo(() => sanitizeProductVariants(rawProduct), [rawProduct]);
  const productName = language === 'en' && product.name_en ? product.name_en : product.name;

  const availableSizes = product.sizes && product.sizes.length > 0
    ? product.sizes
    : [
        { size: 'S' as const, in_stock: true },
        { size: 'M' as const, in_stock: true },
        { size: 'L' as const, in_stock: true },
        { size: 'XL' as const, in_stock: true }
      ];

  const [currentSize, setCurrentSize] = useState<string>(
    initialSize || availableSizes[0]?.size || 'M'
  );
  const [currentColor, setCurrentColor] = useState<string>(() => {
    if (initialColor) {
      const match = product.colors?.find((c) => c.name === initialColor);
      if (match && match.in_stock !== false) return initialColor;
    }
    const firstInStock = product.colors?.find((c) => c.in_stock !== false);
    return firstInStock?.name || product.colors?.[0]?.name || '';
  });
  const [quantity, setQuantity] = useState(1);

  if (!isOpen) return null;

  const preOrderPrice = product.pre_order_price_aoa || product.price_aoa;
  const estimatedDelivery =
    product.pre_order_estimated_delivery ||
    t('preorder_default_estimated_delivery', '15–25 Outubro');

  const customNotice =
    product.pre_order_custom_notice ||
    t(
      'preorder_modal_desc',
      'Limited availability. Secure yours before it’s gone | Disponibilidade limitada. Garante a tua peça antes que desapareça'
    );

  const whatsappContact = settings.whatsapp_number || '+244 937 765 130';

  const handleConfirm = () => {
    const currentColorObj = product.colors?.find((c) => c.name === currentColor);
    if (currentColorObj && currentColorObj.in_stock === false) return;

    onProceedToCheckout({
      product: {
        ...product,
        price_aoa: preOrderPrice,
        enable_pre_order: true,
      },
      size: currentSize,
      color: currentColor,
      quantity,
      price: preOrderPrice,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-[#222222] rounded-xl shadow-2xl p-6 sm:p-8 text-white space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#181818] hover:bg-white hover:text-black text-[#888888] transition-colors"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-3 border-b border-[#1c1c1c] pb-4">
          <WULogo className="h-4 w-auto fill-white shrink-0" />
          <span className="text-[10px] text-[#888888] font-mono uppercase tracking-[0.25em]">
            WEARING UNUSUAL • PRE-ORDER ENGINE
          </span>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono tracking-widest uppercase">
            <Clock className="w-3 h-3" />
            <span>PRE-ORDER RESTOCK</span>
          </div>

          <h2 className="font-display font-bold uppercase text-xl sm:text-2xl text-white tracking-wider leading-tight">
            {productName} {t('preorder_modal_title_suffix', '— PRE-ORDER')}
          </h2>

          <p className="text-xs sm:text-sm text-[#aaaaaa] font-sans leading-relaxed pt-1">
            “{customNotice}”
          </p>
        </div>

        {/* Product Details Pill */}
        <div className="bg-[#121212] border border-[#1f1f1f] rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between text-xs border-b border-[#1a1a1a] pb-2.5">
            <span className="text-[#777777] uppercase tracking-wider">
              {t('preorder_estimated_delivery_label', 'Estimated delivery:')}
            </span>
            <span className="text-white font-mono font-bold tracking-wide">
              {estimatedDelivery}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs border-b border-[#1a1a1a] pb-2.5">
            <span className="text-[#777777] uppercase tracking-wider">
              {t('preorder_price_label', 'Price:')}
            </span>
            <span className="text-white font-sans font-bold text-sm">
              {formatAOA(preOrderPrice)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-[#777777] uppercase tracking-wider">
              {t('preorder_whatsapp_label', 'WhatsApp:')}
            </span>
            <span className="text-white font-mono text-xs">
              {whatsappContact}
            </span>
          </div>
        </div>

        {/* Size Selection */}
        <div className="space-y-2">
          <label className="text-[11px] uppercase tracking-widest text-[#888888] font-semibold block">
            {language === 'en' ? 'SELECT SIZE FOR PRODUCTION:' : 'SELECIONAR TAMANHO PARA PRODUÇÃO:'}
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {availableSizes.map((s) => (
              <button
                key={s.size}
                type="button"
                onClick={() => setCurrentSize(s.size)}
                className={`py-2 text-xs font-mono font-bold uppercase rounded border transition-all ${
                  currentSize === s.size
                    ? 'bg-white text-black border-white shadow-lg'
                    : 'bg-[#141414] text-[#888888] border-[#222222] hover:border-white hover:text-white'
                }`}
              >
                {s.size}
              </button>
            ))}
          </div>
        </div>

        {/* Color Selection if multiple */}
        {product.colors && product.colors.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[11px] uppercase tracking-widest text-[#888888] font-semibold">
                {language === 'en' ? 'SELECTED COLOR:' : 'COR SELECIONADA:'}
              </span>
              <span className="text-white text-xs">{currentColor || product.colors[0]?.name || ''}</span>
            </div>
            <div className="flex items-center gap-3">
              {product.colors.map((c) => {
                const isOutOfStock = c.in_stock === false;
                const isSelected = currentColor === c.name;
                const isLight = isLightColor(c.hex);

                return (
                  <button
                    key={c.name}
                    type="button"
                    disabled={isOutOfStock}
                    onClick={() => !isOutOfStock && setCurrentColor(c.name)}
                    className={`relative w-7 h-7 rounded-full overflow-hidden transition-transform flex items-center justify-center ${
                      isOutOfStock
                        ? 'cursor-not-allowed ring-1 ring-[#333333]'
                        : isSelected
                        ? 'cursor-pointer ring-2 ring-white scale-110 shadow-lg'
                        : 'cursor-pointer ring-1 ring-[#333333] hover:ring-[#777777]'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    aria-label={`${c.name}${isOutOfStock ? (language === 'en' ? ' (Unavailable)' : ' (Indisponível)') : ''}`}
                  >
                    {isOutOfStock ? (
                      <svg
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        viewBox="0 0 28 28"
                        fill="none"
                        aria-hidden="true"
                      >
                        <line
                          x1="4"
                          y1="24"
                          x2="24"
                          y2="4"
                          stroke={isLight ? '#000000' : '#ffffff'}
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    ) : isSelected ? (
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isLight ? 'bg-black' : 'bg-white'
                        }`}
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Production notice */}
        <div className="p-3 bg-white/5 border border-white/10 rounded text-[11px] text-[#999999] leading-relaxed flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-white shrink-0 mt-0.5" />
          <span>
            {t(
              'preorder_disclaimer_notice',
              'A data de entrega exata será escolhida por ti assim que a peça estiver pronta para entrega.'
            )}
          </span>
        </div>

        {/* Confirm Action Button */}
        <button
          type="button"
          onClick={handleConfirm}
          className="w-full py-4 bg-white hover:bg-[#eaeaea] text-black font-sans font-bold text-xs sm:text-sm tracking-[0.25em] uppercase rounded transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          <ShoppingBag className="w-4 h-4 text-black" />
          <span>{t('preorder_confirm_btn', 'CONFIRM PRE-ORDER')}</span>
        </button>
      </div>
    </div>
  );
};

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
import { useStore } from '../context/StoreContext';
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

export const PreOrderModal: React.FC<PreOrderModalProps> = ({
  isOpen,
  onClose,
  product,
  selectedSize: initialSize,
  selectedColor: initialColor,
  onProceedToCheckout,
}) => {
  const { t, settings } = useStore();

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
  const [currentColor, setCurrentColor] = useState<string>(
    initialColor || product.colors[0]?.name || 'Preto'
  );
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
      'This is a pre-order item. Your piece will be produced specifically for this restock.'
    );

  const whatsappContact = settings.whatsapp_number || '+244 937 765 130';

  const handleConfirm = () => {
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
            {product.name} {t('preorder_modal_title_suffix', '— PRE-ORDER')}
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
            SELECIONAR TAMANHO PARA PRODUÇÃO:
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
                COR:
              </span>
              <span className="text-white text-xs">{currentColor}</span>
            </div>
            <div className="flex items-center gap-2.5">
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setCurrentColor(c.name)}
                  className={`px-3 py-1.5 rounded text-xs font-sans uppercase border transition-all flex items-center gap-2 ${
                    currentColor === c.name
                      ? 'bg-white text-black border-white font-bold'
                      : 'bg-[#141414] text-[#888888] border-[#222222] hover:text-white'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/40"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Production notice */}
        <div className="p-3 bg-white/5 border border-white/10 rounded text-[11px] text-[#999999] leading-relaxed flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-white shrink-0 mt-0.5" />
          <span>
            {t(
              'preorder_disclaimer_notice',
              'A sua peça será confeccionada sob encomenda artesanal. A data de entrega exata será escolhida por si assim que a produção for concluída.'
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

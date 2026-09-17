import React from 'react';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag, ShieldCheck, Truck, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatAOA } from '../lib/format';

interface CartDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
  onCheckout?: () => void;
  onProceedToCheckout?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
  onCheckout,
  onProceedToCheckout,
}) => {
  const {
    isCartOpen: contextIsOpen,
    setIsCartOpen,
    cart,
    removeFromCart,
    updateCartQuantity,
    cartSubtotal,
    deliveryFee,
    cartTotal,
    isFreeShipping,
    amountUntilFreeShipping,
    shippingProgressPercentage,
    freeShippingThreshold,
    settings,
    t,
  } = useStore();

  const isOpen = propIsOpen !== undefined ? propIsOpen : contextIsOpen;

  if (!isOpen) return null;

  const handleClose = () => {
    setIsCartOpen(false);
    propOnClose?.();
  };

  const handleProceed = () => {
    handleClose();
    if (typeof onProceedToCheckout === 'function') {
      onProceedToCheckout();
    } else if (typeof onCheckout === 'function') {
      onCheckout();
    }
  };

  return (
    <div
      id="cart-drawer-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end"
      onClick={(e) => {
        if ((e.target as HTMLElement).id === 'cart-drawer-backdrop') {
          handleClose();
        }
      }}
    >
      <div className="w-full max-w-md bg-[#0a0a0a] border-l border-[#1f1f1f] h-full flex flex-col justify-between p-6 sm:p-8 shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Top */}
        <div>
          <div className="flex items-center justify-between pb-6 border-b border-[#1c1c1c]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#888888]" />
              <h3 className="font-display uppercase text-sm tracking-[0.25em] text-white">
                {t('nav_cart', 'SACO DE COMPRAS')} ({cart.length})
              </h3>
            </div>
            <button
              id="close-cart-drawer-btn"
              onClick={handleClose}
              className="p-1 text-[#888888] hover:text-white transition-colors"
              aria-label="Fechar saco"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart items list */}
          <div className="mt-6 max-h-[55vh] overflow-y-auto space-y-4 pr-1">
            {cart.length === 0 ? (
              <div className="py-16 text-center text-[#666666]">
                <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-sans text-sm">O seu saco está vazio.</p>
                <p className="text-xs text-[#555555] mt-1">Explore o Drop Atual para selecionar a sua peça.</p>
              </div>
            ) : (
              cart.map((item, idx) => (
                <div
                  key={`${item.product.id}-${item.size}-${item.color}-${idx}`}
                  className="flex gap-4 p-3 bg-[#111111] border border-[#1c1c1c] rounded"
                >
                  <div className="w-16 h-20 bg-[#1a1a1a] rounded overflow-hidden shrink-0 border border-[#222222] flex items-center justify-center">
                    {item.product.images && item.product.images[0] && item.product.images[0].trim() !== '' ? (
                      <img
                        src={item.product.images[0].trim()}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ShoppingBag className="w-5 h-5 text-[#444444]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-display uppercase text-xs text-white truncate tracking-wider">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.product.id, item.size, item.color)}
                          className="text-[#555555] hover:text-red-400 p-0.5 transition-colors"
                          aria-label="Remover item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3 mt-1 text-[11px] text-[#777777] font-sans">
                        <span>Tam: <strong className="text-[#dddddd]">{item.size}</strong></span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          Cor: <strong className="text-[#dddddd]">{item.color}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#1c1c1c]">
                      <div className="flex items-center border border-[#262626] rounded bg-[#0a0a0a]">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.size, item.color, -1)}
                          className="p-1 text-[#888888] hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs text-white font-sans font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.size, item.color, 1)}
                          className="p-1 text-[#888888] hover:text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-sans text-xs font-semibold text-white">
                        {formatAOA(item.product.price_aoa * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bottom checkout action */}
        {cart.length > 0 && (
          <div className="pt-6 border-t border-[#1c1c1c] space-y-4">
            {/* Free Shipping Dynamic Progress Bar */}
            <div className="p-3.5 bg-[#121212] border border-[#222222] rounded-lg space-y-2.5">
              <div className="flex items-center justify-between text-xs font-sans">
                <div className="flex items-center gap-2">
                  <Truck className={`w-4 h-4 shrink-0 ${isFreeShipping ? 'text-emerald-400' : 'text-[#999999]'}`} />
                  {isFreeShipping ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1.5 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      Parabéns! Você ganhou Entrega Grátis
                    </span>
                  ) : (
                    <span className="text-[#cccccc] text-xs">
                      Adicione mais <strong className="text-white font-bold">{formatAOA(amountUntilFreeShipping)}</strong> para ganhar Entrega Grátis!
                    </span>
                  )}
                </div>
              </div>

              {/* Progress bar line */}
              <div className="w-full bg-[#1e1e1e] h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    isFreeShipping ? 'bg-emerald-400' : 'bg-white'
                  }`}
                  style={{ width: `${shippingProgressPercentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-[#777777] font-sans">
                <span>Entrega Grátis em compras a partir de {formatAOA(freeShippingThreshold)}</span>
                <span className="font-mono font-medium text-white">
                  {isFreeShipping ? '100%' : `${shippingProgressPercentage}%`}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs font-sans">
              <div className="flex items-center justify-between text-[#888888]">
                <span>SUBTOTAL</span>
                <span className="text-white font-semibold font-mono">{formatAOA(cartSubtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-[#888888]">
                <span>TAXA DE ENTREGA (LUANDA)</span>
                {deliveryFee === 0 ? (
                  <span className="text-emerald-400 font-semibold tracking-wider flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" /> GRÁTIS (0 AOA)
                  </span>
                ) : (
                  <span className="text-white font-mono font-medium">{formatAOA(deliveryFee)}</span>
                )}
              </div>
              <div className="flex items-center justify-between text-sm pt-2.5 border-t border-[#1c1c1c] text-white font-semibold">
                <span className="tracking-wider">TOTAL A PAGAR</span>
                <span className="text-base text-white font-mono font-bold">{formatAOA(cartTotal)}</span>
              </div>
            </div>

            {settings.checkout_locked ? (
              <div className="p-3 bg-red-950/40 border border-red-900/60 rounded text-center text-xs text-red-300">
                {settings.checkout_lock_message || 'Checkout temporariamente suspenso para inventário.'}
              </div>
            ) : (
              <button
                id="cart-proceed-checkout-btn"
                onClick={handleProceed}
                className="w-full py-3.5 bg-white hover:bg-[#e6e6e6] text-black font-sans font-semibold text-xs tracking-[0.25em] uppercase rounded transition-all flex items-center justify-center gap-2 group"
              >
                <span>{t('btn_checkout', 'FINALIZAR COMPRA')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            )}

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#666666] tracking-wider uppercase font-sans">
              <ShieldCheck className="w-3.5 h-3.5 text-[#888888]" />
              <span>PAGAMENTO SEGURO VIA MULTICAIXA EXPRESS</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

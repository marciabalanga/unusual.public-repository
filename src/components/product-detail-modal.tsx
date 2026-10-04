import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Check,
  ShieldCheck,
  Truck,
  ShoppingBag,
  Ruler,
  Heart,
  X,
  Clock,
  BellRing,
  Lock,
} from 'lucide-react';
import { useStore, sanitizeProductVariants } from '../context/StoreContext';
import { formatAOA, isComingBackSoonBadge, getProductBadgeDisplay, getProductReturnDateDisplay } from '../lib/format';
import { Product } from '../types';
import { scrollToTop } from '../lib/scroll';
import { PreOrderModal } from './pre-order-modal';
import { RestockRequestModal } from './restock-request-modal';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onOpenPreOrderCheckout?: (item: {
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

export const ProductDetailView: React.FC<ProductDetailProps> = ({
  product: rawProduct,
  onBack,
  onOpenPreOrderCheckout,
}) => {
  const { addToCart, toggleWishlist, isInWishlist, t, settings, language, setIsCartOpen, isPreviewMode } = useStore();
  const product = React.useMemo(() => sanitizeProductVariants(rawProduct), [rawProduct]);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const [showPreOrderModal, setShowPreOrderModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);

  const validImages = (product.images || []).filter(
    (img): img is string => typeof img === 'string' && img.trim() !== ''
  );

  // All available product photos including direct color linked images
  const allAvailableImages = React.useMemo(() => {
    const list = [...validImages];
    product.colors.forEach((c) => {
      if (c.image_url && c.image_url.trim() !== '' && !list.includes(c.image_url.trim())) {
        list.push(c.image_url.trim());
      }
    });
    return list;
  }, [validImages, product.colors]);

  const [activeColorImage, setActiveColorImage] = useState<string | null>(() => {
    const firstColor = product.colors[0];
    if (firstColor?.image_url && firstColor.image_url.trim() !== '') {
      return firstColor.image_url.trim();
    }
    return validImages[0] || null;
  });

  const isTimeCapsuleProduct =
    product.lifecycle === 'time_capsule' ||
    (product.category && (product.category.toLowerCase().includes('capsul') || product.category.toLowerCase().includes('cápsul')));

  const isSoldOut =
    product.badge?.toUpperCase() === 'ESGOTADO' ||
    product.lifecycle === 'time_capsule' ||
    !product.sizes ||
    product.sizes.length === 0 ||
    product.sizes.every((s) => !s.in_stock);

  const [selectedSize, setSelectedSize] = useState<string>(() => {
    if (isSoldOut) return '';
    const firstInStock = product.sizes.find((s) => s.in_stock);
    return firstInStock ? firstInStock.size : '';
  });
  const [selectedColor, setSelectedColor] = useState<string>(() => {
    const firstInStock = !isSoldOut ? product.colors.find((c) => c.in_stock !== false) : null;
    return firstInStock ? firstInStock.name : (product.colors[0]?.name || '');
  });
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [showSizeGuideModal, setShowSizeGuideModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Item adicionado aos favoritos');
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sincroniza estado quando o produto mudar e posiciona a visualização no topo absoluto
  useEffect(() => {
    scrollToTop(true);
    const availableColor = (!isSoldOut ? product.colors.find((c) => c.in_stock !== false) : null) || product.colors[0];
    if (availableColor?.image_url && availableColor.image_url.trim() !== '') {
      setActiveColorImage(availableColor.image_url.trim());
    } else if (validImages[0]) {
      setActiveColorImage(validImages[0]);
    } else {
      setActiveColorImage(null);
    }
    setSelectedImageIndex(0);
    setSelectedColor(availableColor?.name || product.colors[0]?.name || '');
  }, [product.id, product.slug, isSoldOut]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  // Vínculo bidirecional: Clique na cor ativa e troca a fotografia correspondente imediatamente
  const handleColorSelect = (colorName: string) => {
    const colorObj = product.colors.find((c) => c.name === colorName);
    if (!colorObj || colorObj.in_stock === false || isSoldOut) {
      return; // Impedir seleção dessa cor sem stock
    }
    setSelectedColor(colorName);
    if (colorObj?.image_url && colorObj.image_url.trim() !== '') {
      const targetUrl = colorObj.image_url.trim();
      setActiveColorImage(targetUrl);
      const matchedIdx = allAvailableImages.findIndex((img) => img === targetUrl);
      if (matchedIdx !== -1) {
        setSelectedImageIndex(matchedIdx);
      }
    } else {
      // Se a cor não tiver foto exclusiva, tenta o índice posicional na galeria ou a foto principal
      const colorIdx = product.colors.findIndex((c) => c.name === colorName);
      if (colorIdx >= 0 && validImages[colorIdx]) {
        setActiveColorImage(validImages[colorIdx]);
        setSelectedImageIndex(colorIdx);
      } else if (validImages[0]) {
        setActiveColorImage(validImages[0]);
        setSelectedImageIndex(0);
      }
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    const willBeFavorite = !isInWishlist(product.id);
    toggleWishlist(product.id);
    setToastMessage(willBeFavorite ? 'Item adicionado aos favoritos' : 'Item removido dos favoritos');
    setShowToast(true);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setShowToast(false), 2500);
  };

  const handleAddToCart = () => {
    if (isSoldOut) return;
    const currentSizeObj = product.sizes.find((s) => s.size === selectedSize);
    if (currentSizeObj && !currentSizeObj.in_stock) return;

    const currentColorObj = product.colors.find((c) => c.name === selectedColor);
    if (!currentColorObj || currentColorObj.in_stock === false) {
      return; // Impedir que essa variante seja adicionada ao carrinho
    }

    addToCart(product, selectedSize, selectedColor, quantity);
    setIsAdded(true);
    setIsCartOpen(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const mainImage = activeColorImage || allAvailableImages[selectedImageIndex] || allAvailableImages[0] || null;

  const currentSizeGuideText =
    product.fit_guide ||
    product.size_guide ||
    'O modelo tem 1,85m e veste L. Modelagem boxy com ombros descaídos e corte reto no tórax. Para caimento habitual relaxado, escolha o seu tamanho padrão.';

  return (
    <div id="product-detail-top" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back Button */}
      <button
        onClick={() => {
          scrollToTop(true);
          try {
            const backUrl = isPreviewMode ? '/preview' : '/';
            window.history.pushState(null, '', backUrl);
          } catch {}
          onBack();
        }}
        className="inline-flex items-center gap-2 text-xs font-sans uppercase tracking-[0.25em] text-[#888888] hover:text-white transition-colors mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>
          {product.lifecycle === 'time_capsule' ? 'VOLTAR À CÁPSULA DO TEMPO' : 'VOLTAR AO CATÁLOGO'}
        </span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        {/* Left Column: Gallery (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Photo */}
          <div className="relative aspect-[4/5] w-full bg-[#121212] border border-[#222222] rounded overflow-hidden flex items-center justify-center group">
            {mainImage ? (
              <img
                key={mainImage}
                src={mainImage}
                alt={`${product.name} - ${selectedColor}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 animate-in fade-in"
              />
            ) : (
              <ShoppingBag className="w-16 h-16 text-[#333333]" />
            )}
            {(() => {
              const effectiveBadge = isSoldOut && product.lifecycle !== 'time_capsule' ? 'ESGOTADO' : product.badge;
              const badgeText = getProductBadgeDisplay(effectiveBadge, language);
              if (!badgeText) return null;
              const returnDate = getProductReturnDateDisplay(product);

              return (
                <span
                  className={`absolute top-4 left-4 text-[10px] font-sans font-bold tracking-[0.25em] px-2.5 py-1 rounded uppercase z-10 shadow-xl ${
                    effectiveBadge?.toUpperCase() === 'ESGOTADO'
                      ? 'bg-red-950 text-red-300 border border-red-800'
                      : effectiveBadge?.toUpperCase() === 'AGUARDANDO VAGA'
                      ? 'bg-black/85 text-amber-300 border border-amber-500/40 backdrop-blur-sm'
                      : 'bg-white text-black'
                  }`}
                >
                  {returnDate ? `${badgeText} • ${returnDate}` : badgeText}
                </span>
              );
            })()}

            {/* BOTÃO DE FAVORITOS (HEART ICON EM DESTAQUE NÍTIDO & VIDRO FOSCO) */}
            <button
              type="button"
              onClick={handleToggleFavorite}
              aria-label={isInWishlist(product.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              title={isInWishlist(product.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              className="absolute top-4 right-4 z-20 w-12 h-12 rounded-full bg-black/50 hover:bg-black/75 backdrop-blur-md border border-white/30 hover:border-white/60 flex items-center justify-center transition-all duration-200 shadow-2xl active:scale-95 group/fav"
            >
              <Heart
                strokeWidth={2.4}
                className={`w-6 h-6 transition-all duration-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${
                  isInWishlist(product.id)
                    ? 'fill-red-500 text-red-500 scale-110'
                    : 'text-white fill-white/10 group-hover/fav:text-red-400 group-hover/fav:fill-red-500/20 group-hover/fav:scale-110'
                }`}
              />
            </button>
          </div>

          {/* Thumbnails */}
          {allAvailableImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {allAvailableImages.map((img, idx) => {
                const isActive = mainImage === img;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setActiveColorImage(img);
                      setSelectedImageIndex(idx);
                      const matchedColor = product.colors.find(
                        (c) => c.image_url && c.image_url.trim() === img
                      );
                      if (matchedColor) {
                        setSelectedColor(matchedColor.name);
                      }
                    }}
                    className={`relative w-20 h-24 rounded overflow-hidden border shrink-0 transition-all ${
                      isActive
                        ? 'border-white ring-2 ring-white opacity-100'
                        : 'border-[#222222] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Product Info & Actions (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Category & Title */}
          <div>
            <span className="text-[10px] text-[#777777] font-sans tracking-[0.3em] uppercase block mb-1">
              {product.category} • {product.lifecycle === 'time_capsule' ? 'ARQUIVO CÁPSULA' : 'DROP ATUAL'}
            </span>
            <h1 className="font-display uppercase text-2xl sm:text-4xl text-white tracking-[0.15em] leading-tight">
              {product.name}
            </h1>
            <p className="font-sans text-xl sm:text-2xl font-semibold text-white tracking-wider mt-3">
              {formatAOA(product.price_aoa)}
            </p>
          </div>

          {/* Description */}
          <div className="border-t border-b border-[#1c1c1c] py-4">
            <p className="font-sans text-xs sm:text-sm text-[#a0a0a0] leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Color Selection - VÍNCULO DIRETO COM A FOTOGRAFIA CORRESPONDENTE */}
          {product.colors.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-sans">
                <span className="text-[#888888] uppercase tracking-wider">COR SELECIONADA:</span>
                <span className="text-white font-medium">{selectedColor || product.colors[0]?.name || ''}</span>
              </div>
              <div className="flex items-center gap-3">
                {product.colors.map((c) => {
                  const isOutOfStock = c.in_stock === false || isSoldOut;
                  const isSelected = selectedColor === c.name;
                  const isLight = isLightColor(c.hex);

                  return (
                    <button
                      key={c.name}
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => !isOutOfStock && handleColorSelect(c.name)}
                      className={`relative w-7 h-7 rounded-full overflow-hidden transition-transform flex items-center justify-center ${
                        isOutOfStock
                          ? 'cursor-not-allowed ring-1 ring-[#333333]'
                          : isSelected
                          ? 'cursor-pointer ring-2 ring-white scale-110 shadow-lg'
                          : 'cursor-pointer ring-1 ring-[#333333] hover:ring-[#777777]'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      aria-label={`${c.name}${isOutOfStock ? ' (Indisponível)' : ''}`}
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
                        <Check
                          className={`w-3 h-3 ${
                            isLight ? 'text-black' : 'text-white'
                          }`}
                        />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Selection */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-sans">
              <span className="text-[#888888] uppercase tracking-wider">TAMANHO DISPONÍVEL:</span>
              <button
                type="button"
                onClick={() => setShowSizeGuideModal(true)}
                className="text-[11px] text-[#aaaaaa] hover:text-white underline underline-offset-4 transition-colors flex items-center gap-1.5 font-medium"
              >
                <Ruler className="w-3.5 h-3.5 text-white" />
                <span>GUIA DE MEDIDAS</span>
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {product.sizes.map((s) => {
                const isSizeDisabled = !s.in_stock || isSoldOut;
                return (
                  <button
                    key={s.size}
                    type="button"
                    disabled={isSizeDisabled}
                    onClick={() => {
                      if (!isSizeDisabled) setSelectedSize(s.size);
                    }}
                    title={
                      isSoldOut
                        ? 'Peça esgotada'
                        : !s.in_stock
                        ? `Tamanho ${s.size} esgotado`
                        : `Tamanho ${s.size}`
                    }
                    className={`py-2.5 text-xs font-sans uppercase rounded border transition-all ${
                      selectedSize === s.size && !isSoldOut
                        ? 'bg-white text-black border-white font-bold cursor-pointer'
                        : isSizeDisabled
                        ? 'bg-[#0b0b0b] text-[#3e3e3e] border-[#181818] line-through cursor-not-allowed opacity-50 select-none pointer-events-none'
                        : 'bg-[#121212] text-[#cccccc] border-[#262626] hover:border-white cursor-pointer font-medium'
                    }`}
                  >
                    {s.size}
                  </button>
                );
              })}
            </div>

            {/* Inline Quick Caimento Callout */}
            <div className="p-3 bg-[#111111] border border-[#222222] rounded text-xs text-[#999999] font-sans leading-relaxed mt-2">
              <div className="flex items-center justify-between mb-1">
                <strong className="text-white block uppercase tracking-wider text-[11px]">
                  Guia de Caimento da Peça:
                </strong>
                <button
                  type="button"
                  onClick={() => setShowSizeGuideModal(true)}
                  className="text-[10px] text-white hover:underline uppercase tracking-wider font-mono"
                >
                  Ver Tabela
                </button>
              </div>
              <p className="text-[#a0a0a0] leading-relaxed text-[11px]">
                {currentSizeGuideText}
              </p>
            </div>
          </div>

          {/* Add to Cart Button or Pre-Order / Restock Buttons */}
          <div className="space-y-4 pt-2">
            {/* Indicator: ONLY displayed when badge is AGUARDANDO VAGA */}
            {isComingBackSoonBadge(product.badge) && (
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span className="font-bold uppercase tracking-wider">
                  {language === 'en' ? 'COMING BACK SOON' : 'AGUARDANDO VAGA'}
                </span>
                {product.return_date && product.return_date.trim() !== '' && (
                  <span className="text-[#cccccc] text-[11px] font-sans ml-auto">
                    {product.return_date.trim()}
                  </span>
                )}
              </div>
            )}

            {/* REQUEST RESTOCK: Bloco e botão 100% independente (Apenas exibido se enable_request_restock === true) */}
            {Boolean(product.enable_request_restock) && settings.enable_request_restock_button !== false && (
              <div className="p-4 bg-[#111111] border border-[#262626] rounded-lg text-center space-y-2">
                <span className="text-[10px] text-amber-400 font-mono tracking-widest uppercase block">
                  {language === 'en'
                    ? settings.restock_badge_text_en || 'INTEREST SURVEY'
                    : settings.restock_badge_text_pt || 'AVALIAÇÃO DE INTERESSE'}
                </span>
                <p className="text-xs font-display uppercase tracking-wider text-white">
                  {language === 'en'
                    ? settings.restock_title_en || 'WOULD YOU LIKE THIS COLLECTION TO RETURN?'
                    : settings.restock_title_pt || 'GOSTARIAS QUE ESTA COLEÇÃO VOLTASSE?'}
                </p>
                <p className="text-[11px] text-[#888888] font-sans">
                  {language === 'en'
                    ? settings.restock_description_en || 'Let us know. Your interest helps us decide which pieces may return.'
                    : settings.restock_description_pt || 'Deixa-nos saber. O teu interesse ajuda-nos a decidir quais peças podem voltar.'}
                </p>
                <button
                  type="button"
                  onClick={() => setShowRestockModal(true)}
                  className="w-full py-3 bg-[#181818] hover:bg-white text-white hover:text-black border border-[#333333] hover:border-white font-sans font-bold text-xs tracking-[0.25em] uppercase rounded transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95"
                >
                  <BellRing className="w-4 h-4 text-amber-400" />
                  <span>
                    {language === 'en'
                      ? settings.request_restock_button_text_en || 'REQUEST RESTOCK'
                      : settings.request_restock_button_text_pt || 'REQUEST RESTOCK'}
                  </span>
                </button>
              </div>
            )}

            {/* 1. PRE-ORDER: Permitido EXCLUSIVAMENTE para produtos com badge NOVO e enable_pre_order ativo */}
            {product.badge?.toUpperCase() === 'NOVO' && product.enable_pre_order && settings.enable_pre_order_button !== false ? (
              <div className="space-y-2.5">
                {settings.checkout_locked ? (
                  <div className="p-3.5 bg-red-950/60 border border-red-800 rounded-lg text-center text-xs text-red-200 flex items-center justify-center gap-2 font-sans">
                    <Lock className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>{settings.checkout_lock_message || 'Checkout temporariamente suspenso para inventário.'}</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowPreOrderModal(true)}
                    className="w-full py-4 bg-white hover:bg-[#eaeaea] text-black font-sans font-bold text-xs tracking-[0.25em] uppercase rounded transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Clock className="w-4 h-4 text-black" />
                    <span>
                      {language === 'en'
                        ? settings.pre_order_button_text_en || t('preorder_btn_action', 'PRE-ORDER')
                        : settings.pre_order_button_text_pt || t('preorder_btn_action', 'PRE-ORDER')}
                    </span>
                  </button>
                )}
                {product.pre_order_estimated_delivery && (
                  <p className="text-[11px] text-center text-amber-300 font-mono tracking-wider">
                    Previsão de Entrega: {product.pre_order_estimated_delivery}
                  </p>
                )}
              </div>
            ) : product.badge?.toUpperCase() === 'ESGOTADO' ? (
              /* ESGOTADO: Permanece estritamente ESGOTADO */
              <div className="space-y-2.5">
                <button
                  disabled
                  className="w-full py-3.5 bg-[#141414] border border-red-900/60 text-red-300 font-sans font-semibold text-xs tracking-[0.25em] uppercase rounded cursor-not-allowed"
                >
                  {t('badge_sold_out', 'SOLD OUT')} • ESGOTADO
                </button>
              </div>
            ) : isComingBackSoonBadge(product.badge) ? (
              /* AGUARDANDO VAGA: Exibe status com data se definida */
              <div className="space-y-2.5">
                <button
                  disabled
                  className="w-full py-3.5 bg-[#141414] border border-amber-500/40 text-amber-300 font-mono font-semibold text-xs tracking-[0.2em] uppercase rounded cursor-not-allowed"
                >
                  {language === 'en' ? 'COMING BACK SOON' : 'AGUARDANDO VAGA'}
                  {product.return_date && product.return_date.trim() !== '' ? ` • ${product.return_date.trim()}` : ''}
                </button>
              </div>
            ) : isSoldOut ? (
              /* Sem Stock de tamanhos */
              <div className="space-y-2.5">
                <button
                  disabled
                  className="w-full py-3.5 bg-[#141414] border border-[#262626] text-[#666666] font-sans font-semibold text-xs tracking-[0.25em] uppercase rounded cursor-not-allowed"
                >
                  {t('badge_sold_out', 'SOLD OUT')} • SEM STOCK
                </button>
              </div>
            ) : settings.checkout_locked ? (
              /* Checkout Bloqueado */
              <div className="p-4 bg-red-950/60 border border-red-800 rounded-lg text-center text-xs text-red-200 flex items-center justify-center gap-2 font-sans">
                <Lock className="w-4 h-4 text-red-400 shrink-0" />
                <span>{settings.checkout_lock_message || 'Checkout temporariamente suspenso para contagem de stock.'}</span>
              </div>
            ) : (
              /* Compra normal no Drop */
              <button
                onClick={handleAddToCart}
                className="w-full py-4 bg-white hover:bg-[#eaeaea] text-black font-sans font-bold text-xs tracking-[0.25em] uppercase rounded transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4 text-black" />
                    <span>ADICIONADO AO SACO!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-black" />
                    <span>{t('btn_add_cart', 'ADICIONAR AO SACO')}</span>
                  </>
                )}
              </button>
            )}

            <p className="text-[10px] text-center text-[#666666] tracking-wider uppercase font-sans">
              PAGAMENTO POR TRANSFERÊNCIA / MULTICAIXA EXPRESS NO CHECKOUT
            </p>
          </div>

          {/* Technical Details Accordion */}
          <div className="border-t border-[#1c1c1c] pt-5 space-y-3 text-xs font-sans">
            <h4 className="font-display uppercase text-xs tracking-[0.2em] text-white">
              ESPECIFICAÇÕES TÉCNICAS & TECIDO
            </h4>
            <p className="text-[#888888] leading-relaxed">
              {product.details}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#181818] text-[#777777] text-[11px]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#aaaaaa]" />
                <span>Algodão Pesado 100%</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#aaaaaa]" />
                <span>Entrega Rápida em Luanda</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL GUIA DE MEDIDAS & CAIMENTO PERSONALIZADO */}
      {showSizeGuideModal && (
        <div
          id="size-guide-backdrop"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={(e) => {
            if ((e.target as HTMLElement).id === 'size-guide-backdrop') {
              setShowSizeGuideModal(false);
            }
          }}
        >
          <div className="w-full max-w-lg bg-[#0c0c0c] border border-[#262626] rounded-xl p-5 sm:p-8 space-y-6 shadow-2xl my-auto overflow-y-auto max-h-[90vh] overscroll-contain">
            <div className="flex items-center justify-between pb-3 border-b border-[#1c1c1c]">
              <div>
                <span className="text-[10px] text-[#888888] uppercase tracking-[0.25em] font-sans block">
                  WEARING UNUSUAL • FIT & SIZING
                </span>
                <h3 className="font-display uppercase text-lg sm:text-xl text-white tracking-wider mt-0.5">
                  GUIA DE CAIMENTO & MEDIDAS
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSizeGuideModal(false)}
                className="p-1.5 text-[#777777] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Custom fit guide from product */}
            <div className="p-4 bg-[#141414] border border-[#222222] rounded-lg space-y-2">
              <span className="text-[10px] text-[#888888] uppercase tracking-wider font-semibold block font-sans">
                GUIA DE CAIMENTO E MEDIDAS DA PEÇA:
              </span>
              <p className="text-white text-xs sm:text-sm font-sans leading-relaxed">
                {currentSizeGuideText}
              </p>
            </div>

            {/* Dimensions Table */}
            <div className="space-y-2">
              <span className="text-[10px] text-[#666666] uppercase tracking-wider block font-sans">
                TABELA DE MEDIDAS APROXIMADAS (CM):
              </span>
              <div className="overflow-x-auto border border-[#222222] rounded">
                <table className="w-full text-left font-sans text-xs">
                  <thead className="bg-[#141414] text-[#888888] uppercase text-[10px] border-b border-[#222222]">
                    <tr>
                      <th className="py-2.5 px-3">Tamanho</th>
                      <th className="py-2.5 px-3">Peito (cm)</th>
                      <th className="py-2.5 px-3">Comprimento (cm)</th>
                      <th className="py-2.5 px-3">Ombro (cm)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1a1a1a] text-[#cccccc]">
                    <tr>
                      <td className="py-2 px-3 font-bold text-white">S</td>
                      <td className="py-2 px-3">54</td>
                      <td className="py-2 px-3">71</td>
                      <td className="py-2 px-3">52</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-white">M</td>
                      <td className="py-2 px-3">57</td>
                      <td className="py-2 px-3">73</td>
                      <td className="py-2 px-3">54</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-white">L</td>
                      <td className="py-2 px-3">60</td>
                      <td className="py-2 px-3">75</td>
                      <td className="py-2 px-3">56</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-white">XL</td>
                      <td className="py-2 px-3">63</td>
                      <td className="py-2 px-3">77</td>
                      <td className="py-2 px-3">58</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-white">XXL</td>
                      <td className="py-2 px-3">66</td>
                      <td className="py-2 px-3">79</td>
                      <td className="py-2 px-3">60</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowSizeGuideModal(false)}
              className="w-full py-3 bg-white hover:bg-neutral-200 text-black font-sans font-bold text-xs uppercase tracking-wider rounded transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* NOTIFICAÇÃO TOAST DISCRETA COM BORDAS ROUNDED-FULL */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 bg-neutral-900/95 text-white text-xs font-sans font-medium tracking-wide rounded-full border border-white/20 shadow-2xl backdrop-blur-md flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Heart className="w-4 h-4 fill-red-500 text-red-500 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* PRE-ORDER MODAL */}
      <PreOrderModal
        isOpen={showPreOrderModal}
        onClose={() => setShowPreOrderModal(false)}
        product={product}
        selectedSize={selectedSize}
        selectedColor={selectedColor}
        onProceedToCheckout={(item) => {
          setShowPreOrderModal(false);
          if (onOpenPreOrderCheckout) {
            onOpenPreOrderCheckout(item);
          } else {
            addToCart(item.product, item.size, item.color, item.quantity);
          }
        }}
      />

      {/* RESTOCK REQUEST MODAL (CÁPSULA DO TEMPO) */}
      <RestockRequestModal
        isOpen={showRestockModal}
        onClose={() => setShowRestockModal(false)}
        product={product}
      />
    </div>
  );
};

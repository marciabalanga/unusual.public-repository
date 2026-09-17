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
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatAOA } from '../lib/format';
import { Product } from '../types';
import { scrollToTop } from '../lib/scroll';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
}

export const ProductDetailView: React.FC<ProductDetailProps> = ({ product, onBack }) => {
  const { addToCart, toggleWishlist, isInWishlist, t } = useStore();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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

  const [selectedSize, setSelectedSize] = useState<string>(() => {
    const firstInStock = product.sizes.find((s) => s.in_stock);
    return firstInStock ? firstInStock.size : product.sizes[0]?.size || 'M';
  });
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0]?.name || 'Carbon Black');
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [showSizeGuideModal, setShowSizeGuideModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Item adicionado aos favoritos');
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sincroniza estado quando o produto mudar e posiciona a visualização no topo absoluto
  useEffect(() => {
    scrollToTop(true);
    const firstColor = product.colors[0];
    if (firstColor?.image_url && firstColor.image_url.trim() !== '') {
      setActiveColorImage(firstColor.image_url.trim());
    } else if (validImages[0]) {
      setActiveColorImage(validImages[0]);
    } else {
      setActiveColorImage(null);
    }
    setSelectedImageIndex(0);
    setSelectedColor(product.colors[0]?.name || 'Carbon Black');
  }, [product.id, product.slug]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  // Vínculo bidirecional: Clique na cor ativa e troca a fotografia correspondente imediatamente
  const handleColorSelect = (colorName: string) => {
    setSelectedColor(colorName);
    const colorObj = product.colors.find((c) => c.name === colorName);

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
    addToCart(product, selectedSize, selectedColor, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const isSoldOut = product.badge === 'ESGOTADO' || product.lifecycle === 'time_capsule';

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
            {product.badge && (
              <span
                className={`absolute top-4 left-4 text-[10px] font-sans font-bold tracking-[0.25em] px-2.5 py-1 rounded uppercase z-10 ${
                  product.badge === 'ESGOTADO'
                    ? 'bg-red-950 text-red-300 border border-red-800'
                    : 'bg-white text-black'
                }`}
              >
                {product.badge}
              </span>
            )}

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
                <span className="text-white font-medium">{selectedColor}</span>
              </div>
              <div className="flex items-center gap-3">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => handleColorSelect(c.name)}
                    className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center cursor-pointer ${
                      selectedColor === c.name ? 'ring-2 ring-white scale-110 shadow-lg' : 'ring-1 ring-[#333333] hover:ring-[#777777]'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={`${c.name} (Clique para ver a foto correspondente)`}
                    aria-label={c.name}
                  >
                    {selectedColor === c.name && (
                      <Check
                        className={`w-3 h-3 ${
                          c.hex.toLowerCase() === '#ffffff' || c.hex.toLowerCase() === '#e3dfd8'
                            ? 'text-black'
                            : 'text-white'
                        }`}
                      />
                    )}
                  </button>
                ))}
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
              {product.sizes.map((s) => (
                <button
                  key={s.size}
                  disabled={!s.in_stock || isSoldOut}
                  onClick={() => setSelectedSize(s.size)}
                  className={`py-2.5 text-xs font-sans font-medium uppercase rounded border transition-all ${
                    selectedSize === s.size
                      ? 'bg-white text-black border-white font-bold'
                      : s.in_stock
                      ? 'bg-[#121212] text-[#cccccc] border-[#262626] hover:border-white'
                      : 'bg-[#0e0e0e] text-[#444444] border-[#1a1a1a] line-through cursor-not-allowed'
                  }`}
                >
                  {s.size}
                </button>
              ))}
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

          {/* Add to Cart Button */}
          <div className="space-y-3 pt-2">
            {isSoldOut ? (
              <button
                disabled
                className="w-full py-4 bg-[#141414] border border-[#262626] text-[#666666] font-sans font-semibold text-xs tracking-[0.25em] uppercase rounded cursor-not-allowed"
              >
                PEÇA ESGOTADA • ARQUIVADA NA CÁPSULA
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                className="w-full py-4 bg-white hover:bg-[#eaeaea] text-black font-sans font-bold text-xs tracking-[0.25em] uppercase rounded transition-all flex items-center justify-center gap-2"
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
    </div>
  );
};
